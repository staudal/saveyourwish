import { ImageResponse } from "@vercel/og";
import Image from "next/image";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(45deg, #2563eb, #3b82f6, #60a5fa)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "40px",
              position: "relative",
              width: "100%",
              height: "100%",
              justifyContent: "center",
            }}
          >
            {/* Background decorative circles */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                width: "300px",
                height: "300px",
                background: "linear-gradient(45deg, #ec4899 30%, #8b5cf6)",
                borderRadius: "50%",
                filter: "blur(60px)",
                opacity: "0.6",
                transform: "translateY(-50%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "20%",
                right: "10%",
                width: "200px",
                height: "200px",
                background: "linear-gradient(45deg, #8b5cf6, #6366f1)",
                borderRadius: "50%",
                filter: "blur(60px)",
                opacity: "0.5",
              }}
            />

            {/* Content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Image
                src="https://saveyourwish.com/logo_white.svg"
                alt="Logo"
                width="120"
                height="120"
                style={{ marginBottom: "24px" }}
              />
              <h1
                style={{
                  fontSize: "80px",
                  fontWeight: "bold",
                  color: "white",
                  margin: "0",
                  textAlign: "center",
                  lineHeight: "1",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                SaveYourWish
              </h1>
              <p
                style={{
                  fontSize: "36px",
                  color: "white",
                  margin: "24px 0 0 0",
                  textAlign: "center",
                  opacity: "0.9",
                  maxWidth: "700px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                Create and Share Wishlists with Style
              </p>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
