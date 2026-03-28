const { useState, useEffect } = React;

// ─── Sous-onglet : Générer ───────────────────────────────────────────

function GenererTab({ profile, selectedAxes, prefill, onSavePost, showToast }) {
  const [axis,    setAxis]    = useState(prefill?.axis  || selectedAxes[0] || null);
  const [tone,    setTone]    = useState(prefill?.tone  || "");
  const [style,   setStyle]   = useState(prefill?.style || "");
  const [post,    setPost]    = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefill?.axis)  setAxis(prefill.axis);
    if (prefill?.tone)  setTone(prefill.tone);
    if (prefill?.style) setStyle(prefill.style);
  }, [prefill]);

  async function handleGenerate() {
    if (!axis || !tone || !style || !profile) return;
    setLoading(true);
    try {
      const sug = prefill?.roadmapSug ? `\nThème suggéré : "${prefill.roadmapSug.theme}"` : "";
      const txt = await callClaude(
        `Profil : ${profile.name} — ${profile.vision}\nContexte : ${profile.context}\nAxe : ${axis.title} — ${axis.description}\nTon : ${tone}\nStyle : ${style}${sug}\nGénère le post LinkedIn.`,
        LINKEDIN_RULES
      );
      setPost(txt);
    } catch (e) { showToast("⚠️ " + e.message); }
    setLoading(false);
  }

  const canGenerate = axis && tone && style && !loading;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {/* Paramètres */}
      <Card>
        <p style={{ fontSize: 13, fontWeight: 500, color: C.gray900, marginBottom: 14 }}>Paramètres du post</p>

        <p style={{ fontSize: 11, fontWeight: 500, color: C.gray600, marginBottom: 6 }}>Axe</p>
        {selectedAxes.length > 0
          ? <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
              {selectedAxes.map(a => (
                <div
                  key={a.id} onClick={() => setAxis(a)}
                  style={{
                    padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12,
                    border: `2px solid ${axis?.id === a.id ? C.navy : C.gray200}`,
                    background: axis?.id === a.id ? C.navyLight : "#fff",
                    fontWeight: axis?.id === a.id ? 500 : 400,
                    color: axis?.id === a.id ? C.navy : C.gray900,
                  }}
                >
                  {a.emoji} {a.title}
                </div>
              ))}
            </div>
          : <p style={{ fontSize: 12, color: C.gray400, marginBottom: 12 }}>Aucun axe sélectionné.</p>
        }

        <p style={{ fontSize: 11, fontWeight: 500, color: C.gray600, marginBottom: 6 }}>Ton</p>
        <div style={{ marginBottom: 12 }}>
          {TONES.map(t => <Tag key={t} label={t} active={tone === t} onClick={() => setTone(t)} />)}
        </div>

        <p style={{ fontSize: 11, fontWeight: 500, color: C.gray600, marginBottom: 6 }}>Style</p>
        <div style={{ marginBottom: 16 }}>
          {STYLES.map(s => <Tag key={s} label={s} active={style === s} onClick={() => setStyle(s)} />)}
        </div>

        <Btn onClick={handleGenerate} disabled={!canGenerate} full>
          {loading ? "Génération…" : "✦ Générer le post"}
        </Btn>
      </Card>

      {/* Résultat */}
      {post
        ? <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Post généré</span>
                <CharBadge n={post.length} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => navigator.clipboard.writeText(post)} style={{ fontSize: 11, color: C.navy, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Copier</button>
                <button onClick={() => { onSavePost({ content: post, axis: axis?.title || "", tone, style }); showToast("✓ Post sauvegardé"); }} style={{ fontSize: 11, color: C.green, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Sauver</button>
              </div>
            </div>
            <div style={{ background: C.gray50, borderRadius: 8, padding: 14, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 12 }}>
              {post}
            </div>
            <Btn sm variant="secondary" onClick={handleGenerate} disabled={loading}>↺ Regénérer</Btn>
          </Card>
        : <Card style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, background: C.gray50 }}>
            <p style={{ fontSize: 13, color: C.gray400, textAlign: "center" }}>Le post apparaîtra ici après génération.</p>
          </Card>
      }
    </div>
  );
}

