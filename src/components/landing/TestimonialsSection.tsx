import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Star, Quote } from 'lucide-react'
import { motion } from 'motion/react'

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Missionary to Kenya',
    avatar: 'SM',
    content:
      'This platform made fundraising so much easier. I raised $12,000 in just 6 weeks! The ability to share updates and photos kept my supporters engaged throughout the entire journey.',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Youth Pastor, Grace Church',
    avatar: 'DC',
    content:
      'We use this for all our mission trips now. The organization plan is perfect for managing multiple teams. The analytics help us understand our donor base better.',
    rating: 5,
  },
  {
    name: 'Maria Rodriguez',
    role: 'Medical Missionary, Honduras',
    avatar: 'MR',
    content:
      'The prayer request feature is incredible. My intercessors receive notifications and can pray specifically for what we need. It is more than just fundraising—it is community.',
    rating: 5,
  },
  {
    name: 'Pastor James Wilson',
    role: 'Mission Director, Hope International',
    avatar: 'JW',
    content:
      'We have sent 50+ missionaries using this platform. The tax-deductible receipts and Stripe integration make everything seamless. Highly recommend for any organization.',
    rating: 5,
  },
  {
    name: 'Emily Thompson',
    role: 'First-time Missionary to Thailand',
    avatar: 'ET',
    content:
      'I was nervous about asking for support, but this platform made it so professional. The templates and guidance helped me tell my story effectively. Exceeded my goal by 20%!',
    rating: 5,
  },
  {
    name: 'Michael Brown',
    role: 'Missions Coordinator',
    avatar: 'MB',
    content:
      'The follower notification system is genius. Our supporters stay engaged long after they donate. We have seen a 40% increase in recurring donations since switching.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-slate-50">
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
            Loved by Missionaries
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Around the World
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            See what missionaries and organizations are saying about their
            experience
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold mb-2">4.9/5</p>
                <p className="text-slate-300 text-sm">Average Rating</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">1,200+</p>
                <p className="text-slate-300 text-sm">Active Users</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">$2.5M+</p>
                <p className="text-slate-300 text-sm">Funds Raised</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">50+</p>
                <p className="text-slate-300 text-sm">Countries Served</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 h-full hover:shadow-lg transition-shadow relative">
        <Quote className="absolute top-4 right-4 h-8 w-8 text-slate-200" />

        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>

        {/* Content */}
        <p className="text-slate-700 mb-6 leading-relaxed">
          "{testimonial.content}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 mt-auto">
          <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {testimonial.avatar}
            </span>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900">{testimonial.name}</p>
            <p className="text-sm text-slate-500">{testimonial.role}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
