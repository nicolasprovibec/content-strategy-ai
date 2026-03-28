import { useAuth } from "../../auth/AuthContext";
import { NAV_ITEMS } from "../../constants";
import { C } from "../ui";

export function NavBar({ activeTab, onTabChange, postCount, insightCount }) {
  const { user, logout } = useAuth();

  const initials = user?.email?.[0]?.toUpperCase() ?? "?";
  const displayName = user?.user_metadata?.full_name || user?.email || "Profil";

  return (
    <nav style={{
      height: 56,
      borderBottom: `0.5px solid ${C.gray200}`,
      display: "flex", alignItems: "center",
      padding: "0 1.25rem", gap: 6,
      background: "#fff", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0, marginRight: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: C.navy,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.gray900, lineHeight: 1 }}>
            Content Strategy AI
          </div>
          <div style={{ fontSize: 10, color: C.gray400, marginTop: 1 }}>
            Powered by Claude
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const count = item.id === "mesposts" ? postCount
                      : item.id === "insights"  ? insightCount
                      : 0;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 12,
                background: isActive ? C.navyLight : "transparent",
                color:      isActive ? C.navy      : C.gray400,
                fontWeight: isActive ? 500          : 400,
                whiteSpace: "nowrap", border: "none",
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              {item.label}
              {count > 0 && (
                <span style={{
                  background: C.navy, color: "#fff",
                  borderRadius: 10, padding: "1px 5px", fontSize: 9,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Avatar + déconnexion */}
      <button
        onClick={logout}
        title="Se déconnecter"
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "5px 10px", borderRadius: 10,
          border: `0.5px solid ${C.gray200}`, background: "#fff",
          cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: C.navy, color: "#fff",
          fontSize: 10, fontWeight: 500,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {initials}
        </div>
        <span style={{
          fontSize: 12, color: C.gray900,
          maxWidth: 120, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {displayName}
        </span>
      </button>
    </nav>
  );
}
window.NavBar = NavBar;
