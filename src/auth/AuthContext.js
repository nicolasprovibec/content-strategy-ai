import { createContext, useContext, useEffect, useState } from "react";
import netlifyIdentity from "netlify-identity-widget";
import { ALLOWED_DOMAIN } from "../constants";
import { storage } from "../services/storage";

// ─── Contexte ───────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ───────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Vérifie que l'email appartient au domaine autorisé
  function isAllowed(netlifyUser) {
    return netlifyUser?.email?.endsWith(ALLOWED_DOMAIN) ?? false;
  }

  // Connexion via Google SSO
  function login() {
    setError(null);
    netlifyIdentity.open("login");
  }

  // Déconnexion + purge localStorage
  function logout() {
    netlifyIdentity.logout();
    storage.clear();
    setUser(null);
  }

  useEffect(() => {
    // Initialisation du widget
    netlifyIdentity.init({ logo: false });

    // Utilisateur déjà connecté au chargement
    const current = netlifyIdentity.currentUser();
    if (current) {
      if (isAllowed(current)) {
        setUser(current);
      } else {
        netlifyIdentity.logout();
        setError(`Accès réservé aux adresses ${ALLOWED_DOMAIN}.`);
      }
    }
    setLoading(false);

    // Événement : connexion réussie
    netlifyIdentity.on("login", (netlifyUser) => {
      netlifyIdentity.close();
      if (isAllowed(netlifyUser)) {
        setUser(netlifyUser);
        setError(null);
      } else {
        netlifyIdentity.logout();
        setError(`Accès réservé aux adresses ${ALLOWED_DOMAIN}.`);
      }
    });

    // Événement : déconnexion
    netlifyIdentity.on("logout", () => {
      setUser(null);
    });

    return () => {
      netlifyIdentity.off("login");
      netlifyIdentity.off("logout");
    };
  }, []);

  const value = { user, loading, error, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider.");
  return ctx;
}
window.AuthProvider = AuthProvider;
window.useAuth = useAuth;
