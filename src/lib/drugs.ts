export type Status = "Verified" | "Flagged" | "Unknown";

export interface Drug {
  name: string;
  nafdac: string;
  manufacturer: string;
  status: Status;
  generics: string[];
}

export const DB: Drug[] = [
  { name: "Panadol Extra", nafdac: "A4-0123", manufacturer: "GlaxoSmithKline Nigeria", status: "Verified", generics: ["Paracetamol 500mg", "Emzor Paracetamol", "M&B Paracetamol"] },
  { name: "Amoxil 500mg", nafdac: "A4-7781", manufacturer: "GSK Pharmaceuticals", status: "Verified", generics: ["Amoxicillin 500mg", "Fidson Amoxicillin", "Emzor Amoxil"] },
  { name: "Coartem", nafdac: "A4-5566", manufacturer: "Novartis Pharma AG", status: "Verified", generics: ["Artemether/Lumefantrine", "Lonart", "Amatem Forte"] },
  { name: "Postinor-2", nafdac: "A4-9912", manufacturer: "Gedeon Richter Plc", status: "Flagged", generics: ["Levonorgestrel 0.75mg", "Plan B"] },
  { name: "Flagyl 200mg", nafdac: "A4-3344", manufacturer: "Sanofi Aventis Nigeria", status: "Verified", generics: ["Metronidazole 200mg", "Emzol", "Fidson Metronidazole"] },
  { name: "Augmentin 625mg", nafdac: "A4-2210", manufacturer: "GlaxoSmithKline", status: "Verified", generics: ["Amoxicillin/Clavulanate", "Clavulin", "Fidson Augmentin"] },
  { name: "Ciprotab 500mg", nafdac: "A4-4421", manufacturer: "Fidson Healthcare Plc", status: "Verified", generics: ["Ciprofloxacin 500mg", "Ciproxin", "Emzor Ciprofloxacin"] },
  { name: "Lonart DS", nafdac: "A4-6677", manufacturer: "Bliss GVS Pharma", status: "Verified", generics: ["Artemether/Lumefantrine 80/480mg", "Coartem", "Amatem Forte"] },
  { name: "Tylenol", nafdac: "A4-1188", manufacturer: "Johnson & Johnson", status: "Verified", generics: ["Paracetamol 500mg", "Panadol", "Emzor Paracetamol"] },
  { name: "Ventolin Inhaler", nafdac: "A4-8834", manufacturer: "GlaxoSmithKline", status: "Verified", generics: ["Salbutamol Inhaler", "Asthalin", "Salbutol"] },
  { name: "Glucophage 500mg", nafdac: "A4-5512", manufacturer: "Merck Serono", status: "Verified", generics: ["Metformin 500mg", "Diaformin", "Emzor Metformin"] },
  { name: "Lipitor 20mg", nafdac: "A4-7723", manufacturer: "Pfizer Inc.", status: "Verified", generics: ["Atorvastatin 20mg", "Atorlip", "Storvas"] },
  { name: "Amatem Forte", nafdac: "A4-3398", manufacturer: "Emzor Pharmaceutical", status: "Verified", generics: ["Artemether/Lumefantrine", "Coartem", "Lonart"] },
  { name: "Zinnat 500mg", nafdac: "A4-9087", manufacturer: "GlaxoSmithKline", status: "Verified", generics: ["Cefuroxime 500mg", "Ceftin", "Cefurox"] },
  { name: "Diclofenac Sodium 50mg", nafdac: "A4-2256", manufacturer: "Emzor Pharmaceutical", status: "Verified", generics: ["Voltaren", "Cataflam", "Dicloflam"] },
  { name: "Loratadine 10mg", nafdac: "A4-6645", manufacturer: "Fidson Healthcare Plc", status: "Verified", generics: ["Claritin", "Lorano", "Emzor Loratadine"] },
  { name: "Septrin", nafdac: "A4-1102", manufacturer: "GlaxoSmithKline", status: "Verified", generics: ["Co-trimoxazole", "Bactrim", "Sulfamethoxazole/Trimethoprim"] },
  { name: "Omeprazole 20mg", nafdac: "A4-4478", manufacturer: "May & Baker Nigeria", status: "Verified", generics: ["Losec", "Omez", "Emzor Omeprazole"] },
  { name: "Tramadol 100mg", nafdac: "B4-0099", manufacturer: "Unknown Importer", status: "Flagged", generics: ["Tramal", "Ultram"] },
  { name: "Codeine Linctus", nafdac: "B4-0042", manufacturer: "Emzor Pharmaceutical", status: "Flagged", generics: ["Benylin with Codeine", "Phensedyl"] },
  { name: "Vitamin C 1000mg", nafdac: "A4-7754", manufacturer: "Emzor Pharmaceutical", status: "Verified", generics: ["Ascorbic Acid", "Redoxon", "Celin"] },
  { name: "Folic Acid 5mg", nafdac: "A4-3321", manufacturer: "May & Baker Nigeria", status: "Verified", generics: ["Folvite", "Emzor Folic Acid"] },
  { name: "Aspirin 75mg", nafdac: "A4-1190", manufacturer: "Bayer Nigeria", status: "Verified", generics: ["Disprin", "Ecotrin", "Emzor Aspirin"] },
  { name: "Ibuprofen 400mg", nafdac: "A4-2287", manufacturer: "Emzor Pharmaceutical", status: "Verified", generics: ["Brufen", "Nurofen", "Advil"] },
  { name: "Lisinopril 10mg", nafdac: "A4-5523", manufacturer: "Fidson Healthcare Plc", status: "Verified", generics: ["Zestril", "Prinivil", "Emzor Lisinopril"] },
  { name: "Amlodipine 5mg", nafdac: "A4-6612", manufacturer: "May & Baker Nigeria", status: "Verified", generics: ["Norvasc", "Amlovas", "Tenox"] },
  { name: "Warfarin 5mg", nafdac: "A4-3390", manufacturer: "Bristol Myers Squibb", status: "Verified", generics: ["Coumadin", "Marevan"] },
  { name: "Insulin (Mixtard 30)", nafdac: "A4-7799", manufacturer: "Novo Nordisk", status: "Verified", generics: ["Humulin 70/30", "Insugen 30/70"] },
  { name: "Levofloxacin 500mg", nafdac: "A4-8801", manufacturer: "Fidson Healthcare Plc", status: "Verified", generics: ["Levaquin", "Tavanic"] },
  { name: "Erythromycin 500mg", nafdac: "A4-2244", manufacturer: "Emzor Pharmaceutical", status: "Verified", generics: ["Erythrocin", "EryTab"] },
  { name: "Azithromycin 500mg", nafdac: "A4-9923", manufacturer: "Pfizer Inc.", status: "Verified", generics: ["Zithromax", "Azimax", "Azee"] },
  { name: "Fluconazole 150mg", nafdac: "A4-3361", manufacturer: "May & Baker Nigeria", status: "Verified", generics: ["Diflucan", "Forcan"] },
  { name: "Prednisolone 5mg", nafdac: "A4-4498", manufacturer: "Emzor Pharmaceutical", status: "Verified", generics: ["Predfoam", "Deltacortril"] },
  { name: "Hydrochlorothiazide 25mg", nafdac: "A4-5587", manufacturer: "May & Baker Nigeria", status: "Verified", generics: ["Microzide", "HCTZ"] },
  { name: "Losartan 50mg", nafdac: "A4-6638", manufacturer: "Fidson Healthcare Plc", status: "Verified", generics: ["Cozaar", "Losacar"] },
  { name: "Clopidogrel 75mg", nafdac: "A4-7745", manufacturer: "Sanofi Aventis Nigeria", status: "Verified", generics: ["Plavix", "Clopilet"] },
];

