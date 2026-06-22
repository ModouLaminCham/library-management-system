export default function Services() {
  const features = [
    {
      icon: "bi-bank",
      title: "Account Management",
      description:
        "Open and manage savings, current, and business accounts with real-time balance updates and insights.",
    },
    {
      icon: "bi-arrow-left-right",
      title: "Secure Transfers",
      description:
        "Send and receive money instantly with encrypted and secure transaction processing.",
    },
    {
      icon: "bi-cash-stack",
      title: "Loan Services",
      description:
        "Apply for personal and business loans with fast approval tracking and repayment plans.",
    },
    {
      icon: "bi-credit-card",
      title: "Debit & Cards",
      description:
        "Manage virtual and physical debit cards with spending controls and transaction alerts.",
    },
    {
      icon: "bi-graph-up",
      title: "Financial Analytics",
      description:
        "Track spending patterns, savings growth, and financial performance through smart dashboards.",
    },
    {
      icon: "bi-shield-lock",
      title: "Advanced Security",
      description:
        "Multi-layer security including JWT authentication, encryption, and fraud protection systems.",
    },
  ];

  return (
    <section
      style={{
        padding: "80px 40px",
        backgroundColor: "#F8FAFC",
      }}
    >
      {/* TITLE */}
      <h2
        style={{
          textAlign: "center",
          marginBottom: "12px",
          fontSize: "34px",
          color: "#0F172A",
          fontWeight: "700",
        }}
      >
        Banking Services Designed for You
      </h2>

      <p
        style={{
          textAlign: "center",
          marginBottom: "50px",
          color: "#64748B",
          fontSize: "16px",
        }}
      >
        Experience secure, fast, and intelligent digital banking solutions built for modern financial needs.
      </p>

      {/* CARDS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "28px",
          flexWrap: "wrap",
        }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "white",
              padding: "30px",
              width: "300px",
              borderRadius: "14px",
              textAlign: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
              border: "1px solid rgba(30,58,138,0.08)",
              transition: "0.3s ease",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow =
                "0 14px 30px rgba(30,58,138,0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(0,0,0,0.06)";
            }}
          >
            {/* ICON */}
            <i
              className={`bi ${feature.icon}`}
              style={{
                fontSize: "40px",
                color: "#1E3A8A",
                marginBottom: "14px",
                display: "block",
              }}
            />

            {/* TITLE */}
            <h3
              style={{
                marginBottom: "10px",
                fontSize: "18px",
                fontWeight: "600",
                color: "#0F172A",
              }}
            >
              {feature.title}
            </h3>

            {/* DESCRIPTION */}
            <p
              style={{
                color: "#64748B",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}