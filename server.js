import express from "express";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (dotenv not required)
try {
  const envPath = resolve(__dirname, ".env.local");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local optional
}

const app = express();
app.use(express.json({ limit: "20mb" }));

function dataUrlToBuffer(dataUrl) {
  const [header, b64] = dataUrl.split(",");
  const mediaType = header.match(/:(.*?);/)?.[1] || "image/png";
  const buf = Buffer.from(b64, "base64");
  return { buf, mediaType };
}

function bufferToBlob(buf, mediaType) {
  return new Blob([buf], { type: mediaType });
}

app.post("/api/image", async (req, res) => {
  const { prompt, size, productPhoto, styleImages } = req.body || {};

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Kein Prompt angegeben." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "") {
    return res.status(500).json({ error: "OPENAI_API_KEY nicht konfiguriert." });
  }

  const refImages = [
    ...(productPhoto ? [{ dataUrl: productPhoto, role: "product" }] : []),
    ...((Array.isArray(styleImages) ? styleImages : []).slice(0, 3).map((d) => ({ dataUrl: d, role: "style" }))),
  ];

  try {
    let openaiRes;

    if (refImages.length > 0) {
      // Build composed prompt
      const parts = [];
      if (refImages.some((r) => r.role === "product")) {
        parts.push("Bild 1 zeigt das zu bewerbende Produkt — bewahre seine Identität, Form und Markenelemente exakt.");
      }
      if (refImages.some((r) => r.role === "style")) {
        parts.push("Die weiteren Bilder sind reine Stil-Referenzen für Look, Farbwelt, Komposition und Bildsprache — übernimm den Stil, nicht ihren Inhalt.");
      }
      parts.push("Art-Direction (neurologisch begründet): " + prompt.trim());
      const composedPrompt = parts.join(" ");

      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", composedPrompt);
      form.append("n", "1");
      form.append("size", size || "1024x1536");

      for (const ref of refImages) {
        const { buf, mediaType } = dataUrlToBuffer(ref.dataUrl);
        const ext = mediaType.split("/")[1] || "png";
        form.append("image[]", bufferToBlob(buf, mediaType), `ref.${ext}`);
      }

      openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
    } else {
      openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: prompt.trim(),
          n: 1,
          size: size || "1024x1536",
        }),
      });
    }

    if (!openaiRes.ok) {
      let detail = "";
      try { detail = (await openaiRes.json())?.error?.message || ""; } catch {}
      return res.status(502).json({ error: `OpenAI-Fehler (${openaiRes.status})${detail ? ": " + detail : ""}` });
    }

    const data = await openaiRes.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return res.status(502).json({ error: "Kein Bild in der OpenAI-Antwort." });

    return res.json({ image: b64 });
  } catch (e) {
    return res.status(500).json({ error: "Interner Fehler beim Bildabruf." });
  }
});

const PORT = process.env.IMAGE_SERVER_PORT || 3001;
app.listen(PORT, () => console.log(`NeuroLab image-server running on http://localhost:${PORT}`));
