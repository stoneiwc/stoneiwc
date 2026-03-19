import {defineField, defineType} from 'sanity'

export const homePageImagesType = defineType({
  name: 'homePageImages',
  title: 'Home Page Images',
  type: 'document',
  fields: [
    defineField({
      name: 'aboutImage',
      title: 'About Section Image',
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
    defineField({
      name: 'culinaryImage',
      title: 'Culinary Wellness Section Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          initialValue: 'Stone IWC culinary wellness program with fresh organic ingredients',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Home Page Images'}
    },
  },
})
