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
    defineField({
      name: 'servicesConciergeImage',
      title: 'Services Preview — Concierge Card',
      description:
        'Left card under "Holistic Treatments That Go Deeper". Recommended 1600×1200, landscape (4:3).',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          initialValue: 'Concierge holistic treatments delivered at your home or office',
        },
      ],
    }),
    defineField({
      name: 'servicesTreatmentRoomImage',
      title: 'Services Preview — In-Facility Card',
      description:
        'Right card under "Holistic Treatments That Go Deeper". Recommended 1600×1200, landscape (4:3).',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          initialValue: 'The Source of Hope treatment room in Plano, TX',
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
