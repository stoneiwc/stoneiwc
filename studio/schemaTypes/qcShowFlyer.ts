import {defineField, defineType} from 'sanity'

export const qcShowFlyerType = defineType({
  name: 'qcShowFlyer',
  title: 'QC Show Flyer',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Flyer Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {media: 'image'},
    prepare({media}) {
      return {title: 'QC Show Flyer', media}
    },
  },
})
