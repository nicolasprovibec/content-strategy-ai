const { useState } = React;

const FILTERS = [
  { k: "all",  l: (n) => `Tous (${n})` },
  { k: "fav",  l: () => "Favoris" },
  { k: "used", l: () => "Sélectionnés" },
  { k: "new",  l: () => "Nouveaux" },
];

export function AxesTab({
  axesSessions, favAxes, selectedAxes,
  onToggleAxis, onToggleFav,
  onAxesGenerated, profile,
  showToast, onGoRoadmap, onGoCreer,
}) {
  const [mode,   setMode]   = useState("select");   // "select" | "replace"
  const [marked, setMarked] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const allAxes = axesSessions.flatMap(s => s.axes);
  const usedIds = new Set(selectedAxes.map(a => a.id));
  const favIds  = new Set(favAxes);
  const kept    = allAxes.filter(a => !marked.find(x => x.id === a.id));

  const filteredSessions = axesSessions.map(s => ({
    ...s,
    axes: s.axes.filter(a => {
      if (filter === "fav")  return favIds.has(a.id);
      if (filter === "used") return usedIds.has(a.id);
      if (filter === "new")  return !usedIds.has(a.id) && !favIds.has(a.id);
      return true;
    }),
  })).filter(s => s.axes.length > 0);

  function toggleMark(a) {
    setMarked(p => p.find(x => x.id === a.id) ? p.filter(x => x.id !== a.id) : [...p, a]);
  }

  async function regenAxes(count, existingAxes) {
    if (!profile) { showToast("⚠️ Complétez votre profil d'abord"); return; }
    setLoading(true);
    try {
      const txt = await callClaude(
        `Profil : ${profile.name} — ${profile.vision}\nAxes existants à ne pas reproduire : ${JSON.stringify(existingAxes.map(a => a.title))}\nGénère ${count} nouveaux axes LinkedIn différents en français.`,
        `Réponds UNIQUEMENT en JSON valide. Format : {"axes":[{"title":"...","description":"...","emoji":"..."}]} avec exactement ${count} items.`,
        700
      );
      const parsed = parseJSON(txt);
      if (parsed?.axes?.length) {
        const withIds  = parsed.axes.map(a => ({ ...a, id: uid() }));
        const merged   = count === 6 ? withIds : [...kept, ...withIds];
        const session  = { id: uid(), label: `Regénération — ${toDay()}`, createdAt: toDay(), axes: merged };
        onAxesGenerated(session);
        setMarked([]);
        setMode("select");
        showToast(`✓ ${parsed.axes.length} axe(s) générés`);
      } else {
        showToast("⚠️ Format inattendu, réessayez");
      }
    } catch (e) {
      showToast("⚠️ " + e.message);
    }
    setLoading(false);
  }

  // ── Styles ──────────────────────────────────────────────────────

  const S = {
    wrap: {
      height: "calc(100vh - 56px)",
      overflowY: "auto",
      padding: "1.25rem",
      background: C.gray50,
    },
    toolbar: {
      display: "flex", alignItems: "center",
      gap: 8, marginBottom: 16, flexWrap: "wrap",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 9,
    },
    axeCard: (isSel, isFav, isMk) => ({
      border: `0.5px solid ${isMk ? C.amber : isSel ? C.navy : isFav ? C.amber : C.gray200}`,
      borderRadius: 9,
      padding: 11,
      background: isMk ? "#FFFBEB" : isSel ? C.navyLight : "#fff",
      cursor: "pointer",
    }),
  };

  return (
    <div style={S.wrap}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Toolbar */}
        <div style={S.toolbar}>
          <div style={{ display: "flex", gap: 4 }}>
            {FILTERS.map(({ k, l }) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: "4px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                  background: filter === k ? C.navyLight : C.gray100,
                  color:      filter === k ? C.navy      : C.gray600,
                  border:     filter === k ? `0.5px solid ${C.navyMid}` : `0.5px solid ${C.gray200}`,
                  fontWeight: filter === k ? 500 : 400,
                }}
              >
                {l(allAxes.length)}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button
              onClick={() => { setMode(m => m === "replace" ? "select" : "replace"); setMarked([]); }}
              style={{
                padding: "4px 10px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                background: mode === "replace" ? "#FEF3C7" : C.gray100,
                color:      mode === "replace" ? "#92400E" : C.gray600,
                border:     `0.5px solid ${mode === "replace" ? C.amber : C.gray200}`,
              }}
            >
              {mode === "replace" ? "✕ Annuler" : "↺ Remplacer des axes"}
            </button>
            <Btn sm variant="secondary" onClick={() => regenAxes(6, allAxes)} disabled={loading}>
              {loading ? "…" : "↺ Regénérer 6 nouveaux"}
            </Btn>
          </div>
        </div>

        {/* Bandeau remplacement */}
        {mode === "replace" && marked.length > 0 && (
          <div style={{
            background: "#FEF3C7", border: `0.5px solid ${C.amber}`,
            borderRadius: 8, padding: "8px 12px", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 12, color: "#92400E" }}>
              {marked.length} axe(s) marqué(s) à remplacer
            </span>
            <Btn
              sm variant="secondary"
              onClick={() => regenAxes(marked.length, kept)}
              disabled={loading}
              style={{ marginLeft: "auto" }}
            >
              {loading ? "Génération…" : `↺ Remplacer ${marked.length} axe(s)`}
            </Btn>
          </div>
        )}

        {filteredSessions.length === 0 && (
          <Empty icon="🎯" text="Aucun axe trouvé." />
        )}

        {/* Sessions */}
        {filteredSessions.map((session, si) => (
          <div key={si} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 500, color: C.gray400,
              textTransform: "uppercase", letterSpacing: "0.05em",
              marginBottom: 10, display: "flex", alignItems: "center", gap: 6,
            }}>
              {session.label}
              <span style={{
                background: C.gray100, borderRadius: 10,
                padding: "1px 6px", fontSize: 10,
              }}>
                {session.axes.length}
              </span>
            </div>

            <div style={S.grid}>
              {session.axes.map(a => {
                const isSel = usedIds.has(a.id);
                const isFav = favIds.has(a.id);
                const isMk  = !!marked.find(x => x.id === a.id);

                return (
                  <div
                    key={a.id}
                    style={S.axeCard(isSel, isFav, isMk)}
                    onClick={() => mode === "replace" ? toggleMark(a) : onToggleAxis(a)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <span style={{ fontSize: 15 }}>{a.emoji}</span>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {mode !== "replace" && (
                          <span
                            onClick={e => { e.stopPropagation(); onToggleFav(a.id); }}
                            style={{ fontSize: 13, color: isFav ? C.amber : C.gray200, cursor: "pointer" }}
                          >
                            {isFav ? "★" : "☆"}
                          </span>
                        )}
                        {mode === "replace" && isMk && (
                          <span style={{
                            fontSize: 10, background: C.amber, color: "#fff",
                            borderRadius: 4, padding: "1px 5px",
                          }}>↺</span>
                        )}
                        {mode !== "replace" && isSel && (
                          <div style={{
                            width: 15, height: 15, borderRadius: "50%",
                            background: C.navy, color: "#fff",
                            fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center",
                          }}>✓</div>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: 12, fontWeight: 500, color: isSel ? C.navy : C.gray900, marginBottom: 2 }}>
                      {a.title}
                    </p>
                    <p style={{ fontSize: 11, color: C.gray400, lineHeight: 1.3, marginBottom: 6 }}>
                      {a.description}
                    </p>
                    <span style={{
                      fontSize: 9, padding: "1px 5px", borderRadius: 3, display: "inline-block",
                      background: isSel ? "#F0FDF4" : isFav ? "#FEF3C7" : C.gray100,
                      color:      isSel ? "#15803D"  : isFav ? "#92400E"  : C.gray400,
                    }}>
                      {isSel ? "✓ Sélectionné" : isFav ? "★ Favori" : session.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Actions */}
        {selectedAxes.length > 0 && mode === "select" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <Btn onClick={onGoRoadmap}>→ Générer la roadmap</Btn>
            <Btn variant="secondary" onClick={onGoCreer}>→ Créer un post directement</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
