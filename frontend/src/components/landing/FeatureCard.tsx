'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 h-full hover:border-blue-200 transition-colors"
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div
        className="mb-6 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-base text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
