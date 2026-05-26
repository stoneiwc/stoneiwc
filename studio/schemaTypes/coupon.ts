import { defineField, defineType } from 'sanity'

export const couponType = defineType({
  name: 'coupon',
  title: 'Coupon',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'Coupon Code',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Discount Type',
      type: 'string',
      options: {
        list: [
          { title: 'Percentage (%)', value: 'percentage' },
          { title: 'Fixed Amount ($)', value: 'fixed' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Discount Value',
      type: 'number',
      description: 'For percentage: enter 10 for 10%. For fixed: enter dollar amount.',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'minSubtotal',
      title: 'Minimum Subtotal ($)',
      type: 'number',
      description: 'Leave empty if no minimum required.',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'code',
      subtitle: 'description',
    },
  },
})
