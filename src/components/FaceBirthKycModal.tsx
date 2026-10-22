import React, { useState } from 'react';
import { 
  X, Camera, FileText, CheckCircle2, AlertCircle, ScanFace, 
  Upload, Eye, RefreshCw, ShieldCheck, Clock, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { compressImageFile } from '../utils/imageUtils';
import { validateBirthCertNumber } from '../utils/platformLogic';

interface FaceBirthKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    mobile: string;
    verified: boolean;
    kycStatus?: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
    kycRejectionReason?: string;
    facePhoto?: string;
    birthCertPhoto?: string;
    birthCertNumber?: string;
    referredBy?: string;
  };
  onSubmitKyc: (data: {
    facePhoto: string;
    birthCertPhoto: string;
    birthCertNumber: string;
  }) => Promise<void>;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
}

export const FaceBirthKycModal: React.FC<FaceBirthKycModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmitKyc,
  onOpenLightbox
}) => {
  const [faceImagePreview, setFaceImagePreview] = useState<string>(user.facePhoto || '');
  const [faceFileName, setFaceFileName] = useState<string>('');
  const [birthCertPreview, setBirthCertPreview] = useState<string>(user.birthCertPhoto || '');
  const [birthCertFileName, setBirthCertFileName] = useState<string>('');
  const [birthCertNumber, setBirthCertNumber] = useState<string>(user.birthCertNumber || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResubmitting, setIsResubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentStatus = user.verified 
    ? 'approved' 
    : (user.kycStatus || (user.facePhoto ? 'pending' : 'unsubmitted'));

  const handleFaceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaceFileName(file.name);
      try {
        const compressed = await compressImageFile(file, 800, 0.75);
        setFaceImagePreview(compressed);
      } catch (err) {
        console.error("Error reading face photo:", err);
      }
    }
  };

  const handleBirthCertChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBirthCertFileName(file.name);
      try {
        const compressed = await compressImageFile(file, 1000, 0.75);
        setBirthCertPreview(compressed);
      } catch (err) {
        console.error("Error reading birth certificate:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceImagePreview) {
      alert('দয়া করে আপনার ফেস এর স্পষ্ট ছবি (Face Photo) দিন।');
      return;
    }
    if (!birthCertPreview) {
      alert('দয়া করে আপনার ডিজিটাল জন্মনিবন্ধন সনদ (Birth Certificate) এর ছবি আপলোড করুন।');
      return;
    }

    const certVal = validateBirthCertNumber(birthCertNumber);
    if (!certVal.isValid) {
      alert(certVal.error || 'সঠিক জন্মনিবন্ধন সনদ নম্বর লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitKyc({
        facePhoto: faceImagePreview,
        birthCertPhoto: birthCertPreview,
        birthCertNumber: birthCertNumber.trim()
      });
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setIsResubmitting(false);
    } catch (err) {
      console.error("Error submitting KYC:", err);
      alert('ভেরিফিকেশন জমা দেওয়ার সময় ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-blue-200 space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <ScanFace className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                ফেস ভেরিফিকেশন ও জন্মনিবন্ধন সনদ
              </h3>
              <p className="text-[11px] text-blue-600 font-bold">Face Verification & Birth Certificate KYC</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATUS: APPROVED */}
        {currentStatus === 'approved' && !isResubmitting && (
          <div className="py-6 space-y-4 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800">অভিনন্দন! আপনার অ্যাকাউন্ট ভেরিফাইড</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                আপনার ফেস ভেরিফিকেশন ও জন্মনিবন্ধন সনদ অনার (Owner) কর্তৃক সফলভাবে যাচাই ও অনুমোদিত হয়েছে।
              </p>
            </div>

            {/* Preview of Verified Photos */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-left">
              {user.facePhoto && (
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                    <span>ফেস ভেরিফিকেশন ছবি</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Verified</span>
                  </div>
                  <div 
                    onClick={() => onOpenLightbox(user.facePhoto!, 'ভেরিফাইড ফেস ছবি', user.name)}
                    className="relative cursor-pointer group rounded-xl overflow-hidden aspect-square bg-slate-900 border border-slate-200"
                  >
                    <img src={user.facePhoto} alt="Face Photo" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all">
                      <Eye className="w-4 h-4 mr-1" /> বড় করে দেখুন
                    </div>
                  </div>
                </div>
              )}

              {user.birthCertPhoto && (
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                    <span>জন্মনিবন্ধন সনদ</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Verified</span>
                  </div>
                  <div 
                    onClick={() => onOpenLightbox(user.birthCertPhoto!, 'ভেরিফাইড জন্মনিবন্ধন সনদ', user.name)}
                    className="relative cursor-pointer group rounded-xl overflow-hidden aspect-square bg-slate-900 border border-slate-200"
                  >
                    <img src={user.birthCertPhoto} alt="Birth Cert" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all">
                      <Eye className="w-4 h-4 mr-1" /> বড় করে দেখুন
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg text-xs"
            >
              চালিয়ে যান (Continue)
            </button>
          </div>
        )}

        {/* STATUS: PENDING REVIEW */}
        {currentStatus === 'pending' && !isResubmitting && (
          <div className="py-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="text-sm font-black text-amber-900">
                ভেরিফিকেশন পর্যালোচনার জন্য জমা রয়েছে
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                আপনার ফেস ছবি ও জন্মনিবন্ধন সনদ অনার (Owner)-এর কাছে জমা হয়েছে। অনার ছবিগুলো যাচাই করে অনুমোদন দিলে আপনার অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে ফুল ভেরিফাইড হয়ে যাবে।
              </p>
            </div>

            {/* Preview of Pending Photos */}
            <div className="grid grid-cols-2 gap-3 text-left">
              {(faceImagePreview || user.facePhoto) && (
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>আপনার ফেস ছবি</span>
                    <span className="text-[10px] text-amber-600 font-bold">Pending</span>
                  </div>
                  <div 
                    onClick={() => onOpenLightbox(faceImagePreview || user.facePhoto!, 'জমা দেওয়া ফেস ছবি')}
                    className="relative cursor-pointer group rounded-xl overflow-hidden aspect-square bg-slate-900 border border-slate-200"
                  >
                    <img src={faceImagePreview || user.facePhoto} alt="Face" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-all">
                      <Eye className="w-4 h-4 mr-1" /> ফুল সাইজ
                    </div>
                  </div>
                </div>
              )}

              {(birthCertPreview || user.birthCertPhoto) && (
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>জন্মনিবন্ধন সনদ</span>
                    <span className="text-[10px] text-amber-600 font-bold">Pending</span>
                  </div>
                  <div 
                    onClick={() => onOpenLightbox(birthCertPreview || user.birthCertPhoto!, 'জমা দেওয়া জন্ম সনদ')}
                    className="relative cursor-pointer group rounded-xl overflow-hidden aspect-square bg-slate-900 border border-slate-200"
                  >
                    <img src={birthCertPreview || user.birthCertPhoto} alt="Birth Cert" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-all">
                      <Eye className="w-4 h-4 mr-1" /> ফুল সাইজ
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsResubmitting(true)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> নতুন ছবি আপলোড করুন
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md"
              >
                ঠিক আছে (Close)
              </button>
            </div>
          </div>
        )}

        {/* STATUS: REJECTED */}
        {currentStatus === 'rejected' && !isResubmitting && (
          <div className="py-4 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-red-900">
                ভেরিফিকেশন সাময়িকভাবে বাতিল করা হয়েছে
              </h4>
              <p className="text-xs text-red-700 font-bold">
                কারণ: {user.kycRejectionReason || 'ছবি পরিষ্কার নয় বা জন্ম সনদ মেলেনি। সঠিক ছবি দিয়ে আবার জমা দিন।'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsResubmitting(true)}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl text-xs shadow-xl flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> পুনরায় সঠিক ছবি জমা দিন
            </button>
          </div>
        )}

        {/* UPLOAD FORM (For Unsubmitted OR when user clicks Resubmit) */}
        {(currentStatus === 'unsubmitted' || isResubmitting) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 leading-relaxed font-medium">
              💡 <strong>নির্দেশনা:</strong> আপনার অ্যাকাউন্ট সুরক্ষিত করতে নিজের পরিষ্কার মুখের ছবি (Face Photo) এবং সরকারি ডিজিটাল জন্মনিবন্ধন সনদের ছবি আপলোড করুন। অনার (Owner) সরাসরি এই ছবিগুলো যাচাই করে অনুমোদন দেবেন।
            </div>

            {/* 1. Face Verification Photo */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>১. আপনার ফেস এর স্পষ্ট ছবি (Face Photo / Selfie) *</span>
                </label>
                {faceImagePreview && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> ছবি প্রস্তুত
                  </span>
                )}
              </div>

              {faceImagePreview ? (
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => onOpenLightbox(faceImagePreview, 'ফেস ভেরিফিকেশন ছবি প্রিভিউ')}
                    className="relative cursor-pointer group w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-blue-300 shrink-0"
                  >
                    <img src={faceImagePreview} alt="Face Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-slate-700 truncate">{faceFileName || 'Face Photo Captured'}</div>
                    <label className="inline-block px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl cursor-pointer text-xs font-bold transition-all">
                      <span>ছবি পরিবর্তন করুন</span>
                      <input type="file" accept="image/*" capture="user" onChange={handleFaceChange} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl bg-white hover:bg-blue-50/50 cursor-pointer transition-all">
                  <Camera className="w-7 h-7 text-blue-500 mb-1 animate-pulse" />
                  <span className="text-xs font-bold text-blue-700">ফেস ছবি তুলুন বা গ্যালারি থেকে দিন</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">ক্যামেরা দিয়ে সরাসরি সেলফি নিন অথবা গ্যালারি থেকে সিলেক্ট করুন</span>
                  <input type="file" accept="image/*" capture="user" onChange={handleFaceChange} className="hidden" />
                </label>
              )}
            </div>

            {/* 2. Birth Certificate Document Photo */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>২. ডিজিটাল জন্মনিবন্ধন সনদ এর ছবি (Birth Certificate) *</span>
                </label>
                {birthCertPreview && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> সনদ প্রস্তুত
                  </span>
                )}
              </div>

              {birthCertPreview ? (
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => onOpenLightbox(birthCertPreview, 'জন্মনিবন্ধন সনদ প্রিভিউ')}
                    className="relative cursor-pointer group w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-emerald-300 shrink-0"
                  >
                    <img src={birthCertPreview} alt="Birth Cert Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-bold text-slate-700 truncate">{birthCertFileName || 'Birth Certificate Document'}</div>
                    <label className="inline-block px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl cursor-pointer text-xs font-bold transition-all">
                      <span>সনদ পরিবর্তন করুন</span>
                      <input type="file" accept="image/*,.pdf" onChange={handleBirthCertChange} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl bg-white hover:bg-emerald-50/50 cursor-pointer transition-all">
                  <Upload className="w-7 h-7 text-emerald-500 mb-1" />
                  <span className="text-xs font-bold text-emerald-700">জন্মনিবন্ধন সনদের স্পষ্ট ছবি আপলোড করুন</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, বা WEBP ফাইল (পরিষ্কার দৃশ্যমান হতে হবে)</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleBirthCertChange} className="hidden" />
                </label>
              )}
            </div>

            {/* 3. Birth Certificate Number (Optional / Helper) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                জন্ম নিবন্ধন সনদ নম্বর (১৭ সংখ্যার নম্বর - ঐচ্ছিক)
              </label>
              <input
                type="text"
                maxLength={17}
                placeholder="যেমন: 20031234567890123"
                value={birthCertNumber}
                onChange={(e) => setBirthCertNumber(e.target.value)}
                className="w-full p-3 bg-blue-50/40 border border-blue-200 rounded-2xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !faceImagePreview || !birthCertPreview}
                className={`flex-1 py-3.5 text-white font-black rounded-2xl text-xs shadow-xl transition-all flex items-center justify-center gap-1.5 ${
                  isSubmitting || !faceImagePreview || !birthCertPreview
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transform hover:scale-[1.02]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>জমা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>অনার বরাবর জমা দিন (Submit KYC)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
