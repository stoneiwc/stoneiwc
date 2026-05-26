import { defineField, defineType, defineArrayMember } from 'sanity'

export const giftCardType = defineType({
  name: 'giftCard',
  title: 'Gift Card',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      type: 'string',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'originalAmount',
      title: 'Original Amount ($)',
      type: 'number',
      readOnly: true,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currentBalance',
      title: 'Current Balance ($)',
      type: 'number',
      description: 'Remaining unspent balance. Auto-deducted on redemption.',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Fully redeemed', value: 'redeemed' },
          { title: 'Expired', value: 'expired' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'purchaserName',
      title: 'Purchaser Name',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'purchaserEmail',
      title: 'Purchaser Email',
      type: 'string',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'recipientName',
      title: 'Recipient Name',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'recipientEmail',
      title: 'Recipient Email',
      type: 'string',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'note',
      title: 'Note from Purchaser',
      type: 'text',
      rows: 4,
      readOnly: true,
    }),
    defineField({
      name: 'paymentIntentId',
      title: 'Stripe Payment Intent ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'redemptions',
      title: 'Redemption History',
      type: 'array',
      readOnly: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'redemption',
          fields: [
            defineField({
              name: 'orderId',
              title: 'Order / PaymentIntent ID',
              type: 'string',
            }),
            defineField({
              name: 'amount',
              title: 'Amount Redeemed ($)',
              type: 'number',
            }),
            defineField({
              name: 'redeemedAt',
              title: 'Redeemed At',
              type: 'datetime',
            }),
          ],
          preview: {
            select: {
              amount: 'amount',
              orderId: 'orderId',
              redeemedAt: 'redeemedAt',
            },
            prepare({ amount, orderId, redeemedAt }) {
              const date = redeemedAt ? new Date(redeemedAt).toLocaleDateString() : ''
              return {
                title: `-$${amount} on ${date}`,
                subtitle: orderId,
              }
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: 'Created (newest first)',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
    {
      title: 'Balance (highest first)',
      name: 'balanceDesc',
      by: [{ field: 'currentBalance', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      code: 'code',
      original: 'originalAmount',
      balance: 'currentBalance',
      status: 'status',
      recipient: 'recipientEmail',
    },
    prepare({ code, original, balance, status, recipient }) {
      const statusLabel =
        status === 'active' ? '✅' : status === 'redeemed' ? '❌' : '⏳'
      return {
        title: `${code}  ${statusLabel}`,
        subtitle: `$${original} → $${balance} left · ${recipient}`,
      }
    },
  },
})
