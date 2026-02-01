import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Building2, User } from 'lucide-react'
import { motion } from 'motion/react'

const missionaryFeatures = [
  'Create unlimited trip pages',
  'Fundraising with Stripe integration',
  'Photo & video galleries',
  'Follower notifications',
  'Comment & reaction system',
  'Prayer request sharing',
  'Real-time progress tracking',
  'Donor management',
  'Tax-deductible receipts',
  'Mobile-optimized pages',
]

const organizationFeatures = [
  'Everything in Missionary plan',
  'Unlimited trips per month',
  'Team member management',
  'Organization branding',
  'Advanced analytics dashboard',
  'Bulk donor communications',
  'Custom donation forms',
  'Priority support',
  'API access',
  'White-label options',
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Choose the plan that fits your mission. No hidden fees, cancel
            anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Missionary Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-8 h-full border-2 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Missionary
                  </h3>
                  <p className="text-sm text-slate-500">
                    For individual missionaries
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">$10</span>
                  <span className="text-slate-500">per trip</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  One-time payment when you activate your trip
                </p>
              </div>

              <Link to="/sign-up">
                <Button className="w-full mb-8" size="lg">
                  Start Your Trip
                </Button>
              </Link>

              <div className="space-y-3">
                <p className="font-semibold text-slate-900 mb-4">
                  Everything you need:
                </p>
                {missionaryFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  <strong className="text-slate-700">How it works:</strong>{' '}
                  Create your trip page for free. Pay $10 when you're ready to
                  activate fundraising and start accepting donations.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Organization Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 h-full border-2 border-purple-500 relative overflow-hidden shadow-xl">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0">
                <Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-purple-500 to-pink-500 border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Organization
                  </h3>
                  <p className="text-sm text-slate-500">
                    For mission organizations
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900">$65</span>
                  <span className="text-slate-500">per month</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Unlimited trips and team members
                </p>
              </div>

              <Link to="/sign-up">
                <Button
                  className="w-full mb-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  Start Free Trial
                </Button>
              </Link>

              <div className="space-y-3">
                <p className="font-semibold text-slate-900 mb-4">
                  Everything in Missionary, plus:
                </p>
                {organizationFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-purple-600" />
                    </div>
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  <strong className="text-slate-700">14-day free trial.</strong>{' '}
                  No credit card required. Cancel anytime with no questions
                  asked.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, debit cards, and ACH transfers through Stripe. Donors can also set up recurring donations."
            />
            <FAQItem
              question="Are donations tax-deductible?"
              answer="Yes! If you're registered as a 501(c)(3) organization, donations made through your trip pages are tax-deductible. We automatically generate receipts for all donors."
            />
            <FAQItem
              question="What are the processing fees?"
              answer="Stripe charges 2.9% + $0.30 per transaction. Donors have the option to cover these fees when making their donation."
            />
            <FAQItem
              question="Can I switch plans later?"
              answer="Absolutely! You can upgrade from Missionary to Organization at any time. We'll prorate your billing accordingly."
            />
            <FAQItem
              question="What happens to my data if I cancel?"
              answer="You can export all your data at any time. After cancellation, your data is retained for 90 days in case you want to reactivate."
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card className="p-6">
      <h4 className="font-semibold text-slate-900 mb-2">{question}</h4>
      <p className="text-slate-600">{answer}</p>
    </Card>
  )
}
