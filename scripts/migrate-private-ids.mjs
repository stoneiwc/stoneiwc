// Moves orders and gift cards to private document IDs.
//
// The dataset is public, and Sanity only hides documents whose _id contains a
// period. Older orders and gift cards have plain IDs, so anyone with the
// project ID could read them. This copies each one to "<type>.<old id>"
// (drafts to "drafts.<type>.<old id>") and deletes the original, one document
// per transaction. New documents already get private IDs (lib/sanity-ids.ts).
//
// Run from the repo root:
//   node --env-file=.env scripts/migrate-private-ids.mjs           # dry run
//   node --env-file=.env scripts/migrate-private-ids.mjs --apply   # do it
//
// Needs SANITY_API_TOKEN (Editor). Safe to run again: moved documents are skipped.
import { createClient } from '@sanity/client'

const TYPES = ['order', 'giftCard']
const apply = process.argv.includes('--apply')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-11',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  perspective: 'raw', // published documents and drafts
})

// Published documents with a plain ID, and drafts of them ("drafts.<plain id>").
const docs = await client.fetch(
  `*[_type in $types && (
     !(_id match "*.*") ||
     (_id in path("drafts.*") && !(string::split(_id, ".")[1] in ["order", "giftCard"]))
   )]`,
  { types: TYPES },
)

function newIdFor(doc) {
  const isDraft = doc._id.startsWith('drafts.')
  const baseId = isDraft ? doc._id.slice('drafts.'.length) : doc._id
  const privateId = `${doc._type}.${baseId}`
  return isDraft ? `drafts.${privateId}` : privateId
}

if (docs.length === 0) {
  console.log('Nothing to move: every order and gift card already has a private ID.')
  process.exit(0)
}

for (const doc of docs) {
  const newId = newIdFor(doc)
  console.log(`${apply ? 'Moving' : 'Would move'} ${doc._type} ${doc._id} -> ${newId}`)
  if (!apply) continue

  const { _rev, _updatedAt, ...fields } = doc
  await client
    .transaction()
    .createIfNotExists({ ...fields, _id: newId })
    .delete(doc._id)
    .commit({ visibility: 'sync' })
}

console.log(apply ? `Moved ${docs.length} document(s).` : `Dry run: ${docs.length} document(s) would move. Re-run with --apply.`)
