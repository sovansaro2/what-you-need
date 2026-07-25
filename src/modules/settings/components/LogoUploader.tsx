import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common';
import { storageService } from '../services/storageService';

interface LogoUploaderProps {
  userId: string;
  currentLogoUrl?: string;
  onLogoChange: (newUrl: string) => void;
  disabled?: boolean;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  userId,
  currentLogoUrl,
  onLogoChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);

    try {
      const publicUrl = await storageService.uploadBusinessLogo(userId, file);
      onLogoChange(publicUrl);
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setUploadError(err.message || 'មិនអាចអាប់ឡូតរូបភាពបានទេ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTriggerUpload = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = () => {
    onLogoChange('');
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
        <Camera className="w-4 h-4 text-indigo-600" />
        រូបសញ្ញាអាជីវកម្ម / ហាង (Logo)
      </label>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        className="hidden"
      />

      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {currentLogoUrl ? (
        /* Preview & Action Buttons Area */
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={currentLogoUrl}
              alt="Business Logo"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-100 shadow-2xs bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Logo';
              }}
            />
          </div>

          <div className="space-y-2 text-center sm:text-left w-full">
            <div>
              <p className="text-xs font-bold text-slate-900">បានបញ្ចូលរូបសញ្ញា</p>
              <p className="text-[11px] text-slate-400">
                រក្សាទុកកនុង Supabase Storage (business-assets)
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap justify-center sm:justify-start">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTriggerUpload}
                loading={uploading}
                disabled={disabled}
                className="text-xs font-bold min-h-[44px] px-3"
                icon={<RefreshCw className="w-3.5 h-3.5 text-indigo-600" />}
              >
                ផ្លាស់ប្តូររូបសញ្ញា
              </Button>

              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleRemoveLogo}
                disabled={disabled || uploading}
                className="text-xs font-bold min-h-[44px] px-3"
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                លុបរូបសញ្ញា
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Large Upload Area Dropzone */
        <div
          onClick={handleTriggerUpload}
          className={`p-6 border-2 border-dashed rounded-2xl text-center space-y-2 cursor-pointer transition-all min-h-[140px] flex flex-col items-center justify-center ${
            disabled || uploading
              ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
              : 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/70 hover:border-indigo-400'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
            {uploading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-800">
              {uploading ? 'កំពុងអាប់ឡូតរូបភាព...' : 'បន្ថែមរូបសញ្ញា (Upload Logo)'}
            </p>
            <p className="text-[11px] text-slate-400">
              ចុចទីនេះដើម្បីជ្រើសរើសរូបភាពពីឧបករណ៍របស់អ្នក (PNG, JPG, WEBP &lt; 5MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
