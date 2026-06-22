import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav
        className="d-flex align-items-center justify-content-between px-4 px-md-5"
        style={{ height: 64, background: "#0F172A", position: "sticky", top: 0, zIndex: 100 }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 36, height: 36, background: "#1E3A8A" }}
          >
            <i className="bi bi-bank text-white" style={{ fontSize: 16 }}></i>
          </div>
          <span className="fw-semibold text-white" style={{ fontSize: 15 }}>Juloo Finance</span>
        </div>

        <div className="d-none d-md-flex align-items-center gap-4">
          {["Services", "About", "Contact"].map((item) => (
            <span
              key={item}
              style={{ fontSize: 13, color: "#94A3B8", cursor: "pointer" }}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-link text-decoration-none"
            style={{ fontSize: 13, color: "#94A3B8" }}
            onClick={() => navigate("/auth")}
          >
            Login
          </button>
          <button
            className="btn text-white"
            style={{ background: "#1E3A8A", fontSize: 13, padding: "7px 18px" }}
            onClick={() => navigate("/auth")}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div
        className="d-flex flex-column align-items-center justify-content-center text-center px-4"
        style={{ background: "#0F172A", padding: "80px 0 100px" }}
      >
        <div
          className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4"
          style={{ background: "#1E293B", color: "#93C5FD", fontSize: 12 }}
        >
          <i className="bi bi-shield-check"></i> Trusted digital banking in The Gambia
        </div>

        <h1
          className="fw-semibold text-white mb-3"
          style={{ fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1.25, maxWidth: 600 }}
        >
          Modern Banking for{" "}
          <span style={{ color: "#3B82F6" }}>The Gambia</span>
        </h1>

        <p
          className="mb-5"
          style={{ fontSize: 15, color: "#94A3B8", maxWidth: 460, lineHeight: 1.7 }}
        >
          Send money, apply for loans, and manage your finances — all in one secure and easy-to-use platform.
        </p>

        <div className="d-flex gap-3 flex-wrap justify-content-center">
          <button
            className="btn text-white px-4 py-2"
            style={{ background: "#1E3A8A", fontSize: 14 }}
            onClick={() => navigate("/auth")}
          >
            Open an account
          </button>
          <button
            className="btn px-4 py-2"
            style={{
              background: "transparent",
              border: "0.5px solid #334155",
              color: "#94A3B8",
              fontSize: 14,
            }}
            onClick={() => navigate("/auth")}
          >
            Learn more
          </button>
        </div>

        {/* STATS ROW */}
        <div
          className="d-flex gap-4 gap-md-5 mt-5 pt-4 flex-wrap justify-content-center"
          style={{ borderTop: "0.5px solid #1E293B" }}
        >
          {[
            ["10,000+", "Active customers"],
            ["GMD 2M+", "Transacted"],
            ["99.9%", "Uptime"],
            ["256-bit", "SSL encryption"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="fw-semibold text-white" style={{ fontSize: 18 }}>{val}</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div className="px-4 px-md-5 py-5">
        <div className="text-center mb-5">
          <h2 className="fw-semibold mb-2" style={{ fontSize: 24 }}>Everything you need</h2>
          <p className="text-secondary" style={{ fontSize: 14 }}>
            Simple, secure financial services built for everyone.
          </p>
        </div>

        <div className="row g-3 justify-content-center" style={{ maxWidth: 900, margin: "0 auto" }}>
          {[
            {
              icon: "bi-credit-card",
              title: "Bank accounts",
              desc: "Open a personal or business account in minutes with no hidden fees.",
            },
            {
              icon: "bi-arrow-left-right",
              title: "Instant transfers",
              desc: "Send and receive money instantly to anyone, anywhere securely.",
            },
            {
              icon: "bi-cash-stack",
              title: "Loans",
              desc: "Apply for personal or business loans with transparent interest rates.",
            },
            {
              icon: "bi-graph-up",
              title: "Financial overview",
              desc: "Track your spending, income, and loans all in one dashboard.",
            },
            {
              icon: "bi-shield-lock",
              title: "Secure & private",
              desc: "Your data is protected with bank-grade 256-bit SSL encryption.",
            },
            {
              icon: "bi-phone",
              title: "Mobile friendly",
              desc: "Access your account from any device, anytime, anywhere.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="col-12 col-sm-6 col-md-4">
              <div
                className="bg-white rounded-3 p-4 h-100"
                style={{ border: "0.5px solid #E2E8F0" }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                  style={{ width: 42, height: 42, background: "#EFF6FF" }}
                >
                  <i className={`bi ${icon}`} style={{ fontSize: 20, color: "#1E3A8A" }}></i>
                </div>
                <div className="fw-semibold mb-2" style={{ fontSize: 14 }}>{title}</div>
                <div className="text-secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div
        className="mx-4 mx-md-5 rounded-4 p-5 text-center mb-5"
        style={{ background: "#0F172A" }}
      >
        <h3 className="fw-semibold text-white mb-2" style={{ fontSize: 22 }}>
          Ready to get started?
        </h3>
        <p className="mb-4" style={{ fontSize: 14, color: "#94A3B8" }}>
          Join thousands of Gambians managing their finances with Juloo Finance.
        </p>
        <button
          className="btn text-white px-5 py-2"
          style={{ background: "#1E3A8A", fontSize: 14 }}
          onClick={() => navigate("/auth")}
        >
          Open a free account
        </button>
      </div>

      {/* FOOTER */}
      <div
        className="px-4 px-md-5 py-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
        style={{ borderTop: "0.5px solid #E2E8F0" }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 28, height: 28, background: "#1E3A8A" }}
          >
            <i className="bi bi-bank text-white" style={{ fontSize: 13 }}></i>
          </div>
          <span className="fw-semibold" style={{ fontSize: 13 }}>Juloo Finance</span>
        </div>
        <p className="text-secondary mb-0" style={{ fontSize: 12 }}>
          © 2026 Juloo Finance. All rights reserved.
        </p>
        <div className="d-flex gap-3">
          {["Privacy", "Terms", "Contact"].map((item) => (
            <span key={item} className="text-secondary" style={{ fontSize: 12, cursor: "pointer" }}>
              {item}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}