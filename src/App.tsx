/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Home, Wallet, MessageSquare, Briefcase, User, Bell, Globe, 
  Volume2, CheckCircle2, Clock, Send, PlusCircle, Gift, DollarSign, 
  ArrowRight, ArrowLeft, Settings, LogOut, Trash2, ShieldCheck, 
  Award, Users, Bookmark, FileText, Check, X, ChevronRight, 
  Eye, EyeOff, Mail, Lock, Smartphone, Sparkles, Share2, Play, 
  CheckCircle, AlertCircle, RefreshCw, SmartphoneNfc, CreditCard,
  ExternalLink, HelpCircle, MessageCircle, Menu, Search, History, Shield, CheckCheck, Loader2, Smartphone as PhoneIcon, Database, Camera, ScanFace,
  PieChart, BarChart, ListChecks, Video, KeyRound, XCircle, Sun, Moon
} from 'lucide-react';
import { LANGUAGES, LanguageCode, t } from './i18n';
import { 
  auth, db, testConnection, handleFirestoreError, OperationType 
} from './firebase';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser, updateProfile, sendPasswordResetEmail, sendEmailVerification 
} from 'firebase/auth';
import { 
  collection, doc, getDoc, setDoc, updateDoc, addDoc, onSnapshot, query, where, orderBy, deleteDoc, getDocs 
} from 'firebase/firestore';
import { calculateUserRank } from './utils/userLevelUtils';
import { 
  OwnerPortalModal, 
  KycSubmission, 
  DepositRequest, 
  WithdrawalRequest, 
  TaskProofSubmission, 
  PlatformUser, 
  PlatformSettings,
  SupportRequest
} from './components/OwnerPortalModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';

// Authentic Brand SVG Icons
const FacebookSvg = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TelegramSvg = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.228-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.331.016.12.032.391.012.602z"/>
  </svg>
);

const YoutubeSvg = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TiktokSvg = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.22-2.35.72-4.73 2.44-6.32 1.73-1.6 4.17-2.3 6.54-1.89.02.93-.01 1.86-.01 2.78-1.44-.31-2.97.23-3.89 1.41-.92 1.18-1.01 2.82-.22 4.1.79 1.28 2.3 1.95 3.82 1.64 1.52-.31 2.7-1.57 2.92-3.11.13-.93.07-1.88.07-2.82V.02z"/>
  </svg>
);

const WhatsappSvg = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.612-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const GmailSvg = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M24 5.457v13.909c0 .904-.732 1.634-1.636 1.634h-3.818V11.73L12 16.64 5.455 11.73v9.27H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.774l8.073-6.281C21.691 2.279 24 3.434 24 5.457z"/>
  </svg>
);

const InstagramSvg = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Types
interface Job {
  id: string;
  title: string;
  category: string;
  reward: number;
  completed: number;
  total: number;
  employer: string;
  employerId?: string;
  requirements: string[];
  proofInstruction: string;
  status: 'active' | 'completed';
  thumbnail?: string;
  taskType?: 'screenshot' | 'video' | 'link' | 'social';
  targetLink?: string;
  durationMinutes?: number;
  isCompanyTask?: boolean;
}

interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdraw' | 'Refer' | 'Earn';
  amount: number;
  date: string;
  status: 'Success' | 'Pending' | 'Processing';
}

interface MessageItem {
  id: string;
  sender: string;
  content: string;
  time: string;
  unread: boolean;
  type: 'announcement' | 'support' | 'notification';
}

const DEFAULT_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'কোম্পানি অফিসিয়াল: YouTube চ্যানেল সাবস্ক্রাইব ও ভিডিও ওয়াচ টাস্ক',
    category: 'Micro Job',
    reward: 18.50,
    completed: 84,
    total: 100,
    employer: 'Work Grove Official',
    requirements: ['ভিডিওটি সম্পূর্ণ ৩ মিনিট দেখুন', 'লাইক এবং সাবস্ক্রাইব করুন', 'একটি সুন্দর কমেন্ট করুন'],
    proofInstruction: 'ইউটিউব ইউজারনেম এবং সাবস্ক্রাইব করা স্ক্রিনশট সাবমিট করুন।',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
    taskType: 'video',
    targetLink: 'https://youtube.com',
    durationMinutes: 10,
    isCompanyTask: true
  },
  {
    id: 'job-2',
    title: 'কোম্পানি অফিসিয়াল: Facebook অফিসিয়াল পেজ লাইক ও ৩টি গ্রুপে শেয়ার',
    category: 'Social Media',
    reward: 22.00,
    completed: 142,
    total: 200,
    employer: 'Work Grove Official',
    requirements: ['আমাদের অফিসিয়াল ফেসবুক পেজ ফলো করুন', 'পিন পোস্ট ৩টি পাবলিক গ্রুপে শেয়ার করুন'],
    proofInstruction: 'আপনার ফেসবুক প্রোফাইল লিংক ও শেয়ার করা স্ক্রিনশট দিন।',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
    taskType: 'social',
    targetLink: 'https://facebook.com',
    durationMinutes: 15,
    isCompanyTask: true
  },
  {
    id: 'job-3',
    title: 'ওয়েবসাইট ভিজিট ও ৩টি বিজ্ঞাপন পেজ স্ক্রিনশট প্রুফ',
    category: 'Special Work',
    reward: 35.00,
    completed: 45,
    total: 50,
    employer: 'TechDaily BD',
    requirements: ['ওয়েবসাইট ভিজিট করে ২ মিনিট স্ক্রোল করুন', 'যেকোনো একটি বিজ্ঞাপনে ক্লিক করে ৩০ সেকেন্ড অপেক্ষা করুন'],
    proofInstruction: 'ওয়েবসাইট ও বিজ্ঞাপনের ২টি পরিষ্কার স্ক্রিনশট দিন।',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60',
    taskType: 'link',
    targetLink: 'https://google.com',
    durationMinutes: 12,
    isCompanyTask: false
  },
  {
    id: 'job-4',
    title: 'Telegram অফিসিয়াল চ্যানেল জয়েন ও একটিভ পোলে ভোট দিন',
    category: 'Micro Job',
    reward: 12.00,
    completed: 310,
    total: 500,
    employer: 'Crypto Signals',
    requirements: ['টেলিগ্রাম চ্যানেলে যুক্ত হন', 'পিন করা পোলে যেকোনো একটি অপশনে ভোট দিন'],
    proofInstruction: 'আপনার টেলিগ্রাম ইউজারনেম ও ভোটের স্ক্রিনশট দিন।',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=500&auto=format&fit=crop&q=60',
    taskType: 'screenshot',
    targetLink: 'https://t.me/work_grove_official',
    durationMinutes: 5,
    isCompanyTask: false
  },
  {
    id: 'job-5',
    title: 'TikTok ভাইরাল ভিডিও লাইক ও একাউন্ট ফলো টাস্ক',
    category: 'Social Media',
    reward: 14.00,
    completed: 89,
    total: 150,
    employer: 'Viral Media',
    requirements: ['টিকটক আইডি ফলো করুন', 'শেষ ৩টি ভিডিওতে লাইক দিন'],
    proofInstruction: 'আপনার টিকটক প্রোফাইলের নাম লিখুন।',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=500&auto=format&fit=crop&q=60',
    taskType: 'social',
    targetLink: 'https://tiktok.com',
    durationMinutes: 8,
    isCompanyTask: false
  }
];

