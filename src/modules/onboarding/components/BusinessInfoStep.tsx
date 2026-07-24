import React, { useState } from 'react';
import { Store, User, Phone, MapPin, Layers, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from '@/components/common';
import { BusinessProfile } from '../types';

interface BusinessInfoStepProps {
  data: BusinessProfile;
  onNext: (updated: Partial<BusinessProfile>) => void;
  onBack: () => void;
}

const BUSINESS_CATEGORIES = [
  'ហាងលក់ចាប់ហួយ / មីនីម៉ាត',
  'ហាងកាហ្វេ / ភេសជ្ជៈ',
  'ភោជនីយដ្ឋាន / អាហារដ្ឋាន',
  'ហាងលក់សំលៀកបំពាក់',
  'ហាងលក់គ្រឿងអេឡិចត្រូនិក',
  'សេវាកម្មទូទៅ / ផ្សេងៗ',
];

export const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  data,
  onNext,
  onBack,
}) => {
  const [businessName, setBusinessName] = useState(data.businessName || '');
  const [businessType, setBusinessType] = useState(data.businessType || BUSINESS_CATEGORIES[0]);
  const [ownerName, setOwnerName] = useState(data.ownerName || '');
  const [phone, setPhone] = useState(data.phone || '');
  const [address, setAddress] = useState(data.address || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('សូមបញ្ចូលឈ្មោះអាជីវកម្ម ឬឈ្មោះហាងរបស់អ្នក');
      return;
    }

    setError(null);
    onNext({
      businessName: businessName.trim(),
      businessType,
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-5 space-y-4 border-slate-200/80">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">ព័ត៌មានអាជីវកម្ម</h2>
            <p className="text-xs text-slate-500">បញ្ចូលព័ត៌មានទូទៅអំពីហាង ឬអាជីវកម្មរបស់អ្នក</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Business Name */}
        <Input
          label="ឈ្មោះអាជីវកម្ម / ហាង"
          requiredStar
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="ឧ. ហាងចាប់ហួយ សុខសប្បាយ, កាហ្វេខ្មែរ..."
          icon={<Store className="w-4 h-4" />}
        />

        {/* Business Category */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            ប្រភេទទូទៅនៃអាជីវកម្ម
          </label>
          <div className="relative">
            <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
            >
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Owner Name */}
        <Input
          label="ឈ្មោះម្ចាស់អាជីវកម្ម"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="ឧ. សុខ ចាន់"
          icon={<User className="w-4 h-4" />}
        />

        {/* Phone Number */}
        <Input
          label="លេខទូរស័ព្ទទំនាក់ទំនង"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="ឧ. 012 345 678"
          icon={<Phone className="w-4 h-4" />}
        />

        {/* Address */}
        <Input
          label="អាសយដ្ឋាន ឬទីតាំងហាង"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ឧ. ភ្នំពេញ, ផ្លូវ ២៧១..."
          icon={<MapPin className="w-4 h-4" />}
        />
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          variant="secondary"
          size="lg"
          className="flex-1"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          ត្រឡប់ក្រោយ
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="flex-1"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          បន្តទៅមុខ
        </Button>
      </div>
    </form>
  );
};
