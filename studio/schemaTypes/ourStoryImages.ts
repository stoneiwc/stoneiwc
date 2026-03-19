import {defineField, defineType} from 'sanity'

export const ourStoryImagesType = defineType({
  name: 'ourStoryImages',
  title: 'Our Story Images',
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
          initialValue: 'Stone IWC holistic practitioners',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Our Story Images'}
    },
  },
})
