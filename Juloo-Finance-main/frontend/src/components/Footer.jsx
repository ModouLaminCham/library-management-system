export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "30px 20px",
        background: "linear-gradient(135deg, #0F172A, #1E3A8A)",
        color: "#CBD5E1",
        fontSize: "14px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Brand Section */}
        <div>
          <h2 style={{ color: "#FFFFFF", marginBottom: "8px" }}>
            Juloo Finance
          </h2>
          <p style={{ maxWidth: "300px", lineHeight: "1.5" }}>
A modern digital banking experience built for speed, security, and effortless financial management          </p>
        </div>

        {/* Links Section */}
        <div>
          <h3 style={{ color: "#FFFFFF", marginBottom: "10px" }}>Quick Links</h3>
          <p>Dashboard</p>
          <p>Accounts</p>
          <p>Transactions</p>
          <p>Loans</p>
        </div>

        {/* Support Section */}
        <div>
          <h3 style={{ color: "#FFFFFF", marginBottom: "10px" }}>Support</h3>
          <p>Help Center</p>
          <p>Security</p>
          <p>Contact Us</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          marginTop: "25px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "15px",
          textAlign: "center",
          color: "#94A3B8",
        }}
      >
        <p>© 2026 Juloo Finance. All rights reserved.</p>
        <p style={{ fontSize: "12px", marginTop: "5px" }}>
          This is a demo application created for educational purposes.
        </p>
      </div>
    </footer>
  );
}