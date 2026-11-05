/**
 * Every word on the page lives here, in one voice (docs/design_doc.md §A8).
 * Fictional people, real places, real standards, exact numbers.
 */
import type { StopId } from "./world";

export type ObjectId =
  | "rig"
  | "mukho"
  | "priya"
  | "dumper"
  | "theo"
  | "archive"
  | "mole"
  | "fossil"
  | "lumpy"
  | "rulers"
  | "hats"
  | "tortoise";

export interface FieldNote {
  id: ObjectId;
  stop: StopId;
  name: string;
  bubble: string;
  title: string;
  body: string;
}

export const FIELD_NOTES: Record<ObjectId, FieldNote> = {
  rig: {
    id: "rig", stop: "collar", name: "Rig 7", bubble: "Spudding in since 06:00.",
    title: "Rig 7, North Karanpura",
    body: "A borehole costs lakhs of rupees and weeks of drilling. The log it produces then sits in a file for decades. GeoMine makes sure it gets read.",
  },
  mukho: {
    id: "mukho", stop: "collar", name: "Mukho, chief geologist", bubble: "Seam IX is 8.42 m. I have receipts.",
    title: "Er. S. Mukhopadhyay (fictional), RI-II Ranchi",
    body: "Signs off seam thickness for the National Coal Inventory. In GeoMine every number Mukho approves links to the scanned page, the box on that page, and a SHA-256 of the text.",
  },
  priya: {
    id: "priya", stop: "collar", name: "Priya, desk officer", bubble: "PQ due at 11. It is 10:59.",
    title: "Ministry desk, Parliament question day",
    body: "A starred question needs a verified reply, fast. PQ Fast-Response mode drafts it in the formal format with numbered citations. Target: under 45 seconds.",
  },
  dumper: {
    id: "dumper", stop: "collar", name: "Dumper", bubble: "Beep. Wrong department.",
    title: "Not our department",
    body: "GeoMine handles exploration records, not haulage. The dumper is here because the diorama looked empty without it.",
  },
  theo: {
    id: "theo", stop: "collar", name: "Theo the theodolite", bubble: "Looking at you. In WGS84.",
    title: "Coordinates you can trust",
    body: "Collar positions are stored in WGS84 / UTM Zone 45N with elevation above mean sea level, ready for the Bhuvan block map.",
  },
  archive: {
    id: "archive", stop: "alluvium", name: "Archive box, 1998", bubble: "I've been in a cupboard since 1998.",
    title: "MECL 1998 rotary survey",
    body: "Typed tables, hand corrections, coffee rings. GeoMine scans it with Google Cloud Vision (Tesseract when offline) and keeps the page number and box for every value.",
  },
  mole: {
    id: "mole", stop: "alluvium", name: "Scanner mole", bubble: "Page 12, Table 3, Row 4. Got it.",
    title: "Bounding boxes, not vibes",
    body: "Each extracted value remembers where it came from: document, page, x, y, width, height. Click a fact in the workspace and the box lights up on the scan.",
  },
  fossil: {
    id: "fossil", stop: "sandstone", name: "Glossopteris", bubble: "Your coal was me, 270 million years ago.",
    title: "Fun fact: Gondwana coal",
    body: "Most Indian coal formed from Glossopteris forests in the Permian, about 270 million years ago. Their leaves are the classic fossil of the Damodar valley coalfields.",
  },
  lumpy: {
    id: "lumpy", stop: "seam-ix", name: "Lumpy, Grade G7", bubble: "5,420 kcal/kg and proud of it.",
    title: "Seam IX proximate assay",
    body: "Gross calorific value 5,420 kcal/kg, Grade G7 non-coking. GeoMine reads assays as numbers, so you can filter every borehole by ash % or GCV in one query.",
  },
  rulers: {
    id: "rulers", stop: "interburden", name: "Two rulers", bubble: "6.80!  ·  8.42!",
    title: "Same seam, two answers",
    body: "MECL's 1998 rotary survey says 6.80 m. CMPDI's 2021 sonic caliper log says 8.42 m. GeoMine doesn't pick a winner. It puts both on the table, with sources, for the committee.",
  },
  hats: {
    id: "hats", stop: "seam-x", name: "Hat rack", bubble: "One for each kind of busy.",
    title: "Four roles, one record",
    body: "Geologists approve, desk officers draft, reviewers reconcile, DGMS auditors export. Everyone sees the same numbers.",
  },
  tortoise: {
    id: "tortoise", stop: "bedrock", name: "Bedrock tortoise", bubble: "Slow questions. Solid answers.",
    title: "Down here, nothing moves",
    body: "Basement rock under the Gondwana sequence. Like a good audit trail: old, boring, and very hard to change.",
  },
};

