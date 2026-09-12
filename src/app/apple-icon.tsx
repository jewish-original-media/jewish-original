import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2e3460",
        color: "#eee0cb",
        fontSize: 72,
        letterSpacing: "0.06em",
        fontFamily: "Georgia, Times New Roman, serif",
      }}
    >
      JO
    </div>,
    size,
  );
}
