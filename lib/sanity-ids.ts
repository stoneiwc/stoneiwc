// IDs for documents that must never be publicly readable.
//
// The dataset is public (private datasets aren't on Sanity's free plan), so
// anyone with the project ID can query it without a token. Sanity does keep
// one thing private in a public dataset: any document whose _id contains a
// period. Only token-authenticated requests (this server, and logged-in
// Studio users) can read those.
//
// Orders hold customer names, emails, phones and addresses, and gift cards
// hold bearer codes and balances, so they are always created with an ID of
// the form "<type>.<key>". Don't put personal data in the key: IDs outlive
// deleted documents.
export type PrivateDocumentType = 'order' | 'giftCard'

export function privateId(type: PrivateDocumentType, key: string): string {
  if (!key || key.includes('.')) throw new Error(`Invalid private ID key: "${key}"`)
  return `${type}.${key}`
}

export function isPrivateId(id: string): boolean {
  return id.includes('.')
}
