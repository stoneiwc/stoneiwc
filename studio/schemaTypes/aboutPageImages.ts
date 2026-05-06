import {defineField, defineType} from 'sanity'

export const aboutPageImagesType = defineType({
  name: 'aboutPageImages',
  title: 'About Page Images',
  type: 'document',
  fields: [
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alternative Text'}],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'About Page Images'}
    },
  },
})
