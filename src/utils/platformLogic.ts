/**
 * Core business and platform logic for WORK GROVE
 * Supports owner actions, KYC verification rules, and financial transaction helpers.
 */

export interface KycValidationInput {
  facePhoto: string;
  birthCertPhoto: string;
  birthCertNumber: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates Birth Certificate Number:
 * Bangladesh Digital Birth Registration Certificate (জন্মনিবন্ধন সনদ নম্বর)
 * is typically 17 numeric digits (YYYY + District + Upazila/Ward + Sequential).
 * Also permits 10 to 17 digits with clean formatting.
 */
export function validateBirthCertNumber(certNo: string): ValidationResult {
  if (!certNo || !certNo.trim()) {
    return { isValid: false, error: 'জন্মনিবন্ধন সনদ নম্বর দিন।' };
  }
  const clean = certNo.replace(/[\s-]/g, '');
  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'জন্মনিবন্ধন সনদ নম্বরে শুধুমাত্র ইংরেজি সংখ্যা লিখুন।' };
  }
  if (clean.length < 10 || clean.length > 17) {
    return { isValid: false, error: 'ডিজিটাল জন্মনিবন্ধন সনদ নম্বর সাধারণত ১৭ সংখ্যার হয় (কমপক্ষে ১০ সংখ্যা)।' };
  }
  return { isValid: true };
}

/**
 * Validates full KYC submission (Face Photo + Birth Certificate Photo + Birth Cert Number)
 * Strictly verifies no reliance on NID.
 */
export function validateKycSubmission(input: KycValidationInput): ValidationResult {
  if (!input.facePhoto || !input.facePhoto.startsWith('data:image/')) {
    return { isValid: false, error: 'ফেস ভেরিফিকেশনের জন্য পরিষ্কার মুখের ছবি বা সেলফি তুলুন।' };
  }
  if (!input.birthCertPhoto || !input.birthCertPhoto.startsWith('data:image/')) {
    return { isValid: false, error: 'জন্মনিবন্ধন সনদের স্পষ্ট রঙিন ছবি আপলোড করুন।' };
  }
  return validateBirthCertNumber(input.birthCertNumber);
}

/**
 * Calculates new balance after deposit approval
 */
export function applyDepositApproval(currentTotal: number, depositAmount: number): number {
  if (depositAmount <= 0) return currentTotal;
  return Number((currentTotal + depositAmount).toFixed(2));
}

/**
 * Calculates refund when a withdrawal is rejected
 */
export function applyWithdrawalRejectionRefund(
  currentTotal: number, 
  currentPending: number, 
  withdrawAmount: number
): { totalBalance: number; pendingBalance: number } {
  return {
    totalBalance: Number((currentTotal + withdrawAmount).toFixed(2)),
    pendingBalance: Math.max(0, Number((currentPending - withdrawAmount).toFixed(2)))
  };
}

/**
 * Award referral bonus (e.g. ৳10 BDT) to referrer upon successful KYC approval
 */
export function calculateReferralBonus(referrerBalance: number, bonusAmount: number = 10): {
  newReferBalance: number;
  newTotalBalance: number;
} {
  return {
    newReferBalance: Number((referrerBalance + bonusAmount).toFixed(2)),
    newTotalBalance: Number((referrerBalance + bonusAmount).toFixed(2))
  };
}

/**
 * Detect duplicate microjob proof submissions
 */
export function isDuplicateSubmission(
  existingSubmissions: Array<{ jobId: string; proofText: string }>,
  newJobId: string,
  newProofText: string
): boolean {
  const normalizedNewProof = newProofText.trim().toLowerCase();
  return existingSubmissions.some(
    sub => sub.jobId === newJobId || 
    (sub.proofText && sub.proofText.trim().toLowerCase() === normalizedNewProof)
  );
}
