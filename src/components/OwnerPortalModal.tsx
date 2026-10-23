import React, { useState } from 'react';
import { 
  X, Shield, ShieldCheck, Users, Wallet, CheckCircle2, XCircle, 
  Clock, Trash2, PlusCircle, Search, Eye, EyeOff, ZoomIn, DollarSign, ArrowUpRight, 
  ArrowDownLeft, FileText, Smartphone, AlertCircle, RefreshCw, 
  Send, Check, Camera, ScanFace, CreditCard, Settings, ChevronRight,
  KeyRound, Building2, Award, Sparkles, Copy
} from 'lucide-react';
import { doc, updateDoc, deleteDoc, addDoc, collection, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import confetti from 'canvas-confetti';
import { calculateUserRank } from '../utils/userLevelUtils';

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
  username?: string;
  email: string;
  mobile: string;
  passwordHint?: string;
  totalBalance: number;
  incomeBalance: number;
  referBalance: number;
  verified: boolean;
  kycStatus?: string;
  referralCode: string;
  referrals: number;
  referredBy?: string;
  xp?: number;
  isCompanyStaff?: boolean;
}

export interface PlatformSettings {
  ownerBkash: string;
  ownerNagad: string;
  ownerRocket: string;
  minWithdraw: number;
  referralBonus: number;
  noticeText: string;
  gmailRate: number;
  specialWorkInfo: string;
  companyRevenue?: number;
}

