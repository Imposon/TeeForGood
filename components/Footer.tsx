'use client'

import { motion } from 'framer-motion'
import { Heart, Github, Twitter, Instagram, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'Features', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'How It Works', href: '#' },
    { label: 'Winners', href: '#' },
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press Kit', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  resources: [
    { label: 'Blog', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Community', href: '#' },
    { label: 'Partners', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Licenses', href: '#' },
  ],
}

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
]

export function Footer() {
  return (
    <footer className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-green to-neon-cyan rounded-xl rotate-45 scale-75" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
              </div>
              <span className="text-xl font-bold gradient-text">TeeForGood</span>
            </div>
            <p className="text-white/50 text-sm mb-6 max-w-xs">
              Transforming golf games into charitable impact. Every swing counts, every donation matters.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-white/50 hover:text-white hover:border-neon-green/30 transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4 capitalize">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-blue-500 flex items-center justify-center">
                <Mail size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white">Stay in the loop</h4>
                <p className="text-sm text-white/50">Get updates on draws, winners, and impact stories</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-64 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-green/50 transition-colors"
              />
              <motion.button
                className="px-6 py-3 btn-neon rounded-xl font-medium whitespace-nowrap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="text-sm text-white/50">
            © 2024 TeeForGood. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-sm text-white/50">
            Made with <Heart size={16} className="text-neon-green fill-neon-green" /> for golf lovers worldwide
          </div>
        </div>
      </div>
    </footer>
  )
}
