import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, User } from 'lucide-react';
import { Button } from '@/components/common';
import { storageService } from '@/modules/settings/services/storageService';

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl?: string | null;
  userName: string;
  onAvatarChange: (newUrl: string | null) => void;
  disabled?: boolean;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  userId,
  currentAvatarUrl,
  userName,
  onAvatarChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const initialLetter = (userName || 'U').charAt(0).toUpperCase();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploading(true);

    try {
      const url = await storageService.uploadBusinessLogo(userId, file);
      onAvatarChange(url);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setErrorMsg(err.message || 'មិនអាចអាប់ឡូតរូបភាពបានទេ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onAvatarChange(null);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Avatar Container */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-full border-2 border-white shadow-md overflow-hidden bg-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shrink-0">
          {currentAvatarUrl ? (
            <img
              src={currentAvatarUrl}
              alt={userName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, fallback to initials
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span>{initialLetter}</span>
          )}
        </div>

        {/* Floating Upload Trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-colors cursor-pointer border-2 border-white"
          title="ប្តូររូបភាព"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={uploading}
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          icon={<Upload className="w-3.5 h-3.5 text-indigo-600" />}
          className="text-xs font-semibold"
        >
          {uploading ? 'កំពុងអាប់ឡូត...' : 'ជ្រើសរើសរូបភាព'}
        </Button>

        {currentAvatarUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || uploading}
            onClick={handleRemove}
            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            className="text-xs font-semibold text-rose-600 hover:bg-rose-50"
          >
            លុប
          </Button>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs font-medium text-rose-600">{errorMsg}</p>
      )}
    </div>
  );
};
