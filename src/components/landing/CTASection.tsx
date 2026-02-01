import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">
              Start Your Mission Today
            </span>
          </motion.div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to Fund Your
            <br />
            Next Mission Trip?
          </h2>

          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join 1,200+ missionaries who have raised over $2.5M for their
            mission trips. Create your trip page in minutes and start receiving
            donations today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-slate-100 text-lg px-8 py-6 h-auto shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="#pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          <p className="text-sm text-white/70 mt-8">
            No credit card required • Cancel anytime • 14-day free trial for
            organizations
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 pt-16 border-t border-white/20"
        >
          <p className="text-sm text-white/70 mb-6">
            Trusted by missionaries from
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {['YWAM', 'OM', 'Cru', 'IMB', 'Pioneers', 'SIM'].map((org) => (
              <div key={org} className="text-2xl font-bold text-white/80">
                {org}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
