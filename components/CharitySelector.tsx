'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Search, ChevronRight, CheckCircle } from 'lucide-react'

interface Charity {
  id: string
  name: string
  description: string
  category: string
  logo_url?: string
  is_featured: boolean
}

interface CharitySelectorProps {
  charities: Charity[]
  selectedCharityId: string | null
  charityPercentage: number
  onSelect: (charityId: string, percentage: number) => Promise<void>
}

export function CharitySelector({
  charities,
  selectedCharityId,
  charityPercentage,
  onSelect,
}: CharitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [percentage, setPercentage] = useState(charityPercentage)
  const [isSaving, setIsSaving] = useState(false)

  const categories = Array.from(new Set(charities.map(c => c.category)))

  const filteredCharities = charities.filter(charity => {
    const matchesSearch = charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         charity.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || charity.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSave = async (charityId: string) => {
    setIsSaving(true)
    try {
      await onSelect(charityId, percentage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Selection */}
      {selectedCharityId && (
        <div className="glass-card p-4 rounded-xl border border-neon-green/30 bg-neon-green/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
              <Heart size={24} className="text-neon-green" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white/50">Currently Supporting</div>
              <div className="font-semibold text-white">
                {charities.find(c => c.id === selectedCharityId)?.name}
              </div>
              <div className="text-sm text-neon-green">{charityPercentage}% of subscription</div>
            </div>
            <CheckCircle size={24} className="text-neon-green" />
          </div>
        </div>
      )}

      {/* Percentage Slider */}
      <div className="glass-card p-4 rounded-xl">
        <label className="text-sm text-white/50 mb-3 block">
          Contribution Percentage: <span className="text-neon-cyan font-semibold">{percentage}%</span>
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: '#00ffff' }}
        />
        <div className="flex justify-between text-xs text-white/30 mt-2">
          <span>Minimum 10%</span>
          <span>Maximum 100%</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search charities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              !selectedCategory
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/30'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/30'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Charity List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {filteredCharities.map((charity, index) => (
          <motion.div
            key={charity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card p-4 rounded-xl border transition-all cursor-pointer ${
              selectedCharityId === charity.id
                ? 'border-neon-green bg-neon-green/5'
                : 'border-white/10 hover:border-white/30'
            }`}
            onClick={() => handleSave(charity.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                charity.is_featured ? 'bg-neon-gold/20' : 'bg-white/5'
              }`}>
                <Heart size={24} className={charity.is_featured ? 'text-neon-gold' : 'text-white/50'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white truncate">{charity.name}</h4>
                  {charity.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-neon-gold/20 text-neon-gold flex-shrink-0">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50 line-clamp-2">{charity.description}</p>
                <span className="text-xs text-neon-cyan mt-1 inline-block">{charity.category}</span>
              </div>
              {selectedCharityId === charity.id && (
                <CheckCircle size={20} className="text-neon-green flex-shrink-0" />
              )}
              {selectedCharityId !== charity.id && (
                <ChevronRight size={20} className="text-white/30 flex-shrink-0" />
              )}
            </div>
          </motion.div>
        ))}

        {filteredCharities.length === 0 && (
          <div className="text-center py-8 text-white/30">
            No charities found matching your search
          </div>
        )}
      </div>
    </div>
  )
}
