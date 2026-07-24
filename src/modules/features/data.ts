import { DollarSign, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { FeatureItem } from './types';

export const featuresData: FeatureItem[] = [
  {
    id: 'feature-finance',
    title: 'កត់ត្រាចំណូល និង ចំណាយ',
    description: 'កត់ត្រាចំណូលសាច់ប្រាក់ ចំណាយអាជីវកម្ម ថ្លៃប្រតិបត្តិការ និងការបែងចែកប្រភេទ។',
    route: '/finance',
    status: 'available',
    icon: DollarSign,
    badgeText: 'មុខងារហិរញ្ញវត្ថុ',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'feature-inventory',
    title: 'ការគ្រប់គ្រងស្តុកទំនិញ',
    description: 'គ្រប់គ្រងផលិតផល ចំនួនស្តុក តម្លៃរាយ ប្រភេទ និងការដាស់តឿនស្តុកទាប។',
    route: '/inventory',
    status: 'coming_soon',
    icon: Package,
    badgeText: 'ស្តុក និងកាតាឡុក',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'feature-sales',
    title: 'ការគ្រប់គ្រងការលក់',
    description: 'កត់ត្រាការលក់ បង្កើតវិក្កយបត្រ និងគណនាប្រាក់ចំណេញសុទ្ធដោយស្វ័យប្រវត្តិ។',
    route: '/sales',
    status: 'coming_soon',
    icon: ShoppingCart,
    badgeText: 'ការលក់ និងវិក្កយបត្រ',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'feature-reports',
    title: 'របាយការណ៍ និងការវិភាគ',
    description: 'បង្កើតសេចក្តីសង្ខេបហិរញ្ញវត្ថុ និន្នាការលក់ គំនូសតាងចំណេញ និងនាំចេញទិន្នន័យ។',
    route: '/reports',
    status: 'coming_soon',
    icon: BarChart3,
    badgeText: 'ការវិភាគអាជីវកម្ម',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
];
