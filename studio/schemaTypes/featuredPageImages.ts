import {defineField, defineType} from 'sanity'

export const featuredPageImagesType = defineType({
  name: 'featuredPageImages',
  title: 'Featured On Page Images',
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
      return {title: 'Featured On Page Images'}
    },
  },
})
