export default function Marquee() {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #0F172A, #1E3A8A)",
        overflow: "hidden",
        whiteSpace: "nowrap",
        color: "#E2E8F0",
        fontSize: "14px",
        padding: "10px 0",
        fontWeight: "500",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        className="marquee-text"
        style={{
          display: "inline-block",
          paddingLeft: "100%",
          animation: "scrollText 20s linear infinite",
        }}
      >
        <span> Secure Digital Banking</span>
        <span style={{ margin: "0 25px" }}>•</span>

        <span> Fast Transactions</span>
        <span style={{ margin: "0 25px" }}>•</span>

        <span> Loan Services Available</span>
        <span style={{ margin: "0 25px" }}>•</span>

        <span>Real-Time Account Tracking</span>
        <span style={{ margin: "0 25px" }}>•</span>

        <span>24/7 Online Banking Access</span>
      </div>

      <style>
        {`
          @keyframes scrollText {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }

          .marquee-text:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </div>
  );
}