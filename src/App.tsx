import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { trackEvent } from "./analytics";
import { HealSpocMark, WhatsAppIcon } from "./brand";
import {
  OFFICIAL_EMAIL,
  SITE_BASE_PATH,
  SITE_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_URL,
  faqs,
  legacyRedirects,
  medicalTravelVisual,
  navigation,
  publicSources,
  assetPath,
  routePath,
  treatmentAreas,
  type SourceLink,
  type PageVisual,
  type TreatmentArea,
} from "./content";

type AppLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  to: string;
};

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type PageMetadata = {
  title: string;
  description: string;
};

export const pageMetadata: Record<string, PageMetadata> = {
  "/": {
    title: "HealSpoc | Healthcare facilitation in India",
    description:
      "Explore healthcare options in India and talk with the HealSpoc human team. HealSpoc facilitates enquiries; licensed providers make clinical decisions.",
  },
  "/about/": {
    title: "About HealSpoc | Healthcare facilitation",
    description:
      "Learn about HealSpoc's facilitation role, how the team handles enquiries, and the standards used for healthcare information.",
  },
  "/treatments/": {
    title: "Treatment areas in India | HealSpoc",
    description:
      "Explore broad treatment enquiry categories. Clinical details, providers, and costs require current verification and qualified medical review.",
  },
  "/hospitals/": {
    title: "Hospitals in India | HealSpoc",
    description:
      "HealSpoc does not publish hospital profiles until provider details and relationships are verified. Learn what to confirm directly.",
  },
  "/doctors-specialists/": {
    title: "Doctors and specialists | HealSpoc",
    description:
      "No doctor profiles are published without current credential and relationship checks. Learn how to request provider information.",
  },
  "/medical-travel-to-india/": {
    title: "Medical travel to India | HealSpoc",
    description:
      "A balanced guide to comparing care and travel considerations before exploring healthcare in India.",
  },
  "/patient-journey/": {
    title: "Patient journey | HealSpoc",
    description:
      "Understand a careful enquiry-to-travel process, with clinical decisions left to licensed healthcare providers.",
  },
  "/patient-assistance/": {
    title: "Patient assistance | HealSpoc",
    description:
      "Learn which practical assistance topics to discuss and why each service must be confirmed before you rely on it.",
  },
  "/health-resources/": {
    title: "Health resources | HealSpoc",
    description:
      "A curated directory of official travel, treatment, accreditation, and visa information for people exploring healthcare in India.",
  },
  "/health-resources/questions-to-ask-before-travel/": {
    title: "Questions to ask before medical travel | HealSpoc",
    description:
      "A non-clinical planning guide to questions about provider identity, costs, travel requirements, and follow-up care.",
  },
  "/faqs/": {
    title: "Frequently asked questions | HealSpoc",
    description:
      "Answers about HealSpoc's role, providers, cost estimates, travel assistance, contact channels, and safe enquiries.",
  },
  "/contact/": {
    title: "Contact HealSpoc | WhatsApp and enquiry form",
    description:
      "Contact the HealSpoc human team by WhatsApp or email, or send a short enquiry through the secondary contact form.",
  },
  "/privacy-policy/": {
    title: "Privacy policy | HealSpoc",
    description:
      "Privacy information for the HealSpoc website. This draft requires owner and legal review before production use.",
  },
  "/terms-and-conditions/": {
    title: "Terms and conditions | HealSpoc",
    description:
      "Website terms for HealSpoc. This draft requires confirmation of legal entity, jurisdiction, and service details.",
  },
  "/medical-disclaimer/": {
    title: "Medical disclaimer | HealSpoc",
    description:
      "HealSpoc provides healthcare facilitation information, not diagnosis or treatment. Read the full medical disclaimer.",
  },
};

const whatsappOptions = [
  {
    id: "treatment",
    label: "Treatment enquiry",
    text: "Hello HealSpoc team, I would like to ask about treatment options in India. Please let me know what current information can be verified.",
  },
  {
    id: "hospital",
    label: "Hospital information",
    text: "Hello HealSpoc team, I would like to ask about hospital options in India. Please share only current provider details that can be verified.",
  },
  {
    id: "cost",
    label: "Cost question",
    text: "Hello HealSpoc team, I would like to understand how to request a current written treatment estimate from a healthcare provider.",
  },
  {
    id: "travel",
    label: "Travel assistance",
    text: "Hello HealSpoc team, I would like to ask which medical travel assistance, if any, is currently available and what I should confirm directly.",
  },
  {
    id: "existing",
    label: "Existing enquiry",
    text: "Hello HealSpoc team, I am following up on an existing enquiry. Please let me know the next step.",
  },
];

function normalizePath(pathname: string) {
  const localPath = SITE_BASE_PATH === "/" || !pathname.startsWith(SITE_BASE_PATH)
    ? pathname
    : `/${pathname.slice(SITE_BASE_PATH.length)}`;
  const compact = localPath.replace(/\/{2,}/g, "/");
  if (compact === "/") return compact;
  return `${compact.replace(/\/+$/, "")}/`;
}

function navigate(to: string) {
  window.history.pushState({}, "", routePath(to));
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "auto" });
}

function useCurrentPath() {
  const [path, setPath] = useState(() =>
    normalizePath(
      typeof window === "undefined"
        ? globalThis.__HEALSPOC_SSR_PATH__ ?? "/"
        : window.location.pathname,
    ),
  );

  useEffect(() => {
    const updatePath = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  return path;
}

function AppLink({ to, onClick, ...props }: AppLinkProps) {
  return (
    <a
      {...props}
      href={routePath(to)}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target === "_blank"
        ) {
          return;
        }
        event.preventDefault();
        navigate(to);
      }}
    >
      {props.children}
    </a>
  );
}

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5 15 15 5M6 5h9v9" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M3.5 10h12m-5-5 5 5-5 5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
      <path d="M16 3.5 26 7v8c0 6.3-4.2 10.8-10 13.5C10.2 25.8 6 21.3 6 15V7l10-3.5Z" />
      <path d="m11.5 16 3 3 6-7" />
    </svg>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <AppLink
      to="/"
      className={`brand${light ? " brand--light" : ""}`}
      aria-label="HealSpoc home"
    >
      <HealSpocMark />
      <span className="brand__wordmark">Heal<span>Spoc</span></span>
    </AppLink>
  );
}

function createWhatsAppLink(message: string) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

function WhatsAppAction({
  message,
  label,
  className = "button button--primary",
  eventProperties = {},
  treatmentSlug,
  children,
}: {
  message: string;
  label: string;
  className?: string;
  eventProperties?: Record<string, string>;
  treatmentSlug?: string;
  children?: ReactNode;
}) {
  return (
    <a
      className={className}
      href={createWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={() => {
        trackEvent("whatsapp_click", {
          page: normalizePath(window.location.pathname),
          ...eventProperties,
        });
        if (treatmentSlug) {
          trackEvent("treatment_whatsapp_click", {
            treatment: treatmentSlug,
          });
        }
      }}
    >
      <WhatsAppIcon />
      <span>{children ?? label}</span>
      <ArrowIcon diagonal />
    </a>
  );
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand light />
        <button
          type="button"
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
        </button>
        <nav
          id="primary-navigation"
          className={`primary-navigation${menuOpen ? " is-open" : ""}`}
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <AppLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </AppLink>
          ))}
          <WhatsAppAction
            message="Hello HealSpoc team, I would like to ask a question about healthcare options in India. Please let me know what information can be verified."
            label="Message HealSpoc on WhatsApp"
            className="button button--header"
          >
            Talk to our team
          </WhatsAppAction>
        </nav>
      </div>
    </header>
  );
}

function PageFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__main">
        <div className="site-footer__brand-block">
          <Brand light />
          <p>
            Healthcare facilitation for people exploring care in India. Medical
            decisions and care belong to licensed healthcare providers.
          </p>
          <p className="footer-note">
            No hospital, doctor, price, rating, or patient outcome is presented
            here without current verification.
          </p>
        </div>
        <div className="site-footer__links">
          <div>
            <h2>Explore</h2>
            <AppLink to="/treatments/">Treatment areas</AppLink>
            <AppLink to="/hospitals/">Hospitals</AppLink>
            <AppLink to="/doctors-specialists/">Doctors and specialists</AppLink>
            <AppLink to="/medical-travel-to-india/">Medical travel</AppLink>
            <AppLink to="/patient-journey/">Patient journey</AppLink>
            <AppLink to="/patient-assistance/">Patient assistance</AppLink>
          </div>
          <div>
            <h2>Information</h2>
            <AppLink to="/about/">About HealSpoc</AppLink>
            <AppLink to="/health-resources/">Health resources</AppLink>
            <AppLink to="/faqs/">FAQs</AppLink>
            <AppLink to="/contact/">Contact</AppLink>
            <AppLink to="/privacy-policy/">Privacy policy</AppLink>
            <AppLink to="/terms-and-conditions/">Terms and conditions</AppLink>
            <AppLink to="/medical-disclaimer/">Medical disclaimer</AppLink>
          </div>
        </div>
        <div className="site-footer__contact">
          <h2>Speak with a person</h2>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("whatsapp_click", {
                page: normalizePath(window.location.pathname),
                source: "footer",
              })
            }
          >
            WhatsApp {WHATSAPP_DISPLAY}
            <ArrowIcon diagonal />
          </a>
          <a href={`mailto:${OFFICIAL_EMAIL}`}>{OFFICIAL_EMAIL}</a>
          <p>WhatsApp conversations are handled by the human team.</p>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>Copyright {new Date().getFullYear()} HealSpoc.</span>
        <span>Website policies require owner and legal review before launch.</span>
      </div>
    </footer>
  );
}

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <AppLink to="/">Home</AppLink>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.to ? <AppLink to={item.to}>{item.label}</AppLink> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function PageFrame({
  title,
  eyebrow,
  description,
  breadcrumbs,
  visual,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  visual?: PageVisual;
  children: ReactNode;
}) {
  return (
    <>
      <section className={`page-hero${visual ? " page-hero--visual" : ""}`}>
        {visual && (
          <>
            <picture className="page-hero__media">
              <source
                srcSet={assetPath(`images/${visual.file}.webp`)}
                type="image/webp"
              />
              <img
                src={assetPath(`images/${visual.file}.jpg`)}
                alt={visual.alt}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <div className="page-hero__veil" aria-hidden="true" />
          </>
        )}
        <div className="container page-hero__inner">
          <Breadcrumbs items={breadcrumbs} />
          <div className="page-hero__copy">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="page-hero__description">{description}</p>
          </div>
        </div>
      </section>
      {visual && <p className="hero-image-disclosure">{visual.caption}</p>}
      {children}
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function ResourceList({ sources }: { sources: SourceLink[] }) {
  return (
    <ul className="resource-list">
      {sources.map((source) => (
        <li key={source.url}>
          <div>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.label}
              <ArrowIcon diagonal />
            </a>
            <p>{source.note}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FaqList({ items = faqs }: { items?: typeof faqs }) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.question}>
          <summary>
            <span>{item.question}</span>
            <span className="faq-list__plus" aria-hidden="true" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function HomePage() {
  const journeySteps = [
    {
      number: "01",
      title: "Start with a question",
      text: "Choose a broad care area and tell the human team what information you need. A diagnosis or medical record is not required to start a conversation.",
    },
    {
      number: "02",
      title: "Clarify what can be verified",
      text: "Ask which provider details, costs, and practical support can be confirmed for your enquiry. Request current evidence before you decide.",
    },
    {
      number: "03",
      title: "Speak with a healthcare provider",
      text: "A licensed clinician must assess your individual situation and explain clinical options, risks, eligibility, and preparation.",
    },
    {
      number: "04",
      title: "Plan only after confirmation",
      text: "Confirm treatment, timing, written costs, travel requirements, and follow-up directly with the relevant providers and authorities.",
    },
  ];

  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <picture className="home-hero__media">
          <source srcSet={assetPath("images/hero-care.webp")} type="image/webp" />
          <img
            className="home-hero__image"
            src={assetPath("images/hero-care.jpg")}
            alt="A clinician listens to a patient during a consultation, representative stock photography"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <div className="home-hero__veil" />
        <div className="container home-hero__content">
          <p className="home-hero__eyebrow">A human starting point for healthcare in India</p>
          <div className="home-hero__brand" aria-label="HealSpoc">
            <span>Heal<span>Spoc</span></span>
          </div>
          <h1 id="home-title">
            Explore care in India <em>with clarity.</em>
          </h1>
          <p className="home-hero__intro">
            Ask about treatment areas, current provider information and what
            comes next. Real people handle your enquiry; licensed clinicians
            make your care decisions.
          </p>
          <div className="home-hero__actions">
            <WhatsAppAction
              message="Hello HealSpoc team, I would like to explore healthcare options in India. Please let me know what current provider information and next steps can be verified."
              label="Start a WhatsApp conversation with HealSpoc"
              className="button button--hero"
              eventProperties={{ source: "home_hero" }}
            >
              Talk to the human team
            </WhatsAppAction>
            <AppLink to="/treatments/" className="text-link text-link--light">
              Explore care areas <ArrowIcon />
            </AppLink>
          </div>
        </div>
      </section>
      <p className="hero-image-disclosure">
        Representative stock photograph. The people shown are not HealSpoc staff or patients.
      </p>

      <section className="trust-section section-pad" data-reveal>
        <div className="container">
          <SectionHeading
            eyebrow="What is different here"
            title="Good decisions begin with honest information."
            description="No manufactured trust. No medical promises. Just a clearer place to begin asking the right questions."
          />
          <div className="trust-points">
            <article>
              <span className="trust-points__number">01</span>
              <h3>Human conversations</h3>
              <p>WhatsApp enquiries go to the HealSpoc human team.</p>
            </article>
            <article>
              <span className="trust-points__number">02</span>
              <h3>Evidence before listings</h3>
              <p>
                No provider names, ratings, outcomes, or prices are published
                here without current verification.
              </p>
            </article>
            <article>
              <span className="trust-points__number">03</span>
              <h3>Clinical care stays clinical</h3>
              <p>
                Diagnosis and treatment decisions belong to licensed healthcare
                professionals.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="treatment-section section-pad" data-reveal>
        <div className="container">
          <div className="section-heading-row">
            <SectionHeading
              eyebrow="Where to begin"
              title="Find your starting point."
              description="Explore broad care areas, then ask what is current and verifiable. These categories are not a diagnosis or a treatment recommendation."
            />
            <AppLink to="/treatments/" className="text-link">
              All treatment areas <ArrowIcon />
            </AppLink>
          </div>
          <TreatmentDirectory compact />
        </div>
      </section>

      <section className="india-section section-pad" data-reveal>
        <picture className="india-section__media">
          <source srcSet={assetPath("images/india-city.webp")} type="image/webp" />
          <img
            src={assetPath("images/india-city.jpg")}
            alt="Bengaluru city skyline at sunset, representative photography of India"
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="india-section__veil" />
        <div className="container india-section__grid">
          <div className="india-section__intro">
            <p className="eyebrow">Considering India?</p>
            <h2>Look beyond the destination.</h2>
            <p>
              India is one healthcare option, not a promise of better care for
              everyone. Compare clinical suitability, provider information,
              full costs and the plan for care after you return home.
            </p>
            <AppLink
              to="/medical-travel-to-india/"
              className="text-link"
            >
              Read about medical travel <ArrowIcon />
            </AppLink>
          </div>
          <ul className="comparison-list">
            <li>
              <span>01</span>
              <div>
                <h3>Clinical suitability</h3>
                <p>Discuss individual risks and options with a clinician.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Provider details</h3>
                <p>Confirm the facility, clinician, credentials, and scope.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Full costs and follow-up</h3>
                <p>Ask what is included, excluded, and needed after return.</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>Travel requirements</h3>
                <p>Check current visa and travel rules with official sources.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
      <p className="hero-image-disclosure">
        Bengaluru cityscape, representative stock photography. No HealSpoc facility is shown.
      </p>

      <section className="provider-section section-pad" data-reveal>
        <div className="container provider-section__inner">
          <div className="provider-section__mark" aria-hidden="true">
            H.
          </div>
          <div className="provider-section__copy">
            <p className="eyebrow">A note on provider listings</p>
            <h2>Credibility is earned. Not borrowed.</h2>
            <p>
              No hospital or doctor profiles are published in this release.
              Legacy names and logos are withheld until current details,
              relationships, credentials, and permissions can be confirmed.
            </p>
            <div className="inline-links">
              <AppLink to="/hospitals/" className="text-link">
                How hospital information is handled <ArrowIcon />
              </AppLink>
              <AppLink to="/doctors-specialists/" className="text-link">
                How specialist information is handled <ArrowIcon />
              </AppLink>
            </div>
          </div>
        </div>
      </section>

      <section className="journey-section section-pad" data-reveal>
        <div className="container">
          <SectionHeading
            eyebrow="The patient journey"
            title="One question. A clearer next step."
            description="HealSpoc can discuss an enquiry; providers make clinical decisions and confirm services, costs, and timing."
          />
          <ol className="journey-steps">
            {journeySteps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <AppLink to="/patient-journey/" className="text-link">
            Read the patient journey guide <ArrowIcon />
          </AppLink>
        </div>
      </section>

      <section className="assistance-section section-pad" data-reveal>
        <div className="container assistance-section__inner">
          <div>
            <p className="eyebrow">Patient assistance</p>
            <h2>Ask what is available before you make plans.</h2>
          </div>
          <div>
            <p>
              This site does not promise visa support, appointments, transfers,
              accommodation, interpreters, or local transport. The team must
              confirm in writing which practical support, if any, is currently
              available for your situation.
            </p>
            <AppLink to="/patient-assistance/" className="text-link">
              See topics to confirm <ArrowIcon />
            </AppLink>
          </div>
        </div>
      </section>

      <section className="resource-preview section-pad" data-reveal>
        <div className="container resource-preview__grid">
          <div>
            <p className="eyebrow">Independent references</p>
            <h2>Useful starting points, from official sources.</h2>
            <p>
              External guidance can help you prepare questions. It does not
              replace advice from a clinician, provider, or government authority.
            </p>
            <AppLink to="/health-resources/" className="text-link">
              Browse health resources <ArrowIcon />
            </AppLink>
          </div>
          <ResourceList sources={publicSources.slice(0, 3)} />
        </div>
      </section>

      <section className="faq-preview section-pad" data-reveal>
        <div className="container faq-preview__grid">
          <div>
            <p className="eyebrow">Questions, answered</p>
            <h2>What to know before you enquire.</h2>
            <AppLink to="/faqs/" className="text-link">
              All frequently asked questions <ArrowIcon />
            </AppLink>
          </div>
          <FaqList items={faqs.slice(0, 4)} />
        </div>
      </section>

      <section className="final-cta" data-reveal>
        <div className="container final-cta__inner">
          <p className="eyebrow">Speak with a person</p>
          <h2>Start with a question. Get a clear human response.</h2>
          <p>
            Use WhatsApp to ask what information and support can be verified for
            your enquiry.
          </p>
          <WhatsAppAction
            message="Hello HealSpoc team, I would like to ask about healthcare options in India. Please tell me what current information can be verified."
            label="Ask HealSpoc a question on WhatsApp"
            className="button button--hero"
            eventProperties={{ source: "home_final_cta" }}
          >
            Message the HealSpoc team
          </WhatsAppAction>
        </div>
      </section>
    </>
  );
}

function TreatmentDirectory({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`treatment-directory${compact ? " treatment-directory--compact" : ""}`}>
      {treatmentAreas.map((area, index) => (
        <li key={area.slug}>
          <AppLink to={`/treatments/${area.slug}/`}>
            <span className="treatment-directory__number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="treatment-directory__label">{area.label}</span>
            <span className="treatment-directory__arrow">
              <ArrowIcon />
            </span>
          </AppLink>
        </li>
      ))}
    </ul>
  );
}

function TreatmentsPage() {
  return (
    <PageFrame
      title="Explore treatment areas"
      eyebrow="Treatment enquiries"
      description="Choose a broad area to start a conversation. The categories below do not confirm that a treatment, provider, or service is available."
      breadcrumbs={[{ label: "Treatments" }]}
    >
      <section className="content-section section-pad">
        <div className="container narrow-container">
          <div className="notice-line" role="note">
            <ShieldIcon />
            <p>
              Clinical information, provider listings, and prices are withheld
              until they can be checked and reviewed. These pages are enquiry
              starting points, not treatment recommendations.
            </p>
          </div>
          <TreatmentDirectory />
          <div className="prose-note">
            <h2>What these categories mean</h2>
            <p>
              A care area is a simple way to tell the HealSpoc team what you are
              exploring. It is not a diagnosis, confirmation of eligibility, or
              a promise that a specific provider or service is available.
              Clinical guidance must come from an appropriately qualified
              healthcare professional who has assessed the individual case.
            </p>
          </div>
        </div>
      </section>
      <section className="final-cta final-cta--compact">
        <div className="container final-cta__inner">
          <p className="eyebrow">Not sure where to begin?</p>
          <h2>Ask the human team to help clarify your enquiry.</h2>
          <WhatsAppAction
            message="Hello HealSpoc team, I am not sure which treatment category applies. Could a person help me clarify what information can be verified?"
            label="Ask HealSpoc for help choosing an enquiry category"
            className="button button--hero"
            eventProperties={{ source: "treatments_index" }}
          >
            Ask on WhatsApp
          </WhatsAppAction>
        </div>
      </section>
    </PageFrame>
  );
}

function TreatmentPage({ area }: { area: TreatmentArea }) {
  const message = `Hello HealSpoc team, I would like to ask about ${area.label.toLowerCase()} in India. Please tell me what current provider information and next steps can be verified.`;
  const questions = [
    {
      question: "Can this page identify the right treatment for me?",
      answer:
        "No. The category is only an enquiry label. A licensed clinician must assess your individual situation and explain whether any treatment is appropriate.",
    },
    {
      question: "Does HealSpoc list a hospital or specialist for this area?",
      answer:
        "No provider profile is published for this area in this release. Ask for current credentials, direct contact details, and confirmation of the provider's role before deciding.",
    },
    {
      question: "Can I get a price or outcome estimate here?",
      answer:
        "No. There is no verified price or outcome information on this page. Any estimate must come from a current, written provider assessment and should state what is included and excluded.",
    },
    {
      question: "Can I send my reports through the website form?",
      answer:
        "No. Do not send reports, scans, diagnoses, or other sensitive medical records through the ordinary contact form. Ask a provider how to share records securely.",
    },
  ];

  return (
    <PageFrame
      title={area.label}
      eyebrow="Treatment enquiry category"
      description={area.summary}
      visual={area.visual}
      breadcrumbs={[
        { label: "Treatments", to: "/treatments/" },
        { label: area.label },
      ]}
    >
      <section className="content-section section-pad">
        <div className="container narrow-container">
          <div className="review-notice" role="note">
            <span className="review-notice__icon">
              <ShieldIcon />
            </span>
            <div>
              <p className="eyebrow">Clinical review pending</p>
              <p>
                This page intentionally does not publish clinical indications,
                treatment comparisons, eligibility, recovery advice, prices,
                provider names, or outcomes. Those details require current
                evidence and review by an appropriately qualified medical
                professional.
              </p>
            </div>
          </div>

          <div className="treatment-outline">
            <section>
              <h2>What this page covers</h2>
              <p>
                {area.summary} This is a navigation label for an enquiry, not a
                clinical description or a recommendation for a particular
                treatment.
              </p>
            </section>
            <section>
              <h2>Assessment and treatment options</h2>
              <p>
                The appropriate assessment, indications, alternatives, risks,
                and preparation depend on an individual clinical evaluation.
                No treatment pathway is described here until a qualified
                reviewer and primary sources are available.
              </p>
            </section>
            <section>
              <h2>Hospitals and specialists</h2>
              <p>
                No hospital or specialist is listed for this care area. Provider
                names, credentials, current services, and any HealSpoc
                relationship must be checked before they are presented as
                verified.
              </p>
            </section>
            <section>
              <h2>Costs and estimates</h2>
              <p>
                No cost range or package is published. Request a dated written
                estimate from the healthcare provider and ask which items are
                included, excluded, or subject to change. Do not make a travel
                decision from an unverified figure.
              </p>
            </section>
            <section>
              <h2>Evaluation, preparation, and travel</h2>
              <p>
                Ask the treating provider what evaluation, preparation, travel
                timing, and follow-up are needed for the individual case. Check
                visa requirements with the official Government of India portal
                before making plans.
              </p>
            </section>
          </div>

          <section className="questions-section">
            <h2>Questions to take to a provider</h2>
            <ul className="check-list">
              <li>Who will assess the case and make clinical decisions?</li>
              <li>What information and evaluation are needed before a plan?</li>
              <li>What are the alternatives, risks, and follow-up needs?</li>
              <li>What does a written estimate include and exclude?</li>
              <li>How will records be shared securely with the provider?</li>
            </ul>
          </section>

          <section className="treatment-faq">
            <h2>Frequently asked questions</h2>
            <FaqList items={questions} />
          </section>

          <section className="source-note">
            <h2>References and medical review</h2>
            <p>
              The references below are starting points for discussion, not
              individualized medical advice. This enquiry page has not been
              reviewed by a medical professional; clinical details are withheld
              until an appropriate review is completed.
            </p>
            <ResourceList
              sources={[
                publicSources[2],
                publicSources[0],
                publicSources[3],
              ]}
            />
          </section>
        </div>
      </section>
      <section className="final-cta final-cta--compact">
        <div className="container final-cta__inner">
          <p className="eyebrow">Ask a question about {area.shortLabel}</p>
          <h2>Get a human response about what can be verified.</h2>
          <WhatsAppAction
            message={message}
            label={`Ask HealSpoc about ${area.label} on WhatsApp`}
            className="button button--hero"
            treatmentSlug={area.slug}
            eventProperties={{ treatment: area.slug, source: "treatment_page" }}
          >
            Enquire about {area.shortLabel}
          </WhatsAppAction>
        </div>
      </section>
    </PageFrame>
  );
}

function AboutPage() {
  return (
    <PageFrame
      title="About HealSpoc"
      eyebrow="Our role"
      description="A human-led starting point for people exploring healthcare options in India, with clear boundaries around what a facilitator can and cannot do."
      breadcrumbs={[{ label: "About HealSpoc" }]}
    >
      <section className="about-intro section-pad" data-reveal>
        <div className="container about-intro__grid">
          <div className="about-intro__copy">
            <p className="eyebrow">Facilitation, not medical care</p>
            <h2>Helping people ask better questions about care in India.</h2>
            <p>
              HealSpoc is presented as a healthcare facilitation service. The
              team can speak with people who are exploring options, while
              diagnoses, clinical recommendations, eligibility, and treatment
              remain the responsibility of licensed healthcare providers.
            </p>
            <p>
              This website is built around a simple principle: make it easy to
              ask a real person, and do not turn unverified information into a
              promise.
            </p>
            <WhatsAppAction
              message="Hello HealSpoc team, I would like to understand how HealSpoc can assist with my healthcare enquiry. Please clarify what is currently available and verifiable."
              label="Ask the HealSpoc team about its role"
              className="button button--primary"
              eventProperties={{ source: "about_page" }}
            >
              Ask the team
            </WhatsAppAction>
          </div>
          <figure className="editorial-photo">
            <picture>
              <source srcSet={assetPath("images/about-care.webp")} type="image/webp" />
              <img
                src={assetPath("images/about-care.jpg")}
                alt="A healthcare professional and patient reviewing information together"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <figcaption>
              Representative stock photography. The people shown are not
              HealSpoc staff or patients.
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="about-principles section-pad" data-reveal>
        <div className="container">
          <SectionHeading
            eyebrow="How we approach an enquiry"
            title="Clear roles. Fewer assumptions. Better questions."
          />
          <div className="principle-list">
            <article>
              <span>01</span>
              <div>
                <h3>Listen first</h3>
                <p>
                  Start with the broad question and what kind of information you
                  are looking for. Do not submit medical records through the
                  ordinary website form.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Confirm before relying</h3>
                <p>
                  Provider identity, credentials, current services, pricing,
                  and practical assistance should be confirmed directly and in
                  writing before a decision.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Keep care with clinicians</h3>
                <p>
                  A treating healthcare professional must assess the person and
                  explain the appropriate clinical options, risks, and follow-up.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="plain-callout section-pad">
        <div className="container plain-callout__inner">
          <div>
            <p className="eyebrow">Company information</p>
            <h2>Only publish business details that can be confirmed.</h2>
          </div>
          <p>
            The public website has displayed the name "HealSpoc Healthcare
            Services LLP" in its footer. The registered entity, address,
            jurisdiction, and registration details still require owner
            confirmation before use in final legal notices.
          </p>
        </div>
      </section>
    </PageFrame>
  );
}

function HospitalsPage() {
  return (
    <PageFrame
      title="Hospital information"
      eyebrow="Provider verification"
      description="A hospital name or accreditation badge is not enough. Confirm the facility, services, and current relationship directly before making a decision."
      breadcrumbs={[{ label: "Hospitals" }]}
    >
      <section className="content-section section-pad">
        <div className="container narrow-container">
          <div className="status-statement">
            <p className="eyebrow">No profiles published in this release</p>
            <h2>We will not reuse unverified legacy hospital listings.</h2>
            <p>
              Current facility details, service availability, accreditation
              scope, and any relationship with HealSpoc have not been verified
              for publication. No hospital is represented here as a partner,
              recommendation, or treatment destination.
            </p>
          </div>
          <section className="prose-note">
            <h2>What to check with a hospital</h2>
            <ul className="check-list">
              <li>Confirm the exact legal name and location of the facility.</li>
              <li>Check current accreditation status and its stated scope.</li>
              <li>Ask whether the requested service is currently available.</li>
              <li>Request a written estimate directly from the provider.</li>
              <li>Ask how clinical records and follow-up are handled.</li>
            </ul>
            <p>
              The official NABH directory is an external reference, not a HealSpoc
              endorsement. Accreditation status can change and should be checked
              for the specific facility.
            </p>
            <ResourceList sources={[publicSources[3]]} />
          </section>
          <WhatsAppAction
            message="Hello HealSpoc team, I would like to ask about hospital information in India. Please share only current details and relationships that can be verified."
            label="Ask HealSpoc about hospital information"
            className="button button--primary"
            eventProperties={{ source: "hospitals_page", category: "hospital" }}
          >
            Ask about hospital information
          </WhatsAppAction>
        </div>
      </section>
    </PageFrame>
  );
}

function DoctorsPage() {
  return (
    <PageFrame
      title="Doctors and specialists"
      eyebrow="Clinical professionals"
      description="Clinical qualifications and current affiliations should be checked with the practitioner and the relevant professional or healthcare institution."
      breadcrumbs={[{ label: "Doctors and specialists" }]}
    >
      <section className="content-section section-pad">
        <div className="container narrow-container">
          <div className="status-statement">
            <p className="eyebrow">No profiles published in this release</p>
            <h2>No unverified doctor names or credentials.</h2>
            <p>
              Older public pages contain clinician names and experience claims
              that have not been revalidated. They are intentionally not
              repeated here. A profile will only be considered after identity,
              qualifications, specialty, current institution, and permissions
              have been checked.
            </p>
          </div>
          <section className="prose-note">
            <h2>Questions to ask a clinical professional</h2>
            <ul className="check-list">
              <li>Who will assess the case and remain responsible for care?</li>
              <li>What qualifications and current institutional role apply?</li>
              <li>Who explains the options, risks, and expected follow-up?</li>
              <li>How can the information be checked independently?</li>
            </ul>
            <p>
              This website does not provide medical opinions or confirm a
              practitioner's suitability for an individual patient.
            </p>
          </section>
          <WhatsAppAction
            message="Hello HealSpoc team, I would like to ask about specialist information. Please confirm what current details and relationships can be independently verified."
            label="Ask HealSpoc about specialist information"
            className="button button--primary"
            eventProperties={{ source: "doctors_page", category: "specialist" }}
          >
            Ask about specialist information
          </WhatsAppAction>
        </div>
      </section>
    </PageFrame>
  );
}

function MedicalTravelPage() {
  return (
    <PageFrame
      title="Medical travel to India"
      eyebrow="Plan with reliable information"
      description="Explore the questions that matter before crossing a border for care. No country, provider, treatment, or outcome is right for everyone."
      visual={medicalTravelVisual}
      breadcrumbs={[{ label: "Medical travel to India" }]}
    >
      <section className="content-section section-pad">
        <div className="container editorial-container">
          <div className="editorial-lead">
            <h2>Start with a clinical conversation, then assess the whole trip.</h2>
            <p>
              Patients may compare care in India with options closer to home.
              Suitability depends on the individual's situation, provider
              availability, timing, communication, cost, travel requirements,
              and continuity of care. A licensed clinician and the provider
              should answer clinical questions; official authorities should
              answer visa and entry questions.
            </p>
          </div>
          <div className="editorial-columns">
            <section>
              <h3>Before choosing a provider</h3>
              <p>
                Confirm the facility and clinician directly. Ask who is
                responsible for clinical care, what information is required,
                and how you will receive a written assessment and estimate.
              </p>
            </section>
            <section>
              <h3>Before committing to travel</h3>
              <p>
                Confirm appointment timing, expected duration, costs that are
                not in the treatment estimate, travel documents, and how care
                will continue after returning home. Do not rely on a verbal
                promise or an undated price.
              </p>
            </section>
            <section>
              <h3>During the journey</h3>
              <p>
                Keep contact details for the treating provider and your usual
                clinician. Discuss travel fitness and individual precautions
                with a healthcare professional before departure.
              </p>
            </section>
          </div>
          <section className="source-note">
            <h2>Official and independent references</h2>
            <ResourceList
              sources={[
                publicSources[0],
                publicSources[1],
                publicSources[4],
              ]}
            />
          </section>
          <p className="disclaimer-line">
            HealSpoc does not provide travel-health advice, immigration advice,
            or medical care. Requirements change; confirm them with the relevant
            authority and provider.
          </p>
        </div>
      </section>
    </PageFrame>
  );
}

function PatientJourneyPage() {
  const steps = [
    {
      title: "Tell the team what you are exploring",
      text: "Start with a broad treatment area, country, and the question you want answered. A human team member handles WhatsApp enquiries. Do not send sensitive records through the ordinary contact form.",
    },
    {
      title: "Ask what can be confirmed",
      text: "Request current provider details, the scope of any assistance, and written estimates where available. If something cannot be verified, it should be stated plainly.",
    },
    {
      title: "Get an individual clinical assessment",
      text: "A licensed healthcare professional must review the individual case, explain options and risks, and decide whether any care is suitable. HealSpoc does not diagnose or choose treatment.",
    },
    {
      title: "Make travel decisions with direct confirmation",
      text: "Confirm the provider, timing, written costs, travel documents, follow-up arrangements, and any practical support before booking. Check entry requirements with official authorities.",
    },
  ];

  return (
    <PageFrame
      title="A careful patient journey"
      eyebrow="From enquiry to informed next step"
      description="A useful process keeps healthcare providers responsible for clinical care and confirms practical details before travel."
      breadcrumbs={[{ label: "Patient journey" }]}
    >
      <section className="content-section section-pad">
        <div className="container narrow-container">
          <ol className="journey-timeline">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="journey-timeline__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2>{step.title}</h2>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="plain-callout plain-callout--small">
            <p>
              The timeline is a general planning outline, not a guarantee that
              any provider, appointment, visa, estimate, or travel service is
              available.
            </p>
          </div>
          <WhatsAppAction
            message="Hello HealSpoc team, I would like to understand the next steps for my enquiry. Please tell me which details can be confirmed before I make any plans."
            label="Discuss the patient journey with HealSpoc"
            className="button button--primary"
            eventProperties={{ source: "patient_journey_page" }}
          >
            Discuss a next step
          </WhatsAppAction>
        </div>
      </section>
    </PageFrame>
  );
}

function PatientAssistancePage() {
  const topics = [
    "Current provider information and appointment contacts",
    "Whether a written treatment estimate is available from a provider",
    "Medical travel document and visa questions to confirm with authorities",
    "Language, accommodation, local transport, or companion needs",
    "The treating provider's follow-up plan after travel",
  ];

  return (
    <PageFrame
      title="Patient assistance"
      eyebrow="Confirm what is actually available"
      description="Support needs differ. Ask the HealSpoc team to confirm in writing what, if anything, can be arranged for your situation before relying on it."
      breadcrumbs={[{ label: "Patient assistance" }]}
    >
      <section className="content-section section-pad">
        <div className="container narrow-container">
          <div className="status-statement">
            <p className="eyebrow">Service availability needs confirmation</p>
            <h2>No travel service is promised on this page.</h2>
            <p>
              Current capabilities, terms, coverage, and provider relationships
              have not been independently confirmed for this release. Do not
              book travel or make a payment based on an assumption that any
              listed assistance is available.
            </p>
          </div>
          <section className="prose-note">
            <h2>Topics you can ask the team about</h2>
            <ul className="check-list">
              {topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <p>
              Asking about a topic does not confirm that HealSpoc provides or
              arranges it. Request a clear written answer and any relevant
              terms before you rely on a service.
            </p>
          </section>
          <WhatsAppAction
            message="Hello HealSpoc team, I would like to ask what practical assistance, if any, is currently available for an international healthcare enquiry. Please clarify what can be confirmed in writing."
            label="Ask HealSpoc about available patient assistance"
            className="button button--primary"
            eventProperties={{ source: "patient_assistance_page" }}
          >
            Ask what is available
          </WhatsAppAction>
        </div>
      </section>
    </PageFrame>
  );
}

function HealthResourcesPage() {
  return (
    <PageFrame
      title="Health resources and references"
      eyebrow="Start with primary sources"
      description="A small, curated collection of official and independent references. These links are not HealSpoc endorsements and do not replace individual advice."
      breadcrumbs={[{ label: "Health resources" }]}
    >
      <section className="content-section section-pad">
        <div className="container editorial-container">
          <section className="source-note source-note--first">
            <h2>Official and independent information</h2>
            <ResourceList sources={publicSources} />
          </section>
          <section className="resource-guide">
            <p className="eyebrow">Non-clinical planning guide</p>
            <h2>Questions to ask before travelling for healthcare.</h2>
            <p>
              A practical checklist for comparing information and preparing a
              conversation with providers. It does not recommend treatment or
              assess medical suitability.
            </p>
            <AppLink
              to="/health-resources/questions-to-ask-before-travel/"
              className="text-link"
            >
              Read the planning guide <ArrowIcon />
            </AppLink>
          </section>
          <div className="editorial-status">
            <ShieldIcon />
            <p>
              Clinical articles will only be published after source checking
              and review by an appropriately qualified medical professional.
              This resource page contains references and non-clinical planning
              information only.
            </p>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

function PlanningGuidePage() {
  const questions = [
    {
      heading: "Who is responsible for the care?",
      text: "Ask for the exact provider and facility details, the clinician's role, and a direct way to confirm the information independently.",
    },
    {
      heading: "What is known, and what is still uncertain?",
      text: "Separate confirmed information from estimates or options that depend on a clinical assessment. Ask for the date and source of any written information.",
    },
    {
      heading: "What does the estimate include?",
      text: "Ask the provider to explain included and excluded charges, which items can change, and who to contact with billing questions.",
    },
    {
      heading: "What travel and follow-up details need checking?",
      text: "Confirm timing, documents, travel arrangements, expected communication, and follow-up directly with the provider and relevant authorities.",
    },
    {
      heading: "How will personal information be shared?",
      text: "Ask the healthcare provider for its secure process before sharing reports or other sensitive medical records. Do not upload them through HealSpoc's ordinary contact form.",
    },
  ];

  return (
    <PageFrame
      title="Questions to ask before medical travel"
      eyebrow="Non-clinical planning guide"
      description="A short framework for checking provider information, costs, travel requirements, and follow-up before making plans."
      breadcrumbs={[
        { label: "Health resources", to: "/health-resources/" },
        { label: "Questions before travel" },
      ]}
    >
      <section className="content-section section-pad">
        <div className="container editorial-container">
          <div className="editorial-status editorial-status--simple">
            <p>
              Non-clinical planning information. No treatment recommendation,
              diagnosis, or medical advice is included. Clinical reviewer: not
              applicable to this checklist; speak with a qualified clinician
              for clinical questions.
            </p>
          </div>
          <div className="planning-questions">
            {questions.map((item, index) => (
              <section key={item.heading}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{item.heading}</h2>
                  <p>{item.text}</p>
                </div>
              </section>
            ))}
          </div>
          <section className="source-note">
            <h2>References</h2>
            <p>
              Travel-health details and government requirements can change.
              Check the current source and discuss individual concerns with the
              relevant professional.
            </p>
            <ResourceList
              sources={[publicSources[0], publicSources[1], publicSources[4]]}
            />
          </section>
          <p className="updated-note">Source links checked during this rebuild.</p>
        </div>
      </section>
    </PageFrame>
  );
}

function FaqPage() {
  return (
    <PageFrame
      title="Frequently asked questions"
      eyebrow="Before you enquire"
      description="Clear answers about HealSpoc's role, provider information, costs, contact channels, and safe sharing of information."
      breadcrumbs={[{ label: "FAQs" }]}
    >
      <section className="content-section section-pad">
        <div className="container narrow-container">
          <FaqList />
          <div className="faq-contact-note">
            <p>Still have a question?</p>
            <WhatsAppAction
              message="Hello HealSpoc team, I have a question that is not covered in the FAQs. Could a person help me understand what information can be verified?"
              label="Ask another question on WhatsApp"
              className="text-link"
              eventProperties={{ source: "faq_page" }}
            >
              Message HealSpoc on WhatsApp
            </WhatsAppAction>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

type EnquiryFormStatus = "idle" | "loading" | "success" | "error";

function EnquiryForm() {
  const [status, setStatus] = useState<EnquiryFormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const started = useRef(false);
  const validationReported = useRef(false);
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim() ?? "";

  function markFormStarted() {
    if (started.current) return;
    started.current = true;
    trackEvent("contact_form_start", {
      page: normalizePath(window.location.pathname),
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markFormStarted();

    const form = event.currentTarget;
    const phone = form.elements.namedItem(
      "whatsapp_number",
    ) as HTMLInputElement | null;
    const normalizedPhone = phone?.value.replace(/[\s().-]/g, "") ?? "";
    const validPhone = /^\+[1-9]\d{6,14}$/.test(normalizedPhone);

    if (phone) {
      phone.setCustomValidity(
        validPhone ? "" : "Enter a number with its international country code, such as +44 7700 900000.",
      );
    }

    if (!form.reportValidity()) {
      setStatus("error");
      setStatusMessage("Please check the highlighted fields and try again.");
      trackEvent("contact_form_error", {
        page: normalizePath(window.location.pathname),
        reason: "validation",
      });
      return;
    }

    const payload = new FormData(form);
    if (payload.get("botcheck")) {
      setStatus("error");
      setStatusMessage(
        "The enquiry could not be submitted. Please contact the team directly.",
      );
      trackEvent("contact_form_error", {
        page: normalizePath(window.location.pathname),
        reason: "spam_check",
      });
      return;
    }

    if (!accessKey) {
      setStatus("error");
      setStatusMessage(
        "The website form is not configured yet. Please use WhatsApp or email instead.",
      );
      trackEvent("contact_form_error", {
        page: normalizePath(window.location.pathname),
        reason: "not_configured",
      });
      return;
    }

    payload.append("access_key", accessKey);
    payload.set("subject", "New HealSpoc website enquiry");
    payload.set("from_name", "HealSpoc website");
    payload.set("whatsapp_number", normalizedPhone);
    setStatus("loading");
    setStatusMessage("Sending your enquiry...");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
        signal: controller.signal,
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "The form service rejected the request.");
      }

      form.reset();
      started.current = false;
      setStatus("success");
      setStatusMessage(
        "Your enquiry has been submitted. The HealSpoc team can reply using the WhatsApp number you provided.",
      );
      trackEvent("contact_form_submission", {
        page: normalizePath(window.location.pathname),
      });
    } catch {
      setStatus("error");
      setStatusMessage(
        "We could not submit the enquiry. Please try again later or contact the team on WhatsApp or email.",
      );
      trackEvent("contact_form_error", {
        page: normalizePath(window.location.pathname),
        reason: "delivery",
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return (
    <form
      className="enquiry-form"
      onSubmit={handleSubmit}
      onFocusCapture={markFormStarted}
      onInputCapture={() => { validationReported.current = false; }}
      onInvalidCapture={() => {
        if (validationReported.current) return;
        validationReported.current = true;
        setStatus("error");
        setStatusMessage("Please check the required fields and try again.");
        trackEvent("contact_form_error", {
          page: normalizePath(window.location.pathname),
          reason: "validation",
        });
      }}
    >
      {!accessKey && (
        <p className="form-config-note form-config-note--top" role="status">
          The web form is not accepting enquiries yet. Please use WhatsApp or
          email instead.
        </p>
      )}
      <div className="form-honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="botcheck"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="form-field">
        <label htmlFor="full-name">Full name</label>
        <input
          id="full-name"
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={100}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="country">Country</label>
        <input
          id="country"
          name="country"
          type="text"
          autoComplete="country-name"
          maxLength={80}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="whatsapp-number">WhatsApp number with country code</label>
        <input
          id="whatsapp-number"
          name="whatsapp_number"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+44 7700 900000"
          pattern="\+[0-9\s().-]{7,20}"
          title="Include the international country code, for example +44 7700 900000."
          maxLength={24}
          required
          onChange={(event) => event.currentTarget.setCustomValidity("")}
        />
      </div>
      <div className="form-field">
        <label htmlFor="treatment">Treatment of interest</label>
        <select id="treatment" name="treatment_of_interest" defaultValue="" required>
          <option value="" disabled>
            Select a care area
          </option>
          {treatmentAreas.map((area) => (
            <option key={area.slug} value={area.label}>
              {area.label}
            </option>
          ))}
          <option value="Not sure yet">Not sure yet</option>
        </select>
      </div>
      <div className="form-field form-field--wide">
        <label htmlFor="brief-enquiry">Brief enquiry</label>
        <textarea
          id="brief-enquiry"
          name="message"
          rows={4}
          minLength={10}
          maxLength={1000}
          placeholder="What would you like the team to help clarify?"
          aria-describedby="form-safety-note"
          required
        />
        <p id="form-safety-note" className="field-help">
          Please do not include medical reports, scans, diagnoses, or other
          sensitive medical information.
        </p>
      </div>
      <div className="form-field form-field--wide form-consent">
        <div className="checkbox-label">
          <input
            id="privacy-consent"
            name="privacy_consent"
            type="checkbox"
            value="yes"
            required
          />
          <label htmlFor="privacy-consent">
            I agree that my enquiry details may be used to respond to me, as
            described in the Privacy Policy.
          </label>
        </div>
        <p className="field-help">
          <AppLink to="/privacy-policy/">Read the Privacy Policy</AppLink>
        </p>
      </div>
      <div className="form-field form-field--wide form-submit-row">
        <button
          type="submit"
          className="button button--primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Send enquiry"}
          {status !== "loading" && <ArrowIcon />}
        </button>
        <p
          className={`form-status form-status--${status}`}
          aria-live="polite"
          role="status"
        >
          {statusMessage}
        </p>
      </div>
    </form>
  );
}

function ContactPage() {
  const formAvailable = Boolean(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim());

  return (
    <PageFrame
      title="Talk to the HealSpoc team"
      eyebrow="Contact"
      description="WhatsApp is the primary way to start a conversation. Email is also available; the short web form appears only when delivery is configured."
      breadcrumbs={[{ label: "Contact" }]}
    >
      <section className="content-section section-pad">
        <div className="container contact-layout">
          <div className="contact-options">
            <div className="contact-option contact-option--primary">
              <p className="eyebrow">Primary contact</p>
              <h2>Start on WhatsApp.</h2>
              <p>
                A member of the HealSpoc human team handles WhatsApp enquiries.
                You can begin with a broad question; no medical documents are
                needed to open a conversation.
              </p>
              <WhatsAppAction
                message="Hello HealSpoc team, I would like to ask a question about healthcare options in India. Please let me know what current information can be verified."
                label="Start a WhatsApp enquiry with HealSpoc"
                className="button button--primary"
                eventProperties={{ source: "contact_page" }}
              >
                WhatsApp {WHATSAPP_DISPLAY}
              </WhatsAppAction>
            </div>
            <div className="contact-option">
              <p className="eyebrow">Email</p>
              <a className="contact-email" href={`mailto:${OFFICIAL_EMAIL}`}>
                {OFFICIAL_EMAIL} <ArrowIcon diagonal />
              </a>
              <p>Use email for general enquiries. Do not attach sensitive medical records.</p>
            </div>
            <p className="contact-emergency">
              This website is not an emergency service. For urgent medical
              concerns, contact local emergency services or a qualified
              healthcare provider.
            </p>
          </div>
          <div className={`contact-form-panel${formAvailable ? "" : " contact-form-panel--offline"}`}>
            <div className="contact-form-panel__intro">
              <p className="eyebrow">Secondary contact</p>
              <h2>{formAvailable ? "Send a short enquiry." : "Prefer to write?"}</h2>
              {formAvailable ? (
                <p>
                  The form asks only for contact and enquiry details. It is not a
                  secure channel for medical records.
                </p>
              ) : (
                <p>
                  The web enquiry form is not active yet. Email a general
                  question instead, without attaching sensitive medical records.
                </p>
              )}
            </div>
            {formAvailable ? (
              <EnquiryForm />
            ) : (
              <a className="button button--primary contact-email-cta" href={`mailto:${OFFICIAL_EMAIL}`}>
                Email {OFFICIAL_EMAIL} <ArrowIcon diagonal />
              </a>
            )}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

function LegalDraftNotice() {
  return (
    <div className="legal-draft-notice" role="note">
      <strong>Owner and legal review required before production.</strong>
      <span>
        The registered entity, business address, applicable jurisdiction, and
        data-handling details must be confirmed before this draft is relied on.
      </span>
    </div>
  );
}

function PrivacyPage() {
  return (
    <PageFrame
      title="Privacy policy"
      eyebrow="Website policy draft"
      description="A plain-language outline of information used by the website. This draft is not final until the owner confirms the legal entity and processing details."
      breadcrumbs={[{ label: "Privacy policy" }]}
    >
      <section className="content-section section-pad">
        <div className="container legal-copy">
          <LegalDraftNotice />
          <section>
            <h2>Who is responsible</h2>
            <p>
              This website uses the HealSpoc brand. A public footer has displayed
              the name "HealSpoc Healthcare Services LLP"; the current legal
              entity, registered address, and privacy controller must be
              confirmed by the owner before publication. Privacy questions can
              be sent to <a href={`mailto:${OFFICIAL_EMAIL}`}>{OFFICIAL_EMAIL}</a>.
            </p>
          </section>
          <section>
            <h2>Information you choose to send</h2>
            <p>
              The optional enquiry form requests a name, country, WhatsApp
              number, treatment area, short message, and consent. Do not include
              diagnoses, reports, scans, medication details, or other sensitive
              health information in the form. WhatsApp and email are separate
              services with their own terms and privacy practices.
            </p>
          </section>
          <section>
            <h2>How the form is processed</h2>
            <p>
              When Web3Forms is configured, form data is sent to its submission
              service and is intended to be delivered to {OFFICIAL_EMAIL}. The
              form is not configured in this build. Before production, the owner
              must confirm the recipient access key, allowed domains, current
              processor terms, data location, retention period, and deletion
              process.
            </p>
          </section>
          <section>
            <h2>Analytics and event measurements</h2>
            <p>
              No external analytics account or identifier is configured in this
              build. The code exposes enquiry and WhatsApp event hooks; if an
              analytics tag is added later, the owner must update this notice
              and any consent requirements before activation. Event measurements
              are not confirmed as a production analytics service.
            </p>
          </section>
          <section>
            <h2>Retention, access, and deletion</h2>
            <p>
              The owner must set and publish retention periods, access controls,
              and a process for access, correction, or deletion requests before
              the form is activated. Contact {OFFICIAL_EMAIL} for privacy
              questions while this draft is under review.
            </p>
          </section>
          <section>
            <h2>Cookies and external links</h2>
            <p>
              This implementation does not add an advertising cookie or
              third-party analytics script. External links, including WhatsApp,
              official government resources, and the form processor, are subject
              to the destination's own policies.
            </p>
          </section>
          <p className="updated-note">Draft for owner and legal review.</p>
        </div>
      </section>
    </PageFrame>
  );
}

function TermsPage() {
  return (
    <PageFrame
      title="Terms and conditions"
      eyebrow="Website terms draft"
      description="Terms for using HealSpoc's informational website, subject to confirmation of legal entity, jurisdiction, and operating details."
      breadcrumbs={[{ label: "Terms and conditions" }]}
    >
      <section className="content-section section-pad">
        <div className="container legal-copy">
          <LegalDraftNotice />
          <section>
            <h2>Website purpose</h2>
            <p>
              HealSpoc provides a point of contact for people exploring
              healthcare options in India. The website is informational and
              facilitative. It is not a hospital, clinic, medical practice, or
              emergency service.
            </p>
          </section>
          <section>
            <h2>No medical advice or guarantee</h2>
            <p>
              Website content does not diagnose, recommend, or guarantee a
              treatment, provider, price, result, eligibility, or travel service.
              Clinical decisions must be made between the patient and a licensed
              healthcare provider after an individual assessment.
            </p>
          </section>
          <section>
            <h2>Provider and travel information</h2>
            <p>
              Provider details, accreditation, costs, availability, visa
              requirements, and travel arrangements can change. Confirm current
              details directly with the relevant provider or official authority
              before making plans or payments.
            </p>
          </section>
          <section>
            <h2>Contact and submissions</h2>
            <p>
              Do not send sensitive medical records through the ordinary website
              form. A message or enquiry does not create a clinical relationship
              or guarantee a response time. WhatsApp conversations are handled
              by the human team.
            </p>
          </section>
          <section>
            <h2>Applicable law and legal entity</h2>
            <p>
              The governing law, dispute process, registered entity, and
              registered office have not been confirmed for this draft. These
              terms must not be relied on until the owner and legal counsel
              complete those details.
            </p>
          </section>
          <p className="updated-note">Draft for owner and legal review.</p>
        </div>
      </section>
    </PageFrame>
  );
}

function MedicalDisclaimerPage() {
  return (
    <PageFrame
      title="Medical disclaimer"
      eyebrow="Important information"
      description="HealSpoc's website supports enquiries only. It does not replace advice or care from a qualified healthcare professional."
      breadcrumbs={[{ label: "Medical disclaimer" }]}
    >
      <section className="content-section section-pad">
        <div className="container legal-copy">
          <section>
            <h2>No diagnosis or treatment advice</h2>
            <p>
              Content on this website is general and informational. It is not a
              diagnosis, second opinion, treatment recommendation, medical
              instruction, or substitute for a consultation with a licensed
              healthcare professional who knows the individual case.
            </p>
          </section>
          <section>
            <h2>Provider responsibility</h2>
            <p>
              Healthcare providers are responsible for examining patients,
              explaining clinical options and risks, determining eligibility,
              providing treatment, and arranging clinical follow-up. HealSpoc
              does not provide medical care or guarantee any provider, result,
              cost, or recovery.
            </p>
          </section>
          <section>
            <h2>Urgent concerns</h2>
            <p>
              This website and its WhatsApp channel are not emergency services.
              If you have an urgent medical concern, contact local emergency
              services or a qualified healthcare provider now.
            </p>
          </section>
          <section>
            <h2>Medical records</h2>
            <p>
              Do not send medical reports, scans, diagnoses, or other sensitive
              records through the ordinary enquiry form. Ask the healthcare
              provider how to transmit health information securely.
            </p>
          </section>
        </div>
      </section>
    </PageFrame>
  );
}

function NotFoundPage() {
  return (
    <PageFrame
      title="This page is not available"
      eyebrow="Page not found"
      description="The address may have changed or the page may not be part of the current HealSpoc website."
      breadcrumbs={[{ label: "Page not found" }]}
    >
      <section className="content-section section-pad">
        <div className="container narrow-container">
          <div className="not-found-actions">
            <AppLink to="/treatments/" className="text-link">
              Explore treatment areas <ArrowIcon />
            </AppLink>
            <AppLink to="/contact/" className="text-link">
              Contact HealSpoc <ArrowIcon />
            </AppLink>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

function WhatsAppWidget({ currentPath }: { currentPath: string }) {
  const [open, setOpen] = useState(false);
  const currentArea = treatmentAreas.find(
    (area) => currentPath === `/treatments/${area.slug}/`,
  );
  const defaultTreatmentMessage = currentArea
    ? `Hello HealSpoc team, I would like to ask about ${currentArea.label.toLowerCase()} in India. Please tell me what current information can be verified.`
    : whatsappOptions[0].text;
  const options = whatsappOptions.map((option) =>
    option.id === "treatment"
      ? { ...option, text: defaultTreatmentMessage }
      : option,
  );

  function toggleWidget() {
    if (!open) {
      trackEvent("whatsapp_widget_open", {
        page: currentPath,
      });
    }
    setOpen((isOpen) => !isOpen);
  }

  return (
    <div className="whatsapp-widget">
      <section
        id="whatsapp-widget-options"
        className="whatsapp-panel"
        aria-label="WhatsApp enquiry options"
        hidden={!open}
      >
          <div className="whatsapp-panel__header">
            <div>
              <p className="eyebrow">HealSpoc on WhatsApp</p>
              <h2>How can we help?</h2>
            </div>
            <button
              type="button"
              className="whatsapp-panel__close"
              aria-label="Close WhatsApp options"
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
          <p className="whatsapp-panel__note">
            Choose a topic to message our human team. You can edit the message before sending.
          </p>
          <ul>
            {options.map((option) => (
              <li key={option.id}>
                <a
                  href={createWhatsAppLink(option.text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent("whatsapp_category_selection", {
                      category: option.id,
                      page: currentPath,
                    });
                    trackEvent("whatsapp_click", {
                      category: option.id,
                      page: currentPath,
                      source: "floating_widget",
                    });
                    if (option.id === "treatment" && currentArea) {
                      trackEvent("treatment_whatsapp_click", {
                        treatment: currentArea.slug,
                      });
                    }
                  }}
                >
                  <span>{option.label}</span>
                  <ArrowIcon diagonal />
                </a>
              </li>
            ))}
          </ul>
          <div className="whatsapp-panel__footer">
            <WhatsAppIcon />
            <span>{WHATSAPP_DISPLAY}</span>
          </div>
      </section>
      <button
        type="button"
        className="whatsapp-widget__toggle"
        aria-label={open ? "Close WhatsApp enquiry options" : "Open WhatsApp enquiry options"}
        aria-expanded={open}
        aria-controls="whatsapp-widget-options"
        onClick={toggleWidget}
      >
        <WhatsAppIcon />
      </button>
      <a
        className="mobile-whatsapp-cta"
        href={createWhatsAppLink(
          "Hello HealSpoc team, I would like to ask a question about healthcare options in India. Please let me know what can be verified.",
        )}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackEvent("whatsapp_click", {
            page: currentPath,
            source: "mobile_fixed_cta",
          })
        }
      >
        <WhatsAppIcon />
        <span>Chat on WhatsApp</span>
        <ArrowIcon diagonal />
      </a>
    </div>
  );
}

function updateMeta(selector: string, attribute: string, key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = value;
}

function updateHead(path: string, metadata: PageMetadata, isKnownPage: boolean) {
  document.title = metadata.title;
  updateMeta('meta[name="description"]', "name", "description", metadata.description);
  updateMeta('meta[property="og:title"]', "property", "og:title", metadata.title);
  updateMeta(
    'meta[property="og:description"]',
    "property",
    "og:description",
    metadata.description,
  );
  updateMeta(
    'meta[property="og:url"]',
    "property",
    "og:url",
    `${SITE_URL}${path}`,
  );
  updateMeta(
    'meta[property="og:image"]',
    "property",
    "og:image",
    `${SITE_URL}/images/${
      treatmentAreas.find((area) => path === `/treatments/${area.slug}/`)?.visual.file ??
      (path === "/medical-travel-to-india/" ? medicalTravelVisual.file : "hero-care")
    }.jpg`,
  );
  updateMeta(
    'meta[name="twitter:card"]',
    "name",
    "twitter:card",
    "summary_large_image",
  );

  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (isKnownPage) {
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${path}`;
  } else {
    canonical?.remove();
  }

  let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!isKnownPage && !robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.appendChild(robots);
  }
  if (robots) {
    if (isKnownPage) {
      robots.remove();
    } else {
      robots.content = "noindex,follow";
    }
  }
}

export function getMetadata(path: string): PageMetadata {
  if (pageMetadata[path]) return pageMetadata[path];
  const area = treatmentAreas.find((item) => path === `/treatments/${item.slug}/`);
  if (area) {
    return {
      title: `${area.label} in India | HealSpoc`,
      description: `An enquiry-led overview of ${area.label.toLowerCase()}. Clinical details, providers, and prices require current verification and qualified review.`,
    };
  }
  return {
    title: "Page not found | HealSpoc",
    description: "The requested HealSpoc page is not available.",
  };
}

export function isKnownPath(path: string) {
  return (
    Boolean(pageMetadata[path]) ||
    treatmentAreas.some((area) => path === `/treatments/${area.slug}/`)
  );
}

function App() {
  const path = useCurrentPath();
  const redirect = legacyRedirects[path];
  const area = treatmentAreas.find(
    (item) => path === `/treatments/${item.slug}/`,
  );
  const metadata = getMetadata(path);

  useEffect(() => {
    if (redirect) {
      window.history.replaceState({}, "", routePath(redirect));
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [redirect]);

  useEffect(() => {
    updateHead(path, metadata, isKnownPath(path));
  }, [path, metadata]);

  let page: ReactNode;
  if (redirect) {
    page = (
      <section className="content-section section-pad">
        <div className="container narrow-container">
          <p>Updating this address...</p>
        </div>
      </section>
    );
  } else if (path === "/") {
    page = <HomePage />;
  } else if (path === "/about/") {
    page = <AboutPage />;
  } else if (path === "/treatments/") {
    page = <TreatmentsPage />;
  } else if (area) {
    page = <TreatmentPage area={area} />;
  } else if (path === "/hospitals/") {
    page = <HospitalsPage />;
  } else if (path === "/doctors-specialists/") {
    page = <DoctorsPage />;
  } else if (path === "/medical-travel-to-india/") {
    page = <MedicalTravelPage />;
  } else if (path === "/patient-journey/") {
    page = <PatientJourneyPage />;
  } else if (path === "/patient-assistance/") {
    page = <PatientAssistancePage />;
  } else if (path === "/health-resources/") {
    page = <HealthResourcesPage />;
  } else if (path === "/health-resources/questions-to-ask-before-travel/") {
    page = <PlanningGuidePage />;
  } else if (path === "/faqs/") {
    page = <FaqPage />;
  } else if (path === "/contact/") {
    page = <ContactPage />;
  } else if (path === "/privacy-policy/") {
    page = <PrivacyPage />;
  } else if (path === "/terms-and-conditions/") {
    page = <TermsPage />;
  } else if (path === "/medical-disclaimer/") {
    page = <MedicalDisclaimerPage />;
  } else {
    page = <NotFoundPage />;
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">{page}</main>
      <PageFooter />
      <WhatsAppWidget currentPath={path} />
    </div>
  );
}

export default App;