import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import {
  UserPlus,
  FileText,
  Share2,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Account',
    description:
      'Sign up in minutes. Choose between individual missionary or organization account.',
    color: 'from-blue-500 to-cyan-500',
    time: '2 minutes',
  },
  {
    icon: FileText,
    title: 'Build Your Trip Page',
    description:
      'Add your story, photos, fundraising goal, and trip details. Make it personal and compelling.',
    color: 'from-purple-500 to-pink-500',
    time: '10 minutes',
  },
  {
    icon: Share2,
    title: 'Share with Supporters',
    description:
      'Invite followers via email, social media, or direct link. They get instant notifications.',
    color: 'from-amber-500 to-orange-500',
    time: '5 minutes',
  },
  {
    icon: DollarSign,
    title: 'Activate Fundraising',
    description:
      'Connect Stripe and activate your trip. Start accepting donations immediately.',
    color: 'from-emerald-500 to-teal-500',
    time: '5 minutes',
  },
  {
    icon: Users,
    title: 'Engage Your Community',
    description:
      'Post updates, share prayer requests, respond to comments, and build momentum.',
    color: 'from-rose-500 to-red-500',
    time: 'Ongoing',
  },
  {
    icon: TrendingUp,
    title: 'Track Your Progress',
    description:
      'Monitor donations, follower engagement, and trip milestones in real-time.',
    color: 'from-indigo-500 to-violet-500',
    time: 'Real-time',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
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
            From Setup to Success in{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Under 30 Minutes
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Everything you need to launch your mission trip fundraising
            campaign, step by step.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>

        {/* Success Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">
              Join Successful Missionaries
            </h3>
            <p className="text-slate-600">
              Real results from missionaries using our platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: '$2.5M+', label: 'Total Funds Raised' },
              { value: '1,200+', label: 'Active Trips' },
              { value: '15,000+', label: 'Donors Connected' },
              { value: '50+', label: 'Countries Reached' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What You Get */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Everything Included
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Custom trip page with your branding',
              'Secure Stripe payment processing',
              'Unlimited photo & video uploads',
              'Follower notification system',
              'Comment & reaction features',
              'Prayer request sharing',
              'Real-time fundraising analytics',
              'Donor management dashboard',
              'Tax-deductible receipt generation',
              'Mobile-optimized pages',
              'Email support',
              'Regular platform updates',
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link to="/sign-up">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get Started Free
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            No credit card required • Set up in minutes
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const Icon = step.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 h-full hover:shadow-lg transition-all group relative overflow-hidden">
        {/* Step Number Badge */}
        <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
          {index + 1}
        </div>

        {/* Icon */}
        <div
          className={`h-14 w-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {step.title}
        </h3>
        <p className="text-slate-600 leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Time Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
          <div className="h-2 w-2 bg-green-500 rounded-full" />
          <span className="text-xs font-medium text-slate-700">
            {step.time}
          </span>
        </div>
      </Card>
    </motion.div>
  )
}
