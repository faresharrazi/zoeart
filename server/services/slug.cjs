const { query } = require("../config/database.cjs");

// Greek letters to Latin, so Greek titles produce readable URLs.
const GREEK = {
  α: "a",
  β: "v",
  γ: "g",
  δ: "d",
  ε: "e",
  ζ: "z",
  η: "i",
  θ: "th",
  ι: "i",
  κ: "k",
  λ: "l",
  μ: "m",
  ν: "n",
  ξ: "x",
  ο: "o",
  π: "p",
  ρ: "r",
  σ: "s",
  ς: "s",
  τ: "t",
  υ: "y",
  φ: "f",
  χ: "ch",
  ψ: "ps",
  ω: "o",
};

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents (é -> e, ά -> α)
    .replace(/[α-ω]/g, (c) => GREEK[c] || "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180);

// A slug for `table` that no other row uses: "title", then "title-2", ...
// `table` is always a constant from our code, never user input.
const uniqueSlug = async (table, wanted, excludeId = null) => {
  const base = slugify(wanted) || "item";
  const { rows } = await query(
    `SELECT slug FROM ${table} WHERE (slug = $1 OR slug LIKE $1 || '-%') AND id IS DISTINCT FROM $2::int`,
    [base, excludeId]
  );
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
};

module.exports = { slugify, uniqueSlug };
