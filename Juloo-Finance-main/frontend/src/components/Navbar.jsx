import logo from "../assets/logo.jpg";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        padding: "14px 32px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      {/* LEFT SIDE - LOGO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <img
          src={logo}
          alt="Global Bank of India logo"
          style={{
            height: "34px",
            width: "34px",
            objectFit: "contain",
          }}
        />

        <span
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#1E3A8A",
          }}
        >
Juloo Finance  </span>
      </div>

      {/* CENTER LINKS */}
      <div
        style={{
          display: "flex",
          gap: "22px",
          fontSize: "14px",
          color: "#374151",
          fontWeight: "500",
        }}
      >
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Home
        </span>

        <span style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          Dashboard
        </span>

        <span style={{ cursor: "pointer" }} onClick={() => navigate("/accounts")}>
          Accounts
        </span>

        <span style={{ cursor: "pointer" }} onClick={() => navigate("/loans")}>
          Loans
        </span>
      </div>

      {/* RIGHT SIDE - BUTTON */}
      <div>
        <button
          onClick={() => navigate("/auth")}
          style={{
            padding: "8px 18px",
            backgroundColor: "#1E3A8A",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(30,58,138,0.3)",
            transition: "0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor = "#2563EB")
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = "#1E3A8A")
          }
        >
          Login
        </button>
      </div>
    </nav>
  );
}