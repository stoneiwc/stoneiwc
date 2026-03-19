import {defineField, defineType} from 'sanity'

export const servicesPageImagesType = defineType({
  name: 'servicesPageImages',
  title: 'All Services Page Images',
  type: 'document',
  fields: [
    defineField({
      name: 'treatmentsImage',
      title: 'Professional Treatments Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alternative Text'}],
    }),
    defineField({
      name: 'conciergeImage',
      title: 'Concierge Services Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alternative Text'}],
    }),
    defineField({
      name: 'culinaryImage',
      title: 'Culinary Wellness Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alternative Text'}],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'All Services Page Images'}
    },
  },
})
