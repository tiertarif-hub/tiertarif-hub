const BOT_WINDOW_KEYS = ["__RS_IS_BOT__", "__RS_IS_PRERENDER__"] as const;

export const BOT_UA_PATTERN = /(googlebot|googleother|google-inspectiontool|apis-google|adsbot-google|mediapartners-google|bingbot|applebot|duckduckbot|baiduspider|yandex|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp|discordbot|redditbot|semrushbot|ahrefsbot|mj12bot|dotbot|rogerbot|embedly|quora link preview|pinterestbot|petalbot|sogou|prerender)/i;

export const isBotLikeUserAgent = (userAgent: string | null | undefined) => {
  return BOT_UA_PATTERN.test(userAgent || "");
};

export const isBotLikeRuntime = () => {
  if (typeof window === "undefined") return false;

  if (BOT_WINDOW_KEYS.some((key) => Boolean(window[key]))) {
    return true;
  }

  if (typeof document !== "undefined" && document.documentElement?.getAttribute("data-rs-bot") === "1") {
    return true;
  }

  if (typeof navigator !== "undefined") {
    return isBotLikeUserAgent(navigator.userAgent);
  }

  return false;
};
