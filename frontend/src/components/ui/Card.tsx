import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-xl' : '';
  
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 transition ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}
