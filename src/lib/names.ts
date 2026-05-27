export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function fullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}
