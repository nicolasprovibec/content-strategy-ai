const { useState } = React;

export function RoadmapTab({
  roadmaps, activeRmId, onSetActive,
  onNewRoadmap, onRenameRoadmap, onDeleteRoadmap,
  onRoadmapGenerated, onGoCreer,
  pubWeeks, selectedAxes, profile, showToast,
}) {
  const [dur,     setDur]     = useState(6);
  const [openQ,   setOpenQ]   = useState([0]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeRm = roadmaps.find(r => r.id === activeRmId) || roadmaps[0];
  const weeks    = activeRm?.weeks || [];
  const months   = [...new Set(weeks.map(w => w.month))];

  // Découpe en trimestres
  const quarters = [];
  for (let i = 0; i < months.length; i += 3) {
    const qMonths = months.slice(i, i + 3);
    const qWeeks  = weeks.filter(w => qMonths.includes(w.month));
    const done    = qWeeks.filter(w => pubWeeks.has(w.week)).length;
    const current = qWeeks.find(w => !pubWeeks.has(w.week));
    quarters.push({ index: i / 3, months: qMonths, weeks: qWeeks, done, current });
  }

  function toggleQuarter(i) {
    setOpenQ(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);
  }

  async function handleGenRoadmap() {
    if (!selectedAxes.length) { showToast("⚠️ Sélectionnez des axes d'abord"); return; }
    setLoading(true);
    showToast("⏳ Génération de la roadmap…");
    try {
      const titles = selectedAxes.map(a => a.title);
      const txt = await callClaude(
        `Profil : ${profile?.name || ""} — ${profile?.vision || ""}
Axes : ${JSON.stringify(titles)}
Génère une roadmap LinkedIn de ${dur} mois (${dur * 4} semaines) en français.
Répartis les axes équitablement. Pour chaque semaine : week(1-${dur * 4}), month("Mois 1"…"Mois ${dur}"), theme, detail(1 phrase), axis(exact match), tone, style, hook.`,
        `Réponds UNIQUEMENT en JSON valide. Format : {"weeks":[{"week":1,"month":"Mois 1","theme":"...","detail":"...","axis":"...","tone":"...","style":"...","hook":"..."}]}`,
        2000
      );
      const parsed = parseJSON(txt);
      if (parsed?.weeks?.length) {
        const rm = {
          id: uid(),
          name: `Roadmap ${dur}m — ${toDay()}`,
          createdAt: toDay(),
          weeks: parsed.weeks,
          dur,
        };
        onRoadmapGenerated(rm);
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
      display: "grid",
      gridTemplateColumns: sidebarOpen ? "220px 1fr" : "44px 1fr",
      height: "calc(100vh - 56px)",
      transition: "grid-template-columns 0.2s ease",
    },
    sidebar: {
      background: C.gray50,
      borderRight: `0.5px solid ${C.gray200}`,
      padding: "10px 0",
      display: "flex",
      flexDirection: "column",
      alignItems: sidebarOpen ? "stretch" : "center",
      gap: 6,
      overflowY: "auto",
    },
    toggleBtn: {
      width: 30, height: 30,
      borderRadius: 8,
      background: C.navy,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", margin: sidebarOpen ? "0 10px 8px" : "0 auto 8px",
      flexShrink: 0,
      border: "none",
    },
    rmPill: (isActive) => ({
      borderRadius: 6,
      border: `0.5px solid ${isActive ? C.navy : C.gray200}`,
      background: isActive ? C.navyLight : "#fff",
      cursor: "pointer",
      display: "flex", alignItems: "center",
      ...(sidebarOpen
        ? { padding: "8px 10px", margin: "0 8px", gap: 8 }
        : { width: 28, height: 28, justifyContent: "center", margin: "0 auto" }
      ),
    }),
  };

  return (
    <div style={S.wrap}>

      {/* ── Sidebar rétractable ── */}
      <div style={S.sidebar}>
        <button style={S.toggleBtn} onClick={() => setSidebarOpen(o => !o)}>
          <span style={{ color: "#fff", fontSize: 14, transform: sidebarOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>›</span>
        </button>

        {roadmaps.map(rm => (
          <div key={rm.id} style={S.rmPill(rm.id === activeRmId)} onClick={() => onSetActive(rm.id)}>
            {sidebarOpen ? (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: rm.id === activeRmId ? C.navy : C.gray900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {rm.name}
                  </p>
                  <p style={{ fontSize: 10, color: C.gray400 }}>{rm.weeks?.length || 0} sem.</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteRoadmap(rm.id); }}
                  style={{ fontSize: 11, color: C.gray400, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
                >✕</button>
              </>
            ) : (
              <span style={{ fontSize: 9, fontWeight: 500, color: rm.id === activeRmId ? C.navy : C.gray600 }}>
                R{roadmaps.indexOf(rm) + 1}
              </span>
            )}
          </div>
        ))}

        {sidebarOpen
          ? <Btn sm onClick={onNewRoadmap} style={{ margin: "4px 8px 0" }}>+ Nouvelle</Btn>
          : (
            <div
              onClick={onNewRoadmap}
              style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px dashed ${C.gray200}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "0 auto" }}
            >
              <span style={{ fontSize: 14, color: C.gray400 }}>+</span>
            </div>
          )
        }
      </div>

      {/* ── Contenu principal ── */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{
          height: 48, background: C.gray50,
          borderBottom: `0.5px solid ${C.gray200}`,
          display: "flex", alignItems: "center",
          padding: "0 1.25rem", gap: 10, flexShrink: 0, flexWrap: "wrap",
        }}>
          {activeRm && (
            <>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.gray900 }}>{activeRm.name}</span>
              <span style={{ fontSize: 10, padding: "2px 8px", background: C.navyLight, color: C.navy, borderRadius: 20, fontWeight: 500 }}>Active</span>
            </>
          )}
          <span style={{ fontSize: 11, color: C.gray600, marginLeft: 8 }}>Durée :</span>
          <div style={{ display: "flex", gap: 3 }}>
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => setDur(d)}
                style={{
                  width: 34, height: 30, borderRadius: 7,
                  border: `0.5px solid ${dur === d ? C.navy : C.gray200}`,
                  background: dur === d ? C.navy : "#fff",
                  cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 1,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 500, color: dur === d ? "#fff" : C.gray600, lineHeight: 1 }}>{d}</span>
                <span style={{ fontSize: 8, color: dur === d ? "rgba(255,255,255,0.7)" : C.gray400, lineHeight: 1 }}>m</span>
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {activeRm && (
              <Btn sm variant="secondary" onClick={() => onRenameRoadmap(activeRm.id)}>
                Renommer
              </Btn>
            )}
            <Btn sm onClick={handleGenRoadmap} disabled={loading || !selectedAxes.length}>
              {loading ? "Génération…" : activeRm?.weeks?.length ? "↺ Regénérer" : "→ Générer"}
            </Btn>
          </div>
        </div>

        {/* Corps */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", background: C.gray50 }}>
          {!selectedAxes.length && (
            <div style={{
              background: "#FEF3C7", border: `0.5px solid ${C.amber}`,
              borderRadius: 8, padding: "8px 12px", marginBottom: 12,
              fontSize: 12, color: "#92400E",
            }}>
              ⚠ Sélectionnez d'abord vos axes avant de générer une roadmap.
            </div>
          )}

          {!activeRm?.weeks?.length
            ? <Empty
                icon="🗓"
                text="Cliquez sur Générer pour créer votre première roadmap."
                btnLabel={selectedAxes.length ? "Générer la roadmap" : null}
                onBtn={selectedAxes.length ? handleGenRoadmap : null}
              />
            : quarters.map((q, qi) => {
                const isOpen = openQ.includes(qi);
                return (
                  <div key={qi} style={{ marginBottom: 8 }}>
                    {/* Header trimestre */}
                    <div
                      onClick={() => toggleQuarter(qi)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", cursor: "pointer", userSelect: "none",
                        background: isOpen ? C.navyLight : C.gray100,
                        border: `0.5px solid ${isOpen ? C.navy : C.gray200}`,
                        borderRadius: isOpen ? "9px 9px 0 0" : 9,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 500, color: C.navy }}>Trimestre {q.index + 1}</span>
                      <span style={{ fontSize: 11, color: C.gray400 }}>{q.months.join(" · ")}</span>
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                        {q.done > 0 && <span style={{ fontSize: 11, color: C.green }}>{q.done} publié{q.done > 1 ? "s" : ""}</span>}
                        <span style={{ fontSize: 12, color: C.gray400, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>›</span>
                      </div>
                    </div>

                    {/* Contenu trimestre */}
                    {isOpen && (
                      <div style={{
                        border: `0.5px solid ${C.navy}`, borderTop: "none",
                        borderRadius: "0 0 9px 9px", padding: 12, background: "#fff",
                      }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                          {q.months.map(month => (
                            <div key={month}>
                              <div style={{
                                fontSize: 10, fontWeight: 500, color: C.navy,
                                textTransform: "uppercase", letterSpacing: "0.05em",
                                marginBottom: 8, paddingBottom: 5,
                                borderBottom: `0.5px solid ${C.gray200}`,
                              }}>
                                {month}
                              </div>
                              {q.weeks.filter(w => w.month === month).map(w => {
                                const isDone = pubWeeks.has(w.week);
                                const isCur  = q.current?.week === w.week;
                                return (
                                  <div
                                    key={w.week}
                                    style={{
                                      border: `0.5px solid ${isCur ? C.navy : C.gray200}`,
                                      borderRadius: 7, padding: 9, marginBottom: 7,
                                      background: isCur ? C.navyLight : "#fff",
                                      opacity: isDone ? 0.55 : 1,
                                    }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                      <span style={{ fontSize: 10, color: C.gray400 }}>Sem. {w.week}</span>
                                      {isDone
                                        ? <span style={{ fontSize: 10, color: C.green, fontWeight: 500 }}>✓ Publié</span>
                                        : <button
                                            onClick={() => onGoCreer(w)}
                                            style={{
                                              fontSize: 10, color: C.navy,
                                              border: `0.5px solid ${C.navyMid}`,
                                              borderRadius: 4, padding: "2px 6px",
                                              background: C.navyLight, cursor: "pointer",
                                            }}
                                          >
                                            Créer →
                                          </button>
                                      }
                                    </div>
                                    <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3, marginBottom: 3 }}>{w.theme}</p>
                                    <p style={{ fontSize: 11, color: C.gray400, lineHeight: 1.4, marginBottom: 5 }}>{w.detail}</p>
                                    <span style={{
                                      padding: "2px 6px", background: C.navyLight,
                                      color: C.navy, borderRadius: 4, fontSize: 10, fontWeight: 500,
                                    }}>
                                      {w.axis}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}
