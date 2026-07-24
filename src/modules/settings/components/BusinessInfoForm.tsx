import React, { useState, useEffect } from 'react';
import { Store, Phone, Mail, MapPin, Image, Save } from 'lucide-react';
import { Button, Input, Card } from '@/components/common';
import { BusinessSettings } from '../types';

interface BusinessInfoFormProps {
  initialData: BusinessSettings;
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>;
  saving: boolean;
}

export const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({
  initialData,
  onSave,
  saving,
}) => {
  const [businessName, setBusinessName] = useState(initialData.businessName || '');
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [address, setAddress] = useState(initialData.address || '');

  useEffect(() => {
    setBusinessName(initialData.businessName || '');
    setLogoUrl(initialData.logoUrl || '');
    setPhone(initialData.phone || '');
    setEmail(initialData.email || '');
    setAddress(initialData.address || '');
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      businessName: businessName.trim(),
      logoUrl: logoUrl.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    });
  };

  return (
    <Card className="p-5 space-y-4 border-slate-200/80">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">ព័ត៌មានអាជីវកម្ម</h3>
          <p className="text-xs text-slate-500">គ្រប់គ្រងឈ្មោះ ឡូហ្គោ និងព័ត៌មានទំនាក់ទំនងហាង</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Business Name */}
        <Input
          label="ឈ្មោះអាជីវកម្ម / ហាង"
          requiredStar
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="បញ្ចូលឈ្មោះអាជីវកម្ម..."
          icon={<Store className="w-4 h-4" />}
        />

        {/* Logo URL */}
        <div className="space-y-1">
          <Input
            label="តំណភ្ជាប់ ឡូហ្គោ (Logo URL)"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            icon={<Image className="w-4 h-4" />}
          />
          {logoUrl && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">មើលជាមុន:</span>
              <img
                src={logoUrl}
                alt="Logo preview"
                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Phone */}
        <Input
          label="លេខទូរស័ព្ទទំនាក់ទំនង"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="012 345 678"
          icon={<Phone className="w-4 h-4" />}
        />

        {/* Email */}
        <Input
          label="អ៊ីមែលទំនាក់ទំនង"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="info@example.com"
          icon={<Mail className="w-4 h-4" />}
        />

        {/* Address */}
        <Input
          label="អាសយដ្ឋាន ឬទីតាំងហាង"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ភ្នំពេញ, កម្ពុជា..."
          icon={<MapPin className="w-4 h-4" />}
        />

        {/* Save Button */}
        <div className="pt-2">
          <Button
            type="submit"
            loading={saving}
            disabled={!businessName.trim()}
            variant="primary"
            size="md"
            className="w-full font-bold shadow-xs min-h-[44px]"
            icon={<Save className="w-4 h-4" />}
          >
            រក្សាទុកព័ត៌មានអាជីវកម្ម
          </Button>
        </div>
      </form>
    </Card>
  );
};
