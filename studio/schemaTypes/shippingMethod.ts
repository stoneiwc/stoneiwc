import { defineField, defineType } from 'sanity'

export const shippingMethodType = defineType({
  name: 'shippingMethod',
  title: 'Shipping Method',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'slug',
      description: 'Unique identifier (e.g. standard, express, overnight)',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      description: 'e.g. Delivery in 5-7 business days',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cost',
      title: 'Cost ($)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = shown first',
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'cost',
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle != null ? `$${subtitle}` : '',
      }
    },
  },
})
