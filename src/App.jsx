import React, { useMemo, useRef, useState } from "react";
import logoProvoid from "./Logo-provoid.png";
import {
  Compass, SlidersHorizontal, Palette, FlaskConical, FileText,
  ArrowRight, ArrowLeft, Download, Printer, Crosshair, Info,
  Sparkles, ImagePlus, X, AlertCircle,
  Megaphone, Camera as Instagram, Image as ImageIcon, ClipboardList, Copy, Check, Wand2,
} from "lucide-react";

/* ============================================================================
   NeuroLab — Loop-Prototyp v3
     [1] FRAMEWORK-CONFIG  – Single Source of Truth
     [2] ENGINE            – reine, deterministische Funktionen = das Lineal
     [3] KI-WAHRNEHMUNG    – Claude liest Material + Zielgruppe → Ist/Soll
     [4] KI-GENERIERUNG    – Neuro-Brief → Deliverables (Claude), Bild-Slot vorbereitet
     [5] UI                – geführter Loop + One-Pager
   ========================================================================== */

/* ----------------------------------------------------------------------------
   [1] FRAMEWORK-CONFIG
---------------------------------------------------------------------------- */
const SYSTEMS = {
  SEEKING: {
    id: "SEEKING", tagline: "entdecken", color: "#10B981",
    treiber: "Exploration, Antizipation, Neugier", gefuehl: "der Wunsch zu entdecken",
    marken: ["Apple", "Tesla", "Red Bull"],
    centroid: { a: 9, z: 4.5 },
    soll: { aktivierung: [8, 10], zielstrebigkeit: [3, 6], ueberraschung: [8, 10] },
    sensorik: {
      farbe: "hohe Sättigung, hoher Kontrast, Signalfarben",
      form: "Anschnitt, Unvollständigkeit, Lücken",
      bewegung: "Richtungswechsel, Zoom, schnelle Cuts",
      sound: "Rhythmus, Aufbau, Drops",
      ton: "unerwarteter Wechsel, steigende Spannung",
      timing: "Variation in wiedererkennbarer Struktur",
      interaktion: "sofortiges Feedback, kleine Belohnungen",
    },
  },
  LUST: {
    id: "LUST", tagline: "begehren", color: "#E11D48",
    treiber: "Anziehung, Begehren, Status", gefuehl: "der Wunsch zu begehren",
    marken: ["Coca-Cola", "SKIMS"],
    centroid: { a: 7.5, z: 5.5 },
    soll: { aktivierung: [6, 9], zielstrebigkeit: [4, 7], ueberraschung: [4, 7] },
    sensorik: {
      farbe: "warme Tiefe, Rot/Gold/Creme, Schwarz",
      form: "Rundungen, Symmetrie, Close-ups",
      bewegung: "langsam, fließend, Enthüllung",
      sound: "Basswärme, Atem, weiche Texturen",
      ton: "tiefe Stimmen, ruhiges Tempo, Intimität",
      timing: "Verzögerung, Pause vor Reveal",
      interaktion: "hochwertige Haptik, gleitende Übergänge",
    },
  },
  CARE: {
    id: "CARE", tagline: "dazugehören", color: "#0EA5E9",
    treiber: "Bindung, Fürsorge, Zugehörigkeit", gefuehl: "der Wunsch dazuzugehören",
    marken: ["IKEA", "Patagonia", "Pampers"],
    centroid: { a: 4.5, z: 9 },
    soll: { aktivierung: [3, 6], zielstrebigkeit: [8, 10], ueberraschung: [2, 4] },
    sensorik: {
      farbe: "Pastell, Blau, warmes Weiß",
      form: "rund, einschließend, schützend",
      bewegung: "sanft, wiegend, beruhigend",
      sound: "warme Stimmen, Naturklänge",
      ton: "verlässlich, ruhig, zugewandt",
      timing: "ruhiger Rhythmus, keine Hektik",
      interaktion: "sanftes Feedback, Verlässlichkeit",
    },
  },
  PLAY: {
    id: "PLAY", tagline: "mitspielen", color: "#F59E0B",
    treiber: "Freude, Spontaneität, Interaktion", gefuehl: "der Wunsch mitzuspielen",
    marken: ["Nike", "Lego", "Duolingo"],
    centroid: { a: 7.5, z: 3 },
    soll: { aktivierung: [6, 9], zielstrebigkeit: [2, 4], ueberraschung: [4, 7] },
    sensorik: {
      farbe: "bunt, kontrastreich, überraschend",
      form: "unregelmäßig, Icons, Figuren",
      bewegung: "hüpfend, reaktiv, unvorhersehbar",
      sound: "Plops, Klicks, Lachen",
      ton: "Leichtigkeit, Freundlichkeit, Übertreibung",
      timing: "sofortiges Feedback, Loops",
      interaktion: "Tippen, Swipen, Mini-Rewards",
    },
  },
};
const SYSTEM_ORDER = ["SEEKING", "LUST", "CARE", "PLAY"];

const VARIABLES = {
  aktivierung: { label: "Aktivierung", frage: "Wie viel Energie löst der Reiz aus?", left: "ruhig, sicher", right: "energiegeladen" },
  zielstrebigkeit: { label: "Zielstrebigkeit", frage: "Wie klar ist die nächste Handlung?", left: "offen, explorativ", right: "klare CTA" },
  ueberraschung: { label: "Überraschung", frage: "Wie neu/unerwartet ist der Reiz? (= freie Energie)", left: "vertraut", right: "irritierend" },
};
const VAR_ORDER = ["aktivierung", "zielstrebigkeit", "ueberraschung"];

const HEBEL = {
  aktivierung: {
    up: "Sättigung & Kontrast anheben, schnelle Cuts/Zoom, Rhythmus & Drops, höheres Tempo",
    down: "gedämpfte Farben, langsame, fließende Bewegung, warme, ruhige Sounds",
    channels: ["farbe", "bewegung", "sound", "timing"],
  },
  zielstrebigkeit: {
    up: "klare CTA, geschlossene Formen, eindeutiges Interaktions-Feedback, klares Timing",
    down: "Anschnitt & offene Formen, explorative Navigation, mehrere Pfade",
    channels: ["form", "interaktion", "timing"],
  },
  ueberraschung: {
    up: "Anschnitt & Lücken, unerwartete Sound-/Ton-Wechsel, Timing-Variation, Reveal/Verzögerung",
    down: "Vertrautheit, Wiederholung, Symmetrie, vorhersehbares Timing",
    channels: ["form", "sound", "ton", "timing"],
  },
};

const MESS = {
  eye: { label: "Eye-Tracking", blind: "misst nicht Interesse oder Kaufabsicht" },
  facial: { label: "Facial Decoding", blind: "misst nicht die echte innere Emotion" },
  skin: { label: "Skin Response", blind: "misst nicht positiv vs. negativ" },
  eeg: { label: "EEG", blind: "misst nicht die fertige Kaufentscheidung" },
};
const TOOL_FOR = { aktivierung: "skin", zielstrebigkeit: "eye", ueberraschung: "facial" };
const MESSGROESSE = {
  aktivierung: "die körperliche Aktivierung",
  zielstrebigkeit: "die Blick-Orientierung zur Handlung",
  ueberraschung: "die Überraschungs-Reaktion im Gesicht",
};
const CHANNELS = { farbe: "Farbe", form: "Form", bewegung: "Bewegung", sound: "Sound", ton: "Ton", timing: "Timing", interaktion: "Interaktion" };

/* Deliverable-Typen für das Generierungs-Studio */
const DELIVERABLES = {
  kampagne: {
    label: "Kampagne", Icon: Megaphone, instruction: "Erzeuge ein prägnantes Kampagnenkonzept.",
    schema: `{"leitidee":"...","kernbotschaft":"...","tonalitaet":"...","massnahmen":["...","...","..."],"neuro_rationale":"..."}`,
    fields: [
      { key: "leitidee", label: "Leitidee", kind: "title" },
      { key: "kernbotschaft", label: "Kernbotschaft", kind: "para" },
      { key: "tonalitaet", label: "Tonalität", kind: "chip" },
      { key: "massnahmen", label: "Maßnahmen", kind: "bullets" },
      { key: "neuro_rationale", label: "Neuro-Bezug", kind: "muted" },
    ],
  },
  instagram: {
    label: "Instagram-Post", Icon: Instagram, instruction: "Erzeuge einen Instagram-Post.",
    schema: `{"hook":"...","caption":"...","hashtags":["...","..."],"bildidee":"...","neuro_rationale":"..."}`,
    fields: [
      { key: "hook", label: "Hook", kind: "title" },
      { key: "caption", label: "Caption", kind: "para" },
      { key: "hashtags", label: "Hashtags", kind: "chips" },
      { key: "bildidee", label: "Bild-Idee", kind: "para" },
      { key: "neuro_rationale", label: "Neuro-Bezug", kind: "muted" },
    ],
    imageKey: "bildidee",
  },
  plakat: {
    label: "Werbeplakat", Icon: ImageIcon, instruction: "Erzeuge ein Werbeplakat-Konzept.",
    schema: `{"headline":"...","subline":"...","cta":"...","art_direction":"...","bild_prompt":"...","neuro_rationale":"..."}`,
    fields: [
      { key: "headline", label: "Headline", kind: "title" },
      { key: "subline", label: "Subline", kind: "para" },
      { key: "cta", label: "Call to Action", kind: "chip" },
      { key: "art_direction", label: "Art-Direction", kind: "para" },
      { key: "bild_prompt", label: "Bild-Prompt", kind: "code" },
      { key: "neuro_rationale", label: "Neuro-Bezug", kind: "muted" },
    ],
    imageKey: "bild_prompt",
  },
  marketing: {
    label: "Marketingkonzept", Icon: ClipboardList, instruction: "Erzeuge ein kompaktes Marketingkonzept.",
    schema: `{"positionierung":"...","botschaft":"...","kanaele":["...","..."],"massnahmen":["...","..."],"erfolgsmessung":"...","neuro_rationale":"..."}`,
    fields: [
      { key: "positionierung", label: "Positionierung", kind: "para" },
      { key: "botschaft", label: "Kernbotschaft", kind: "para" },
      { key: "kanaele", label: "Kanäle", kind: "chips" },
      { key: "massnahmen", label: "Maßnahmen", kind: "bullets" },
      { key: "erfolgsmessung", label: "Erfolgsmessung", kind: "para" },
      { key: "neuro_rationale", label: "Neuro-Bezug", kind: "muted" },
    ],
  },
};
const DELIVERABLE_ORDER = ["kampagne", "instagram", "plakat", "marketing"];

/* ----------------------------------------------------------------------------
   EVIDENCE — statische, geprüfte Studienquellen (nur hier, nie KI-generiert)
---------------------------------------------------------------------------- */
const EVIDENCE = [
  { keys: ["aktivierung","farbe"], strength: 3,
    finding: "Hohe Sättigung und Helligkeit erhöhen das Arousal (gemessen über Hautleitfähigkeit und Herzrate).",
    ref: "Wilms, L. & Oberfeld, D. (2018). Color and emotion. Psychological Research, 82(5), 896–914.",
    doi: "10.1007/s00426-017-0880-8" },
  { keys: ["aktivierung"], strength: 3,
    finding: "Hoch-Arousal-Emotionen (Awe, Ärger, Angst) erhöhen die Sharing-/Verbreitungsrate.",
    ref: "Berger, J. & Milkman, K. L. (2012). What Makes Online Content Viral? Journal of Marketing Research, 49(2), 192–205.",
    doi: "10.1509/jmr.10.0353" },
  { keys: ["ueberraschung","timing","SEEKING"], strength: 3,
    finding: "Dopamin kodiert Vorhersagefehler und verschiebt sich auf den antizipierenden Hinweisreiz.",
    ref: "Schultz, W., Dayan, P. & Montague, P. R. (1997). A Neural Substrate of Prediction and Reward. Science, 275(5306), 1593–1599.",
    doi: "10.1126/science.275.5306.1593" },
  { keys: ["ueberraschung","form","SEEKING"], strength: 2,
    finding: "Eine wahrgenommene Informationslücke erzeugt Neugier (umgekehrtes U über den Wissensstand).",
    ref: "Loewenstein, G. (1994). The Psychology of Curiosity. Psychological Bulletin, 116(1), 75–98.",
    doi: "" },
  { keys: ["form","CARE","LUST"], strength: 3,
    finding: "Menschen bevorzugen gekurvte Formen; scharfe Winkel wirken bedrohlich (negativer Bias).",
    ref: "Bar, M. & Neta, M. (2006). Humans Prefer Curved Visual Objects. Psychological Science, 17(8), 645–648.",
    doi: "10.1111/j.1467-9280.2006.01759.x" },
  { keys: ["zielstrebigkeit","CARE"], strength: 2,
    finding: "Höhere Verarbeitungsflüssigkeit (Symmetrie, Einfachheit) führt zu positiverem Gefällen.",
    ref: "Reber, R., Schwarz, N. & Winkielman, P. (2004). Processing Fluency and Aesthetic Pleasure. Personality and Social Psychology Review, 8(4), 364–382.",
    doi: "" },
  { keys: ["grundthese"], strength: 1,
    finding: "Schätzung/Faustregel, dass ~95\u202f% der Kognition unbewusst ablaufen — nicht streng validiert, bezieht sich auf Kognition allgemein.",
    ref: "Zaltman, G. (2003). How Customers Think. Harvard Business School Press.",
    doi: "" },
];

function evidenceFor(keys) {
  const set = new Set(keys);
  return EVIDENCE.filter((e) => e.keys.some((k) => set.has(k)));
}

/* ----------------------------------------------------------------------------
   [2] ENGINE — reine Funktionen
---------------------------------------------------------------------------- */
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

