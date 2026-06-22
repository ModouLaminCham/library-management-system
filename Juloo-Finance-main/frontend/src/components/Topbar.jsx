import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const pageTitles = {
  "/dashboard": { title: "Dashboard", icon: "bi-grid-1x2" },
  "/accounts": { title: "Accounts", icon: "bi-credit-card" },
  "/transactions": { title: "Transactions", icon: "bi-arrow-left-right" },
  "/loans": { title: "Loans", icon: "bi-cash-stack" },
  "/create-account": { title: "Create Account", icon: "bi-plus-circle" },
};

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const dropdownRef = useRef(null);

  const page = pageTitles[location.pathname] || { title: "Dashboard", icon: "bi-grid-1x2" };

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div
      className="d-flex align-items-center justify-content-between px-4"
      style={{
        height: 60,
        background: "#fff",
        borderBottom: "0.5px solid #E2E8F0",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* PAGE TITLE */}
      <div className="d-flex align-items-center gap-2">
        <i
          className={`bi ${page.icon}`}
          style={{ fontSize: 16, color: "#1E3A8A" }}
        ></i>
        <span className="fw-semibold" style={{ fontSize: 14 }}>{page.title}</span>
      </div>

      {/* RIGHT SIDE */}
      <div className="d-flex align-items-center gap-2">

        {/* NOTIFICATION BELL */}
        <button
          className="btn d-flex align-items-center justify-content-center rounded-3"
          style={{
            width: 36,
            height: 36,
            background: "#F8FAFC",
            border: "0.5px solid #E2E8F0",
          }}
        >
          <i className="bi bi-bell" style={{ fontSize: 15, color: "#64748B" }}></i>
        </button>

        {/* USER DROPDOWN */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3"
            style={{
              background: "#F8FAFC",
              border: "0.5px solid #E2E8F0",
              fontSize: 13,
            }}
            onClick={() => setOpen((v) => !v)}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle text-white fw-semibold"
              style={{ width: 26, height: 26, background: "#1E3A8A", fontSize: 11 }}
            >
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="d-none d-md-inline" style={{ color: "#0F172A" }}>
              {user?.username || "User"}
            </span>
            <i
              className="bi bi-chevron-down"
              style={{ fontSize: 11, color: "#64748B" }}
            ></i>
          </button>

          {open && (
            <div
              className="bg-white rounded-3 py-1"
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                width: 180,
                border: "0.5px solid #E2E8F0",
                zIndex: 200,
              }}
            >
              <div
                className="px-3 py-2"
                style={{ borderBottom: "0.5px solid #F1F5F9" }}
              >
                <div className="fw-semibold" style={{ fontSize: 13 }}>
                  {user?.username || "User"}
                </div>
                <div className="text-secondary" style={{ fontSize: 11 }}>
                  Personal account
                </div>
              </div>

              {[
                { icon: "bi-grid-1x2", label: "Dashboard", path: "/dashboard" },
                { icon: "bi-person", label: "Profile", path: "/accounts" },
              ].map(({ icon, label, path }) => (
                <button
                  key={label}
                  className="btn d-flex align-items-center gap-2 w-100 px-3 py-2 rounded-0"
                  style={{ fontSize: 13, color: "#0F172A", background: "transparent", border: "none" }}
                  onClick={() => { navigate(path); setOpen(false); }}
                >
                  <i className={`bi ${icon}`} style={{ fontSize: 14, color: "#64748B" }}></i>
                  {label}
                </button>
              ))}

              <div style={{ borderTop: "0.5px solid #F1F5F9" }}>
                <button
                  className="btn d-flex align-items-center gap-2 w-100 px-3 py-2 rounded-0"
                  style={{ fontSize: 13, color: "#DC2626", background: "transparent", border: "none" }}
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-left" style={{ fontSize: 14 }}></i>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}