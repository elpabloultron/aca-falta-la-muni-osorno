'use client';

import React from 'react';
import {
  Construction,
  Lightbulb,
  Trash2,
  Droplets,
  Trees,
  Accessibility,
  AlertTriangle,
  Dog,
  Flame,
  HelpCircle,
  LucideProps,
} from 'lucide-react';
import { ReportCategory } from '@/types/report';

interface CategoryIconProps extends LucideProps {
  category: ReportCategory;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, ...props }) => {
  switch (category) {
    case 'calles':
      return <Construction {...props} />;
    case 'iluminacion':
      return <Lightbulb {...props} />;
    case 'limpieza':
      return <Trash2 {...props} />;
    case 'aguas':
      return <Droplets {...props} />;
    case 'espacios_publicos':
      return <Trees {...props} />;
    case 'accesibilidad':
      return <Accessibility {...props} />;
    case 'transito':
      return <AlertTriangle {...props} />;
    case 'bienestar_animal':
      return <Dog {...props} />;
    case 'medio_ambiente':
      return <Flame {...props} />;
    case 'otros':
    default:
      return <HelpCircle {...props} />;
  }
};
