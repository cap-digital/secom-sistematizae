"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f3ead7",
          fontFamily: "system-ui, sans-serif",
          color: "#2a2017",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h2 style={{ fontWeight: 800 }}>Erro inesperado</h2>
          <p style={{ color: "#6b5d4b", fontSize: 14 }}>
            Recarregue a página para continuar.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              border: 0,
              borderRadius: 16,
              background: "#c8472a",
              color: "#f3ead7",
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
