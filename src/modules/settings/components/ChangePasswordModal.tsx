import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '@/components/common';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<boolean>;
  saving: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  saving,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!newPassword || newPassword.length < 6) {
      setValidationError('ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ');
      return;
    }

    const success = await onConfirm(newPassword);
    if (success) {
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ប្តូរពាក្យសម្ងាត់"
      subtitle="បញ្ចូលពាក្យសម្ងាត់ថ្មីសម្រាប់គណនីរបស់អ្នក"
      icon={<Lock className="w-5 h-5 text-indigo-600" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <Input
          label="ពាក្យសម្ងាត់ថ្មី"
          type="password"
          requiredStar
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="យ៉ាងហោចណាស់ ៦ តួអក្សរ..."
          icon={<Lock className="w-4 h-4" />}
        />

        <Input
          label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
          type="password"
          requiredStar
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត..."
          icon={<CheckCircle2 className="w-4 h-4" />}
        />

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 min-h-[44px]"
            disabled={saving}
          >
            បោះបង់
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={!newPassword || !confirmPassword}
            className="flex-1 font-bold min-h-[44px]"
          >
            រក្សាទុក
          </Button>
        </div>
      </form>
    </Modal>
  );
};
