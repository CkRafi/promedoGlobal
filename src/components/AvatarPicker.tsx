import React from 'react';
import { Check } from 'lucide-react';

export interface AvatarOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  description: string;
  url: string;
}

// Male Doctor Cartoon Avatar (Teal scrubs & stethoscope)
export const MALE_AVATAR: AvatarOption = {
  id: 'male_cartoon',
  name: 'Male Doctor Avatar',
  gender: 'male',
  description: 'Male doctor avatar with teal scrubs and stethoscope',
  url: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="60" fill="#E0F2FE"/>
      <!-- Body / Scrubs -->
      <path d="M22 120 C22 90 38 82 60 82 C82 82 98 90 98 120 Z" fill="#0D9488"/>
      <!-- V-neck inner shirt -->
      <polygon points="60,94 48,82 72,82" fill="#FCE7D0"/>
      <!-- Stethoscope -->
      <path d="M46 84 C46 102 74 102 74 84" fill="none" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
      <circle cx="60" cy="104" r="5" fill="#94A3B8" stroke="#1E293B" stroke-width="2"/>
      <!-- Neck -->
      <rect x="52" y="68" width="16" height="16" rx="3" fill="#FCE7D0"/>
      <!-- Head -->
      <ellipse cx="60" cy="52" rx="20" ry="22" fill="#FCE7D0"/>
      <!-- Hair -->
      <path d="M38 48 C38 30 46 22 60 22 C74 22 82 30 82 48 C82 34 76 28 60 28 C46 28 40 36 38 48 Z" fill="#332219"/>
      <path d="M38 42 C40 32 50 26 62 26 C72 26 80 32 82 42 C78 35 68 32 60 32 C48 32 42 36 38 42 Z" fill="#1E130D"/>
      <!-- Eyes -->
      <circle cx="53" cy="52" r="2.5" fill="#1E293B"/>
      <circle cx="67" cy="52" r="2.5" fill="#1E293B"/>
      <circle cx="54" cy="51" r="0.8" fill="#FFFFFF"/>
      <circle cx="68" cy="51" r="0.8" fill="#FFFFFF"/>
      <!-- Eyebrows -->
      <path d="M50 46 Q53 44 56 46" stroke="#332219" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M64 46 Q67 44 70 46" stroke="#332219" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <!-- Smile -->
      <path d="M55 60 Q60 65 65 60" stroke="#B45309" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>
  `)}`
};

// Female Doctor Cartoon Avatar (White lab coat & stethoscope)
export const FEMALE_AVATAR: AvatarOption = {
  id: 'female_cartoon',
  name: 'Female Doctor Avatar',
  gender: 'female',
  description: 'Female doctor avatar with white coat and stethoscope',
  url: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="60" fill="#ECFDF5"/>
      <!-- White Lab Coat Body -->
      <path d="M22 120 C22 92 38 84 60 84 C82 84 98 92 98 120 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
      <polygon points="60,96 50,84 70,84" fill="#0D9488"/>
      <!-- Stethoscope -->
      <path d="M44 86 C44 103 76 103 76 86" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="60" cy="104" r="5" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
      <!-- Neck -->
      <rect x="53" y="68" width="14" height="16" rx="2" fill="#FED7AA"/>
      <!-- Back Hair -->
      <path d="M34 50 C34 76 40 88 44 92 C42 80 40 68 40 50 Z" fill="#451A03"/>
      <path d="M86 50 C86 76 80 88 76 92 C78 80 80 68 80 50 Z" fill="#451A03"/>
      <!-- Head -->
      <ellipse cx="60" cy="52" rx="18" ry="20" fill="#FED7AA"/>
      <!-- Front Hair -->
      <path d="M38 46 C38 28 46 20 60 20 C74 20 82 28 82 46 C76 34 68 28 60 28 C50 28 42 34 38 46 Z" fill="#451A03"/>
      <!-- Eyes & Lashes -->
      <circle cx="53" cy="52" r="2.3" fill="#1E293B"/>
      <circle cx="67" cy="52" r="2.3" fill="#1E293B"/>
      <circle cx="54" cy="51" r="0.7" fill="#FFFFFF"/>
      <circle cx="68" cy="51" r="0.7" fill="#FFFFFF"/>
      <path d="M50 49 L53 50" stroke="#1E293B" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M70 49 L67 50" stroke="#1E293B" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Eyebrows -->
      <path d="M50 46 Q53 43 56 46" stroke="#78350F" stroke-width="1.3" stroke-linecap="round" fill="none"/>
      <path d="M64 46 Q67 43 70 46" stroke="#78350F" stroke-width="1.3" stroke-linecap="round" fill="none"/>
      <!-- Smile -->
      <path d="M55 61 Q60 65 65 61" stroke="#E11D48" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    </svg>
  `)}`
};

