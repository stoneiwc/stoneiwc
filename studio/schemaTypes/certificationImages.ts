import {defineField, defineType} from 'sanity'

export const certificationImagesType = defineType({
  name: 'certificationImages',
  title: 'Practitioner Certifications Page Images',
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
      return {title: 'Practitioner Certifications Page Images'}
    },
  },
})
