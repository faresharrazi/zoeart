/** Seconds before the next home page photo when the admin hasn't set one. */
export const DEFAULT_SLIDE_SECONDS = 5;

/** The speed saved in the admin (2–30 seconds), or the default. */
export const slideSeconds = (value: unknown) =>
  typeof value === "number" && value >= 2 && value <= 30
    ? value
    : DEFAULT_SLIDE_SECONDS;
