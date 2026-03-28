const { useState } = React;

export function MesPostsTab({ posts, onDelete }) {
  const [filter, setFilter] = useState("all");

  const axes     = [...new Set(posts.map(p => p.axis).filter(Boolean))];
  const filtered = filter === "all" ? posts : posts.filter(p => p.axis === filter);

  const S = {
    wrap: {
      height: "calc(100vh - 56px)",
      overflowY: "auto",
      padding: "1.5rem",
      background: C.gray50,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 10,
    },
    postCard: {
      background: "#fff",
      border: `0.5px solid ${C.gray200}`,
      borderRadius: 10,
      padding: 14,
    },
    filterBtn: (active) => ({
      padding: "4px 10px",
      borderRadius: 20,
      fontSize: 11,
      cursor: "pointer",
      background: active ? C.navyLight : C.gray100,
      color:      active ? C.navy      : C.gray600,
      border:     active ? `0.5px solid ${C.navyMid}` : `0.5px solid ${C.gray200}`,
      fontWeight: active ? 500 : 400,
      fontFamily: "inherit",
    }),
  };

  return (
    <div style={S.wrap}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: C.gray900 }}>
            Mes posts{" "}
            <span style={{ fontSize: 13, color: C.gray400, fontWeight: 400 }}>
              ({posts.length})
            </span>
          </p>
        </div>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
          <button style={S.filterBtn(filter === "all")} onClick={() => setFilter("all")}>
            Tous
          </button>
          {axes.map(a => (
            <button key={a} style={S.filterBtn(filter === a)} onClick={() => setFilter(a)}>
              {a}
            </button>
          ))}
        </div>

        {/* Liste */}
        {filtered.length === 0
          ? <Empty icon="📝" text="Aucun post sauvegardé." />
          : <div style={S.grid}>
              {filtered.map(p => (
                <div key={p.id} style={S.postCard}>
                  {/* Meta */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {p.axis && (
                        <span style={{
                          padding: "2px 8px", background: C.navyLight,
                          color: C.navy, borderRadius: 4,
                          fontSize: 11, fontWeight: 500,
                        }}>
                          {p.axis}
                        </span>
                      )}
                      {p.tone && (
                        <span style={{ fontSize: 11, color: C.gray400 }}>
                          {p.tone}{p.style ? ` · ${p.style}` : ""}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: C.gray400, flexShrink: 0 }}>{p.date}</span>
                  </div>

                  {/* Extrait */}
                  <p style={{
                    fontSize: 13, color: C.gray900,
                    lineHeight: 1.6, whiteSpace: "pre-wrap",
                    maxHeight: 80, overflow: "hidden",
                    WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent)",
                    marginBottom: 10,
                  }}>
                    {p.content}
                  </p>

                  {/* Actions */}
                  <div style={{
                    display: "flex", gap: 10,
                    borderTop: `0.5px solid ${C.gray200}`,
                    paddingTop: 8,
                  }}>
                    <button
                      onClick={() => navigator.clipboard.writeText(p.content)}
                      style={{ fontSize: 11, color: C.navy, background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}
                    >
                      Copier
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      style={{ fontSize: 11, color: C.red, background: "none", border: "none", cursor: "pointer", marginLeft: "auto", fontFamily: "inherit" }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
window.MesPostsTab = MesPostsTab;
