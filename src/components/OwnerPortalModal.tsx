import React, { useState } from 'react';
import { 
  X, Shield, ShieldCheck, Users, Wallet, CheckCircle2, XCircle, 
  Clock, Trash2, PlusCircle, Search, Eye, ZoomIn, DollarSign, ArrowUpRight, 
  ArrowDownLeft, FileText, Smartphone, AlertCircle, RefreshCw, 
  Send, Check, Camera, ScanFace, CreditCard, Settings, ChevronRight
} from 'lucide-react';
import { doc, updateDoc, deleteDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import confetti from 'canvas-confetti';

export interface KycSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userMobile?: string;
  facePhoto: string;
  birthCertPhoto: string;
  birthCertNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  referredBy?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userMobile?: string;
  amount: number;
  senderMobile: string;
  trxId: string;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  bkashNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface TaskProofSubmission {
  id: string;
  jobId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  proofText: string;
  reward: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  totalBalance: number;
  incomeBalance: number;
  referBalance: number;
  verified: boolean;
  kycStatus?: string;
  referralCode: string;
  referrals: number;
  referredBy?: string;
}

export interface PlatformSettings {
  ownerBkash: string;
  ownerNagad: string;
  ownerRocket: string;
  minWithdraw: number;
  referralBonus: number;
  noticeText: string;
}

interface OwnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  kycSubmissions: KycSubmission[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  taskProofs: TaskProofSubmission[];
  allUsers: PlatformUser[];
  jobs: any[];
  platformSettings: PlatformSettings;
  onUpdateSettings: (newSettings: PlatformSettings) => Promise<void>;
  onOpenLightbox: (imageUrl: string, title: string, subtitle?: string) => void;
  onRefreshData?: () => void;
}

export const OwnerPortalModal: React.FC<OwnerPortalModalProps> = ({
  isOpen,
  onClose,
  kycSubmissions,
  deposits,
  withdrawals,
  taskProofs,
  allUsers,
  jobs,
  platformSettings,
  onUpdateSettings,
  onOpenLightbox,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'kyc' | 'deposits' | 'withdrawals' | 'tasks' | 'users' | 'jobs' | 'settings'>('kyc');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; kycId: string; userId: string; reason: string }>({
    isOpen: false,
    kycId: '',
    userId: '',
    reason: ''
  });

  // Balance Adjuster Modal
  const [adjustBalanceModal, setAdjustBalanceModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    currentBalance: number;
    amount: number;
    mode: 'add' | 'deduct';
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    currentBalance: 0,
    amount: 100,
    mode: 'add'
  });

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(platformSettings);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCategory, setNewJobCategory] = useState('Micro Job');
  const [newJobReward, setNewJobReward] = useState<number>(15);
  const [newJobWorkers, setNewJobWorkers] = useState<number>(50);
  const [newJobReqs, setNewJobReqs] = useState('');
  const [newJobProof, setNewJobProof] = useState('');

  // Broadcast Message State
  const [broadcastText, setBroadcastText] = useState('');

  if (!isOpen) return null;

  // Pending counts
  const pendingKycCount = kycSubmissions.filter(k => k.status === 'pending').length;
  const pendingDepositCount = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawCount = withdrawals.filter(w => w.status === 'pending').length;
  const pendingTaskCount = taskProofs.filter(t => t.status === 'pending').length;

  // Filtered KYC
  const filteredKyc = kycSubmissions.filter(k => {
    if (kycFilter === 'all') return true;
    return k.status === kycFilter;
  });

  // Filtered Users
  const filteredUsers = allUsers.filter(u => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.toLowerCase().includes(q)) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(q))
    );
  });

  // Action: Approve KYC
  const handleApproveKyc = async (sub: KycSubmission) => {
    try {
      // 1. Update KYC submission
      await updateDoc(doc(db, 'kyc_verifications', sub.id), {
        status: 'approved',
        reviewedAt: new Date().toISOString()
      });

      // 2. Update user document
      await updateDoc(doc(db, 'users', sub.userId), {
        verified: true,
        kycStatus: 'approved'
      });

      // 3. If referred by someone, credit referral bonus
      if (sub.referredBy) {
        const referrer = allUsers.find(u => u.referralCode === sub.referredBy);
        if (referrer) {
          const bonus = platformSettings.referralBonus || 10;
          await updateDoc(doc(db, 'users', referrer.id), {
            referBalance: (referrer.referBalance || 0) + bonus,
            totalBalance: (referrer.totalBalance || 0) + bonus,
            referrals: (referrer.referrals || 0) + 1
          });
        }
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      alert(`KYC approved for ${sub.userName}! User is now fully verified.`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Error approving KYC:", err);
      alert("Error approving KYC.");
    }
  };

  // Action: Submit KYC Rejection
  const handleRejectKycSubmit = async () => {
    if (!rejectionModal.reason.trim()) {
      alert("দয়া করে বাতিলের কারণ লিখুন।");
      return;
    }
    try {
      await updateDoc(doc(db, 'kyc_verifications', rejectionModal.kycId), {
        status: 'rejected',
        rejectionReason: rejectionModal.reason.trim(),
        reviewedAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'users', rejectionModal.userId), {
        verified: false,
        kycStatus: 'rejected',
        kycRejectionReason: rejectionModal.reason.trim()
      });

      alert("KYC submission marked as rejected.");
      setRejectionModal({ isOpen: false, kycId: '', userId: '', reason: '' });
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Error rejecting KYC:", err);
      alert("Error rejecting KYC.");
    }
  };

  // Action: Approve Deposit
  const handleApproveDeposit = async (dep: DepositRequest) => {
    try {
      await updateDoc(doc(db, 'deposits', dep.id), {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });

      // Credit user's balance
      const targetUser = allUsers.find(u => u.id === dep.userId);
      if (targetUser) {
        await updateDoc(doc(db, 'users', dep.userId), {
          totalBalance: (targetUser.totalBalance || 0) + dep.amount,
          incomeBalance: (targetUser.incomeBalance || 0) + dep.amount
        });
      }

      confetti({ particleCount: 80, spread: 60 });
      alert(`Deposit of ৳${dep.amount} approved! Added to ${dep.userName}'s totalBalance.`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Error approving deposit:", err);
      alert("Error approving deposit.");
    }
  };

  // Action: Reject Deposit
  const handleRejectDeposit = async (dep: DepositRequest) => {
    if (!confirm(`Reject deposit request from ${dep.userName} (${dep.trxId})?`)) return;
    try {
      await updateDoc(doc(db, 'deposits', dep.id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      });
      alert("Deposit request rejected.");
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Approve Withdrawal (Paid)
  const handleApproveWithdrawal = async (w: WithdrawalRequest) => {
    try {
      await updateDoc(doc(db, 'withdrawals', w.id), {
        status: 'approved',
        paidAt: new Date().toISOString()
      });
      confetti({ particleCount: 70, spread: 60 });
      alert(`Withdrawal of ৳${w.amount} to bKash (${w.bkashNumber}) confirmed as paid!`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Reject & Refund Withdrawal
  const handleRejectWithdrawal = async (w: WithdrawalRequest) => {
    if (!confirm(`Reject and refund ৳${w.amount} to ${w.userName}?`)) return;
    try {
      await updateDoc(doc(db, 'withdrawals', w.id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      });

      // Refund to user
      const targetUser = allUsers.find(u => u.id === w.userId);
      if (targetUser) {
        await updateDoc(doc(db, 'users', w.userId), {
          totalBalance: (targetUser.totalBalance || 0) + w.amount
        });
      }
      alert(`Withdrawal rejected and ৳${w.amount} refunded to user.`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Approve Task Proof
  const handleApproveTaskProof = async (proof: TaskProofSubmission) => {
    try {
      await updateDoc(doc(db, 'submissions', proof.id), {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });

      const worker = allUsers.find(u => u.id === proof.workerId);
      if (worker) {
        await updateDoc(doc(db, 'users', proof.workerId), {
          totalBalance: (worker.totalBalance || 0) + proof.reward,
          incomeBalance: (worker.incomeBalance || 0) + proof.reward
        });
      }
      confetti({ particleCount: 60, spread: 50 });
      alert(`Task proof approved! ৳${proof.reward} rewarded to ${proof.workerName}.`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Reject Task Proof
  const handleRejectTaskProof = async (proof: TaskProofSubmission) => {
    if (!confirm(`Reject task proof from ${proof.workerName}?`)) return;
    try {
      await updateDoc(doc(db, 'submissions', proof.id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      });
      alert("Task proof rejected.");
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Balance Adjustment
  const handleBalanceAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { userId, amount, mode, currentBalance } = adjustBalanceModal;
    const diff = mode === 'add' ? amount : -amount;
    const newBal = Math.max(0, currentBalance + diff);

    try {
      await updateDoc(doc(db, 'users', userId), {
        totalBalance: newBal
      });
      alert(`Balance updated for user! New totalBalance: ৳${newBal.toFixed(2)}`);
      setAdjustBalanceModal({ isOpen: false, userId: '', userName: '', currentBalance: 0, amount: 100, mode: 'add' });
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
      alert("Error adjusting balance.");
    }
  };

  // Action: Post New Job as Owner
  const handlePostJobOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    try {
      const jobData = {
        title: newJobTitle.trim(),
        category: newJobCategory,
        reward: Number(newJobReward),
        completed: 0,
        total: Number(newJobWorkers),
        employer: 'WORK GROVE OFFICIAL',
        requirements: newJobReqs ? newJobReqs.split(',').map(s => s.trim()) : ['Complete assigned micro task'],
        proofInstruction: newJobProof.trim() || 'Provide proof username or screenshot.',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'jobs'), jobData);
      confetti({ particleCount: 80, spread: 70 });
      alert("New job posted successfully to live platform!");
      setNewJobTitle('');
      setNewJobReqs('');
      setNewJobProof('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
      alert("Error posting job.");
    }
  };

  // Action: Save Platform Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateSettings(settingsForm);
      confetti({ particleCount: 60, spread: 50 });
      alert("Platform settings updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating platform settings.");
    }
  };

  // Action: Send Broadcast Notice
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        sender: 'WORK GROVE OFFICIAL (অনার)',
        content: broadcastText.trim(),
        time: 'Just now',
        unread: true,
        type: 'announcement',
        createdAt: new Date().toISOString()
      });
      confetti({ particleCount: 70, spread: 60 });
      alert("Official broadcast message sent to all users!");
      setBroadcastText('');
    } catch (err) {
      console.error(err);
      alert("Error sending broadcast.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-emerald-300 space-y-4 max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 text-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  WORK GROVE অনার কন্ট্রোল সেন্টার
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                  Owner Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                সব সিস্টেম এবং ফেস ও জন্ম সনদের ছবি হ্যান্ডেল করার পূর্ণ অ্যাক্সেস
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="Close Owner Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="bg-blue-50/80 p-2.5 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-blue-800 uppercase">মোট ইউজার</div>
              <div className="text-lg font-black text-blue-700">{allUsers.length}</div>
            </div>
            <Users className="w-6 h-6 text-blue-400" />
          </div>

          <div className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${pendingKycCount > 0 ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <div className="text-[10px] font-black text-amber-800 uppercase">পেন্ডিং ফেস ও জন্ম সনদ</div>
              <div className="text-lg font-black text-amber-600">{pendingKycCount}</div>
            </div>
            <ScanFace className="w-6 h-6 text-amber-500" />
          </div>

          <div className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${pendingDepositCount > 0 ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <div className="text-[10px] font-black text-emerald-800 uppercase">পেন্ডিং ডিপোজিট</div>
              <div className="text-lg font-black text-emerald-600">{pendingDepositCount}</div>
            </div>
            <ArrowDownLeft className="w-6 h-6 text-emerald-500" />
          </div>

          <div className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${pendingWithdrawCount > 0 ? 'bg-pink-50 border-pink-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
            <div>
              <div className="text-[10px] font-black text-pink-800 uppercase">পেন্ডিং উইথড্র</div>
              <div className="text-lg font-black text-pink-600">{pendingWithdrawCount}</div>
            </div>
            <Wallet className="w-6 h-6 text-pink-500" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 border-b border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'kyc'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            <span>ফেস ও জন্ম সনদ ({kycSubmissions.length})</span>
            {pendingKycCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
                {pendingKycCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'deposits'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>ডিপোজিট ({deposits.length})</span>
            {pendingDepositCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-black flex items-center justify-center">
                {pendingDepositCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'withdrawals'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>উইথড্রয়াল ({withdrawals.length})</span>
            {pendingWithdrawCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-pink-400 text-white text-[10px] font-black flex items-center justify-center">
                {pendingWithdrawCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>টাস্ক প্রুফ ({taskProofs.length})</span>
            {pendingTaskCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-400 text-white text-[10px] font-black flex items-center justify-center">
                {pendingTaskCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ইউজার ও ব্যালেন্স</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'jobs'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>কাজের তালিকা ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>সিস্টেম সেটিংস</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">

          {/* TAB 1: KYC VERIFICATION (FACE & BIRTH CERTIFICATE PHOTOS) */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/60 p-3 rounded-2xl border border-blue-200">
                <div>
                  <h4 className="text-sm font-black text-blue-900">
                    ফেস ভেরিফিকেশন ও জন্মনিবন্ধন সনদ যাচাইকরণ
                  </h4>
                  <p className="text-xs text-blue-700 font-medium">
                    ব্যবহারকারীদের ফেস ছবি ও জন্ম সনদের ছবি দেখে অ্যাপ্রুভ বা রিজেক্ট করুন
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setKycFilter(f)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black capitalize transition-all ${
                        kycFilter === f
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-blue-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {filteredKyc.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  কোনো ফেস বা জন্ম সনদের ভেরিফিকেশন আবেদন পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredKyc.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 transition-all"
                    >
                      {/* Top Info */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 text-sm">{item.userName}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                              item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              item.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {item.userMobile || item.userEmail} • জমা: {new Date(item.submittedAt).toLocaleDateString('en-GB')}
                          </div>
                          {item.birthCertNumber && (
                            <div className="text-[11px] font-mono font-bold text-slate-700 mt-0.5">
                              জন্ম সনদ নং: <span className="text-blue-700">{item.birthCertNumber}</span>
                            </div>
                          )}
                          {item.rejectionReason && (
                            <div className="text-xs text-red-600 font-bold mt-1">
                              বাতিলের কারণ: {item.rejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons for Pending */}
                        {item.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setRejectionModal({ isOpen: true, kycId: item.id, userId: item.userId, reason: '' })}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                            >
                              <X className="w-3.5 h-3.5" /> রিজেক্ট করুন
                            </button>
                            <button
                              onClick={() => handleApproveKyc(item)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
                            >
                              <Check className="w-3.5 h-3.5" /> ✅ অ্যাপ্রুভ করুন
                            </button>
                          </div>
                        )}
                      </div>

                      {/* TWO PHOTO CARDS: Face Photo & Birth Certificate Photo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* 1. Face Photo */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5 text-blue-600" />
                              ফেস ভেরিফিকেশন ছবি (Face Photo)
                            </span>
                            <button
                              onClick={() => onOpenLightbox(item.facePhoto, `${item.userName} - ফেস ভেরিফিকেশন ছবি`, item.userMobile || item.userEmail)}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> বড় করে দেখুন
                            </button>
                          </div>

                          <div 
                            onClick={() => onOpenLightbox(item.facePhoto, `${item.userName} - ফেস ভেরিফিকেশন ছবি`, item.userMobile || item.userEmail)}
                            className="relative cursor-pointer group h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-300"
                          >
                            <img 
                              src={item.facePhoto} 
                              alt="Face Document" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all">
                              <ZoomIn className="w-5 h-5 mr-1" /> ফুল সাইজ দেখুন
                            </div>
                          </div>
                        </div>

                        {/* 2. Birth Certificate Document */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              জন্মনিবন্ধন সনদ (Birth Certificate)
                            </span>
                            <button
                              onClick={() => onOpenLightbox(item.birthCertPhoto, `${item.userName} - জন্মনিবন্ধন সনদ`, item.userMobile || item.userEmail)}
                              className="text-[11px] text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> বড় করে দেখুন
                            </button>
                          </div>

                          <div 
                            onClick={() => onOpenLightbox(item.birthCertPhoto, `${item.userName} - জন্মনিবন্ধন সনদ`, item.userMobile || item.userEmail)}
                            className="relative cursor-pointer group h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-300"
                          >
                            <img 
                              src={item.birthCertPhoto} 
                              alt="Birth Certificate" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all">
                              <ZoomIn className="w-5 h-5 mr-1" /> ফুল সাইজ দেখুন
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEPOSITS MANAGEMENT */}
          {activeTab === 'deposits' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                💡 ব্যবহারকারীদের TrxID যাচাই করে "অ্যাপ্রুভ" বাটনে ক্লিক করলে স্বয়ংক্রিয়ভাবে ব্যবহারকারীর অ্যাকাউন্টে ব্যালেন্স যোগ হবে।
              </div>

              {deposits.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  কোনো ডিপোজিট রিকোয়েস্ট নেই।
                </div>
              ) : (
                <div className="space-y-2.5">
                  {deposits.map(d => (
                    <div key={d.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 text-sm">{d.userName}</span>
                          <span className="text-xs font-bold text-slate-500">({d.method})</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                            d.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            d.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          প্রেরক নম্বর: <span className="font-mono font-bold text-slate-800">{d.senderMobile}</span> • TrxID: <span className="font-mono font-bold text-blue-700">{d.trxId}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          সময়: {new Date(d.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-base font-black text-emerald-600">৳{d.amount.toFixed(2)}</div>
                        </div>

                        {d.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleRejectDeposit(d)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all"
                              title="Reject Deposit"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproveDeposit(d)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" /> অ্যাপ্রুভ
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WITHDRAWALS MANAGEMENT */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-3">
              <div className="p-3 bg-pink-50 rounded-2xl border border-pink-200 text-xs text-pink-900 font-medium">
                💡 উইথড্রয়াল তালিকায় ব্যবহারকারীর bKash নম্বর দেখতে পাবেন। টাকা পাঠিয়ে "টাকা পাঠানো হয়েছে" ক্লিক করুন।
              </div>

              {withdrawals.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  কোনো উইথড্রয়াল রিকোয়েস্ট নেই।
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawals.map(w => (
                    <div key={w.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 text-sm">{w.userName}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                            w.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            w.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {w.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          bKash নম্বর: <span className="font-mono font-black text-pink-700">{w.bkashNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          তারিখ: {new Date(w.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-base font-black text-red-600">৳{w.amount.toFixed(2)}</div>
                        </div>

                        {w.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleRejectWithdrawal(w)}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl transition-all"
                            >
                              বাতিল ও রিফান্ড
                            </button>
                            <button
                              onClick={() => handleApproveWithdrawal(w)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" /> টাকা পাঠানো হয়েছে
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TASK PROOFS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {taskProofs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  কোনো কাজের প্রুফ সাবমিশন নেই।
                </div>
              ) : (
                <div className="space-y-2.5">
                  {taskProofs.map(t => (
                    <div key={t.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-black text-slate-800 text-sm">{t.jobTitle}</h5>
                          <p className="text-xs text-slate-500 font-bold">কর্মী: {t.workerName} • রিওয়ার্ড: ৳{t.reward}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                          t.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono">
                        {t.proofText}
                      </div>

                      {t.status === 'pending' && (
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleRejectTaskProof(t)}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl"
                          >
                            বাতিল
                          </button>
                          <button
                            onClick={() => handleApproveTaskProof(t)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow"
                          >
                            কাজ সঠিক (অনুমোদন)
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: USERS & BALANCES */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="নাম, মোবাইল, ইমেইল বা রেফার কোড দিয়ে ইউজার খুঁজুন..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                {filteredUsers.map(u => (
                  <div key={u.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 text-sm">{u.name}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${u.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {u.verified ? 'Verified (KYC)' : 'Unverified'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {u.mobile || u.email} • কোড: <span className="font-mono font-bold text-emerald-600">{u.referralCode}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold">ব্যালেন্স</div>
                        <div className="text-base font-black text-blue-700">৳{(u.totalBalance || 0).toFixed(2)}</div>
                      </div>

                      <button
                        onClick={() => setAdjustBalanceModal({
                          isOpen: true,
                          userId: u.id,
                          userName: u.name,
                          currentBalance: u.totalBalance || 0,
                          amount: 100,
                          mode: 'add'
                        })}
                        className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> ব্যালেন্স পরিবর্তন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: JOBS MANAGER */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {/* Form to Post New Job as Owner */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-teal-900 uppercase flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-teal-600" />
                  নতুন কাজ যোগ করুন (Post New Job)
                </h4>

                <form onSubmit={handlePostJobOwner} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="কাজের শিরোনাম (যেমন: YouTube Subscribe Task)"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-teal-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={newJobCategory}
                      onChange={(e) => setNewJobCategory(e.target.value)}
                      className="p-2.5 bg-white border border-teal-200 rounded-xl text-xs font-bold"
                    >
                      <option value="Micro Job">Micro Job</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Special Work">Special Work</option>
                    </select>

                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="রিওয়ার্ড (৳)"
                      value={newJobReward}
                      onChange={(e) => setNewJobReward(Number(e.target.value))}
                      className="p-2.5 bg-white border border-teal-200 rounded-xl text-xs font-bold"
                    />

                    <input
                      type="number"
                      required
                      min={5}
                      placeholder="কর্মী সংখ্যা"
                      value={newJobWorkers}
                      onChange={(e) => setNewJobWorkers(Number(e.target.value))}
                      className="p-2.5 bg-white border border-teal-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="শর্তসমূহ (কমা দিয়ে আলাদা করুন)"
                      value={newJobReqs}
                      onChange={(e) => setNewJobReqs(e.target.value)}
                      className="p-2.5 bg-white border border-teal-200 rounded-xl text-xs font-medium"
                    />
                    <input
                      type="text"
                      placeholder="প্রুফ সাবমিট করার নির্দেশনা"
                      value={newJobProof}
                      onChange={(e) => setNewJobProof(e.target.value)}
                      className="p-2.5 bg-white border border-teal-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow"
                  >
                    + কাজ পোস্ট করুন
                  </button>
                </form>
              </div>

              {/* Current Jobs List */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase">বর্তমানে সক্রিয় কাজসমূহ ({jobs.length})</h5>
                {jobs.map(j => (
                  <div key={j.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                    <div>
                      <div className="font-bold text-xs text-slate-800">{j.title}</div>
                      <span className="text-[11px] text-emerald-600 font-bold">৳{j.reward} • {j.category} • কর্মী: {j.completed || 0}/{j.total || 100}</span>
                    </div>

                    <button
                      onClick={async () => {
                        if (confirm(`Delete job: "${j.title}"?`)) {
                          try {
                            await deleteDoc(doc(db, 'jobs', j.id));
                            alert('Job deleted.');
                            if (onRefreshData) onRefreshData();
                          } catch (e) {
                            console.error(e);
                          }
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM SETTINGS & BROADCAST */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Payment & Settings Form */}
              <form onSubmit={handleSaveSettings} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  পেমেন্ট গেটওয়ে ও প্ল্যাটফর্ম সেটিংস
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">অনারের অফিশিয়াল bKash নম্বর</label>
                    <input
                      type="text"
                      value={settingsForm.ownerBkash}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ownerBkash: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">অনারের Nagad নম্বর</label>
                    <input
                      type="text"
                      value={settingsForm.ownerNagad}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ownerNagad: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">অনারের Rocket নম্বর</label>
                    <input
                      type="text"
                      value={settingsForm.ownerRocket}
                      onChange={(e) => setSettingsForm({ ...settingsForm, ownerRocket: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">সর্বনিম্ন উইথড্র সীমা (৳)</label>
                    <input
                      type="number"
                      value={settingsForm.minWithdraw}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minWithdraw: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">রেফারেল বোনাস per KYC (৳)</label>
                    <input
                      type="number"
                      value={settingsForm.referralBonus}
                      onChange={(e) => setSettingsForm({ ...settingsForm, referralBonus: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">হোম পেজের অফিশিয়াল নোটিশ ব্যানার</label>
                  <input
                    type="text"
                    value={settingsForm.noticeText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, noticeText: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow"
                >
                  সেটিংস সংরক্ষণ করুন (Save Settings)
                </button>
              </form>

              {/* Broadcast Notice Form */}
              <form onSubmit={handleSendBroadcast} className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
                <h4 className="text-xs font-black text-blue-900 uppercase flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-blue-600" />
                  সকল ব্যবহারকারীদের নোটিশ পাঠান (Broadcast Message)
                </h4>

                <textarea
                  required
                  rows={2}
                  placeholder="অফিসিয়াল নোটিশ বা বার্তা লিখুন (যা সবার Messages ট্যাবে যাবে)..."
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow"
                >
                  নোটিশ প্রচার করুন (Broadcast Now)
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-bold">
            WORK GROVE Owner Management System v2.6
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-900 transition-all"
          >
            বন্ধ করুন (Close Portal)
          </button>
        </div>

      </div>

      {/* MODAL: KYC REJECTION REASON */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 border border-red-200">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              ভেরিফিকেশন বাতিলের কারণ লিখুন
            </h4>
            <textarea
              rows={3}
              required
              placeholder="যেমন: ছবি ঝাপসা ছিল, অনুগ্রহ করে পরিষ্কার ছবি দিয়ে পুনরায় আপলোড করুন।"
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            ></textarea>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejectionModal({ isOpen: false, kycId: '', userId: '', reason: '' })}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectKycSubmit}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST USER BALANCE */}
      {adjustBalanceModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 border border-blue-200">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              ব্যালেন্স সমন্বয়: {adjustBalanceModal.userName}
            </h4>
            <div className="text-xs text-slate-600">
              বর্তমান ব্যালেন্স: <span className="font-bold text-blue-700">৳{adjustBalanceModal.currentBalance.toFixed(2)}</span>
            </div>

            <form onSubmit={handleBalanceAdjustSubmit} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustBalanceModal({ ...adjustBalanceModal, mode: 'add' })}
                  className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${
                    adjustBalanceModal.mode === 'add'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  + টাকা যোগ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustBalanceModal({ ...adjustBalanceModal, mode: 'deduct' })}
                  className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${
                    adjustBalanceModal.mode === 'deduct'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  - টাকা কাটুন
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustBalanceModal.amount}
                  onChange={(e) => setAdjustBalanceModal({ ...adjustBalanceModal, amount: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustBalanceModal({ isOpen: false, userId: '', userName: '', currentBalance: 0, amount: 100, mode: 'add' })}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