export const STOP_OBJECTS: Record<StopId, ObjectId[]> = {
  collar: ["rig", "mukho", "priya", "dumper", "theo"],
  alluvium: ["archive", "mole"],
  sandstone: ["fossil"],
  "seam-ix": ["lumpy"],
  interburden: ["rulers"],
  "seam-x": ["hats"],
  bedrock: ["tortoise"],
  "core-shed": [],
};

export const COPY = {
  brand: "GeoMine",
  brandTag: "SIH26023 · CMPDI / CIL",
  skip: "Skip to the content",
  canvasLabel:
    "A paper-craft 3D cutaway of a coal block. A drill rig stands on the surface; below it are layers of alluvium, sandstone, coal seam IX, interburden, coal seam X and basement rock.",
  loader: { title: "Spudding in", sub: "Stacking 312 m of rock" },
  header: {
    depth: "Depth",
    night: "Night shift",
    sound: "Sound",
    flat: "Flat mode",
  },
  poke: "Poke around",
  collar: {
    kicker: "Run 00 · Collar · North Karanpura, NK-094",
    titleA: "Three hours of",
    titleKey: "digging",
    titleB: "through files. Forty-two seconds of answers.",
    lede: "CMPDI keeps decades of drill logs, survey reports and assay sheets. GeoMine reads them, checks them against each other, and answers with a citation on every number.",
    cta: "Drop the drill",
    ctaAlt: "Ask the core now",
    scrollHint: "scroll to drill",
  },
  alluvium: {
    kicker: "Run 01 · Alluvium · 0–42 m",
    titleA: "How a scan",
    titleKey: "becomes",
    titleB: "a fact",
    steps: [
      { n: "01", title: "Scan it", body: "Drop in a scanned PDF, litholog plate or spreadsheet. OCR reads it and keeps the page and box of every value." },
      { n: "02", title: "Log it", body: "Depths, lithology, recovery and seam codes land in proper tables, not a text blob." },
      { n: "03", title: "Check it", body: "The validation agent rejects impossible numbers and flags seams where two agencies disagree." },
      { n: "04", title: "Sign it", body: "A geologist approves. The approval, the officer and a SHA-256 of the source go into the audit trail." },
    ],
  },
  sandstone: {
    kicker: "Run 02 · Sandstone · 42–114 m",
    titleA: "What's in the",
    titleKey: "core box",
    features: [
      { tag: "FR-1 · FR-10", title: "Report Studio", body: "Executive Summary, Historical Trend, Statutory Audit, PQ Fast-Response. Pick one, pick a block, get a cited draft." },
      { tag: "FR-9", title: "Parliament question mode", body: "Formal reply format, numbered citations, built for the 10:59 deadline." },
      { tag: "FR-8", title: "Conflict timeline", body: "Every disagreement between MECL, GSI and CMPDI surveys, in date order, with both sources." },
      { tag: "FR-13", title: "Evidence viewer", body: "Click any number and see the scanned page with the box drawn around it." },
      { tag: "FR-17", title: "Block map", body: "Borehole pins on the cadastral map. Green verified, amber under review." },
    ],
  },
  seamIx: {
    kicker: "Run 03 · Seam IX · 114.3–122.7 m",
    titleA: "Ask the",
    titleKey: "core",
    lede: "This box talks to the real GeoMine API. No canned answers: if the backend is down, it will tell you.",
    label: "Your question about a borehole or seam",
    placeholder: "What is the verified thickness of Seam IX at NK-094?",
    suggestions: [
      "What is the verified thickness of Seam IX at NK-094?",
      "Which boreholes in North Karanpura have ash above 35%?",
      "Draft a PQ reply on proved reserves in NK-IV",
    ],
    submit: "Drill for an answer",
    loading: "Drilling…",
    empty: "The core came back empty. Try naming a borehole or a seam.",
    error: "Couldn't reach the core. Start the backend on port 8000 (see docs/setup.md) and try again.",
    benchTitle: "Manual vs GeoMine",
    benchManual: "Manual compilation",
    benchManualValue: "3 h 40 m",
    benchAi: "This answer",
    benchNote: "Manual baseline from the PRD estimate. The GeoMine time is measured on this request.",
    routing: "Route",
    confidence: "Confidence",
    citations: "Sources",
    verified: "Validated",
    unverified: "Not validated",
  },
  interburden: {
    kicker: "Run 04 · Interburden · 122.7–131 m",
    titleA: "When the",
    titleKey: "records",
    titleB: "argue",
    lede: "Old surveys and new logs disagree all the time. GeoMine shows both, the gap, and who signed what.",
    live: "Live from the verification queue",
    example: "Example from the design spec (backend offline)",
    delta: "Delta",
    status: "Status",
    docket: "Docket",
  },
  seamX: {
    kicker: "Run 05 · Seam X · 131–139 m",
    titleA: "Pick your",
    titleKey: "hard hat",
    lede: "Same records, four jobs. Each hat opens the Officer Workspace for that role.",
    roles: [
      { id: "GEOLOGIST", hat: "Geologist", does: "Approve seam thickness into the National Coal Inventory." },
      { id: "DESK_OFFICER", hat: "Desk officer", does: "Draft cited replies to Parliament questions." },
      { id: "REVIEWER", hat: "Reviewer", does: "Settle MECL vs CMPDI arguments with evidence side by side." },
      { id: "DGMS_AUDITOR", hat: "DGMS auditor", does: "Export Form-V registers and audit dockets." },
    ],
    cta: "Enter workspace",
    note: "Sign-in arrives with Firebase Auth. Until then the workspace opens in demo mode.",
  },
  bedrock: {
    kicker: "Run 06 · Basement · 139–312 m",
    titleA: "Questions from the",
    titleKey: "bottom",
    faqs: [
      { q: "Does the AI make up numbers?", a: "No. Numbers come from database queries and fixed mining formulas. The language model only words the answer. A number without a source is dropped." },
      { q: "What if OCR can't read a 1998 scan?", a: "The job is marked “no text detected” and goes to a person. GeoMine never fills gaps with guesses." },
      { q: "Where does the data live?", a: "In the project database (SQLite for the prototype, Postgres for deployment) with files in project storage. Nothing is sent anywhere except the OCR and language-model calls you configure." },
      { q: "Is this GIGW compliant?", a: "The Officer Workspace follows GIGW 3.0 and WCAG 2.1 AA. This 3D front door has a flat mode, keyboard access and screen-reader text for everything in the scene." },
      { q: "Can other tools use GeoMine?", a: "Yes, through the REST API, and soon as an MCP server so assistants can ask cited questions directly." },
    ],
  },
  coreShed: {
    kicker: "Core shed · back on top",
    titleA: "Every seam has a",
    titleKey: "paper trail",
    titleB: ". Now someone reads it.",
    credits: "Built by Team Race Condition for Smart India Hackathon 2026, problem statement SIH26023, Ministry of Coal.",
    links: [
      { label: "Docs", href: "https://github.com/codeigniter6125/SIH-26023-AI-POWERED-MINING/tree/main/docs" },
      { label: "API (local)", href: "http://localhost:8000/docs" },
      { label: "Workspace (local)", href: "http://localhost:3000" },
    ],
    top: "Back to the collar",
  },
  fieldNote: { close: "Close note", label: "Field note" },
};

export const WORKSPACE_URL = (import.meta.env.VITE_WORKSPACE_URL as string | undefined) ?? "http://localhost:3000";
