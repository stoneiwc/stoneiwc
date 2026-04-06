import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'g4ifqs0b'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_READ_TOKEN || 'sk89aHSKLHTZ3M2ewnp5hzPwhMNTS4WfPPADDh0Dtt46TFGofE9frztn0mHMFjNwQaNPmHgFSqEipgRNquAzsmTwdNH7rS2ZAuD8mNHNGOIXJAOFGJLnYtflqY5xOopIgzspgVLAeqmyFbUTkys21Ldc9DBrCMJdxKnQTRMW3UN47ddbIeaC'

export const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-11',
  useCdn: true, // Set to false for fresh data
  perspective: 'published',
})
