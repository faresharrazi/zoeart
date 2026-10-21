/** Instagram profile link from a handle written as "name" or "@name". */
export const instagramUrl = (handle: string) =>
  `https://instagram.com/${encodeURIComponent(handle.trim().replace(/^@/, ""))}`;
