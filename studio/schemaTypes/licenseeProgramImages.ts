import {defineField, defineType} from 'sanity'

export const licenseeProgramImagesType = defineType({
  name: 'licenseeProgramImages',
  title: 'Licensee Programs Page Images',
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
          initialValue: 'Stone IWC licensee program certification ceremony',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Licensee Programs Page Images'}
    },
  },
})
