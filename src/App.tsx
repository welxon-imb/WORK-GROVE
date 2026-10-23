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
  PieChart, BarChart, ListChecks, Video
} from 'lucide-react';
import { LANGUAGES, LanguageCode, t } from './i18n';
import { 
  auth, db, testConnection, handleFirestoreError, OperationType 
} from './firebase';
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser, updateProfile 
} from 'firebase/auth';
import { 
  collection, doc, getDoc, setDoc, updateDoc, addDoc, onSnapshot, query, where, orderBy, deleteDoc, getDocs 
} from 'firebase/firestore';
import { FaceBirthKycModal } from './components/FaceBirthKycModal';
import { calculateUserRank } from './utils/userLevelUtils';
import { 
  OwnerPortalModal, 
  KycSubmission, 
  DepositRequest, 
  WithdrawalRequest, 
  TaskProofSubmission, 
  PlatformUser, 
  PlatformSettings 
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
  const [currentTab, setCurrentTab] = useState<'home' | 'wallet' | 'messages' | 'microjob' | 'profile'>('home');
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [authErrorText, setAuthErrorText] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('bn');
  const [showSidebarMenu, setShowSidebarMenu] = useState<boolean>(false);

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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');

  // User Profile State (New accounts start at 0.00 balance until earned/deposited or bonus added)
  const [user, setUser] = useState({
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
    kycStatus: 'approved' as 'unsubmitted' | 'pending' | 'approved' | 'rejected',
    kycRejectionReason: '',
    facePhoto: '',
    birthCertPhoto: '',
    birthCertNumber: '',
    premium: false,
    linkedBkash: '',
    referralCode: 'WG' + Math.floor(1000 + Math.random() * 9000),
    referredBy: '',
    xp: 0, // Starts at Tier V!
    isCompanyStaff: false
  });

  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editMobile, setEditMobile] = useState<string>('');
  const [editAvatar, setEditAvatar] = useState<string>('');

  // Withdraw bKash target number input
  const [withdrawBkashInput, setWithdrawBkashInput] = useState<string>('');

  // Face Verification & Birth Certificate Modal State
  const [showFaceVerifyModal, setShowFaceVerifyModal] = useState<boolean>(false);

  // Owner Portal & System Handler States
  const [showOwnerPortal, setShowOwnerPortal] = useState<boolean>(false);
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([]);
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
      companyRevenue: 0
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

  // Auth Form Inputs (Upwork / Fiverr styled Next-Gen UI)
  const [authEmailOrMobile, setAuthEmailOrMobile] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authFullName, setAuthFullName] = useState<string>('');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [authMobileNumber, setAuthMobileNumber] = useState<string>('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState<string>('');
  const [authReferralInput, setAuthReferralInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  // Jobs State with Firestore Realtime Sync
  const [jobs, setJobs] = useState<Job[]>(DEFAULT_JOBS);

  useEffect(() => {
    const jobsRef = collection(db, 'jobs');
    const unsubscribe = onSnapshot(jobsRef, (snapshot) => {
      if (!snapshot.empty) {
        const loadedJobs: Job[] = [];
        const seen = new Set<string>();
        snapshot.forEach(docSnap => {
          const id = docSnap.id;
          if (!seen.has(id)) {
            seen.add(id);
            loadedJobs.push({ ...docSnap.data(), id } as Job);
          }
        });
        setJobs(loadedJobs);
      } else {
        DEFAULT_JOBS.forEach(async (dj) => {
          try {
            await setDoc(doc(db, 'jobs', dj.id), dj);
          } catch (e) {
            console.error('Error seeding job:', e);
          }
        });
      }
    }, (error) => {
      console.warn("Firestore jobs listener:", error);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore Listeners for Owner Collections
  useEffect(() => {
    // 1. KYC Submissions
    const kycRef = collection(db, 'kyc_verifications');
    const unsubKyc = onSnapshot(kycRef, (snap) => {
      if (!snap.empty) {
        const list: KycSubmission[] = [];
        const seen = new Set<string>();
        snap.forEach(d => {
          const id = d.id;
          if (!seen.has(id)) {
            seen.add(id);
            list.push({ ...d.data(), id } as KycSubmission);
          }
        });
        setKycSubmissions(list);
      }
    }, (e) => console.warn("KYC listener:", e));

    // 2. Deposits
    const depRef = collection(db, 'deposits');
    const unsubDep = onSnapshot(depRef, (snap) => {
      if (!snap.empty) {
        const list: DepositRequest[] = [];
        const seen = new Set<string>();
        snap.forEach(d => {
          const id = d.id;
          if (!seen.has(id)) {
            seen.add(id);
            list.push({ ...d.data(), id } as DepositRequest);
          }
        });
        setDeposits(list);
      }
    }, (e) => console.warn("Deposits listener:", e));

    // 3. Withdrawals
    const withRef = collection(db, 'withdrawals');
    const unsubWith = onSnapshot(withRef, (snap) => {
      if (!snap.empty) {
        const list: WithdrawalRequest[] = [];
        const seen = new Set<string>();
        snap.forEach(d => {
          const id = d.id;
          if (!seen.has(id)) {
            seen.add(id);
            list.push({ ...d.data(), id } as WithdrawalRequest);
          }
        });
        setWithdrawals(list);
      }
    }, (e) => console.warn("Withdrawals listener:", e));

    // 4. Task Proofs
    const subRef = collection(db, 'submissions');
    const unsubSub = onSnapshot(subRef, (snap) => {
      if (!snap.empty) {
        const list: TaskProofSubmission[] = [];
        const seen = new Set<string>();
        snap.forEach(d => {
          const id = d.id;
          if (!seen.has(id)) {
            seen.add(id);
            list.push({ ...d.data(), id } as TaskProofSubmission);
          }
        });
        setTaskProofs(list);
      }
    }, (e) => console.warn("Task proofs listener:", e));

    // 5. All Users
    const usersRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersRef, (snap) => {
      if (!snap.empty) {
        const list: PlatformUser[] = [];
        const seen = new Set<string>();
        snap.forEach(d => {
          const id = d.id;
          if (!seen.has(id)) {
            seen.add(id);
            list.push({ ...d.data(), id } as PlatformUser);
          }
        });
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

    return () => {
      unsubKyc();
      unsubDep();
      unsubWith();
      unsubSub();
      unsubUsers();
      unsubSettings();
    };
  }, []);

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
  const [showReferralAnalytics, setShowReferralAnalytics] = useState<boolean>(false);
  const [showProfilePassword, setShowProfilePassword] = useState<boolean>(false);

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

  // Handle Login / Signup with Firebase Authentication
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorText('');
    setIsAuthLoading(true);

    if (authView === 'signup') {
      const cleanUser = authUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!cleanUser || cleanUser.length < 3) {
        setAuthErrorText('ইউজারনেম দিন (কমপক্ষে ৩ অক্ষর, যেমন: shakib_99)।');
        setIsAuthLoading(false);
        return;
      }
      try {
        const uSnap = await getDocs(query(collection(db, 'users'), where('username', '==', cleanUser)));
        if (!uSnap.empty) {
          setAuthErrorText('এই ইউজারনেমটি ইতিমধ্যে নেওয়া হয়েছে। দয়া করে অন্য একটি ইউনিক ইউজারনেম দিন।');
          setIsAuthLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Username uniqueness check:", err);
      }

      if (authPassword !== authConfirmPassword) {
        setAuthErrorText('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না। সঠিক পাসওয়ার্ড দিন।');
        setIsAuthLoading(false);
        return;
      }
      if (!authPassword || authPassword.length < 6) {
        setAuthErrorText('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
        setIsAuthLoading(false);
        return;
      }
    }

    const cleanInput = authEmailOrMobile.trim().replace(/\s+/g, '');
    let userEmail = cleanInput.includes('@') ? cleanInput : `${authMobileNumber || cleanInput || 'user'}@workgrove.app`;
    const myReferralCode = 'WG' + Math.floor(1000 + Math.random() * 9000);
    const resolvedName = authFullName || (authView === 'login' ? 'Work Grove Member' : 'New Worker');
    const finalUsername = authUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || `user_${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (authView === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, userEmail, authPassword);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: resolvedName });
          const newUserData = {
            uid: userCredential.user.uid,
            name: resolvedName,
            username: finalUsername,
            email: userEmail,
            mobile: authMobileNumber || '+880 1712345678',
            passwordHint: authPassword, // Saved for Owner/Admin review in panel
            totalBalance: 0.00,
            incomeBalance: 0.00,
            referBalance: 0.00,
            pendingBalance: 0.00,
            giftCodeBalance: 0.00,
            referrals: 0,
            verified: true,
            kycStatus: 'approved',
            premium: false,
            linkedBkash: '',
            referralCode: myReferralCode,
            referredBy: authReferralInput || '',
            xp: 0, // Starts at Tier V!
            isCompanyStaff: false,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);
        }
        setUser(prev => ({ 
          ...prev, 
          name: resolvedName, 
          username: finalUsername,
          email: userEmail, 
          mobile: authMobileNumber || prev.mobile,
          verified: true,
          kycStatus: 'approved',
          referralCode: myReferralCode,
          referredBy: authReferralInput || prev.referredBy,
          xp: 0
        }));
        setIsLoggedIn(true);
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
      } else {
        if (!authPassword || authPassword.length < 6) {
          setAuthErrorText('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।');
          setIsAuthLoading(false);
          return;
        }

        // If user entered username or mobile number instead of email, look up their registered email from Firestore
        if (!cleanInput.includes('@')) {
          try {
            const rawDigits = cleanInput.replace(/[^0-9]/g, '');
            const cleanUserOrPhone = cleanInput.replace(/^@/, '').toLowerCase();
            const usersRef = collection(db, 'users');

            // 1. Try matching by @username
            const qUser = query(usersRef, where('username', '==', cleanUserOrPhone));
            const snapUser = await getDocs(qUser);
            if (!snapUser.empty && snapUser.docs[0].data()?.email) {
              userEmail = snapUser.docs[0].data().email;
            } else {
              // 2. Try matching by mobile
              const q1 = query(usersRef, where('mobile', '==', cleanInput));
              const snap1 = await getDocs(q1);
              if (!snap1.empty && snap1.docs[0].data()?.email) {
                userEmail = snap1.docs[0].data().email;
              } else if (rawDigits.length >= 10) {
                const q2 = query(usersRef, where('mobile', '==', `+880 ${rawDigits.slice(-10)}`));
                const snap2 = await getDocs(q2);
                if (!snap2.empty && snap2.docs[0].data()?.email) {
                  userEmail = snap2.docs[0].data().email;
                }
              }
            }
          } catch (lookupErr) {
            console.warn("User lookup note:", lookupErr);
          }
        }

        const cred = await signInWithEmailAndPassword(auth, userEmail, authPassword);
        // Load user data from Firestore if available
        if (cred.user) {
          try {
            const uDoc = await getDoc(doc(db, 'users', cred.user.uid));
            if (uDoc.exists()) {
              const uData = uDoc.data();
              setUser(prev => ({
                ...prev,
                name: uData.name || cred.user.displayName || resolvedName,
                username: uData.username || prev.username || 'worker1',
                email: uData.email || cred.user.email || userEmail,
                mobile: uData.mobile || prev.mobile,
                totalBalance: uData.totalBalance ?? prev.totalBalance,
                incomeBalance: uData.incomeBalance ?? prev.incomeBalance,
                referBalance: uData.referBalance ?? prev.referBalance,
                pendingBalance: uData.pendingBalance ?? prev.pendingBalance,
                giftCodeBalance: uData.giftCodeBalance ?? prev.giftCodeBalance,
                referrals: uData.referrals ?? prev.referrals,
                referralCode: uData.referralCode || myReferralCode,
                linkedBkash: uData.linkedBkash || '',
                xp: uData.xp ?? 0,
                isCompanyStaff: !!uData.isCompanyStaff,
                verified: true,
                kycStatus: 'approved'
              }));
            }
          } catch (loadErr) {
            console.warn("User data load note:", loadErr);
          }
        }

        setUser(prev => ({ 
          ...prev, 
          name: resolvedName, 
          email: userEmail, 
          verified: true, 
          kycStatus: 'approved',
          referralCode: myReferralCode 
        }));
        setIsLoggedIn(true);
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
      }
    } catch (error: any) {
      console.warn("Firebase Auth status:", error?.code || error?.message);
      const code = error?.code || '';

      if (code === 'auth/operation-not-allowed' || code === 'auth/network-request-failed') {
        setUser(prev => ({ 
          ...prev, 
          name: resolvedName, 
          email: userEmail, 
          verified: true, 
          kycStatus: 'approved',
          referralCode: myReferralCode,
          referredBy: authReferralInput || prev.referredBy
        }));
        setIsLoggedIn(true);
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
        return;
      }

      let errorMsg = "লগইন সফল হয়নি। তথ্য যাচাই করে পুনরায় চেষ্টা করুন।";
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        errorMsg = "পাসওয়ার্ড অথবা ইমেইল/মোবাইল নম্বর সঠিক নয়। সঠিক তথ্য দিয়ে চেষ্টা করুন অথবা নতুন একাউন্ট তৈরি করুন।";
      } else if (code === 'auth/user-not-found') {
        errorMsg = "এই তথ্য দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নতুন অ্যাকাউন্ট তৈরি করুন।";
      } else if (code === 'auth/email-already-in-use') {
        errorMsg = "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত রয়েছে। দয়া করে লগইন করুন।";
      } else if (code === 'auth/weak-password') {
        errorMsg = "পাসওয়ার্ডটি খুবই দুর্বল। অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন।";
      } else if (code === 'auth/invalid-email') {
        errorMsg = "সঠিক ইমেইল এড্রেস অথবা মোবাইল নম্বর লিখুন।";
      }

      setAuthErrorText(errorMsg);
      setIsLoggedIn(false);
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
      setShowAdminLogin(false);
      setShowOwnerPortal(true);
      setAdminPasswordInput('');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      alert('অনার পোর্টালে স্বাগতম! (Owner Admin Authentication Successful)');
    } else {
      alert('ভুল অ্যাডমিন পাসওয়ার্ড। সঠিক পাসওয়ার্ড দিন।');
    }
  };

  // Handle KYC Submission (Face Verification & Birth Certificate)
  const handleSubmitKyc = async ({
    facePhoto,
    birthCertPhoto,
    birthCertNumber
  }: {
    facePhoto: string;
    birthCertPhoto: string;
    birthCertNumber: string;
  }) => {
    const userId = firebaseUser ? firebaseUser.uid : 'local-user';
    const kycDocData: KycSubmission = {
      id: userId,
      userId,
      userName: user.name,
      userEmail: user.email || 'worker@workgrove.app',
      userMobile: user.mobile,
      facePhoto,
      birthCertPhoto,
      birthCertNumber,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      referredBy: user.referredBy || ''
    };

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'kyc_verifications', userId), kycDocData);
        await updateDoc(doc(db, 'users', userId), {
          kycStatus: 'pending',
          facePhoto,
          birthCertPhoto,
          birthCertNumber,
          kycSubmittedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error saving KYC in Firestore:", err);
      }
    }

    setUser(prev => ({
      ...prev,
      kycStatus: 'pending',
      facePhoto,
      birthCertPhoto,
      birthCertNumber
    }));

    setKycSubmissions(prev => {
      const filtered = prev.filter(k => k.userId !== userId);
      return [kycDocData, ...filtered];
    });

    alert('আপনার ফেস ছবি ও জন্মনিবন্ধন সনদের ছবি সফলভাবে জমা হয়েছে! অনার (Owner) শীঘ্রই এটি যাচাই করে অ্যাকাউন্ট ফুল ভেরিফাইড করবেন।');
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

  // If not logged in, show Upwork / Fiverr Next-Level 3D Login / Create Account screen
  if (!isLoggedIn) {
    // Dynamic password strength scoring
    const hasMinLen = authPassword.length >= 6;
    const hasCase = /[A-Z]/.test(authPassword) && /[a-z]/.test(authPassword);
    const hasNumber = /[0-9]/.test(authPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(authPassword);
    const strengthScore = (hasMinLen ? 1 : 0) + (hasCase ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
    const passMatch = authConfirmPassword ? authPassword === authConfirmPassword : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        
        {/* Floating 3D Ambient Glowing Neon Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/25 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-float"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

        {/* 3D Glassmorphic Master Card */}
        <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-3xl rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-700/60 overflow-hidden transform transition-all duration-500 hover:border-blue-500/50">
          
          {/* Top animated neon line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 animate-pulse"></div>

          {/* Upwork/Fiverr Styled Header */}
          <div className="text-center mb-6 relative">
            <div className="relative w-20 h-20 mx-auto mb-3 flex items-center justify-center">
              {/* Rotating outer holographic neon ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400/50 animate-rotate-slow"></div>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 opacity-30 blur-md animate-pulse"></div>
              
              {/* Inner 3D emblem */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-1 shadow-2xl shadow-blue-500/40 transform hover:scale-110 hover:rotate-6 transition-all duration-300">
                <img 
                  src="/assets/aistudio/file_000000006d0081faaf05d5de78209f5b_a67c025c.png" 
                  alt="WORK GROVE Emblem" 
                  className="w-full h-full object-contain rounded-xl bg-white p-1"
                />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent tracking-wide drop-shadow-md">
              WORK GROVE
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-extrabold text-blue-300 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified Platform
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-300">
                <Users className="w-3 h-3 text-emerald-400" />
                ৫০,০০০+ একটিভ মেম্বার
              </span>
            </div>
          </div>

          {/* 3D Segmented Mode Switcher */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner mb-6">
            <button 
              type="button"
              onClick={() => { setAuthView('login'); setAuthErrorText(''); }}
              className={`py-3 text-xs font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                authView === 'login' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 transform scale-[1.02]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>লগইন (Sign In)</span>
            </button>
            <button 
              type="button"
              onClick={() => { setAuthView('signup'); setAuthErrorText(''); }}
              className={`py-3 text-xs font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                authView === 'signup' 
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-emerald-600/30 transform scale-[1.02]' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>নতুন একাউন্ট (Sign Up)</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authView === 'signup' ? (
              <>
                {/* 1. Full Display Name (Free text) */}
                <div>
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">
                    আপনার নাম (Full Name - যেকোনো নাম হতে পারে)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type="text" 
                      required
                      placeholder="আপনার পূর্ণ নাম লিখুন (যেমন: আরিফ হোসেন)..."
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* 2. Unique Username (One-of-a-kind) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <span>ইউজারনেম (Unique Username)</span>
                      <span className="text-[10px] text-amber-400 font-bold">*সবার চেয়ে আলাদা</span>
                    </label>
                    {/* Live status badge */}
                    {usernameStatus === 'checking' && (
                      <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> যাচাই হচ্ছে...
                      </span>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> উপলব্ধ আছে!
                      </span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                        <X className="w-3 h-3" /> ইতিমধ্যে নেওয়া হয়েছে!
                      </span>
                    )}
                    {usernameStatus === 'invalid' && (
                      <span className="text-[10px] text-slate-400 font-medium">কমপক্ষে ৩ অক্ষর</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                      @
                    </div>
                    <input 
                      type="text" 
                      required
                      placeholder="যেমন: shakib_99 (ইংরেজি ছোট অক্ষরের ইউনিক নাম)"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-950/70 border rounded-2xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner ${
                        usernameStatus === 'available' ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30' :
                        usernameStatus === 'taken' ? 'border-red-500/80 focus:border-red-400 focus:ring-2 focus:ring-red-500/30' :
                        'border-slate-700/80 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'
                      }`}
                    />
                  </div>
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">
                    মোবাইল নম্বর (Mobile Number)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type="tel" 
                      required
                      placeholder="01712345678"
                      value={authMobileNumber}
                      onChange={(e) => setAuthMobileNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* 4. Email */}
                <div>
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">
                    ইমেইল এড্রেস (Email Address)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com"
                      value={authEmailOrMobile}
                      onChange={(e) => setAuthEmailOrMobile(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* 5. Password with Live Strength Visualizer */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                      পাসওয়ার্ড (Password)
                    </label>
                    {authPassword && (
                      <span className={`text-[10px] font-black uppercase ${
                        strengthScore === 4 ? 'text-emerald-400' :
                        strengthScore === 3 ? 'text-yellow-400' :
                        strengthScore === 2 ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {strengthScore === 4 ? '★ অত্যন্ত শক্তিশালী (Strong)' :
                         strengthScore === 3 ? 'ভালো (Good)' :
                         strengthScore === 2 ? 'মাঝারি (Fair)' : 'দুর্বল (Weak)'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="গোপন পাসওয়ার্ড দিন..."
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-12 pr-11 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* 4-Segment Animated Strength Meter */}
                  {authPassword && (
                    <div className="space-y-2 mt-2">
                      <div className="grid grid-cols-4 gap-1.5">
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strengthScore >= 1 ? 'bg-red-500' : 'bg-slate-800'}`}></div>
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strengthScore >= 2 ? 'bg-orange-500' : 'bg-slate-800'}`}></div>
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strengthScore >= 3 ? 'bg-yellow-400' : 'bg-slate-800'}`}></div>
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${strengthScore >= 4 ? 'bg-emerald-400' : 'bg-slate-800'}`}></div>
                      </div>

                      {/* Criteria Checklist */}
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-medium pt-1">
                        <span className={`flex items-center gap-1 ${hasMinLen ? 'text-emerald-400 font-bold' : ''}`}>
                          {hasMinLen ? '✓' : '○'} কমপক্ষে ৬ অক্ষর
                        </span>
                        <span className={`flex items-center gap-1 ${hasCase ? 'text-emerald-400 font-bold' : ''}`}>
                          {hasCase ? '✓' : '○'} বড় ও ছোট হাতের অক্ষর
                        </span>
                        <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-400 font-bold' : ''}`}>
                          {hasNumber ? '✓' : '○'} সংখ্যা (0-9)
                        </span>
                        <span className={`flex items-center gap-1 ${hasSpecial ? 'text-emerald-400 font-bold' : ''}`}>
                          {hasSpecial ? '✓' : '○'} স্পেশাল চিহ্ন (@, #, $)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Confirm Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                      কনফার্ম পাসওয়ার্ড (Confirm Password)
                    </label>
                    {passMatch !== null && (
                      <span className={`text-[10px] font-bold ${passMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                        {passMatch ? '✓ পাসওয়ার্ড মিলেছে' : '✗ মিলছে না'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="পাসওয়ার্ডটি আবার লিখুন..."
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-slate-950/70 border rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner ${
                        passMatch === true ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30' :
                        passMatch === false ? 'border-red-500/80 focus:border-red-400 focus:ring-2 focus:ring-red-500/30' :
                        'border-slate-700/80 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'
                      }`}
                    />
                  </div>
                </div>

                {/* 7. Referral Code (Optional) */}
                <div>
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">
                    রেফারেল কোড (ঐচ্ছিক / Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="যেমন: WG4821"
                      value={authReferralInput}
                      onChange={(e) => setAuthReferralInput(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-xs font-mono font-bold text-emerald-400 uppercase placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* LOGIN FIELDS */}
                <div>
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">
                    ইমেইল, ইউজারনেম (@username) অথবা মোবাইল
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type="text" 
                      required
                      placeholder="আপনার @username, ইমেইল বা মোবাইল লিখুন..."
                      value={authEmailOrMobile}
                      onChange={(e) => setAuthEmailOrMobile(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">
                    গোপন পাসওয়ার্ড (Password)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3.5 w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="আপনার গোপন পাসওয়ার্ড লিখুন"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-12 pr-11 py-3.5 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Inline 3D Error Notice Banner */}
            {authErrorText && (
              <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg shadow-red-950/50">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold leading-relaxed">{authErrorText}</p>
                  {authView === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('signup');
                        setAuthErrorText('');
                      }}
                      className="mt-1.5 text-[11px] font-black text-amber-300 hover:text-amber-200 underline flex items-center gap-1 transition-colors"
                    >
                      <span>অ্যাকাউন্ট নেই? নতুন একাউন্ট তৈরি করতে এখানে চাপুন</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Primary 3D Submit Button */}
            <button 
              type="submit"
              disabled={isAuthLoading || (authView === 'signup' && usernameStatus === 'taken')}
              className={`w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-black rounded-2xl shadow-[0_10px_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 active:translate-y-0 text-sm tracking-wide group ${isAuthLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <span>{authView === 'signup' ? 'একাউন্ট তৈরি করুন (Create Account)' : 'লগইন করুন (SIGN IN)'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>


          </form>

          {/* Social / Official Channel Buttons at Bottom */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2.5">
              WORK GROVE OFFICIAL CHANNELS
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: 'FB', color: 'bg-blue-600 text-white', icon: FacebookSvg, link: 'https://facebook.com' },
                { name: 'TG', color: 'bg-sky-500 text-white', icon: TelegramSvg, link: 'https://t.me/work_grove_official' },
                { name: 'YT', color: 'bg-red-600 text-white', icon: YoutubeSvg, link: 'https://youtube.com' },
                { name: 'TT', color: 'bg-slate-800 text-white', icon: TiktokSvg, link: 'https://tiktok.com' },
                { name: 'WA', color: 'bg-emerald-600 text-white', icon: WhatsappSvg, link: 'https://whatsapp.com/channel/0029Vb9UVQO4inopUJ81G83D' },
              ].map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => window.open(c.link, '_blank')}
                  className={`p-2.5 rounded-xl ${c.color} flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform`}
                >
                  <c.icon />
                </button>
              ))}
            </div>
          </div>

        </div>
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
                      <span>Firebase Live Online</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-200/80 shadow-sm animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Firestore Active</span>
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
                <p className="text-xs text-amber-50 font-semibold truncate">{platformSettings.noticeText || t(language, 'noticeText')}</p>
              </div>
            </div>

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
                <div className="bg-gradient-to-b from-blue-50 to-indigo-50/50 p-3 rounded-2xl shadow-sm border border-blue-100">
                  <div className="text-base font-black text-blue-700">{user.verified ? 'Active' : 'Pending'}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Status</div>
                </div>
              </div>

              {/* Password Reveal Section for User */}
              <div className="w-full mt-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">My Password</div>
                    <div className="text-xs font-mono font-bold text-slate-700">
                      {showProfilePassword ? (user.passwordHint || '••••••••') : '••••••••'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProfilePassword(!showProfilePassword)}
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-2xl overflow-hidden divide-y divide-slate-100">
              {[
                { title: t(language, 'editProfile'), icon: User, action: () => { setEditName(user.name); setEditMobile(user.mobile); setShowEditProfileModal(true); } },
                { title: 'Link bKash Wallet (বিকাশ যুক্ত করুন)', icon: PhoneIcon, action: () => setShowBkashLinkModal(true) },
                { title: 'Referral Analytics (রেফারেল পরিসংখ্যান)', icon: PieChart, action: () => setShowReferralAnalytics(true) },
                { title: 'Configure Custom Firebase', icon: Database, action: () => setShowCustomFirebaseModal(true) },
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
                    <div className={`w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm ${item.color || 'text-blue-600'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-black ${item.color || 'text-slate-800'}`}>{item.title}</span>
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
        kycSubmissions={kycSubmissions}
        deposits={deposits}
        withdrawals={withdrawals}
        taskProofs={taskProofs}
        allUsers={allUsers}
        jobs={jobs}
        platformSettings={platformSettings}
        onUpdateSettings={handleUpdatePlatformSettings}
        onOpenLightbox={(imageUrl, title, subtitle) => {
          setLightboxState({ isOpen: true, imageUrl, title, subtitle });
        }}
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
                          {ref.verified && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">{ref.username ? `@${ref.username}` : 'Pending Username'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-black ${ref.verified ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {ref.verified ? `+৳${platformSettings.referralBonus || 10}` : 'Pending KYC'}
                      </div>
                      <div className="text-[9px] text-slate-300 font-bold">Contribution</div>
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
    </div>
  );
}