function diagnoseFromPoint(point, u) {
  const ranked = SYSTEM_ORDER.map((id) => {
    const c = SYSTEMS[id].centroid;
    return { id, dist: Math.hypot(point.a - c.a, point.z - c.z) };
  }).sort((m, n) => m.dist - n.dist);
  if (ranked[1] && ranked[1].dist - ranked[0].dist < 0.8) {
    const center = (id) => mean(SYSTEMS[id].soll.ueberraschung);
    const du = (id) => Math.abs(u - center(id));
    if (du(ranked[1].id) < du(ranked[0].id)) [ranked[0], ranked[1]] = [ranked[1], ranked[0]];
  }
  const weights = ranked.map((r) => 1 / (r.dist + 0.6));
  const sum = weights.reduce((s, w) => s + w, 0);
  const scored = ranked.map((r, i) => ({ ...r, score: Math.round((weights[i] / sum) * 100) }));
  return { point, u, ranked: scored, primary: scored[0].id, secondary: scored[1].id };
}

const PRIOR_NEUTRAL = 5.5, PRIOR_SHIFT_MAX = 2.5, PRIOR_WIDTH_MAX = 0.4;

function adjustSurpriseBand([min, max], precision) {
  const d = (precision - PRIOR_NEUTRAL) / 4.5; // ∈ [-1, 1]
  const center = (min + max) / 2, half = (max - min) / 2;
  const c2 = center - PRIOR_SHIFT_MAX * d;
  const h2 = Math.max(0.5, half * (1 - PRIOR_WIDTH_MAX * d));
  let lo = Math.round(c2 - h2), hi = Math.round(c2 + h2);
  lo = Math.max(1, Math.min(10, lo)); hi = Math.max(1, Math.min(10, hi));
  if (lo > hi) [lo, hi] = [hi, lo];
  return [lo, hi];
}

function priorStrategy(p) {
  if (p >= 7) return "anknüpfen";
  if (p <= 4) return "aufladen";
  return "ausbalancieren";
}

function calibrate(systemId, ist, sollOverride) {
  const soll = sollOverride || SYSTEMS[systemId].soll;
  return VAR_ORDER.map((v) => {
    const [min, max] = soll[v];
    const val = ist[v];
    let gap = 0;
    if (val < min) gap = val - min;
    else if (val > max) gap = val - max;
    const richtung = gap < 0 ? "erhöhen" : gap > 0 ? "senken" : "im Sweet Spot";
    return { variable: v, ist: val, soll: [min, max], gap, richtung };
  });
}

function recommend(systemId, gaps) {
  const adjustments = gaps
    .filter((g) => g.gap !== 0)
    .sort((m, n) => Math.abs(n.gap) - Math.abs(m.gap))
    .map((g) => {
      const dir = g.gap < 0 ? "up" : "down";
      const lever = HEBEL[g.variable];
      return {
        variable: g.variable, richtung: g.richtung, gap: g.gap, hebel: lever[dir],
        channels: lever.channels.map((c) => ({ channel: c, hint: SYSTEMS[systemId].sensorik[c] })),
      };
    });
  return { adjustments, baseline: SYSTEMS[systemId].sensorik };
}

function hypotheses(systemId, gaps) {
  const active = gaps.filter((g) => g.gap !== 0);
  if (active.length === 0) {
    return [{ text: `Das Reiz-Profil liegt für ${systemId} bereits im Sweet Spot. Hypothese: Die Wirkung bleibt stabil, wenn wir das Profil halten.`, toolLabel: MESS.eeg.label, blind: MESS.eeg.blind }];
  }
  return active
    .sort((m, n) => Math.abs(n.gap) - Math.abs(m.gap))
    .map((g) => {
      const [min, max] = g.soll;
      const tool = MESS[TOOL_FOR[g.variable]];
      return {
        text: `Wenn wir ${VARIABLES[g.variable].label} von ${g.ist} Richtung ${min}–${max} ${g.richtung}, dann verändert sich ${MESSGROESSE[g.variable]} in den ersten Sekunden messbar.`,
        toolLabel: tool.label, blind: tool.blind,
      };
    });
}

/* Neuro-Brief: deterministisch aus dem Loop-Zustand zusammengesetzt */
function buildBriefText({ product, target, ist, gaps, adjustments, audience, prior }) {
  const sys = SYSTEMS[target];
  const varLines = VAR_ORDER.map((v) => {
    const g = gaps.find((x) => x.variable === v);
    return `- ${VARIABLES[v].label}: Ist ${g.ist}, Soll ${g.soll[0]}–${g.soll[1]}${g.gap !== 0 ? ` (${g.richtung})` : " (im Sweet Spot)"}`;
  }).join("\n");
  const lever = adjustments.length
    ? adjustments.map((a) => `- ${VARIABLES[a.variable].label} ${a.richtung}: ${a.hebel}`).join("\n")
    : "- Profil halten (bereits im Sweet Spot)";
  const sens = Object.entries(sys.sensorik).map(([c, t]) => `- ${CHANNELS[c]}: ${t}`).join("\n");
  const teamContent = prior.team?.content ?? prior.content ?? "";
  const teamPrecision = prior.team?.precision ?? prior.precision ?? 5;
  const strategy = priorStrategy(teamPrecision);
  const priorBlock = (teamContent.trim() || teamPrecision !== 5)
    ? `\n\nPRIOR DER ZIELGRUPPE: ${teamContent.trim() || "—"} (Präzision ${teamPrecision}/10, Strategie ${strategy}). Bei "anknüpfen" andocken, bei "aufladen" bewusst neue Bedeutung setzen.`
    : "";
  return (
    `NEURO-BRIEF\n` +
    `Produkt: ${product || "(ohne Namen)"}\n` +
    `Ziel-System: ${target} (${sys.tagline}) — Treiber: ${sys.treiber}; Vorkauf-Gefühl: ${sys.gefuehl}\n` +
    `Zielgruppe: ${audience.wer || "—"} | Vorkauf-Gefühl: ${audience.gefuehl || "—"} | Kategorie: ${audience.kategorie || "—"} | Niveau: ${audience.niveau || "—"}\n\n` +
    `Kalibrierte Variablen (1–10):\n${varLines}\n\n` +
    `Wichtigste Stellhebel:\n${lever}\n\n` +
    `Sensorik-Profil des Ziel-Systems:\n${sens}` +
    priorBlock
  );
}

/* ----------------------------------------------------------------------------
   [2b] KI-PRIOR — Prior-Inhalt und -Präzision KI-gestützt schätzen
---------------------------------------------------------------------------- */
const PRIOR_SYSTEM_PROMPT = `Du schätzt den PRIOR einer Zielgruppe gegenüber einem Produkt: (1) was die Zielgruppe aufgrund von Kategorie, Preisniveau und Markenkontext ohnehin erwartet (content), und (2) wie FEST/einig diese Erwartung ist (precision, 1–10: 1 = vage/uneinig, 10 = sehr fest/einig). Stütze dich nur auf die gelieferten Angaben; erfinde keine Fakten. Es ist ausdrücklich eine Schätzung. Antworte NUR mit JSON: {"content":"...","precision":n,"rationale":"..."} Halte content und rationale unter je 25 Wörtern. Deutsch.`;

async function runClaudePrior({ product, audience, material }) {
  const userText =
    `PRODUKT: ${product || "—"}\n` +
    `ZIELGRUPPE: wer ${audience.wer||"—"}; Vorkauf-Gefühl ${audience.gefuehl||"—"}; ` +
    `Kategorie ${audience.kategorie||"—"}; Preis-/Statusniveau ${audience.niveau||"—"}\n` +
    `MATERIAL (optional): ${(material||"")
      .slice(0,500) || "—"}`;
  const p = await callClaude({ system: PRIOR_SYSTEM_PROMPT, content: [{ type: "text", text: userText }] });
  const precision = Math.max(1, Math.min(10, Math.round(Number(p.precision))));
  if (!p.content || Number.isNaN(precision)) throw new Error("Unerwartetes Antwortformat");
  return { content: String(p.content), precision, rationale: String(p.rationale || "") };
}

function priorConfidence(prior) {
  if (!prior.ki) return { label: "nur Team-Schätzung", tone: "muted" };
  const d = Math.abs(prior.team.precision - prior.ki.precision);
  if (d <= 1) return { label: "KI & Schätzung übereinstimmend", tone: "ok" };
  if (d <= 3) return { label: "leichte Differenz", tone: "warn" };
  return { label: "deutliche Differenz — Prüfung lohnt", tone: "alert" };
}

/* ----------------------------------------------------------------------------
   [3] KI-WAHRNEHMUNG — Diagnose aus Material + Zielgruppe
---------------------------------------------------------------------------- */
const DIAG_SYSTEM_PROMPT = `Du bist die Diagnose-Engine eines Neuromarketing-Tools nach dem PROVOID-Framework. Du ordnest Produkte/Werbung in genau EINES von vier emotionalen Systemen ein und schätzt drei Variablen (1–10).

SYSTEME:
- SEEKING (entdecken): Exploration, Antizipation, Neugier. Profil: Aktivierung hoch, Zielstrebigkeit niedrig–mittel, Überraschung hoch.
- LUST (begehren): Anziehung, Begehren, Status. Profil: Aktivierung mittel–hoch, Zielstrebigkeit mittel, Überraschung mittel.
- CARE (dazugehören): Bindung, Fürsorge, Zugehörigkeit. Profil: Aktivierung niedrig–mittel, Zielstrebigkeit hoch, Überraschung niedrig.
- PLAY (mitspielen): Freude, Spontaneität, Interaktion. Profil: Aktivierung mittel–hoch, Zielstrebigkeit niedrig, Überraschung mittel.

VARIABLEN (1–10):
- aktivierung: wie viel Energie der Reiz auslöst (1 ruhig … 10 energiegeladen)
- zielstrebigkeit: wie klar die nächste Handlung ist (1 offen/explorativ … 10 klare CTA)
- ueberraschung: wie neu/unerwartet der Reiz ist (1 vertraut … 10 irritierend)

AUFGABE:
1) IST: Analysiere AUSSCHLIESSLICH das gelieferte Material (Text und/oder Bild). Schätze aktivierung, zielstrebigkeit, ueberraschung und das aktuell dominante System. Nenne 2 kurze Belege AUS dem Material.
2) SOLL: Schlage auf Basis der Zielgruppen-Angaben das optimale Zielsystem vor — das System, das zum Vorkauf-Gefühl der Zielgruppe passt — mit kurzer Begründung.

Antworte mit GENAU diesem JSON und NICHTS sonst (kein Markdown, kein Vorwort):
{"ist":{"aktivierung":n,"zielstrebigkeit":n,"ueberraschung":n,"system":"SEEKING|LUST|CARE|PLAY","belege":["...","..."]},"soll":{"system":"SEEKING|LUST|CARE|PLAY","begruendung":"..."}}
Halte alle Texte unter 16 Wörtern. Antworte auf Deutsch.`;