export function searchDrugs(q: string): Drug | "unknown" | null {
  const query = q.trim().toLowerCase();
  if (!query) return null;
  const found = DB.find(
    (d) =>
      d.name.toLowerCase().includes(query) ||
      d.nafdac.toLowerCase().replace(/[-\s]/g, "") === query.replace(/[-\s]/g, ""),
  );
  return found ?? "unknown";
}

export type Severity = "Major" | "Moderate" | "Minor";
export type Evidence = "High" | "Medium" | "Low";

export interface Interaction {
  a: string;
  b: string;
  severity: Severity;
  note: string;
  evidence?: Evidence;
}

export const ACTIVE_INGREDIENT: Record<string, string> = {
  "Panadol Extra": "paracetamol",
  Tylenol: "paracetamol",
  "Amoxil 500mg": "amoxicillin",
  "Augmentin 625mg": "amoxicillin",
  Coartem: "artemether",
  "Lonart DS": "artemether",
  "Amatem Forte": "artemether",
  "Postinor-2": "levonorgestrel",
  "Flagyl 200mg": "metronidazole",
  "Ciprotab 500mg": "ciprofloxacin",
  "Ventolin Inhaler": "salbutamol",
  "Glucophage 500mg": "metformin",
  "Lipitor 20mg": "atorvastatin",
  "Zinnat 500mg": "cefuroxime",
  "Diclofenac Sodium 50mg": "diclofenac",
  "Loratadine 10mg": "loratadine",
  Septrin: "co-trimoxazole",
  "Omeprazole 20mg": "omeprazole",
  "Tramadol 100mg": "tramadol",
  "Codeine Linctus": "codeine",
  "Vitamin C 1000mg": "ascorbic acid",
  "Folic Acid 5mg": "folic acid",
  "Aspirin 75mg": "aspirin",
  "Ibuprofen 400mg": "ibuprofen",
  "Lisinopril 10mg": "lisinopril",
  "Amlodipine 5mg": "amlodipine",
  "Warfarin 5mg": "warfarin",
  "Insulin (Mixtard 30)": "insulin",
  "Levofloxacin 500mg": "levofloxacin",
  "Erythromycin 500mg": "erythromycin",
  "Azithromycin 500mg": "azithromycin",
  "Fluconazole 150mg": "fluconazole",
  "Prednisolone 5mg": "prednisolone",
  "Hydrochlorothiazide 25mg": "hydrochlorothiazide",
  "Losartan 50mg": "losartan",
  "Clopidogrel 75mg": "clopidogrel",
};

