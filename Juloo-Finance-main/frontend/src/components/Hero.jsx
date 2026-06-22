import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "60px 20px",

        /* 🌄 BACKGROUND IMAGE SECTION */
        backgroundImage: "url('https://images.unsplash.com/photo-1601597111158-2fceff292cdc')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        position: "relative",
        color: "white",
        minHeight: "90vh",
      }}
    >
      {/* 🔲 DARK OVERLAY (IMPORTANT FOR READABILITY) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(15, 23, 42, 0.75)",
          zIndex: 1,
        }}
      />

      {/* CONTENT */}
      <div style={{ position: "relative", zIndex: 2 }}>
        
        {/* Badge */}
        <div
          style={{
            background: "rgba(59,130,246,0.2)",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            marginBottom: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "inline-block",
          }}
        >
          Secure Digital Banking Platform
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "48px", marginBottom: "16px" }}>
          Juloo
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "18px",
            color: "#CBD5E1",
            marginBottom: "10px",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          A modern digital banking experience built for speed, security, and effortless financial management.
        </p>

        {/* Trust line */}
        <p
          style={{
            fontSize: "14px",
            color: "#94A3B8",
            marginBottom: "32px",
          }}
        >
          Trusted by thousands of users for safe and reliable banking operations.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/auth")}
          style={{
            padding: "14px 40px",
            backgroundColor: "#3B82F6",
            border: "none",
            borderRadius: "10px",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 10px 25px rgba(59,130,246,0.3)",
            transition: "0.3s ease",
          }}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor = "#2563EB")
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = "#3B82F6")
          }
        >
          Get Started
        </button>

      </div>
    </section>
  );
}
<section style={{ position: "relative", zIndex: 2 }}></section>
