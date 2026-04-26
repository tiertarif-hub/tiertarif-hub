// Global type declarations for external scripts

interface C4fRegisterOptions {
  code: string;
  container?: string;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

interface C4fRegisterInstance {
  registerUser: () => void;
}

declare global {
  interface Window {
    jQuery: typeof import('jquery');
    $: typeof import('jquery');
    C4fRegister: new (options: C4fRegisterOptions) => C4fRegisterInstance;
    cfr: C4fRegisterInstance;
    __RS_IS_BOT__?: boolean;
    __RS_IS_PRERENDER__?: boolean;
    prerenderReady?: boolean;
    __RS_PRERENDER_BOOTSTRAP_TIMEOUT_ID__?: number;
    __RS_PRERENDER_STATE__?: {
      routeKey: string | null;
      ready: boolean;
      timeoutId: number | null;
    };
    mrmoScrollToViewport?: number;
    mrmoScrollToViewportOffset?: number;
  }
}


declare namespace JSX {
  interface IntrinsicElements {
    "rs-jsonld": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}

export {};
