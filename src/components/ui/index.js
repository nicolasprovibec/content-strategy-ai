// ─── Design tokens ──────────────────────────────────────────────────

export const C = {
  navy:      "#1E3A5F",
  navyLight: "#E8F0FA",
  navyMid:   "#A8C0DC",
  green:     "#10B981",
  amber:     "#F59E0B",
  red:       "#EF4444",
  gray50:    "#F8FAFC",
  gray100:   "#F1F5F9",
  gray200:   "#E2E8F0",
  gray400:   "#94A3B8",
  gray600:   "#475569",
  gray900:   "#0F172A",
};

// ─── Btn ────────────────────────────────────────────────────────────

const BTN_VARIANTS = {
  primary:   { background: C.navy,    color: "#fff",       border: "none" },
  secondary: { background: C.gray100, color: C.gray600,    border: `0.5px solid ${C.gray200}` },
  ghost:     { background: "transparent", color: C.navy,   border: `0.5px solid ${C.navyMid}` },
  danger:    { background: "#FEF2F2", color: C.red,        border: "0.5px solid #FCA5A5" },
  success:   { background: "#F0FDF4", color: "#15803D",    border: "0.5px solid #86EFAC" },
};

export function Btn({
  onClick, disabled = false, children,
  variant = "primary", sm = false, full = false, style: sx,
}) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: full ? "center" : "flex-start",
    gap: 6, padding: sm ? "6px 12px" : "9px 18px",
    borderRadius: 8, fontWeight: 500, fontSize: sm ? 12 : 13,
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap", fontFamily: "inherit",
    width: full ? "100%" : "auto",
    opacity: disabled ? 0.6 : 1,
    transition: "opacity 0.15s",
    ...BTN_VARIANTS[variant],
    ...sx,
  };
  return (
    <button onClick={onClick} disabled={disabled} style={base}>
      {children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────

export function Card({ children, style: sx }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: `0.5px solid ${C.gray200}`,
      padding: "1rem",
      marginBottom: 10,
      ...sx,
    }}>
      {children}
    </div>
  );
}

// ─── Field ───────────────────────────────────────────────────────────

export function Field({ label, value, onChange, placeholder, rows, style: sx }) {
  const inputStyle = {
    width: "100%", padding: "9px 12px",
    borderRadius: 8, border: `0.5px solid ${C.gray200}`,
    fontSize: 13, outline: "none",
    color: C.gray900, fontFamily: "inherit",
    background: C.gray50,
    resize: rows ? "vertical" : undefined,
    lineHeight: rows ? 1.6 : undefined,
  };
  return (
    <div style={{ marginBottom: 12, ...sx }}>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 500, color: C.gray600, marginBottom: 4 }}>
          {label}
        </div>
      )}
      {rows
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={inputStyle} />
        : <input    value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      }
    </div>
  );
}

// ─── Tag ─────────────────────────────────────────────────────────────

export function Tag({ label, active, onClick }) {
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-block", padding: "5px 12px", borderRadius: 20,
        fontSize: 12, margin: "3px 3px 3px 0", cursor: "pointer",
        border: `1.5px solid ${active ? C.navy : C.gray200}`,
        background: active ? C.navyLight : "#fff",
        color:      active ? C.navy     : C.gray600,
        fontWeight: active ? 500        : 400,
      }}
    >
      {label}
    </span>
  );
}

// ─── CharBadge ───────────────────────────────────────────────────────

export function CharBadge({ n }) {
  if (!n) return null;
  const color = n < 300 ? C.red : n <= 600 ? C.amber : n <= 1500 ? C.green : C.red;
  const label = n < 300 ? "Trop court" : n <= 600 ? "Court ✓" : n <= 1500 ? "Sweet spot ✓" : "Trop long";
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, color,
      background: `${color}18`, padding: "2px 8px", borderRadius: 6,
    }}>
      {n} — {label}
    </span>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 9999,
      background: C.gray900, color: "#fff",
      padding: "10px 16px", borderRadius: 10,
      fontSize: 13, fontWeight: 500, maxWidth: 300,
      pointerEvents: "none",
    }}>
      {message}
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────

export function Empty({ icon, text, btnLabel, onBtn }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <p style={{ color: C.gray400, fontSize: 14, marginBottom: 16 }}>{text}</p>
      {onBtn && <Btn onClick={onBtn}>{btnLabel}</Btn>}
    </div>
  );
}

// ─── ScoreBar (Analyser) ─────────────────────────────────────────────

export function ScoreBar({ label, note }) {
  const color = (note || 0) >= 7 ? C.green : (note || 0) >= 5 ? C.amber : C.red;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color }}>{note}/10</span>
      </div>
      <div style={{ height: 4, background: C.gray100, borderRadius: 10 }}>
        <div style={{ height: 4, borderRadius: 10, width: `${(note || 0) * 10}%`, background: color }} />
      </div>
    </div>
  );
}