// Compatibility exports
export const MALE_CARTOON_AVATARS: AvatarOption[] = [MALE_AVATAR];
export const FEMALE_CARTOON_AVATARS: AvatarOption[] = [FEMALE_AVATAR];

interface AvatarPickerProps {
  value: string;
  onChange: (avatarUrl: string) => void;
  label?: string;
  compact?: boolean;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  label = 'Doctor / Candidate Avatar',
}) => {
  // Determine active avatar selection
  const isMaleSelected = value === MALE_AVATAR.url;
  const isFemaleSelected = !isMaleSelected; // Default to female avatar if male is not selected

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-extrabold text-brand-dark uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[11px] text-brand-blue font-bold">
          {isMaleSelected ? 'Male Avatar Selected' : 'Female Avatar Selected'}
        </span>
      </div>

      {/* Avatar Selection Cards (Male Avatar & Female Avatar only - No upload) */}
      <div className="grid grid-cols-2 gap-3">
        {/* 1. Male Avatar */}
        <button
          type="button"
          onClick={() => onChange(MALE_AVATAR.url)}
          className={`relative group flex items-center gap-3.5 p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
            isMaleSelected
              ? 'border-brand-blue bg-blue-50/50 shadow-xs ring-2 ring-brand-blue/20'
              : 'border-gray-200 hover:border-brand-blue/40 bg-white hover:bg-gray-50/60'
          }`}
        >
          <div className="w-13 h-13 rounded-full overflow-hidden bg-sky-50 border-2 border-white shadow-2xs shrink-0 flex items-center justify-center">
            <img
              src={MALE_AVATAR.url}
              alt="Male Doctor Avatar"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-brand-dark block truncate">
              Male Doctor Avatar
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">
              Medical scrubs & stethoscope
            </span>
          </div>

          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
            isMaleSelected ? 'bg-brand-blue text-white shadow-xs' : 'border-2 border-gray-300'
          }`}>
            {isMaleSelected && <Check size={12} strokeWidth={3} />}
          </div>
        </button>

        {/* 2. Female Avatar */}
        <button
          type="button"
          onClick={() => onChange(FEMALE_AVATAR.url)}
          className={`relative group flex items-center gap-3.5 p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
            isFemaleSelected
              ? 'border-brand-blue bg-blue-50/50 shadow-xs ring-2 ring-brand-blue/20'
              : 'border-gray-200 hover:border-brand-blue/40 bg-white hover:bg-gray-50/60'
          }`}
        >
          <div className="w-13 h-13 rounded-full overflow-hidden bg-emerald-50 border-2 border-white shadow-2xs shrink-0 flex items-center justify-center">
            <img
              src={FEMALE_AVATAR.url}
              alt="Female Doctor Avatar"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-brand-dark block truncate">
              Female Doctor Avatar
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">
              Doctor coat & stethoscope
            </span>
          </div>

          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
            isFemaleSelected ? 'bg-brand-blue text-white shadow-xs' : 'border-2 border-gray-300'
          }`}>
            {isFemaleSelected && <Check size={12} strokeWidth={3} />}
          </div>
        </button>
      </div>
    </div>
  );
};

export default AvatarPicker;
