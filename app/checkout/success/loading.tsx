import { Loader } from 'lucide-react'
import { PageHeader } from '@/components/page-header'

// Shown while the server verifies the payment with Stripe.
export default function CheckoutSuccessLoading() {
  return (
    <>
      <PageHeader
        title="Processing Order"
        subtitle="Please wait while we confirm your payment..."
      />
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="flex justify-center">
            <Loader className="h-12 w-12 animate-spin text-primary" />
          </div>
          <p className="mt-4 font-body text-muted-foreground">
            Verifying your payment...
          </p>
        </div>
      </section>
    </>
  )
}
