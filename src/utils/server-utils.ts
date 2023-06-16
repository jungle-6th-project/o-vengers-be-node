export function getLiveKitURL(region?: string | string[]): string {
  let targetKey = "LIVEKIT_URL";
  if (region && !Array.isArray(region)) {
    targetKey = `LIVEKIT_URL_${region}`.toUpperCase();
  }
  const url = process.env[targetKey];
  if (!url) {
    throw new Error(`${targetKey} is not defined`);
  }
  return url;
}
