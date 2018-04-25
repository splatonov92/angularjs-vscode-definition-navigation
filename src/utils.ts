
export function toCamelCase(str) {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

export function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, function (g) { return '-' + g[0].toLowerCase(); });
}
