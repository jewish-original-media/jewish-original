import { ImageResponse } from "next/og";

export const alt = "Jewish Original Media";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#2e3460",
        color: "#fbf8f1",
        padding: "72px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 72,
          height: 3,
          backgroundColor: "#d29046",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#eee0cb",
          }}
        >
          Jewish Original Media
        </div>
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            fontFamily: "Georgia, Times New Roman, serif",
            maxWidth: 900,
          }}
        >
          Remember, rebuild, and create.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 24,
          color: "#eee0cb",
          letterSpacing: "-0.01em",
        }}
      >
        History, culture, education, connection, and identity.
      </div>
    </div>,
    size,
  );
}