export const INTERACTIONS: Interaction[] = [
  { a: "tramadol", b: "codeine", severity: "Major", note: "Combined opioids increase risk of respiratory depression, sedation, and overdose." },
  { a: "tramadol", b: "paracetamol", severity: "Minor", note: "Generally safe combination, but watch total daily paracetamol dose (max 4g)." },
  { a: "diclofenac", b: "paracetamol", severity: "Minor", note: "Often co-prescribed; monitor for GI irritation with prolonged diclofenac use." },
  { a: "ciprofloxacin", b: "metformin", severity: "Moderate", note: "Ciprofloxacin may alter blood glucose levels in patients on metformin." },
  { a: "atorvastatin", b: "ciprofloxacin", severity: "Moderate", note: "Increased risk of myopathy/rhabdomyolysis when combined." },
  { a: "metronidazole", b: "atorvastatin", severity: "Moderate", note: "Metronidazole may increase atorvastatin levels — monitor for muscle pain." },
  { a: "omeprazole", b: "atorvastatin", severity: "Minor", note: "Minor pharmacokinetic interaction; clinically usually insignificant." },
  { a: "co-trimoxazole", b: "metformin", severity: "Major", note: "Increases risk of hypoglycemia. Monitor blood sugar closely." },
  { a: "codeine", b: "paracetamol", severity: "Minor", note: "Common combination (e.g., co-codamol). Respect paracetamol daily limit." },
  { a: "amoxicillin", b: "levonorgestrel", severity: "Moderate", note: "Antibiotics may reduce hormonal contraceptive effectiveness — use backup method." },
  { a: "salbutamol", b: "atorvastatin", severity: "Minor", note: "No significant interaction expected." },
  { a: "warfarin", b: "aspirin", severity: "Major", note: "Significantly increased bleeding risk. Avoid unless under close INR monitoring." },
  { a: "warfarin", b: "ibuprofen", severity: "Major", note: "NSAIDs raise GI bleeding risk and may potentiate warfarin effect." },
  { a: "warfarin", b: "diclofenac", severity: "Major", note: "Severe bleeding risk; avoid combination." },
  { a: "warfarin", b: "metronidazole", severity: "Major", note: "Metronidazole markedly increases warfarin effect — risk of severe bleeding." },
  { a: "warfarin", b: "ciprofloxacin", severity: "Major", note: "Quinolones potentiate warfarin; monitor INR closely." },
  { a: "warfarin", b: "fluconazole", severity: "Major", note: "Fluconazole strongly inhibits warfarin metabolism — bleeding risk." },
  { a: "warfarin", b: "clopidogrel", severity: "Major", note: "Dual antithrombotic therapy increases major bleeding risk." },
  { a: "warfarin", b: "paracetamol", severity: "Moderate", note: "Regular paracetamol use can elevate INR — monitor if prolonged." },
  { a: "warfarin", b: "co-trimoxazole", severity: "Major", note: "Markedly increases bleeding risk — avoid or monitor INR very closely." },
  { a: "warfarin", b: "azithromycin", severity: "Moderate", note: "Macrolides can potentiate warfarin effect — monitor INR." },
  { a: "warfarin", b: "erythromycin", severity: "Moderate", note: "May increase warfarin effect; monitor INR." },
  { a: "warfarin", b: "levofloxacin", severity: "Major", note: "Quinolones potentiate warfarin — bleeding risk." },
  { a: "aspirin", b: "ibuprofen", severity: "Moderate", note: "Ibuprofen can blunt aspirin's cardioprotective effect; separate dosing or avoid." },
  { a: "aspirin", b: "clopidogrel", severity: "Moderate", note: "Often co-prescribed but raises bleeding risk — only under specialist guidance." },
  { a: "ibuprofen", b: "lisinopril", severity: "Moderate", note: "NSAIDs reduce ACE inhibitor effect and increase kidney injury risk." },
  { a: "ibuprofen", b: "losartan", severity: "Moderate", note: "NSAIDs blunt ARB efficacy and may worsen renal function." },
  { a: "ibuprofen", b: "hydrochlorothiazide", severity: "Moderate", note: "NSAIDs reduce diuretic effect and elevate kidney injury risk." },
  { a: "diclofenac", b: "lisinopril", severity: "Moderate", note: "Reduced antihypertensive effect; risk of acute kidney injury." },
  { a: "lisinopril", b: "losartan", severity: "Major", note: "Dual RAAS blockade increases hyperkalemia, hypotension and renal failure risk." },
  { a: "lisinopril", b: "hydrochlorothiazide", severity: "Minor", note: "Common combination for hypertension; monitor electrolytes and renal function." },
  { a: "erythromycin", b: "atorvastatin", severity: "Major", note: "Erythromycin inhibits statin metabolism — high rhabdomyolysis risk." },
  { a: "azithromycin", b: "levofloxacin", severity: "Major", note: "Both prolong QT interval — additive risk of life-threatening arrhythmia." },
  { a: "erythromycin", b: "levofloxacin", severity: "Major", note: "Additive QT prolongation — avoid combination." },
  { a: "azithromycin", b: "fluconazole", severity: "Moderate", note: "Both can prolong QT interval; use cautiously together." },
  { a: "levofloxacin", b: "metformin", severity: "Moderate", note: "May affect glucose control — monitor blood sugar." },
  { a: "prednisolone", b: "metformin", severity: "Moderate", note: "Steroids raise blood glucose and may reduce metformin efficacy — monitor sugars." },
  { a: "prednisolone", b: "insulin", severity: "Moderate", note: "Steroids increase insulin requirements; monitor glucose closely." },
  { a: "hydrochlorothiazide", b: "metformin", severity: "Minor", note: "Thiazides may slightly raise blood glucose; monitor sugars." },
  { a: "prednisolone", b: "ibuprofen", severity: "Moderate", note: "Combined GI ulcer and bleeding risk — consider gastroprotection." },
  { a: "prednisolone", b: "diclofenac", severity: "Moderate", note: "High GI bleeding risk; avoid or co-prescribe a PPI." },
  { a: "prednisolone", b: "aspirin", severity: "Moderate", note: "Increased GI bleeding risk; gastroprotection advised." },
  { a: "atorvastatin", b: "fluconazole", severity: "Moderate", note: "Fluconazole raises statin levels — monitor for muscle pain." },
  { a: "atorvastatin", b: "amlodipine", severity: "Minor", note: "Amlodipine may modestly raise atorvastatin levels — usually well tolerated." },
  { a: "azithromycin", b: "levonorgestrel", severity: "Moderate", note: "Antibiotics may reduce contraceptive efficacy — use backup method." },
  { a: "fluconazole", b: "levonorgestrel", severity: "Minor", note: "Possible minor reduction in efficacy; backup method advisable." },
  { a: "artemether", b: "fluconazole", severity: "Moderate", note: "Both can prolong QT interval — use with caution." },
  { a: "artemether", b: "azithromycin", severity: "Moderate", note: "Additive QT prolongation risk." },
  { a: "artemether", b: "erythromycin", severity: "Moderate", note: "Additive QT risk; avoid combination if possible." },
];

