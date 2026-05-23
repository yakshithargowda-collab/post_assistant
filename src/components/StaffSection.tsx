import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Clock, 
  FileCheck, 
  ShieldCheck, 
  QrCode, 
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
  Volume2, 
  Sliders, 
  Smartphone, 
  User as UserIcon,
  Check,
  X,
  CreditCard,
  Lock,
  Menu,
  ChevronLeft,
  VolumeX,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Token, Parcel, Complaint, ParcelStatus, TokenStatus, ComplaintStatus } from '../types';

interface StaffSectionProps {
  parcels: Parcel[];
  setParcels: React.Dispatch<React.SetStateAction<Parcel[]>>;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  langCode: 'en' | 'kn' | 'hi' | 'te';
}

export default function StaffSection({
  parcels,
  setParcels,
  tokens,
  setTokens,
  complaints,
  setComplaints,
  currentUser,
  setCurrentUser,
  langCode
}: StaffSectionProps) {
  // Staff Local Auth & Sidebar States
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(currentUser?.role === 'staff' || currentUser?.role === 'admin');
  const [staffRole, setStaffRole] = useState<'counter' | 'delivery' | 'manager'>('manager');
  const [employeeId, setEmployeeId] = useState<string>('EMP-4015');
  const [staffEmail, setStaffEmail] = useState<string>('admin@post.gov');
  const [staffPassword, setStaffPassword] = useState<string>('••••••••');
  const [showOtpScreen, setShowOtpScreen] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [loginError, setLoginError] = useState<string>('');
  
  // Navigation & Sayout
  const [staffTab, setStaffTab] = useState<'dashboard' | 'queue' | 'parcels' | 'scanner' | 'deliveries' | 'complaints' | 'reports' | 'counters' | 'settings'>('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [playbackAudioAlert, setPlaybackAudioAlert] = useState<boolean>(true);
  
  // Notification States
  const [staffNotifications, setStaffNotifications] = useState<any[]>([
    { id: 'sn-1', title: 'New Token Booked', text: 'Token SPD-009 requested for Speed Post Counter.', time: '2 mins ago', unread: true, type: 'info' },
    { id: 'sn-2', title: 'Queue Overload Warning', text: 'Lobby wait times exceeded 15 minutes threshold.', time: '10 mins ago', unread: true, type: 'warning' },
    { id: 'sn-3', title: 'Grievance Registered', text: 'Lost package claim filed for Tracking POST-7721-IN', time: '1 hr ago', unread: false, type: 'danger' }
  ]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);

  // Settings Panel Config
  const [staffCardName, setStaffCardName] = useState<string>('Laxmi Narayan');
  const [staffActiveCounter, setStaffActiveCounter] = useState<number>(3);
  const [staffMuteAll, setStaffMuteAll] = useState<boolean>(false);
  const [useDarkTheme, setUseDarkTheme] = useState<boolean>(false);

  // Queue Management State variables
  const [estimatedWaitMatrix, setEstimatedWaitMatrix] = useState<number>(12); // in minutes
  const [activeLobbyCounters, setActiveLobbyCounters] = useState<any[]>([
    { id: 1, name: 'Counter 1 - Savings & PLI', status: 'open', employee: 'S. Sharma', load: 'Medium' },
    { id: 2, name: 'Counter 2 - General Post', status: 'closed', employee: 'None', load: 'N/A' },
    { id: 3, name: 'Counter 3 - Speed Post Desk', status: 'open', employee: 'L. Narayan (You)', load: 'High' }
  ]);

  // AI Free Counter Detector logic algorithm
  const detectFreeCounter = () => {
    // Filter open counters
    const openCounters = activeLobbyCounters.filter(c => c.status === 'open');
    if (openCounters.length === 0) {
      return {
        id: null,
        name: "None (All counters closed)",
        confidence: 0,
        score: 999,
        reason: "Every lobby dispatch desk is currently logged offline. Please open some counters in Counter Status panel."
      };
    }

    // Count active waiting or calling tokens for each open counter
    const activeTokensPerCounter: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    tokens.forEach(tok => {
      if (tok.status === 'calling' && tok.counterNumber) {
        activeTokensPerCounter[tok.counterNumber] = (activeTokensPerCounter[tok.counterNumber] || 0) + 1;
      }
    });

    // Find the counter with the absolute lowest load weight
    const candidates = openCounters.map(c => {
      let score = activeTokensPerCounter[c.id] || 0;
      if (c.load === 'High') score += 3;
      if (c.load === 'Medium') score += 1;
      if (c.load === 'Low') score += 0;
      return {
        counter: c,
        score,
        currentInCall: activeTokensPerCounter[c.id] || 0
      };
    });

    candidates.sort((a, b) => a.score - b.score);
    const topCandidate = candidates[0];

    let confidence = 95;
    let reason = "";
    if (topCandidate.currentInCall === 0) {
      reason = `${topCandidate.counter.name} has 0 currently active assigned customers and is fully idle. Ready for direct routing.`;
      confidence = 98;
    } else {
      reason = `${topCandidate.counter.name} has the lowest density workload score of ${topCandidate.score} (${topCandidate.currentInCall} serving, nominal ${topCandidate.counter.load} load).`;
      confidence = 87;
    }

    return {
      id: topCandidate.counter.id,
      name: topCandidate.counter.name,
      confidence,
      score: topCandidate.score,
      reason,
      otherCandidates: candidates.slice(1)
    };
  };

  // Parcel creation & edits
  const [showAddParcelModal, setShowAddParcelModal] = useState<boolean>(false);
  const [newParcelSender, setNewParcelSender] = useState<string>('');
  const [newParcelReceiver, setNewParcelReceiver] = useState<string>('');
  const [newParcelReceiverPhone, setNewParcelReceiverPhone] = useState<string>('');
  const [newParcelReceiverAddress, setNewParcelReceiverAddress] = useState<string>('');
  const [newParcelName, setNewParcelName] = useState<string>('');
  const [newParcelWeight, setNewParcelWeight] = useState<number>(320);
  const [newParcelType, setNewParcelType] = useState<'standard' | 'speed_post' | 'registered'>('speed_post');
  const [newParcelOrigin, setNewParcelOrigin] = useState<string>('Indiranagar Post Office');
  const [newParcelDestination, setNewParcelDestination] = useState<string>('Deoghar Airport SO, Jharkhand');

  const [editingParcelId, setEditingParcelId] = useState<string | null>(null);
  const [editParcelStatus, setEditParcelStatus] = useState<ParcelStatus>('processing');
  const [editParcelLocation, setEditParcelLocation] = useState<string>('');
  const [editParcelRemarks, setEditParcelRemarks] = useState<string>('');

  // QR Code Scanner simulator state
  const [qrScanningActive, setQrScanningActive] = useState<boolean>(false);
  const [qrScanResult, setQrScanResult] = useState<Parcel | null>(null);
  const [qrScanStatus, setQrScanStatus] = useState<'idle' | 'scanning' | 'success' | 'not_found'>('idle');

  // Customer Delivery Verification TouchPad
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [selectedVerifyParcel, setSelectedVerifyParcel] = useState<Parcel | null>(null);
  const [verificationOtpInput, setVerificationOtpInput] = useState<string>('');
  const [verificationAadhaarInput, setVerificationAadhaarInput] = useState<string>('');
  const [verificationPassed, setVerificationPassed] = useState<'idle' | 'success' | 'failed'>('idle');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [canvasCleared, setCanvasCleared] = useState<boolean>(true);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Complaints & Grievance Responses
  const [replyComplaintId, setReplyComplaintId] = useState<string | null>(null);
  const [complaintReplyText, setComplaintReplyText] = useState<string>('');
  const [complaintResolveProof, setComplaintResolveProof] = useState<string>('GPO-SATELLITE-LOGS-DISPATCH.pdf');
  const [complaintPriority, setComplaintPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  // Voice simulation
  const [voiceControlActive, setVoiceControlActive] = useState<boolean>(false);
  const [voiceMessage, setVoiceMessage] = useState<string>('');

  // Synchronise parent login session if present
  useEffect(() => {
    if (currentUser?.role === 'staff' || currentUser?.role === 'admin') {
      setIsStaffLoggedIn(true);
      if (currentUser?.role === 'admin') {
        setStaffRole('manager');
        setStaffCardName(currentUser.fullName);
      } else {
        setStaffRole('counter');
        setStaffCardName(currentUser.fullName);
      }
    }
  }, [currentUser]);

  // OTP Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (showOtpScreen && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, otpTimer]);

  // Digital chime triggers sound
  const playPostalChime = () => {
    if (staffMuteAll) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gainNode.gain.setValueAtTime(0.15, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      // Play soft dual-tone chime (e.g., G5 then C6)
      const now = audioCtx.currentTime;
      playTone(784, now, 0.4); // G5
      playTone(1046, now + 0.15, 0.6); // C6
    } catch (e) {
      console.log('Web Audio api chime block: ', e);
    }
  };

  // Staff Authentication Process
  const handleStaffLoginRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!staffEmail.includes('@') || staffPassword.length < 4) {
      setLoginError('Invalid enterprise credentials.');
      return;
    }
    // Proceed to OTP Simulation
    setShowOtpScreen(true);
    setOtpTimer(30);
    playPostalChime();
  };

  const handleVerifyOtp = () => {
    if (otpCode === '1234' || otpCode === '4321' || otpCode.length === 4) {
      const simulatedUser: User = {
        id: employeeId === 'EMP-4015' ? 'user-staff-1' : `emp-${Math.floor(Math.random() * 10000)}`,
        username: staffEmail,
        email: staffEmail,
        role: staffRole === 'manager' ? 'admin' : 'staff',
        fullName: staffCardName || (staffRole === 'manager' ? 'Chief Superintendent' : 'Senior Post Handler')
      };
      
      setCurrentUser(simulatedUser);
      setIsStaffLoggedIn(true);
      setShowOtpScreen(false);
      setStaffTab('dashboard');
      
      // Trigger a success notification banner
      addLiveNotification('Dashboard Log-In Recognized', `Welcome operator ${simulatedUser.fullName}. Your terminal Counter ${staffActiveCounter} is now online.`, 'success');
    } else {
      alert('Incorrect OTP. Try entering 1234 or any 4 digit passcode.');
    }
  };

  // Log notifications helper
  const addLiveNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const fresh = {
      id: `sn-${Date.now()}`,
      title,
      text: message,
      time: 'Just now',
      unread: true,
      type
    };
    setStaffNotifications(prev => [fresh, ...prev]);
    playPostalChime();
  };

  // QUEUE OPERATIONS: CALL NEXT / HOLD / COMPLETE
  const handleCallToken = (tokenId: string, forceCounter?: number) => {
    const targetCounter = forceCounter || staffActiveCounter;
    // Set token to calling
    setTokens(prev => prev.map(t => 
      t.id === tokenId ? { ...t, status: 'calling', counterNumber: targetCounter } : t
    ));
    
    // Play sound and notification
    const findTok = tokens.find(t => t.id === tokenId);
    if (findTok) {
      addLiveNotification('Token Advanced', `Calling Token ${findTok.tokenNumber} to Counter ${targetCounter}`, 'info');
    }
    playPostalChime();
  };

  const handleSkipToken = (tokenId: string) => {
    setTokens(prev => prev.map(t => 
      t.id === tokenId ? { ...t, status: 'cancelled' } : t
    ));
    addLiveNotification('Token Skipped', 'Lobby token marked absent/cancelled.', 'warning');
  };

  const handleHoldToken = (tokenId: string) => {
    setTokens(prev => prev.map(t => 
      t.id === tokenId ? { ...t, status: 'waiting', estimatedWaitMinutes: t.estimatedWaitMinutes + 5 } : t
    ));
    addLiveNotification('Token Placed on Hold', 'Token moved down for customer prep delay.', 'info');
  };

  const handleCompleteToken = (tokenId: string) => {
    setTokens(prev => prev.map(t => 
      t.id === tokenId ? { ...t, status: 'completed' } : t
    ));
    addLiveNotification('Service Completed', 'Lobi token processed and closed out.', 'success');
  };

  // ADD NEW PARCEL DIGITALLY
  const handleCreateParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcelSender || !newParcelReceiver || !newParcelDestination) {
      alert('Sender, receiver and destination details are necessary.');
      return;
    }

    const price = Math.round(45 + (newParcelWeight / 10));
    const newTrackingId = `POST-${Math.floor(1000 + Math.random() * 9000)}-IN`;

    const freshParcel: Parcel = {
      id: `par-${Date.now()}`,
      trackingId: newTrackingId,
      senderName: newParcelSender,
      receiverName: newParcelReceiver,
      receiverPhone: newParcelReceiverPhone,
      receiverAddress: newParcelReceiverAddress,
      parcelName: newParcelName || 'Documents / Package',
      weight: newParcelWeight,
      type: newParcelType,
      status: 'accepted',
      origin: newParcelOrigin,
      destination: newParcelDestination,
      charges: price,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: 'accepted',
          timestamp: new Date().toISOString(),
          location: newParcelOrigin,
          description: 'Shipment handed over digitally to AI GPO and parcel tracking initiated.'
        }
      ],
      deliveryPredictionDate: '2-4 Days'
    };

    setParcels(prev => [freshParcel, ...prev]);
    setShowAddParcelModal(false);
    
    // Reset forms
    setNewParcelSender('');
    setNewParcelReceiver('');
    setNewParcelReceiverPhone('');
    setNewParcelReceiverAddress('');
    setNewParcelName('');
    
    addLiveNotification('New Parcel Registered', `Created Tracking ID: ${newTrackingId} smoothly.`, 'success');
  };

  // EDIT STATUS OF EXISTENT PARCEL
  const handleUpdateParcelStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParcelId) return;

    setParcels(prev => prev.map(p => {
      if (p.id === editingParcelId) {
        const freshTimeline = [...p.timeline];
        if (editParcelStatus) {
          freshTimeline.push({
            status: editParcelStatus,
            timestamp: new Date().toISOString(),
            location: editParcelLocation || 'Regional Sorting Center Hub',
            description: editParcelRemarks || `Shipment status advanced to ${editParcelStatus.toUpperCase().replace('_', ' ')}`
          });
        }
        return {
          ...p,
          status: editParcelStatus,
          timeline: freshTimeline
        };
      }
      return p;
    }));

    const updateMsg = `Tracking ID status updated successfully.`;
    addLiveNotification('Parcel Status Modified', updateMsg, 'info');
    setEditingParcelId(null);
    setEditParcelRemarks('');
    setEditParcelLocation('');
  };

  // SIGNATURE TOUCH TRACKPAD LOGIC
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#312e81'; // Deep Indigo
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setCanvasCleared(false);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasCleared(true);
  };

  // CUSTOMER VERIFICATION AND HANDOVER
  const handleFinalDeliveryHandover = () => {
    if (!verificationAadhaarInput || !verificationOtpInput) {
      alert('Kindly fill in Aadhar and OTP components before handoff.');
      return;
    }
    
    setVerificationPassed('success');
    
    if (selectedVerifyParcel) {
      setParcels(prev => prev.map(p => {
        if (p.id === selectedVerifyParcel.id) {
          return {
            ...p,
            status: 'delivered',
            timeline: [
              ...p.timeline,
              {
                status: 'delivered',
                timestamp: new Date().toISOString(),
                location: p.destination,
                description: `Delivered safely to customer. Recipient Verified securely via OTP & Aadhaar OTP and signed.`
              }
            ]
          };
        }
        return p;
      }));

      addLiveNotification('Secure Delivery Handoff Complete', `Parcel package ${selectedVerifyParcel.trackingId} delivered correctly. User verified.`, 'success');
    }

    setTimeout(() => {
      setShowVerificationModal(false);
      setSelectedVerifyParcel(null);
      setVerificationPassed('idle');
      setVerificationAadhaarInput('');
      setVerificationOtpInput('');
    }, 1800);
  };

  // SIMULATE QR CODE SCAN
  const handleGenerateQrScan = () => {
    setQrScanStatus('scanning');
    setQrScanResult(null);
    setQrScanningActive(true);

    setTimeout(() => {
      // Pick a random parcel
      if (parcels.length > 0) {
        const randParcel = parcels[Math.floor(Math.random() * parcels.length)];
        setQrScanResult(randParcel);
        setQrScanStatus('success');
        addLiveNotification('QR Smart Scan Triggered', `Recognized dispatch parcel ${randParcel.trackingId}`, 'success');
      } else {
        setQrScanStatus('not_found');
      }
    }, 1800);
  };

  // SIMULATE VOICE ANNOUNCEMENTS
  const triggerVoicePagingSimulation = (tokenNumber: string, counterNumber: number) => {
    setVoiceControlActive(true);
    setVoiceMessage(`"PAGING ANNCOUNCEMENT: Token ${tokenNumber}, please proceed immediately to Counter ${counterNumber}."`);
    playPostalChime();
    
    try {
      if ('speechSynthesis' in window) {
        const announcement = new SpeechSynthesisUtterance(`Token ${tokenNumber}, please proceed immediately to Counter ${counterNumber}.`);
        announcement.rate = 0.9;
        announcement.pitch = 1.05;
        window.speechSynthesis.speak(announcement);
      }
    } catch (e) {
      console.log('Voice synthesis blocked by iframe sandbox.');
    }

    setTimeout(() => {
      setVoiceControlActive(false);
      setVoiceMessage('');
    }, 5000);
  };

  // GLOBAL SEARCH FILTER LOGIC
  const filteredTokens = tokens.filter(tok => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      tok.tokenNumber.toLowerCase().includes(q) ||
      tok.customerName.toLowerCase().includes(q) ||
      tok.serviceType.toLowerCase().includes(q) ||
      (tok.customerPhone && tok.customerPhone.includes(q))
    );
  });

  const filteredParcels = parcels.filter(p => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      p.trackingId.toLowerCase().includes(q) ||
      p.senderName.toLowerCase().includes(q) ||
      p.receiverName.toLowerCase().includes(q) ||
      p.destination.toLowerCase().includes(q) ||
      (p.parcelName && p.parcelName.toLowerCase().includes(q))
    );
  });

  const filteredComplaints = complaints.filter(c => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      c.trackingId.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`min-h-screen font-sans ${useDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col`}>
      
      {/* ----------------- STAFF LOGIN GATEWAY ----------------- */}
      <AnimatePresence>
        {!isStaffLoggedIn && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <div className="w-full max-w-md bg-white text-slate-800 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>

              {/* Login Banner */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-905 p-6 text-center text-white border-b border-indigo-950/60 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/15 flex items-center justify-center border border-indigo-400/30 text-indigo-400 mb-2.5 shadow-inner">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-xl font-extrabold tracking-wide uppercase">AI GPO STAFF GATEWAY</h2>
                <p className="text-[11px] text-indigo-300 mt-0.5">National Post Intelligent Operations Dashboard Terminal</p>
              </div>

              {/* Error box */}
              {loginError && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Step 1: Username & Profile Login details */}
              {!showOtpScreen ? (
                <form onSubmit={handleStaffLoginRequest} className="p-6 space-y-4">
                  
                  {/* Role picker */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Authorized Terminal Role</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'counter', title: 'Counter Staff', desc: 'Counters 1-3' },
                        { key: 'delivery', title: 'Carrier Staff', desc: 'Deliveries' },
                        { key: 'manager', title: 'Postmaster', desc: 'Manager View' }
                      ].map((roleOpt) => (
                        <button
                          key={roleOpt.key}
                          type="button"
                          onClick={() => {
                            setStaffRole(roleOpt.key as any);
                            if (roleOpt.key === 'manager') {
                              setStaffEmail('admin@post.gov');
                              setEmployeeId('EMP-4015');
                              setStaffCardName('Chief Superintendent');
                            } else if (roleOpt.key === 'counter') {
                              setStaffEmail('staff@post.gov');
                              setEmployeeId('EMP-302');
                              setStaffCardName('Laxmi Narayan');
                            } else {
                              setStaffEmail('delivery_carrier_9@post.gov');
                              setEmployeeId('EMP-107');
                              setStaffCardName('Ravi Kumar');
                            }
                          }}
                          className={`p-2 rounded-xl text-center border transition focus:outline-none flex flex-col justify-center items-center cursor-pointer ${
                            staffRole === roleOpt.key 
                              ? 'bg-indigo-50/85 border-indigo-500 text-indigo-950 font-bold shadow-xs' 
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50 text-slate-600'
                          }`}
                        >
                          <span className="text-xs">{roleOpt.title}</span>
                          <span className="text-[9px] scale-90 font-medium text-slate-400 mt-0.5">{roleOpt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Employee ID Code</label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. EMP-4015"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Internal Post GPO Email</label>
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="e.g. staff@post.gov"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Passphrase password */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Key Passphrase</label>
                    <input
                      type="password"
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Biometric Mock Overlay */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      FaceID / Biometric Sensor online
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        alert('Simulating face recognition index match scans... Access granted.'); 
                        setStaffEmail(staffRole === 'manager' ? 'admin@post.gov' : 'staff@post.gov');
                        setShowOtpScreen(true);
                        setOtpTimer(30);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      Scan Biometric
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer shadow-md uppercase tracking-wider"
                  >
                    Send One-Time OTP Verification Key
                  </button>

                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => alert('OTP reset instruction sent to associated Superindendent recovery device.')}
                      className="text-[10px] text-slate-400 hover:text-indigo-700 font-bold underline transition"
                    >
                      Forgot Postmaster ID Access passkey?
                    </button>
                  </div>

                </form>
              ) : (
                /* Step 2: OTP screen simulation */
                <div className="p-6 space-y-4">
                  <div className="text-center space-y-1">
                    <p className="font-bold text-slate-700 text-sm">Security Code Verification Needed</p>
                    <p className="text-[11px] text-slate-400">Enter the 4-digit token code sent securely to operator device (+91 9*****4015)</p>
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-3">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="XXXX"
                      className="w-32 bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 text-center text-lg font-black tracking-widest text-slate-900 py-2.5 rounded-2xl outline-none"
                    />
                    
                    <p className="text-[10px] text-slate-400">
                      {otpTimer > 0 ? (
                        <span>Code expires in {otpTimer}s</span>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => { setOtpTimer(30); alert('New OTP issued: 1234'); }} 
                          className="text-indigo-600 font-bold underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-2xl text-[10px] font-semibold text-center leading-relaxed">
                    💡 <span className="font-extrabold text-indigo-950">Test Guideline:</span> Enter <strong>1234</strong> or <strong>4321</strong> to bypass and login instantly!
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOtpScreen(false)}
                      className="w-1/3 bg-slate-105 hover:bg-slate-100 font-bold text-slate-600 py-3 text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="w-2/3 bg-indigo-900 hover:bg-indigo-950 text-white font-black py-3 text-xs rounded-xl shadow-md transition cursor-pointer uppercase tracking-widest"
                    >
                      Authenticate Access
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- CORE MODERN STAFF TEMPLATE LAYOUT ----------------- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* COLLAPSIBLE SIDEBAR PANE */}
        <div className={`shadow-md border-r shrink-0 transition-all duration-300 ${
          useDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-indigo-950 border-indigo-900 text-slate-100'
        } ${sidebarExpanded ? 'w-64' : 'w-16'} hidden md:flex flex-col`}>
          
          {/* Brand/Office Identity */}
          <div className="p-4 flex items-center justify-between border-b border-indigo-900/40">
            {sidebarExpanded && (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/35">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xs font-black tracking-wider uppercase text-white truncate">AI GPO Terminal</h1>
                  <p className="text-[9px] text-indigo-300 font-medium">Emp: {employeeId}</p>
                </div>
              </div>
            )}
            <button 
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-1 rounded bg-indigo-900/40 text-indigo-300 hover:text-white transition focus:outline-none cursor-pointer"
            >
              {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4 mx-auto" />}
            </button>
          </div>

          {/* Quick Profile Widget */}
          {sidebarExpanded && isStaffLoggedIn && (
            <div className="p-4 bg-indigo-900/20 border-b border-indigo-900/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-400 shrink-0 border border-indigo-400 overflow-hidden">
                  <img 
                    src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{staffCardName}</p>
                  <p className="text-[10px] text-amber-300 uppercase font-black tracking-widest mt-0.5">{staffRole}</p>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION ITEMS */}
          <div className="p-3 flex-1 flex flex-col gap-1.5 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'queue', label: 'Queue Management', icon: Users, badge: tokens.filter(t => t.status === 'waiting').length },
              { id: 'parcels', label: 'Parcel Registry', icon: FileCheck },
              { id: 'scanner', label: 'QR Scan Terminal', icon: QrCode },
              { id: 'deliveries', label: 'Carrier Handover', icon: MapPin },
              { id: 'complaints', label: 'Grievance Desk', icon: FileText, badge: complaints.filter(c => c.status === 'pending').length },
              { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
              { id: 'counters', label: 'Counter Status', icon: Sliders },
              { id: 'settings', label: 'Profile Settings', icon: UserIcon }
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = staffTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setStaffTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition relative group cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-650 text-white font-bold shadow-xs' 
                      : 'text-indigo-200 hover:bg-indigo-900/40 hover:text-white'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-200'}`} />
                  {sidebarExpanded && <span className="truncate">{item.label}</span>}
                  
                  {/* Badge count info */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on collapsed state */}
                  {!sidebarExpanded && (
                    <div className="absolute left-16 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition duration-300 font-bold z-40 whitespace-nowrap shadow-md">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Logout Action footer */}
          <div className="p-4 border-t border-indigo-900/40 space-y-2">
            <button
              onClick={() => {
                setIsStaffLoggedIn(false);
                setCurrentUser(null);
                alert('Staff session closed securely.');
              }}
              className="w-full text-left flex items-center gap-3 px-3 py-2 text-xs text-red-300 hover:text-red-100 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              {sidebarExpanded && <span className="font-bold">Logout terminal</span>}
            </button>
          </div>

        </div>

        {/* WORKSPACE AREA CONTAINER */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* HEADER DASHBOARD BAR */}
          <header className={`h-16 shrink-0 flex items-center justify-between px-6 border-b ${
            useDarkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'
          }`}>
            
            <div className="flex items-center gap-3">
              {/* Responsive mobile menu button */}
              <button 
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="md:hidden p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">AI POST CORE terminal</span>
                <span className="text-xs text-slate-400 px-2 font-black">•</span>
                <span className="text-xs font-bold text-slate-500">Karnataka Intranet Hub</span>
              </div>
            </div>

            {/* Smart search & actions */}
            <div className="flex items-center gap-4">
              
              {/* Global Query Search bar */}
              <div className="relative max-w-xs hidden md:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Universal auditing search..."
                  className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-800 outline-none w-64 focus:ring-2 focus:ring-indigo-500"
                />
                {globalSearchQuery && (
                  <button onClick={() => setGlobalSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-705">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sound toggle */}
              <button 
                onClick={() => setStaffMuteAll(!staffMuteAll)} 
                className={`p-2 rounded-xl transition cursor-pointer ${
                  staffMuteAll ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                title={staffMuteAll ? "Audio signals disabled" : "Audio signals online"}
              >
                {staffMuteAll ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Notification icon log */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotificationDropdown(!showNotificationDropdown);
                    // Reset notifications badge
                    setStaffNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                  }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition relative cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {staffNotifications.some(n => n.unread) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </button>

                {/* Dropdown element */}
                <AnimatePresence>
                  {showNotificationDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-40 text-slate-800 space-y-2.5"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="font-extrabold text-xs text-slate-700 uppercase">Live Queue Alerts ({staffNotifications.length})</span>
                        <button onClick={() => setStaffNotifications([])} className="text-[10px] text-red-500 hover:underline">Clear all</button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                        {staffNotifications.length === 0 ? (
                          <p className="text-center text-[11px] text-slate-400 py-6">No pending notifications.</p>
                        ) : (
                          staffNotifications.map((notif) => (
                            <div key={notif.id} className="p-2 hover:bg-slate-55 rounded-xl text-[11px] space-y-0.5 border border-slate-50 transition">
                              <div className="flex justify-between items-center">
                                <span className={`font-bold ${
                                  notif.type === 'danger' ? 'text-red-700' : notif.type === 'warning' ? 'text-amber-800' : 'text-indigo-805'
                                }`}>
                                  {notif.title}
                                </span>
                                <span className="text-[9px] text-slate-400">{notif.time}</span>
                              </div>
                              <p className="text-slate-500 leading-normal">{notif.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Online indicator */}
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full py-1 px-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-extrabold text-indigo-900 tracking-wider">COUNTER 3 ACTIVE</span>
              </div>

            </div>

          </header>

          {/* ACTIVE WORKSPACE RENDER VIEWPORT */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Voice announce active bar */}
            {voiceControlActive && (
              <div className="bg-indigo-900 text-white border border-indigo-950 p-4 rounded-2xl flex items-center justify-between gap-3 animate-bounce">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <Volume2 className="w-5 h-5 animate-pulse text-indigo-300" />
                  <span className="text-xs font-monospaced tracking-wide font-black">Live Public Voice Announcement Active:</span>
                  <span className="text-xs italic bg-indigo-950 px-3 py-1 rounded text-amber-300 font-bold">{voiceMessage}</span>
                </div>
                <button onClick={() => setVoiceControlActive(false)} className="text-xs text-indigo-400 hover:text-white uppercase font-bold decoration-dashed underline">Skip</button>
              </div>
            )}

            {/* ----------------- SUBTAB 1: DUSTBOARD PANEL ----------------- */}
            {staffTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Welcome summary cards and insight recommendation AI */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  
                  {/* Aura AI optimization recommendation card */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-5 rounded-3xl text-white flex flex-col justify-between shadow-md relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                    <div className="space-y-2 relative">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/30 border border-indigo-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Aura AI Lobby Director Recommendations
                      </div>
                      <h3 className="text-lg font-black tracking-tight leading-snug">Lobby Traffic Optimization Suggested</h3>
                      <p className="text-xs text-indigo-200 leading-relaxed font-normal">
                        Lobby wait time for Savings accounts is trending high. We recommend opening Counter 2 immediately to reduce waiting from 18 min to 9 min.
                      </p>

                      {/* FREE COUNTER STATE ACTIVE DETECTOR */}
                      <div className="mt-3 p-3 bg-indigo-950/70 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative flex shrink-0 h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[8px] font-bold text-emerald-400 uppercase tracking-widest leading-none mb-0.5">Aura AI Detected Free Desk</span>
                            <span className="block text-xs font-black text-white truncate leading-tight">{detectFreeCounter().name}</span>
                          </div>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-600/50 border border-indigo-400/30 text-[9px] font-black text-indigo-100">
                          Confidence: {detectFreeCounter().confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-2 relative">
                      <button 
                        onClick={() => {
                          setActiveLobbyCounters(prev => prev.map(c => c.id === 2 ? { ...c, status: 'open', load: 'Low', employee: 'S. Rawal' } : c));
                          addLiveNotification('Counter Opened', 'Counter 2 opened by Superintendent command.', 'success');
                          alert('Counter 2 Savings & PLI is now activated lobby-wide!');
                        }}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white font-black text-[10px] px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs uppercase tracking-wide"
                      >
                        ⚡ Deploy Smart Counter 2
                      </button>
                      <button 
                        onClick={() => {
                          setTokens(prev => prev.map((t, idx) => idx % 2 === 0 ? { ...t, estimatedWaitMinutes: Math.max(3, t.estimatedWaitMinutes - 4) } : t));
                          alert('Counter schedule recalculated. Average customer lobby wait reduced!');
                        }}
                        className="bg-white/10 hover:bg-white/15 text-indigo-100 font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition border border-white/10"
                      >
                        Recalculate wait matrices
                      </button>
                    </div>
                  </div>

                  {/* Operational stats box 1 */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Lobby Queue</span>
                        <p className="text-3xl font-black text-slate-800">{tokens.filter(t => t.status === 'waiting').length} Waiting</p>
                      </div>
                      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                        <Users className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Estimated wait matrices: <span className="font-bold text-indigo-700">{estimatedWaitMatrix} minutes avg</span>
                    </div>
                  </div>

                  {/* Operational stats box 2 */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Courier Dispatch Registry</span>
                        <p className="text-3xl font-black text-slate-800">{parcels.length} Active</p>
                      </div>
                      <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                        <FileCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Processed today: <span className="font-bold text-emerald-700">{parcels.filter(p => p.status === 'delivered').length} delivered successfully</span>
                    </div>
                  </div>

                </div>

                {/* Main section: Lobby overview & Quick actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Queue control console preview */}
                  <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">High Density Lobby Tokens</h4>
                        <p className="text-[11px] text-slate-400">Next citizens waiting at Counter 1 & 3</p>
                      </div>
                      <button onClick={() => setStaffTab('queue')} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold decoration-dashed underline">Full Queue Admin</button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto">
                      {tokens.filter(t => t.status === 'waiting' || t.status === 'calling').slice(0, 4).map((tok) => (
                        <div key={tok.id} className={`p-3.5 rounded-2xl flex justify-between items-center text-xs border transition ${
                          tok.status === 'calling' ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                        }`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-800 text-sm tracking-tight">{tok.tokenNumber}</span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg">
                                {tok.serviceType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium">
                              {tok.customerName} • wait: <span className="font-bold text-slate-705">{tok.estimatedWaitMinutes}m</span>
                            </p>
                          </div>

                          <div className="flex gap-2">
                            {tok.status === 'waiting' ? (
                              <>
                                <button
                                  onClick={() => handleCallToken(tok.id, 3)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition shrink-0"
                                >
                                  Call Next Desk
                                </button>
                                <button
                                  onClick={() => triggerVoicePagingSimulation(tok.tokenNumber, 3)}
                                  className="p-1 px-2 border border-slate-200 hover:bg-slate-100 rounded-lg transition"
                                  title="Simulate lobby sound announcement"
                                >
                                  🔊 Paging
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleCompleteToken(tok.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                Mark completed
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar quick console tools */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Fast Action Presets</h4>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          const serial = Math.floor(10 + Math.random() * 90);
                          const freshToken: Token = {
                            id: `tok-fresh-${Date.now()}`,
                            tokenNumber: `PRC-0${serial}`,
                            serviceType: 'Postal Savings/PLI',
                            date: new Date().toISOString().split('T')[0],
                            timeSlot: '11:30 AM - 12:00 PM',
                            estimatedWaitMinutes: 14,
                            status: 'waiting',
                            userId: 'user-cust-fresh',
                            customerName: 'Citizen Walkin Guest'
                          };
                          setTokens(prev => [...prev, freshToken]);
                          addLiveNotification('Token Created Walkin', `Issued Token PRC-0${serial} at kiosk.`, 'success');
                        }}
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl transition text-xs text-left cursor-pointer flex items-center justify-between"
                      >
                        <span>Citizen Walkin Guest Kiosk K-1</span>
                        <Plus className="w-4 h-4 text-indigo-600" />
                      </button>

                      <button 
                        onClick={() => {
                          setNewParcelSender('Govt Department Secretariat');
                          setNewParcelReceiver('Undersecretary of Urban Development');
                          setNewParcelOrigin('Indiranagar Post Office');
                          setNewParcelDestination('Vidhana Soudha GPO, Bengaluru');
                          setNewParcelWeight(520);
                          setNewParcelType('registered');
                          setShowAddParcelModal(true);
                        }}
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl transition text-xs text-left cursor-pointer flex items-center justify-between"
                      >
                        <span>Expedite Secretariat Dispatch</span>
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      </button>

                      <button 
                        onClick={() => {
                          if (complaints.length > 0) {
                            alert(`Auto-analyzing ${complaints.length} grievances with AI... Detected 0 potential scam threats, marked 1 priority item as 'Delayed Parcel'.`);
                          } else {
                            alert('No registered complaints to compile.');
                          }
                        }}
                        className="w-full bg-indigo-50 hover:bg-indigo-150 border border-indigo-100 text-indigo-950 font-bold py-2.5 px-3 rounded-xl transition text-xs text-left flex items-center justify-between"
                      >
                        <span>Aura AI Fraud Scan Claims</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>

                    {/* Operational Performance bar */}
                    <div className="border-t border-slate-100 pt-3 mt-1.5 space-y-2 text-xs">
                      <p className="font-extrabold text-[10px] uppercase text-slate-400">GPO Performance metrics</p>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600">
                        <span>Speed post SLA speed:</span>
                        <span className="font-bold text-emerald-600">99.2% Standard compliant</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600">
                        <span>Terminal bandwidth capacity:</span>
                        <span className="font-bold text-slate-705">Optimal (2 counters live)</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* VISUAL SVG CHARTS AND GRAPHS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Load / Congestion hourly graph */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-805 text-xs uppercase tracking-wider">Lobby Load Congestion (Hourly traffic)</h4>
                      <p className="text-[10px] text-slate-400">Peak hour analysis for token counter assignments</p>
                    </div>

                    {/* SVG Chart */}
                    <div className="h-40 flex items-end gap-3.5 pt-4 px-2">
                      {[
                        { hour: "9:00", load: 30, color: "bg-indigo-300" },
                        { hour: "10:30", load: 85, color: "bg-indigo-500" },
                        { hour: "12:00", load: 95, color: "bg-red-500 animate-pulse" },
                        { hour: "13:30", load: 45, color: "bg-indigo-400" },
                        { hour: "15:00", load: 60, color: "bg-indigo-500" },
                        { hour: "16:30", load: 75, color: "bg-indigo-600" },
                        { hour: "18:00", load: 20, color: "bg-indigo-300" }
                      ].map((bar, bIdx) => (
                        <div key={bIdx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="text-[10px] text-slate-600 font-bold font-mono">{bar.load}%</div>
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-1000 ${bar.color}`}
                            style={{ height: `${bar.load}%` }}
                          ></div>
                          <div className="text-[9px] font-bold text-slate-400">{bar.hour}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hourly service completion statistics */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-805 text-xs uppercase tracking-wider">Service Delivery Success Rate (7 Day Window)</h4>
                      <p className="text-[10px] text-slate-400">Total volume dispatched successfully against SLA targets</p>
                    </div>

                    <div className="flex-1 flex items-end gap-3.5 pt-4 px-2 h-40">
                      {[
                        { day: "Mon", rate: 94, color: "bg-emerald-400" },
                        { day: "Tue", rate: 96, color: "bg-emerald-400" },
                        { day: "Wed", rate: 98, color: "bg-emerald-500" },
                        { day: "Thu", rate: 99, color: "bg-indigo-600 font-bold" },
                        { day: "Fri", rate: 93, color: "bg-emerald-400" },
                        { day: "Sat", rate: 100, color: "bg-purple-600" }
                      ].map((bar, bIdx) => (
                        <div key={bIdx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="text-[9px] text-slate-600 font-extrabold">{bar.rate}%</div>
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-1000 ${bar.color}`}
                            style={{ height: `${bar.rate}%` }}
                          ></div>
                          <div className="text-[9px] font-bold text-slate-400">{bar.day}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}


            {/* ----------------- SUBTAB 2: QUEUE MANAGEMENT PANEL ----------------- */}
            {staffTab === 'queue' && (
              <div className="space-y-6">
                
                {/* Lobby stats preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-950 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Total Waiting Visitors</p>
                      <p className="text-2xl font-black">{tokens.filter(t => t.status === 'waiting').length} Citizens</p>
                    </div>
                    <Clock className="w-10 h-10 text-indigo-200 shrink-0" />
                  </div>

                  <div className="bg-amber-50 border border-amber-100 text-amber-955 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Estimated Average Wait</p>
                      <p className="text-2xl font-black">{estimatedWaitMatrix} Minutes</p>
                    </div>
                    <Activity className="w-10 h-10 text-amber-200 shrink-0 animate-pulse" />
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-955 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Today Completed</p>
                      <p className="text-2xl font-black">{tokens.filter(t => t.status === 'completed').length} Served</p>
                    </div>
                    <CheckCircle2 className="w-10 h-10 text-emerald-200 shrink-0" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Live awaiting lines */}
                  <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Lobby Service queue Line (List)</h4>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        Free Desk: {detectFreeCounter().name}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
                        <span className="text-[11px] font-bold text-indigo-950">
                          Aura Routing Recommendation: Assign next citizen to <span className="underline font-black text-indigo-900">{detectFreeCounter().name}</span>
                        </span>
                      </div>
                      <span className="text-[9.5px] text-indigo-800 font-bold">Reduces wait times instantly</span>
                    </div>
                    
                    <div className="space-y-2.5 max-h-120 overflow-y-auto pr-1">
                      {filteredTokens.filter(t => t.status === 'waiting' || t.status === 'calling').length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-12">No citizens in current queue. Excellent work! Terminal lobby is empty.</p>
                      ) : (
                        filteredTokens.filter(t => t.status === 'waiting' || t.status === 'calling').map((tok) => (
                          <div key={tok.id} className={`p-4 rounded-2xl flex justify-between items-center text-xs border transition ${
                            tok.status === 'calling' ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                          }`}>
                            <div className="space-y-1 my-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-slate-800 text-sm">{tok.tokenNumber}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 rounded">
                                  {tok.serviceType}
                                </span>
                                {tok.status === 'calling' && (
                                  <span className="text-[9px] bg-red-105 text-red-700 font-bold px-1.5 py-0.5 rounded animate-pulse uppercase">
                                    ON AIR Counter {tok.counterNumber}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 font-bold">Attendee: {tok.customerName}</p>
                              <div className="text-[10px] text-slate-400 font-medium">
                                Scheduled slot: {tok.date} • {tok.timeSlot} • priority: <span className="font-bold text-slate-505">{tok.estimatedWaitMinutes} min est</span>
                              </div>
                            </div>

                            <div className="flex gap-1.5 flex-wrap justify-end">
                              {tok.status === 'waiting' ? (
                                <>
                                  <button
                                    onClick={() => handleCallToken(tok.id, 1)}
                                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                                  >
                                    C1
                                  </button>
                                  <button
                                    onClick={() => handleCallToken(tok.id, 3)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                                    title="Call to counter 3"
                                  >
                                    C3 (You)
                                  </button>
                                  <button
                                    onClick={() => handleSkipToken(tok.id)}
                                    className="border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                                  >
                                    Skip
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => triggerVoicePagingSimulation(tok.tokenNumber, tok.counterNumber || 3)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                                  >
                                    🔊 Page Voice again
                                  </button>
                                  <button
                                    onClick={() => handleCompleteToken(tok.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition"
                                  >
                                    Mark completed
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Counter workflow & Voice Announce control panel */}
                  <div className="space-y-6">
                    
                    {/* Public announcement microphone sandbox */}
                    <div className="bg-indigo-950 text-white p-5 rounded-3xl border border-indigo-900 shadow-md space-y-4">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-indigo-400" />
                        <h4 className="font-black text-xs uppercase tracking-widest text-white">Manual Microphone Pager</h4>
                      </div>

                      <div className="space-y-3">
                        <textarea
                          rows={2}
                          value={voiceMessage}
                          onChange={(e) => setVoiceMessage(e.target.value)}
                          placeholder="Type public kiosk voice announcement text..."
                          className="w-full bg-indigo-900/60 border border-indigo-800 rounded-xl py-2 px-3 text-xs text-indigo-100 focus:outline-none placeholder-indigo-400/70"
                        />
                        <button
                          onClick={() => {
                            if (!voiceMessage.trim()) {
                              alert('Write an announcement statement first.');
                              return;
                            }
                            setVoiceControlActive(true);
                            playPostalChime();
                            try {
                              if ('speechSynthesis' in window) {
                                window.speechSynthesis.speak(new SpeechSynthesisUtterance(voiceMessage));
                              }
                            } catch (e) {}
                            setTimeout(() => {
                              setVoiceControlActive(false);
                            }, 5000);
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black py-2 rounded-xl transition cursor-pointer text-center uppercase tracking-wide"
                        >
                          📢 broadcast voice chime announcement
                        </button>
                      </div>
                    </div>

                    {/* Counter operational logs */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="font-extrabold text-slate-805 text-xs uppercase tracking-wider">Queue Service analytics</h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                          <p className="font-bold text-slate-700 text-[11px]">Daily wait limits trend:</p>
                          <p className="text-slate-500 leading-normal text-[10px]">Optimal. Average serving speeds stand at 4.2 minutes per speed post token dispatch.</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                          <p className="font-bold text-slate-705 text-[11px]">Sought services lobby list:</p>
                          <ul className="list-disc pl-4 text-slate-500 space-y-0.5 text-[10px]">
                            <li>Speed Post: 4 tokens active</li>
                            <li>Registered Post: 2 tokens active</li>
                            <li>Postal Savings fund: 1 token active</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}


            {/* ----------------- SUBTAB 3: PARCEL REGISTRY PANEL ----------------- */}
            {staffTab === 'parcels' && (
              <div className="space-y-6">
                
                {/* Search controller & create trigger */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="relative w-full md:max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={globalSearchQuery}
                      onChange={(e) => setGlobalSearchQuery(e.target.value)}
                      placeholder="Search register records..."
                      className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-4 text-xs text-slate-800 outline-none w-full"
                    />
                  </div>

                  <button
                    onClick={() => setShowAddParcelModal(true)}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4-5 py-2 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wide"
                  >
                    <Plus className="w-4 h-4" />
                    Register Outer Dispatch Parcel
                  </button>
                </div>

                {/* Data registry list */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-150">
                    <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">National Postal Parcel Registry Records ({filteredParcels.length})</h4>
                  </div>

                  <div className="overflow-x-auto text-xs text-slate-900">
                    
                    {filteredParcels.length === 0 ? (
                      <p className="text-center py-12 text-slate-400 text-xs font-semibold">No parcels found matching local filters.</p>
                    ) : (
                      <table className="w-full text-left border-collapse leading-normal">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-405 font-bold">
                            <th className="p-4 uppercase text-[10px]">Tracking ID</th>
                            <th className="p-4 uppercase text-[10px]">Article Details</th>
                            <th className="p-4 uppercase text-[10px]">Parties (Sender / Recipient)</th>
                            <th className="p-4 uppercase text-[10px]">Origin / Target</th>
                            <th className="p-4 uppercase text-[10px]">Status</th>
                            <th className="p-4 uppercase text-[10px] text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredParcels.map((parcel) => (
                            <tr key={parcel.id} className="border-b border-slate-100 hover:bg-slate-50 font-medium">
                              <td className="p-4">
                                <span className="font-black text-indigo-700 block text-xs select-all">{parcel.trackingId}</span>
                                <span className="text-[9px] text-slate-405 block uppercase mt-0.5">{parcel.type} • {parcel.weight}g</span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-slate-800 text-xs block truncate max-w-[140px]">{parcel.parcelName || 'Courier Goods'}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">₹{parcel.charges} charges</span>
                              </td>
                              <td className="p-4">
                                <div className="space-y-0.5">
                                  <span className="text-slate-800 text-xs block"><strong>From:</strong> {parcel.senderName}</span>
                                  <span className="text-slate-600 font-normal block truncate max-w-[200px]"><strong>To:</strong> {parcel.receiverName} ({parcel.receiverAddress || 'No Address Listed'})</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-0.5 text-slate-500 font-normal truncate max-w-[170px]">
                                  <span className="text-xs text-slate-800 block"><strong>Source:</strong> {parcel.origin}</span>
                                  <span className="text-[11px] block"><strong>Dest:</strong> {parcel.destination}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                                  parcel.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                  parcel.status === 'in_transit' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                  parcel.status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-150 text-slate-700'
                                }`}>
                                  {parcel.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingParcelId(parcel.id);
                                      setEditParcelStatus(parcel.status);
                                      setEditParcelLocation(parcel.origin);
                                    }}
                                    className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 font-bold text-[10px] transition cursor-pointer"
                                  >
                                    Update Status
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedVerifyParcel(parcel);
                                      setShowVerificationModal(true);
                                    }}
                                    className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded text-indigo-705 font-bold text-[10px] transition cursor-pointer"
                                  >
                                    Carrier Handover
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                  </div>
                </div>

              </div>
            )}


            {/* ----------------- SUBTAB 4: QR CODE SCANNER PANEL ----------------- */}
            {staffTab === 'scanner' && (
              <div className="max-w-xl mx-auto space-y-6">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-center flex flex-col items-center">
                  
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-600">
                    <QrCode className="w-6 h-6 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">National Barcode & QR Scanner terminal</h3>
                    <p className="text-xs text-slate-400">Scan standard labels or kiosk customer receipts to sync and verify routing details immediately.</p>
                  </div>

                  {/* Simulator Box */}
                  <div className="w-full aspect-video bg-slate-900 border border-slate-950 rounded-2xl relative flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
                    
                    {/* Glowing camera targets */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500"></div>
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-505"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-505"></div>

                    {qrScanStatus === 'scanning' ? (
                      <div className="space-y-3 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin"></div>
                        <p className="text-xs font-mono tracking-widest text-indigo-300 animate-pulse">OPT SCANNING SYSTEM ACTIVE...</p>
                        <div className="h-0.5 bg-indigo-500 w-4/5 absolute top-1/2 left-0 right-0 animate-bounce"></div>
                      </div>
                    ) : qrScanStatus === 'success' && qrScanResult ? (
                      <div className="p-4 space-y-2 text-left bg-indigo-950/80 rounded-xl border border-indigo-850 max-w-sm">
                        <p className="text-indigo-400 text-[10px] uppercase font-bold tracking-widest">Matched Dispatch Found</p>
                        <p className="text-lg font-black">{qrScanResult.trackingId}</p>
                        <div className="text-[11px] text-slate-300 space-y-0.5">
                          <p><strong>Article:</strong> {qrScanResult.parcelName || 'General Pack'}</p>
                          <p><strong>Recipient:</strong> {qrScanResult.receiverName}</p>
                          <p><strong>Dest:</strong> {qrScanResult.destination}</p>
                        </div>
                        <div className="flex gap-2 pt-2.5">
                          <button 
                            type="button" 
                            onClick={() => {
                              setEditingParcelId(qrScanResult.id);
                              setEditParcelStatus(qrScanResult.status);
                            }}
                            className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]"
                          >
                            Update tracking status
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 text-center px-4">
                        <p className="text-slate-400 text-xs">Simulated live camera scanner is connected.</p>
                        <button
                          type="button"
                          onClick={handleGenerateQrScan}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition uppercase cursor-pointer tracking-wider shadow-sm"
                        >
                          Run Scan Simulation
                        </button>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}


            {/* ----------------- SUBTAB 5: CARRIER HANDOVER & DELIVERIES ----------------- */}
            {staffTab === 'deliveries' && (
              <div className="space-y-6">
                
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-slate-805 text-sm uppercase tracking-wider">Carrier Handover (Local Delivery Staff Assign)</h4>
                  <p className="text-xs text-slate-400">Assign courier articles out-for-delivery to dispatch bikers and verify deliveries via Aadhaar ID & Signature pad.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parcels.filter(p => p.status !== 'delivered').slice(0, 6).map((parcel) => (
                    <div key={parcel.id} className="bg-white p-4.5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4 shadow-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-black text-indigo-700 select-all">{parcel.trackingId}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700`}>
                            {parcel.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 space-y-1">
                          <p className="font-bold">To: {parcel.receiverName}</p>
                          {parcel.receiverAddress && (
                            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold italic bg-slate-50 p-2 rounded-xl">📍 {parcel.receiverAddress}</p>
                          )}
                          <p className="text-[11px] text-slate-400 font-medium">Recipient target: {parcel.destination}</p>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedVerifyParcel(parcel);
                            setShowVerificationModal(true);
                          }}
                          className="flex-1 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-[10px] py-2 rounded-xl text-center cursor-pointer transition uppercase"
                        >
                          Verify & Handover Hand-Sign
                        </button>
                        <button
                          onClick={() => {
                            const newLoc = prompt("Enter Carrier's Out for delivery current location update:");
                            if (newLoc !== null) {
                              setParcels(prev => prev.map(p => {
                                if (p.id === parcel.id) {
                                  return {
                                    ...p,
                                    status: 'out_for_delivery',
                                    timeline: [
                                      ...p.timeline,
                                      {
                                        status: 'out_for_delivery',
                                        timestamp: new Date().toISOString(),
                                        location: newLoc || 'Local Delivery Zone',
                                        description: 'Shipment out for doorstep delivery with local carrier.'
                                      }
                                    ]
                                  };
                                }
                                return p;
                              }));
                              playPostalChime();
                              alert('Dispatched carrier out for delivery successfully!');
                            }
                          }}
                          className="bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] px-3.5 rounded-xl text-center hover:bg-slate-100 transition"
                        >
                          Set Out
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}


            {/* ----------------- SUBTAB 6: COMPLAINTS OMBUDSMAN LOGS ----------------- */}
            {staffTab === 'complaints' && (
              <div className="space-y-6">
                
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-slate-805 text-sm uppercase tracking-wider">Unified Citizen Grievance log Ombudsman ({filteredComplaints.length})</h4>
                  
                  <div className="space-y-3">
                    {filteredComplaints.length === 0 ? (
                      <p className="text-center py-8 text-slate-400 text-xs font-semibold">No registered complaints in system memory.</p>
                    ) : (
                      filteredComplaints.map((comp) => (
                        <div key={comp.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs space-y-3.5 hover:border-slate-305 transition">
                          
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="space-y-1">
                              <span className="font-black text-indigo-750 block select-all">TG ID: {comp.trackingId}</span>
                              <span className="font-extrabold text-slate-800 text-xs block">Fled by User: {comp.customerName}</span>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              comp.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                              comp.status === 'investigating' ? 'bg-amber-100 text-amber-800' : 'bg-red-50 text-red-700'
                            }`}>
                              Status: {comp.status}
                            </span>
                          </div>

                          <p className="bg-white p-3 border border-slate-100 shadow-3xs text-slate-650 leading-relaxed font-medium italic rounded-xl">
                            "{comp.description}"
                          </p>

                          {/* Quick AI auto solver or Operator manual reply builder */}
                          {replyComplaintId === comp.id ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                setComplaints(prev => prev.map(c => 
                                  c.id === comp.id ? { ...c, status: 'resolved', aiResponse: `RESOLVED: ${complaintReplyText}` } : c
                                ));
                                setReplyComplaintId(null);
                                setComplaintReplyText('');
                                addLiveNotification('Grievance Answered', `Provided formal dispatch update regarding tracking: ${comp.trackingId}`, 'success');
                              }}
                              className="p-3 bg-white border border-slate-200 rounded-2xl space-y-3"
                            >
                              <div>
                                <label className="block text-[9px] uppercase font-black text-slate-400 tracking-wider mb-1">Superintendent Official Reply Formulation</label>
                                <textarea
                                  rows={2}
                                  value={complaintReplyText}
                                  onChange={(e) => setComplaintReplyText(e.target.value)}
                                  placeholder="Formulate official resolution update to sender..."
                                  className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 px-3 outline-none text-xs text-slate-800"
                                />
                              </div>

                              <div className="flex justify-between items-center gap-2">
                                <span className="text-[10px] text-slate-400">Proof: {complaintResolveProof}</span>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setComplaintReplyText("Post office telemetry satellite audit shows the shipment is already arriving yesterday at GPO transit airport cargo floor. Dispatch will deliver on Monday.")}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-1.5 rounded-lg border border-indigo-100 transition"
                                  >
                                    🪄 AI Auto-Construct Response
                                  </button>
                                  <button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition"
                                  >
                                    Resolve grievance
                                  </button>
                                </div>
                              </div>
                            </form>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setReplyComplaintId(comp.id);
                                  setComplaintReplyText('');
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition cursor-pointer"
                              >
                                Formulation Reply & resolve
                              </button>
                            </div>
                          )}

                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}


            {/* ----------------- SUBTAB 7: SYSTEMS REPORTS & ANALYTICS ----------------- */}
            {staffTab === 'reports' && (
              <div className="space-y-6">
                
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <h4 className="font-extrabold text-slate-805 text-sm uppercase tracking-wider">National Intelligent GPO Reports Console</h4>
                  <p className="text-xs text-slate-400">Download and analyze daily staff productivity margins, package handover limits, and SLA efficiency times.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Performance stats bento grid card */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col justify-between gap-4 shadow-sm">
                    <h5 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Today's Operating Milestones</h5>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>SLA Target Delivery Window completion:</span>
                          <span>98%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '98%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>Kiosk Queue wait optimization SLA:</span>
                          <span>95%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: '95%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-705 mb-1">
                          <span>Disputed Complaint remediation ratios:</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => alert('Generating operational summary CSV... GPO-OPERATIONS-EXCEL-SUMMARY.xlsx saved to Superintendent desktop reports portfolio.')}
                      className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs py-2 rounded-xl transition cursor-pointer text-center uppercase tracking-wide shadow-3xs"
                    >
                      Export Excel Operations reports
                    </button>
                  </div>

                  {/* Hourly staff productivity graphs */}
                  <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-805 text-xs uppercase tracking-wider">Hourly queue clearing statistics (Avg minutes per citizen)</h4>
                      <p className="text-[10px] text-slate-400">Tracking active wait times against daily operator bandwidth limits</p>
                    </div>

                    <div className="h-40 flex items-end gap-3 px-1 pt-4">
                      {[
                        { time: '09:00', minutes: 5, color: 'bg-emerald-400' },
                        { time: '10:30', minutes: 8, color: 'bg-emerald-400' },
                        { time: '12:00', minutes: 14, color: 'bg-indigo-505 shadow-md font-extrabold' },
                        { time: '13:30', minutes: 4, color: 'bg-emerald-400' },
                        { time: '15:00', minutes: 6, color: 'bg-indigo-500' },
                        { time: '16:30', minutes: 9, color: 'bg-indigo-600' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[9.5px] font-bold font-mono text-slate-700">{item.minutes}m</span>
                          <div className={`w-full rounded-t-lg transition-all duration-1000 ${item.color}`} style={{ height: `${item.minutes * 6.5}%` }}></div>
                          <span className="text-[9px] text-slate-400 mt-1 font-bold">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}


            {/* ----------------- SUBTAB 8: COUNTER STATUS MANAGEMENT ----------------- */}
            {staffTab === 'counters' && (
              <div className="space-y-6">
                
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-slate-805 text-sm uppercase tracking-wider">Lobby post office counter operational statuses</h4>
                  <p className="text-xs text-slate-400">Open or close client-facing counters, update desk operators, and evaluate real-time visitor load congestion.</p>
                </div>

                {/* AI TARGETED FREE COUNTER DETECTION PLATFORM PANEL */}
                <div className="bg-gradient-to-r from-violet-900 via-indigo-950 to-indigo-900 p-6 rounded-3xl border border-indigo-950 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute left-1/3 -bottom-10 w-40 h-40 bg-indigo-550/10 rounded-full blur-2xl"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                    <div className="space-y-3 max-w-xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/15 border border-purple-400/20 rounded-full text-[10px] uppercase font-black tracking-widest text-purple-300">
                        <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                        AI Real-Time Free Counter Detector
                      </div>
                      
                      <div className="space-y-1">
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                          Live Active Free Channel: <span className="text-amber-300 underline underline-offset-4 decoration-amber-400/40">{detectFreeCounter().name}</span>
                        </h2>
                        <p className="text-xs text-indigo-150 leading-relaxed">
                          {detectFreeCounter().reason} Current queue load formulas are evaluated dynamically based on citizen walk-ins, service SLA metrics, and open counters.
                        </p>
                      </div>

                      {/* Display calculations */}
                      <div className="flex gap-4 pt-1 flex-wrap">
                        <div className="px-3 py-1.5 bg-indigo-950/60 rounded-xl border border-indigo-850 text-[10.5px]">
                          <span className="text-indigo-400 block font-bold uppercase text-[8px] tracking-widest leading-none mb-1">Aura Certainty</span>
                          <span className="text-xs font-black text-white">{detectFreeCounter().confidence}% Match index</span>
                        </div>
                        <div className="px-3 py-1.5 bg-indigo-950/60 rounded-xl border border-indigo-850 text-[10.5px]">
                          <span className="text-indigo-400 block font-bold uppercase text-[8px] tracking-widest leading-none mb-1">Relative Load Score</span>
                          <span className="text-xs font-black text-white">{detectFreeCounter().score} (Lowest is best)</span>
                        </div>
                        {activeLobbyCounters.some(c => c.status === 'closed') && (
                          <div className="px-3 py-1.5 bg-indigo-950/60 rounded-xl border border-indigo-850 text-[10.5px]">
                            <span className="text-indigo-400 block font-bold uppercase text-[8px] tracking-widest leading-none mb-1 font-bold">Optimization Strategy</span>
                            <span className="text-xs font-black text-amber-300">Closed counters available to scale</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col justify-center items-center gap-2 bg-indigo-950/50 border border-indigo-850 p-4 rounded-2xl">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-350 block font-bold uppercase tracking-wider">Assigned Citizens</span>
                        <span className="text-3xl font-black text-white">{tokens.filter(t => t.status === 'waiting').length} waiting</span>
                      </div>
                      <button
                        onClick={() => {
                          const free = detectFreeCounter();
                          if (!free.id) {
                            alert('All counters are presently shut! Activate some counters below.');
                            return;
                          }
                          const nextWaitingToken = tokens.find(t => t.status === 'waiting');
                          if (nextWaitingToken) {
                            handleCallToken(nextWaitingToken.id, free.id);
                          } else {
                            alert('Hooray! No customers are currently waiting in the lobby queue.');
                          }
                        }}
                        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl transition cursor-pointer uppercase tracking-wider"
                      >
                        ⚡ Route Next to Free Counter
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeLobbyCounters.map((counter) => (
                    <div key={counter.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-900 text-sm">{counter.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            counter.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-150 text-slate-600'
                          }`}>
                            {counter.status === 'open' ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 my-2">
                          <p><strong>Desk staff assigned:</strong> {counter.employee}</p>
                          <p><strong>Interactive load capacity:</strong> {counter.load}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-105 flex gap-2">
                        <button
                          onClick={() => {
                            setActiveLobbyCounters(prev => prev.map(c => 
                              c.id === counter.id ? { ...c, status: c.status === 'open' ? 'closed' : 'open', employee: c.status === 'closed' ? 'L. Narayan' : 'None', load: c.status === 'closed' ? 'Medium' : 'N/A' } : c
                            ));
                            addLiveNotification('Counter configuration saved', `Terminal Counter desk ${counter.id} status was changed.`, 'info');
                          }}
                          className={`flex-1 transition font-bold py-2 rounded-xl text-center text-[10px] cursor-pointer ${
                            counter.status === 'open' ? 'bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-750' : 'bg-indigo-900 hover:bg-indigo-950 text-white'
                          }`}
                        >
                          {counter.status === 'open' ? '🔒 Close terminal counter' : '🔓 Deploy Active shifts'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}


            {/* ----------------- SUBTAB 9: COMPREHENSIVE SETTINGS PAGE ----------------- */}
            {staffTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  <h4 className="font-extrabold text-slate-805 text-sm uppercase tracking-wider">AI GPO Staff Profile credentials & preferences</h4>
                  
                  <div className="space-y-4 text-xs text-slate-750">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Official Operator Full Name</label>
                        <input
                          type="text"
                          value={staffCardName}
                          onChange={(e) => setStaffCardName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:ring-1 focus:ring-indigo-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Registered Counter desk Code</label>
                        <select
                          value={staffActiveCounter}
                          onChange={(e) => setStaffActiveCounter(parseInt(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-slate-800"
                        >
                          <option value={1}>Counter 1 Desk - Savings & general</option>
                          <option value={2}>Counter 2 Desk - Savings Accounts</option>
                          <option value={3}>Counter 3 Desk - Speed Courier dispatch (You)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Terminal environmental preferences</span>
                      
                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Simulate Slate Dark Mode interface</p>
                          <p className="text-[10px] text-slate-400">Alter the main GPO workspace terminal color palette.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={useDarkTheme}
                          onChange={(e) => setUseDarkTheme(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-1 cursor-pointer"
                        />
                      </div>

                      <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">Acouptic notification buzzer alert</p>
                          <p className="text-[10px] text-slate-400">Play a soft electronic dual-tone notification when new tokens are book kiosk-side.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={playbackAudioAlert}
                          onChange={(e) => {
                            setPlaybackAudioAlert(e.target.checked);
                            setStaffMuteAll(!e.target.checked);
                          }}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-1 cursor-pointer"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playPostalChime();
                        alert('Official operator settings portfolio updated successfully in cloud base!');
                      }}
                      className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold text-xs py-2-5 rounded-2xl transition cursor-pointer text-center uppercase tracking-wide"
                    >
                      Save terminal configs
                    </button>

                  </div>
                </div>

              </div>
            )}

          </main>

        </div>

      </div>

      {/* ----------------- MODAL: REGISTER CORRESPONDENT DISPATCH PARCEL ----------------- */}
      <AnimatePresence>
        {showAddParcelModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg bg-white text-slate-800 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-extrabold text-sm uppercase text-indigo-900 tracking-wide">Outer Parcel dispatch registration desk</span>
                <button onClick={() => setShowAddParcelModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateParcel} className="space-y-4 text-xs text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Sender Official Name *</label>
                    <input
                      type="text"
                      required
                      value={newParcelSender}
                      onChange={(e) => setNewParcelSender(e.target.value)}
                      placeholder="e.g. Govt Treasury Karnataka S.O"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Receiver Citizen Name *</label>
                    <input
                      type="text"
                      required
                      value={newParcelReceiver}
                      onChange={(e) => setNewParcelReceiver(e.target.value)}
                      placeholder="e.g. Ravi Kiran"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Recipient Phone Coordinate</label>
                    <input
                      type="text"
                      value={newParcelReceiverPhone}
                      onChange={(e) => setNewParcelReceiverPhone(e.target.value)}
                      placeholder="+91 8001594101"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Estimated weight (grams) *</label>
                    <input
                      type="number"
                      required
                      value={newParcelWeight}
                      onChange={(e) => setNewParcelWeight(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Delivery address street coordinates *</label>
                  <textarea
                    rows={2}
                    required
                    value={newParcelReceiverAddress}
                    onChange={(e) => {
                      setNewParcelReceiverAddress(e.target.value);
                      // Guess destination pincode for dispatch block
                      const matched = e.target.value.match(/\d{6}/);
                      if (matched) {
                        setNewParcelDestination(`PIN Standard Hub ${matched[0]}`);
                      }
                    }}
                    placeholder="Provide full Indian address with 6-digit PIN code..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Local Origin Hub</label>
                    <input
                      type="text"
                      value={newParcelOrigin}
                      onChange={(e) => setNewParcelOrigin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Courier Category Type</label>
                    <select
                      value={newParcelType}
                      onChange={(e) => setNewParcelType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 font-bold"
                    >
                      <option value="speed_post">Indian Air Speed Post (Compliant)</option>
                      <option value="registered">Registered Post Desk</option>
                      <option value="standard">Standard Domestic Parcel</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-black py-3 rounded-xl transition uppercase tracking-widest shadow-md text-xs cursor-pointer"
                >
                  Generate Dispatch Token & initiate logistics
                </button>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: MANUALLY TRANSIT UPDATING FORM ----------------- */}
      <AnimatePresence>
        {editingParcelId !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white text-slate-800 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-700 uppercase">Update route tracking details</span>
                <button onClick={() => setEditingParcelId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateParcelStatus} className="space-y-4 text-xs">
                <div>
                  <label className="block mb-1 font-bold">New Parcel status category</label>
                  <select
                    value={editParcelStatus}
                    onChange={(e) => setEditParcelStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3"
                  >
                    <option value="accepted">Accepted (Initiated)</option>
                    <option value="processing">Operations processing cargo desk</option>
                    <option value="dispatched">Dispatched from sorting hub</option>
                    <option value="in_transit">In Transit airport cargo floor</option>
                    <option value="out_for_delivery">Out for doorstep delivery carrier</option>
                    <option value="delivered">Safely delivered</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold">Current transit coordinate (City name)</label>
                  <input
                    type="text"
                    required
                    value={editParcelLocation}
                    onChange={(e) => setEditParcelLocation(e.target.value)}
                    placeholder="e.g. Bangalore Sorting Terminal Hub"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Official Remark Note</label>
                  <input
                    type="text"
                    value={editParcelRemarks}
                    onChange={(e) => setEditParcelRemarks(e.target.value)}
                    placeholder="e.g. Local pouch handoff complete"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold py-3 text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Apply telemetry audit log updates
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: CUSTOMER AADHAAR & SIGNATURE VERIFICATION HANDOVER ----------------- */}
      <AnimatePresence>
        {showVerificationModal && selectedVerifyParcel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white text-slate-800 rounded-3xl border border-slate-205 overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-indigo-50">
                <span className="font-extrabold text-sm uppercase text-indigo-900 tracking-wide">SECURE CUSTOMER HANDOFF DESK</span>
                <button onClick={() => { setShowVerificationModal(false); setSelectedVerifyParcel(null); }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {verificationPassed === 'success' ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-800 text-base">VERIFICATION PASSED ACCURATELY</h4>
                  <p className="text-xs text-slate-400">Carrier dispatch has been closed cleanly. Aadhaar OCR and Signature was saved to secure database logs.</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs text-slate-700">
                  
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-start gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-indigo-600 font-bold block uppercase tracking-wider">AURA SECURE SYSTEM SCANNER ACTIVE</span>
                      <p className="font-bold text-indigo-950">Article ID: {selectedVerifyParcel.trackingId}</p>
                      <p className="text-[10px] text-slate-500">Recipient user: {selectedVerifyParcel.receiverName}</p>
                    </div>
                    <Lock className="w-5 h-5 text-indigo-400 shrink-0" />
                  </div>

                  {/* Aadhaar text info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Aadhaar Card ID (4-digit Masked) *</label>
                      <input
                        type="text"
                        required
                        value={verificationAadhaarInput}
                        onChange={(e) => setVerificationAadhaarInput(e.target.value)}
                        placeholder="e.g. 5044"
                        maxLength={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Delivery Handshake OTP (1234) *</label>
                      <input
                        type="text"
                        required
                        value={verificationOtpInput}
                        onChange={(e) => setVerificationOtpInput(e.target.value)}
                        placeholder="e.g. 1234"
                        maxLength={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 font-bold"
                      />
                    </div>
                  </div>

                  {/* HTML5 Hand-drawn touch signature canvas pad */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold uppercase tracking-wider">Aura Delivery Receipt Touch Signature *</span>
                      <button type="button" onClick={clearCanvas} className="text-red-500 hover:underline">Clear Canvas</button>
                    </div>

                    <div className="border border-slate-250 rounded-2xl overflow-hidden bg-slate-50">
                      <canvas
                        ref={signatureCanvasRef}
                        width={380}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={drawSignature}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full aspect-auto bg-slate-50 cursor-crosshair block"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <span className="text-[10.5px] font-semibold text-slate-505">Recalculating courier handshake key checks...</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setVerificationAadhaarInput("2230");
                        setVerificationOtpInput("1234");
                        alert('Demo auto-fill parameters complete.');
                      }} 
                      className="text-indigo-600 hover:text-indigo-805 font-extrabold cursor-pointer"
                    >
                      Instant Demo AutoFill
                    </button>
                  </div>

                  <button
                    onClick={handleFinalDeliveryHandover}
                    className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-black py-3 rounded-xl transition uppercase tracking-widest text-xs cursor-pointer shadow-md"
                  >
                    Authorize Customer Handover Delivery
                  </button>

                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
