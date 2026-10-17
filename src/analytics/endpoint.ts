// Public address only; database keys stay on the server.
export function analyticsEndpoint(path: string) {
  const base = import.meta.env.PROD
    ? (import.meta.env["VITE_ANALYTICS_BASE_URL"] || "https://landingpage-conselt-automa-or.vercel.app").replace(/\/$/, "")
    : "";
  return `${base}/api/analytics/${path}`;
}
