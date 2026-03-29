import {defineField, defineType} from 'sanity'

export const qcShowEpisodeType = defineType({
  name: 'qcShowEpisode',
  title: 'QC Show Episode',
  type: 'document',
  fields: [
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Full YouTube video URL (e.g. https://www.youtube.com/watch?v=...)',
      validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {subtitle: 'youtubeUrl'},
    prepare({subtitle}) {
      return {title: 'Episode', subtitle}
    },
  },
})
