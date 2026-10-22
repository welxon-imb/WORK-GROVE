import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateBirthCertNumber,
  validateKycSubmission,
  applyDepositApproval,
  applyWithdrawalRejectionRefund,
  calculateReferralBonus,
  isDuplicateSubmission
} from './platformLogic.js';

describe('Birth Certificate Number Validation', () => {
  it('rejects empty input', () => {
    const res = validateBirthCertNumber('');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /সনদ নম্বর/);
  });

  it('rejects non-numeric characters', () => {
    const res = validateBirthCertNumber('20011234ABC998811');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /সংখ্যা/);
  });

  it('rejects too short number', () => {
    const res = validateBirthCertNumber('123456');
    assert.strictEqual(res.isValid, false);
  });

  it('accepts valid 17-digit digital birth certificate number', () => {
    const res = validateBirthCertNumber('20011925345001234');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.error, undefined);
  });

  it('accepts formatted birth certificate with spaces and dashes', () => {
    const res = validateBirthCertNumber('2001-1925345-001234');
    assert.strictEqual(res.isValid, true);
  });
});

describe('KYC Submission Validation', () => {
  it('rejects when face photo is missing', () => {
    const res = validateKycSubmission({
      facePhoto: '',
      birthCertPhoto: 'data:image/jpeg;base64,sample',
      birthCertNumber: '20011925345001234'
    });
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /ফেস ভেরিফিকেশন/);
  });

  it('rejects when birth certificate photo is missing', () => {
    const res = validateKycSubmission({
      facePhoto: 'data:image/jpeg;base64,face',
      birthCertPhoto: '',
      birthCertNumber: '20011925345001234'
    });
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /জন্মনিবন্ধন সনদের/);
  });

  it('approves complete submission with face and birth certificate photos and valid number', () => {
    const res = validateKycSubmission({
      facePhoto: 'data:image/jpeg;base64,face123',
      birthCertPhoto: 'data:image/png;base64,cert456',
      birthCertNumber: '20021925345001234'
    });
    assert.strictEqual(res.isValid, true);
  });
});

describe('Owner Financial Balance Adjustments', () => {
  it('correctly credits user balance on deposit approval', () => {
    const newBal = applyDepositApproval(250.50, 500);
    assert.strictEqual(newBal, 750.50);
  });

  it('handles zero or negative deposit safely', () => {
    const newBal = applyDepositApproval(100, 0);
    assert.strictEqual(newBal, 100);
  });

  it('refunds user balance and decreases pending balance when withdrawal is rejected', () => {
    const result = applyWithdrawalRejectionRefund(150.00, 200.00, 200.00);
    assert.strictEqual(result.totalBalance, 350.00);
    assert.strictEqual(result.pendingBalance, 0);
  });

  it('awards referral bonus correctly', () => {
    const bonus = calculateReferralBonus(50, 10);
    assert.strictEqual(bonus.newReferBalance, 60);
    assert.strictEqual(bonus.newTotalBalance, 60);
  });
});

describe('Duplicate Submission Detector', () => {
  const existing = [
    { jobId: 'job-101', proofText: 'Channel subscribed with account @walid' }
  ];

  it('detects duplicate job submission', () => {
    const isDup = isDuplicateSubmission(existing, 'job-101', 'different text');
    assert.strictEqual(isDup, true);
  });

  it('detects duplicate proof text across jobs', () => {
    const isDup = isDuplicateSubmission(existing, 'job-202', 'channel Subscribed with account @walid');
    assert.strictEqual(isDup, true);
  });

  it('allows fresh job with unique proof', () => {
    const isDup = isDuplicateSubmission(existing, 'job-303', 'Fresh unique screenshot proof');
    assert.strictEqual(isDup, false);
  });
});
