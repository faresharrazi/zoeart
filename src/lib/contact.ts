/** Google Maps search link for a postal address. */
export const mapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address.replace(/\s+/g, " ").trim()
  )}`;

/** Instagram profile link from a handle written as "name" or "@name". */
export const instagramUrl = (handle: string) =>
  `https://instagram.com/${encodeURIComponent(handle.trim().replace(/^@/, ""))}`;
