import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const partnerType = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    orderRankField({type: 'partner', hidden: true}),
    defineField({
      name: 'name',
      title: 'Partner Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
    }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      media: 'logo',
    },
  },
})