export function findInteraction(ingA: string, ingB: string): Interaction | undefined {
  return INTERACTIONS.find(
    (i) => (i.a === ingA && i.b === ingB) || (i.a === ingB && i.b === ingA),
  );
}

const EVIDENCE_OVERRIDES: Record<string, Evidence> = {
  "aspirin|ibuprofen": "High",
  "ibuprofen|lisinopril": "High",
  "ibuprofen|losartan": "High",
  "paracetamol|warfarin": "High",
  "insulin|prednisolone": "High",
  "metformin|prednisolone": "High",
  "amoxicillin|levonorgestrel": "Low",
  "azithromycin|levonorgestrel": "Low",
  "fluconazole|levonorgestrel": "Low",
  "ciprofloxacin|metformin": "Medium",
  "atorvastatin|salbutamol": "Low",
  "atorvastatin|omeprazole": "Low",
  "amlodipine|atorvastatin": "Low",
};

export function getEvidence(i: Interaction): Evidence {
  if (i.evidence) return i.evidence;
  const key = [i.a, i.b].sort().join("|");
  if (EVIDENCE_OVERRIDES[key]) return EVIDENCE_OVERRIDES[key];
  if (i.severity === "Major") return "High";
  if (i.severity === "Moderate") return "Medium";
  return "Low";
}

export const EVIDENCE_DESCRIPTION: Record<Evidence, string> = {
  High: "Well-documented in clinical guidelines and studies — flag is strongly supported.",
  Medium: "Reported in clinical literature; effect may vary between patients.",
  Low: "Limited or debated evidence; included as a precaution.",
};

export const SEVERITY_ACTION: Record<Severity, { label: string; detail: string }> = {
  Major: { label: "Avoid this combination", detail: "Do not take together unless explicitly directed by a physician. Seek immediate pharmacist or doctor review." },
  Moderate: { label: "Use with caution — consult a pharmacist", detail: "May be acceptable with monitoring or dose adjustment. Confirm with a licensed pharmacist before continuing both." },
  Minor: { label: "Take extra precautions", detail: "Generally safe together; observe dosage limits and watch for unusual side effects." },
};

export function severityClasses(s: Severity) {
  switch (s) {
    case "Major":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900";
    case "Moderate":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900";
    case "Minor":
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900";
  }
}

export function evidenceClasses(e: Evidence) {
  switch (e) {
    case "High":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    case "Medium":
      return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800";
    case "Low":
      return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700";
  }
}
