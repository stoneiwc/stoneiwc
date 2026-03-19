import {defineField, defineType} from 'sanity'

export const conciergeImagesType = defineType({
  name: 'conciergeImages',
  title: 'Concierge Page Images',
  type: 'document',
  fields: [
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          initialValue: 'Concierge wellness service setup',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Concierge Page Images'}
    },
  },
})
