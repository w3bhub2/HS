export type AnalyticsEventName =
  | "whatsapp_widget_open"
  | "whatsapp_category_selection"
  | "whatsapp_click"
  | "treatment_whatsapp_click"
  | "contact_form_start"
  | "contact_form_submission"
  | "contact_form_error";

export type AnalyticsProperties = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: AnalyticsProperties[];
    gtag?: (
      command: string,
      eventName: string,
      properties: AnalyticsProperties,
    ) => void;
  }
}

// Exposes a privacy-conscious event seam without adding an analytics vendor or ID.
export function trackEvent(
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  const event = { event: eventName, ...properties };

  window.dispatchEvent(
    new CustomEvent("healspoc:analytics", { detail: event }),
  );

  window.dataLayer?.push(event);
  window.gtag?.("event", eventName, properties);
}