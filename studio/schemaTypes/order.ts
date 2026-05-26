import { defineField, defineType, defineArrayMember } from 'sanity'

const STATUS_VALUES = [
  { title: 'Pending payment', value: 'pending' },
  { title: 'Paid', value: 'paid' },
  { title: 'Shipped', value: 'shipped' },
  { title: 'Delivered', value: 'delivered' },
  { title: 'Cancelled', value: 'cancelled' },
  { title: 'Refunded', value: 'refunded' },
  { title: 'Payment failed', value: 'failed' },
] as const

const addressFields = [
  defineField({ name: 'line1', title: 'Address line 1', type: 'string' }),
  defineField({ name: 'line2', title: 'Address line 2', type: 'string' }),
  defineField({ name: 'city', title: 'City', type: 'string' }),
  defineField({ name: 'state', title: 'State', type: 'string' }),
  defineField({ name: 'postalCode', title: 'Postal code', type: 'string' }),
  defineField({ name: 'country', title: 'Country', type: 'string' }),
]

export const orderType = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  groups: [
    { name: 'overview', title: 'Overview', default: true },
    { name: 'fulfillment', title: 'Fulfillment' },
    { name: 'customer', title: 'Customer' },
    { name: 'items', title: 'Items & totals' },
    { name: 'admin', title: 'Internal' },
  ],
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order number',
      type: 'string',
      readOnly: true,
      group: 'overview',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'overview',
      options: { list: [...STATUS_VALUES] },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
      readOnly: true,
      group: 'overview',
    }),
    defineField({
      name: 'paidAt',
      title: 'Paid at',
      type: 'datetime',
      readOnly: true,
      group: 'overview',
    }),

    // Fulfillment (admin-editable)
    defineField({
      name: 'shippedAt',
      title: 'Shipped at',
      type: 'datetime',
      group: 'fulfillment',
    }),
    defineField({
      name: 'trackingCarrier',
      title: 'Tracking carrier',
      type: 'string',
      group: 'fulfillment',
    }),
    defineField({
      name: 'trackingNumber',
      title: 'Tracking number',
      type: 'string',
      group: 'fulfillment',
    }),

    // Customer
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'object',
      group: 'customer',
      readOnly: true,
      fields: [
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'firstName', title: 'First name', type: 'string' }),
        defineField({ name: 'lastName', title: 'Last name', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
      ],
    }),
    defineField({
      name: 'shippingAddress',
      title: 'Shipping address',
      type: 'object',
      group: 'customer',
      readOnly: true,
      fields: addressFields,
    }),
    defineField({
      name: 'billingAddress',
      title: 'Billing address',
      type: 'object',
      group: 'customer',
      readOnly: true,
      fields: addressFields,
    }),
    defineField({
      name: 'billingSameAsShipping',
      title: 'Billing same as shipping',
      type: 'boolean',
      readOnly: true,
      group: 'customer',
    }),

    // Items
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      group: 'items',
      readOnly: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lineItem',
          fields: [
            defineField({ name: 'productId', title: 'Product ID', type: 'string' }),
            defineField({ name: 'name', title: 'Name', type: 'string' }),
            defineField({ name: 'slug', title: 'Slug', type: 'string' }),
            defineField({ name: 'quantity', title: 'Quantity', type: 'number' }),
            defineField({ name: 'unitPrice', title: 'Unit price', type: 'number' }),
            defineField({ name: 'lineTotal', title: 'Line total', type: 'number' }),
            defineField({ name: 'image', title: 'Image URL', type: 'url' }),
          ],
          preview: {
            select: { name: 'name', quantity: 'quantity', lineTotal: 'lineTotal' },
            prepare({ name, quantity, lineTotal }) {
              return {
                title: `${quantity}× ${name ?? 'Item'}`,
                subtitle: lineTotal != null ? `$${lineTotal}` : undefined,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'subtotal',
      title: 'Subtotal ($)',
      type: 'number',
      readOnly: true,
      group: 'items',
    }),
    defineField({
      name: 'couponCode',
      title: 'Coupon code',
      type: 'string',
      readOnly: true,
      group: 'items',
    }),
    defineField({
      name: 'couponDiscount',
      title: 'Coupon discount ($)',
      type: 'number',
      readOnly: true,
      group: 'items',
    }),
    defineField({
      name: 'shippingMethod',
      title: 'Shipping method',
      type: 'string',
      readOnly: true,
      group: 'items',
    }),
    defineField({
      name: 'shippingCost',
      title: 'Shipping cost ($)',
      type: 'number',
      readOnly: true,
      group: 'items',
    }),
    defineField({
      name: 'giftCardCode',
      title: 'Gift card code',
      type: 'string',
      readOnly: true,
      group: 'items',
    }),
    defineField({
      name: 'giftCardApplied',
      title: 'Gift card applied ($)',
      type: 'number',
      readOnly: true,
      group: 'items',
    }),
    defineField({
      name: 'total',
      title: 'Total charged ($)',
      type: 'number',
      readOnly: true,
      group: 'items',
    }),

    // Stripe link
    defineField({
      name: 'stripePaymentIntentId',
      title: 'Stripe PaymentIntent ID',
      type: 'string',
      readOnly: true,
      group: 'overview',
    }),

    // Admin
    defineField({
      name: 'internalNotes',
      title: 'Internal notes',
      type: 'text',
      rows: 4,
      group: 'admin',
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'createdDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Status, then newest',
      name: 'statusThenCreated',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'createdAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      orderNumber: 'orderNumber',
      status: 'status',
      total: 'total',
      email: 'customer.email',
      firstName: 'customer.firstName',
      lastName: 'customer.lastName',
    },
    prepare({ orderNumber, status, total, email, firstName, lastName }) {
      const statusIcon =
        status === 'paid' ? '💳' :
        status === 'shipped' ? '📦' :
        status === 'delivered' ? '✅' :
        status === 'pending' ? '⏳' :
        status === 'cancelled' ? '❌' :
        status === 'refunded' ? '↩️' :
        status === 'failed' ? '⚠️' : ''
      const name = [firstName, lastName].filter(Boolean).join(' ').trim()
      const customerLabel = name || email || ''
      return {
        title: `${orderNumber}  ${statusIcon}`,
        subtitle: `$${total ?? 0} · ${customerLabel}`,
      }
    },
  },
})