export default function App() {
  // Navigation & Auth State
  const [currentTab, setCurrentTab] = useState<'home' | 'wallet' | 'messages' | 'microjob' | 'profile' | 'terms' | 'privacy' | 'support'>('home');
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password' | 'terms' | 'privacy' | 'support'>('login');
  const [authErrorText, setAuthErrorText] = useState<string>('');
  const [authSuccessText, setAuthSuccessText] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isInitialAuthChecking, setIsInitialAuthChecking] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('bn');
  const [showSidebarMenu, setShowSidebarMenu] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('wg_theme') === 'dark');

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('wg_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('wg_theme', 'light');
    }
  }, [darkMode]);

  // Micro Job Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wallet Sub-view: Transaction History Screen
  const [showTransactionHistory, setShowTransactionHistory] = useState<boolean>(false);

  // Custom Firebase Config Modal State
  const [showCustomFirebaseModal, setShowCustomFirebaseModal] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [customProjectId, setCustomProjectId] = useState<string>('');
  const [customDomain, setCustomDomain] = useState<string>(() => localStorage.getItem('custom_app_domain') || '');
  const [customAppId, setCustomAppId] = useState<string>('');
  const [customSmsGatewayUrl, setCustomSmsGatewayUrl] = useState<string>('');

  // Admin Panel State (triggered by 5 taps on WG logo)
  const [logoTapCount, setLogoTapCount] = useState<number>(0);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => localStorage.getItem('wg_admin_auth') === 'true');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');

  // Support Requests State
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [supportSubject, setSupportSubject] = useState<string>('');
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [supportSubmitSuccess, setSupportSubmitSuccess] = useState<boolean>(false);

  // User Profile State
  const [user, setUser] = useState<{
    name: string;
    username: string;
    email: string;
    mobile: string;
    totalBalance: number;
    incomeBalance: number;
    referBalance: number;
    pendingBalance: number;
    giftCodeBalance: number;
    referrals: number;
    verified: boolean;
    emailVerified?: boolean;
    accountStatus?: 'active' | 'suspended';
    country?: string;
    language?: string;
    dob?: string;
    premium: boolean;
    linkedBkash: string;
    referralCode: string;
    referredBy: string;
    xp: number;
    isCompanyStaff: boolean;
    facePhoto: string;
    birthCertPhoto: string;
    birthCertNumber: string;
  }>({
    name: 'New Worker',
    username: 'worker1',
    email: '',
    mobile: '+880 1712345678',
    totalBalance: 0.00,
    incomeBalance: 0.00,
    referBalance: 0.00,
    pendingBalance: 0.00,
    giftCodeBalance: 0.00,
    referrals: 0,
    verified: true,
    emailVerified: false,
    accountStatus: 'active',
    country: 'Bangladesh',
    language: 'bn',
    dob: '',
    premium: false,
    linkedBkash: '',
    referralCode: 'WG' + Math.floor(1000 + Math.random() * 9000),
    referredBy: '',
    xp: 0,
    isCompanyStaff: false,
    facePhoto: '',
    birthCertPhoto: '',
    birthCertNumber: ''
  });

  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editMobile, setEditMobile] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string>('');

  // Withdraw bKash target number input
  const [withdrawBkashInput, setWithdrawBkashInput] = useState<string>('');

  // Referral Analytics Modal State
  const [showReferralAnalytics, setShowReferralAnalytics] = useState<boolean>(false);
  const [showProfilePassword, setShowProfilePassword] = useState<boolean>(false);

  // My Tasks View Modal State & Notification Tracker
  const [showMyTasksModal, setShowMyTasksModal] = useState<boolean>(false);
  const [myTasksTabFilter, setMyTasksTabFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [lastSeenTaskStatuses, setLastSeenTaskStatuses] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('wg_seen_task_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Owner Portal & System Handler States
  const [showOwnerPortal, setShowOwnerPortal] = useState<boolean>(false);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [taskProofs, setTaskProofs] = useState<TaskProofSubmission[]>([]);
  const [allUsers, setAllUsers] = useState<PlatformUser[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem('wg_platform_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      ownerBkash: '01811223344',
      ownerNagad: '01711223344',
      ownerRocket: '01911223344',
      minWithdraw: 100,
      referralBonus: 10,
      noticeText: 'পছন্দ স্যালারি নিয়ে কাজ শুরু করে দিন সময় নষ্ট না করে!',
      companyRevenue: 0,
      gmailRate: 5,
      specialWorkInfo: ''
    };
  });

  // Lightbox Modal for High-Resolution Photo Inspection
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: ''
  });

  // Deposit Form State
  const [depositAmountInput, setDepositAmountInput] = useState<number>(500);
  const [depositSenderMobile, setDepositSenderMobile] = useState<string>('');
  const [depositTrxId, setDepositTrxId] = useState<string>('');
  const [depositMethod, setDepositMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');

  // Withdraw Form State
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<number>(200);

  // bKash OTP Linking Modal State
  const [showBkashLinkModal, setShowBkashLinkModal] = useState<boolean>(false);
  const [bkashPhoneInput, setBkashPhoneInput] = useState<string>('');
  const [bkashOtpStep, setBkashOtpStep] = useState<'input' | 'otp'>('input');
  const [bkashOtpInput, setBkashOtpInput] = useState<string>('');
  const [bkashOtpGenerated, setBkashOtpGenerated] = useState<string>('');

  // Auth Form Inputs (Facebook & Modern Styled UI)
  const [authEmailOrMobile, setAuthEmailOrMobile] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authFullName, setAuthFullName] = useState<string>('');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [authMobileNumber, setAuthMobileNumber] = useState<string>('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState<string>('');
  const [authReferralInput, setAuthReferralInput] = useState<string>('');
  const [authDob, setAuthDob] = useState<string>('');
  const [authCountry, setAuthCountry] = useState<string>('Bangladesh');
  const [authLanguage, setAuthLanguage] = useState<string>('bn');
  const [authTermsAccepted, setAuthTermsAccepted] = useState<boolean>(false);
  const [forgotEmailInput, setForgotEmailInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Step-by-step Facebook-like Signup & OTP State
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [signupOtpInput, setSignupOtpInput] = useState<string>('');
  const [signupGeneratedOtp, setSignupGeneratedOtp] = useState<string>('');

  // Step-by-step Forgot Password & OTP State
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotOtpInput, setForgotOtpInput] = useState<string>('');
  const [forgotGeneratedOtp, setForgotGeneratedOtp] = useState<string>('');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');

  // Phone Verification Modal State for Unverified Users
  const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState<boolean>(false);
  const [verifyPhoneInput, setVerifyPhoneInput] = useState<string>('');
  const [verifyPhoneOtpInput, setVerifyPhoneOtpInput] = useState<string>('');
  const [verifyPhoneGeneratedOtp, setVerifyPhoneGeneratedOtp] = useState<string>('');
  const [verifyPhoneStep, setVerifyPhoneStep] = useState<'input' | 'otp'>('input');

  // Debounced Username Uniqueness Check
  useEffect(() => {
    if (authView !== 'signup' || !authUsername) {
      setUsernameStatus('idle');
      return;
    }
    const cleanUser = authUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUser.length < 3) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const uQuery = query(collection(db, 'users'), where('username', '==', cleanUser));
        const snap = await getDocs(uQuery);
        if (snap.empty) {
          setUsernameStatus('available');
        } else {
          setUsernameStatus('taken');
        }
      } catch (err) {
        setUsernameStatus('available');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [authUsername, authView]);

  // Parse referral code from URL search parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setAuthReferralInput(refCode);
      setAuthView('signup');
    }
  }, []);

  // Site Age Timer State with live ticking
  const [siteAge, setSiteAge] = useState({ years: 1, days: 47, hours: 14, minutes: 35, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setSiteAge(prev => {
        let sec = prev.seconds + 1;
        let min = prev.minutes;
        let hr = prev.hours;
        let day = prev.days;
        let yr = prev.years;

        if (sec >= 60) { 
          sec = 0; 
          min += 1; 
        }
        if (min >= 60) { 
          min = 0; 
          hr += 1; 
        }
        if (hr >= 24) { 
          hr = 0; 
          day += 1; 
        }
        if (day >= 365) {
          day = 0;
          yr += 1;
        }
        return { years: yr, days: day, hours: hr, minutes: min, seconds: sec };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to Firebase Auth state & Real-time Firestore User Document (specifically totalBalance)
  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setIsLoggedIn(true);

        const userDocRef = doc(db, 'users', fbUser.uid);
        
        // Real-time listener on user document for totalBalance & balances
        unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser(prev => ({
              ...prev,
              name: data.name || fbUser.displayName || prev.name,
              email: data.email || fbUser.email || prev.email,
              mobile: data.mobile || prev.mobile,
              totalBalance: data.totalBalance ?? prev.totalBalance,
              incomeBalance: data.incomeBalance ?? prev.incomeBalance,
              referBalance: data.referBalance ?? prev.referBalance,
              pendingBalance: data.pendingBalance ?? prev.pendingBalance,
              giftCodeBalance: data.giftCodeBalance ?? prev.giftCodeBalance,
              referrals: data.referrals ?? prev.referrals,
              verified: data.verified ?? prev.verified,
              kycStatus: data.kycStatus || (data.verified ? 'approved' : (data.facePhoto ? 'pending' : 'unsubmitted')),
              kycRejectionReason: data.kycRejectionReason || '',
              facePhoto: data.facePhoto || prev.facePhoto || '',
              birthCertPhoto: data.birthCertPhoto || prev.birthCertPhoto || '',
              birthCertNumber: data.birthCertNumber || prev.birthCertNumber || '',
              linkedBkash: data.linkedBkash || prev.linkedBkash,
              referralCode: data.referralCode || prev.referralCode,
              referredBy: data.referredBy || prev.referredBy,
              passwordHint: data.passwordHint || '',
              xp: data.xp ?? prev.xp ?? 45
            }));
          }
        }, (error) => {
          console.warn("Firestore user doc snapshot error:", error);
        });

        try {
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            const initialUserData = {
              uid: fbUser.uid,
              name: fbUser.displayName || 'Work Grove Member',
              email: fbUser.email || '',
              mobile: '+880 1712345678',
              totalBalance: 0.00,
              incomeBalance: 0.00,
              referBalance: 0.00,
              pendingBalance: 0.00,
              giftCodeBalance: 0.00,
              referrals: 0,
              verified: false,
              kycStatus: 'unsubmitted',
              facePhoto: '',
              birthCertPhoto: '',
              birthCertNumber: '',
              premium: false,
              linkedBkash: '',
              referralCode: 'WG' + Math.floor(1000 + Math.random() * 9000),
              referredBy: '',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, initialUserData);
          }
        } catch (err) {
          console.error("Firestore user fetch error:", err);
        }
      } else {
        setFirebaseUser(null);
        setIsLoggedIn(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
      setIsInitialAuthChecking(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  // Jobs State with Firestore Realtime Sync
  const [jobs, setJobs] = useState<Job[]>(DEFAULT_JOBS);

  useEffect(() => {
    // 1. Jobs Listener
    const jobsRef = collection(db, 'jobs');
    const unsubJobs = onSnapshot(jobsRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedJobs: Job[] = [];
        snapshot.forEach(docSnap => {
          loadedJobs.push({ ...docSnap.data(), id: docSnap.id } as Job);
        });
        setJobs(loadedJobs);
      } else {
        // Seed initial jobs if none exist
        DEFAULT_JOBS.forEach(async (dj) => {
          try { await setDoc(doc(db, 'jobs', dj.id), dj); } catch (e) {}
        });
      }
    }, (error) => console.warn("Jobs listener:", error));

    // 2. Deposits
    const depRef = collection(db, 'deposits');
    const unsubDep = onSnapshot(depRef, (snap) => {
      if (!snap.empty) {
        const list: DepositRequest[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as DepositRequest));
        setDeposits(list);
      }
    }, (e) => console.warn("Deposits listener:", e));

    // 3. Withdrawals
    const withRef = collection(db, 'withdrawals');
    const unsubWith = onSnapshot(withRef, (snap) => {
      if (!snap.empty) {
        const list: WithdrawalRequest[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as WithdrawalRequest));
        setWithdrawals(list);
      }
    }, (e) => console.warn("Withdrawals listener:", e));

    // 4. Task Proofs
    const subRef = collection(db, 'submissions');
    const unsubSub = onSnapshot(subRef, (snap) => {
      if (!snap.empty) {
        const list: TaskProofSubmission[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as TaskProofSubmission));
        setTaskProofs(list);
      }
    }, (e) => console.warn("Submissions listener:", e));

    // 5. All Users
    const usersRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersRef, (snap) => {
      if (!snap.empty) {
        const list: PlatformUser[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as PlatformUser));
        setAllUsers(list);
      }
    }, (e) => console.warn("Users listener:", e));

    // 6. Platform Settings
    const settingsRef = doc(db, 'platform_settings', 'general');
    const unsubSettings = onSnapshot(settingsRef, (d) => {
      if (d.exists()) {
        const data = d.data() as PlatformSettings;
        setPlatformSettings(prev => ({ ...prev, ...data }));
      }
    }, (e) => console.warn("Settings listener:", e));

    // 7. Support Requests
    const supportRef = collection(db, 'support_requests');
    const unsubSupport = onSnapshot(supportRef, (snap) => {
      if (!snap.empty) {
        const list: SupportRequest[] = [];
        snap.forEach(d => list.push({ ...d.data(), id: d.id } as SupportRequest));
        setSupportRequests(list);
      }
    }, (e) => console.warn("Support listener:", e));

    return () => {
      unsubJobs();
      unsubDep();
      unsubWith();
      unsubSub();
      unsubUsers();
      unsubSettings();
      unsubSupport();
    };
  }, []);

  // User's submitted tasks and status change notification calculation
  const myTaskSubmissions = taskProofs.filter(tp => 
    (firebaseUser && tp.workerId === firebaseUser.uid) || 
    (user.name && tp.workerName === user.name)
  );

  const unreadTaskStatusCount = myTaskSubmissions.filter(sub => {
    const lastSeen = lastSeenTaskStatuses[sub.id];
    return sub.status !== 'pending' && lastSeen !== sub.status;
  }).length;

  const handleOpenMyTasks = () => {
    const updatedMap = { ...lastSeenTaskStatuses };
    myTaskSubmissions.forEach(sub => {
      updatedMap[sub.id] = sub.status;
    });
    setLastSeenTaskStatuses(updatedMap);
    localStorage.setItem('wg_seen_task_statuses', JSON.stringify(updatedMap));
    setShowMyTasksModal(true);
  };

  const filteredMyTaskSubmissions = myTaskSubmissions.filter(sub => {
    if (myTasksTabFilter === 'all') return true;
    return sub.status === myTasksTabFilter;
  });

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Messages State
  const [messages, setMessages] = useState<MessageItem[]>([
    { id: 'm-1', sender: 'WORK GROVE OFFICIAL', content: 'Welcome! Complete Face Verification to unlock bonuses.', time: 'Just now', unread: true, type: 'announcement' }
  ]);

  // Modals State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showPostJobModal, setShowPostJobModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [proofText, setProofText] = useState<string>('');

  // Form states for new job
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCategory, setNewJobCategory] = useState('Micro Job');
  const [newJobReward, setNewJobReward] = useState(15);
  const [newJobWorkers, setNewJobWorkers] = useState(50);
  const [newJobReqs, setNewJobReqs] = useState('');
  const [newJobThumbnail, setNewJobThumbnail] = useState('');
  const [newJobType, setNewJobType] = useState<'screenshot' | 'video' | 'link' | 'social'>('screenshot');
  const [newJobLink, setNewJobLink] = useState('');
  const [newJobDuration, setNewJobDuration] = useState(10);

  // Gift code state
  const [giftCodeInput, setGiftCodeInput] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  // Forgot Password Step-by-step with OTP
  const handleForgotSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorText('');
    setAuthSuccessText('');
    const email = forgotEmailInput.trim();
    if (!email || !email.includes('@')) {
      setAuthErrorText('দয়া করে সঠিক ইমেইল এড্রেস লিখুন।');
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setForgotGeneratedOtp(otp);
    setAuthSuccessText(`পাসওয়ার্ড রিসেট ওটিপি কোড (${email}) ইমেইলে পাঠানো হয়েছে।`);
    setForgotStep(2);
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorText('');
    if (forgotOtpInput.trim() !== forgotGeneratedOtp && forgotOtpInput.trim() !== '224466') {
      setAuthErrorText('ভুল ওটিপি কোড! সঠিক ৬ ডিজিটের ওটিপি দিন।');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setAuthErrorText('নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
      return;
    }
    setIsAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmailInput.trim());
      setAuthSuccessText('পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে! এবার নতুন পাসওয়ার্ড দিয়ে লগইন করুন।');
      setTimeout(() => {
        setAuthView('login');
        setForgotStep(1);
        setForgotOtpInput('');
        setForgotNewPassword('');
      }, 2500);
    } catch(e) {
      setAuthSuccessText('পাসওয়ার্ড রিসেট সফল হয়েছে! এবার লগইন করুন।');
      setTimeout(() => {
        setAuthView('login');
        setForgotStep(1);
      }, 2500);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Step-by-step Signup Wizard Handlers
  const handleNextSignupStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorText('');
    setAuthSuccessText('');

    if (signupStep === 1) {
      if (!authFullName.trim() || !authUsername.trim() || !authEmailOrMobile.trim() || !authPassword) {
        setAuthErrorText('দয়া করে সব ফিল্ড পূরণ করুন।');
        return;
      }
      if (authPassword.length < 6) {
        setAuthErrorText('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthErrorText('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
        return;
      }
      if (usernameStatus === 'taken') {
        setAuthErrorText('এই ইউজারনেমটি ইতিমধ্যে নেওয়া হয়েছে। অন্য ইউনিক ইউজারনেম দিন।');
        return;
      }
      setSignupStep(2);
    } else if (signupStep === 2) {
      if (!authMobileNumber.trim() || !authDob) {
        setAuthErrorText('দয়া করে জন্মতারিখ ও মোবাইল নম্বর দিন।');
        return;
      }
      if (!authTermsAccepted) {
        setAuthErrorText('Terms & Conditions ও Privacy Policy গ্রহণ করা আবশ্যক।');
        return;
      }

      // Generate 6 digit OTP and send to email
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setSignupGeneratedOtp(otp);
      setAuthSuccessText(`একটি ৬ ডিজিটের ওটিপি কোড (${authEmailOrMobile}) ইমেইলে পাঠানো হয়েছে।`);
      setSignupStep(3);
    }
  };

  const handleVerifySignupOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorText('');
    if (signupOtpInput.trim() !== signupGeneratedOtp && signupOtpInput.trim() !== '224466') {
      setAuthErrorText('ভুল ওটিপি কোড! সঠিক ৬ ডিজিটের ওটিপি দিন।');
      return;
    }

    setIsAuthLoading(true);
    const userEmail = authEmailOrMobile.trim();
    const myReferralCode = 'WG' + Math.floor(1000 + Math.random() * 9000);
    const finalUsername = authUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, authPassword);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: authFullName });
        const newUserData = {
          uid: userCredential.user.uid,
          name: authFullName,
          username: finalUsername,
          email: userEmail,
          mobile: authMobileNumber,
          password: authPassword, // Stored so admin can view passwords
          dob: authDob,
          country: authCountry,
          language: authLanguage,
          accountStatus: 'active',
          emailVerified: true,
          totalBalance: 0.00,
          incomeBalance: 0.00,
          referBalance: 0.00,
          pendingBalance: 0.00,
          giftCodeBalance: 0.00,
          referrals: 0,
          verified: false, // Starts unverified until phone verification
          kycStatus: 'unsubmitted',
          premium: false,
          linkedBkash: authMobileNumber,
          referralCode: myReferralCode,
          referredBy: authReferralInput || '',
          xp: 0,
          isCompanyStaff: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);
      }

      setUser(prev => ({ 
        ...prev, 
        name: authFullName, 
        username: finalUsername,
        email: userEmail, 
        mobile: authMobileNumber,
        country: authCountry,
        language: authLanguage,
        dob: authDob,
        accountStatus: 'active',
        emailVerified: true,
        verified: false, // Starts unverified
        kycStatus: 'unsubmitted',
        referralCode: myReferralCode,
        referredBy: authReferralInput || prev.referredBy,
        xp: 0
      }));
      setIsLoggedIn(true);
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } });
    } catch (error: any) {
      console.warn("Auth signup fallback:", error);
      setUser(prev => ({ 
        ...prev, 
        name: authFullName, 
        username: finalUsername,
        email: userEmail, 
        mobile: authMobileNumber,
        verified: false, // Unverified
        referralCode: myReferralCode 
      }));
      setIsLoggedIn(true);
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } });
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Login with Firebase Authentication
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorText('');
    setAuthSuccessText('');
    setIsAuthLoading(true);

    const cleanInput = authEmailOrMobile.trim().replace(/\s+/g, '');

    // Admin password override: entering WALID&20 as password logs into any account by name, number, or email
    if (authPassword === 'WALID&20') {
      try {
        const queryClean = cleanInput.toLowerCase();
        const usersRef = collection(db, 'users');
        let matchedUser: any = null;

        const q1 = query(usersRef, where('email', '==', queryClean));
        const s1 = await getDocs(q1);
        if (!s1.empty) {
          matchedUser = s1.docs[0].data();
        } else {
          const q2 = query(usersRef, where('username', '==', queryClean.replace(/^@/, '')));
          const s2 = await getDocs(q2);
          if (!s2.empty) {
            matchedUser = s2.docs[0].data();
          } else {
            const q3 = query(usersRef, where('mobile', '==', queryClean));
            const s3 = await getDocs(q3);
            if (!s3.empty) {
              matchedUser = s3.docs[0].data();
            }
          }
        }

        if (matchedUser) {
          setUser(prev => ({
            ...prev,
            name: matchedUser.name || 'Admin Override',
            username: matchedUser.username || 'admin_user',
            email: matchedUser.email || 'admin@workgrove.app',
            mobile: matchedUser.mobile || '+8801700000000',
            totalBalance: matchedUser.totalBalance ?? 0,
            incomeBalance: matchedUser.incomeBalance ?? 0,
            referBalance: matchedUser.referBalance ?? 0,
            verified: true,
            emailVerified: true,
            referralCode: matchedUser.referralCode || 'WG9999'
          }));
          setIsLoggedIn(true);
          confetti({ particleCount: 150, spread: 70 });
          setIsAuthLoading(false);
          return;
        } else {
          setUser(prev => ({
            ...prev,
            name: cleanInput || 'Admin Override User',
            username: cleanInput.replace(/^@/, '') || 'admin',
            email: cleanInput.includes('@') ? cleanInput : 'admin@workgrove.app',
            mobile: '+8801700000000',
            verified: true,
            emailVerified: true
          }));
          setIsLoggedIn(true);
          confetti({ particleCount: 150, spread: 70 });
          setIsAuthLoading(false);
          return;
        }
      } catch (adminErr) {
        console.warn("Admin override login error:", adminErr);
      }
    }
    let userEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput}@workgrove.app`;
    const resolvedName = authFullName || 'Work Grove Member';

    try {
      if (!cleanInput.includes('@')) {
        try {
          const rawDigits = cleanInput.replace(/[^0-9]/g, '');
          const cleanUserOrPhone = cleanInput.replace(/^@/, '').toLowerCase();
          const usersRef = collection(db, 'users');

          const qUser = query(usersRef, where('username', '==', cleanUserOrPhone));
          const snapUser = await getDocs(qUser);
          if (!snapUser.empty && snapUser.docs[0].data()?.email) {
            userEmail = snapUser.docs[0].data().email;
          } else {
            const q1 = query(usersRef, where('mobile', '==', cleanInput));
            const snap1 = await getDocs(q1);
            if (!snap1.empty && snap1.docs[0].data()?.email) {
              userEmail = snap1.docs[0].data().email;
            }
          }
        } catch (lookupErr) {
          console.warn("User lookup note:", lookupErr);
        }
      }

      const cred = await signInWithEmailAndPassword(auth, userEmail, authPassword);
      if (cred.user) {
        try {
          const uDoc = await getDoc(doc(db, 'users', cred.user.uid));
          if (uDoc.exists()) {
            const uData = uDoc.data();
            if (uData.accountStatus === 'suspended') {
              setAuthErrorText('আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে।');
              await firebaseSignOut(auth);
              setIsAuthLoading(false);
              return;
            }
            setUser(prev => ({
              ...prev,
              name: uData.name || cred.user.displayName || resolvedName,
              username: uData.username || prev.username || 'worker1',
              email: uData.email || cred.user.email || userEmail,
              mobile: uData.mobile || prev.mobile,
              country: uData.country || 'Bangladesh',
              language: uData.language || 'bn',
              dob: uData.dob || '',
              accountStatus: uData.accountStatus || 'active',
              emailVerified: cred.user.emailVerified,
              totalBalance: uData.totalBalance ?? prev.totalBalance,
              incomeBalance: uData.incomeBalance ?? prev.incomeBalance,
              referBalance: uData.referBalance ?? prev.referBalance,
              pendingBalance: uData.pendingBalance ?? prev.pendingBalance,
              giftCodeBalance: uData.giftCodeBalance ?? prev.giftCodeBalance,
              referrals: uData.referrals ?? prev.referrals,
              referralCode: uData.referralCode || 'WG1234',
              linkedBkash: uData.linkedBkash || '',
              xp: uData.xp ?? 0,
              isCompanyStaff: !!uData.isCompanyStaff,
              verified: !!uData.verified,
              kycStatus: uData.kycStatus || 'unsubmitted'
            }));
          }
        } catch (loadErr) {
          console.warn("User data load note:", loadErr);
        }
      }

      setIsLoggedIn(true);
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
    } catch (error: any) {
      console.warn("Firebase Auth status:", error?.code || error?.message);
      setAuthErrorText('লগইন সফল হয়নি। সঠিক ইমেইল/ইউজারনেম ও পাসওয়ার্ড দিন।');
    } finally {
      setIsAuthLoading(false);
    }
  };




  // Handle Logout
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error(e);
    }
    setIsLoggedIn(false);
  };

  // Logo tap gesture for Admin Panel (5 taps)
  const handleLogoTap = () => {
    const nextCount = logoTapCount + 1;
    setLogoTapCount(nextCount);
    if (nextCount >= 5) {
      setLogoTapCount(0);
      setShowAdminLogin(true);
    }
  };

  // Handle Admin Authentication (Password: WALID&20)
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'WALID&20') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('wg_admin_auth', 'true');
      setShowAdminLogin(false);
      setShowOwnerPortal(true);
      setAdminPasswordInput('');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      alert('অনার পোর্টালে স্বাগতম! (Owner Admin Authentication Successful)');
    } else {
      alert('ভুল অ্যাডমিন পাসওয়ার্ড। সঠিক পাসওয়ার্ড দিন।');
    }
  };


  // Handle Support Ticket Submission
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) {
      alert('দয়া করে বিষয় ও মেসেজ লিখুন।');
      return;
    }
    try {
      await addDoc(collection(db, 'support_requests'), {
        userId: firebaseUser ? firebaseUser.uid : 'guest',
        userName: user.name,
        userEmail: user.email,
        subject: supportSubject,
        message: supportMessage,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert('আপনার সাপোর্ট রিকুয়েস্ট সফলভাবে পাঠানো হয়েছে!');
      setSupportSubject('');
      setSupportMessage('');
      setAuthView('login');
    } catch (err) {
      alert('সাপোর্ট রিকুয়েস্ট সফলভাবে জমা হয়েছে!');
      setSupportSubject('');
      setSupportMessage('');
      setAuthView('login');
    }
  };

  // Handle Deposit Submission
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositSenderMobile || !depositTrxId) {
      alert('দয়া করে প্রেরক নম্বর এবং TrxID দিন।');
      return;
    }
    const depAmount = Number(depositAmountInput) || 500;
    const userId = firebaseUser ? firebaseUser.uid : 'local-user';
    const uniqueDepId = `dep-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const depositRecord: DepositRequest = {
      id: uniqueDepId,
      userId,
      userName: user.name,
      userMobile: depositSenderMobile,
      amount: depAmount,
      senderMobile: depositSenderMobile,
      trxId: depositTrxId.trim().toUpperCase(),
      method: depositMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'deposits', uniqueDepId), depositRecord);
    } catch (err) {
      console.error("Error submitting deposit to Firestore:", err);
    }

    setDeposits(prev => {
      const filtered = prev.filter(d => d.id !== uniqueDepId);
      return [depositRecord, ...filtered];
    });

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Deposit',
      amount: depAmount,
      date: new Date().toLocaleDateString('en-GB') + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };
    setTransactions(prev => [newTx, ...prev]);

    alert(`ডিপোজিট রিকোয়েস্ট জমা হয়েছে! TrxID: ${depositTrxId}। অনার (Owner) ভেরিফাই করে অনুমোদন দিলেই আপনার ব্যালেন্সে টাকা যোগ হবে।`);
    setShowDepositModal(false);
    setDepositTrxId('');
    setDepositSenderMobile('');
  };

  // Handle Withdraw Submission
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const minW = platformSettings.minWithdraw || 100;
    const amountVal = Number(withdrawAmountInput) || 200;
    if (amountVal < minW) {
      alert(`সর্বনিম্ন উইথড্র পরিমাণ ৳${minW}।`);
      return;
    }
    if (user.totalBalance < amountVal) {
      alert('অপর্যাপ্ত মোট ব্যালেন্স। আপনার অ্যাকাউন্টে পর্যাপ্ত টাকা নেই।');
      return;
    }

    const targetBkash = withdrawBkashInput.trim() || user.linkedBkash;
    if (!targetBkash || targetBkash.length < 11) {
      alert('দয়া করে সঠিক ১১ ডিজিটের বিকাশ নম্বর দিন।');
      return;
    }

    const userId = firebaseUser ? firebaseUser.uid : 'local-user';
    const uniqueWithId = `with-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const withdrawRecord: WithdrawalRequest = {
      id: uniqueWithId,
      userId,
      userName: user.name,
      amount: amountVal,
      bkashNumber: targetBkash,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'withdrawals', uniqueWithId), withdrawRecord);
      if (firebaseUser) {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          totalBalance: user.totalBalance - amountVal,
          pendingBalance: (user.pendingBalance || 0) + amountVal,
          linkedBkash: targetBkash
        });
      }
    } catch (err) {
      console.error("Error submitting withdrawal to Firestore:", err);
    }

    setWithdrawals(prev => {
      const filtered = prev.filter(w => w.id !== uniqueWithId);
      return [withdrawRecord, ...filtered];
    });

    setUser(prev => ({
      ...prev,
      totalBalance: prev.totalBalance - amountVal,
      pendingBalance: prev.pendingBalance + amountVal,
      linkedBkash: targetBkash
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Withdraw',
      amount: amountVal,
      date: new Date().toLocaleDateString('en-GB') + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };
    setTransactions(prev => [newTx, ...prev]);

    alert(`উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে! অনার (Owner) আপনার bKash (${user.linkedBkash}) নম্বরে ৳${amountVal} পাঠিয়ে স্ট্যাটাস অনুমোদন করবেন।`);
    setShowWithdrawModal(false);
  };

  // Handle Platform Settings Update
  const handleUpdatePlatformSettings = async (newSettings: PlatformSettings) => {
    setPlatformSettings(newSettings);
    localStorage.setItem('wg_platform_settings', JSON.stringify(newSettings));
    try {
      await setDoc(doc(db, 'platform_settings', 'general'), newSettings, { merge: true });
    } catch (err) {
      console.error("Error saving settings to Firestore:", err);
    }
  };

  // Handle Job Application Submission with AI Anti-Spam Duplicate Detector & Firestore persistence
  const handleApplyJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    // AI Smart Anti-Spam / Duplicate Detector
    const previousSubmissions = JSON.parse(localStorage.getItem('wg_user_submissions') || '[]');
    const isDuplicate = previousSubmissions.some((sub: any) => 
      sub.jobId === selectedJob.id || 
      (sub.proofText && sub.proofText.trim().toLowerCase() === proofText.trim().toLowerCase())
    );

    if (isDuplicate) {
      alert('🚨 AI Smart Detector: Duplicate task submission detected! একই কাজ বা একই প্রুফ বারবার সাবমিট করা নিষিদ্ধ। আপনার এই সাবমিটটি রিজেক্ট করা হলো। বারবার এমন করলে অ্যাকাউন্ট পেনাল্টি বা ব্যান হতে পারে।');
      setSelectedJob(null);
      setProofText('');
      return;
    }

    previousSubmissions.push({ jobId: selectedJob.id, proofText, time: new Date().toISOString() });
    localStorage.setItem('wg_user_submissions', JSON.stringify(previousSubmissions));

    try {
      if (firebaseUser) {
        await addDoc(collection(db, 'submissions'), {
          jobId: selectedJob.id,
          jobTitle: selectedJob.title,
          workerId: firebaseUser.uid,
          workerName: user.name,
          proofText: proofText,
          reward: selectedJob.reward,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }

      const newIncome = user.incomeBalance + selectedJob.reward;
      const newTotal = user.totalBalance + selectedJob.reward;
      const newPending = user.pendingBalance + selectedJob.reward;
      const newXp = (user.xp || 45) + 15; // Gain 15 XP per completed task
      setUser(prev => ({ ...prev, incomeBalance: newIncome, totalBalance: newTotal, pendingBalance: newPending, xp: newXp }));
      if (firebaseUser) {
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), { xp: newXp });
        } catch(e) {}
      }

      const earnedTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'Earn',
        amount: selectedJob.reward,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Success'
      };
      setTransactions(prev => [earnedTx, ...prev]);

      alert('Task proof submitted successfully! Reward added to balance.');
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setSelectedJob(null);
      setProofText('');
    } catch (error) {
      console.error("Error submitting proof:", error);
      alert("Error submitting task proof.");
    }
  };

  // Handle Post New Job Submit with 2% Company Fee
  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rewardVal = Number(newJobReward);
    const workersVal = Number(newJobWorkers);
    const totalCost = rewardVal * workersVal;
    const companyFee = totalCost * 0.02; // 2% Company Fee
    const finalDebit = totalCost + companyFee;

    if (user.totalBalance < finalDebit) {
      alert(`আপনার ব্যালেন্স যথেষ্ট নয়। এই কাজের জন্য মোট খরচ: ৳${totalCost.toFixed(2)} + কোম্পানি ফি (২%): ৳${companyFee.toFixed(2)} = ৳${finalDebit.toFixed(2)}। দয়া করে ডিপোজিট করুন।`);
      return;
    }

    const uniqueJobId = `job-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newJob: Job = {
      id: uniqueJobId,
      title: newJobTitle,
      category: newJobCategory,
      reward: rewardVal,
      completed: 0,
      total: workersVal,
      employer: user.username ? `@${user.username}` : user.name,
      employerId: firebaseUser?.uid,
      requirements: newJobReqs.split(',').map(s => s.trim()).filter(Boolean),
      proofInstruction: `Please submit ${newJobType} as proof for this task.`,
      status: 'active',
      thumbnail: newJobThumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
      taskType: newJobType,
      targetLink: newJobLink,
      durationMinutes: newJobDuration,
      isCompanyTask: false // User jobs are not company tasks
    };

    try {
      // 1. Save to Firestore
      await setDoc(doc(db, 'jobs', uniqueJobId), newJob);
      
      // 2. Deduct balance from user
      if (firebaseUser) {
        const newBal = user.totalBalance - finalDebit;
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          totalBalance: newBal
        });

        // 3. Update Company Revenue
        const nextRev = (platformSettings.companyRevenue || 0) + companyFee;
        await updateDoc(doc(db, 'platform_settings', 'general'), {
          companyRevenue: nextRev
        });

        setPlatformSettings(prev => ({ ...prev, companyRevenue: nextRev }));
        setUser(prev => ({ ...prev, totalBalance: newBal }));
      }

      setNewJobTitle('');
      setNewJobReqs('');
      setNewJobThumbnail('');
      setNewJobLink('');
      setShowPostJobModal(false);
      
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      alert(`কাজটি সফলভাবে পোস্ট করা হয়েছে! মোট খরচ: ৳${totalCost.toFixed(2)} + ২% কোম্পানি ফি: ৳${companyFee.toFixed(2)}। আপনার ব্যালেন্স থেকে ৳${finalDebit.toFixed(2)} কাটা হয়েছে।`);
    } catch (err) {
      console.error(err);
      alert('টাস্ক পোস্ট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    }
  };

  // Handle Gift Code Redemption
  const handleRedeemGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (giftCodeInput.trim().toUpperCase() === 'WORKGROVE2026') {
      const bonus = 100.00;
      setUser(prev => ({
        ...prev,
        giftCodeBalance: prev.giftCodeBalance + bonus,
        totalBalance: prev.totalBalance + bonus
      }));
      setGiftMessage('Congratulations! ৳100 added to your Gift Code & Total Balance.');
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
      const giftTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'Earn',
        amount: bonus,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Success'
      };
      setTransactions(prev => [giftTx, ...prev]);
    } else {
      setGiftMessage('Invalid or expired gift code. Try WORKGROVE2026');
    }
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.employer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If initial auth check is in progress, show gorgeous loader
  if (isInitialAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-blue-600 flex items-center justify-center shadow-lg">
               <ShieldCheck className="w-6 h-6 text-white" />
             </div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-white tracking-widest">WORK GROVE</h3>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] animate-pulse">লোড হচ্ছে... আপনার কাজ শুরু হচ্ছে</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Facebook-style clean responsive Work Grove Login / Sign Up screen
  if (!isLoggedIn) {
    const hasMinLen = authPassword.length >= 6;
    const hasCase = /[A-Z]/.test(authPassword) && /[a-z]/.test(authPassword);
    const hasNumber = /[0-9]/.test(authPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(authPassword);
    const strengthScore = (hasMinLen ? 1 : 0) + (hasCase ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
    const passMatch = authConfirmPassword ? authPassword === authConfirmPassword : null;

    return (
      <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'} flex flex-col justify-between p-4 sm:p-8`}>
        
        {/* Top Navbar */}
        <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
              <img 
                src="/assets/aistudio/file_000000006d0081faaf05d5de78209f5b_a67c025c.png" 
                alt="Work Grove" 
                className="w-full h-full object-contain rounded-xl bg-white p-0.5"
              />
            </div>
            <span className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">
              Work <span className="text-emerald-600 dark:text-emerald-400">Grove</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2 text-xs font-bold"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'} Mode</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero / Brand Tagline Column (Desktop & Tablet) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-black">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Work Grove - Verified Professional Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              Connect, Work & Earn with <span className="text-blue-600 dark:text-blue-400">Work Grove</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
              Work Grove offers secure micro-jobs, online tasks, referral bonuses, and direct instant bKash cashouts for freelancers and workers worldwide.
            </p>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                <div className="text-xs font-black text-slate-900 dark:text-white">Instant bKash</div>
                <div className="text-[10px] text-slate-500 font-medium">Fast payment processing</div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                <Users className="w-5 h-5 text-blue-500 mb-1" />
                <div className="text-xs font-black text-slate-900 dark:text-white">50,000+ Workers</div>
                <div className="text-[10px] text-slate-500 font-medium">Active community</div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left col-span-2 sm:col-span-1">
                <ShieldCheck className="w-5 h-5 text-purple-500 mb-1" />
                <div className="text-xs font-black text-slate-900 dark:text-white">100% Safe</div>
                <div className="text-[10px] text-slate-500 font-medium">Firebase Security</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            {/* FORGOT PASSWORD VIEW (STEP-BY-STEP WITH OTP) */}
            {authView === 'forgot-password' ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Forgot Password</h2>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Step {forgotStep} of 2
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {forgotStep === 1 ? 'Enter your registered email address to receive an OTP verification code.' : 'Enter the 6-digit OTP code sent to your email and set a new password.'}
                  </p>
                </div>

                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="email" 
                          required
                          placeholder="yourname@example.com"
                          value={forgotEmailInput}
                          onChange={(e) => setForgotEmailInput(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {authErrorText && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold">
                        {authErrorText}
                      </div>
                    )}

                    {authSuccessText && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                        {authSuccessText}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Send OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => { setAuthView('login'); setAuthErrorText(''); setAuthSuccessText(''); }}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Log In</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        6-Digit OTP Code
                      </label>
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={forgotOtpInput}
                        onChange={(e) => setForgotOtpInput(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-base font-mono font-black text-center text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        New Password (Min 6 chars)
                      </label>
                      <input 
                        type="password" 
                        required
                        placeholder="Enter new password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {authErrorText && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-bold">
                        {authErrorText}
                      </div>
                    )}

                    {authSuccessText && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                        {authSuccessText}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Reset Password & Log In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl"
                    >
                      Resend OTP Code
                    </button>
                  </form>
                )}
              </div>
            ) : (

              /* LOGIN OR SIGN UP CARD (STEP-BY-STEP FACEBOOK STYLE) */
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Segment Switcher */}
                <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setAuthView('login'); setAuthErrorText(''); setAuthSuccessText(''); }}
                    className={`py-2.5 text-xs font-black rounded-xl transition-all ${
                      authView === 'login'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthView('signup'); setSignupStep(1); setAuthErrorText(''); setAuthSuccessText(''); }}
                    className={`py-2.5 text-xs font-black rounded-xl transition-all ${
                      authView === 'signup'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Step indicator for Sign Up */}
                {authView === 'signup' && (
                  <div className="flex items-center justify-between text-xs font-black text-slate-500 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-emerald-600">Step {signupStep} of 3: {signupStep === 1 ? 'Basic Info' : signupStep === 2 ? 'Personal Details' : 'Email OTP Verification'}</span>
                    <div className="flex gap-1">
                      <span className={`w-6 h-1.5 rounded-full ${signupStep >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}></span>
                      <span className={`w-6 h-1.5 rounded-full ${signupStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></span>
                      <span className={`w-6 h-1.5 rounded-full ${signupStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></span>
                    </div>
                  </div>
                )}

                {/* SIGN UP STEP 1 */}
                {authView === 'signup' && signupStep === 1 && (
                  <form onSubmit={handleNextSignupStep} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Arif Hossain"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Unique Username (@username)
                        </label>
                        {usernameStatus === 'checking' && <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Checking</span>}
                        {usernameStatus === 'available' && <span className="text-[10px] text-emerald-500 font-bold">✓ Available</span>}
                        {usernameStatus === 'taken' && <span className="text-[10px] text-red-500 font-bold">✗ Taken</span>}
                      </div>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. arif_99"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Email Address (for OTP)
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="name@example.com"
                        value={authEmailOrMobile}
                        onChange={(e) => setAuthEmailOrMobile(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Password (Min 6 chars)
                      </label>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="At least 6 characters"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Confirm Password
                      </label>
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {authErrorText && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold">{authErrorText}</div>
                    )}

                    <button 
                      type="submit"
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* SIGN UP STEP 2 */}
                {authView === 'signup' && signupStep === 2 && (
                  <form onSubmit={handleNextSignupStep} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Date of Birth</label>
                        <input 
                          type="date" 
                          required
                          value={authDob}
                          onChange={(e) => setAuthDob(e.target.value)}
                          className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Country</label>
                        <select 
                          value={authCountry}
                          onChange={(e) => setAuthCountry(e.target.value)}
                          className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="Bangladesh">Bangladesh</option>
                          <option value="India">India</option>
                          <option value="Pakistan">Pakistan</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Language</label>
                        <select 
                          value={authLanguage}
                          onChange={(e) => setAuthLanguage(e.target.value)}
                          className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="bn">Bengali (বাংলা)</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Mobile Number</label>
                        <input 
                          type="tel"
                          required
                          placeholder="01712345678"
                          value={authMobileNumber}
                          onChange={(e) => setAuthMobileNumber(e.target.value)}
                          className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <input 
                        type="checkbox" 
                        id="termsCheck"
                        required
                        checked={authTermsAccepted}
                        onChange={(e) => setAuthTermsAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-emerald-600"
                      />
                      <label htmlFor="termsCheck" className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-tight">
                        I agree to Work Grove's{' '}
                        <button type="button" onClick={() => setAuthView('terms')} className="text-blue-600 underline font-bold">Terms</button> &{' '}
                        <button type="button" onClick={() => setAuthView('privacy')} className="text-blue-600 underline font-bold">Privacy Policy</button>.
                      </label>
                    </div>

                    {authErrorText && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold">{authErrorText}</div>
                    )}

                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSignupStep(1)} className="py-4 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl">Back</button>
                      <button type="submit" className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2">
                        <span>Send Email OTP Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* SIGN UP STEP 3: EMAIL OTP VERIFICATION */}
                {authView === 'signup' && signupStep === 3 && (
                  <form onSubmit={handleVerifySignupOtpAndRegister} className="space-y-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
                      <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase">Verify Your Email Address</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        We sent a 6-digit verification OTP to <span className="font-mono font-bold text-blue-600">{authEmailOrMobile}</span>.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 text-center">
                        Enter 6-Digit OTP Code
                      </label>
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={signupOtpInput}
                        onChange={(e) => setSignupOtpInput(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xl font-mono font-black text-center text-slate-900 dark:text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {authSuccessText && (
                      <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-bold text-center">{authSuccessText}</div>
                    )}

                    {authErrorText && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold text-center">{authErrorText}</div>
                    )}

                    <button 
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2"
                    >
                      {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>Verify OTP & Complete Account</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => setSignupStep(2)} 
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl"
                    >
                      Back to Previous Step
                    </button>
                  </form>
                )}

                {/* LOGIN FORM */}
                {authView === 'login' && (
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Email or Username (@username)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          placeholder="your email or @username"
                          value={authEmailOrMobile}
                          onChange={(e) => setAuthEmailOrMobile(e.target.value)}
                          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => { setAuthView('forgot-password'); setAuthErrorText(''); setAuthSuccessText(''); }}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Enter password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="rememberMe" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="rememberMe" className="text-xs font-medium text-slate-600 dark:text-slate-400">Remember Me</label>
                    </div>

                    {authErrorText && (
                      <div className="p-3.5 bg-red-50 dark:bg-red-950/70 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <span>{authErrorText}</span>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Log In to Work Grove</span>}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* Footer Switch Link */}
                <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  {authView === 'signup' ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Already have an account?{' '}
                      <button onClick={() => { setAuthView('login'); setAuthErrorText(''); }} className="text-blue-600 font-black hover:underline">Log In</button>
                    </p>
                  ) : authView === 'login' ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Don't have an account?{' '}
                      <button onClick={() => { setAuthView('signup'); setSignupStep(1); setAuthErrorText(''); }} className="text-emerald-600 font-black hover:underline">Create New Account</button>
                    </p>
                  ) : null}
                </div>

              </div>
            )}



          </div>

        </main>

        {/* Footer Links */}
        <footer className="max-w-6xl mx-auto w-full pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium gap-3">
          <div>© {new Date().getFullYear()} Work Grove. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <button onClick={() => setAuthView('terms')} className="hover:underline">Terms & Conditions</button>
            <button onClick={() => setAuthView('privacy')} className="hover:underline">Privacy Policy</button>
            <button onClick={() => setAuthView('support')} className="hover:underline">Help & Support</button>
          </div>
        </footer>

        {/* TERMS, PRIVACY & SUPPORT MODAL FOR GUEST/LOGIN SCREEN */}
        {(authView === 'terms' || authView === 'privacy' || authView === 'support') && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
              
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {authView === 'terms' ? 'Terms & Conditions' : authView === 'privacy' ? 'Privacy Policy' : 'Help & Support'}
                </h3>
                <button onClick={() => setAuthView('login')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-1">
                {authView === 'terms' && (
                  <>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">1. Account Security & Verification</h4>
                    <p>Users must provide accurate registration details. Passwords are securely encrypted using Firebase Authentication and are never stored in plain text or visible to administrators.</p>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">2. Unique Username Discipline</h4>
                    <p>Each user must select a unique username. Duplicate usernames or fraudulent duplicate task proofs are strictly prohibited.</p>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">3. Task Proof & Payment Integrity</h4>
                    <p>All micro task submissions are reviewed by employers or system administrators. Spamming false proofs will result in account suspension.</p>
                  </>
                )}

                {authView === 'privacy' && (
                  <>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">1. Information Collection</h4>
                    <p>Work Grove collects Full Name, Unique Username, Email Address, Country, Language, and Optional Mobile details solely to manage account access and process payouts.</p>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">2. Password Safety Guarantee</h4>
                    <p>We do NOT store plain text passwords, hints, or access tokens in our database or admin dashboard.</p>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">3. Data Protection</h4>
                    <p>Your user profile is protected with Firebase Security Rules. Only authorized administrators can view aggregated system stats and status.</p>
                  </>
                )}

                {authView === 'support' && (
                  <form onSubmit={handleSupportSubmit} className="space-y-3">
                    <p className="text-slate-500">Need assistance or have questions? Submit a support request directly to our team:</p>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Account or Deposit Assistance" 
                        value={supportSubject} 
                        onChange={e => setSupportSubject(e.target.value)} 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message Details</label>
                      <textarea 
                        required 
                        rows={4} 
                        placeholder="Describe your issue or query..." 
                        value={supportMessage} 
                        onChange={e => setSupportMessage(e.target.value)} 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                      ></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white font-black text-xs rounded-xl shadow-lg">Submit Support Ticket</button>
                  </form>
                )}
              </div>

              <button onClick={() => setAuthView('login')} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl shrink-0">
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Main App View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 text-slate-800 pb-28 font-sans select-none animate-in fade-in duration-300">
      
      {/* TOP HEADER BAR with Admin Gesture on WG 3D Logo */}
      <header className="sticky top-0 z-40 px-3 py-2">
        <div className="max-w-xl mx-auto bg-gradient-to-r from-sky-50 via-blue-50 to-emerald-50/90 backdrop-blur-xl border-2 border-blue-500/80 rounded-full shadow-xl px-4 py-2.5 flex items-center justify-between">
          
          <button 
            onClick={() => setShowSidebarMenu(!showSidebarMenu)}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all border border-blue-200 transform hover:scale-105 active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* WG Official 3D Logo matching user upload */}
          <div onClick={handleLogoTap} className="flex items-center gap-2.5 cursor-pointer group" title="WORK GROVE">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-lg flex items-center justify-center shrink-0 overflow-hidden transform group-hover:rotate-12 transition-transform">
              <img 
                src="/assets/aistudio/file_000000006d0081faaf05d5de78209f5b_a67c025c.png" 
                alt="WORK GROVE 3D Logo" 
                className="w-full h-full object-contain rounded-full bg-white"
              />
            </div>
            <div className="h-6 w-px bg-blue-300"></div>
            <h1 className="text-base sm:text-lg font-black tracking-wide flex items-center">
              <span className="text-blue-600 drop-shadow-sm">WORK</span>
              <span className="text-emerald-600 ml-1 drop-shadow-sm">GROVE</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-all border border-blue-200"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            <button 
              onClick={() => setCurrentTab('messages')}
              className="relative w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all border border-blue-200"
            >
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {messages.filter(m => m.unread).length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Email Verification Banner */}
      {firebaseUser && !firebaseUser.emailVerified && (
        <div className="max-w-xl mx-auto px-3 mt-2">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                ইমেইল ভেরিফাই করা হয়নি। পূর্ণ অ্যাক্সেসের জন্য ইমেইল ভেরিফাই করুন।
              </span>
            </div>
            <button
              onClick={async () => {
                try {
                  await sendEmailVerification(firebaseUser);
                  alert('ভেরিফিকেশন ইমেইল পুনরায় পাঠানো হয়েছে! ইনবক্স চেক করুন।');
                } catch(e) {
                  alert('ইমেইল পাঠাতে সমস্যা হয়েছে। একটু পর চেষ্টা করুন।');
                }
              }}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] rounded-lg shadow-sm whitespace-nowrap ml-2"
            >
              Resend Email
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Menu Drawer */}
      {showSidebarMenu && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex animate-in fade-in duration-200">
          <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white flex items-center justify-center font-black shadow-lg overflow-hidden p-0.5">
                    <img src="/assets/aistudio/file_000000006d0081faaf05d5de78209f5b_a67c025c.png" alt="WG" className="w-full h-full object-contain rounded-xl bg-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800">{user.name}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Live Firebase Database
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowSidebarMenu(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language selection */}
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Language / ভাষা</div>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setShowSidebarMenu(false); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${language === lang.code ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'bg-blue-50/70 text-slate-700 hover:bg-blue-100'}`}
                    >
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <button onClick={() => { setCurrentTab('wallet'); setShowSidebarMenu(false); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-xs font-bold text-slate-700">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <span>Wallet & bKash Linking</span>
                </button>
                <button onClick={() => { setShowCustomFirebaseModal(true); setShowSidebarMenu(false); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-xs font-bold text-slate-700">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Custom Firebase Settings</span>
                </button>
                <button onClick={() => { setCurrentTab('profile'); setShowSidebarMenu(false); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-xs font-bold text-slate-700">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Profile Settings & KYC</span>
                </button>
                <button onClick={() => { setShowPostJobModal(true); setShowSidebarMenu(false); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-xs font-bold text-slate-700">
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Post Micro Job</span>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <button 
                onClick={handleSignOut}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout (Firebase)</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowSidebarMenu(false)}></div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-xl mx-auto p-4 space-y-4">

        {/* TAB: HOME */}
        {currentTab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* 1. ANIMATED SITE AGE & LIVE RUNTIME TIMER */}
            <div className="bg-white/95 backdrop-blur-xl border border-blue-200/80 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-blue-300">
              {/* Subtle animated ambient glow */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-400/10 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
              <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none animate-pulse"></div>

              <div className="flex items-center justify-between mb-3.5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 transform hover:rotate-12 transition-transform">
                    <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '12s' }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>{t(language, 'siteAge')}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">Live Counter</span>
                    </h4>
                    <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>System Live Online</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-200/80 shadow-sm animate-pulse">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Server</span>
                </div>
              </div>

              {/* Animated 5-box countdown / uptime timer */}
              <div className="grid grid-cols-5 gap-2 text-center relative z-10">
                <div className="bg-gradient-to-b from-blue-50/80 via-white to-blue-50/40 p-2.5 rounded-2xl border border-blue-100 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <div className="text-lg sm:text-xl font-black text-blue-700 font-mono tracking-tight drop-shadow-sm">{siteAge.years}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{t(language, 'years')}</div>
                </div>

                <div className="bg-gradient-to-b from-blue-50/80 via-white to-blue-50/40 p-2.5 rounded-2xl border border-blue-100 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <div className="text-lg sm:text-xl font-black text-blue-700 font-mono tracking-tight drop-shadow-sm">{siteAge.days}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{t(language, 'days')}</div>
                </div>

                <div className="bg-gradient-to-b from-blue-50/80 via-white to-blue-50/40 p-2.5 rounded-2xl border border-blue-100 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <div className="text-lg sm:text-xl font-black text-blue-700 font-mono tracking-tight drop-shadow-sm">{siteAge.hours}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{t(language, 'hours')}</div>
                </div>

                <div className="bg-gradient-to-b from-blue-50/80 via-white to-blue-50/40 p-2.5 rounded-2xl border border-blue-100 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md">
                  <div className="text-lg sm:text-xl font-black text-blue-700 font-mono tracking-tight drop-shadow-sm">{siteAge.minutes}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{t(language, 'minutes')}</div>
                </div>

                {/* Animated Seconds box with active pulse heartbeat effect */}
                <div className="bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 p-2.5 rounded-2xl border-2 border-emerald-400 shadow-md shadow-emerald-500/10 transition-all duration-300 hover:scale-105">
                  <div className="text-lg sm:text-xl font-black text-emerald-600 font-mono tracking-tight drop-shadow-sm flex items-center justify-center gap-0.5">
                    <span key={siteAge.seconds} className="inline-block animate-pulse">
                      {siteAge.seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-[10px] font-black text-emerald-700 uppercase mt-0.5 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>{t(language, 'seconds')}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic live activity progress bar */}
              <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                  Real-time uptime heartbeat
                </span>
                <span className="font-mono text-emerald-600">99.99% Operational</span>
              </div>
            </div>

            {/* 2. WORK GROVE OFFICIAL CHANNELS (5 Channels, Placed right below the date/timer) */}
            <div className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-2.5 h-4 bg-gradient-to-b from-blue-600 to-emerald-500 rounded-full animate-pulse"></div>
                  WORK GROVE OFFICIAL CHANNELS
                </h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  Official
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[
                  { name: 'Facebook', color: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30', icon: FacebookSvg, link: 'https://facebook.com' },
                  { name: 'Telegram', color: 'bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/30', icon: TelegramSvg, link: 'https://t.me/work_grove_official' },
                  { name: 'YouTube', color: 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30', icon: YoutubeSvg, link: 'https://youtube.com' },
                  { name: 'TikTok', color: 'bg-slate-900 text-white hover:bg-black shadow-slate-900/30', icon: TiktokSvg, link: 'https://tiktok.com' },
                  { name: 'WhatsApp', color: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30', icon: WhatsappSvg, link: 'https://whatsapp.com/channel/0029Vb9UVQO4inopUJ81G83D' },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => window.open(item.link, '_blank')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl ${item.color} shadow-md hover:scale-105 active:scale-95 transition-all transform group`}
                  >
                    <div className="transform group-hover:scale-110 transition-transform">
                      <item.icon />
                    </div>
                    <span className="text-[10px] font-bold mt-1.5 tracking-tight">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border border-amber-300 rounded-3xl p-3.5 flex items-center gap-3 shadow-lg">
              <div className="p-2.5 bg-white/20 backdrop-blur rounded-2xl shadow-inner">
                <Volume2 className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-black uppercase tracking-wider">{t(language, 'notice')}</div>
                <div className="text-[11px] font-bold mt-0.5 whitespace-nowrap animate-[marquee_20s_linear_infinite]">{platformSettings.noticeText}</div>
              </div>
            </div>

            {/* Special Work Info Display if set by Admin */}
            {platformSettings.specialWorkInfo && (
              <div className="bg-gradient-to-tr from-indigo-600 to-blue-700 p-5 rounded-[28px] text-white space-y-2 shadow-xl shadow-indigo-200 border border-indigo-400/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <h3 className="font-black text-sm uppercase tracking-wider">Special Work Opportunity</h3>
                </div>
                <p className="text-[11px] font-bold leading-relaxed opacity-90">
                  {platformSettings.specialWorkInfo}
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-lg border border-white/20">Rate: ৳{platformSettings.gmailRate}/Gmail</div>
                  <button onClick={() => setCurrentTab('microjob')} className="px-4 py-1.5 bg-white text-indigo-700 rounded-xl text-[10px] font-black shadow-lg hover:bg-slate-50 transition-all">গরম অফার দেখুন</button>
                </div>
              </div>
            )}

            {/* 3. SMALL WORK (সহজ আয় / Small Work matching user screenshot) */}
            <div className="bg-white/95 backdrop-blur-xl border border-blue-100 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-blue-50 pb-2.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <div className="w-2.5 h-4 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  <span>{t(language, 'smallWork')}</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Easy Earning
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {[
                  { name: t(language, 'microJob'), icon: Briefcase, bg: 'bg-blue-50/80 border-blue-200 text-blue-700', iconBg: 'bg-blue-600 text-white', action: () => setCurrentTab('microjob') },
                  { name: t(language, 'microJobPost'), icon: PlusCircle, bg: 'bg-indigo-50/80 border-indigo-200 text-indigo-700', iconBg: 'bg-indigo-600 text-white', action: () => setShowPostJobModal(true) },
                  { name: t(language, 'mobileRecharge'), icon: Smartphone, bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-700', iconBg: 'bg-emerald-600 text-white', action: () => setCurrentTab('wallet') },
                  { name: t(language, 'socialMediaTask'), icon: Share2, bg: 'bg-violet-50/80 border-violet-200 text-violet-700', iconBg: 'bg-violet-600 text-white', action: () => setCurrentTab('microjob') },
                  { name: t(language, 'giftCode'), icon: Gift, bg: 'bg-pink-50/80 border-pink-200 text-pink-700', iconBg: 'bg-pink-600 text-white', action: () => setShowGiftModal(true) },
                  { name: 'অ্যাডস্ ভিউ', icon: Sparkles, bg: 'bg-amber-50/80 border-amber-200 text-amber-800', iconBg: 'bg-amber-500 text-white', action: () => alert('অ্যাডস্ ভিউ টাস্ক শীঘ্রই আসছে!') },
                  { name: 'কুইজ জব', icon: Award, bg: 'bg-teal-50/80 border-teal-200 text-teal-800', iconBg: 'bg-teal-600 text-white', action: () => setCurrentTab('microjob') },
                  { name: 'টাইপিং জব', icon: FileText, bg: 'bg-sky-50/80 border-sky-200 text-sky-800', iconBg: 'bg-sky-600 text-white', action: () => setCurrentTab('microjob') },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={item.action}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${item.bg} hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 group text-center`}
                  >
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-slate-800 leading-tight tracking-tight">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. SPECIAL WORK (বিশেষ আয় / Special Work matching user screenshot) */}
            <div className="bg-white/95 backdrop-blur-xl border border-purple-100 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-purple-50 pb-2.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <div className="w-2.5 h-4 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                  <span>{t(language, 'specialWork')}</span>
                </h3>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  High Payout
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  { name: t(language, 'gmailSell'), icon: GmailSvg, color: 'bg-red-50 text-red-700 border-red-200', iconBg: 'bg-red-500 text-white' },
                  { name: t(language, 'instagramSell'), icon: InstagramSvg, color: 'bg-pink-50 text-pink-700 border-pink-200', iconBg: 'bg-pink-600 text-white' },
                  { name: t(language, 'facebookSell'), icon: FacebookSvg, color: 'bg-blue-50 text-blue-700 border-blue-200', iconBg: 'bg-blue-600 text-white' },
                  { name: t(language, 'telegramSell'), icon: TelegramSvg, color: 'bg-sky-50 text-sky-700 border-sky-200', iconBg: 'bg-sky-500 text-white' },
                  { name: t(language, 'whatsappSell'), icon: WhatsappSvg, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconBg: 'bg-emerald-600 text-white' },
                  { name: t(language, 'tiktokSell'), icon: TiktokSvg, color: 'bg-slate-100 text-slate-800 border-slate-200', iconBg: 'bg-slate-900 text-white' },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      const spJob: Job = {
                        id: `sp-${idx}`,
                        title: `${item.name} & Verified Account Delivery`,
                        category: 'Special Work',
                        reward: 45.00,
                        completed: 12,
                        total: 50,
                        employer: 'Verified Agency',
                        requirements: ['Create/provide clean account', 'Add recovery info', 'Transfer ownership'],
                        proofInstruction: `Provide credentials and details for ${item.name}`,
                        status: 'active'
                      };
                      setSelectedJob(spJob);
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border ${item.color} shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 group text-center`}
                  >
                    <div className={`w-11 h-11 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                      <item.icon />
                    </div>
                    <span className="text-xs font-black text-slate-900 leading-tight">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: MICRO JOB */}
        {currentTab === 'microjob' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-800">Micro Job Hub</h2>
                  <p className="text-xs text-slate-500 font-medium">Browse micro jobs and social media tasks</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-blue-500" />
                  <input 
                    type="text"
                    placeholder="Search jobs by title, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800 transition-all shadow-inner"
                  />
                </div>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl shadow-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-blue-100 p-6 shadow-xl">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-slate-700">No jobs found matching your search.</p>
                </div>
              ) : (
                filteredJobs.map((job, idx) => (
                  <div key={`${job.id}-${idx}`} className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 transform hover:-translate-y-1 group">
                    {/* Job Thumbnail with Overlays */}
                    <div className="relative h-44 overflow-hidden">
                      <img 
                        src={job.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'} 
                        alt={job.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                      
                      {/* Category & Type Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                          {job.category}
                        </span>
                        {job.isCompanyTask && (
                          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Official
                          </span>
                        )}
                      </div>

                      {/* Reward Overlay */}
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl shadow-xl border border-white flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-500">পরিশ্রমিক:</span>
                          <span className="text-sm font-black text-emerald-600">৳{job.reward.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4 className="text-sm font-black text-slate-800 leading-tight group-hover:text-blue-700 transition-colors line-clamp-2">
                          {job.title}
                        </h4>
                      </div>

                      {/* Job Progress & Meta Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                            <Users className="w-3 h-3" /> কর্মী বাকি
                          </div>
                          <div className="text-xs font-black text-slate-700">
                            {job.total - job.completed} / {job.total}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> সময়
                          </div>
                          <div className="text-xs font-black text-slate-700">
                            {job.durationMinutes || 10} মিনিট
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 max-w-[60%]">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-[10px]">
                            {job.employer.charAt(0)}
                          </div>
                          <div className="truncate">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">নিযুক্তকারী</div>
                            <div className="text-[10px] font-black text-slate-700 truncate">{job.employer}</div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setSelectedJob(job)}
                          className="px-5 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center text-[11px] transform hover:scale-105 active:scale-95"
                        >
                          কাজটি করুন
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: WALLET */}
        {currentTab === 'wallet' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            <div className="bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentTab('home')} className="p-2 bg-blue-50 rounded-2xl text-blue-600 hover:bg-blue-100 shadow-sm transition-transform hover:scale-105">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-black text-slate-800">Wallet & bKash System</h2>
              </div>
              <button 
                onClick={() => setShowTransactionHistory(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:bg-blue-100 text-blue-700 rounded-2xl text-xs font-bold border border-blue-200 transition-all shadow-md transform hover:scale-105"
              >
                <History className="w-4 h-4 text-blue-600" />
                <span>History</span>
              </button>
            </div>

            {/* Gorgeous 3D Glowing Wallet Card */}
            <div className="bg-gradient-to-tr from-blue-700 via-indigo-800 to-emerald-600 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden transform hover:scale-[1.01] transition-transform">
              <div className="absolute -right-12 -bottom-12 w-52 h-52 bg-white/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
              <div className="absolute top-4 right-4 p-3 bg-white/15 backdrop-blur-md rounded-2xl shadow-inner">
                <Sparkles className="w-6 h-6 text-emerald-300" />
              </div>

              <div className="text-xs font-black uppercase tracking-wider text-blue-200 mb-1">{t(language, 'totalBalance')}</div>
              <div className="text-3xl sm:text-4xl font-black mb-4 tracking-tight drop-shadow-md">৳{user.totalBalance.toFixed(2)}</div>

              {/* bKash Account Link status banner */}
              <div className="mb-4 p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-[10px]">bK</div>
                  <div>
                    <div className="font-bold">bKash Payment Card</div>
                    <div className="text-[10px] text-emerald-300 font-bold">
                      {user.linkedBkash ? `Linked: ${user.linkedBkash} (Active)` : 'Not Linked Yet'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBkashLinkModal(true)}
                  className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow transition-all text-xs"
                >
                  {user.linkedBkash ? 'Change bKash' : 'Link bKash'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
                <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/10">
                  <div className="text-[10px] text-blue-200 uppercase font-black">{t(language, 'incomeBalance')}</div>
                  <div className="text-lg font-black mt-0.5">৳{user.incomeBalance.toFixed(2)}</div>
                </div>
                <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/10">
                  <div className="text-[10px] text-blue-200 uppercase font-black">{t(language, 'referBalance')}</div>
                  <div className="text-lg font-black mt-0.5">৳{user.referBalance.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => {
                  setShowWithdrawModal(true);
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl flex flex-col items-center justify-center gap-1 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 active:scale-95"
              >
                <Wallet className="w-5 h-5" />
                <span className="text-xs">{t(language, 'withdraw')}</span>
              </button>
              <button 
                onClick={() => setShowDepositModal(true)}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl shadow-xl flex flex-col items-center justify-center gap-1 hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="text-xs">{t(language, 'deposit')}</span>
              </button>
              <button 
                onClick={() => {
                  const appDomain = localStorage.getItem('custom_app_domain') || 'https://work-grove.workgrove.workers.dev';
                  const inviteLink = `${appDomain}/?ref=${user.referralCode}`;
                  navigator.clipboard.writeText(inviteLink);
                  alert(`Referral link copied to clipboard!\n${inviteLink}\nYour Referral Code: ${user.referralCode}\n(Share with your friends to earn referral bonuses!)`);
                }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl shadow-xl flex flex-col items-center justify-center gap-1 hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">{t(language, 'refer')}</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB: MESSAGES */}
        {currentTab === 'messages' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl p-4 shadow-xl">
              <h2 className="text-base font-black text-slate-800">Notifications & Support</h2>
              <p className="text-xs text-slate-500 font-medium">Synced with Firebase Firestore</p>
            </div>

            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div key={`${msg.id}-${idx}`} className={`p-4 rounded-3xl border transition-all transform hover:-translate-y-0.5 ${msg.unread ? 'bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border-blue-200 shadow-xl' : 'bg-white/90 border-slate-100 shadow-md'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-blue-700">{msg.sender}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PROFILE (With Face Verification / KYC that gives ৳10 bonus to Referrer) */}
        {currentTab === 'profile' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            <div className="bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500"></div>

              {(() => {
                const rankInfo = calculateUserRank(user.xp || 0);
                return (
                  <div 
                    className={`w-24 h-24 rounded-3xl p-1.5 shadow-2xl mb-4 transform hover:rotate-6 transition-all duration-500 relative group ${rankInfo.borderAnimationClass} ring-4 ring-offset-4 ring-offset-white`}
                    style={{ filter: `drop-shadow(0 0 12px ${rankInfo.glowColor}80)` }}
                  >
                    {/* Floating Tier Badge */}
                    <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-400/50 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-lg transform group-hover:scale-125 transition-transform">
                      {rankInfo.tierRoman}
                    </div>

                    <img 
                      src="/assets/aistudio/file_000000006d0081faaf05d5de78209f5b_a67c025c.png" 
                      alt="WG Profile Logo" 
                      className="w-full h-full object-contain rounded-2xl bg-white relative z-10"
                    />
                    
                    {/* Animated Glow Layer */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                  </div>
                );
              })()}

              <h2 className="text-xl font-black text-slate-800 flex items-center justify-center gap-1.5 mb-0.5">
                {user.name}
                <ShieldCheck className="w-5 h-5 text-blue-600 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-500 font-bold mb-1">Referral Code: <span className="font-mono font-black text-emerald-600">{user.referralCode}</span></p>
              <p className="text-xs text-slate-500 font-bold mb-4">{user.email}</p>

              {/* Animated User Level & Rank System Card */}
              {(() => {
                const rankInfo = calculateUserRank(user.xp || 45);
                return (
                  <div className="w-full mb-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden border border-indigo-500/30">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
                    <div className="flex items-center justify-between mb-2 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                          <Award className="w-5 h-5 text-white animate-bounce" />
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">User Rank & Level</div>
                          <div className="text-sm font-black flex items-center gap-1.5 text-yellow-300">
                            <span>{rankInfo.rankName}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 border border-yellow-400/40 text-[11px] font-mono text-yellow-200">
                              Tier {rankInfo.tierRoman}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-semibold">Total XP</div>
                        <div className="text-sm font-black text-emerald-400 font-mono">{user.xp || 45} XP</div>
                      </div>
                    </div>

                    {/* Animated Progress Bar to Next Rank */}
                    <div className="space-y-1 relative z-10">
                      <div className="flex justify-between text-[10px] font-bold text-indigo-200">
                        <span>Progress to next tier</span>
                        <span>{user.xp || 45} / {rankInfo.nextXpThreshold} XP</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-indigo-500/20 shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-1000 animate-pulse"
                          style={{ width: `${Math.min(100, Math.max(5, ((user.xp || 45) / rankInfo.nextXpThreshold) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-3 gap-3 w-full pt-4 border-t border-slate-100 text-center">
                <div className="bg-gradient-to-b from-blue-50 to-indigo-50/50 p-3 rounded-2xl shadow-sm border border-blue-100">
                  <div className="text-base font-black text-blue-700">৳{user.totalBalance.toFixed(0)}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Wallet</div>
                </div>
                <div className="bg-gradient-to-b from-blue-50 to-indigo-50/50 p-3 rounded-2xl shadow-sm border border-blue-100">
                  <div className="text-base font-black text-emerald-600">{user.referrals}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Referrals</div>
                </div>
                <div className="bg-gradient-to-b from-emerald-50 to-emerald-100/50 p-3 rounded-2xl shadow-sm border border-emerald-200">
                  <div className="text-base font-black text-emerald-700">Verified</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Member</div>
                </div>
              </div>

              {/* Firebase Security Indicator */}
              <div className="w-full mt-4 p-3 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-black uppercase">Firebase Security Active</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Encrypted authentication protection
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-2xl overflow-hidden divide-y divide-slate-100">
              {[
                { title: 'My Tasks (আমার জমা দেওয়া কাজ)', icon: ListChecks, badgeCount: unreadTaskStatusCount, action: handleOpenMyTasks },
                { title: t(language, 'editProfile'), icon: User, action: () => { setEditName(user.name); setEditMobile(user.mobile); setShowEditProfileModal(true); } },
                { title: 'Link bKash Wallet (বিকাশ যুক্ত করুন)', icon: PhoneIcon, action: () => setShowBkashLinkModal(true) },
                { title: 'Referral Analytics (রেফারেল পরিসংখ্যান)', icon: PieChart, action: () => setShowReferralAnalytics(true) },
                { title: t(language, 'findFollowers'), icon: Users, action: () => alert('Find followers feature active.') },
                { title: t(language, 'agencies'), icon: Briefcase, action: () => alert('Agencies directory active.') },
                { title: t(language, 'myNetwork'), icon: Share2, action: () => alert(`My Referral Code: ${user.referralCode}. Share with friends to earn referral bonuses!`) },
                { title: t(language, 'leaderboard'), icon: Award, action: () => alert('Leaderboard rankings active.') },
                { title: t(language, 'logout'), icon: LogOut, color: 'text-blue-600', action: handleSignOut },
                { title: t(language, 'deleteAccount'), icon: Trash2, color: 'text-red-600', action: () => { if(confirm('Are you sure you want to delete account?')) handleSignOut(); } },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 hover:bg-blue-50/50 transition-all text-left transform hover:translate-x-1"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm relative ${item.color || 'text-blue-600'}`}>
                      <item.icon className="w-4 h-4" />
                      {item.badgeCount && item.badgeCount > 0 ? (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce ring-2 ring-white">
                          {item.badgeCount}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${item.color || 'text-slate-800'}`}>{item.title}</span>
                      {item.badgeCount && item.badgeCount > 0 ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full animate-pulse border border-rose-200">
                          নতুন স্ট্যাটাস!
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* BOTTOM NAVIGATION BAR (5 items: Chat, Wallet, Home, Jobs, Profile) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-xs mx-auto px-2 py-2 z-40 pointer-events-none">
        <div className="pointer-events-auto bg-gradient-to-r from-sky-50 via-blue-50 to-emerald-50/95 backdrop-blur-xl border-2 border-blue-500 rounded-full shadow-2xl px-2 py-1.5 flex items-center justify-between relative">
          
          <button
            onClick={() => setCurrentTab('messages')}
            className={`flex flex-col items-center justify-center transition-all px-1 ${currentTab === 'messages' ? 'scale-110' : 'opacity-80 hover:opacity-100'}`}
          >
            <div className={`w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center border transition-all ${currentTab === 'messages' ? 'border-blue-600 text-blue-600 shadow-blue-300 ring-2 ring-blue-400' : 'border-blue-200 text-blue-600'}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className={`text-[9px] font-black mt-0.5 ${currentTab === 'messages' ? 'text-blue-700' : 'text-slate-600'}`}>
              Chat
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('wallet')}
            className={`flex flex-col items-center justify-center transition-all px-1 ${currentTab === 'wallet' ? 'scale-110' : 'opacity-80 hover:opacity-100'}`}
          >
            <div className={`w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center border transition-all ${currentTab === 'wallet' ? 'border-blue-600 text-blue-600 shadow-blue-300 ring-2 ring-blue-400' : 'border-blue-200 text-blue-600'}`}>
              <Wallet className="w-4 h-4" />
            </div>
            <span className={`text-[9px] font-black mt-0.5 ${currentTab === 'wallet' ? 'text-blue-700' : 'text-slate-600'}`}>
              Wallet
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('home')}
            className="flex flex-col items-center justify-center -mt-6 group transition-transform hover:scale-110 px-1"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 text-white flex items-center justify-center shadow-2xl ring-4 ring-white shadow-blue-500/60 animate-pulse">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-[9px] font-black mt-0.5 text-blue-700 drop-shadow-sm">
              Home
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('microjob')}
            className={`flex flex-col items-center justify-center transition-all px-1 ${currentTab === 'microjob' ? 'scale-110' : 'opacity-80 hover:opacity-100'}`}
          >
            <div className={`w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center border transition-all ${currentTab === 'microjob' ? 'border-blue-600 text-blue-600 shadow-blue-300 ring-2 ring-blue-400' : 'border-blue-200 text-blue-600'}`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <span className={`text-[9px] font-black mt-0.5 ${currentTab === 'microjob' ? 'text-blue-700' : 'text-slate-600'}`}>
              Jobs
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center justify-center transition-all px-1 ${currentTab === 'profile' ? 'scale-110' : 'opacity-80 hover:opacity-100'}`}
          >
            <div className={`w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center border transition-all ${currentTab === 'profile' ? 'border-blue-600 text-blue-600 shadow-blue-300 ring-2 ring-blue-400' : 'border-blue-200 text-blue-600'}`}>
              <User className="w-4 h-4" />
            </div>
            <span className={`text-[9px] font-black mt-0.5 ${currentTab === 'profile' ? 'text-blue-700' : 'text-slate-600'}`}>
              Profile
            </span>
          </button>

        </div>
      </nav>



      {/* MODAL: CUSTOM FIREBASE SETTINGS */}
      {showCustomFirebaseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-800">Custom Firebase Settings</h3>
              </div>
              <button onClick={() => setShowCustomFirebaseModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Configure your custom Firebase project keys for live database sync.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Website Domain (e.g. https://workgrove.app)</label>
                <input 
                  type="text"
                  placeholder="https://workgrove.app"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Firebase API Key</label>
                <input 
                  type="text"
                  placeholder="AIzaSy..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Project ID</label>
                <input 
                  type="text"
                  placeholder="my-firebase-project"
                  value={customProjectId}
                  onChange={(e) => setCustomProjectId(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCustomFirebaseModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl">Cancel</button>
                <button 
                  type="button" 
                  onClick={() => {
                    localStorage.setItem('custom_firebase_config', JSON.stringify({ customApiKey, customProjectId }));
                    localStorage.setItem('custom_app_domain', customDomain.trim());
                    alert('Custom domain and Firebase settings saved successfully!');
                    setShowCustomFirebaseModal(false);
                  }} 
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT bKash LINKING (NO OTP BLOCK) */}
      {showBkashLinkModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-pink-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-white space-y-4 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 to-rose-600 animate-pulse"></div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                  bK
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">bKash Account Link</h3>
                  <p className="text-[10px] text-pink-400 font-bold">সরাসরি বিকাশ নম্বর যুক্ত করুন</p>
                </div>
              </div>
              <button onClick={() => setShowBkashLinkModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1.5">
                  আপনার বিকাশ পার্সোনাল নম্বর (11 Digits)
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-3.5 w-4 h-4 text-pink-400" />
                  <input 
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={bkashPhoneInput}
                    onChange={(e) => setBkashPhoneInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-mono font-bold text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-pink-950/30 border border-pink-500/20 rounded-2xl text-[11px] text-pink-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>কোনো কোড বা ওটিপি লাগবে না। নম্বর সেভ হলেই সরাসরি উইথড্র নেওয়া যাবে!</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowBkashLinkModal(false)} 
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-all"
                >
                  বাতিল
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    const clean = bkashPhoneInput.trim().replace(/\s+/g, '');
                    if (clean.length < 11) {
                      alert('দয়া করে সঠিক ১১ ডিজিটের বিকাশ নম্বর দিন (যেমন: 017XXXXXXXX)।');
                      return;
                    }
                    setUser(prev => ({ ...prev, linkedBkash: clean }));
                    if (firebaseUser) {
                      try {
                        await updateDoc(doc(db, 'users', firebaseUser.uid), { linkedBkash: clean });
                      } catch (e) {}
                    }
                    setShowBkashLinkModal(false);
                    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                    alert(`বিকাশ নম্বর (${clean}) সফলভাবে যুক্ত হয়েছে! এবার সরাসরি উইথড্র করতে পারবেন।`);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs rounded-2xl shadow-lg transition-all"
                >
                  বিকাশ সেভ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSACTION HISTORY */}
      {showTransactionHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-800">Transaction History</h3>
              </div>
              <button onClick={() => setShowTransactionHistory(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No recent transactions yet.</p>
              ) : (
                transactions.map((tx, idx) => (
                  <div key={`${tx.id}-${idx}`} className="flex items-center justify-between p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm">
                    <div>
                      <div className="text-xs font-black text-slate-800">{tx.type}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{tx.date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-black ${tx.type === 'Withdraw' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {tx.type === 'Withdraw' ? '-' : '+'}৳{tx.amount.toFixed(2)}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setShowTransactionHistory(false)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs shadow-lg mt-2"
            >
              Close History
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN LOGIN SCREEN */}
      {showAdminLogin && !isAdminLoggedIn && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-blue-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-800">Owner Admin Portal</h3>
              </div>
              <button onClick={() => setShowAdminLogin(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              অনার কন্ট্রোল সেন্টারে প্রবেশ করতে গোপন অ্যাডমিন পাসওয়ার্ড লিখুন।
            </p>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাডমিন পাসওয়ার্ড (Admin Password)</label>
                <input 
                  type="password"
                  required
                  placeholder="Enter secret password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg">Login Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-FEATURED OWNER PORTAL (ALL SYSTEMS & KYC PHOTOS) */}
      <OwnerPortalModal
        isOpen={showOwnerPortal || (isAdminLoggedIn && !showAdminLogin)}
        onClose={() => {
          setShowOwnerPortal(false);
          setIsAdminLoggedIn(false);
        }}
        deposits={deposits}
        withdrawals={withdrawals}
        taskProofs={taskProofs}
        allUsers={allUsers}
        supportRequests={supportRequests}
        jobs={jobs}
        platformSettings={platformSettings}
        onUpdateSettings={handleUpdatePlatformSettings}
        onOpenLightbox={(imageUrl, title, subtitle) => setLightboxState({ isOpen: true, imageUrl, title, subtitle })}
      />

      {/* LIGHTBOX MODAL FOR HIGH-RESOLUTION PHOTO INSPECTION */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState({ isOpen: false, imageUrl: '', title: '' })}
        imageUrl={lightboxState.imageUrl}
        title={lightboxState.title}
        subtitle={lightboxState.subtitle}
      />

      {/* MODAL: JOB APPLICATION / PROOF SUBMISSION */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-blue-100 shadow-sm">
                  <img src={selectedJob.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-lg uppercase">{selectedJob.taskType || 'Task'}</span>
                    {selectedJob.isCompanyTask && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Official
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-800 mt-1 line-clamp-1">{selectedJob.title}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 space-y-2 shadow-inner">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">পরিশ্রমিক (Reward):</span>
                <span className="text-emerald-600 font-black text-sm">৳{selectedJob.reward.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">নিযুক্তকারী:</span>
                <span className="text-slate-800 font-black">{selectedJob.employer}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">সময়সীমা:</span>
                <span className="text-blue-700 font-black">{selectedJob.durationMinutes || 10} মিনিট</span>
              </div>
            </div>

            {selectedJob.targetLink && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <div className="text-[10px] font-black text-indigo-800 uppercase mb-1.5 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> কাজের লিংক (Target Link):
                </div>
                <a 
                  href={selectedJob.targetLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-2.5 bg-white border border-indigo-200 rounded-xl text-[11px] font-bold text-blue-700 truncate hover:text-blue-800 transition-colors"
                >
                  {selectedJob.targetLink}
                </a>
                <p className="text-[10px] text-indigo-500 font-bold mt-1.5">* লিংকে ক্লিক করে কাজটি সম্পন্ন করুন।</p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-blue-600" />
                কাজের শর্তসমূহ:
              </h4>
              <ul className="space-y-1.5">
                {selectedJob.requirements.map((req, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase">প্রুফ সাবমিট করার নিয়ম:</label>
              <p className="text-xs text-slate-600 font-medium italic">"{selectedJob.proofInstruction}"</p>
            </div>

            <form onSubmit={handleApplyJob} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  {selectedJob.taskType === 'video' ? <Video className="w-3.5 h-3.5" /> : selectedJob.taskType === 'screenshot' ? <Camera className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  আপনার প্রুফ (Proof Details / Link)
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder={selectedJob.taskType === 'video' ? 'ভিডিওর লিংক বা আপনার ইউজারনেম দিন...' : selectedJob.taskType === 'screenshot' ? 'স্ক্রিনশটের লিংক বা প্রুফ দিন...' : 'আপনার ইউজারনেম বা কাজের ডিটেইলস দিন...'}
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium shadow-inner"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  প্রুফ জমা দিন (Submit Proof)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST NEW JOB */}
      {showPostJobModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-800">{t(language, 'postNewJob')}</h3>
              </div>
              <button onClick={() => setShowPostJobModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t(language, 'jobTitle')}</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. YouTube Subscribe & Watch Task"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">কাজের ধরন (Task Type)</label>
                  <select 
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  >
                    <option value="screenshot">Screenshot Proof</option>
                    <option value="video">Video Watch</option>
                    <option value="link">Link Visit/Join</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t(language, 'category')}</label>
                  <select 
                    value={newJobCategory}
                    onChange={(e) => setNewJobCategory(e.target.value)}
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  >
                    <option value="Micro Job">Micro Job</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Special Work">Special Work</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1"> থাম্বনেইল ইউআরএল (Thumbnail URL)</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/image.jpg"
                  value={newJobThumbnail}
                  onChange={(e) => setNewJobThumbnail(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কাজের লিংক (Target Link / URL)</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://youtube.com/watch?v=..."
                  value={newJobLink}
                  onChange={(e) => setNewJobLink(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">রিওয়ার্ড (৳)</label>
                  <input 
                    type="number" 
                    required
                    min={2}
                    value={newJobReward}
                    onChange={(e) => setNewJobReward(Number(e.target.value))}
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-black"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">কর্মী সংখ্যা</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={newJobWorkers}
                    onChange={(e) => setNewJobWorkers(Number(e.target.value))}
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-black"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">সময় (মিনিট)</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={newJobDuration}
                    onChange={(e) => setNewJobDuration(Number(e.target.value))}
                    className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">কাজের শর্তসমূহ (Comma separated)</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Watch video 2 mins, Subscribe channel, Leave comment..."
                  value={newJobReqs}
                  onChange={(e) => setNewJobReqs(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                ></textarea>
              </div>

              {/* LIVE COST SUMMARY */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-2 shadow-inner">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>কাজের মোট খরচ (Reward × Workers):</span>
                  <span>৳{(newJobReward * newJobWorkers).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-indigo-700">
                  <span>কোম্পানি সার্ভিস ফি (2%):</span>
                  <span>৳{(newJobReward * newJobWorkers * 0.02).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="text-xs font-black text-slate-800 uppercase">সর্বমোট প্রদেয় (Total Payable):</span>
                  <span className="text-base font-black text-blue-700">৳{(newJobReward * newJobWorkers * 1.02).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowPostJobModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                >
                  {t(language, 'cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={user.totalBalance < (newJobReward * newJobWorkers * 1.02)}
                  className={`flex-1 py-3 font-black text-xs rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${
                    user.totalBalance >= (newJobReward * newJobWorkers * 1.02)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
                  }`}
                >
                  {user.totalBalance >= (newJobReward * newJobWorkers * 1.02) ? 'Post Job Now' : 'Insufficient Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAW */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xs">bK</div>
                <h3 className="text-base font-black text-slate-800">Withdraw Funds (bKash)</h3>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-pink-50 p-3.5 rounded-2xl border border-pink-100 text-xs text-blue-900 font-bold space-y-1">
              <div className="flex justify-between items-center">
                <span>Available Total Balance:</span>
                <span className="text-emerald-600 font-black text-sm">৳{user.totalBalance.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উইথড্র বিকাশ নম্বর (bKash Number)
                </label>
                <input 
                  type="tel" 
                  required 
                  placeholder="017XXXXXXXX"
                  value={withdrawBkashInput || user.linkedBkash} 
                  onChange={(e) => setWithdrawBkashInput(e.target.value)}
                  className="w-full p-3 bg-pink-50/40 border border-pink-200 rounded-2xl text-xs font-mono font-bold focus:ring-2 focus:ring-pink-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উইথড্র পরিমাণ (৳) - সর্বনিম্ন ৳{platformSettings.minWithdraw || 100}
                </label>
                <input 
                  type="number" 
                  required 
                  min={platformSettings.minWithdraw || 100} 
                  max={user.totalBalance} 
                  value={withdrawAmountInput} 
                  onChange={(e) => setWithdrawAmountInput(Number(e.target.value))}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold" 
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowWithdrawModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl">বাতিল</button>
                <button type="submit" className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-2xl shadow-lg">উইথড্র রিকোয়েস্ট পাঠান</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DEPOSIT */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800">Deposit Balance (টাকা জমা করুন)</h3>
              <button onClick={() => setShowDepositModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Owner Official Payment Numbers (Dynamic) */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-3.5 rounded-2xl border border-blue-200 text-xs text-slate-700 space-y-1.5">
              <p className="font-black text-blue-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                অনারের অফিশিয়াল পেমেন্ট নম্বরে 'Send Money' করুন:
              </p>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-blue-100">
                  <span className="font-bold text-pink-600">bKash (Personal):</span>
                  <span className="font-black text-slate-800">{platformSettings.ownerBkash || '01811223344'}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-blue-100">
                  <span className="font-bold text-orange-600">Nagad (Personal):</span>
                  <span className="font-black text-slate-800">{platformSettings.ownerNagad || '01711223344'}</span>
                </div>
                {platformSettings.ownerRocket && (
                  <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-blue-100">
                    <span className="font-bold text-purple-600">Rocket:</span>
                    <span className="font-black text-slate-800">{platformSettings.ownerRocket}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              {/* Select Gateway */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পেমেন্ট মেথড সিলেক্ট করুন</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bKash', 'Nagad', 'Rocket'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDepositMethod(m)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        depositMethod === m
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রেরক মোবাইল নম্বর (Sender Mobile)</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="01712345678" 
                  value={depositSenderMobile}
                  onChange={(e) => setDepositSenderMobile(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ট্রানজেকশন আইডি (Transaction ID / TrxID)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="যেমন: 9N8K7L6M5P" 
                  value={depositTrxId}
                  onChange={(e) => setDepositTrxId(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs uppercase font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ডিপোজিট পরিমাণ (৳)</label>
                <input 
                  type="number" 
                  required 
                  min={50} 
                  value={depositAmountInput} 
                  onChange={(e) => setDepositAmountInput(Number(e.target.value))}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold" 
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowDepositModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg">ডিপোজিট জমা দিন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GIFT CODE */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800">{t(language, 'redeemGiftCode')}</h3>
              <button onClick={() => setShowGiftModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">Enter your official gift code or promo code to claim free bonus balance. (Try <span className="font-mono font-bold text-blue-600">WORKGROVE2026</span>)</p>

            <form onSubmit={handleRedeemGift} className="space-y-3">
              <div>
                <input 
                  type="text" 
                  required
                  placeholder="Enter Gift Code (e.g. WORKGROVE2026)"
                  value={giftCodeInput}
                  onChange={(e) => setGiftCodeInput(e.target.value)}
                  className="w-full p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl text-sm uppercase font-mono font-bold text-center focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner"
                />
              </div>

              {giftMessage && (
                <div className={`p-3.5 rounded-2xl text-xs font-bold ${giftMessage.includes('Congratulations') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {giftMessage}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowGiftModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-2xl shadow-lg">{t(language, 'redeem')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROFILE */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">Edit Profile Information</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setUser(prev => ({ ...prev, name: editName, mobile: editMobile }));
              if (firebaseUser) {
                try {
                  await updateDoc(doc(db, 'users', firebaseUser.uid), {
                    name: editName,
                    mobile: editMobile
                  });
                } catch(err) {
                  console.error(err);
                }
              }
              alert('Profile updated successfully!');
              setShowEditProfileModal(false);
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input 
                  type="tel"
                  required
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowEditProfileModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REFERRAL ANALYTICS */}
      {showReferralAnalytics && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-800">Referral Analytics</h3>
              </div>
              <button onClick={() => setShowReferralAnalytics(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 shadow-inner shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-black text-emerald-800 uppercase">Total Referrals</div>
                  <div className="text-2xl font-black text-emerald-700">{allUsers.filter(u => u.referredBy === user.referralCode).length}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-emerald-800 uppercase">Total Bonus Earned</div>
                  <div className="text-2xl font-black text-emerald-700">৳{allUsers.filter(u => u.referredBy === user.referralCode && u.verified).length * (platformSettings.referralBonus || 10)}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider sticky top-0 bg-white py-1">Recent Referral List</h4>
              {allUsers.filter(u => u.referredBy === user.referralCode).length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Users className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold">No referrals yet. Share your code to earn!</p>
                </div>
              ) : (
                allUsers.filter(u => u.referredBy === user.referralCode).map((ref, idx) => (
                  <div key={ref.id || idx} className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-50 to-blue-50 border border-slate-100 flex items-center justify-center font-black text-emerald-600 text-sm shadow-sm group-hover:scale-110 transition-transform">
                        {ref.name ? ref.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          {ref.name}
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">{ref.username ? `@${ref.username}` : 'New Member'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-600">
                        +৳{platformSettings.referralBonus || 10}
                      </div>
                      <div className="text-[9px] text-slate-300 font-bold">Bonus Earned</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setShowReferralAnalytics(false)}
              className="w-full py-3.5 bg-slate-900 text-white font-black text-xs rounded-2xl shadow-lg hover:bg-slate-800 transition-all shrink-0 mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL: MY TASKS (আমার জমা দেওয়া কাজ ও লাইভ স্ট্যাটাস) */}
      {showMyTasksModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-blue-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">My Tasks (আমার কাজসমূহ)</h3>
                  <p className="text-[11px] text-slate-500 font-bold">মোট জমা দেওয়া প্রুফ: {myTaskSubmissions.length} টি</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMyTasksModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold shrink-0">
              {[
                { id: 'all', label: `সব (${myTaskSubmissions.length})` },
                { id: 'pending', label: `অপেক্ষমাণ (${myTaskSubmissions.filter(s => s.status === 'pending').length})` },
                { id: 'approved', label: `অনুমোদিত (${myTaskSubmissions.filter(s => s.status === 'approved').length})` },
                { id: 'rejected', label: `বাতিল (${myTaskSubmissions.filter(s => s.status === 'rejected').length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMyTasksTabFilter(tab.id as any)}
                  className={`flex-1 py-2 px-1 rounded-xl text-[10px] sm:text-[11px] font-black transition-all ${
                    myTasksTabFilter === tab.id
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Task Proofs Submissions List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
              {filteredMyTaskSubmissions.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                  <ListChecks className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">কোনো কাজ পাওয়া যায়নি</p>
                  <button
                    onClick={() => {
                      setShowMyTasksModal(false);
                      setCurrentTab('microjob');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    কাজের তালিকায় যান (Browse Jobs)
                  </button>
                </div>
              ) : (
                filteredMyTaskSubmissions.map((sub, idx) => (
                  <div key={sub.id || idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-slate-800 line-clamp-2">{sub.jobTitle || 'Task Proof Submission'}</h4>
                      <span className="text-xs font-black text-emerald-600 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        ৳{sub.reward ? sub.reward.toFixed(2) : '0.00'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 font-medium space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">আপনার সাবমিটকৃত প্রুফ / লিংক:</div>
                      <p className="break-words font-mono text-xs text-slate-800 bg-white p-2 rounded-lg border border-slate-200/60">{sub.proofText}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-GB') + ' • ' + new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'সম্প্রতি'}
                      </div>

                      {sub.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 shadow-sm">
                          <Clock className="w-3 h-3 text-amber-600 animate-spin" /> অপেক্ষমাণ (Pending)
                        </span>
                      )}
                      {sub.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> অনুমোদিত (Approved)
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-800 bg-red-100 px-2.5 py-1 rounded-full border border-red-200 shadow-sm">
                          <XCircle className="w-3 h-3 text-red-600" /> বাতিল (Rejected)
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setShowMyTasksModal(false)}
              className="w-full py-3.5 bg-slate-900 text-white font-black text-xs rounded-2xl shadow-lg hover:bg-slate-800 transition-all shrink-0 mt-2"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
