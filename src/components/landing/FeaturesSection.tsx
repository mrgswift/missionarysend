import {
  DollarSign,
  Users,
  MessageSquare,
  Image,
  Bell,
  Shield,
  TrendingUp,
  Globe,
  Heart,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'

const features = [
  {
    icon: DollarSign,
    title: 'Fundraising Made Simple',
    description:
      'Set your goal, share your page, and watch donations come in. Integrated with Stripe for secure payments.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    title: 'Build Your Support Team',
    description:
      'Invite followers to stay updated on your journey. They receive notifications for every update you share.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'Engage with Comments',
    description:
      'Foster community with threaded comments, reactions, and real-time interactions with your supporters.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Image,
    title: 'Share Your Story',
    description:
      'Upload photos and videos from the field. Set a default image to showcase your mission.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Keep supporters engaged with automatic notifications for trip updates, prayer requests, and milestones.',
    color: 'from-rose-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description:
      '501(c)(3) support for tax-deductible donations. Bank-level security for all transactions.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: TrendingUp,
    title: 'Track Your Progress',
    description:
      'Real-time fundraising analytics, donor insights, and engagement metrics at your fingertips.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description:
      'Support for restricted countries, multiple currencies, and international payment methods.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Heart,
    title: 'Prayer Support',
    description:
      'Dedicated prayer intercessors can follow your journey and receive prayer request notifications.',
    color: 'from-pink-500 to-rose-500',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-slate-50">
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
            Everything You Need for
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Successful Mission Trips
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            A complete platform designed specifically for missionaries and
            mission organizations
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-600 mb-4">
            Join hundreds of missionaries already using our platform
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white"
                />
              ))}
            </div>
            <p className="text-sm text-slate-500 ml-2">+1,200 missionaries</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const Icon = feature.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 h-full hover:shadow-lg transition-shadow group">
        <div
          className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          {feature.title}
        </h3>
        <p className="text-slate-600 leading-relaxed">{feature.description}</p>
      </Card>
    </motion.div>
  )
}
