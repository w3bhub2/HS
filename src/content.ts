export type SourceLink = {
  label: string;
  url: string;
  note: string;
};

export type TreatmentArea = {
  slug: string;
  label: string;
  shortLabel: string;
  summary: string;
};

export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://healspoc.com").replace(/\/+$/, "");
const configuredBase = (import.meta.env.VITE_BASE_PATH || "/").replace(/^\/+|\/+$/g, "");
export const SITE_BASE_PATH = configuredBase ? `/${configuredBase}/` : "/";
export const routePath = (path: string) => `${SITE_BASE_PATH}${path.replace(/^\/+/, "")}`;
export const assetPath = (path: string) => routePath(path);
export const WHATSAPP_NUMBER = "919108027762";
export const WHATSAPP_DISPLAY = "+91 9108027762";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const OFFICIAL_EMAIL = "hello@healspoc.com";

export const navigation = [
  { label: "Treatments", to: "/treatments/" },
  { label: "Patient journey", to: "/patient-journey/" },
  { label: "Medical travel", to: "/medical-travel-to-india/" },
  { label: "About", to: "/about/" },
  { label: "Resources", to: "/health-resources/" },
];

export const treatmentAreas: TreatmentArea[] = [
  {
    slug: "cancer-care",
    label: "Cancer care",
    shortLabel: "Cancer",
    summary:
      "A broad enquiry category for people asking about cancer-related care and possible provider options in India.",
  },
  {
    slug: "cardiac-care",
    label: "Cardiac care",
    shortLabel: "Cardiac",
    summary:
      "A broad enquiry category for questions about heart-related care and how to confirm current provider information.",
  },
  {
    slug: "brain-spine",
    label: "Brain and spine care",
    shortLabel: "Brain and spine",
    summary:
      "A broad enquiry category for questions about brain, nerve, and spine-related care options.",
  },
  {
    slug: "orthopaedics",
    label: "Orthopaedics",
    shortLabel: "Orthopaedics",
    summary:
      "A broad enquiry category for questions about bone, joint, and musculoskeletal care.",
  },
  {
    slug: "weight-loss",
    label: "Weight and bariatric care",
    shortLabel: "Weight and bariatric",
    summary:
      "A broad enquiry category for people exploring clinician-led assessment and care related to weight management.",
  },
  {
    slug: "endocrine-care",
    label: "Endocrine care",
    shortLabel: "Endocrine",
    summary:
      "A broad enquiry category for questions about hormone and endocrine-related care.",
  },
  {
    slug: "eye-care",
    label: "Eye care",
    shortLabel: "Eye care",
    summary:
      "A broad enquiry category for questions about eye health and possible provider options.",
  },
  {
    slug: "dental-care",
    label: "Dental care",
    shortLabel: "Dental",
    summary:
      "A broad enquiry category for questions about dental care and provider information.",
  },
  {
    slug: "womens-health",
    label: "Women's health",
    shortLabel: "Women's health",
    summary:
      "A broad enquiry category for questions about women's health and related provider options.",
  },
];

export const publicSources: SourceLink[] = [
  {
    label: "WHO: Travel and health",
    url: "https://www.who.int/health-topics/travel-and-health",
    note: "General travel-health information from the World Health Organization.",
  },
  {
    label: "WHO: International travel and health",
    url: "https://iris.who.int/server/api/core/bitstreams/dd53602a-029a-4d1a-8e43-b26428324e1f/content",
    note: "WHO travel-health guidance; advice should be discussed with a clinician where relevant.",
  },
  {
    label: "ICMR: Standard Treatment Workflows",
    url: "https://www.icmr.gov.in/downloadable-books",
    note: "Indian Council of Medical Research publications for clinical professionals; not individual advice.",
  },
  {
    label: "NABH: Accredited hospital directory",
    url: "https://portal.nabh.co/frmViewAccreditedHosp.aspx",
    note: "Use the official directory to check current hospital accreditation details directly.",
  },
  {
    label: "Government of India: e-Visa portal",
    url: "https://indianvisaonline.gov.in/evisa/tvoa.html",
    note: "Check current eligibility and requirements with the official visa authority.",
  },
];

export const faqs = [
  {
    question: "Is HealSpoc a hospital or medical provider?",
    answer:
      "No. HealSpoc is presented here as a healthcare facilitation service. Diagnosis, treatment recommendations, and medical care must come from a licensed healthcare provider.",
  },
  {
    question: "Who will answer my WhatsApp enquiry?",
    answer:
      "WhatsApp enquiries are handled by the HealSpoc human team. There is no AI medical assistant or automated diagnosis on this website.",
  },
  {
    question: "Can I see verified hospitals or doctors on this website?",
    answer:
      "No hospital or doctor profile is published in this release because current relationships, credentials, and profile details have not been verified for publication. Ask for direct, current evidence before making a decision.",
  },
  {
    question: "Can you provide an exact treatment cost?",
    answer:
      "No treatment price or estimate is published here. Request a dated, written estimate directly from the healthcare provider and check what is included, excluded, and subject to change.",
  },
  {
    question: "Can I send medical reports through the enquiry form?",
    answer:
      "No. The ordinary web form is only for a brief enquiry. Do not send reports, scans, diagnoses, or other sensitive medical records through it. Ask the healthcare provider how records can be shared securely.",
  },
  {
    question: "Does HealSpoc arrange visas, airport transfers, or accommodation?",
    answer:
      "This website does not promise those services. Ask the human team to confirm in writing what is currently available for your situation, and verify visa rules directly with the Government of India portal.",
  },
  {
    question: "How do I contact HealSpoc?",
    answer:
      `Write to ${OFFICIAL_EMAIL} or start a WhatsApp conversation at ${WHATSAPP_DISPLAY}.`,
  },
];

export const legacyRedirects: Record<string, string> = {
  "/gastric-balloon-surgery-cost-in-india/": "/treatments/weight-loss/",
  "/gastric-bypass-surgery-cost-in-india/": "/treatments/weight-loss/",
  "/lap-band-surgery-cost-in-india/": "/treatments/weight-loss/",
  "/sleeve-gastrectomy-surgery-cost-in-india/": "/treatments/weight-loss/",
  "/kyphosis-surgery-cost-in-india/": "/treatments/brain-spine/",
  "/brain-cancer-treatment-cost-in-india/": "/treatments/cancer-care/",
  "/goiter-removal-surgery-cost-in-india/": "/treatments/endocrine-care/",
};