interface OwnerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'tasks' | 'users' | 'jobs' | 'settings'>('deposits');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [isClearingKyc, setIsClearingKyc] = useState(false);
  
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
  const [newJobThumbnail, setNewJobThumbnail] = useState('');
  const [newJobLink, setNewJobLink] = useState('');
  const [newJobType, setNewJobType] = useState<'screenshot' | 'video' | 'link' | 'social'>('screenshot');
  const [newJobDuration, setNewJobDuration] = useState<number>(15);

  // Broadcast Message State
  const [broadcastText, setBroadcastText] = useState('');
  
  // Track hidden passwords (admin can toggle) - Default to visible!
  const [hiddenPasswords, setHiddenPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setHiddenPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleToggleStaff = async (u: PlatformUser) => {
    try {
      const nextStaffStatus = !u.isCompanyStaff;
      await updateDoc(doc(db, 'users', u.id), {
        isCompanyStaff: nextStaffStatus
      });
      alert(`${u.name}-কে কোম্পানি অফিসিয়াল স্টাফ ${nextStaffStatus ? 'হিসেবে নিযুক্ত করা হয়েছে' : 'থেকে প্রত্যাহার করা হয়েছে'}।`);
    } catch(err) {
      console.error(err);
      alert('কোম্পানি স্টাফ স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।');
    }
  };

  const handleClearKycData = async () => {
    if (!confirm('Are you sure? This will delete all KYC verification records and reset user KYC statuses. This action cannot be undone.')) return;
    setIsClearingKyc(true);
    try {
      const kycSnap = await getDocs(collection(db, 'kyc_verifications'));
      const batch = writeBatch(db);
      kycSnap.docs.forEach(d => batch.delete(d.ref));
      
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.docs.forEach(d => {
        batch.update(d.ref, {
          kycStatus: 'unsubmitted',
          facePhoto: '',
          birthCertPhoto: '',
          birthCertNumber: '',
          verified: true // Keep them verified as per request
        });
      });
      
      await batch.commit();
      alert('KYC Data cleared successfully! All users are now auto-verified.');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
      alert('Error clearing KYC data.');
    } finally {
      setIsClearingKyc(false);
    }
  };

  if (!isOpen) return null;

  // Pending counts
  const pendingDepositCount = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawCount = withdrawals.filter(w => w.status === 'pending').length;
  const pendingTaskCount = taskProofs.filter(t => t.status === 'pending').length;

  // Filtered Users
  const filteredUsers = allUsers.filter(u => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.toLowerCase().includes(q)) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(q))
    );
  });

  // Action: Approve Deposit
  const handleApproveDeposit = async (dep: DepositRequest) => {
    try {
      await updateDoc(doc(db, 'deposits', dep.id), {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });
      const targetUser = allUsers.find(u => u.id === dep.userId);
      if (targetUser) {
        await updateDoc(doc(db, 'users', dep.userId), {
          totalBalance: (targetUser.totalBalance || 0) + dep.amount,
          incomeBalance: (targetUser.incomeBalance || 0) + dep.amount
        });
      }
      confetti({ particleCount: 80, spread: 60 });
      alert(`Deposit of ৳${dep.amount} approved!`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
      alert("Error approving deposit.");
    }
  };

  // Action: Reject Deposit
  const handleRejectDeposit = async (dep: DepositRequest) => {
    if (!confirm(`Reject deposit request from ${dep.userName}?`)) return;
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

  // Action: Approve Withdrawal
  const handleApproveWithdrawal = async (w: WithdrawalRequest) => {
    try {
      await updateDoc(doc(db, 'withdrawals', w.id), {
        status: 'approved',
        paidAt: new Date().toISOString()
      });
      confetti({ particleCount: 70, spread: 60 });
      alert(`Withdrawal of ৳${w.amount} confirmed!`);
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
      const targetUser = allUsers.find(u => u.id === w.userId);
      if (targetUser) {
        await updateDoc(doc(db, 'users', w.userId), {
          totalBalance: (targetUser.totalBalance || 0) + w.amount
        });
      }
      alert(`Withdrawal rejected and ৳${w.amount} refunded.`);
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
      alert(`Task proof approved! ৳${proof.reward} rewarded.`);
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
      await updateDoc(doc(db, 'users', userId), { totalBalance: newBal });
      alert(`Balance updated! New balance: ৳${newBal.toFixed(2)}`);
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
        employer: 'Work Grove Official',
        requirements: newJobReqs ? newJobReqs.split(',').map(s => s.trim()) : ['Complete assigned micro task'],
        proofInstruction: newJobProof.trim() || 'Provide proof username or screenshot.',
        status: 'active',
        isCompanyTask: true,
        thumbnail: newJobThumbnail.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
        taskType: newJobType,
        targetLink: newJobLink.trim(),
        durationMinutes: newJobDuration,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'jobs'), jobData);
      confetti({ particleCount: 80, spread: 70 });
      alert("New job posted successfully!");
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
      alert("Settings updated!");
    } catch (err) {
      console.error(err);
      alert("Error updating settings.");
    }
  };

  // Action: Send Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        sender: 'WORK GROVE OFFICIAL',
        content: broadcastText.trim(),
        time: 'Just now',
        unread: true,
        type: 'announcement',
        createdAt: new Date().toISOString()
      });
      confetti({ particleCount: 70, spread: 60 });
      alert("Broadcast sent!");
      setBroadcastText('');
    } catch (err) {
      console.error(err);
      alert("Error sending broadcast.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-emerald-300 space-y-4 max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 text-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">WORK GROVE অনার কন্ট্রোল সেন্টার</h3>
              <p className="text-xs text-slate-500 font-semibold">সব সিস্টেম হ্যান্ডেল করার পূর্ণ অ্যাক্সেস</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
          <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
            <div className="text-[10px] font-black text-blue-800 uppercase">মোট ইউজার</div>
            <div className="text-lg font-black text-blue-700">{allUsers.length}</div>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
            <div className="text-[10px] font-black text-emerald-800 uppercase">পেন্ডিং ডিপোজিট</div>
            <div className="text-lg font-black text-emerald-600">{pendingDepositCount}</div>
          </div>
          <div className="bg-pink-50 p-2.5 rounded-2xl border border-pink-100">
            <div className="text-[10px] font-black text-pink-800 uppercase">পেন্ডিং উইথড্র</div>
            <div className="text-lg font-black text-pink-600">{pendingWithdrawCount}</div>
          </div>
        </div>

        {/* Tabs Nav */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 border-b border-slate-100 scrollbar-none">
          {(['deposits', 'withdrawals', 'tasks', 'users', 'jobs', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-black capitalize transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* Deposits */}
          {activeTab === 'deposits' && (
            <div className="space-y-3">
              {deposits.length === 0 ? <p className="text-center py-10 text-slate-400 font-bold">No deposits found.</p> : deposits.map(d => (
                <div key={d.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-black text-sm">{d.userName} - ৳{d.amount}</div>
                    <div className="text-[10px] text-slate-500 font-mono">TrxID: {d.trxId} • {d.method}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{d.status}</div>
                  </div>
                  {d.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRejectDeposit(d)} className="p-2 bg-red-100 text-red-600 rounded-lg"><X className="w-4 h-4" /></button>
                      <button onClick={() => handleApproveDeposit(d)} className="px-3 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-lg">Approve</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Withdrawals */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-3">
              {withdrawals.length === 0 ? <p className="text-center py-10 text-slate-400 font-bold">No withdrawals found.</p> : withdrawals.map(w => (
                <div key={w.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <div className="font-black text-sm">{w.userName} - ৳{w.amount}</div>
                    <div className="text-[10px] text-pink-600 font-black">bKash: {w.bkashNumber}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{w.status}</div>
                  </div>
                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRejectWithdrawal(w)} className="px-3 py-2 bg-red-100 text-red-700 text-[10px] font-black rounded-lg">Reject</button>
                      <button onClick={() => handleApproveWithdrawal(w)} className="px-3 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-lg">Paid</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {taskProofs.length === 0 ? <p className="text-center py-10 text-slate-400 font-bold">No task proofs found.</p> : taskProofs.map(t => (
                <div key={t.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex justify-between">
                    <div className="font-bold text-xs">{t.jobTitle}</div>
                    <span className="text-[10px] font-black uppercase text-slate-400">{t.status}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-[10px] font-mono whitespace-pre-wrap">{t.proofText}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Worker: {t.workerName}</div>
                  {t.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleRejectTaskProof(t)} className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded">Reject</button>
                      <button onClick={() => handleApproveTaskProof(t)} className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded">Approve</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input type="text" placeholder="Search users (Name, Email, Mobile, Username)..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500" />
              </div>
              {filteredUsers.map(u => {
                const isHidden = !!hiddenPasswords[u.id];
                return (
                  <div key={u.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-black text-sm">{u.name} (@{u.username})</div>
                        <div className="text-[10px] text-slate-500 font-bold">{u.email} • {u.mobile}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-blue-700">৳{u.totalBalance.toFixed(2)}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">{calculateUserRank(u.xp || 0).rankName}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t text-[10px] font-bold">
                      <div className="flex items-center gap-2 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Login: <span className="text-indigo-600 font-black">{u.passwordHint || 'N/A'}</span></span>
                        <button onClick={() => { navigator.clipboard.writeText(`${u.email} / ${u.passwordHint || ''}`); alert('Login info copied!'); }} className="text-blue-600 hover:text-blue-800 ml-1">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleToggleStaff(u)} className={`px-2 py-1 rounded border text-[9px] font-black uppercase ${u.isCompanyStaff ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600'}`}>{u.isCompanyStaff ? 'Staff' : 'Make Staff'}</button>
                        <button onClick={() => setAdjustBalanceModal({ isOpen: true, userId: u.id, userName: u.name, currentBalance: u.totalBalance, amount: 100, mode: 'add' })} className="px-2.5 py-1 bg-blue-600 text-white rounded text-[9px] font-black uppercase shadow-sm">Balance</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Jobs */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <form onSubmit={handlePostJobOwner} className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-3 shadow-inner">
                <div className="font-black text-xs text-teal-900 uppercase flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Post Company Official Job
                </div>
                <input required placeholder="Job Title" value={newJobTitle} onChange={e => setNewJobTitle(e.target.value)} className="w-full p-2.5 bg-white border border-teal-100 rounded-xl text-xs font-bold" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Reward (৳)" value={newJobReward} onChange={e => setNewJobReward(Number(e.target.value))} className="p-2.5 bg-white border border-teal-100 rounded-xl text-xs font-bold" />
                  <input type="number" placeholder="Workers Required" value={newJobWorkers} onChange={e => setNewJobWorkers(Number(e.target.value))} className="p-2.5 bg-white border border-teal-100 rounded-xl text-xs font-bold" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-teal-600 text-white font-black text-xs rounded-xl shadow-lg shadow-teal-600/20">Post Official Job</button>
              </form>
              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Active Jobs List</div>
                {jobs.map(j => (
                  <div key={j.id} className="p-3 bg-white border rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{j.title}</div>
                      <div className="text-[9px] text-slate-400 font-bold">৳{j.reward} • {j.completed}/{j.total} done</div>
                    </div>
                    <button onClick={async () => { if(confirm('Delete this job?')) { await deleteDoc(doc(db, 'jobs', j.id)); if(onRefreshData) onRefreshData(); } }} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <form onSubmit={handleSaveSettings} className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                <div className="font-black text-xs uppercase text-slate-800 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> System Platform Settings
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Owner bKash Number</label>
                    <input placeholder="017XXXXXXXX" value={settingsForm.ownerBkash} onChange={e => setSettingsForm({...settingsForm, ownerBkash: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Owner Nagad Number</label>
                    <input placeholder="017XXXXXXXX" value={settingsForm.ownerNagad} onChange={e => setSettingsForm({...settingsForm, ownerNagad: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Gmail Rate (৳)</label>
                    <input type="number" placeholder="5" value={settingsForm.gmailRate} onChange={e => setSettingsForm({...settingsForm, gmailRate: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Referral Bonus (৳)</label>
                    <input type="number" placeholder="10" value={settingsForm.referralBonus} onChange={e => setSettingsForm({...settingsForm, referralBonus: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Scrolling Notice Text</label>
                  <textarea rows={2} placeholder="পছন্দ স্যালারি নিয়ে কাজ শুরু করে দিন..." value={settingsForm.noticeText} onChange={e => setSettingsForm({...settingsForm, noticeText: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Special Work Opportunity Text</label>
                  <textarea rows={2} placeholder="সরাসরি জিমেইল সেল করে পেমেন্ট নিন..." value={settingsForm.specialWorkInfo} onChange={e => setSettingsForm({...settingsForm, specialWorkInfo: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" />
                </div>

                <button type="submit" className="w-full py-3 bg-slate-800 text-white font-black text-xs rounded-xl shadow-lg">Save Platform Settings</button>
              </form>

              <form onSubmit={handleSendBroadcast} className="p-5 bg-blue-50 border border-blue-200 rounded-3xl space-y-3 shadow-inner">
                <div className="font-black text-xs uppercase text-blue-900 flex items-center gap-2">
                  <Send className="w-4 h-4" /> Global Broadcast Message
                </div>
                <textarea rows={2} placeholder="Message to all users..." value={broadcastText} onChange={e => setBroadcastText(e.target.value)} className="w-full p-3 bg-white border border-blue-100 rounded-2xl text-xs font-bold" />
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20">Send Broadcast Now</button>
              </form>

              <div className="p-5 bg-red-50 border border-red-200 rounded-3xl space-y-3 shadow-inner">
                <div className="font-black text-xs uppercase text-red-900 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Maintenance & Cleanup
                </div>
                <p className="text-[10px] text-red-700 font-bold">Caution: Clearing KYC data will delete all verification photos and records from Firestore.</p>
                <button 
                  type="button" 
                  disabled={isClearingKyc}
                  onClick={handleClearKycData}
                  className="w-full py-2.5 bg-red-600 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  {isClearingKyc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Clear All KYC Data & Reset Status
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex justify-between items-center shrink-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Work Grove Control v4.0</span>
          <button onClick={onClose} className="px-5 py-2 bg-slate-900 text-white text-[11px] font-black rounded-xl shadow-xl transform active:scale-95 transition-transform">Close Portal</button>
        </div>

      </div>

      {/* Balance Adjuster Modal */}
      {adjustBalanceModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 space-y-4 shadow-2xl border border-blue-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div className="font-black text-sm text-slate-800">Adjust Balance: {adjustBalanceModal.userName}</div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => setAdjustBalanceModal({...adjustBalanceModal, mode: 'add'})} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${adjustBalanceModal.mode === 'add' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>Add Funds</button>
              <button onClick={() => setAdjustBalanceModal({...adjustBalanceModal, mode: 'deduct'})} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${adjustBalanceModal.mode === 'deduct' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>Deduct</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase">Amount (৳)</label>
              <input type="number" value={adjustBalanceModal.amount} onChange={e => setAdjustBalanceModal({...adjustBalanceModal, amount: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800" />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setAdjustBalanceModal({isOpen: false, userId: '', userName: '', currentBalance: 0, amount: 100, mode: 'add'})} className="flex-1 py-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all">Cancel</button>
              <button onClick={handleBalanceAdjustSubmit} className="flex-1 py-3 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg transition-all transform active:scale-95">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
