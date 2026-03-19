import {defineField, defineType} from 'sanity'

export const virtualConsultationsImagesType = defineType({
  name: 'virtualConsultationsImages',
  title: 'Virtual Consultations Page Images',
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
          initialValue: 'Virtual holistic wellness consultation',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Virtual Consultations Page Images'}
    },
  },
})
