import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Clock, 
  FileCheck, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  LogOut, 
  Bell, 
  Search, 
  ChevronRight, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Sliders, 
  Smartphone,
  Shield,
  ShieldCheck,
  Fingerprint,
  Mail,
  Phone,
  Lock,
  Building,
  AlertTriangle,
  Send,
  Download,
  ShieldAlert,
  HelpCircle,
  Megaphone,
  UserCheck,
  Briefcase,
  Layers,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Parcel, Token, Complaint, ParcelStatus, TokenStatus, ComplaintStatus } from '../types';

interface ManagerDashboardProps {
  parcels: Parcel[];
  setParcels: React.Dispatch<React.SetStateAction<Parcel[]>>;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  onClose: () => void;
  langCode: string;
}

// Simulated dynamic lists loaded once
const INITIAL_STAFF = [
  { id: 'EMP-301', name: 'Laxmi Narayan', role: 'Counter Staff', status: 'active', counter: 1, attendance: 'present', performance: 4.8 },
  { id: 'EMP-302', name: 'Rohan Sharma', role: 'Counter Staff', status: 'active', counter: 2, attendance: 'present', performance: 4.2 },
  { id: 'EMP-303', name: 'Ananya Iyer', role: 'Counter Staff', status: 'break', counter: 3, attendance: 'present', performance: 4.9 },
  { id: 'EMP-107', name: 'Ravi Kumar', role: 'Delivery Staff', status: 'active', counter: 4, attendance: 'present', performance: 4.5 },
  { id: 'EMP-108', name: 'Sumit Rathore', role: 'Delivery Staff', status: 'dispatching', counter: 0, attendance: 'present', performance: 4.1 },
  { id: 'EMP-250', name: 'Devendra Gowda', role: 'Supervisor', status: 'idle', counter: 0, attendance: 'present', performance: 4.7 }
];

const BRANCHES = [
  { id: 'B1', name: 'Bengaluru Central GPO', address: 'Raj Bhavan Road', crowdScore: 82, revenue: 45000, activeCounters: 3, delayRisk: 'Low' },
  { id: 'B2', name: 'Mysuru Division GPO', address: 'Ashoka Road Mysuru', crowdScore: 48, revenue: 18500, activeCounters: 2, delayRisk: 'Nominal' },
  { id: 'B3', name: 'Mangaluru Port Office', address: 'Hampankatta Road', crowdScore: 91, revenue: 31000, activeCounters: 2, delayRisk: 'High' }
];

const FRAUD_REPORTS = [
  { id: 'FR-109', type: 'Invalid Airway Bill', target: 'POST-55201-IN', riskScore: 94, source: 'Gateway Bangalore', details: 'Checksum digits mismatch with official SpeedPost standards.', status: 'blocked' },
  { id: 'FR-110', type: 'Duplicate Identity Claim', target: 'Token T-205', riskScore: 78, source: 'Counter 2 Desk', details: 'Aadhaar checksum validated but card expired in 2024.', status: 'under_investigation' },
  { id: 'FR-111', type: 'High Frequency Geolocation Hop', target: 'POST-99120-IN', riskScore: 88, source: 'API Proxy Gateway', details: 'Tracking queried from multiple non-adjacent regional IPs inside 30 seconds.', status: 'notified' }
];

const FEEDBACKS = [
  { id: 'F-1', customer: 'Deepak Rao', rating: 5, comment: 'Lobby wait times reduced significantly with the new Aura AI token route. Amazing upgrade.', service: 'Savings Bank' },
  { id: 'F-2', customer: 'Shreya Patil', rating: 4, comment: 'Counter staff resolved speed post query in 3 minutes. Clean layout.', service: 'Speed Post Dispatch' },
  { id: 'F-3', customer: 'Vijay Gowda', rating: 2, comment: 'Parcel was delayed at regional sort center for 2 days. AI delay predictor alerts are helpful though.', service: 'Express Registry' }
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: "Chief Postal Command Center",
    subtitle: "Enterprise Real-Time AI Management Dashboard",
    dashboard: "Dashboard",
    queueMonitor: "Queue Monitoring",
    staffManager: "Staff Management",
    parcelAnalytics: "Parcel Analytics",
    complaintDesk: "Grievance Desk",
    revenueReports: "Revenue & Ledger",
    branches: "Branch Control",
    deliveryTrack: "Carrier Logistics",
    fraudAlerts: "Fraud & Threat Hub",
    settings: "System Rules",
    logout: "Exit CommandCenter",
    emergency: "Emergency Console",
    welcomeBack: "Velankanni Selvaraj",
    roleName: "Chief Postmaster Manager"
  },
  kn: {
    title: "ಮುಖ್ಯ ಅಂಚೆ ಕಚೇರಿ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
    subtitle: "ನೈಜ-ಸಮಯದ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ನಿರ್ವಹಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    dashboard: "ಮುಖ್ಯ ಮಾಹಿತಿ ಫಲಕ",
    queueMonitor: "ಸರತಿ ಸಾಲು ಮೇಲ್ವಿಚಾರಣೆ",
    staffManager: "ಸಿಬ್ಬಂದಿ ನಿರ್ವಹಣೆ",
    parcelAnalytics: "ಪಾರ್ಸೆಲ್ ವಿಶ್ಲೇಷಣೆ",
    complaintDesk: "ದೂರುಗಳ ವಿಭಾಗ",
    revenueReports: "ಆದಾಯ ಮತ್ತು ಲೆಡ್ಜರ್",
    branches: "ಶಾಖಾ ನಿಯಂತ್ರಣ",
    deliveryTrack: "ವಿತರಣಾ ಲಾಜಿಸ್ಟಿಕ್ಸ್",
    fraudAlerts: "ವಂಚನೆ ಮತ್ತು ಬೆದರಿಕೆ ಹಬ್",
    settings: "ವ್ಯವಸ್ಥೆಯ ನಿಯಮಗಳು",
    logout: "ನಿಯಂತ್ರಣದಿಂದ ನಿರ್ಗಮಿಸಿ",
    emergency: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಘಟಕ",
    welcomeBack: "ವೇಲಂಕಣ್ಣಿ ಸೆಲ್ವರಾಜ್",
    roleName: "ಮುಖ್ಯ ಪೋಸ್ಟ್ಮಾಸ್ಟರ್ ಮ್ಯಾನೇಜರ್"
  },
  hi: {
    title: "मुख्य डाक कमान केंद्र",
    subtitle: "एंटरप्राइज़ रीयल-टाइम एआई प्रबंधन डैशबोर्ड",
    dashboard: "डैशबोर्ड",
    queueMonitor: "कतार निगरानी",
    staffManager: "कर्मचारी प्रबंधन",
    parcelAnalytics: "पार्सल विश्लेषण",
    complaintDesk: "शिकायत निवारण",
    revenueReports: "राजस्व और बहीखाता",
    branches: "शाखा नियंत्रण",
    deliveryTrack: "वितरण रसद",
    fraudAlerts: "धोखाधड़ी कमान केंद्र",
    settings: "सिस्टम सेटिंग्स",
    logout: "लॉगआउट करें",
    emergency: "आपातकालीन नियंत्रण",
    welcomeBack: "वेलंकन्नी सेल्वराज",
    roleName: "मुख्य पोस्टमास्टर प्रबंधक"
  },
  te: {
    title: "చీఫ్ పోస్టల్ కమాండ్ సెంటర్",
    subtitle: "రియల్ టైమ్ ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ మేనేజ్‌మెంట్ డాష్‌బోర్డ్",
    dashboard: "డాష్‌బోర్డ్",
    queueMonitor: "క్యూ పర్యవేక్షణ",
    staffManager: "సిబ్బంది నిర్వహణ",
    parcelAnalytics: "పార్సెల్ అనలిటిక్స్",
    complaintDesk: "ఫిర్యాదుల విభాగం",
    revenueReports: "ఆదాయ నివేదికలు",
    branches: "బ్రాంచ్ కంట్రోల్",
    deliveryTrack: "డెలివరీ లాజిస్టిక్స్",
    fraudAlerts: "ఫ్రాడ్ & థ్రెట్ హబ్",
    settings: "సిస్టమ్ సెట్టింగులు",
    logout: "లాగ్అవుట్",
    emergency: "అత్యవసర విభాగం",
    welcomeBack: "వేలంకన్ని సెల్వరాజ్",
    roleName: "చీఫ్ పోస్ట్‌మాస్టర్ మేనేజర్"
  }
};

