import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/constants";

export const alt = `${SITE_NAME} — ${SITE_DESCRIPTION}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-wide Open Graph image (spec §6) — colocated with the root layout so
 * every route without its own image picks it up automatically.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FBE9EF",
        color: "#372A33",
        padding: 80,
      }}
    >
      <div
        style={{
          fontSize: 24,
          letterSpacing: 10,
          textTransform: "uppercase",
          color: "#A64560",
          marginBottom: 28,
        }}
      >
        Soft essentials for slow mornings
      </div>
      <div style={{ fontSize: 112, fontWeight: 700, marginBottom: 28 }}>{SITE_NAME}</div>
      <div style={{ width: 320, height: 3, backgroundColor: "#DE8096", marginBottom: 32 }} />
      <div
        style={{
          fontSize: 34,
          color: "#5B4853",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        Pajama sets · Cozy bedding · Vanity pieces · Little gifts
      </div>
    </div>,
    { ...size },
  );
}
