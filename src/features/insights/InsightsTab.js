const { useState } = React;

export function InsightsTab({ insights, posts, onAddInsight, onDeleteInsight, showToast }) {
  const [selPost,  setSelPost]  = useState("");
  const [metrics,  setMetrics]  = useState({ impressions: "", likes: "", comments: "" });
  const [improved, setImproved] = useState("");
  const [loading,  setLoading]  = useState(false);

  // Calcul automatique du taux d'engagement
  const engagementRate = metrics.impressions
    ? (((+metrics.likes || 0) + (+metrics.comments || 0)) / +metrics.impressions * 100).toFixed(1)
    : null;

  // Moyennes historiques
  const avgImpressions = insights.length
    ? Math.round(insights.reduce((s, i) => s + (+i.impressions || 0), 0) / insights.length)
    : null;
  const avgEngagement = insights.length
    ? (insights.reduce((s, i) => {
        const eng = i.impressions ? ((+i.likes || 0) + (+i.comments || 0)) / +i.impressions * 100 : 0;
        return s + eng;
      }, 0) / insights.length).toFixed(1)
    : null;

  async function handleAnalyze() {
    if (!selPost.trim()) return;
    setLoading(true);
    try {
      const hist = insights.slice(0, 3)
        .map(i => `impressions:${i.impressions} likes:${i.likes} comments:${i.comments}`)
        .join(" | ");
      const txt = await callClaude(
        `Post :\n${selPost}\nPerf : impressions=${metrics.impressions}, likes=${metrics.likes}, commentaires=${metrics.comments}${hist ? "\nHistorique : " + hist : ""}\n\nAnalyse les performances et génère une version améliorée.`,
        LINKEDIN_RULES
      );
      setImproved(txt);
      onAddInsight({
        postSnippet:  selPost.slice(0, 200),
        impressions:  metrics.impressions,
        likes:        metrics.likes,
        comments:     metrics.comments,
      });
      showToast("✓ Analyse enregistrée");
    } catch (e) { showToast("⚠️ " + e.message); }
    setLoading(false);
  }

  const S = {
    wrap: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      height: "calc(100vh - 56px)",
    },
    left: {
      padding: "1.5rem",
      background: "#fff",
      borderRight: `0.5px solid ${C.gray200}`,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },
    right: {
      padding: "1.5rem",
      background: C.gray50,
      overflowY: "auto",
    },
    stepHeader: {
      padding: "8px 12px",
      background: C.gray50,
      borderBottom: `0.5px solid ${C.gray200}`,
      display: "flex", alignItems: "center", gap: 8,
    },
    stepNum: {
      width: 18, height: 18, borderRadius: "50%",
      background: C.navy, color: "#fff",
      fontSize: 9, fontWeight: 500,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    },
    metricInput: {
      width: "100%", padding: "8px 10px",
      borderRadius: 8, border: `0.5px solid ${C.gray200}`,
      fontSize: 13, outline: "none",
      fontFamily: "inherit", background: C.gray50,
    },
    kpiCard: {
      flex: 1, background: "#fff",
      borderRadius: 8, padding: 10, textAlign: "center",
    },
    insightCard: {
      background: "#fff",
      border: `0.5px solid ${C.gray200}`,
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 8,
    },
  };

  return (
    <div style={S.wrap}>

      {/* ── Colonne gauche ── */}
      <div style={S.left}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 500, color: C.gray900, marginBottom: 4 }}>
            Insights J+7
          </p>
          <p style={{ fontSize: 12, color: C.gray400, lineHeight: 1.5 }}>
            {insights.length > 0
              ? `L'IA tient compte de vos ${insights.length} analyse(s) précédente(s).`
              : "Renseignez les performances d'un post publié pour obtenir une version améliorée."
            }
          </p>
        </div>

        {/* Étape 1 — Choisir le post */}
        <div style={{ border: `0.5px solid ${C.gray200}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={S.stepHeader}>
            <div style={S.stepNum}>1</div>
            <span style={{ fontSize: 11, fontWeight: 500, color: C.gray900 }}>Choisir le post</span>
          </div>

          {/* Post sélectionné ou picker */}
          {selPost
            ? <div style={{ padding: "10px 12px", background: C.navyLight, borderLeft: `3px solid ${C.navy}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: C.navy, lineHeight: 1.5, flex: 1 }}>
                    {selPost.slice(0, 120)}{selPost.length > 120 ? "…" : ""}
                  </p>
                  <button
                    onClick={() => { setSelPost(""); setImproved(""); }}
                    style={{ fontSize: 11, color: C.navy, background: "none", border: "none", cursor: "pointer", fontWeight: 500, flexShrink: 0, marginLeft: 8, fontFamily: "inherit" }}
                  >
                    Changer →
                  </button>
                </div>
              </div>
            : <div style={{ padding: "10px 12px" }}>
                {posts.length > 0 && (
                  <select
                    value=""
                    onChange={e => setSelPost(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `0.5px solid ${C.gray200}`, fontSize: 12, marginBottom: 8, background: C.gray50, outline: "none", color: C.gray900, fontFamily: "inherit" }}
                  >
                    <option value="">Choisir un post sauvegardé…</option>
                    {posts.map(p => (
                      <option key={p.id} value={p.content}>
                        {p.axis ? `[${p.axis}] ` : ""}{p.date} — {p.content.slice(0, 50)}…
                      </option>
                    ))}
                  </select>
                )}
                <textarea
                  value={selPost}
                  onChange={e => setSelPost(e.target.value)}
                  placeholder="Ou collez votre post ici…"
                  rows={3}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `0.5px solid ${C.gray200}`, fontSize: 12, resize: "vertical", outline: "none", fontFamily: "inherit", background: C.gray50, lineHeight: 1.6 }}
                />
              </div>
          }
        </div>

        {/* Étape 2 — Métriques */}
        <div style={{ border: `0.5px solid ${C.gray200}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={S.stepHeader}>
            <div style={S.stepNum}>2</div>
            <span style={{ fontSize: 11, fontWeight: 500, color: C.gray900 }}>Performances J+7</span>
            <span style={{ fontSize: 10, color: C.gray400 }}>— à saisir après publication</span>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              {[
                { l: "Impressions", k: "impressions" },
                { l: "Likes",       k: "likes" },
                { l: "Commentaires",k: "comments" },
              ].map(({ l, k }) => (
                <div key={k}>
                  <p style={{ fontSize: 11, color: C.gray600, marginBottom: 4 }}>{l}</p>
                  <input
                    type="number"
                    min="0"
                    value={metrics[k]}
                    onChange={e => setMetrics(m => ({ ...m, [k]: e.target.value }))}
                    placeholder="0"
                    style={S.metricInput}
                  />
                </div>
              ))}
            </div>
            {/* Taux calculé automatiquement */}
            {engagementRate && (
              <div style={{
                padding: "6px 10px", background: C.gray50,
                borderRadius: 8, display: "flex",
                justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 11, color: C.gray600 }}>Taux d'engagement calculé</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.green }}>{engagementRate}%</span>
              </div>
            )}
          </div>
        </div>

        <Btn full onClick={handleAnalyze} disabled={!selPost.trim() || loading}>
          {loading ? "Analyse…" : "✦ Analyser & générer une version améliorée"}
        </Btn>

        {/* Post amélioré */}
        {improved && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.green }}>Post amélioré</span>
              <button
                onClick={() => navigator.clipboard.writeText(improved)}
                style={{ fontSize: 11, color: C.navy, background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}
              >
                Copier
              </button>
            </div>
            <div style={{ background: "#F0FDF4", borderRadius: 8, padding: 12, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {improved}
            </div>
          </div>
        )}
      </div>

      {/* ── Colonne droite ── */}
      <div style={S.right}>
        <p style={{ fontSize: 14, fontWeight: 500, color: C.gray900, marginBottom: 12 }}>
          Historique des analyses
        </p>

        {/* KPIs moyens */}
        {insights.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={S.kpiCard}>
              <p style={{ fontSize: 10, color: C.gray400, marginBottom: 4 }}>Moy. impressions</p>
              <p style={{ fontSize: 20, fontWeight: 500, color: C.gray900 }}>{avgImpressions?.toLocaleString("fr-FR") ?? "—"}</p>
            </div>
            <div style={S.kpiCard}>
              <p style={{ fontSize: 10, color: C.gray400, marginBottom: 4 }}>Moy. engagement</p>
              <p style={{ fontSize: 20, fontWeight: 500, color: C.green }}>{avgEngagement ? `${avgEngagement}%` : "—"}</p>
            </div>
            <div style={S.kpiCard}>
              <p style={{ fontSize: 10, color: C.gray400, marginBottom: 4 }}>Posts analysés</p>
              <p style={{ fontSize: 20, fontWeight: 500, color: C.gray900 }}>{insights.length}</p>
            </div>
          </div>
        )}

        {insights.length === 0
          ? <Empty icon="📈" text="Aucune analyse enregistrée." />
          : insights.map(ins => {
              const eng = ins.impressions
                ? (((+ins.likes || 0) + (+ins.comments || 0)) / +ins.impressions * 100).toFixed(1)
                : null;
              return (
                <div key={ins.id} style={S.insightCard}>
                  {/* Header */}
                  <div style={{ padding: "8px 12px", borderBottom: `0.5px solid ${C.gray200}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: C.gray400 }}>{ins.date}</span>
                    <button
                      onClick={() => onDeleteInsight(ins.id)}
                      style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Suppr.
                    </button>
                  </div>
                  {/* Extrait */}
                  <div style={{ padding: "8px 12px", borderBottom: `0.5px solid ${C.gray200}` }}>
                    <p style={{ fontSize: 11, color: C.gray400, fontStyle: "italic", lineHeight: 1.4 }}>
                      {ins.postSnippet}…
                    </p>
                  </div>
                  {/* Métriques */}
                  <div style={{ padding: "8px 12px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {[
                      { l: "Vues",  v: ins.impressions },
                      { l: "Likes", v: ins.likes },
                      { l: "Comm.", v: ins.comments },
                      { l: "Eng.",  v: eng ? `${eng}%` : "—" },
                    ].map(({ l, v }) => (
                      <div key={l} style={{ background: C.gray50, borderRadius: 6, padding: "6px 4px", textAlign: "center" }}>
                        <p style={{ fontSize: 10, color: C.gray400 }}>{l}</p>
                        <p style={{ fontSize: 13, fontWeight: 500, color: l === "Eng." ? C.green : C.gray900 }}>
                          {v || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