async function callClaude({ system, content }) {
  const res = await fetch("/api/anthropic/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1000, system, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) throw new Error(`API-Fehler (${res.status})`);
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

async function runClaudeDiagnosis({ material, audience, image }) {
  const userText =
    `MATERIAL:\n${material?.trim() || "(kein Text geliefert — bitte v. a. das Bild auswerten)"}\n\n` +
    `ZIELGRUPPE:\n- Wer kauft: ${audience.wer || "—"}\n- Vorkauf-Gefühl: ${audience.gefuehl || "—"}\n` +
    `- Kategorie: ${audience.kategorie || "—"}\n- Preis-/Statusniveau: ${audience.niveau || "—"}`;
  const content = [];
  if (image) content.push({ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.base64 } });
  content.push({ type: "text", text: userText });

  const parsed = await callClaude({ system: DIAG_SYSTEM_PROMPT, content });
  const okSys = (s) => SYSTEM_ORDER.includes(s);
  const num = (n) => clamp(Math.round(Number(n)), 1, 10);
  if (!parsed.ist || !parsed.soll || !okSys(parsed.ist.system) || !okSys(parsed.soll.system)) throw new Error("Unerwartetes Antwortformat");
  return {
    ist: {
      aktivierung: num(parsed.ist.aktivierung), zielstrebigkeit: num(parsed.ist.zielstrebigkeit), ueberraschung: num(parsed.ist.ueberraschung),
      system: parsed.ist.system, belege: Array.isArray(parsed.ist.belege) ? parsed.ist.belege.slice(0, 3) : [],
    },
    soll: { system: parsed.soll.system, begruendung: parsed.soll.begruendung || "" },
  };
}

/* ----------------------------------------------------------------------------
   [4] KI-GENERIERUNG — Neuro-Brief → Deliverables
---------------------------------------------------------------------------- */
const GEN_SYSTEM_PROMPT = `Du bist ein Senior-Kreativstratege, der nach dem PROVOID-Neuromarketing-Framework arbeitet. Du erhältst einen NEURO-BRIEF mit Ziel-System (eines von SEEKING, LUST, CARE, PLAY), kalibrierten Variablen (1–10) und einem Sensorik-Profil.

REGELN:
- Setze die emotionale Logik des Ziel-Systems konkret über das gelieferte Sensorik-Profil und die kalibrierten Werte um.
- Erfinde KEINE neurowissenschaftlichen Behauptungen. Beziehe dich im Feld "neuro_rationale" nur auf den Brief (System, Variablen, Sensorik).
- Schreibe auf Deutsch, konkret und knapp (jede Texteinheit unter ~25 Wörtern).
- Antworte AUSSCHLIESSLICH mit dem geforderten JSON — kein Markdown, kein Vorwort.`;

async function runClaudeGeneration(type, briefText, voiceText) {
  const cfg = DELIVERABLES[type];
  const fullBrief = voiceText?.trim()
    ? `${briefText}\n\nMARKEN-TONALITÄT (nachahmen, aber Reize des Briefs umsetzen):\n${voiceText.trim()}`
    : briefText;
  const content = [{ type: "text", text: `${fullBrief}\n\nAUFGABE: ${cfg.instruction}\nAntworte mit GENAU diesem JSON:\n${cfg.schema}` }];
  const parsed = await callClaude({ system: GEN_SYSTEM_PROMPT, content });
  const firstKey = cfg.fields[0].key;
  if (parsed[firstKey] == null) throw new Error("Unerwartetes Antwortformat");
  return parsed;
}

function deliverableToText(type, obj) {
  return DELIVERABLES[type].fields.map((f) => {
    const v = obj[f.key];
    const val = Array.isArray(v) ? v.join(", ") : v;
    return val ? `${f.label}: ${val}` : null;
  }).filter(Boolean).join("\n");
}

/* ----------------------------------------------------------------------------
   STYLES
---------------------------------------------------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.nl-root{ --ink:#10151C; --paper:#F6F8FA; --muted:#5B6670; --line:#E4E8EC; --card:#FFFFFF;
  font-family:'Space Grotesk',ui-sans-serif,system-ui,sans-serif; color:var(--ink); background:var(--paper);
  min-height:100%; -webkit-font-smoothing:antialiased; line-height:1.5; }
.nl-mono{ font-family:'IBM Plex Mono',ui-monospace,monospace; }
.nl-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); }
.nl-shell{ max-width:1080px; margin:0 auto; padding:28px 22px 64px; }
.nl-h1{ font-size:30px; font-weight:700; letter-spacing:-.02em; margin:2px 0 0; }
.nl-h2{ font-size:21px; font-weight:600; letter-spacing:-.01em; margin:0; }
.nl-card{ background:var(--card); border:1px solid var(--line); border-radius:16px; box-shadow:0 1px 2px rgba(16,21,28,.04),0 8px 24px rgba(16,21,28,.03); }
.nl-grid{ display:grid; grid-template-columns:232px 1fr; gap:26px; align-items:start; }
.nl-two{ display:grid; grid-template-columns:1fr 360px; gap:24px; align-items:start; }
@media(max-width:860px){ .nl-grid{ grid-template-columns:1fr; } .nl-two{ grid-template-columns:1fr; } }
.nl-rail{ position:sticky; top:18px; display:flex; flex-direction:column; gap:6px; }
.nl-step{ display:flex; gap:12px; align-items:flex-start; padding:11px 12px; border-radius:12px; border:1px solid transparent; cursor:pointer; text-align:left; background:none; width:100%; transition:background .15s,border-color .15s; }
.nl-step:hover{ background:#eef1f4; }
.nl-step.active{ background:var(--card); border-color:var(--line); box-shadow:0 1px 2px rgba(16,21,28,.05); }
.nl-step.done .nl-stepnum{ background:var(--ink); color:#fff; border-color:var(--ink); }
.nl-stepnum{ font-family:'IBM Plex Mono',monospace; font-size:12px; width:24px; height:24px; flex:none; display:grid; place-items:center; border:1px solid var(--line); border-radius:7px; background:#fff; color:var(--muted); }
.nl-step.active .nl-stepnum{ border-color:var(--ink); color:var(--ink); }
.nl-steptitle{ font-weight:600; font-size:14px; }
.nl-stepsub{ font-size:11.5px; color:var(--muted); margin-top:1px; }
.nl-input,.nl-textarea{ width:100%; padding:10px 12px; font-size:14px; border:1px solid var(--line); border-radius:10px; font-family:inherit; background:#fff; color:var(--ink); }
.nl-textarea{ min-height:120px; resize:vertical; line-height:1.5; }
.nl-label{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); display:block; margin-bottom:6px; }
.nl-drop{ border:1.5px dashed var(--line); border-radius:12px; padding:16px; text-align:center; cursor:pointer; color:var(--muted); font-size:13px; transition:border-color .15s,background .15s; }
.nl-drop:hover{ border-color:var(--ink); background:#fafbfc; }
.nl-range{ -webkit-appearance:none; appearance:none; width:100%; height:4px; border-radius:99px; background:#cbd2d8; outline:none; }
.nl-range::-webkit-slider-thumb{ -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#fff; border:2px solid var(--ink); cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,.2); }
.nl-range::-moz-range-thumb{ width:18px; height:18px; border-radius:50%; background:#fff; border:2px solid var(--ink); cursor:pointer; }
.nl-ends{ display:flex; justify-content:space-between; font-size:11.5px; color:var(--muted); margin-top:6px; }
.nl-track{ position:relative; height:46px; border:1px solid var(--line); border-radius:10px; background:#fafbfc; overflow:hidden; }
.nl-band{ position:absolute; top:0; bottom:0; opacity:.18; }
.nl-bandedge{ position:absolute; top:0; bottom:0; width:2px; opacity:.55; }
.nl-tick{ position:absolute; top:0; bottom:0; width:1px; background:var(--line); }
.nl-ist{ position:absolute; top:50%; width:16px; height:16px; border-radius:50%; background:#fff; border:2px solid var(--ink); transform:translate(-50%,-50%); box-shadow:0 1px 4px rgba(0,0,0,.25); }
.nl-rangeover{ position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer; }
.nl-chip{ display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono',monospace; font-size:11.5px; padding:3px 9px; border-radius:99px; border:1px solid var(--line); background:#fff; }
.nl-btn{ display:inline-flex; align-items:center; gap:8px; font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:600; padding:11px 18px; border-radius:11px; border:1px solid var(--ink); background:var(--ink); color:#fff; cursor:pointer; transition:opacity .15s,transform .05s; }
.nl-btn:hover{ opacity:.9; } .nl-btn:active{ transform:translateY(1px); }
.nl-btn[disabled]{ opacity:.35; cursor:not-allowed; }
.nl-btn.ghost{ background:#fff; color:var(--ink); }
.nl-btn.sm{ padding:7px 12px; font-size:12.5px; border-radius:9px; }
.nl-pill{ font-family:'IBM Plex Mono',monospace; font-size:11px; padding:2px 8px; border-radius:99px; background:#eafaf2; color:#0a7a52; border:1px solid #b8ead4; letter-spacing:.04em; }
.nl-spin{ width:18px; height:18px; border:2px solid var(--line); border-top-color:var(--ink); border-radius:50%; animation:nlspin .7s linear infinite; }
.nl-spin.dark{ border-color:rgba(255,255,255,.35); border-top-color:#fff; }
@keyframes nlspin{ to{ transform:rotate(360deg); } }
.nl-tab{ display:inline-flex; align-items:center; gap:7px; padding:8px 13px; border-radius:10px; border:1px solid var(--line); background:#fff; cursor:pointer; font-family:inherit; font-size:13px; font-weight:500; transition:border-color .15s,background .15s; }
.nl-tab.on{ border-color:var(--ink); background:var(--ink); color:#fff; }
.nl-code{ font-family:'IBM Plex Mono',monospace; font-size:12px; background:#0f1a16; color:#d8f0e2; padding:11px 13px; border-radius:9px; line-height:1.45; white-space:pre-wrap; }
*:focus-visible{ outline:2px solid var(--ink); outline-offset:2px; border-radius:4px; }
/* INTRO */
.nl-intro{ position:fixed; inset:0; z-index:100; background:#0a0e14; color:#f0f4f8; display:flex; flex-direction:column; overflow:hidden; font-family:'Space Grotesk',sans-serif; }
.nl-intro-bg{ position:absolute; inset:0; pointer-events:none; overflow:hidden; }
.nl-intro-slides{ flex:1; display:flex; align-items:stretch; overflow:hidden; position:relative; }
.nl-intro-slide{ position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; padding:56px 64px; opacity:0; transform:translateX(60px); transition:opacity .5s cubic-bezier(.4,0,.2,1),transform .5s cubic-bezier(.4,0,.2,1); pointer-events:none; }
.nl-intro-slide.active{ opacity:1; transform:translateX(0); pointer-events:auto; }
.nl-intro-slide.exit{ opacity:0; transform:translateX(-60px); }
@media(max-width:700px){ .nl-intro-slide{ padding:36px 24px; } }
.nl-intro-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.2em; text-transform:uppercase; opacity:.5; margin-bottom:18px; }
.nl-intro-h{ font-size:clamp(28px,5vw,52px); font-weight:700; letter-spacing:-.03em; line-height:1.1; margin:0 0 22px; }
.nl-intro-body{ font-size:clamp(14px,1.6vw,17px); line-height:1.7; opacity:.78; max-width:640px; margin:0 0 32px; }
.nl-intro-pills{ display:flex; flex-wrap:wrap; gap:10px; margin-bottom:36px; }
.nl-intro-pill{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; padding:5px 13px; border-radius:99px; border:1px solid; opacity:.9; }
.nl-intro-nav{ display:flex; align-items:center; gap:12px; padding:24px 64px; border-top:1px solid rgba(255,255,255,.07); flex-shrink:0; }
@media(max-width:700px){ .nl-intro-nav{ padding:18px 24px; } }
.nl-intro-dots{ display:flex; gap:7px; flex:1; }
.nl-intro-dot{ width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.2); cursor:pointer; transition:background .2s,transform .2s; border:none; padding:0; }
.nl-intro-dot.on{ background:#fff; transform:scale(1.4); }
.nl-intro-btn{ display:inline-flex; align-items:center; gap:8px; font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:600; padding:11px 22px; border-radius:11px; border:none; cursor:pointer; transition:opacity .15s,transform .05s; }
.nl-intro-btn:hover{ opacity:.88; } .nl-intro-btn:active{ transform:translateY(1px); }
.nl-intro-btn.prev{ background:rgba(255,255,255,.08); color:#f0f4f8; }
.nl-intro-btn.next{ color:#0a0e14; }
.nl-intro-cols{ display:grid; grid-template-columns:1fr 340px; gap:48px; align-items:center; height:100%; }
@media(max-width:900px){ .nl-intro-cols{ grid-template-columns:1fr; } }
.nl-intro-graphic{ display:flex; align-items:center; justify-content:center; }
@media(max-width:900px){ .nl-intro-graphic{ display:none; } }
@keyframes nl-float{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-14px); } }
.nl-intro-graphic svg,.nl-intro-graphic img{ animation:nl-float 6s ease-in-out infinite; }
@keyframes nl-pulse-ring{ 0%{ transform:scale(1); opacity:.15; } 100%{ transform:scale(1.35); opacity:0; } }
@media(prefers-reduced-motion:reduce){ *{ transition:none!important; animation:none!important; } }
@media print{ .nl-noprint{ display:none!important; } .nl-shell{ padding:0; } }
`;

/* ----------------------------------------------------------------------------
   INTRO
---------------------------------------------------------------------------- */
const INTRO_SLIDES = [
  {
    eyebrow: "Willkommen · Was NeuroLab ermöglicht",
    heading: "Markenwirkung verstehen, statt raten",
    body: "NeuroLab übersetzt Werbung, Claims und Bildmaterial in eine klare emotionale Diagnose. Du erfährst, welches der vier kaufrelevanten Systeme aktiviert wird, wo das Reiz-Profil abweicht und wie du Kreative systematisch kalibrierst. So wird Marketing zur testbaren Hypothese — messbar, iterierbar und wirkungsvoller.",
    pills: [
      { label: "Emotionale Diagnose", color: "#8B5CF6" },
      { label: "Reiz-Profil", color: "#8B5CF6" },
      { label: "KI-Optimierung", color: "rgba(255,255,255,.25)" },
    ],
    accent: "#8B5CF6",
    graphic: (
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* central NeuroLab processing core */}
        <circle cx="150" cy="150" r="68" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity=".35" />
        <circle cx="150" cy="150" r="48" fill="#8B5CF6" fillOpacity=".08" stroke="#8B5CF6" strokeWidth="1.2" />
        <text x="150" y="154" textAnchor="middle" fill="#8B5CF6" fontSize="11" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">NeuroLab</text>

        {/* input: brand material */}
        <rect x="28" y="118" width="72" height="64" rx="8" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.2)" strokeWidth="1" />
        <text x="64" y="142" textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="8" fontFamily="'IBM Plex Mono',monospace">Material</text>
        <text x="64" y="158" textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="8" fontFamily="'IBM Plex Mono',monospace">+ Zielgruppe</text>

        {/* arrow input → core */}
        <line x1="100" y1="150" x2="114" y2="150" stroke="#8B5CF6" strokeWidth="2" strokeOpacity=".7" />
        <polygon points="114,146 124,150 114,154" fill="#8B5CF6" fillOpacity=".7" />

        {/* output: four emotion systems */}
        {[
          { id: "SEEKING", c: "#10B981", y: 78 },
          { id: "LUST", c: "#E11D48", y: 122 },
          { id: "CARE", c: "#0EA5E9", y: 178 },
          { id: "PLAY", c: "#F59E0B", y: 222 },
        ].map(({ id, c, y }) => (
          <g key={id}>
            {/* connection from core */}
            <line x1="194" y1="150" x2="218" y2={y} stroke={c} strokeWidth="1" strokeOpacity=".4" />
            <circle cx="236" cy={y} r="18" fill={c} fillOpacity=".12" stroke={c} strokeWidth="1.5" />
            <text x="236" y={y + 1} textAnchor="middle" dominantBaseline="middle" fill={c} fontSize="7.5" fontFamily="'IBM Plex Mono',monospace" fontWeight="700">{id}</text>
          </g>
        ))}

        {/* output label */}
        <text x="236" y="264" textAnchor="middle" fill="rgba(255,255,255,.25)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">4 kaufrelevante Systeme</text>
      </svg>
    ),
  },
  {
    eyebrow: "Das Fundament · Free Energy Principle",
    heading: "Dein Gehirn ist eine Vorhersage\u00admaschine",
    body: "Das Gehirn generiert laufend Vorhersagen über die Welt — und minimiert den Unterschied zwischen Erwartung und Realität. Karl Friston nennt das \u201eFreie Energie\". Jeder Reiz, den deine Marke sendet, wird mit der gespeicherten Erwartung abgeglichen. Die Differenz ist das Signal, das Aufmerksamkeit, Emotion und Entscheidung treibt.",
    pills: [
      { label: "Free Energy Principle", color: "#10B981" },
      { label: "Prediction Error", color: "#10B981" },
      { label: "Karl Friston 2010", color: "rgba(255,255,255,.25)" },
    ],
    accent: "#10B981",
    graphic: (
      <svg width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <radialGradient id="g-fep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="150" cy="150" r="130" fill="url(#g-fep)" />
        {[130,95,58].map((r,i) => (
          <circle key={i} cx="150" cy="150" r={r} fill="none" stroke="#10B981" strokeWidth={i===0?"0.5":"1"} strokeOpacity={0.2+i*0.2} strokeDasharray={i===0?"3 8":i===1?"2 5":"none"} />
        ))}
        {[0,45,90,135,180,225,270,315].map((deg,i) => {
          const rad = deg*Math.PI/180;
          const r1=62, r2=125;
          return <line key={i} x1={150+r1*Math.cos(rad)} y1={150+r1*Math.sin(rad)} x2={150+r2*Math.cos(rad)} y2={150+r2*Math.sin(rad)} stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.35" />;
        })}
        <circle cx="150" cy="150" r="48" fill="#10B981" fillOpacity=".12" stroke="#10B981" strokeWidth="1.5" />
        <circle cx="150" cy="150" r="22" fill="#10B981" fillOpacity=".2" stroke="#10B981" strokeWidth="1" />
        {/* prediction arrow outward */}
        {[0,120,240].map((deg,i)=>{
          const rad=deg*Math.PI/180, x1=150+22*Math.cos(rad), y1=150+22*Math.sin(rad), x2=150+55*Math.cos(rad), y2=150+55*Math.sin(rad);
          return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10B981" strokeWidth="1.5" strokeOpacity=".7" /><circle cx={x2} cy={y2} r="3" fill="#10B981" fillOpacity=".8" /></g>;
        })}
        {/* error arrows inward */}
        {[60,180,300].map((deg,i)=>{
          const rad=deg*Math.PI/180, x1=150+80*Math.cos(rad), y1=150+80*Math.sin(rad), x2=150+52*Math.cos(rad), y2=150+52*Math.sin(rad);
          return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f0f4f8" strokeWidth="1" strokeOpacity=".3" strokeDasharray="3 3" /></g>;
        })}
        <text x="150" y="154" textAnchor="middle" fill="#10B981" fontSize="11" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">ΔF→min</text>
        <text x="150" y="232" textAnchor="middle" fill="#10B981" fontSize="9" fontFamily="'IBM Plex Mono',monospace" opacity=".5">Prediction</text>
        <text x="226" y="100" textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">Error</text>
      </svg>
    ),
  },
  {
    eyebrow: "Wie Bedeutung entsteht · Predictive Coding",
    heading: "Erwartung ist Bedeutung",
    body: "Predictive Coding erklärt, wie das Gehirn Wahrnehmung aufbaut: Top-down-Modelle generieren eine Erwartung; Bottom-up-Signale liefern nur den Vorhersagefehler. Was exakt erwartet wurde, wird kaum bewusst — was abweicht, erzeugt Aufmerksamkeit. Marken, die gezielt mit dieser Differenz spielen, steuern Aufmerksamkeit und Erinnerung.",
    pills: [
      { label: "Predictive Coding", color: "#E11D48" },
      { label: "Top-down Priors", color: "#E11D48" },
      { label: "Bottom-up Error Signal", color: "rgba(255,255,255,.25)" },
    ],
    accent: "#E11D48",
    graphic: (
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* three cortical layers — top = higher cortex (Prior), bottom = Sensory */}
        {[30,108,186].map((y,i) => (
          <rect key={i} x="24" y={y} width="252" height="48" rx="9"
            fill="#E11D48" fillOpacity={0.05+i*0.04}
            stroke="#E11D48" strokeOpacity={0.15+i*0.12} strokeWidth="1" />
        ))}
        <text x="150" y="58" textAnchor="middle" fill="#E11D48" fontSize="10" fontFamily="'IBM Plex Mono',monospace" opacity=".8">Higher Cortex — Prior generieren</text>
        <text x="150" y="136" textAnchor="middle" fill="#E11D48" fontSize="10" fontFamily="'IBM Plex Mono',monospace" opacity=".65">Mid Cortex — Integration</text>
        <text x="150" y="214" textAnchor="middle" fill="rgba(255,255,255,.55)" fontSize="10" fontFamily="'IBM Plex Mono',monospace">Primärer Kortex — Sensorik</text>
        {/* TOP-DOWN arrows (Prior → lower): red, solid, pointing down */}
        {[75, 155, 225].map((x,i) => (
          <g key={i}>
            <line x1={x} y1="78" x2={x} y2="104" stroke="#E11D48" strokeWidth="2" strokeOpacity=".7" />
            <polygon points={`${x-4},104 ${x+4},104 ${x},112`} fill="#E11D48" fillOpacity=".75" />
          </g>
        ))}
        {/* BOTTOM-UP arrows (Error Signal → higher): white dashed, pointing up */}
        {[105, 195].map((x,i) => (
          <g key={i}>
            <line x1={x} y1="182" x2={x} y2="158" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeDasharray="3 3" />
            <polygon points={`${x-3},158 ${x+3},158 ${x},150`} fill="rgba(255,255,255,.4)" />
          </g>
        ))}
        {/* legend */}
        <g transform="translate(24,252)">
          <line x1="0" y1="8" x2="18" y2="8" stroke="#E11D48" strokeWidth="2" />
          <polygon points="18,4 26,8 18,12" fill="#E11D48" />
          <text x="30" y="12" fill="#E11D48" fontSize="9" fontFamily="'IBM Plex Mono',monospace" opacity=".8">Top-down Prior</text>
        </g>
        <g transform="translate(152,252)">
          <line x1="0" y1="8" x2="18" y2="8" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeDasharray="3 3" />
          <polygon points="18,4 26,8 18,12" fill="rgba(255,255,255,.4)" />
          <text x="30" y="12" fill="rgba(255,255,255,.4)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">Δ Error Signal</text>
        </g>
      </svg>
    ),
  },
  {
    eyebrow: "Wahrscheinlichkeit & Belief · Bayesian Brain",
    heading: "Das Gehirn denkt in Wahrscheinlichkeiten",
    body: "Das Bayesian Brain-Modell beschreibt, wie Priors — gespeicherte Erwartungen — mit sensorischen Signalen zu einer Posterior-Einschätzung verschmelzen. Je fester ein Prior, desto weniger Einfluss hat neues Material. Wer einen starken Kategorie-Prior hat (\u201eApotheke = weiß und seriös\"), braucht einen klaren Differenzierungsreiz, um gesehen zu werden.",
    pills: [
      { label: "Bayesian Brain", color: "#0EA5E9" },
      { label: "Prior Precision", color: "#0EA5E9" },
      { label: "Posterior Update", color: "rgba(255,255,255,.25)" },
    ],
    accent: "#0EA5E9",
    graphic: (
      <svg width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <linearGradient id="g-bay" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0" />
            <stop offset="50%" stopColor="#0EA5E9" stopOpacity=".15" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* axes */}
        <line x1="30" y1="240" x2="280" y2="240" stroke="rgba(255,255,255,.15)" strokeWidth="1" />
        <line x1="30" y1="30" x2="30" y2="245" stroke="rgba(255,255,255,.15)" strokeWidth="1" />
        <text x="155" y="268" textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">Belief strength</text>
        <text x="18" y="140" textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="9" fontFamily="'IBM Plex Mono',monospace" transform="rotate(-90,18,140)">Probability</text>
        {/* prior — wide flat */}
        <path d="M40 220 C70 218 90 80 150 75 C210 80 230 218 260 220" fill="#0EA5E9" fillOpacity=".07" stroke="#0EA5E9" strokeWidth="1.5" strokeOpacity=".4" strokeDasharray="5 3" />
        {/* likelihood */}
        <path d="M40 220 C100 218 130 190 155 90 C178 190 205 218 260 220" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.25)" strokeWidth="1" strokeDasharray="3 4" />
        {/* posterior — narrow tall */}
        <path d="M90 220 C115 218 135 100 152 52 C168 100 185 218 210 220" fill="#0EA5E9" fillOpacity=".12" stroke="#0EA5E9" strokeWidth="2" />
        {/* peak dot */}
        <circle cx="152" cy="52" r="5" fill="#0EA5E9" />
        <line x1="152" y1="58" x2="152" y2="238" stroke="#0EA5E9" strokeWidth="1" strokeOpacity=".3" strokeDasharray="4 3" />
        {/* labels */}
        <text x="62" y="115" fill="#0EA5E9" fontSize="9" fontFamily="'IBM Plex Mono',monospace" opacity=".55">prior</text>
        <text x="222" y="160" fill="rgba(255,255,255,.35)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">likelihood</text>
        <text x="158" y="50" fill="#0EA5E9" fontSize="10" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">posterior</text>
        {/* Bayes label */}
        <rect x="88" y="248" width="124" height="22" rx="5" fill="#0EA5E9" fillOpacity=".1" stroke="#0EA5E9" strokeOpacity=".25" strokeWidth="1" />
        <text x="150" y="263" textAnchor="middle" fill="#0EA5E9" fontSize="10" fontFamily="'IBM Plex Mono',monospace">P(H|E) ∝ P(E|H) · P(H)</text>
      </svg>
    ),
  },
  {
    eyebrow: "Das emotionale Betriebssystem · 7 Subsysteme",
    heading: "Sieben Systeme steuern jede Kaufentscheidung",
    body: "Panksepp identifizierte sieben evolutionsalte Emotionssysteme, die subcortical verankert sind: SEEKING, LUST, CARE, PLAY, FEAR, RAGE, GRIEF/PANIC. Marken aktivieren immer eines oder mehrere. NeuroLab fokussiert auf die vier kaufrelevanten Positivsysteme. Das richtige System zu treffen bedeutet, den passenden Motivationsraum zu aktivieren — bevor die Ratio entscheidet.",
    pills: [
      { label: "SEEKING", color: "#10B981" },
      { label: "LUST", color: "#E11D48" },
      { label: "CARE", color: "#0EA5E9" },
      { label: "PLAY", color: "#F59E0B" },
      { label: "Panksepp 1998", color: "rgba(255,255,255,.25)" },
    ],
    accent: "#F59E0B",
    graphic: (
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* outer brain / neocortex */}
        <ellipse cx="150" cy="138" rx="118" ry="105" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
        <text x="150" y="28" textAnchor="middle" fill="rgba(255,255,255,.25)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">Neokortex</text>
        {/* limbic ring */}
        <ellipse cx="150" cy="148" rx="78" ry="66" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.18)" strokeWidth="1" strokeDasharray="4 4" />
        <text x="150" y="90" textAnchor="middle" fill="rgba(255,255,255,.2)" fontSize="8.5" fontFamily="'IBM Plex Mono',monospace">Limbisches System</text>
        {/* subcortical core — all 7 systems live here */}
        <ellipse cx="150" cy="155" rx="44" ry="34" fill="#F59E0B" fillOpacity=".12" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="150" y="158" textAnchor="middle" fill="#F59E0B" fontSize="8" fontFamily="'IBM Plex Mono',monospace" fontWeight="600">SUBCORTICAL</text>
        {/* 4 positive systems — inside brain, radiating outward from core */}
        {[
          { id:"SEEKING", x:150, y:88, c:"#10B981" },
          { id:"LUST",    x:208, y:140, c:"#E11D48" },
          { id:"CARE",   x:150, y:210, c:"#0EA5E9" },
          { id:"PLAY",   x:90,  y:140, c:"#F59E0B" },
        ].map(({id,x,y,c}) => (
          <g key={id}>
            {/* connection from subcortical core */}
            <line x1={150+(x-150)*0.45} y1={155+(y-155)*0.45}
                  x2={150+(x-150)*0.72} y2={155+(y-155)*0.72}
                  stroke={c} strokeWidth="1" strokeOpacity=".35" strokeDasharray="2 3" />
            <circle cx={x} cy={y} r="20" fill={c} fillOpacity=".15" stroke={c} strokeWidth="1.5" />
            <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fill={c} fontSize="8.5" fontFamily="'IBM Plex Mono',monospace" fontWeight="700">{id}</text>
          </g>
        ))}
        {/* 3 suppressed systems — dimly shown at outer edge */}
        {[
          { id:"FEAR",  angle: 45 },
          { id:"RAGE",  angle: 135 },
          { id:"GRIEF", angle: 175 },
        ].map(({id, angle}) => {
          const rad = angle * Math.PI / 180;
          const x = 150 + 102 * Math.cos(rad), y = 138 + 90 * Math.sin(rad);
          return (
            <g key={id} opacity=".22">
              <circle cx={x} cy={y} r="14" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1" strokeDasharray="2 3" />
              <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,.6)" fontSize="7.5" fontFamily="'IBM Plex Mono',monospace">{id}</text>
            </g>
          );
        })}
        {/* label: 7 total */}
        <text x="150" y="285" textAnchor="middle" fill="rgba(255,255,255,.25)" fontSize="9" fontFamily="'IBM Plex Mono',monospace">7 primäre Emotionssysteme (Panksepp)</text>
      </svg>
    ),
  },
  {
    eyebrow: "Die Methode · PROVOID · NeuroLab",
    heading: "Neuromarketing trifft Praxis",
    body: "NeuroLab übersetzt Predictive Coding und die Emotionssystem-Theorie in ein konkretes Werkzeug: Material rein, System identifizieren, Reiz-Profil kalibrieren, Deliverables generieren, Wirkung messen. Jede Entscheidung wird zur testbaren Hypothese. KI übernimmt die Diagnose — du behältst die Kontrolle über Strategie und kreative Freiheit.",
    pills: [
      { label: "Diagnose", color: "#10B981" },
      { label: "Kalibrierung", color: "#10B981" },
      { label: "KI-Generierung", color: "#10B981" },
      { label: "Validierung", color: "#10B981" },
    ],
    accent: "#10B981",
    isLast: true,
    graphic: null,
    isLogoSlide: true,
  },
];

function IntroScreen({ onDone }) {
  const [slide, setSlide] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const [prevSlide, setPrevSlide] = React.useState(null);
  const total = INTRO_SLIDES.length;

  const go = (next) => {
    if (next === slide) return;
    setPrevSlide(slide);
    setExiting(true);
    setTimeout(() => { setSlide(next); setExiting(false); setPrevSlide(null); }, 320);
  };

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(Math.min(slide + 1, total - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(Math.max(slide - 1, 0));
      if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slide]);

  const s = INTRO_SLIDES[slide];

  return (
    <div className="nl-intro" role="dialog" aria-modal="true" aria-label="NeuroLab Einführung">
      {/* ambient background blobs */}
      <div className="nl-intro-bg">
        <svg width="100%" height="100%" style={{ position:"absolute", inset:0 }}>
          <defs>
            <radialGradient id="ig1" cx="75%" cy="25%" r="50%">
              <stop offset="0%" stopColor={s.accent} stopOpacity="0.12" />
              <stop offset="100%" stopColor={s.accent} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ig2" cx="20%" cy="80%" r="40%">
              <stop offset="0%" stopColor={s.accent} stopOpacity="0.06" />
              <stop offset="100%" stopColor={s.accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#ig1)" />
          <rect width="100%" height="100%" fill="url(#ig2)" />
        </svg>
        {/* subtle grid */}
        <svg width="100%" height="100%" style={{ position:"absolute", inset:0, opacity:.04 }}>
          <defs><pattern id="igrid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth=".5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#igrid)" />
        </svg>
      </div>

      {/* slide content */}
      <div className="nl-intro-slides">
        <div className={`nl-intro-slide ${exiting ? "exit" : "active"}`}>
          <div className="nl-intro-cols">
            <div>
              <div className="nl-intro-eyebrow" style={{ color: s.accent }}>{s.eyebrow}</div>
              <h2 className="nl-intro-h" style={{ backgroundImage: `linear-gradient(135deg, #f0f4f8 40%, ${s.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {s.heading}
              </h2>
              <p className="nl-intro-body">{s.body}</p>
              <div className="nl-intro-pills">
                {s.pills.map((p, i) => (
                  <span key={i} className="nl-intro-pill" style={{ color: p.color, borderColor: p.color }}>{p.label}</span>
                ))}
              </div>
              {s.isLast && (
                <button className="nl-intro-btn next" onClick={onDone}
                  style={{ background: s.accent, fontSize: 16, padding: "13px 28px" }}>
                  Jetzt starten <ArrowRight size={16} />
                </button>
              )}
            </div>
            <div className="nl-intro-graphic">
              {s.isLogoSlide ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                  <img src={logoProvoid} alt="PROVOID Logo" style={{ width: 200, height: 200, objectFit: "contain", filter: "invert(1) brightness(0.85)", animation: "nl-float 6s ease-in-out infinite" }} />
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: "#10B981", letterSpacing: ".12em", textTransform: "uppercase", opacity: .8 }}>PROVOID · NeuroLab</div>
                </div>
              ) : s.graphic}
            </div>
          </div>
        </div>
      </div>

      {/* nav bar */}
      <div className="nl-intro-nav">
        <img src={logoProvoid} alt="PROVOID" style={{ width: 28, height: 28, objectFit: "contain", filter: "invert(1) brightness(0.6)", flexShrink: 0 }} />
        <div className="nl-intro-dots" role="tablist" aria-label="Folien">
          {INTRO_SLIDES.map((_, i) => (
            <button key={i} role="tab" aria-selected={i === slide} aria-label={`Folie ${i + 1}`}
              className={`nl-intro-dot ${i === slide ? "on" : ""}`} onClick={() => go(i)} />
          ))}
        </div>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, opacity: .35 }}>{slide + 1} / {total}</span>
        <button className="nl-intro-btn prev" onClick={() => go(Math.max(slide - 1, 0))} disabled={slide === 0}
          style={{ opacity: slide === 0 ? .3 : 1 }}>
          <ArrowLeft size={15} /> Zurück
        </button>
        {s.isLast ? null : (
          <button className="nl-intro-btn next" onClick={() => go(Math.min(slide + 1, total - 1))}
            style={{ background: s.accent }}>
            Weiter <ArrowRight size={15} />
          </button>
        )}
        <button onClick={onDone} style={{ background:"none", border:"none", color:"rgba(255,255,255,.3)", fontSize:12, cursor:"pointer", fontFamily:"'IBM Plex Mono',monospace", letterSpacing:".06em", padding:"4px 8px" }}>Überspringen</button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   SMALL COMPONENTS
