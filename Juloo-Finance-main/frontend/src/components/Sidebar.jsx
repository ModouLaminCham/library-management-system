import { useLocation, useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const navItems = [
  { path: "/dashboard", icon: "bi-grid-1x2", label: "Dashboard" },
  { path: "/accounts", icon: "bi-credit-card", label: "Accounts" },
  { path: "/transactions", icon: "bi-arrow-left-right", label: "Transactions" },
  { path: "/loans", icon: "bi-cash-stack", label: "Loans" },
  { path: "/create-account", icon: "bi-plus-circle", label: "Create Account" },
];

export default function Sidebar({ hasAccount }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div
        className="d-none d-md-flex flex-column"
        style={{
          width: 220,
          minHeight: "100vh",
          background: "#0F172A",
          borderRight: "0.5px solid #1E293B",
          flexShrink: 0,
        }}
      >
        {/* BRAND */}
        <div
          className="d-flex align-items-center gap-2 px-4 py-3"
          style={{ borderBottom: "0.5px solid #1E293B" }}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 32, height: 32, background: "#1E3A8A" }}
          >
            <i className="bi bi-bank text-white" style={{ fontSize: 15 }}></i>
          </div>
          <div>
            <div className="text-white fw-semibold" style={{ fontSize: 13 }}>Juloo Finance</div>
            <div style={{ fontSize: 10, color: "#64748B" }}>Digital banking</div>
          </div>
        </div>

        {/* NAV ITEMS */}
        <div className="d-flex flex-column p-3 gap-1 flex-grow-1">
          {navItems.map(({ path, icon, label }) => {
            if (!hasAccount && ["/accounts", "/transactions", "/loans"].includes(path)) return null;
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none"
                style={{
                  fontSize: 13,
                  color: active ? "#fff" : "#94A3B8",
                  background: active ? "#1E293B" : "transparent",
                  borderRight: active ? "2px solid #3B82F6" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <i className={`bi ${icon}`} style={{ fontSize: 16 }}></i>
                {label}
              </Link>
            );
          })}
        </div>

        {/* LOGOUT */}
        <div className="p-3" style={{ borderTop: "0.5px solid #1E293B" }}>
          <button
            className="btn d-flex align-items-center gap-2 w-100 px-3 py-2 rounded-3"
            style={{
              fontSize: 13,
              color: "#94A3B8",
              background: "transparent",
              border: "none",
              textAlign: "left",
            }}
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left" style={{ fontSize: 16 }}></i>
            Logout
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div
        className="d-flex d-md-none align-items-center justify-content-around"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "#0F172A",
          borderTop: "0.5px solid #1E293B",
          zIndex: 100,
        }}
      >
        {navItems.filter(({ path }) =>
          hasAccount ? path !== "/create-account" : path === "/dashboard" || path === "/create-account"
        ).map(({ path, icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="d-flex flex-column align-items-center text-decoration-none"
              style={{ color: active ? "#3B82F6" : "#64748B", fontSize: 10 }}
            >
              <i className={`bi ${icon}`} style={{ fontSize: 20 }}></i>
              {label}
            </Link>
          );
        })}
        <button
          className="d-flex flex-column align-items-center border-0 bg-transparent"
          style={{ color: "#64748B", fontSize: 10 }}
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-left" style={{ fontSize: 20 }}></i>
          Logout
        </button>
      </div>
    </>
  );
}