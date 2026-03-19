import {defineField, defineType} from 'sanity'

export const cuppingImagesType = defineType({
  name: 'cuppingImages',
  title: 'Cupping Page Images',
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
          initialValue: 'Traditional fire cupping therapy',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Cupping Page Images'}
    },
  },
})
