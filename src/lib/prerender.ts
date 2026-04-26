type PrerenderState = {
  routeKey: string | null;
  ready: boolean;
  timeoutId: number | null;
};

type SetPrerenderBlockedOptions = {
  routeKey: string;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 12000;

function isBrowser() {
  return typeof window !== "undefined";
}

function clearTimer(id?: number | null) {
  if (!isBrowser() || typeof id !== "number") return;
  window.clearTimeout(id);
}

function getState(): PrerenderState | null {
  if (!isBrowser()) return null;

  if (!window.__RS_PRERENDER_STATE__) {
    window.__RS_PRERENDER_STATE__ = {
      routeKey: null,
      ready: false,
      timeoutId: null,
    };
  }

  return window.__RS_PRERENDER_STATE__;
}

function clearBootstrapTimeout() {
  if (!isBrowser()) return;

  if (typeof window.__RS_PRERENDER_BOOTSTRAP_TIMEOUT_ID__ === "number") {
    window.clearTimeout(window.__RS_PRERENDER_BOOTSTRAP_TIMEOUT_ID__);
    window.__RS_PRERENDER_BOOTSTRAP_TIMEOUT_ID__ = undefined;
  }
}

export function setPrerenderBlocked({ routeKey, timeoutMs = DEFAULT_TIMEOUT_MS }: SetPrerenderBlockedOptions): boolean {
  if (!isBrowser()) return false;

  clearBootstrapTimeout();

  const state = getState();
  if (!state) return false;

  clearTimer(state.timeoutId);
  state.routeKey = routeKey;
  state.ready = false;
  state.timeoutId = null;
  window.prerenderReady = false;

  state.timeoutId = window.setTimeout(() => {
    const liveState = getState();
    if (!liveState) return;
    if (liveState.routeKey !== routeKey || liveState.ready) return;

    liveState.ready = true;
    liveState.timeoutId = null;
    window.prerenderReady = true;
  }, timeoutMs);

  return true;
}

export function setPrerenderReady(routeKey?: string): boolean {
  if (!isBrowser()) return false;

  clearBootstrapTimeout();

  const state = getState();
  if (!state) return false;

  if (routeKey && state.routeKey && state.routeKey !== routeKey) {
    return false;
  }

  if (state.ready && window.prerenderReady === true) {
    return false;
  }

  clearTimer(state.timeoutId);
  state.timeoutId = null;
  state.ready = true;

  if (routeKey) {
    state.routeKey = routeKey;
  }

  window.prerenderReady = true;
  return true;
}