// ─── Sous-onglet : Interview ─────────────────────────────────────────

function InterviewTab({ profile, selectedAxes, prefill, onSavePost, showToast }) {
  const [axis,       setAxis]       = useState(prefill?.axis || selectedAxes[0] || null);
  const [tone,       setTone]       = useState(prefill?.tone || "");
  const [style,      setStyle]      = useState(prefill?.style || "");
  const [basePost,   setBasePost]   = useState("");
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [enriched,   setEnriched]   = useState("");
  const [loadBase,   setLoadBase]   = useState(false);
  const [loadQ,      setLoadQ]      = useState(false);
  const [loadEnrich, setLoadEnrich] = useState(false);

  async function handleGenBase() {
    if (!axis || !tone || !style || !profile) return;
    setLoadBase(true);
    try {
      const txt = await callClaude(
        `Profil : ${profile.name} — ${profile.vision}\nContexte : ${profile.context}\nAxe : ${axis.title}\nTon : ${tone}\nStyle : ${style}\nGénère le post LinkedIn.`,
        LINKEDIN_RULES
      );
      setBasePost(txt);
      setQuestions([]);
      setAnswers({});
      setEnriched("");
    } catch (e) { showToast("⚠️ " + e.message); }
    setLoadBase(false);
  }

  async function handleGenQuestions() {
    if (!basePost) return;
    setLoadQ(true);
    try {
      const txt = await callClaude(
        `Post LinkedIn :\n\n${basePost}\n\nPose 3 questions courtes pour extraire le vécu de l'auteur.`,
        `Réponds UNIQUEMENT en JSON valide. Format : {"questions":["Q1","Q2","Q3"]}`,
        400
      );
      const parsed = parseJSON(txt);
      if (parsed?.questions) setQuestions(parsed.questions);
    } catch (e) { showToast("⚠️ " + e.message); }
    setLoadQ(false);
  }

  async function handleEnrich() {
    setLoadEnrich(true);
    try {
      const qa  = questions.map((q, i) => `Q: ${q}\nR: ${answers[i] || "—"}`).join("\n\n");
      const txt = await callClaude(
        `Post original :\n${basePost}\n\nVécu de l'auteur :\n${qa}\n\nRéécris en intégrant naturellement ces éléments.`,
        LINKEDIN_RULES
      );
      setEnriched(txt);
    } catch (e) { showToast("⚠️ " + e.message); }
    setLoadEnrich(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {/* Gauche : paramètres + Q&A */}
      <Card>
        <p style={{ fontSize: 13, fontWeight: 500, color: C.gray900, marginBottom: 10 }}>Post de base</p>
        <p style={{ fontSize: 11, fontWeight: 500, color: C.gray600, marginBottom: 6 }}>Axe</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
          {selectedAxes.map(a => (
            <div key={a.id} onClick={() => setAxis(a)} style={{ padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, border: `2px solid ${axis?.id === a.id ? C.navy : C.gray200}`, background: axis?.id === a.id ? C.navyLight : "#fff", color: axis?.id === a.id ? C.navy : C.gray900 }}>
              {a.emoji} {a.title}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: C.gray600, marginBottom: 4 }}>Ton</p>
            <div>{TONES.map(t => <Tag key={t} label={t} active={tone === t} onClick={() => setTone(t)} />)}</div>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: C.gray600, marginBottom: 4 }}>Style</p>
            <div>{STYLES.map(s => <Tag key={s} label={s} active={style === s} onClick={() => setStyle(s)} />)}</div>
          </div>
        </div>
        <Btn sm onClick={handleGenBase} disabled={!axis || !tone || !style || loadBase} style={{ marginBottom: 12 }}>
          {loadBase ? "Génération…" : basePost ? "↺ Regénérer le post de base" : "Générer le post de base"}
        </Btn>

        {basePost && (
          <>
            <div style={{ background: C.gray50, borderLeft: `3px solid ${C.gray200}`, borderRadius: "0 8px 8px 0", padding: "9px 11px", fontSize: 12, lineHeight: 1.6, color: C.gray600, marginBottom: 12, maxHeight: 100, overflowY: "auto" }}>
              {basePost}
            </div>
            {questions.length === 0
              ? <Btn sm onClick={handleGenQuestions} disabled={loadQ}>
                  {loadQ ? "Génération…" : "Générer les questions"}
                </Btn>
              : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {questions.map((q, i) => (
                    <div key={i}>
                      <div style={{ background: C.gray50, borderLeft: `3px solid ${C.navy}`, borderRadius: "0 8px 8px 0", padding: "8px 10px", marginBottom: 6 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: C.navy }}>{q}</p>
                      </div>
                      <textarea
                        value={answers[i] || ""}
                        onChange={e => setAnswers(p => ({ ...p, [i]: e.target.value }))}
                        placeholder="Votre réponse…"
                        rows={2}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: `0.5px solid ${C.gray200}`, fontSize: 12, resize: "vertical", outline: "none", fontFamily: "inherit", background: C.gray50 }}
                      />
                    </div>
                  ))}
                  <Btn full onClick={handleEnrich} disabled={loadEnrich}>
                    {loadEnrich ? "Réécriture…" : "✦ Réécrire avec mon vécu"}
                  </Btn>
                </div>
            }
          </>
        )}
      </Card>

      {/* Droite : post enrichi */}
      {enriched
        ? <Card style={{ borderTop: `3px solid ${C.green}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.green }}>Post enrichi</span>
                <CharBadge n={enriched.length} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => navigator.clipboard.writeText(enriched)} style={{ fontSize: 11, color: C.navy, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Copier</button>
                <button onClick={() => { onSavePost({ content: enriched, axis: axis?.title || "", tone, style }); showToast("✓ Post sauvegardé"); }} style={{ fontSize: 11, color: C.green, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Sauver</button>
              </div>
            </div>
            <div style={{ background: "#F0FDF4", borderRadius: 8, padding: 12, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 12 }}>
              {enriched}
            </div>
            <Btn sm variant="secondary" onClick={handleEnrich} disabled={loadEnrich}>↺ Regénérer</Btn>
          </Card>
        : <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, background: C.gray50, border: `0.5px dashed ${C.gray200}` }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${C.gray200}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.navy, opacity: 0.25 }} />
            </div>
            <p style={{ fontSize: 12, color: C.gray400, textAlign: "center", lineHeight: 1.5 }}>
              Le post enrichi<br />apparaîtra ici
            </p>
          </Card>
      }
    </div>
  );
}

// ─── Sous-onglet : Analyser ──────────────────────────────────────────

function AnalyserTab({ showToast }) {
  const [post,     setPost]     = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(false);

  async function handleAnalyze() {
    if (!post) return;
    setLoading(true);
    try {
      const txt = await callClaude(
        `Analyse ce post LinkedIn :\n\n${post}`,
        `Expert LinkedIn. Réponds UNIQUEMENT en JSON valide. Format : {"score":7,"hook":{"note":6,"comment":"..."},"structure":{"note":7,"comment":"..."},"ton":{"note":8,"comment":"..."},"longueur":{"note":5,"comment":"..."},"points_forts":["..."],"points_faibles":["..."],"recommandations":["..."]}`,
        700
      );
      const parsed = parseJSON(txt);
      if (parsed) setAnalysis(parsed);
      else showToast("⚠️ Format inattendu");
    } catch (e) { showToast("⚠️ " + e.message); }
    setLoading(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Post à analyser</span>
          <CharBadge n={post.length} />
        </div>
        <textarea
          value={post}
          onChange={e => setPost(e.target.value)}
          placeholder="Collez votre post ici…"
          rows={10}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `0.5px solid ${C.gray200}`, fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit", background: C.gray50, lineHeight: 1.7, marginBottom: 12 }}
        />
        <Btn onClick={handleAnalyze} disabled={!post || loading} full>
          {loading ? "Analyse…" : "Analyser ce post"}
        </Btn>
      </Card>

      <Card>
        {!analysis
          ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
              <p style={{ fontSize: 13, color: C.gray400 }}>Les résultats apparaîtront ici.</p>
            </div>
          : <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Résultats</span>
                <span style={{ fontSize: 28, fontWeight: 500, color: analysis.score >= 7 ? C.green : analysis.score >= 5 ? C.amber : C.red }}>
                  {analysis.score}<span style={{ fontSize: 13, color: C.gray400 }}>/10</span>
                </span>
              </div>
              {[{ k: "hook", l: "Hook" }, { k: "structure", l: "Structure" }, { k: "ton", l: "Ton" }, { k: "longueur", l: "Longueur" }]
                .map(({ k, l }) => analysis[k] && <ScoreBar key={k} label={l} note={analysis[k].note} />)
              }
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                {analysis.points_forts?.length > 0 && (
                  <div style={{ background: "#F0FDF4", borderRadius: 8, padding: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 500, color: "#15803D", marginBottom: 5 }}>Points forts</p>
                    {analysis.points_forts.map((p, i) => <p key={i} style={{ fontSize: 11, color: "#166534", marginBottom: 3 }}>· {p}</p>)}
                  </div>
                )}
                {analysis.points_faibles?.length > 0 && (
                  <div style={{ background: "#FEF2F2", borderRadius: 8, padding: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 500, color: "#B91C1C", marginBottom: 5 }}>À améliorer</p>
                    {analysis.points_faibles.map((p, i) => <p key={i} style={{ fontSize: 11, color: "#991B1B", marginBottom: 3 }}>· {p}</p>)}
                  </div>
                )}
              </div>
              {analysis.recommandations?.length > 0 && (
                <div style={{ background: C.navyLight, borderRadius: 8, padding: 10, marginTop: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: C.navy, marginBottom: 7 }}>Recommandations</p>
                  {analysis.recommandations.map((r, i) => <p key={i} style={{ fontSize: 12, color: C.gray600, marginBottom: 5 }}>{i + 1}. {r}</p>)}
                </div>
              )}
            </>
        }
      </Card>
    </div>
  );
}

// ─── Sous-onglet : Optimiser ─────────────────────────────────────────

function OptimiserTab({ onSavePost, showToast }) {
  const [post,      setPost]      = useState("");
  const [selAxes,   setSelAxes]   = useState([]);
  const [freeInst,  setFreeInst]  = useState("");
  const [optimPost, setOptimPost] = useState("");
  const [loading,   setLoading]   = useState(false);

  async function handleOptimize() {
    if (!post) return;
    setLoading(true);
    try {
      const desc  = selAxes.map(id => { const a = OPTIM_AXES.find(x => x.id === id); return a ? `- ${a.label} : ${a.desc}` : ""; }).filter(Boolean).join("\n");
      const instr = [desc, freeInst.trim()].filter(Boolean).join("\n\nInstruction libre :\n") || "Améliore globalement.";
      const txt   = await callClaude(`Optimise ce post selon :\n${instr}\n\nPost :\n${post}`, LINKEDIN_RULES);
      setOptimPost(txt);
    } catch (e) { showToast("⚠️ " + e.message); }
    setLoading(false);
  }

  const canOptimize = post && (selAxes.length > 0 || freeInst.trim()) && !loading;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Card>
        <p style={{ fontSize: 13, fontWeight: 500, color: C.gray900, marginBottom: 12 }}>Axes d'optimisation</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
          {OPTIM_AXES.map(a => {
            const sel = selAxes.includes(a.id);
            return (
              <div
                key={a.id}
                onClick={() => setSelAxes(p => sel ? p.filter(x => x !== a.id) : [...p, a.id])}
                style={{ padding: "9px 10px", borderRadius: 8, cursor: "pointer", border: `0.5px solid ${sel ? C.navy : C.gray200}`, background: sel ? C.navyLight : "#fff" }}
              >
                <p style={{ fontSize: 12, fontWeight: 500, color: sel ? C.navy : C.gray900, marginBottom: 1 }}>{a.label}</p>
                <p style={{ fontSize: 10, color: C.gray400 }}>{a.desc}</p>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 11, fontWeight: 500, color: C.gray600, marginBottom: 6 }}>Post à optimiser</p>
        <textarea
          value={post}
          onChange={e => setPost(e.target.value)}
          placeholder="Collez votre post ici…"
          rows={5}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `0.5px solid ${C.gray200}`, fontSize: 12, resize: "vertical", outline: "none", fontFamily: "inherit", background: C.gray50, lineHeight: 1.6, marginBottom: 10 }}
        />
        <Field label="Instruction libre" value={freeInst} onChange={setFreeInst} placeholder="Ex : Rends plus adapté à une audience DSI…" rows={2} />
        <Btn full onClick={handleOptimize} disabled={!canOptimize}>
          {loading ? "Optimisation…" : `Optimiser${selAxes.length ? ` (${selAxes.length})` : ""}`}
        </Btn>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {post && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.gray600 }}>Post de base</span>
              <CharBadge n={post.length} />
            </div>
            <div style={{ background: C.gray50, borderRadius: 8, padding: 10, fontSize: 12, lineHeight: 1.6, color: C.gray600, maxHeight: 120, overflowY: "auto", opacity: 0.8 }}>
              {post}
            </div>
          </Card>
        )}
        {optimPost && (
          <Card style={{ borderTop: `3px solid ${C.green}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.green }}>Post optimisé</span>
                <CharBadge n={optimPost.length} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => navigator.clipboard.writeText(optimPost)} style={{ fontSize: 11, color: C.navy, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Copier</button>
                <button onClick={() => { onSavePost({ content: optimPost, axis: "", tone: "", style: "" }); showToast("✓ Post sauvegardé"); }} style={{ fontSize: 11, color: C.green, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Sauver</button>
              </div>
            </div>
            <div style={{ background: "#F0FDF4", borderRadius: 8, padding: 12, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 10 }}>
              {optimPost}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn sm variant="secondary" onClick={handleOptimize} disabled={loading}>↺ Regénérer</Btn>
              <Btn sm variant="secondary" onClick={() => { setPost(optimPost); setOptimPost(""); }}>→ Nouvelle base</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── CreerTab principal ──────────────────────────────────────────────

export function CreerTab({ profile, selectedAxes, prefill, onSavePost, showToast }) {
  const [activeTab, setActiveTab] = useState("generer");

  const TABS = [
    { id: "generer",   label: "Générer" },
    { id: "interview", label: "Interview" },
    { id: "analyser",  label: "Analyser" },
    { id: "optimiser", label: "Optimiser" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>

      {/* Sous-navigation */}
      <div style={{
        height: 40, background: "#fff",
        borderBottom: `0.5px solid ${C.gray200}`,
        display: "flex", alignItems: "stretch",
        padding: "0 1.25rem", flexShrink: 0,
      }}>
        {TABS.map(tab => {
          const isOn = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0 16px", fontSize: 12,
                color: isOn ? C.navy : C.gray400,
                fontWeight: isOn ? 500 : 400,
                borderBottom: `2px solid ${isOn ? C.navy : "transparent"}`,
                background: "none", border: "none",
                borderBottom: `2px solid ${isOn ? C.navy : "transparent"}`,
                cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", background: C.gray50 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {activeTab === "generer"   && <GenererTab   profile={profile} selectedAxes={selectedAxes} prefill={prefill} onSavePost={onSavePost} showToast={showToast} />}
          {activeTab === "interview" && <InterviewTab profile={profile} selectedAxes={selectedAxes} prefill={prefill} onSavePost={onSavePost} showToast={showToast} />}
          {activeTab === "analyser"  && <AnalyserTab  showToast={showToast} />}
          {activeTab === "optimiser" && <OptimiserTab onSavePost={onSavePost} showToast={showToast} />}
        </div>
      </div>
    </div>
  );
}
window.CreerTab = CreerTab;