export default function ManagerDashboard({
  parcels,
  setParcels,
  tokens,
  setTokens,
  complaints,
  setComplaints,
  onClose,
  langCode: initialLangCode
}: ManagerDashboardProps) {

  // Multi-Language state
  const [lang, setLang] = useState<string>(initialLangCode || 'en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Authentication Flow
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [employeeId, setEmployeeId] = useState<string>('CPM-0305');
  const [managerEmail, setManagerEmail] = useState<string>('yakshithargowda@gmail.com');
  const [managerPhone, setManagerPhone] = useState<string>('+91 98765 03050');
  const [managerRole, setManagerRole] = useState<'Chief Post Manager' | 'Regional Manager' | 'Branch Manager'>('Chief Post Manager');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [otpVal, setOtpVal] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  
  // Custom Biometrics simulation states
  const [biometricType, setBiometricType] = useState<'finger' | 'face'>('face');
  const [biometricActive, setBiometricActive] = useState<boolean>(false);
  const [biometricProgress, setBiometricProgress] = useState<number>(0);
  const [systemThreatLevel, setSystemThreatLevel] = useState<'nominal' | 'elevated' | 'under_lockdown'>('nominal');

  // Sidebar Menu Selection
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Core mutable lists for Manager session
  const [staffList, setStaffList] = useState<any[]>(INITIAL_STAFF);
  const [branches, setBranches] = useState<any[]>(BRANCHES);
  const [fraudReports, setFraudReports] = useState<any[]>(FRAUD_REPORTS);
  const [feedbacks, setFeedbacks] = useState<any[]>(FEEDBACKS);
  const [emergencyLockdownMode, setEmergencyLockdownMode] = useState<boolean>(false);
  const [loginActivities, setLoginActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const [managerMessageBroadcast, setManagerMessageBroadcast] = useState<string>('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'staff' | 'citizens'>('all');
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([
    { id: 1, text: "Aura Crowd Predict Alert: High footfall of senior citizens predicted tomorrow between 10 AM to 1 PM for savings maturity.", target: 'staff', date: '2026-05-23' }
  ]);

  // Core Staff modals: Add Crew Member
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<string>('Counter Staff');
  const [newStaffCounter, setNewStaffCounter] = useState<number>(1);
  const [newStaffPhone, setNewStaffPhone] = useState<string>('');
  const [newStaffEmail, setNewStaffEmail] = useState<string>('');

  // Settings configs
  const [officeStartTime, setOfficeStartTime] = useState<string>('09:00');
  const [officeEndTime, setOfficeEndTime] = useState<string>('18:00');
  const [autoReallocateIdleStaff, setAutoReallocateIdleStaff] = useState<boolean>(true);
  const [dailyTokenCap, setDailyTokenCap] = useState<number>(300);

  // Search system
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Generate real audio feedbacks
  const triggerBeep = (freq: number = 600, duration: number = 80) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      setTimeout(() => osc.stop(), duration);
    } catch (_) {}
  };

  const logLoginToBackend = async (methodUsed: string) => {
    try {
      await fetch('/api/login-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: managerEmail || 'yakshithargowda@gmail.com',
          role: managerRole || 'Chief Post Manager',
          type: 'manager_portal',
          status: 'success',
          userAgent: `${navigator.userAgent} (${methodUsed})`
        })
      });
    } catch (e) {
      console.warn("Unable to log manager login action directly to API:", e);
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (password !== '0305') {
      triggerBeep(350, 400);
      setAuthError('❌ Decryption Denied. Keycode mismatch for Employee database.');
      return;
    }
    // Success password steps to 2FA Step
    triggerBeep(880, 150);
    setShowOtp(true);
    setOtpSent(true);
  };

  const verifyOtpAndUnlock = () => {
    if (otpVal === '1234' || otpVal === '0305' || otpVal.length === 4) {
      triggerBeep(1000, 200);
      setIsLoggedIn(true);
      setAuthError('');
      logLoginToBackend('Secure Passcode 2FA');
    } else {
      triggerBeep(300, 300);
      setAuthError('❌ Invalid 2FA OTP security verification key.');
    }
  };

  const handleBiometricTrigger = () => {
    setBiometricActive(true);
    setBiometricProgress(5);
    triggerBeep(520, 100);
  };

  useEffect(() => {
    let timer: any;
    if (biometricActive && biometricProgress < 100) {
      timer = setInterval(() => {
        setBiometricProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setBiometricActive(false);
            // Auto authenticate on biometric complete
            triggerBeep(1200, 250);
            setIsLoggedIn(true);
            logLoginToBackend('AI Biometrics Scan');
            return 100;
          }
          if (prev % 20 === 0) {
            triggerBeep(650, 40);
          }
          return prev + 5;
        });
      }, 80);
    }
    return () => clearInterval(timer);
  }, [biometricActive, biometricProgress]);

  const fetchLoginActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await fetch('/api/login-activities');
      if (res.ok) {
        const data = await res.json();
        setLoginActivities(data);
      }
    } catch (e) {
      console.warn("Could not fetch login activities", e);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchLoginActivities();
      // Auto refresh every 10 seconds to show dynamic live activity log updates
      const interval = setInterval(fetchLoginActivities, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // AI Insights Recommendation system State
  const generateAiRecommendations = () => {
    const activeWaiting = tokens.filter(t => t.status === 'waiting').length;
    const pendingComplaintsCount = complaints.filter(c => c.status === 'pending').length;
    const result = [];
    
    if (activeWaiting > 5) {
      result.push({
        id: 'rec-1',
        title: 'Queue Overload Imminent',
        desc: `High traffic detected. There are currently ${activeWaiting} customers waiting. Recommend launching additional service counters instantly.`,
        urgency: 'high',
        action: 'Activate emergency counter routing'
      });
    } else {
      result.push({
        id: 'rec-1',
        title: 'Optimized Queue Throughput',
        desc: 'Current visitor flow is nominal. Aura predicted peak tomorrow between 13:00 - 15:00.',
        urgency: 'low',
        action: 'Review dispatch models'
      });
    }

    if (pendingComplaintsCount > 2) {
      result.push({
        id: 'rec-2',
        title: 'SLA Escalation Alert',
        desc: `${pendingComplaintsCount} client grievances are approaching resolution thresholds. Aura AI Auto-suggest is pre-cached for quick response.`,
        urgency: 'medium',
        action: 'Authorize automated consensus'
      });
    }

    // Default recommendations
    result.push({
      id: 'rec-3',
      title: 'Geofenced Route Streamlining',
      desc: '3 local SpeedPost couriers overlap delivery zones in Zone-5. Merging assignments can save 14% fuel.',
      urgency: 'low',
      action: 'Optimize courier geofence'
    });

    return result;
  };

  // Add staff trigger
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    const newEntry = {
      id: `EMP-${Math.floor(Math.random() * 900) + 100}`,
      name: newStaffName,
      role: newStaffRole,
      status: 'active',
      counter: newStaffCounter || 0,
      attendance: 'present',
      performance: 4.5
    };
    setStaffList(prev => [...prev, newEntry]);
    setShowAddStaffModal(false);
    triggerBeep(990, 100);
    
    // Reset forms
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffEmail('');
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
    triggerBeep(400, 100);
  };

  // Broadcast announcement
  const sendBroadcast = () => {
    if (!managerMessageBroadcast.trim()) return;
    const newCast = {
      id: Date.now(),
      text: managerMessageBroadcast,
      target: broadcastTarget,
      date: new Date().toISOString().split('T')[0]
    };
    setBroadcastHistory([newCast, ...broadcastHistory]);
    setManagerMessageBroadcast('');
    triggerBeep(1100, 200);
    alert(`📢 Public Broadcast of type "${broadcastTarget.toUpperCase()}" deployed into client ecosystem servers.`);
  };

  // Real data-table exporter to genuine CSV client download!
  const exportCsv = (datasetName: string) => {
    let headers: string[] = [];
    let rows: any[] = [];
    
    if (datasetName === 'parcels') {
      headers = ['TrackingID', 'Sender', 'Receiver', 'Origin', 'Destination', 'Weight_Grams', 'Charges', 'Status'];
      rows = parcels.map(p => [p.trackingId, p.senderName, p.receiverName, p.origin, p.destination, p.weight, p.charges, p.status]);
    } else if (datasetName === 'revenue') {
      headers = ['Category', 'Today_Earnt', 'Active_Tokens', 'Efficiency'];
      rows = [
        ['Speed Post Service', '₹48,250', '28 tokens', '98.5%'],
        ['Savings Bank Ledger', '₹1,54,000', '19 tokens', '95.2%'],
        ['Registry Post Desk', '₹18,500', '15 tokens', '91.1%'],
        ['Direct Cargo Freight', '₹92,000', '11 tokens', '89.4%']
      ];
    } else {
      headers = ['TokenNo', 'Customer', 'ServiceType', 'Status', 'CounterID', 'EstWait_Min'];
      rows = tokens.map(t => [t.tokenNumber, t.customerName, t.serviceType, t.status, t.counterNumber || 'N/A', t.estimatedWaitMinutes]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Command_${datasetName}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerBeep(880, 150);
  };

  return (
    <div id="manager-root" className={`min-h-screen font-sans ${emergencyLockdownMode ? 'bg-[#1E0505] text-red-100' : 'bg-slate-950 text-slate-100'} flex flex-col relative`}>
      
      {/* LOCKDOWN OVERLAY SIREN */}
      {emergencyLockdownMode && (
        <div className="absolute inset-0 pointer-events-none bg-red-650/5 animate-pulse border-4 border-red-600 z-50"></div>
      )}

      {/* ----------------- MANAGER PORTAL AUTHENTICATION HEADER/VIEW ----------------- */}
      <AnimatePresence>
        {!isLoggedIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/95 overflow-y-auto">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

              {/* Secure Header Banner */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-center text-white border-b border-indigo-950 flex flex-col items-center">
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center border border-indigo-400/30 text-indigo-100 hover:scale-105 transition duration-300">
                    <Shield className="w-7 h-7 animate-pulse text-amber-300" />
                  </div>
                  <div className="absolute -right-2 -bottom-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-black border-2 border-slate-900">✓</div>
                </div>

                <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5 uppercase">
                  Aura Intelligent GPO Controller
                </h1>
                <p className="text-[10px] tracking-widest text-indigo-300 font-bold uppercase mt-1">
                  🔒 Level 3 Administrative Commandant Access
                </p>
                
                {/* Threat status */}
                <span className="mt-2.5 px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 text-[9px] rounded-full font-bold uppercase tracking-wider">
                  Secure Socket Active: RSA-4096 SHA2
                </span>
              </div>

              {/* Errors container */}
              {authError && (
                <div className="mx-6 mt-4 p-3 bg-red-950/50 border border-red-900 text-red-400 rounded-2xl text-[10.5px] font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Login Steps toggler */}
              {!showOtp ? (
                <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                  {/* Role picker */}
                  <div>
                    <span className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Commandant Duty Type</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'Chief Post Manager', title: 'Chief Postmaster' },
                        { key: 'Regional Manager', title: 'Regional Supt.' },
                        { key: 'Branch Manager', title: 'District GM' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setManagerRole(item.key as any);
                            triggerBeep(450, 40);
                          }}
                          className={`p-2 rounded-xl text-center border transition cursor-pointer text-[11px] font-bold ${
                            managerRole === item.key 
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                              : 'bg-slate-800 border-slate-700/60 text-slate-350 hover:bg-slate-750'
                          }`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Employee ID code */}
                  <div>
                    <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-1">Corporate Employee ID</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        required
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="CPM-0305"
                        className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white font-bold tracking-wider outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Backup Gmail ID */}
                    <div>
                      <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-1">Secured Email (Gmail)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="email"
                          required
                          value={managerEmail}
                          onChange={(e) => setManagerEmail(e.target.value)}
                          placeholder="yakshithargowda@gmail.com"
                          className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Duty Phone Number */}
                    <div>
                      <label className="block text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Mobile No</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          required
                          value={managerPhone}
                          onChange={(e) => setManagerPhone(e.target.value)}
                          placeholder="+91 98765 03050"
                          className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Decrypt Key (Required to be 0305 closely verified) */}
                  <div>
                    <label className="block text-[9.5px] font-black text-amber-400 uppercase tracking-widest mb-1">Manager Passkey (Enter Code 0305 to unlock)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-slate-800 border-2 border-indigo-950 text-amber-200 rounded-xl py-2 px-9 text-center font-black tracking-widest text-sm focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-indigo-650 hover:bg-indigo-600 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    Verify & Authorization Step
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        triggerBeep(520, 80);
                        alert("Secure Recovery Notification dispatched in sandbox environment. Demo unlock passcode is standard 0305.");
                      }}
                      className="text-[9.5px] text-indigo-400 underline hover:text-indigo-300"
                    >
                      Forgot Post Office Commandant Credential Key?
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 space-y-4">
                  {/* OTP screen */}
                  <div className="text-center py-2">
                    <span className="p-3 bg-indigo-900/40 rounded-full inline-block mb-3 border border-indigo-800">
                      <Smartphone className="w-6 h-6 text-indigo-300 animate-bounce" />
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase">Enter 2FA Security Token</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      We simulated a 2FA OTP signal to <span className="font-extrabold text-indigo-300 block">{managerEmail}</span> and <span className="font-mono">{managerPhone}</span>.
                    </p>
                    <p className="text-[10px] text-amber-300 font-bold mt-2 bg-indigo-950/50 py-1.5 rounded-lg">
                      🔑 Test Directive: Enter pass <strong className="underline text-white font-black text-sm">0305</strong> or any 4 digit code to verify instantly!
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={4}
                      value={otpVal}
                      onChange={(e) => setOtpVal(e.target.value)}
                      placeholder="e.g. 0305"
                      className="w-32 mx-auto bg-slate-800 border-2 border-indigo-950 text-white rounded-xl py-2 text-center text-xl font-bold tracking-widest outline-none focus:border-indigo-500 block"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="flex-1 bg-slate-850 hover:bg-slate-800 py-2.5 rounded-xl text-slate-350 text-[11px] font-bold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={verifyOtpAndUnlock}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-xl text-white text-[11px] font-black uppercase cursor-pointer"
                    >
                      Verify Level 3 JWT
                    </button>
                  </div>
                </div>
              )}

              {/* DUAL BIOMETRIC DECRYPT DEMONSTRATOR SECTION */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
                <span className="block text-[8px] tracking-wider text-slate-400 uppercase font-black mb-2">Simulate Advanced Biometrics Login bypass</span>
                
                <div className="flex gap-2 justify-center mb-3">
                  <button 
                    onClick={() => { setBiometricType('face'); triggerBeep(450, 40); }} 
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${biometricType === 'face' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    Face ID
                  </button>
                  <button 
                    onClick={() => { setBiometricType('finger'); triggerBeep(450, 40); }} 
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${biometricType === 'finger' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    Fingerprint
                  </button>
                </div>

                {!biometricActive ? (
                  <button
                    onClick={handleBiometricTrigger}
                    className="mx-auto w-full max-w-[240px] border border-dashed border-indigo-500/40 hover:border-indigo-500/80 bg-slate-900/40 p-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-900 transition text-[10.5px] font-bold"
                  >
                    {biometricType === 'face' ? (
                      <>
                        <Shield className="w-4 h-4 text-indigo-400 animate-pulse" />
                        Scan Commandant Face
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-4 h-4 text-indigo-400 animate-pulse" />
                        Hold to Scan Biometrics
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="h-1 text-slate-800 rounded-full w-full bg-slate-800 max-w-[240px] mx-auto overflow-hidden">
                      <div className="bg-indigo-500 h-full animate-pulse" style={{ width: `${biometricProgress}%` }}></div>
                    </div>
                    <span className="block text-[9px] text-indigo-400 font-mono animate-pulse uppercase tracking-widest">
                      Decrypting Signature Matrix... {biometricProgress}%
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- CORE INTERIOR COMMAND CONSOLE ----------------- */}
      {isLoggedIn && (
        <div id="manager-panel-container" className="flex-1 flex overflow-hidden h-screen w-full select-none">
          
          {/* SIDEBAR NAVIGATION PANE */}
          <div className={`${sidebarOpen ? 'w-64' : 'w-16'} hidden md:flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-300 relative shrink-0 z-20`}>
            
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              {sidebarOpen && (
                <div className="min-w-0">
                  <h2 className="text-sm font-black tracking-tight flex items-center gap-1.5 uppercase leading-none">
                    <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>HQ Controller</span>
                  </h2>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase tracking-widest">ID: {employeeId}</span>
                </div>
              )}
              <button 
                onClick={() => { setSidebarOpen(!sidebarOpen); triggerBeep(450, 40); }}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {sidebarOpen ? '◀' : '▶'}
              </button>
            </div>

            {/* Profile widget */}
            {sidebarOpen && (
              <div className="p-4 border-b border-indigo-950 bg-gradient-to-br from-indigo-950/40 to-slate-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-950/80 border border-indigo-500 flex items-center justify-center text-xs font-black text-amber-300 text-center shrink-0">
                    VS
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-black text-slate-100 uppercase truncate leading-tight">{t.welcomeBack}</span>
                    <span className="block text-[8px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">{managerRole}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Language Dropdown inside Menu Sidebar */}
            {sidebarOpen && (
              <div className="p-3 border-b border-slate-800">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Region Language Select</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { key: 'en', val: 'EN' },
                    { key: 'kn', val: 'ಕನ್ನಡ' },
                    { key: 'hi', val: 'हिंदी' },
                    { key: 'te', val: 'తెలుగు' }
                  ].map(ln => (
                    <button
                      key={ln.key}
                      onClick={() => { setLang(ln.key); triggerBeep(500, 50); }}
                      className={`py-1 rounded-lg text-[10px] bg-slate-850 hover:bg-slate-800 transition ${lang === ln.key ? 'border border-amber-400 font-extrabold text-amber-300' : 'text-slate-400 font-medium'}`}
                    >
                      {ln.val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items list */}
            <div className="p-3 flex-1 flex flex-col gap-1 overflow-y-auto">
              {[
                { id: 'dashboard', label: t.dashboard, icon: BarChart3 },
                { id: 'queue', label: t.queueMonitor, icon: Users, badge: tokens.filter(tok => tok.status === 'waiting').length },
                { id: 'staff', label: t.staffManager, icon: UserCheck, badge: staffList.filter(s => s.status === 'active').length },
                { id: 'parcels', label: t.parcelAnalytics, icon: FileCheck },
                { id: 'complaints', label: t.complaintDesk, icon: FileText, badge: complaints.filter(c => c.status === 'pending').length },
                { id: 'revenue', label: t.revenueReports, icon: TrendingUp },
                { id: 'branches', label: t.branches, icon: Building },
                { id: 'audits', label: "Access Audit Hub", icon: ShieldCheck, badge: loginActivities.length },
                { id: 'emergency', label: t.emergency, icon: ShieldAlert, badge: emergencyLockdownMode ? 'ALERT' : 0 }
              ].map((item) => {
                const Icon = item.icon;
                const active = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveMenu(item.id); triggerBeep(450, 40); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                      active ? 'bg-indigo-650 text-white shadow-md font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-300' : 'text-slate-500'}`} />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                    {sidebarOpen && item.badge !== undefined && item.badge !== 0 && (
                      <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[8px] font-black ${item.badge === 'ALERT' ? 'bg-red-650 text-white animate-pulse' : 'bg-indigo-950 text-indigo-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Logout control */}
            <div className="p-3 border-t border-slate-800">
              <button
                onClick={() => {
                  triggerBeep(350, 200);
                  setIsLoggedIn(false);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/20 rounded-xl transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0 text-red-500" />
                {sidebarOpen && <span>{t.logout}</span>}
              </button>
            </div>

          </div>

          {/* RIGHT SIDE MAIN CONTAINER ZONE */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

            {/* MASTER SYSTEM HEADER */}
            <header className="h-16 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 relative z-10">
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-lg transition"
                >
                  ◀ Close Portal
                </button>
                <div className="hidden sm:block">
                  <h1 className="text-md font-black tracking-tight text-white uppercase flex items-center gap-1.5">
                    {t.title} 
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-400/30 text-indigo-300 font-bold tracking-widest">AURA-v3</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 font-bold">{t.subtitle}</p>
                </div>
              </div>

              {/* Status parameters */}
              <div className="flex items-center gap-3">
                
                {/* GLOBAL COURIER ALERT */}
                <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-805 px-3 py-1.5 rounded-xl text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-slate-400">Postal SLA Rate: </span>
                  <span className="text-white font-mono font-black">98.2%</span>
                </div>

                {/* EMERGENCY BROADCAST TAPE */}
                <button 
                  onClick={() => {
                    setEmergencyLockdownMode(p => !p);
                    triggerBeep(1200, 300);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                    emergencyLockdownMode 
                      ? 'bg-red-650 hover:bg-red-700 text-white animate-pulse' 
                      : 'bg-red-950/40 hover:bg-red-900/40 border border-red-900 text-red-400'
                  }`}
                >
                  ⚠️ SYSTEM OVERLOAD STATUS
                </button>
                
                {/* Account info fallback */}
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs leading-none">
                    🇮🇳 {lang.toUpperCase()}
                  </span>
                </div>

              </div>

            </header>

            {/* CENTRAL GRID PAGE CONTENT */}
            <main className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
              
              {/* EMERGENCY GLOBAL BULLETIN IF ACTIVE */}
              {emergencyLockdownMode && (
                <div className="bg-red-950 border-2 border-red-500 text-white p-4 rounded-3xl animate-bounce flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider leading-none">⚠️ EMERGENCY STATE PROTOCOL ENGAGED</h3>
                      <p className="text-[11px] text-red-200 mt-1 font-bold">Lobby queue token processing paused automatically. Public notification posted.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setEmergencyLockdownMode(false); triggerBeep(800, 100); }}
                    className="px-3 py-1.5 bg-white text-red-950 rounded-xl font-bold uppercase text-[10px]"
                  >
                    RESOLVE NOW
                  </button>
                </div>
              )}

              {/* SUBMODULE RENDERING BLOCK SWITCH */}

              {/* ----------------- SUBTAB A: MAIN DASHBOARD ----------------- */}
              {activeMenu === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Commandant Welcome Banner */}
                  <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 p-6 rounded-3xl border border-indigo-950 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute left-1/3 -bottom-10 w-40 h-40 bg-indigo-550/10 rounded-full blur-2xl"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                      <div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-500/15 border border-purple-400/20 rounded-full text-[9px] uppercase font-black tracking-widest text-purple-300 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          AURA GENERAL COMMAND CONSOLE ACTIVE
                        </div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight">
                          Namaskara, {t.welcomeBack}!
                        </h2>
                        <p className="text-xs text-slate-350 mt-1 max-w-xl">
                          Smart postal operations are running smoothly. System analyzed {tokens.length} visitor tokens, dispatched {parcels.length} parcels, and synchronized {staffList.length} local team nodes today.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => exportCsv('tokens')}
                          className="px-3 py-2 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-750 text-slate-200 rounded-xl text-[10.5px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export Tokens CSV
                        </button>
                        <button 
                          onClick={() => { setActiveMenu('emergency'); triggerBeep(900, 100); }}
                          className="px-3 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-[10.5px] font-extrabold text-white transition cursor-pointer"
                        >
                          ⚡ Counter Emergency Controls
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 8 BENTO-GRID DASHBOARD STATISTICS RUNNERS */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: 'Total Customers', val: tokens.length + 84, change: '+12% from yesterday', icon: Users, color: 'text-sky-400' },
                      { title: 'Active Lobby Queue', val: tokens.filter(t => t.status === 'waiting' || t.status === 'calling').length, change: 'Est wait: 14m', icon: Clock, color: 'text-amber-400 animate-pulse' },
                      { title: 'Parcels Registered', val: parcels.length, change: '100% processed digitally', icon: FileCheck, color: 'text-emerald-400' },
                      { title: 'Deliveries Completed', val: parcels.filter(p => p.status === 'delivered').length + 8, change: 'SLA target hit', icon: CheckCircle2, color: 'text-indigo-400' },
                      { title: 'Grievance Cases', val: complaints.filter(c => c.status === 'pending').length, change: 'SLA resolution expected', icon: FileText, color: 'text-purple-400' },
                      { title: 'Duty Active Crew', val: staffList.filter(s => s.status === 'active').length, change: '6 registered today', icon: UserCheck, color: 'text-teal-400' },
                      { title: 'Gross Revenue Today', val: '₹4,42,800', change: '+₹18,500 speed posts', icon: TrendingUp, color: 'text-pink-400' },
                      { title: 'Transit Risk Flag', val: parcels.filter(p => p.status === 'processing').length, change: '1 delayed Sort station', icon: AlertTriangle, color: 'text-rose-400' }
                    ].map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <div key={idx} className="bg-slate-900/60 border border-slate-805/80 p-4 rounded-3xl shadow-sm flex flex-col justify-between gap-3 hover:border-slate-700 transition">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{card.title}</span>
                            <Icon className={`w-4 h-4 shrink-0 ${card.color}`} />
                          </div>
                          <div>
                            <span className="text-xl md:text-2xl font-black text-white">{card.val}</span>
                            <span className="block text-[8px] text-slate-400 mt-0.5 tracking-wide font-medium">{card.change}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DOUBLE COLUMN LAYOUT FOR CHARTS & INSIGHTS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left & Middle Column: Interactive SVG Queue Charts */}
                    <div className="lg:col-span-2 bg-slate-900/40 p-5 rounded-3xl border border-slate-805 space-y-4">
                      
                      <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-850 pb-3">
                        <div>
                          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                            Aura Live Visitor Queue Density Predictor
                          </h4>
                          <p className="text-[10.5px] text-slate-400">Continuous hour-by-hour projection of visitor waiting stress metrics.</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => triggerBeep(450, 40)} className="px-2.5 py-1 bg-slate-800 text-[9px] font-bold rounded-lg hover:bg-slate-750">Hourly</button>
                          <button onClick={() => triggerBeep(450, 40)} className="px-2.5 py-1 bg-slate-850 text-[9px] text-slate-400 font-bold rounded-lg hover:bg-slate-805">Service Category</button>
                        </div>
                      </div>

                      {/* Custom Native High-Tech SVG Graph */}
                      <div className="h-56 w-full flex flex-col justify-between pt-2">
                        <div className="flex-1 relative">
                          
                          {/* Y-axis metrics */}
                          <div className="absolute left-0 top-0 text-[8.5px] text-slate-500 font-mono">100 (Max Congested)</div>
                          <div className="absolute left-0 top-16 text-[8.5px] text-slate-500 font-mono">50 (Nominal Crowd)</div>
                          <div className="absolute left-0 bottom-2 text-[8.5px] text-slate-505 font-mono">0 (Idle Desk)</div>

                          <svg className="w-full h-full pr-4 pl-12 pt-2" viewBox="0 0 500 160">
                            {/* Grids */}
                            <line x1="0" y1="40" x2="500" y2="40" stroke="#1E293B" strokeDasharray="3,3" />
                            <line x1="0" y1="80" x2="500" y2="80" stroke="#1E293B" strokeDasharray="3,3" />
                            <line x1="0" y1="120" x2="500" y2="120" stroke="#1E293B" strokeDasharray="3,3" />

                            {/* Chart Gradient */}
                            <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Area layer */}
                            <path 
                              d="M 0 120 Q 50 40 100 85 T 200 60 T 300 120 T 400 30 T 500 50 L 500 150 L 0 150 Z" 
                              fill="url(#chartGrad)" 
                            />

                            {/* Line layer */}
                            <path 
                              d="M 0 120 Q 50 40 100 85 T 200 60 T 300 120 T 400 30 T 500 50" 
                              fill="none" 
                              stroke="#6366F1" 
                              strokeWidth="3.5" 
                            />

                            {/* Grid labels */}
                            <circle cx="100" cy="85" r="4.5" fill="#FBBF24" />
                            <circle cx="400" cy="30" r="4.5" fill="#EF4444" />
                          </svg>

                        </div>

                        {/* X-axis indicators */}
                        <div className="flex justify-between pl-12 text-[9px] text-slate-400 font-mono">
                          <span>09:00 AM</span>
                          <span>11:00 AM (Peak Expected)</span>
                          <span>01:00 PM (Lunch Dip)</span>
                          <span>03:00 PM</span>
                          <span>05:30 PM PM</span>
                        </div>

                      </div>

                    </div>

                    {/* Right Column: AI Insights & Recommendation Center */}
                    <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-805 space-y-4">
                      
                      <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-3">
                        <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                        Aura System Insights
                      </h4>

                      <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                        {generateAiRecommendations().map((rec) => (
                          <div key={rec.id} className="p-3.5 bg-slate-950/70 border border-slate-850 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center gap-1">
                              <span className="text-[10.5px] font-extrabold text-indigo-400">{rec.title}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-center ${
                                rec.urgency === 'high' ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'bg-slate-850 text-slate-405'
                              }`}>
                                {rec.urgency}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-350 leading-relaxed">{rec.desc}</p>
                            
                            <button
                              onClick={() => {
                                triggerBeep(880, 100);
                                if (rec.id === 'rec-1') {
                                  setActiveMenu('emergency');
                                } else {
                                  alert(`Command Action "${rec.action}" triggered. Aura updated parameters.`);
                                }
                              }}
                              className="w-full text-left font-black text-[9px] uppercase text-indigo-300 hover:text-indigo-200 mt-2 block"
                            >
                              ⚡ Run Action: {rec.action} →
                            </button>
                          </div>
                        ))}
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* ----------------- SUBTAB B: LIVE QUEUE MONITORING ----------------- */}
              {activeMenu === 'queue' && (
                <div className="space-y-6">
                  
                  <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-805 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Live Lobby Active Counter Console</h4>
                        <p className="text-xs text-slate-400">Monitor citizen density across counters, and balance operational loads manually.</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            // Call simulated trigger
                            triggerBeep(920, 120);
                            alert("Dispatched manual audio calling broadcast tone inside postal lobby.");
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-705 text-xs text-slate-200 rounded-xl"
                        >
                          🔊 Broadcast Audio Chime
                        </button>
                      </div>
                    </div>

                    {/* Active tokens summary line */}
                    <div className="p-3 bg-indigo-950/45 border border-indigo-900/30 rounded-2xl flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-[11px] font-bold text-indigo-200">
                        Aura Congestion Score: <span className="underline font-black">{tokens.filter(t => t.status === 'waiting').length > 4 ? 'HIGH CONGESTION' : 'NOMINAL CROWD'}</span>. We advise transferring Counter 3 helper to Speed Post priority desk.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((num) => {
                        const inServing = tokens.find(tok => tok.counterNumber === num && tok.status === 'calling');
                        return (
                          <div key={num} className="bg-slate-900 p-4 border border-slate-800 rounded-3xl flex flex-col justify-between gap-4 relative">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-xs font-black text-white">Desk Counter - {num}</h5>
                                <span className="text-[10px] text-slate-450 block italic">Assigned clerk: Team Node {num}</span>
                              </div>
                              <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 text-[9px] rounded font-mono">
                                ONLINE
                              </span>
                            </div>

                            <div className="p-3.5 bg-slate-950/70 border border-slate-850 rounded-2xl text-center">
                              {inServing ? (
                                <div>
                                  <span className="block text-[8px] text-amber-400 uppercase tracking-widest leading-none font-bold">Currently in service</span>
                                  <span className="text-xl font-black text-white font-mono block mt-1">{inServing.tokenNumber}</span>
                                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">Cust: {inServing.customerName}</span>
                                </div>
                              ) : (
                                <span className="text-slate-450 text-[11px] block py-2">Counter Idle (Ready for next visitor)</span>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const waitingNode = tokens.find(t => t.status === 'waiting');
                                  if (waitingNode) {
                                    setTokens(prev => prev.map(t => {
                                      if (t.id === waitingNode.id) {
                                        return { ...t, status: 'calling', counterNumber: num };
                                      }
                                      return t;
                                    }));
                                    triggerBeep(1000, 150);
                                  } else {
                                    alert("Hooray! No waiting citizens left inside lobby backlog line.");
                                  }
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] py-1.5 rounded-xl uppercase transition"
                              >
                                Call Next
                              </button>

                              <button
                                onClick={() => {
                                  // Complete action
                                  const currentActive = tokens.find(t => t.counterNumber === num && t.status === 'calling');
                                  if (currentActive) {
                                    setTokens(prev => prev.map(t => {
                                      if (t.id === currentActive.id) {
                                        return { ...t, status: 'completed' };
                                      }
                                      return t;
                                    }));
                                    triggerBeep(700, 100);
                                  } else {
                                    alert("Counter is presently not in active communication of matching token call.");
                                  }
                                }}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] py-1.5 rounded-xl uppercase transition"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-850">
                      <span className="block text-xs font-black text-white uppercase tracking-wider mb-2">Detailed Walk-In Wait Registry</span>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {tokens.map((tok) => (
                          <div key={tok.id} className="p-3 bg-slate-900/50 border border-slate-850 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-mono font-black text-xs text-amber-300 border border-slate-700">
                                {tok.tokenNumber}
                              </span>
                              <div>
                                <span className="text-xs font-black text-white">{tok.customerName}</span>
                                <span className="block text-[9.5px] text-slate-450 font-bold">{tok.serviceType} • Time slot: {tok.timeSlot}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {tok.status === 'waiting' && <span className="px-2 py-0.5 rounded bg-amber-950/50 text-amber-400 border border-amber-900 text-[9px] uppercase font-bold">Waiting</span>}
                              {tok.status === 'calling' && <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] uppercase font-bold animate-pulse">In Call (Desk {tok.counterNumber})</span>}
                              {tok.status === 'completed' && <span className="px-2 py-0.5 rounded bg-slate-850 text-slate-500 text-[9px] uppercase font-bold">Closed Token</span>}
                              
                              <button
                                onClick={() => {
                                  // Prioritize emergency approval instantly
                                  setTokens(prev => prev.map(t => {
                                    if (t.id === tok.id) {
                                      return { ...t, tokenNumber: `URG-${t.tokenNumber.split('-')[1] || 'EMG'}` };
                                    }
                                    return t;
                                  }));
                                  triggerBeep(1100, 120);
                                }}
                                className="px-2 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300 text-[9px] rounded font-bold uppercase"
                              >
                                🌟 Set Priority
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ----------------- SUBTAB C: STAFF MANAGEMENT ----------------- */}
              {activeMenu === 'staff' && (
                <div className="space-y-6">
                  
                  <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-805 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Operational Crew Management</h4>
                        <p className="text-xs text-slate-400 font-bold">Add, edit, assign counters, and rate performance index of local post employees.</p>
                      </div>
                      <button
                        onClick={() => { setShowAddStaffModal(true); triggerBeep(900, 100); }}
                        className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-600 font-black text-xs uppercase text-white rounded-xl cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Employee
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {staffList.map((crew) => (
                        <div key={crew.id} className="bg-slate-900 p-4 border border-slate-800 rounded-3xl space-y-3 relative overflow-hidden">
                          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full pointer-events-none"></div>

                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-xs font-black text-white">{crew.name}</h5>
                              <span className="text-[10px] text-indigo-400 font-bold tracking-wider">{crew.role}</span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-505 font-bold">{crew.id}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-b border-slate-850 py-2.5">
                            <div>
                              <span className="text-slate-500 block">Duty Station</span>
                              <span className="font-bold text-slate-300">{crew.counter > 0 ? `Counter ${crew.counter}` : 'Regional Logistics'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Performance Index</span>
                              <span className="font-bold text-amber-300">★ {crew.performance} / 5</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                            {/* Attendance tracker */}
                            <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={crew.attendance === 'present'}
                                onChange={(e) => {
                                  setStaffList(prev => prev.map(s => {
                                    if (s.id === crew.id) {
                                      return { ...s, attendance: e.target.checked ? 'present' : 'absent' };
                                    }
                                    return s;
                                  }));
                                  triggerBeep(550, 60);
                                }}
                                className="rounded text-indigo-600 focus:ring-0"
                              />
                              Attendance Marker
                            </label>

                            <button
                              onClick={() => handleDeleteStaff(crew.id)}
                              className="p-1 px-2.5 bg-red-950/30 text-red-400 hover:bg-red-950/70 border border-red-900/40 text-[9.5px] rounded-lg transition"
                            >
                              Remove Card
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              )}

              {/* Add Crew modal wrapper */}
              <AnimatePresence>
                {showAddStaffModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
                    <form onSubmit={handleCreateStaff} className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
                      <div className="border-b border-slate-850 pb-2">
                        <h4 className="text-sm font-black text-white uppercase">Register Post Team Member</h4>
                        <p className="text-[10.5px] text-slate-400">Add credentials for local system ledger tracking.</p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee Full Name</label>
                        <input
                          type="text"
                          required
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          placeholder="e.g. Anand Gowda"
                          className="w-full bg-slate-800 border border-slate-750/60 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role category</label>
                          <select
                            value={newStaffRole}
                            onChange={(e) => setNewStaffRole(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-750/60 rounded-xl py-1.5 px-3 text-xs text-white outline-none"
                          >
                            <option value="Counter Staff">Counter Crew</option>
                            <option value="Delivery Staff">Delivery Courier</option>
                            <option value="Supervisor">Local Supervisor</option>
                            <option value="Admin">District Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Desk Assignment</label>
                          <input
                            type="number"
                            min={0}
                            max={6}
                            value={newStaffCounter}
                            onChange={(e) => setNewStaffCounter(Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-750/60 rounded-xl py-1.5 px-3 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddStaffModal(false)}
                          className="flex-1 bg-slate-850 hover:bg-slate-800 font-bold py-2 text-xs text-slate-400 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-650 hover:bg-indigo-600 font-black py-2 text-xs text-white uppercase rounded-xl"
                        >
                          Authorize Member
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </AnimatePresence>

              {/* ----------------- SUBTAB D: PARCEL ANALYTICS & LEDGER ----------------- */}
              {activeMenu === 'parcels' && (
                <div className="space-y-6">
                  
                  <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-805 space-y-4">
                    
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">National SpeedPost Cargo Logistics</h4>
                        <p className="text-xs text-slate-450">Track weight distribution indexes, cargo transit timeline events, and delivery predictions.</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => exportCsv('parcels')} className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-xs">
                          📥 Exporter Ledger
                        </button>
                      </div>
                    </div>

                    {/* Integrated Search Bar inside Analytics */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                        <Search className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        placeholder="Smart Search parcel by Tracking ID (e.g., POST-), shipper receipt name, or city destination..."
                        className="w-full bg-slate-900 border border-slate-800 py-2 pl-9 pr-4 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Grid List */}
                    <div className="space-y-3">
                      {parcels
                        .filter(p => !globalSearch || p.trackingId.toLowerCase().includes(globalSearch.toLowerCase()) || p.senderName.toLowerCase().includes(globalSearch.toLowerCase()) || p.destination.toLowerCase().includes(globalSearch.toLowerCase()))
                        .map((parcel) => (
                          <div key={parcel.id} className="p-4 bg-slate-950/70 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1 min-w-0">
                              <span className="text-[9px] font-mono font-black text-amber-300 block">{parcel.trackingId}</span>
                              <h5 className="text-xs font-black text-white truncate leading-none">To: {parcel.receiverName}</h5>
                              <p className="text-[10px] text-slate-400">Shipper: {parcel.senderName} • Route: {parcel.origin} → {parcel.destination}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                              <div className="bg-slate-900 px-2 py-1.5 rounded-lg">
                                <span className="text-slate-500 block">Weight</span>
                                <span className="text-slate-350 font-black">{parcel.weight} g</span>
                              </div>
                              <div className="bg-slate-900 px-2 py-1.5 rounded-lg">
                                <span className="text-slate-500 block">Calculated fee</span>
                                <span className="text-white font-black">₹{parcel.charges}</span>
                              </div>
                              <div className="bg-slate-900 px-2 py-1.5 rounded-lg">
                                <span className="text-slate-500 block">Expected Arrival</span>
                                <span className="text-amber-250 font-bold">{parcel.deliveryPredictionDate}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Status muter */}
                              <select
                                value={parcel.status}
                                onChange={(e) => {
                                  setParcels(prev => prev.map(p => {
                                    if (p.id === parcel.id) {
                                      return { ...p, status: e.target.value as ParcelStatus };
                                    }
                                    return p;
                                  }));
                                  triggerBeep(600, 80);
                                }}
                                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-xl px-2 py-1"
                              >
                                <option value="processing">Processing</option>
                                <option value="accepted">Accepted At desk</option>
                                <option value="dispatched">Dispatched Sort</option>
                                <option value="in_transit">In Transit Cargo</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered Successfully</option>
                              </select>
                            </div>
                          </div>
                        ))}
                    </div>

                  </div>

                </div>
              )}

              {/* ----------------- SUBTAB E: COMPLAINTS & GRIEVANCE CORE ----------------- */}
              {activeMenu === 'complaints' && (
                <div className="space-y-6">
                  
                  <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-805 space-y-4">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Aura Co-Pilot Ombudsperson Desk</h4>
                    <p className="text-xs text-slate-450">Review client grievances. Aura AI automatically tags low, medium, and high severity vectors instantly.</p>

                    <div className="space-y-3.5">
                      {complaints.map((c) => (
                        <div key={c.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center gap-2 flex-wrap">
                            <div>
                              <span className="text-[9.5px] font-extrabold text-red-400 bg-red-950/40 border border-red-900/45 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {c.type.replace('_', ' ')}
                              </span>
                              <span className="text-[10.5px] text-slate-400 ml-2 font-mono">Case REF: #{c.id}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {c.status === 'pending' && <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 text-[9px] uppercase font-bold">Unassigned</span>}
                              {c.status === 'investigating' && <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[9px] uppercase font-bold animate-pulse">In Review</span>}
                              {c.status === 'resolved' && <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 text-[9px] uppercase font-bold">Resolved</span>}

                              <select
                                value={c.status}
                                onChange={(e) => {
                                  setComplaints(prev => prev.map(comp => {
                                    if (comp.id === c.id) {
                                      return { ...comp, status: e.target.value as ComplaintStatus };
                                    }
                                    return comp;
                                  }));
                                  triggerBeep(700, 100);
                                }}
                                className="bg-slate-905 border border-slate-800 text-[10.5px] text-slate-300 rounded px-1.5 py-1"
                              >
                                <option value="pending">Mark Pending</option>
                                <option value="investigating">Mark Reviewing</option>
                                <option value="resolved">Mark Resolved</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-xl">
                            <p className="text-[11px] text-slate-350 italic">"{c.description}"</p>
                            <span className="text-[9.5px] block mt-1.5 font-bold text-slate-500 text-right">— Submitter: {c.customerName} (Tracking AWB: {c.trackingId})</span>
                          </div>

                          {/* AI recommended resolution generator */}
                          <div className="p-3 bg-indigo-950/70 border border-indigo-500/20 rounded-xl space-y-1">
                            <span className="block text-[8px] font-black tracking-widest text-indigo-400 uppercase leading-none">Aura Ombudsman Suggested Auto-Reply</span>
                            <p className="text-[10px] text-indigo-150 leading-relaxed font-semibold">
                              "We sincere apologize for the transit delta. Your parcel #{c.trackingId} was delayed due to regional sorting congestion. The dispatch is out for delivery today."
                            </p>
                            
                            <button
                              onClick={() => {
                                triggerBeep(1100, 100);
                                setComplaints(prev => prev.map(comp => {
                                  if (comp.id === c.id) {
                                    return { ...comp, status: 'resolved', aiResponse: 'Resolution and concession credit applied.' };
                                  }
                                  return comp;
                                }));
                                alert("Sent automated settlement communication and updated tracking priority.");
                              }}
                              className="text-[9.5px] font-black text-amber-400 uppercase tracking-wider block pt-1.5"
                            >
                              ✓ Send Suggestion & Close Grievance Case →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              )}

              {/* ----------------- SUBTAB F: REVENUE REPORTS & LEDGER ----------------- */}
              {activeMenu === 'revenue' && (
                <div className="space-y-6">
                  
                  <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-805 space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Dynamic Treasury & Ledger Comparison</h4>
                        <p className="text-xs text-slate-450">Track walk-in service collections, Speed Post sales volumes, and ledger margins.</p>
                      </div>
                      <button onClick={() => exportCsv('revenue')} className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-xs uppercase rounded-xl">
                        📥 Download Daily Ledger PDF
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {[
                        { service: 'Speed Post Dispatches', revenue: '₹1,54,000', margin: '48.2% operating', flag: 'high' },
                        { service: 'Post Savings Accounts', revenue: '₹2,10,000', margin: '91.8% deposit', flag: 'nominal' },
                        { service: 'Retail Stamps & Registry', revenue: '₹78,800', margin: '35.4% operating', flag: 'low' }
                      ].map((rev, idx) => (
                        <div key={idx} className="bg-slate-900 p-4 border border-slate-800 rounded-3xl space-y-1">
                          <span className="block text-[10px] text-slate-505 font-bold uppercase tracking-wider">{rev.service}</span>
                          <span className="text-2xl font-black text-white">{rev.revenue}</span>
                          <span className="block text-[8.5px] text-slate-400 mt-0.5">{rev.margin}</span>
                        </div>
                      ))}
                    </div>

                    {/* Integrated mini graphical summary */}
                    <div className="bg-slate-950 p-4 rounded-3xl border border-slate-850">
                      <span className="text-xs font-black text-white block uppercase tracking-wider mb-2">Category Revenue Spread (SVG Graphic)</span>
                      
                      <div className="space-y-3">
                        {[
                          { category: 'Speed Post Services', share: '35%', fillClass: 'bg-indigo-500' },
                          { category: 'Express Parcels Registered', share: '48%', fillClass: 'bg-emerald-500' },
                          { category: 'Savings Ledger Deposits', share: '17%', fillClass: 'bg-amber-400' }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span className="font-bold">{item.category}</span>
                              <span className="font-mono text-white">{item.share} shares</span>
                            </div>
                            <div className="h-2 w-full bg-slate-805 rounded-full overflow-hidden">
                              <div className={`h-full ${item.fillClass}`} style={{ width: item.share }}></div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* ----------------- SUBTAB G: BRANCH CONTROL ----------------- */}
              {activeMenu === 'branches' && (
                <div className="space-y-6">
                  
                  <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-805 space-y-4">
                    <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">Karnataka Regional Post Office Branches</h4>
                    <p className="text-xs text-slate-450">Compare real-time queue workloads, gross daily sales ledgers, and delay warnings.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {branches.map((b) => (
                        <div key={b.id} className="bg-slate-900 p-4 border border-slate-800 rounded-3xl space-y-2 relative overflow-hidden">
                          <div className="absolute right-2 top-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              b.delayRisk === 'High' ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-slate-850 text-slate-400'
                            }`}>
                              Risk: {b.delayRisk}
                            </span>
                          </div>

                          <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono font-black">{b.id} Location ID</span>
                          <h5 className="text-xs font-black text-white">{b.name}</h5>
                          <span className="block text-[10px] text-slate-455">{b.address}</span>

                          <div className="grid grid-cols-2 gap-2 text-[10px] p-2 bg-slate-950 rounded-xl mt-3">
                            <div>
                              <span className="text-slate-500 block">Active Desks</span>
                              <span className="font-bold text-white">{b.activeCounters} open counters</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Sales Ledger</span>
                              <span className="font-bold text-emerald-400">₹{b.revenue.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase leading-none">
                              <span>Visitor Crowd stress</span>
                              <span>{b.crowdScore}% density</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-805 rounded-full overflow-hidden">
                              <div className={`h-full ${b.crowdScore > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${b.crowdScore}%` }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Integrated Smart Announcement section requested */}
                    <div className="pt-4 border-t border-slate-850 space-y-3">
                      <span className="block text-xs font-black text-white uppercase tracking-wider">📢 Broadcaster Smart Announcement Hub</span>
                      
                      <div className="flex flex-col gap-3">
                        <textarea
                          placeholder="Compose a public notification message. E.g. Maintenance scheduled on Counters, holiday alerts, or Priority queues updates..."
                          value={managerMessageBroadcast}
                          onChange={(e) => setManagerMessageBroadcast(e.target.value)}
                          className="w-full bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 h-16 resize-none"
                        />
                        
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] text-slate-400">Broadcast Audiance:</span>
                            <select
                              value={broadcastTarget}
                              onChange={(e) => setBroadcastTarget(e.target.value as any)}
                              className="bg-slate-905 border border-slate-800 text-[10.5px] py-1 px-2 text-slate-300 rounded-lg cursor-pointer"
                            >
                              <option value="all">All Stakeholders</option>
                              <option value="staff">Internal Counters & Couriers</option>
                              <option value="citizens">Citizen Platform Apps</option>
                            </select>
                          </div>
                          
                          <button
                            onClick={sendBroadcast}
                            className="bg-indigo-650 hover:bg-indigo-600 font-extrabold text-[10px] uppercase text-white px-4 py-1.5 rounded-xl transition flex items-center gap-1 leading-none"
                          >
                            <Megaphone className="w-3.5 h-3.5 animate-pulse" />
                            Deploy Bulletin Now
                          </button>
                        </div>
                      </div>

                      {/* Display history */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-slate-450 uppercase block mb-1.5">Broadcast Logs ({broadcastHistory.length})</span>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {broadcastHistory.map((cast) => (
                            <div key={cast.id} className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between gap-3 text-[10.5px]">
                              <div>
                                <p className="text-slate-300">"{cast.text}"</p>
                                <span className="block text-[8.5px] font-bold text-slate-505 uppercase tracking-wide mt-1">Deployed {cast.date} For {cast.target.toUpperCase()}</span>
                              </div>
                              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded shrink-0">Deployed</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* ----------------- SUBTAB H: EMERGENCY SYSTEM SUSPENSION ----------------- */}
              {activeMenu === 'emergency' && (
                <div className="space-y-6">
                  
                  <div className="bg-red-950/20 border-2 border-red-500/60 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-8 h-8 text-red-500 animate-bounce" />
                      <div>
                        <h4 className="text-lg font-black text-red-100 uppercase tracking-wide leading-none">Commandant Emergency Control Panel</h4>
                        <p className="text-xs text-red-300 mt-1">Suspend active service, dispatch sirens, hold customer lobbies or close active counters instantly.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-900 p-4 border border-slate-800 rounded-3xl space-y-3">
                        <h5 className="font-extrabold text-sm text-white">Lobby Queue Lockdown</h5>
                        <p className="text-xs text-slate-400">Instantly halt the ticket dispensers, and pause the calling index for all active counters.</p>
                        
                        <button
                          onClick={() => {
                            setEmergencyLockdownMode(p => !p);
                            triggerBeep(1200, 300);
                          }}
                          className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-center cursor-pointer transition ${
                            emergencyLockdownMode 
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                              : 'bg-red-650 hover:bg-red-700 text-white animate-pulse'
                          }`}
                        >
                          {emergencyLockdownMode ? 'Unlock Queue Dispensers' : 'Halt ticket dispensers (Engage Red Alert)'}
                        </button>
                      </div>

                      <div className="bg-slate-900 p-4 border border-slate-800 rounded-3xl space-y-3">
                        <h5 className="font-extrabold text-sm text-white">Manual Token Override</h5>
                        <p className="text-xs text-slate-400">Generate a high priority emergency token which overrides all normal queues instantly.</p>
                        
                        <button
                          onClick={() => {
                            const newEmg = {
                              id: `TK-EMG-${Math.floor(Math.random() * 800) + 100}`,
                              tokenNumber: `EMG-${Math.floor(Math.random() * 90) + 10}`,
                              serviceType: 'Emergency Welfare Support',
                              date: new Date().toISOString().split('T')[0],
                              timeSlot: 'Immediate',
                              estimatedWaitMinutes: 0,
                              status: 'waiting' as TokenStatus,
                              userId: 'cust-900',
                              customerName: 'Priority Citizen',
                            };
                            setTokens(prev => [newEmg, ...prev]);
                            triggerBeep(1300, 400);
                            alert("⚠️ High Priority Emergency override token called in server databases!");
                          }}
                          className="w-full bg-slate-805 hover:bg-slate-750 text-slate-250 py-2.5 rounded-xl font-extrabold text-xs uppercase cursor-pointer"
                        >
                          Generate Emergency Override Token
                        </button>
                      </div>
                    </div>

                    {/* Threat Report Hub */}
                    <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
                      <span className="text-xs font-black text-white block uppercase tracking-wider">Aura Anti-Fraud & Spam Threat Detector</span>
                      <p className="text-[11px] text-slate-400">System constantly evaluates inbound SMS messages, check sums, and postal receipt requests.</p>

                      <div className="space-y-2">
                        {fraudReports.map((fr) => (
                          <div key={fr.id} className="p-3 bg-slate-950 rounded-2xl flex items-center justify-between gap-3 text-[11px]">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-red-400 font-extrabold uppercase bg-red-950/40 px-2 py-0.5 rounded leading-none">{fr.type}</span>
                              <p className="text-slate-300 font-bold">Target Node ID: {fr.target}</p>
                              <p className="text-[9.5px] text-slate-500">{fr.details}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="block text-[8.5px] font-bold uppercase text-slate-400 leading-none mb-1">Risk probability</span>
                              <span className="text-xs font-mono font-black text-red-400">{fr.riskScore}% Match risk</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </main>

            {/* HIGH-END FUTURISTIC COMMAND FOOTER */}
            <footer className="mt-auto py-3 bg-slate-900/40 border-t border-slate-850 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Aura Commandant Suite v3.2 • Secure Cryptographic Session: {employeeId} • Bangalore HQ Region
            </footer>

          </div>

        </div>
      )}

    </div>
  );
}
