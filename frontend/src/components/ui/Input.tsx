import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-gray-700 mb-2">{label}</label>}
      <input
        className={`w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 ${className}`}
        {...props}
      />
    </div>
  );
}
