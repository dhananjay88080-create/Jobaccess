export const adsense = {
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
  slots: {
    top: process.env.NEXT_PUBLIC_ADSENSE_TOP_SLOT || "",
    inContent: process.env.NEXT_PUBLIC_ADSENSE_IN_CONTENT_SLOT || "",
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || ""
  }
};

export function hasAdSenseConfig() {
  return Boolean(adsense.clientId);
}
