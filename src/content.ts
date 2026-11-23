export type SourceLink = {
  label: string;
  url: string;
  note: string;
};

export type PageVisual = {
  file: string;
  alt: string;
  caption: string;
};

export type TreatmentArea = {
  slug: string;
  label: string;
  shortLabel: string;
  summary: string;
  visual: PageVisual;
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
    visual: {
      file: "treatments/cancer-care",
      alt: "Clinicians reviewing medical imaging together during a diagnostic discussion",
      caption: "Illustrative diagnostic-imaging photograph. No HealSpoc clinician or patient is shown.",
    },
  },
  {
    slug: "cardiac-care",
    label: "Cardiac care",
    shortLabel: "Cardiac",
    summary:
      "A broad enquiry category for questions about heart-related care and how to confirm current provider information.",
    visual: {
      file: "treatments/cardiac-care",
      alt: "A clinician discussing an electrocardiogram displayed on a monitor",
      caption: "Illustrative electrocardiogram discussion. No HealSpoc clinician or patient is shown.",
    },
  },
  {
    slug: "brain-spine",
    label: "Brain and spine care",
    shortLabel: "Brain and spine",
    summary:
      "A broad enquiry category for questions about brain, nerve, and spine-related care options.",
    visual: {
      file: "treatments/brain-spine",
      alt: "A sequence of spinal radiology images displayed for clinical review",
      caption: "Illustrative spinal imaging. This is not a patient record supplied to HealSpoc.",
    },
  },
  {
    slug: "orthopaedics",
    label: "Orthopaedics",
    shortLabel: "Orthopaedics",
    summary:
      "A broad enquiry category for questions about bone, joint, and musculoskeletal care.",
    visual: {
      file: "treatments/orthopaedics",
      alt: "A healthcare professional assessing an arm joint during an examination",
      caption: "Illustrative joint examination. No HealSpoc clinician or patient is shown.",
    },
  },
  {
    slug: "weight-loss",
    label: "Weight and bariatric care",
    shortLabel: "Weight and bariatric",
    summary:
      "A broad enquiry category for people exploring clinician-led assessment and care related to weight management.",
    visual: {
      file: "treatments/weight-loss",
      alt: "People discussing a nutrition chart at a table",
      caption: "Illustrative nutrition discussion, not a bariatric treatment or patient outcome.",
    },
  },
  {
    slug: "endocrine-care",
    label: "Endocrine care",
    shortLabel: "Endocrine",
    summary:
      "A broad enquiry category for questions about hormone and endocrine-related care.",
    visual: {
      file: "treatments/endocrine-care",
      alt: "A healthcare professional examining a patient's neck in a clinic",
      caption: "Illustrative neck examination, one possible clinical context for endocrine questions.",
    },
  },
  {
    slug: "eye-care",
    label: "Eye care",
    shortLabel: "Eye care",
    summary:
      "A broad enquiry category for questions about eye health and possible provider options.",
    visual: {
      file: "treatments/eye-care",
      alt: "An optometrist fitting a trial frame during an eye examination",
      caption: "Illustrative vision examination. No HealSpoc clinician or patient is shown.",
    },
  },
  {
    slug: "dental-care",
    label: "Dental care",
    shortLabel: "Dental",
    summary:
      "A broad enquiry category for questions about dental care and provider information.",
    visual: {
      file: "treatments/dental-care",
      alt: "A dental professional demonstrating a model of human teeth",
      caption: "Illustrative dental model, not evidence of a HealSpoc dental provider.",
    },
  },
  {
    slug: "womens-health",
    label: "Women's health",
    shortLabel: "Women's health",
    summary:
      "A broad enquiry category for questions about women's health and related provider options.",
    visual: {
      file: "treatments/womens-health",
      alt: "A woman speaking with a healthcare professional during a consultation",
      caption: "Illustrative healthcare conversation. No HealSpoc clinician or patient is shown.",
    },
  },
];

export const medicalTravelVisual: PageVisual = {
  file: "treatments/medical-travel",
  alt: "A traveller moving through an airport corridor with luggage",
  caption: "Illustrative travel photograph; it does not depict a HealSpoc journey or location.",
};

export const publicSources: SourceLink[] = [
  {
    label: "WHO: Travel and health",
    url: "https://www.who.int/health-topics/travel-and-health",
    note: "General travel-health information from the World Health Organization.",
  },
  {
    label: "WHO: International travel and health",
    url: "https://www.who.int/publications/i/item/9789240093584",
    note: "WHO Module 1 on general travel-health considerations; discuss individual concerns with a clinician.",
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