---------------------------------------------------------------------------- */
function Eyebrow({ children }) { return <div className="nl-eyebrow">{children}</div>; }

function PerceptualField({ point, highlight, target, size = 320 }) {
  const pad = 34, W = size, H = size - 20;
  const x = (z) => pad + ((z - 1) / 9) * (W - pad * 2);
  const y = (a) => pad + ((10 - a) / 9) * (H - pad * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: size, display: "block" }} role="img" aria-label="BrandQuadrant">
      <defs><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter></defs>
      {SYSTEM_ORDER.map((id) => {
        const c = SYSTEMS[id].centroid; const dim = highlight && highlight !== id && target !== id;
        return <circle key={id} cx={x(c.z)} cy={y(c.a)} r="42" fill={SYSTEMS[id].color} opacity={dim ? 0.07 : 0.16} filter="url(#soft)" />;
      })}
      <line x1={x(5.5)} y1={pad - 6} x2={x(5.5)} y2={H - pad + 6} stroke="#E4E8EC" />
      <line x1={pad - 6} y1={y(5.5)} x2={W - pad + 6} y2={y(5.5)} stroke="#E4E8EC" />
      {SYSTEM_ORDER.map((id) => {
        const c = SYSTEMS[id].centroid; const on = !highlight || highlight === id || target === id;
        return (
          <g key={id} opacity={on ? 1 : 0.4}>
            <text x={x(c.z)} y={y(c.a) - 4} textAnchor="middle" fontSize="12.5" fontWeight="700" fontFamily="'IBM Plex Mono',monospace" fill={SYSTEMS[id].color}>{id}</text>
            <text x={x(c.z)} y={y(c.a) + 11} textAnchor="middle" fontSize="9.5" fontFamily="'Space Grotesk',sans-serif" fill="#5B6670">{SYSTEMS[id].tagline}</text>
          </g>
        );
      })}
      {target && point && (() => { const c = SYSTEMS[target].centroid;
        return <line x1={x(point.z)} y1={y(point.a)} x2={x(c.z)} y2={y(c.a)} stroke={SYSTEMS[target].color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />; })()}
      <text x={pad - 8} y={y(10) - 12} fontSize="9" fontFamily="'IBM Plex Mono',monospace" fill="#9aa4ac">Aktivierung ↑</text>
      <text x={W - pad + 8} y={y(5.5) - 8} textAnchor="end" fontSize="9" fontFamily="'IBM Plex Mono',monospace" fill="#9aa4ac">Zielstrebigkeit →</text>
      {point && (
        <g>
          <line x1={x(point.z) - 9} y1={y(point.a)} x2={x(point.z) + 9} y2={y(point.a)} stroke="#10151C" strokeWidth="1.5" />
          <line x1={x(point.z)} y1={y(point.a) - 9} x2={x(point.z)} y2={y(point.a) + 9} stroke="#10151C" strokeWidth="1.5" />
          <circle cx={x(point.z)} cy={y(point.a)} r="5" fill="#fff" stroke="#10151C" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}

function BandTrack({ soll, value, color, onChange, baseline }) {
  const pct = (v) => ((v - 1) / 9) * 100;
  const [min, max] = soll;
  return (
    <div className="nl-track">
      {[1,2,3,4,5,6,7,8,9,10].map((t) => <div key={t} className="nl-tick" style={{ left: `${pct(t)}%` }} />)}
      {baseline && (
        <div className="nl-bandbase" style={{ left: `${pct(baseline[0])}%`, width: `${pct(baseline[1]) - pct(baseline[0])}%`, background: color, opacity: 0.22, border: `1px dashed ${color}`, borderRadius: 4, position: "absolute", top: 4, bottom: 4 }} />
      )}
      <div className="nl-band" style={{ left: `${pct(min)}%`, width: `${pct(max) - pct(min)}%`, background: color }} />
      <div className="nl-bandedge" style={{ left: `${pct(min)}%`, background: color }} />
      <div className="nl-bandedge" style={{ left: `${pct(max)}%`, background: color }} />
      <div className="nl-ist" style={{ left: `${pct(value)}%` }} />
      {onChange && <input className="nl-rangeover" type="range" min="1" max="10" step="1" value={value} aria-label="Ist-Wert" onChange={(e) => onChange(Number(e.target.value))} />}
    </div>
  );
}

function ScoreBars({ ranked }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {ranked.map((r) => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="nl-mono" style={{ width: 78, fontSize: 12, fontWeight: 600, color: SYSTEMS[r.id].color }}>{r.id}</div>
          <div style={{ flex: 1, height: 8, background: "#eef1f4", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${r.score}%`, height: "100%", background: SYSTEMS[r.id].color, transition: "width .4s" }} />
          </div>
          <div className="nl-mono" style={{ width: 38, textAlign: "right", fontSize: 12 }}>{r.score}%</div>
        </div>
      ))}
    </div>
  );
}

function MiniSlider({ varId, value, onChange, soll, color }) {
  const v = VARIABLES[varId];
  const pct = (x) => `${((x - 1) / 9) * 100}%`;
  const gap = soll ? (value < soll[0] ? value - soll[0] : value > soll[1] ? value - soll[1] : 0) : 0;
  const inBand = gap === 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, marginBottom: 6 }}>
        <strong>{v.label}</strong>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {soll && (
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, padding: "2px 7px",
              borderRadius: 99, border: "1px solid",
              background: inBand ? "#eafaf2" : "#fef2f2",
              color: inBand ? "#0a7a52" : "#991b1b",
              borderColor: inBand ? "#b8ead4" : "#fca5a5",
            }}>
              {inBand ? "✓ Soll" : `Δ ${gap > 0 ? "+" : ""}${gap}`}
            </span>
          )}
          <span className="nl-mono" style={{ color: "var(--muted)" }}>{value}</span>
        </div>
      </div>
      <div style={{ position: "relative", height: 20 }}>
        {soll && (
          <div style={{
            position: "absolute", top: 4, bottom: 4,
            left: pct(soll[0]), width: `calc(${pct(soll[1])} - ${pct(soll[0])})`,
            background: color || "#10B981", opacity: 0.18, borderRadius: 3, pointerEvents: "none",
          }} />
        )}
        {soll && (
          <>
            <div style={{ position: "absolute", top: 3, bottom: 3, left: pct(soll[0]), width: 2, background: color || "#10B981", opacity: 0.55, borderRadius: 1, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 3, bottom: 3, left: pct(soll[1]), width: 2, background: color || "#10B981", opacity: 0.55, borderRadius: 1, pointerEvents: "none" }} />
          </>
        )}
        <input className="nl-range" type="range" min="1" max="10" step="1" value={value}
          aria-label={v.label} onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, width: "100%", margin: 0 }} />
      </div>
      <div className="nl-ends"><span>{v.left}</span>{soll && <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: color || "#10B981" }}>Soll {soll[0]}–{soll[1]}</span>}<span>{v.right}</span></div>
    </div>
  );
}

function EvidenceList({ keys, color }) {
  const items = evidenceFor(keys);
  if (items.length === 0) return null;
  const dots = (s) => (s >= 3 ? "●●●" : s === 2 ? "●●○" : "●○○");
  const authorShort = (ref) => {
    const m = ref.match(/^([^,.(]+(?:\s&\s[^,.(]+)?)[^(]*\(?(\d{4})/);
    return m ? `${m[1].trim()} ${m[2]}` : ref.slice(0, 28);
  };
  return (
    <div style={{ marginTop: 10, borderTop: "1px dashed var(--line)", paddingTop: 8 }}>
      <div className="nl-eyebrow" style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
        Belege
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "var(--muted)", letterSpacing: 0, textTransform: "none" }}>
          ●●● stark · ●●○ solide · ●○○ Heuristik
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {items.map((e, i) => (
          <details key={i} style={{ fontSize: 12, color: "var(--muted)" }}>
            <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", gap: 7, alignItems: "baseline" }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", color, fontSize: 11, flexShrink: 0 }}>{dots(e.strength)}</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5 }}>{authorShort(e.ref)}</span>
            </summary>
            <div style={{ marginTop: 5, paddingLeft: 22, lineHeight: 1.5 }}>
              <div style={{ marginBottom: 3 }}>{e.finding}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {e.ref}
                {e.doi && (
                  <> — <a href={`https://doi.org/${e.doi}`} target="_blank" rel="noopener" style={{ color, textDecoration: "underline" }}>doi:{e.doi}</a></>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

/* Render eines erzeugten Deliverables anhand der Feld-Spezifikation */
function DeliverableView({ type, obj, color }) {
  const cfg = DELIVERABLES[type];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {cfg.fields.map((f) => {
        const v = obj[f.key];
        if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) return null;
        return (
          <div key={f.key}>
            <Eyebrow>{f.label}</Eyebrow>
            <div style={{ marginTop: 5 }}>
              {f.kind === "title" && <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em" }}>{v}</div>}
              {f.kind === "para" && <p style={{ margin: 0, fontSize: 14 }}>{v}</p>}
              {f.kind === "chip" && <span className="nl-chip" style={{ borderColor: color, color }}>{v}</span>}
              {f.kind === "chips" && <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{v.map((x, i) => <span key={i} className="nl-chip">{x}</span>)}</div>}
              {f.kind === "bullets" && <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>{v.map((x, i) => <li key={i} style={{ marginBottom: 3 }}>{x}</li>)}</ul>}
              {f.kind === "code" && <div className="nl-code">{v}</div>}
              {f.kind === "muted" && <div style={{ fontSize: 12.5, color: "var(--muted)", borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>{v}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   [5] UI — der Loop
---------------------------------------------------------------------------- */
const STEPS = [
  { key: "diagnose", title: "Diagnose", sub: "Material → System", Icon: Compass },
  { key: "kalibrieren", title: "Kalibrieren", sub: "Wie viel Reiz?", Icon: SlidersHorizontal },
  { key: "gestalten", title: "Gestalten", sub: "Reize + erzeugen", Icon: Palette },
  { key: "validieren", title: "Validieren", sub: "Hat es gewirkt?", Icon: FlaskConical },
  { key: "onepager", title: "One-Pager", sub: "Ergebnis", Icon: FileText },
];

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState("");
  const [material, setMaterial] = useState("");
  const [image, setImage] = useState(null);
  const [audience, setAudience] = useState({ wer: "", gefuehl: "", kategorie: "", niveau: "" });
  const [prior, setPrior] = useState({
    ki: null,
    team: { content: "", precision: 5 },
    status: "idle",
    error: "",
  });

  const suggestPrior = async () => {
    setPrior(s => ({ ...s, status: "loading", error: "" }));
    try {
      const ki = await runClaudePrior({ product, audience, material });
      setPrior(s => ({ ...s, ki, team: { content: ki.content, precision: ki.precision }, status: "done" }));
    } catch (e) {
      setPrior(s => ({ ...s, status: "error", error: e.message || "Fehler" }));
    }
  };
  const [ai, setAi] = useState(null);
  const [aiState, setAiState] = useState("idle");
  const [aiError, setAiError] = useState("");
  const [ist, setIst] = useState({ aktivierung: 5, zielstrebigkeit: 5, ueberraschung: 5 });
  const [targetChoice, setTargetChoice] = useState(null);
  const fileRef = useRef(null);

  // benchmark / performance tracking
  const [benchmarks, setBenchmarks] = useState([
    { id: 1, label: "CTR", einheit: "%", vorher: "", nachher: "" },
    { id: 2, label: "Engagement-Rate", einheit: "%", vorher: "", nachher: "" },
    { id: 3, label: "Conversion", einheit: "%", vorher: "", nachher: "" },
  ]);
  const bmNextId = React.useRef(4);

  const addBenchmark = () => {
    setBenchmarks(bs => [...bs, { id: bmNextId.current++, label: "", einheit: "", vorher: "", nachher: "" }]);
  };
  const updateBenchmark = (id, field, val) => {
    setBenchmarks(bs => bs.map(b => b.id === id ? { ...b, [field]: val } : b));
  };
  const removeBenchmark = (id) => {
    setBenchmarks(bs => bs.filter(b => b.id !== id));
  };

  // generation state
  const [genType, setGenType] = useState("kampagne");
  const [generated, setGenerated] = useState({});
  const [genStatus, setGenStatus] = useState({});
  const [genError, setGenError] = useState({});
  const [copied, setCopied] = useState(null);

  // image generation state
  const [genImage, setGenImage] = useState({});
  const [imgStatus, setImgStatus] = useState({});

  // brand assets
  const [brandAssets, setBrandAssets] = useState({ productPhoto: null, styleImages: [], voiceText: "" });
  const productPhotoRef = useRef(null);
  const styleImgRef = useRef(null);

  const point = { a: ist.aktivierung, z: ist.zielstrebigkeit };
  const diag = useMemo(() => diagnoseFromPoint(point, ist.ueberraschung), [ist]);
  const target = targetChoice || ai?.soll?.system || diag.primary;
  const effectiveSoll = useMemo(() => ({
    ...SYSTEMS[target].soll,
    ueberraschung: adjustSurpriseBand(SYSTEMS[target].soll.ueberraschung, prior.team.precision),
  }), [target, prior.team.precision]);
  const gaps = useMemo(() => calibrate(target, ist, effectiveSoll), [target, ist, effectiveSoll]);
  const rec = useMemo(() => recommend(target, gaps), [target, gaps]);
  const hyps = useMemo(() => hypotheses(target, gaps), [target, gaps]);
  const briefText = useMemo(() => buildBriefText({ product, target, ist, gaps, adjustments: rec.adjustments, audience, prior }),
    [product, target, ist, gaps, rec, audience, prior]);
  const T = SYSTEMS[target];
  const strategy = priorStrategy(prior.team.precision);

  const go = (i) => setStep(clamp(i, 0, STEPS.length - 1));

  const onFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImage({ dataUrl: reader.result, base64: String(reader.result).split(",")[1], mediaType: file.type, name: file.name });
    reader.readAsDataURL(file);
  };

  const diagnose = async () => {
    setAiState("loading"); setAiError("");
    try {
      const result = await runClaudeDiagnosis({ material, audience, image });
      setAi(result);
      setIst({ aktivierung: result.ist.aktivierung, zielstrebigkeit: result.ist.zielstrebigkeit, ueberraschung: result.ist.ueberraschung });
      setTargetChoice(null); setAiState("done");
    } catch (e) { setAiError(e.message || "Diagnose fehlgeschlagen"); setAiState("error"); }
  };

  const generate = async (type) => {
    setGenStatus((s) => ({ ...s, [type]: "loading" })); setGenError((e) => ({ ...e, [type]: "" }));
    try {
      const obj = await runClaudeGeneration(type, briefText, brandAssets.voiceText);
      setGenerated((g) => ({ ...g, [type]: obj })); setGenStatus((s) => ({ ...s, [type]: "done" }));
    } catch (err) { setGenError((e) => ({ ...e, [type]: err.message || "Fehler" })); setGenStatus((s) => ({ ...s, [type]: "error" })); }
  };

  const generateImage = async (type) => {
    const prompt = generated[type]?.[DELIVERABLES[type].imageKey];
    if (!prompt) return;
    setImgStatus((s) => ({ ...s, [type]: "loading" }));
    try {
      const body = {
        prompt,
        size: "1024x1536",
        productPhoto: brandAssets.productPhoto?.dataUrl || null,
        styleImages: brandAssets.styleImages.map((s) => s.dataUrl),
      };
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.image) throw new Error(data.error || "Fehler");
      setGenImage((g) => ({ ...g, [type]: data.image }));
      setImgStatus((s) => ({ ...s, [type]: "done" }));
    } catch (e) {
      setImgStatus((s) => ({ ...s, [type]: "error" }));
    }
  };

  const onBrandFile = (file, role) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const entry = { dataUrl: reader.result, name: file.name };
      if (role === "product") {
        setBrandAssets((a) => ({ ...a, productPhoto: entry }));
      } else {
        setBrandAssets((a) => ({ ...a, styleImages: [...a.styleImages.slice(0, 2), entry] }));
      }
    };
    reader.readAsDataURL(file);
  };

  const copyDeliverable = (type) => {
    try { navigator.clipboard?.writeText(deliverableToText(type, generated[type])); } catch (e) {}
    setCopied(type); setTimeout(() => setCopied(null), 1500);
  };

  const exportJSON = () => {
    const delta = prior.ki ? Math.abs(prior.team.precision - prior.ki.precision) : null;
    const bmWithLift = benchmarks.map(b => {
      const v = parseFloat(b.vorher), n = parseFloat(b.nachher);
      const lift = (!isNaN(v) && !isNaN(n) && v !== 0) ? Math.round(((n - v) / Math.abs(v)) * 1000) / 10 : null;
      return { ...b, lift };
    });
    const data = {
      produkt: product || "(ohne Namen)", zielgruppe: audience,
      prior: { ki: prior.ki, team: prior.team, delta, strategy },
      diagnose: { ist_system: diag.primary, ki_ist: ai?.ist || null, position: diag.point, scores: diag.ranked },
      zielsystem: target, soll_begruendung: ai?.soll?.begruendung || null,
      kalibrierung: gaps, gestaltung: rec.adjustments, deliverables: generated,
      validierung: { hypothesen: hyps, benchmarks: bmWithLift },
      erzeugt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `neurolab_${(product || "produkt").toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  const canDiagnose = (material.trim().length > 0 || image) && aiState !== "loading";
  const shift = ai && diag.primary !== target;
  const genCfg = DELIVERABLES[genType];
  const genObj = generated[genType];
  const gStatus = genStatus[genType] || "idle";
  const madeList = DELIVERABLE_ORDER.filter((t) => generated[t]);

  return (
    <div className="nl-root">
      <style>{CSS}</style>
      {showIntro && <IntroScreen onDone={() => setShowIntro(false)} />}
      <div className="nl-shell">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={logoProvoid} alt="PROVOID" style={{ width: 38, height: 38, objectFit: "contain" }} />
            <div><Eyebrow>PROVOID · NeuroLab · Loop-Prototyp</Eyebrow><h1 className="nl-h1">{product ? product : "Neues Produkt"}</h1></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowIntro(true)} style={{ background: "none", border: "1px solid var(--line)", borderRadius: 8, padding: "4px 11px", fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", cursor: "pointer", color: "var(--muted)", letterSpacing: ".04em" }}>Einführung</button>
            <span className="nl-pill nl-noprint"><Sparkles size={12} style={{ verticalAlign: "-2px" }} /> KI live</span>
          </div>
        </div>

        <div className="nl-grid">
          <nav className="nl-rail nl-noprint" aria-label="Phasen des Loops">
            {STEPS.map((s, i) => {
              const Icon = s.Icon;
              return (
                <button key={s.key} className={`nl-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`} onClick={() => go(i)}>
                  <span className="nl-stepnum">{i < step ? "✓" : i + 1}</span>
                  <span>
                    <span className="nl-steptitle" style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon size={14} strokeWidth={2} /> {s.title}</span>
                    <span className="nl-stepsub">{s.sub}</span>
                  </span>
                </button>
              );
            })}
            <div style={{ marginTop: 10, padding: "10px 12px", fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 }}>
              <Crosshair size={13} style={{ verticalAlign: "-2px" }} /> Ist: <span className="nl-mono">a{point.a}·z{point.z}</span><br />
              Ziel: <strong style={{ color: T.color }}>{target}</strong>
            </div>
          </nav>

          <main>
            {/* STEP 0: DIAGNOSE */}
            {step === 0 && (
              <section className="nl-card" style={{ padding: 26 }}>
                <Eyebrow>Phase 1 — Diagnose</Eyebrow>
                <h2 className="nl-h2" style={{ marginTop: 6 }}>Material rein, System raus</h2>
                <p style={{ color: "var(--muted)", marginTop: 6, marginBottom: 18, fontSize: 14 }}>
                  Füge Produktinfos und bestehende Werbung ein. Claude schätzt das aktuelle System (Ist) aus dem Material und schlägt aus der Zielgruppe das optimale System (Soll) vor. Du bestätigst und justierst.
                </p>
                <div className="nl-two">
                  <div>
                    <div style={{ marginBottom: 14 }}>
                      <label className="nl-label">Produktname</label>
                      <input className="nl-input" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="z. B. Aurora E-Bike" />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label className="nl-label">Material — Beschreibung, Werbetext, Claims, Quellen</label>
                      <textarea className="nl-textarea" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Werbetext, Slogan, Produktbeschreibung, Landingpage-Copy … hier einfügen" />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label className="nl-label">Werbung als Bild (optional)</label>
                      {image ? (
                        <div style={{ display: "flex", gap: 10, alignItems: "center", border: "1px solid var(--line)", borderRadius: 12, padding: 10 }}>
                          <img src={image.dataUrl} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />
                          <span style={{ fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{image.name}</span>
                          <button className="nl-chip" onClick={() => setImage(null)}><X size={13} /> entfernen</button>
                        </div>
                      ) : (
                        <div className="nl-drop" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
                          <ImagePlus size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} /> Bild ablegen oder auswählen
                        </div>
                      )}
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files[0])} />
                    </div>
                    <label className="nl-label">Zielgruppe — Basis für den Soll-Vorschlag</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                      <input className="nl-input" value={audience.wer} onChange={(e) => setAudience({ ...audience, wer: e.target.value })} placeholder="Wer kauft?" />
                      <input className="nl-input" value={audience.gefuehl} onChange={(e) => setAudience({ ...audience, gefuehl: e.target.value })} placeholder="Vorkauf-Gefühl?" />
                      <input className="nl-input" value={audience.kategorie} onChange={(e) => setAudience({ ...audience, kategorie: e.target.value })} placeholder="Kategorie" />
                      <input className="nl-input" value={audience.niveau} onChange={(e) => setAudience({ ...audience, niveau: e.target.value })} placeholder="Preis-/Statusniveau" />
                    </div>
                    <label className="nl-label">Prior der Zielgruppe (KI + Team)</label>
                    <div style={{ marginBottom: 14, border: "1px solid var(--line)", borderRadius: 12, padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                        <button
                          className="nl-btn ghost sm"
                          onClick={suggestPrior}
                          disabled={prior.status === "loading"}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          {prior.status === "loading" ? <><span className="nl-spin" /> KI schätzt …</> : <><Sparkles size={13} /> Prior von KI vorschlagen</>}
                        </button>
                        {prior.status === "error" && (
                          <span style={{ fontSize: 12, color: "#b4232a", display: "inline-flex", gap: 5, alignItems: "center" }}>
                            <AlertCircle size={13} /> {prior.error}
                          </span>
                        )}
                      </div>
                      {prior.ki?.rationale && (
                        <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", marginBottom: 10, paddingLeft: 2 }}>
                          KI-Begründung: {prior.ki.rationale}
                        </div>
                      )}
                      <div style={{ marginBottom: 10 }}>
                        <label className="nl-label" style={{ marginBottom: 4 }}>Erwartung der Zielgruppe</label>
                        <textarea
                          className="nl-textarea"
                          style={{ minHeight: 64 }}
                          value={prior.team.content}
                          onChange={(e) => setPrior(s => ({ ...s, team: { ...s.team, content: e.target.value } }))}
                          placeholder="Was erwartet die Zielgruppe bereits? (z. B. 'Premium-Design, minimalistisch, Apple-ähnlich')"
                        />
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>
                          <span>Prior-Präzision</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="nl-mono">{prior.team.precision}/10</span>
                            {prior.ki && prior.team.precision !== prior.ki.precision && (
                              <span style={{ fontSize: 11, color: "var(--muted)" }}>KI schlug {prior.ki.precision}/10 vor</span>
                            )}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>vage</span>
                          <input
                            className="nl-range"
                            type="range" min="1" max="10" step="1"
                            value={prior.team.precision}
                            onChange={(e) => setPrior(s => ({ ...s, team: { ...s.team, precision: Number(e.target.value) } }))}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>sehr fest</span>
                        </div>
                      </div>
                      {(() => {
                        const conf = priorConfidence(prior);
                        const toneStyle = conf.tone === "ok"
                          ? { background: "#eafaf2", color: "#0a7a52", border: "1px solid #b8ead4" }
                          : conf.tone === "warn"
                          ? { background: "#fefce8", color: "#854d0e", border: "1px solid #fde68a" }
                          : conf.tone === "alert"
                          ? { background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" }
                          : { background: "#f6f8fa", color: "var(--muted)", border: "1px solid var(--line)" };
                        return (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 6 }}>
                            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: "3px 9px", borderRadius: 99, ...toneStyle }}>
                              {conf.label}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>Geschätzt (KI + Team), nicht gemessen.</span>
                          </div>
                        );
                      })()}
                    </div>
                    <button className="nl-btn" onClick={diagnose} disabled={!canDiagnose}>
                      {aiState === "loading" ? <><span className="nl-spin dark" /> Claude analysiert …</> : <><Sparkles size={15} /> Diagnose starten</>}
                    </button>
                    {aiState === "error" && (
                      <div style={{ marginTop: 12, fontSize: 13, color: "#b4232a", display: "flex", gap: 7, alignItems: "flex-start" }}>
                        <AlertCircle size={15} style={{ flex: "none", marginTop: 1 }} /><span>{aiError}. Du kannst die Werte rechts auch manuell setzen.</span>
                      </div>
                    )}
                  </div>
                  <div style={{ position: "sticky", top: 18 }}>
                    <div className="nl-card" style={{ padding: 16 }}>
                      <PerceptualField point={diag.point} highlight={diag.primary} target={ai ? target : null} />
                      {ai ? (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 13.5, marginBottom: 8 }}>
                            Ist <strong style={{ color: SYSTEMS[diag.primary].color }}>{diag.primary}</strong>
                            {shift ? <> → Soll <strong style={{ color: T.color }}>{target}</strong></> : <> · bereits gut platziert</>}
                          </div>
                          {ai.ist.belege?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                              {ai.ist.belege.map((b, i) => <span key={i} className="nl-chip" style={{ background: "#fafbfc" }}>{b}</span>)}
                            </div>
                          )}
                          {ai.soll.begruendung && <div style={{ fontSize: 12.5, color: "var(--muted)", borderLeft: `3px solid ${T.color}`, paddingLeft: 10, marginBottom: 12 }}>Soll-Begründung: {ai.soll.begruendung}</div>}
                        </div>
                      ) : <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 12 }}>Noch keine Diagnose. Starte links — oder setze die Werte unten manuell.</p>}
                      <div style={{ marginTop: 8, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                        <Eyebrow>Bestätigen & justieren (Ist)</Eyebrow>
                        <div style={{ marginTop: 10 }}>{VAR_ORDER.map((v) => <MiniSlider key={v} varId={v} value={ist[v]} onChange={(val) => setIst({ ...ist, [v]: val })} soll={effectiveSoll[v]} color={T.color} />)}</div>
                        <Eyebrow>Ziel-System</Eyebrow>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                          {SYSTEM_ORDER.map((id) => (
                            <button key={id} className="nl-chip" onClick={() => setTargetChoice(id)} style={{ borderColor: id === target ? SYSTEMS[id].color : "var(--line)", color: id === target ? SYSTEMS[id].color : "var(--ink)", fontWeight: id === target ? 600 : 400 }}>{id}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 1: KALIBRIEREN */}
            {step === 1 && (
              <section className="nl-card" style={{ padding: 26 }}>
                <Eyebrow>Phase 2 — Kalibrieren</Eyebrow>
                <h2 className="nl-h2" style={{ marginTop: 6 }}>Soll trifft Ist</h2>
                <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
                  Das farbige Band ist das Soll-Profil von <strong style={{ color: T.color }}>{target}</strong>. Der Punkt ist dein Ist aus der Diagnose — verschiebbar. Der Gap zeigt, was nachzujustieren ist.
                </p>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "14px 0 20px" }}>
                  <span className="nl-eyebrow" style={{ alignSelf: "center" }}>Ziel-System</span>
                  {SYSTEM_ORDER.map((id) => (
                    <button key={id} className="nl-chip" onClick={() => setTargetChoice(id)} style={{ borderColor: id === target ? SYSTEMS[id].color : "var(--line)", color: id === target ? SYSTEMS[id].color : "var(--ink)", fontWeight: id === target ? 600 : 400 }}>{id}</button>
                  ))}
                </div>
                {gaps.map((g) => {
                  const baseSoll = SYSTEMS[target].soll[g.variable];
                  const isSurprise = g.variable === "ueberraschung";
                  const baseline = isSurprise ? baseSoll : null;
                  return (
                    <div key={g.variable} style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                        <div><strong style={{ fontSize: 14.5 }}>{VARIABLES[g.variable].label}</strong><span style={{ color: "var(--muted)", fontSize: 12.5, marginLeft: 8 }}>{VARIABLES[g.variable].frage}</span></div>
                        <span className="nl-chip" style={{ borderColor: g.gap === 0 ? "#10B981" : "var(--line)" }}>{g.gap === 0 ? "im Sweet Spot" : `Δ ${g.gap > 0 ? "+" : ""}${g.gap} → ${g.richtung}`}</span>
                      </div>
                      <BandTrack soll={g.soll} value={g.ist} color={T.color} onChange={(v) => setIst({ ...ist, [g.variable]: v })} baseline={baseline} />
                      <div className="nl-ends"><span>{VARIABLES[g.variable].left}</span><span>Soll {g.soll[0]}–{g.soll[1]}</span><span>{VARIABLES[g.variable].right}</span></div>
                      {isSurprise && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5, fontStyle: "italic" }}>
                          Soll-Band an Prior-Präzision {prior.team.precision}/10 angepasst (Basis {baseSoll[0]}–{baseSoll[1]}) · Strategie: {strategy}.
                        </div>
                      )}
                      <EvidenceList keys={[g.variable]} color={T.color} />
                    </div>
                  );
                })}
              </section>
            )}

            {/* STEP 2: GESTALTEN + STUDIO */}
            {step === 2 && (
              <>
                <section className="nl-card" style={{ padding: 26 }}>
                  <Eyebrow>Phase 3 — Gestalten</Eyebrow>
                  <h2 className="nl-h2" style={{ marginTop: 6 }}>Konkrete Reize, nach Gap priorisiert</h2>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>
                    Prior-Strategie: <strong style={{ color: T.color }}>{strategy}</strong> — {strategy === "anknüpfen" ? "an feste Erwartung der Zielgruppe andocken." : strategy === "aufladen" ? "bewusst neue Bedeutung besetzen." : "Erwartung und Neuheit ausbalancieren."}
                  </p>
                  {rec.adjustments.length === 0
                    ? <p style={{ color: "var(--muted)", marginTop: 10, fontSize: 14 }}>Kein offener Gap — das Profil von <strong style={{ color: T.color }}>{target}</strong> ist getroffen.</p>
                    : <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>Zuerst die Kanäle, die den größten Gap schließen.</p>}
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                    {rec.adjustments.map((adj) => (
                      <div key={adj.variable} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 16, borderLeft: `3px solid ${T.color}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span className="nl-mono" style={{ fontSize: 12, fontWeight: 600 }}>{VARIABLES[adj.variable].label} {adj.richtung}</span>
                          <span className="nl-chip">Δ {adj.gap > 0 ? "+" : ""}{adj.gap}</span>
                        </div>
                        <div style={{ fontSize: 14, marginBottom: 10 }}>{adj.hebel}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {adj.channels.map((c) => <span key={c.channel} className="nl-chip" style={{ background: "#fafbfc" }}><strong style={{ color: T.color }}>{CHANNELS[c.channel]}</strong>&nbsp;· {c.hint}</span>)}
                        </div>
                        <EvidenceList keys={[adj.variable, ...adj.channels.map((c) => c.channel)]} color={T.color} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* STUDIO */}
                <section className="nl-card" style={{ padding: 26, marginTop: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Wand2 size={16} /><Eyebrow>Studio — aus dem Neuro-Brief erzeugen</Eyebrow>
                  </div>
                  <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 13.5 }}>
                    Jedes Deliverable wird auf <strong style={{ color: T.color }}>{target}</strong>, die kalibrierten Werte und das Sensorik-Profil konditioniert — live über Claude.
                  </p>

                  <details style={{ marginTop: 10, marginBottom: 16, border: "1px solid var(--line)", borderRadius: 12, padding: "10px 14px" }}>
                    <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Marken- &amp; Produkt-Referenz <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional — verbessert Bildgenerierung)</span></summary>
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label className="nl-label">Produktfoto</label>
                        {brandAssets.productPhoto ? (
                          <div style={{ display: "flex", gap: 10, alignItems: "center", border: "1px solid var(--line)", borderRadius: 10, padding: 10 }}>
                            <img src={brandAssets.productPhoto.dataUrl} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 7 }} />
                            <span style={{ fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brandAssets.productPhoto.name}</span>
                            <button className="nl-chip" onClick={() => setBrandAssets((a) => ({ ...a, productPhoto: null }))}><X size={12} /> entfernen</button>
                          </div>
                        ) : (
                          <div className="nl-drop" onClick={() => productPhotoRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onBrandFile(e.dataTransfer.files[0], "product"); }}>
                            <ImagePlus size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} /> Produktfoto ablegen oder auswählen
                          </div>
                        )}
                        <input ref={productPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onBrandFile(e.target.files[0], "product")} />
                      </div>
                      <div>
                        <label className="nl-label">Stil-Referenzen <span style={{ textTransform: "none", letterSpacing: 0 }}>(max. 3 bestehende Posts)</span></label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {brandAssets.styleImages.map((img, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", border: "1px solid var(--line)", borderRadius: 10, padding: 10 }}>
                              <img src={img.dataUrl} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 7 }} />
                              <span style={{ fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</span>
                              <button className="nl-chip" onClick={() => setBrandAssets((a) => ({ ...a, styleImages: a.styleImages.filter((_, j) => j !== i) }))}><X size={12} /> entfernen</button>
                            </div>
                          ))}
                          {brandAssets.styleImages.length < 3 && (
                            <div className="nl-drop" onClick={() => styleImgRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onBrandFile(e.dataTransfer.files[0], "style"); }}>
                              <ImagePlus size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} /> Stil-Referenz hinzufügen ({brandAssets.styleImages.length}/3)
                            </div>
                          )}
                          <input ref={styleImgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onBrandFile(e.target.files[0], "style")} />
                        </div>
                      </div>
                      <div>
                        <label className="nl-label">Marken-Tonalität</label>
                        <textarea className="nl-textarea" style={{ minHeight: 80 }} value={brandAssets.voiceText} onChange={(e) => setBrandAssets((a) => ({ ...a, voiceText: e.target.value }))} placeholder="Beispiel-Captions, Slogans oder Stilbeschreibung einfügen — Claude imitiert diesen Ton." />
                      </div>
                    </div>
                  </details>

                  <details style={{ marginTop: 10, marginBottom: 16 }}>
                    <summary style={{ cursor: "pointer", fontSize: 12.5, color: "var(--muted)", padding: "2px 0" }}>Neuro-Brief ansehen</summary>
                    <div className="nl-code" style={{ marginTop: 8 }}>{briefText}</div>
                  </details>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {DELIVERABLE_ORDER.map((t) => {
                      const C = DELIVERABLES[t].Icon;
                      return (
                        <button key={t} className={`nl-tab ${t === genType ? "on" : ""}`} onClick={() => setGenType(t)}>
                          <C size={14} /> {DELIVERABLES[t].label} {generated[t] && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                    <button className="nl-btn" onClick={() => generate(genType)} disabled={gStatus === "loading"}>
                      {gStatus === "loading" ? <><span className="nl-spin dark" /> erzeugt …</> : <><Wand2 size={15} /> {genObj ? "Neu erzeugen" : `${genCfg.label} erzeugen`}</>}
                    </button>
                    {genObj && <button className="nl-btn ghost sm" onClick={() => copyDeliverable(genType)}>{copied === genType ? <><Check size={14} /> kopiert</> : <><Copy size={14} /> Text kopieren</>}</button>}
                  </div>

                  {genStatus[genType] === "error" && (
                    <div style={{ fontSize: 13, color: "#b4232a", display: "flex", gap: 7, alignItems: "center", marginBottom: 12 }}><AlertCircle size={15} /> {genError[genType]}</div>
                  )}

                  {genObj ? (
                    <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18, borderTop: `3px solid ${T.color}` }}>
                      <DeliverableView type={genType} obj={genObj} color={T.color} />
                      <EvidenceList keys={[target, ...gaps.filter((g) => g.gap !== 0).map((g) => g.variable)]} color={T.color} />
                      {genCfg.imageKey && genObj[genCfg.imageKey] && (
                        <div style={{ marginTop: 16, borderTop: "1px dashed var(--line)", paddingTop: 14 }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                            <button className="nl-btn ghost sm" onClick={() => generateImage(genType)} disabled={imgStatus[genType] === "loading"}>
                              {imgStatus[genType] === "loading" ? <><span className="nl-spin" /> Bild …</> : <><ImageIcon size={14} /> Bild erzeugen</>}
                            </button>
                            {imgStatus[genType] === "error" && (
                              <span style={{ fontSize: 12, color: "#b4232a", display: "flex", gap: 5, alignItems: "center" }}><AlertCircle size={13} /> Bildgenerierung fehlgeschlagen.</span>
                            )}
                          </div>
                          {genImage[genType] && (
                            <img src={`data:image/png;base64,${genImage[genType]}`} alt="Generiertes Visual"
                                 style={{ width: "100%", borderRadius: 10, marginTop: 12, border: "1px solid var(--line)" }} />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    gStatus !== "loading" && <p style={{ fontSize: 13, color: "var(--muted)" }}>Wähle einen Typ und erzeuge dein erstes Deliverable.</p>
                  )}
                </section>
              </>
            )}

            {/* STEP 3: VALIDIEREN */}
            {step === 3 && (
              <section className="nl-card" style={{ padding: 26 }}>
                <Eyebrow>Phase 4 — Validieren</Eyebrow>
                <h2 className="nl-h2" style={{ marginTop: 6 }}>Jede Entscheidung wird zur Hypothese</h2>
                <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
                  „Wenn → Dann"-Sätze plus passendes Mess-Tool inkl. blindem Fleck. Ergebnis fließt zurück in die nächste Diagnose.
                </p>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {hyps.map((h, i) => (
                    <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 14.5, marginBottom: 10 }}>{h.text}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <span className="nl-chip"><FlaskConical size={13} /> {h.toolLabel}</span>
                        <span style={{ fontSize: 12.5, color: "var(--muted)", display: "inline-flex", gap: 5, alignItems: "center" }}><Info size={13} /> {h.blind}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BENCHMARK TRACKER */}
                <div style={{ marginTop: 28, borderTop: "1px solid var(--line)", paddingTop: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <Eyebrow>Performance-Vergleich</Eyebrow>
                      <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--muted)" }}>Vorher (bisherige Kampagne) vs. Nachher (neuro-optimierte Version) — Werte eintragen, sobald Daten vorliegen.</p>
                    </div>
                    <button className="nl-btn ghost sm" onClick={addBenchmark} style={{ flexShrink: 0 }}>
                      + Metrik hinzufügen
                    </button>
                  </div>

                  {/* Header row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px 110px 90px 28px", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span className="nl-eyebrow">Metrik</span>
                    <span className="nl-eyebrow">Einheit</span>
                    <span className="nl-eyebrow">Vorher</span>
                    <span className="nl-eyebrow" style={{ color: T.color }}>Nachher</span>
                    <span className="nl-eyebrow">Lift</span>
                    <span />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {benchmarks.map((b) => {
                      const v = parseFloat(b.vorher), n = parseFloat(b.nachher);
                      const hasData = !isNaN(v) && !isNaN(n) && b.vorher !== "" && b.nachher !== "";
                      const lift = hasData && v !== 0 ? ((n - v) / Math.abs(v)) * 100 : null;
                      const liftPos = lift !== null && lift > 0;
                      const liftNeg = lift !== null && lift < 0;
                      return (
                        <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 110px 110px 90px 28px", gap: 8, alignItems: "center" }}>
                          <input className="nl-input" style={{ padding: "7px 10px", fontSize: 13 }}
                            value={b.label} placeholder="z. B. CTR"
                            onChange={(e) => updateBenchmark(b.id, "label", e.target.value)} />
                          <input className="nl-input" style={{ padding: "7px 10px", fontSize: 13 }}
                            value={b.einheit} placeholder="%"
                            onChange={(e) => updateBenchmark(b.id, "einheit", e.target.value)} />
                          <input className="nl-input" style={{ padding: "7px 10px", fontSize: 13 }}
                            type="number" value={b.vorher} placeholder="0"
                            onChange={(e) => updateBenchmark(b.id, "vorher", e.target.value)} />
                          <input className="nl-input" style={{ padding: "7px 10px", fontSize: 13, borderColor: b.nachher !== "" ? T.color : undefined }}
                            type="number" value={b.nachher} placeholder="0"
                            onChange={(e) => updateBenchmark(b.id, "nachher", e.target.value)} />
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5, fontWeight: 600,
                            color: liftPos ? "#0a7a52" : liftNeg ? "#991b1b" : "var(--muted)" }}>
                            {lift !== null ? `${lift > 0 ? "+" : ""}${lift.toFixed(1)} %` : "—"}
                          </div>
                          <button onClick={() => removeBenchmark(b.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 2, display: "flex", alignItems: "center" }}>
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary bar */}
                  {benchmarks.some(b => b.vorher !== "" && b.nachher !== "") && (() => {
                    const filled = benchmarks.filter(b => {
                      const v = parseFloat(b.vorher), n = parseFloat(b.nachher);
                      return !isNaN(v) && !isNaN(n) && v !== 0;
                    });
                    if (filled.length === 0) return null;
                    const lifts = filled.map(b => ((parseFloat(b.nachher) - parseFloat(b.vorher)) / Math.abs(parseFloat(b.vorher))) * 100);
                    const avgLift = lifts.reduce((s, x) => s + x, 0) / lifts.length;
                    const wins = lifts.filter(l => l > 0).length;
                    return (
                      <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 10, background: avgLift >= 0 ? "#eafaf2" : "#fef2f2",
                        border: `1px solid ${avgLift >= 0 ? "#b8ead4" : "#fca5a5"}`,
                        display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                        <div>
                          <div className="nl-eyebrow" style={{ marginBottom: 2 }}>Ø Lift</div>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 700,
                            color: avgLift >= 0 ? "#0a7a52" : "#991b1b" }}>
                            {avgLift > 0 ? "+" : ""}{avgLift.toFixed(1)} %
                          </div>
                        </div>
                        <div>
                          <div className="nl-eyebrow" style={{ marginBottom: 2 }}>Metriken verbessert</div>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
                            {wins} / {filled.length}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div className="nl-eyebrow" style={{ marginBottom: 4 }}>Einzelne Lifts</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {filled.map((b, i) => (
                              <span key={b.id} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, padding: "2px 8px",
                                borderRadius: 99, border: "1px solid",
                                background: lifts[i] >= 0 ? "#eafaf2" : "#fef2f2",
                                color: lifts[i] >= 0 ? "#0a7a52" : "#991b1b",
                                borderColor: lifts[i] >= 0 ? "#b8ead4" : "#fca5a5" }}>
                                {b.label || "?"} {lifts[i] > 0 ? "+" : ""}{lifts[i].toFixed(1)} %
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </section>
            )}

            {/* STEP 4: ONE-PAGER */}
            {step === 4 && (
              <section className="nl-card" style={{ padding: 26 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div><Eyebrow>Ergebnis — One-Pager</Eyebrow><h2 className="nl-h2" style={{ marginTop: 6 }}>{product || "Produkt"}</h2></div>
                  <div className="nl-noprint" style={{ display: "flex", gap: 8 }}>
                    <button className="nl-btn ghost" onClick={exportJSON}><Download size={15} /> JSON</button>
                    <button className="nl-btn ghost" onClick={() => window.print()}><Printer size={15} /> Drucken / PDF</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, marginTop: 18 }} className="nl-two">
                  <PerceptualField point={diag.point} highlight={diag.primary} target={target} size={300} />
                  <div>
                    <p style={{ fontSize: 15, margin: "4px 0 16px" }}>
                      Ziel-System <strong style={{ color: T.color }}>{target}</strong> — {T.gefuehl}.
                      {diag.primary !== target && <> Aktuell wirkt das Material näher an <strong style={{ color: SYSTEMS[diag.primary].color }}>{diag.primary}</strong> — empfohlene Verschiebung.</>}
                    </p>
                    <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "-10px 0 16px" }}>
                      Prior-Strategie: <strong style={{ color: T.color }}>{strategy}</strong> — {strategy === "anknüpfen" ? "an feste Erwartung der Zielgruppe andocken." : strategy === "aufladen" ? "bewusst neue Bedeutung besetzen." : "Erwartung und Neuheit ausbalancieren."}
                    </p>
                    {gaps.map((g) => (
                      <div key={g.variable} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                          <span><strong>{VARIABLES[g.variable].label}</strong></span>
                          <span className="nl-mono" style={{ color: "var(--muted)" }}>Ist {g.ist} · Soll {g.soll[0]}–{g.soll[1]} {g.gap !== 0 && `· ${g.richtung}`}</span>
                        </div>
                        <BandTrack soll={g.soll} value={g.ist} color={T.color} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                  <Eyebrow>Konkrete Gestaltungsentscheidungen</Eyebrow>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 14 }}>
                    {rec.adjustments.length === 0 ? <li>Profil halten — bereits im Sweet Spot.</li>
                      : rec.adjustments.map((a) => <li key={a.variable} style={{ marginBottom: 4 }}><strong>{VARIABLES[a.variable].label} {a.richtung}:</strong> {a.hebel}</li>)}
                  </ul>
                </div>
                <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                  <Eyebrow>Zu testende Hypothese{hyps.length > 1 ? "n" : ""}</Eyebrow>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 14 }}>
                    {hyps.map((h, i) => <li key={i} style={{ marginBottom: 4 }}>{h.text} <span style={{ color: "var(--muted)" }}>({h.toolLabel})</span></li>)}
                  </ul>
                </div>
                {benchmarks.some(b => b.vorher !== "" || b.nachher !== "") && (() => {
                  const filled = benchmarks.filter(b => {
                    const v = parseFloat(b.vorher), n = parseFloat(b.nachher);
                    return !isNaN(v) && !isNaN(n) && b.vorher !== "" && b.nachher !== "" && v !== 0;
                  });
                  const lifts = filled.map(b => ((parseFloat(b.nachher) - parseFloat(b.vorher)) / Math.abs(parseFloat(b.vorher))) * 100);
                  const avgLift = filled.length ? lifts.reduce((s, x) => s + x, 0) / lifts.length : null;
                  return (
                    <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                      <Eyebrow>Performance-Vergleich</Eyebrow>
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px", gap: 0,
                          background: "#f6f8fa", padding: "6px 14px", borderBottom: "1px solid var(--line)" }}>
                          <span className="nl-eyebrow">Metrik</span>
                          <span className="nl-eyebrow" style={{ textAlign: "right" }}>Vorher</span>
                          <span className="nl-eyebrow" style={{ textAlign: "right", color: T.color }}>Nachher</span>
                          <span className="nl-eyebrow" style={{ textAlign: "right" }}>Lift</span>
                        </div>
                        {benchmarks.filter(b => b.label || b.vorher || b.nachher).map((b, i) => {
                          const v = parseFloat(b.vorher), n = parseFloat(b.nachher);
                          const hasData = !isNaN(v) && !isNaN(n) && b.vorher !== "" && b.nachher !== "" && v !== 0;
                          const lift = hasData ? ((n - v) / Math.abs(v)) * 100 : null;
                          return (
                            <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px",
                              padding: "8px 14px", borderBottom: i < benchmarks.length - 1 ? "1px solid var(--line)" : "none",
                              background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                              <span style={{ fontSize: 13, fontWeight: 500 }}>{b.label || "—"}{b.einheit ? ` (${b.einheit})` : ""}</span>
                              <span className="nl-mono" style={{ fontSize: 12.5, textAlign: "right", color: "var(--muted)" }}>
                                {b.vorher !== "" ? `${b.vorher}${b.einheit}` : "—"}
                              </span>
                              <span className="nl-mono" style={{ fontSize: 12.5, textAlign: "right", color: T.color, fontWeight: 600 }}>
                                {b.nachher !== "" ? `${b.nachher}${b.einheit}` : "—"}
                              </span>
                              <span className="nl-mono" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 700,
                                color: lift === null ? "var(--muted)" : lift >= 0 ? "#0a7a52" : "#991b1b" }}>
                                {lift !== null ? `${lift > 0 ? "+" : ""}${lift.toFixed(1)} %` : "—"}
                              </span>
                            </div>
                          );
                        })}
                        {avgLift !== null && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px 90px",
                            padding: "9px 14px", background: avgLift >= 0 ? "#eafaf2" : "#fef2f2",
                            borderTop: "2px solid var(--line)" }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>Ø Lift gesamt</span>
                            <span /><span />
                            <span className="nl-mono" style={{ fontSize: 13, textAlign: "right", fontWeight: 700,
                              color: avgLift >= 0 ? "#0a7a52" : "#991b1b" }}>
                              {avgLift > 0 ? "+" : ""}{avgLift.toFixed(1)} %
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {madeList.length > 0 && (
                  <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                    <Eyebrow>Erzeugte Deliverables</Eyebrow>
                    <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 12 }}>
                      {madeList.map((t) => {
                        const Icon = DELIVERABLES[t].Icon;
                        return (
                          <div key={t} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 16, borderLeft: `3px solid ${T.color}`, pageBreakInside: "avoid" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                              <Icon size={15} /><strong style={{ fontSize: 14 }}>{DELIVERABLES[t].label}</strong>
                            </div>
                            <DeliverableView type={t} obj={generated[t]} color={T.color} />
                            {genImage[t] && (
                              <img src={`data:image/png;base64,${genImage[t]}`} alt="Generiertes Visual"
                                   style={{ width: "100%", borderRadius: 10, marginTop: 14, border: "1px solid var(--line)" }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            <div className="nl-noprint" style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button className="nl-btn ghost" onClick={() => go(step - 1)} disabled={step === 0}><ArrowLeft size={15} /> Zurück</button>
              {step < STEPS.length - 1
                ? <button className="nl-btn" onClick={() => go(step + 1)}>Weiter: {STEPS[step + 1].title} <ArrowRight size={15} /></button>
                : <button className="nl-btn" onClick={() => go(0)}>Neue Runde <ArrowRight size={15} /></button>}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
