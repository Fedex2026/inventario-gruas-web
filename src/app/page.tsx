export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #163b73 0%, #0b1730 35%, #050b16 100%)",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            borderRadius: "22px",
            padding: "18px 22px",
            marginBottom: "28px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 12px #22c55e",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                color: "#93c5fd",
                fontWeight: "bold",
                letterSpacing: "1px",
              }}
            >
              SISTEMA ACTIVO
            </span>
          </div>

          <h1
            style={{
              fontSize: "46px",
              margin: "0 0 10px 0",
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            Inventario Grúas Web
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#cbd5e1",
              maxWidth: "760px",
              lineHeight: 1.6,
            }}
          >
            Plataforma de control para mantenimiento, historial mecánico,
            seguimiento de fallas y administración de unidades de grúas.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "20px",
              padding: "22px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.20)",
            }}
          >
            <div style={{ fontSize: "13px", color: "#93c5fd", marginBottom: "8px" }}>
              MÓDULO
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              Mantenimientos
            </div>
            <div style={{ color: "#cbd5e1", marginTop: "8px", fontSize: "15px" }}>
              Registro y seguimiento de servicios, reparaciones y costos.
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "20px",
              padding: "22px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.20)",
            }}
          >
            <div style={{ fontSize: "13px", color: "#93c5fd", marginBottom: "8px" }}>
              CONTROL
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              Historial por unidad
            </div>
            <div style={{ color: "#cbd5e1", marginTop: "8px", fontSize: "15px" }}>
              Consulta de fallas, cambios de piezas, costos y fechas por grúa.
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "20px",
              padding: "22px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.20)",
            }}
          >
            <div style={{ fontSize: "13px", color: "#93c5fd", marginBottom: "8px" }}>
              ADMINISTRACIÓN
            </div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              Reporte profesional
            </div>
            <div style={{ color: "#cbd5e1", marginTop: "8px", fontSize: "15px" }}>
              Visualización clara para controlar depositado, gastado, cambio y refacciones.
            </div>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(34,197,94,0.12))",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "24px",
            padding: "30px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          }}
        >
          <h2
            style={{
              margin: "0 0 12px 0",
              fontSize: "30px",
              fontWeight: "bold",
            }}
          >
            Acceso rápido
          </h2>

          <p
            style={{
              margin: "0 0 24px 0",
              color: "#dbeafe",
              fontSize: "16px",
              lineHeight: 1.6,
              maxWidth: "700px",
            }}
          >
            Entra directamente al módulo para registrar un nuevo mantenimiento
            y llevar el control mecánico de tus grúas de forma profesional.
          </p>

          <a href="/dashboard/mantenimientos/nuevo" style={{ textDecoration: "none" }}>
            <button
              style={{
                background: "linear-gradient(90deg, #2563eb, #22c55e)",
                color: "#fff",
                border: "none",
                padding: "14px 26px",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
              }}
            >
              Registrar mantenimiento
            </button>
          </a>
        </div>
      </div>
    </main>
  );
}