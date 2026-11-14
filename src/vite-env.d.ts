export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
    readonly VITE_SITE_URL?: string;
    readonly VITE_BASE_PATH?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  var __HEALSPOC_SSR_PATH__: string | undefined;
}