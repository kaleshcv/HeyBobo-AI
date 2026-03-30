import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Linkedin, Instagram, Sparkles } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-navy-800" />
              </div>
              <h3 className="font-bold text-lg text-gold-400">HeyBobo</h3>
            </div>
            <p className="text-navy-200 text-sm leading-relaxed">
              Smart learning platform powered by AI. Education, fitness, nutrition, and lifestyle — all in one place.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4 text-gold-400 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="text-navy-200 hover:text-gold-300 transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-navy-200 hover:text-gold-300 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-navy-200 hover:text-gold-300 transition-colors">
                  Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-gold-400 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="text-navy-200 hover:text-gold-300 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-navy-200 hover:text-gold-300 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-navy-200 hover:text-gold-300 transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4 text-gold-400 text-sm uppercase tracking-wider">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-navy-200 hover:text-gold-300 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-navy-200 hover:text-gold-300 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-navy-200 hover:text-gold-300 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-navy-200 hover:text-gold-300 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gold-500/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-navy-300">
          <p>&copy; 2026 HeyBobo. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gold-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gold-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gold-300 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
