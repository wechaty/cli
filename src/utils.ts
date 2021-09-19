export function reverseObject (obj: any): any {
  const entries = Object.entries(obj).reverse()
  return Object.fromEntries(entries)
}
