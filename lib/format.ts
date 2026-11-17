// One price format for the whole site: $25.00, $1,250.00.
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function formatPrice(dollars: number): string {
  return usd.format(dollars)
}
