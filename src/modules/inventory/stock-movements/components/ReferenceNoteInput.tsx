import React from 'react';
import { FileText, Hash } from 'lucide-react';

interface ReferenceNoteInputProps {
  referenceCode: string;
  onChangeReferenceCode: (val: string) => void;
  notes: string;
  onChangeNotes: (val: string) => void;
  disabled?: boolean;
}

export const ReferenceNoteInput: React.FC<ReferenceNoteInputProps> = ({
  referenceCode,
  onChangeReferenceCode,
  notes,
  onChangeNotes,
  disabled = false,
}) => {
  return (
    <div id="reference-note-container" className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>ឯកសារយោង និងកំណត់សម្គាល់</span>
          <span className="text-slate-400 font-normal text-[11px]">(ជម្រើសបន្ថែម)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Reference Code Field */}
        <div className="relative">
          <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
            <Hash className="w-4 h-4" />
          </div>
          <input
            id="movement-reference-code-input"
            type="text"
            disabled={disabled}
            value={referenceCode}
            onChange={(e) => onChangeReferenceCode(e.target.value)}
            placeholder="លេខកូដវិក្កយបត្រ / លេខបញ្ជាទិញ / Ref Code (បើមាន)..."
            className="w-full text-xs font-medium text-slate-900 bg-white py-2.5 pl-9 pr-3 rounded-xl border border-slate-200/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all disabled:opacity-60"
          />
        </div>

        {/* Notes Textarea */}
        <div className="relative">
          <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
            <FileText className="w-4 h-4" />
          </div>
          <textarea
            id="movement-notes-input"
            rows={2}
            disabled={disabled}
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            placeholder="បន្ថែម កំណត់សម្គាល់ ឬព័ត៌មានលម្អិតផ្សេងៗ..."
            className="w-full text-xs font-medium text-slate-900 bg-white py-2.5 pl-9 pr-3 rounded-xl border border-slate-200/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
};
