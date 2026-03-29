import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const mediaItemType = defineType({
  name: 'mediaItem',
  title: 'Media Item',
  type: 'document',
  fields: [
    orderRankField({type: 'mediaItem', hidden: true}),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Full YouTube video URL (e.g. https://www.youtube.com/watch?v=...)',
      validation: (Rule) =>
        Rule.required().uri({scheme: ['http', 'https']}),
    }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: 'title',
      subtitle: 'youtubeUrl',
    },
    prepare({title, subtitle}) {
      return {title, subtitle}
    },
  },
})
