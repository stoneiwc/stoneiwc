// Sanity answers 409 both when a patch's ifRevisionId no longer matches and
// when create() is given an _id that already exists. Callers use either case
// as an atomic "someone else got there first" signal.
export function isSanityConflict(err: unknown): boolean {
  return (err as { statusCode?: number } | null)?.statusCode === 409
}
