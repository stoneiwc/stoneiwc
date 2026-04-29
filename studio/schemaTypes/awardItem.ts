import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const awardItemType = defineType({
  name: 'awardItem',
  title: 'Award Item',
  type: 'document',
  fields: [
    orderRankField({type: 'awardItem', hidden: true}),
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
    prepare({title, media}) {
      return {title, media}
    },
  },
})
