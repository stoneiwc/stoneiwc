import {defineField, defineType} from 'sanity'

export const certificationsImagesType = defineType({
  name: 'certificationsImages',
  title: 'Practitioner Certifications Images',
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
          initialValue: 'Holistic practitioner certification training at Stone IWC',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Practitioner Certifications Images'}
    },
  },
})
