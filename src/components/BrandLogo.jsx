export default function BrandLogo({ size = 44 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full no-select"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg,#d4b270,#b8954a)",
        color: "#050b1a", fontWeight: 800, letterSpacing: ".5px",
        boxShadow: "0 6px 20px rgba(212,178,112,.25)",
      }}
    >
      HCR
    </div>
  );
}
