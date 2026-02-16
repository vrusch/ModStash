export const Normalizer = {
  brand: (val) =>
    val && val.length > 0
      ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
      : val,
  name: (val) => (val ? val.toLowerCase() : val),
  code: (val) => (val ? val.toUpperCase() : val),
  search: (val) => (val ? val.toLowerCase().replace(/[^a-z0-9]/g, "") : ""),
  generateId: (brand, code) => {
    if (!brand || !code) return null;
    return `${brand.toUpperCase().replace(/\s+/g, "").replace(/\./g, "")}_${code.toUpperCase().replace(/[\s\-\.]/g, "")}`;
  },
};