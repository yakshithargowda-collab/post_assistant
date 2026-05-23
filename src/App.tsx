/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  Building,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  HelpCircle,
  Inbox,
  Languages,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  QrCode,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  UserCheck,
  Users,
  Video,
  X
} from 'lucide-react';
import { 
  User, 
  Token, 
  Parcel, 
  Complaint, 
  SpamReport, 
  ChatMessage, 
  Notification, 
  PostOffice 
} from './types';

import StaffSection from './components/StaffSection';
import ManagerDashboard from './components/ManagerDashboard';

export default function App() {
  // Current user / auth session state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authRole, setAuthRole] = useState<'customer' | 'admin' | 'staff'>('customer');
  const [authEmail, setAuthEmail] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Active Layout view tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'booking' | 'tracking' | 'chat' | 'calculator' | 'spam' | 'complaints' | 'addresses' | 'admin' | 'manager'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dynamic state stores fetched from server with offline state fallback templates
  const [tokens, setTokens] = useState<Token[]>([]);
  const [queueStats, setQueueStats] = useState({
    currentCallingToken: "SPD-007",
    currentCallingCounter: 1,
    waitingCount: 2,
    estimatedAverageWait: 12,
    activeCounters: [1, 2, 3]
  });
  
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [spamReports, setSpamReports] = useState<SpamReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [trackedParcel, setTrackedParcel] = useState<Parcel | null>(null);
  const [trackError, setTrackError] = useState('');

  // UI state variables
  const [loading, setLoading] = useState(false);
  const [langCode, setLangCode] = useState<'en' | 'kn' | 'hi' | 'te'>('en');

  // Input states
  // Booking Form
  const [bookService, setBookService] = useState('Speed Post');
  const [bookDate, setBookDate] = useState('2026-05-24');
  const [bookTime, setBookTime] = useState('10:30 AM - 11:00 AM');
  const [bookCustomerName, setBookCustomerName] = useState('');
  const [bookCustomerPhone, setBookCustomerPhone] = useState('');
  const [bookCustomerEmail, setBookCustomerEmail] = useState('');
  const [bookAdditionalNotes, setBookAdditionalNotes] = useState('');
  const [bookingStatusMsg, setBookingStatusMsg] = useState('');

  // Parcel Dispatch / Booking Form
  const [parcelSenderName, setParcelSenderName] = useState('');
  const [parcelReceiverName, setParcelReceiverName] = useState('');
  const [parcelReceiverPhone, setParcelReceiverPhone] = useState('');
  const [parcelName, setParcelName] = useState('');
  const [parcelBookingMessage, setParcelBookingMessage] = useState('');
  const [parcelType, setParcelType] = useState<'standard' | 'speed_post' | 'registered'>('speed_post');
  const [parcelOrigin, setParcelOrigin] = useState('Indiranagar Post Office');
  const [parcelDestination, setParcelDestination] = useState('');
  const [parcelReceiverAddress, setParcelReceiverAddress] = useState('');
  const [parcelWeight, setParcelWeight] = useState<number>(300);
  const [parcelBookingStatusMsg, setParcelBookingStatusMsg] = useState('');
  const [parcelBookingErrorMsg, setParcelBookingErrorMsg] = useState('');

  // Cost Calculator Form
  const [calcWeight, setCalcWeight] = useState(250);
  const [calcType, setCalcType] = useState('speed_post');
  const [calcOrigin, setCalcOrigin] = useState('HAL Post Office, Bengaluru');
  const [calcDest, setCalcDest] = useState('Saket Ext, New Delhi');
  const [calcResult, setCalcResult] = useState<{
    charges: number; 
    days: string; 
    service: string; 
    insight: string;
    loading: boolean;
  }>({
    charges: 95,
    days: "1 - 3 Business Days",
    service: "Indian Air Speed Post",
    insight: "We recommend Speed Post for reliable flight cargo dispatch.",
    loading: false
  });

  // Chat window state
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Spam message scan state
  const [spamInput, setSpamInput] = useState('');
  const [spamSender, setSpamSender] = useState('');
  const [scannedSpam, setScannedSpam] = useState<SpamReport | null>(null);
  const [spamLoading, setSpamLoading] = useState(false);

  // Complaint form state
  const [compType, setCompType] = useState<'lost_parcel' | 'delayed_delivery' | 'damaged_parcel' | 'wrong_delivery'>('delayed_delivery');
  const [compTrackingId, setCompTrackingId] = useState('POST-7721-IN');
  const [compText, setCompText] = useState('');
  const [complaintStatusMsg, setComplaintStatusMsg] = useState('');

  // Address check form state
  const [addressInput, setAddressInput] = useState('Indiranagar 12th Main Road, near Metro Station, Bangalore');
  const [addressResult, setAddressResult] = useState<{
    isValid: boolean;
    suggestion: string;
    errors: string[];
    loading: boolean;
    detectedPincode?: string;
    pincodeLocationName?: string;
    confidence?: string;
    alternativePincodes?: string[];
  }>({
    isValid: false,
    suggestion: "Indiranagar 12th Main Road, Near Metro Station, Bengaluru, Karnataka, PIN Code: 560038 (Suggested)",
    errors: ["Missing 6-digit Indian PIN Code (e.g., 560038)"],
    loading: false,
    detectedPincode: "560038",
    pincodeLocationName: "Indiranagar S.O",
    confidence: "High",
    alternativePincodes: ["560008", "560075"]
  });

  // Staff / Admin variables
  const [adminSelectedStatus, setAdminSelectedStatus] = useState<string>('in_transit');
  const [adminUpdateTrackingId, setAdminUpdateTrackingId] = useState<string>('POST-7721-IN');
  const [adminUpdateLocation, setAdminUpdateLocation] = useState<string>('Delhi GPO Terminal');
  const [adminUpdateDesc, setAdminUpdateDesc] = useState<string>('Package sorted on flight manifest conveyor belt.');
  const [adminCounterId, setAdminCounterId] = useState<number>(1);

  // Multilingual localization map
  const localization = {
    en: {
      title: "AI Virtual Post Assistant",
      tagline: "Digitizing postal queues, parcel tracks, and assistance instantly",
      getStarted: "Get Started Portal",
      trackParcel: "Track Parcel",
      bookToken: "Book Digital Token",
      liveQueue: "Live Virtual Lobby",
      welcome: "Welcome",
      noQueues: "No more waiting in physical lines. Claim your online booking number instantly.",
      activeWait: "Est. wait minutes:",
      chatPlaceholder: "Ask Aura anything...",
      trackPlaceholder: "Enter Tracking ID (e.g. POST-7721-IN)..."
    },
    kn: {
      title: "ಎಐ ವರ್ಚುವಲ್ ಪೋಸ್ಟ್ ಅಸಿಸ್ಟೆಂಟ್",
      tagline: "ಅಂಚೆ ಸರತಿ ಸಾಲುಗಳು, ಪಾರ್ಸೆಲ್ ಟ್ರ್ಯಾಕ್‌ಗಳನ್ನು ತಕ್ಷಣವೇ ಡಿಜಿಟಲೀಕರಣಗೊಳಿಸುವುದು",
      getStarted: "ಪ್ರವೇಶ ದ್ವಾರ ಪ್ರಾರಂಭಿಸಿ",
      trackParcel: "ಪಾರ್ಸೆಲ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
      bookToken: "ಡಿಜಿಟಲ್ ಟೋಕನ್ ಕಾಯ್ದಿರಿಸಿ",
      liveQueue: "ಲೈವ್ ವರ್ಚುವಲ್ ಲಾಬಿ",
      welcome: "ಸ್ವಾಗತ",
      noQueues: "ಸರತಿ ಸಾಲಿನಲ್ಲಿ ಕಾಯುವ ಅವಶ್ಯಕತೆಯಿಲ್ಲ. ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆಯನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪಡೆಯಿರಿ.",
      activeWait: "ಅಂದಾಜು ಕಾಯುವ ಸಮಯ:",
      chatPlaceholder: "ಔರಾಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...",
      trackPlaceholder: "ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ ನಮೂದಿಸಿ..."
    },
    hi: {
      title: "एआई वर्चुअल पोस्ट असिस्टेंट",
      tagline: "डाक कतारों, पार्सल ट्रैक्स और सहायता को तुरंत डिजिटल बनाना",
      getStarted: "शुरू करें",
      trackParcel: "पार्सल ट्रैक करें",
      bookToken: "डिजिटल टोकन बुक करें",
      liveQueue: "लाइव कतार स्थिति",
      welcome: "स्वागत है",
      noQueues: "अब डाकघरों में लंबी कतारों में खड़े होने की आवश्यकता नहीं है। अपना नंबर ऑनलाइन प्राप्त करें।",
      activeWait: "अनुमानित प्रतीक्षा समय:",
      chatPlaceholder: "औरा से कुछ भी पूछें...",
      trackPlaceholder: "ट्रैकिंग आईडी दर्ज करें..."
    },
    te: {
      title: "AI వర్చువల్ పోస్ట్ అసిస్టెంట్",
      tagline: "పోస్టల్ క్యూలు మరియు పార్సెల్ ట్రాకింగ్‌ను తక్షణమే డిజిటలైజ్ చేయడం",
      getStarted: "ప్రారంభించండి",
      trackParcel: "పార్సెల్ ట్రాక్ చేయండి",
      bookToken: "డిజిటల్ టోకెన్ బుక్ చేయండి",
      liveQueue: "లైవ్ వర్చువల్ లాబీ",
      welcome: "స్వాగతం",
      noQueues: "భౌతిక క్యూలలో వేచి ఉండాల్సిన అవసరం లేదు. మీ సేవల టోకెన్ ఆన్‌లైన్ లో బుక్ చేసుకోండి.",
      activeWait: "సమయం అంచనా:",
      chatPlaceholder: "అవురాను ఏదైనా అడగండి...",
      trackPlaceholder: "ట్రాకింగ్ ఐడి ఇక్కడ ఇవ్వండి..."
    }
  };

  const t = localization[langCode];

  // Nearby Mock Post Offices
  const localPostOffices: PostOffice[] = [
    {
      id: "po-1",
      name: "HAL Post Office",
      address: "Suranjandas Rd, Vimanapura, Bengaluru, Karnataka",
      distance: "0.8 km",
      pinCode: "560017",
      openTime: "09:00 AM",
      closeTime: "03:00 PM",
      phone: "080-25223311",
      lat: 12.9612,
      lng: 77.6653
    },
    {
      id: "po-2",
      name: "Indiranagar Post Office",
      address: "12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka",
      distance: "2.3 km",
      pinCode: "560038",
      openTime: "09:00 AM",
      closeTime: "04:00 PM",
      phone: "080-25251144",
      lat: 12.9719,
      lng: 77.6412
    },
    {
      id: "po-3",
      name: "General Post Office (GPO) Bangalore",
      address: "Raj Bhavan Rd, Vasanth Nagar, Bengaluru, Karnataka",
      distance: "6.5 km",
      pinCode: "560001",
      openTime: "08:00 AM",
      closeTime: "08:00 PM",
      phone: "080-22392550",
      lat: 12.9833,
      lng: 77.5954
    }
  ];

  // Load baseline app state
  useEffect(() => {
    fetchTokens();
    fetchParcels();
    fetchComplaints();
    fetchNotifications();
    fetchSpamReports();
    fetchChatHistory();
  }, []);

  // Synchronize Booking fields with current authenticated user
  useEffect(() => {
    if (currentUser) {
      setBookCustomerName(currentUser.fullName || '');
      setBookCustomerEmail(currentUser.email || '');
      setParcelSenderName(currentUser.fullName || '');
    } else {
      setParcelSenderName('Yakshitha R Gowda'); // Default when not authenticated
    }
  }, [currentUser]);

  // API Call helper routines
  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/tokens');
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || []);
        if (data.stats) {
          setQueueStats(data.stats);
        }
      }
    } catch (err) {
      console.warn("Express server connection fallback during bundle compilation, utilizing reactive simulation logic.");
    }
  };

  const fetchParcels = async () => {
    try {
      const res = await fetch('/api/parcels');
      if (res.ok) {
        const data = await res.json();
        setParcels(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSpamReports = async () => {
    try {
      const res = await fetch('/api/spam/reports');
      if (res.ok) {
        const data = await res.json();
        setSpamReports(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await fetch('/api/chatbot/history');
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.history || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Perform quick parcel tracking search
  const handleTrackSubmit = async (tid: string) => {
    if (!tid) return;
    setTrackError('');
    setTrackedParcel(null);
    try {
      const res = await fetch('/api/parcels/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: tid })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackedParcel(data.parcel);
        setActiveTab('tracking');
      } else {
        setTrackError(data.error || 'Parcel tracking ID not recognized in national post database.');
      }
    } catch (err) {
      setTrackError('System tracking connection lost. Please verify your internet sync.');
    }
  };

  // Handle Token digital reservation
  const handleBookToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatusMsg('');
    const nameToBook = bookCustomerName || currentUser?.fullName || "Yakshitha R Gowda";
    try {
      const res = await fetch('/api/tokens/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || "user-cust-1",
          customerName: nameToBook,
          customerEmail: bookCustomerEmail,
          customerPhone: bookCustomerPhone,
          additionalNotes: bookAdditionalNotes,
          serviceType: bookService,
          date: bookDate,
          timeSlot: bookTime
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookingStatusMsg(`Success! Issued Digital Token ${data.token.tokenNumber}. Check SMS simulation & Inbox.`);
        setBookAdditionalNotes('');
        setBookCustomerPhone('');
        fetchTokens();
        fetchNotifications();
      } else {
        setBookingStatusMsg('Queue booking rejected by core system. Select alternative timeslot.');
      }
    } catch (err) {
      // Local fallback simulation if server is bundling
      const mockTokNum = `SPD-0${Math.floor(10 + Math.random() * 89)}`;
      const fallbackTok: Token = {
        id: `tok-${Date.now()}`,
        tokenNumber: mockTokNum,
        serviceType: bookService,
        date: bookDate,
        timeSlot: bookTime,
        status: 'waiting',
        estimatedWaitMinutes: 14,
        userId: currentUser?.id || "user-cust-1",
        customerName: nameToBook,
        customerEmail: bookCustomerEmail,
        customerPhone: bookCustomerPhone,
        additionalNotes: bookAdditionalNotes
      };
      setTokens(prev => [fallbackTok, ...prev]);
      setBookAdditionalNotes('');
      setBookCustomerPhone('');
      setBookingStatusMsg(`[Local Mode] Schedulered Token ${mockTokNum} registered locally!`);
    }
  };

  const handleBookParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setParcelBookingStatusMsg('');
    setParcelBookingErrorMsg('');
    
    const sender = parcelSenderName || currentUser?.fullName || "Yakshitha R Gowda";
    if (!sender || !parcelReceiverName || !parcelReceiverPhone || !parcelName) {
      setParcelBookingErrorMsg("Please fill out all required fields.");
      return;
    }

    try {
      const res = await fetch('/api/parcels/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderName: sender,
          receiverName: parcelReceiverName,
          receiverPhone: parcelReceiverPhone,
          receiverAddress: parcelReceiverAddress || parcelDestination,
          parcelName: parcelName,
          bookingMessage: parcelBookingMessage,
          origin: parcelOrigin,
          destination: parcelDestination || "Doorstep Address",
          weight: parcelWeight,
          type: parcelType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setParcelBookingStatusMsg(`Successfully registered parcel ${data.parcel.trackingId}!`);
        // Reset form except sender name
        setParcelReceiverName('');
        setParcelReceiverPhone('');
        setParcelReceiverAddress('');
        setParcelName('');
        setParcelBookingMessage('');
        setParcelDestination('');
        setParcelWeight(300);
        
        fetchParcels();            // refresh list
        fetchNotifications();      // refresh list
      } else {
        setParcelBookingErrorMsg(data.error || "Failed to book parcel.");
      }
    } catch (err) {
      // Local fallback in offline/bundling mode
      const mockSerial = Math.floor(1000 + Math.random() * 9000);
      const mockTrackingId = `POST-${mockSerial}-IN`;
      const baseRate = parcelType === "speed_post" ? 95 : (parcelType === "registered" ? 75 : 40);
      const weightChargeMultiplier = Math.ceil(parcelWeight / 500) * 15;
      const computedCharges = baseRate + weightChargeMultiplier;

      const mockPredictionObj = new Date();
      mockPredictionObj.setDate(mockPredictionObj.getDate() + (parcelType === "speed_post" ? 2 : 5));
      const mockPredictionStr = mockPredictionObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const fallbackParcel: Parcel = {
        id: `par-local-${Date.now()}`,
        trackingId: mockTrackingId,
        senderName: sender,
        receiverName: parcelReceiverName,
        receiverPhone: parcelReceiverPhone,
        receiverAddress: parcelReceiverAddress || parcelDestination || "Doorstep Address",
        parcelName: parcelName,
        bookingMessage: parcelBookingMessage,
        origin: parcelOrigin || "Local Post Office Hub",
        destination: parcelDestination || "Doorstep Address",
        weight: parcelWeight,
        type: parcelType,
        status: "processing",
        charges: computedCharges,
        deliveryPredictionDate: mockPredictionStr,
        createdAt: new Date().toISOString(),
        qrCode: mockTrackingId,
        timeline: [
          {
            status: "processing",
            timestamp: new Date().toISOString(),
            location: parcelOrigin || "Local Post Office Hub",
            description: "Self-booked parcel digitally registered in offline mode."
          }
        ]
      };
      
      setParcels(prev => [fallbackParcel, ...prev]);
      setParcelReceiverName('');
      setParcelReceiverPhone('');
      setParcelReceiverAddress('');
      setParcelName('');
      setParcelBookingMessage('');
      setParcelDestination('');
      setParcelWeight(300);
      setParcelBookingStatusMsg(`[Local Mode] Self-Booked Parcel ${mockTrackingId} registered!`);
    }
  };

  // Chat message send loop
  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const query = customMsg || chatInput;
    if (!query.trim()) return;

    // Append user query message instantly
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: chatMessages })
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages(prev => [...prev, {
          id: data.id,
          sender: 'ai',
          text: data.text,
          suggestions: data.suggestions,
          groundingLinks: data.groundingLinks,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      // Append smart static fallback
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `I noticed the local system connection is updating. I can verify Indian Post rules state you can drop off Standard Registered elements anytime before 3 PM. Recommended action: Please select "Book Token" to automate your physical kiosk queue spot!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 700);
    } finally {
      setChatLoading(false);
    }
  };

  // Shipping cost calculator calculation
  const handleCalculateCost = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcResult(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/parcels/calculate-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: calcWeight,
          parcelType: calcType,
          origin: calcOrigin,
          destination: calcDest
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCalcResult({
          charges: data.estimatedCharges,
          days: data.estimatedDays,
          service: data.recommendedService,
          insight: data.aiInsight,
          loading: false
        });
      }
    } catch (err) {
      setCalcResult(prev => ({ ...prev, loading: false }));
    }
  };

  // AI Fraud / Spam Detection Submission
  const handleSpamAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spamInput.trim()) return;
    setSpamLoading(true);
    setScannedSpam(null);

    try {
      const res = await fetch('/api/spam/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: spamInput,
          source: spamSender || "Unknown Carrier SMS"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScannedSpam(data.report);
        fetchSpamReports();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSpamLoading(false);
    }
  };

  // AI Address Validation Submission
  const handleAddressAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    setAddressResult(prev => ({ ...prev, loading: true }));

    try {
      const res = await fetch('/api/address/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalAddress: addressInput })
      });
      const data = await res.json();
      if (res.ok) {
        setAddressResult({
          isValid: data.isValid,
          suggestion: data.suggestion,
          errors: data.errors || [],
          detectedPincode: data.detectedPincode || "Not Found",
          pincodeLocationName: data.pincodeLocationName || "Unknown Ward/SO",
          confidence: data.confidence || "Low",
          alternativePincodes: data.alternativePincodes || [],
          loading: false
        });
      }
    } catch (err) {
      setAddressResult(prev => ({ ...prev, loading: false }));
    }
  };

  // Create digital complaint
  const handleLodgeComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintStatusMsg('');
    try {
      const res = await fetch('/api/complaints/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || "user-cust-1",
          customerName: currentUser?.fullName || "Yakshitha R Gowda",
          type: compType,
          trackingId: compTrackingId,
          description: compText
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComplaintStatusMsg('Grievance logged under active cyber review. Watch Ombudsman response below.');
        setCompText('');
        fetchComplaints();
        fetchNotifications();
      }
    } catch (err) {
      setComplaintStatusMsg('Service currently offline. Complaint recorded in localized storage queue.');
    }
  };

  // Role Authentication Setup Trigger
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, role: authRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Enforce role changes
        const modifiedUser = { 
          ...data.user, 
          role: authRole,
          fullName: authFullName || data.user.fullName
        };
        setCurrentUser(modifiedUser);
        setShowAuthModal(false);
      }
    } catch (err) {
      setCurrentUser({
        id: "offline-user-1",
        username: authEmail,
        email: authEmail,
        role: authRole,
        fullName: authFullName || authEmail.split('@')[0].toUpperCase(),
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
      });
      setShowAuthModal(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoteLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Staff action: Call next token in queue list
  const handleStaffCallToken = async (tokenId: string, counter: number) => {
    try {
      const res = await fetch('/api/tokens/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, counterNumber: counter })
      });
      if (res.ok) {
        fetchTokens();
        fetchNotifications();
      }
    } catch (err) {
      // Offline fallback toggle status
      setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status: 'calling', counterNumber: counter } : t));
    }
  };

  // Staff action: Complete Token
  const handleStaffCompleteToken = async (tokenId: string) => {
    try {
      const res = await fetch('/api/tokens/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      });
      if (res.ok) {
        fetchTokens();
      }
    } catch (err) {
      setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status: 'completed' } : t));
    }
  };

  // Staff action: Advance routing step for Parcel package
  const handleStaffUpdateTransit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/parcels/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: adminUpdateTrackingId,
          status: adminSelectedStatus,
          location: adminUpdateLocation,
          description: adminUpdateDesc
        })
      });
      if (res.ok) {
        alert(`Status updated successfully to: ${adminSelectedStatus}`);
        fetchParcels();
        fetchNotifications();
      } else {
        alert('Check tracking ID formatting. Standard sample is POST-7721-IN');
      }
    } catch (err) {
      alert('System transit update connection error.');
    }
  };

  // Simple QR Generator Mock component
  const handleGenerateParcelQRCode = (tid: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AIVA:${tid}`;
  };

  if (activeTab === 'manager') {
    return (
      <ManagerDashboard 
        parcels={parcels}
        setParcels={setParcels}
        tokens={tokens}
        setTokens={setTokens}
        complaints={complaints}
        setComplaints={setComplaints}
        onClose={() => setActiveTab('dashboard')}
        langCode={langCode}
      />
    );
  }

  if (activeTab === 'admin') {
    return (
      <StaffSection 
        parcels={parcels}
        setParcels={setParcels}
        tokens={tokens}
        setTokens={setTokens}
        complaints={complaints}
        setComplaints={setComplaints}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        langCode={langCode}
      />
    );
  }

  return (
    <div id="app-root" className="flex flex-col h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      
      {/* PROFESSIONAL POLISH GLASS NAVIGATION */}
      <nav id="navbar" className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-800 italic">
              AIVA <span className="text-indigo-600 font-normal not-italic">Post Assistant</span>
            </span>
          </div>
        </div>

        {/* Global Tracker Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              id="global-tracker-search"
              placeholder={t.trackPlaceholder}
              value={searchTrackingId}
              onChange={(e) => setSearchTrackingId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTrackSubmit(searchTrackingId);
              }}
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800 outline-none"
            />
            {searchTrackingId && (
              <button
                onClick={() => handleTrackSubmit(searchTrackingId)}
                className="absolute right-2 top-1.5 px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-bold text-white hover:bg-indigo-700 transition"
              >
                Track
              </button>
            )}
          </div>
        </div>

        {/* Control utility pane */}
        <div className="flex items-center gap-3">
          {/* Multilingual Selector Dropdown */}
          <div className="flex items-center bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition">
            <Languages className="w-4 h-4 mr-1 text-slate-500" />
            <select
              id="lang-selector"
              value={langCode}
              onChange={(e) => setLangCode(e.target.value as any)}
              className="bg-transparent text-xs border-none outline-none font-semibold text-slate-700 p-0"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>

          <button
            id="btn-goto-manager-portal"
            onClick={() => setActiveTab('manager')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-750 to-indigo-700 text-white rounded-lg text-xs font-black shadow-md hover:from-violet-800 hover:to-indigo-800 transition cursor-pointer"
          >
            👑 Chief Manager
          </button>

          <button
            id="btn-goto-staff-portal"
            onClick={() => setActiveTab('admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900 border border-indigo-950 text-white rounded-lg text-xs font-bold hover:bg-slate-905 transition shadow-inner cursor-pointer"
          >
            🔐 Staff Portal
          </button>

          <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping"></div>
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Aura Online</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div 
                onClick={() => setActiveTab('admin')} 
                className="cursor-pointer w-9 h-9 rounded-full bg-indigo-600 border border-slate-200 outline outline-offset-2 outline-indigo-200 text-white flex items-center justify-center font-bold text-xs"
                title={`${currentUser.fullName} (${currentUser.role})`}
              >
                {currentUser.fullName.substring(0, 2).toUpperCase()}
              </div>
              <button 
                id="btn-logout"
                onClick={handleDemoteLogout}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-signin-trigger"
              onClick={() => {
                setIsLoginView(true);
                setShowAuthModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              Authenticate Portal
            </button>
          )}
        </div>
      </nav>

      {/* DUAL WORKSPACE BODY LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDE BAR NAVIGATION */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-1.5 shrink-0 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Navigation</div>
            
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4.5 h-4.5" />
              Lobby & Terminal
            </button>

            <button
              id="tab-booking"
              onClick={() => {
                if (!currentUser) { setShowAuthModal(true); return; }
                setActiveTab('booking');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                activeTab === 'booking' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4.5 h-4.5 text-indigo-500" />
              Book Token
              {!currentUser && <Lock className="w-3 h-3 ml-auto text-slate-400" />}
            </button>

            <button
              id="tab-tracking"
              onClick={() => setActiveTab('tracking')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                activeTab === 'tracking' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4.5 h-4.5 text-blue-500" />
              My Shipping Logs
            </button>

            <button
              id="tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition ${
                activeTab === 'chat' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bot className="w-4.5 h-4.5 text-amber-500" />
              AI Aura Concierge
            </button>

            <div className="mt-3 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Logistics Tools</div>

            <button
              id="tab-calculator"
              onClick={() => setActiveTab('calculator')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs transition ${
                activeTab === 'calculator' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4 text-slate-400" />
              Postal Cost Matrix
            </button>

            <button
              id="tab-spam"
              onClick={() => setActiveTab('spam')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs transition ${
                activeTab === 'spam' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Phish Cyber Scanner
            </button>

            <button
              id="tab-addresses"
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs transition ${
                activeTab === 'addresses' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              AI PIN Code Auditor
            </button>

            <button
              id="tab-complaints"
              onClick={() => {
                if (!currentUser) { setShowAuthModal(true); return; }
                setActiveTab('complaints');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs transition ${
                activeTab === 'complaints' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-purple-500" />
              File Cyber Ombudsman
              {!currentUser && <Lock className="w-3 h-3 ml-auto text-slate-400" />}
            </button>

            {/* Role switch visual prompt */}
            <div className="mt-4 p-4 bg-slate-900 rounded-2xl text-white">
              <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold mb-1">Live Environment</p>
              <p className="text-xs font-semibold mb-3">You are browsing standard general public features.</p>

              {currentUser ? (
                <div>
                  <div className="text-[11px] text-slate-300 font-medium mb-2 bg-slate-800 p-2 rounded">
                    Role: <span className="text-amber-300 font-bold uppercase">{currentUser.role}</span>
                  </div>
                  {currentUser.role !== 'customer' && (
                    <button
                      id="tab-admin-pane"
                      onClick={() => setActiveTab('admin')}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition uppercase"
                    >
                      Open Staff Counter Deck
                    </button>
                  )}
                </div>
              ) : (
                <button
                  id="btn-sidebar-staff-demo"
                  onClick={() => {
                    setAuthRole('staff');
                    setAuthEmail('staff@post.gov');
                    setAuthFullName('Staff Counter 3');
                    setIsLoginView(true);
                    setShowAuthModal(true);
                  }}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 py-2 rounded-lg text-[10px] font-bold tracking-wider transition uppercase cursor-pointer"
                >
                  Test As Counter Staff
                </button>
              )}
            </div>
          </aside>
        )}

        {/* CONTAINER WORKSPACE VIEWPORT */}
        <main className="flex-1 p-6 flex flex-col gap-6 bg-slate-50 overflow-y-auto">
          
          {/* TOP BANNER COMPONENT */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg border border-slate-800">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-8">
              <Sparkles className="w-64 h-64" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                  National Postal Digitization Initiative
                </span>
                <h2 className="text-2xl mt-2 font-bold tracking-tight">
                  {t.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {t.tagline}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  id="hero-book-cta"
                  onClick={() => {
                    if (!currentUser) { setShowAuthModal(true); return; }
                    setActiveTab('booking');
                  }}
                  className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  {t.bookToken}
                </button>
                <button
                  id="hero-track-btn"
                  onClick={() => {
                    const tid = prompt("Please enter the demo tracking code (e.g. POST-7721-IN):", "POST-7721-IN");
                    if (tid) handleTrackSubmit(tid);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-700 transition"
                >
                  {t.trackParcel}
                </button>
                <button
                  id="hero-chat-btn"
                  onClick={() => setActiveTab('chat')}
                  className="bg-indigo-900 text-indigo-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-800 transition"
                >
                  Try AI Assistant
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC TAB OUTLET ROUTER */}

          {/* TAB 1: DASHBOARD HOME & STATS OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              
              {/* SUBSTANTIVE GRID METRICS PANELS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Active Lobby Serviced Token</p>
                  <h3 className="text-2xl font-black text-indigo-600">
                    {queueStats.currentCallingToken}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                    <p className="text-[10px] text-green-600 font-bold">
                      Called at Counter {queueStats.currentCallingCounter || 1}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Mails & Parcels in Transit</p>
                  <h3 className="text-2xl font-black text-slate-800">03 Registered</h3>
                  <p id="stats-transit-sub" className="text-[10px] text-indigo-500 font-medium">
                    1 Out with Letter Courier
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-500 font-semibold mb-1">Citizens Waiting Offline</p>
                  <h3 className="text-2xl font-black text-slate-800">
                    {queueStats.waitingCount} Users
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {t.activeWait} ~{queueStats.estimatedAverageWait} Min
                  </p>
                </div>

                <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-100">
                  <p className="text-xs opacity-80 font-semibold mb-1">AI Savings Metric</p>
                  <h3 className="text-2xl font-black">-4.8 hrs</h3>
                  <p className="text-[10px] opacity-80 font-medium">Average citizen physical line wait reduction</p>
                </div>
              </div>

              {/* THREE COLUMN GRID LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Live Queue Lobby Board */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Live Virtual Queue Status
                    </h4>
                    <button
                      onClick={fetchTokens}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                      title="Sync Queue"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 h-9">
                    {t.noQueues}
                  </p>

                  <div className="space-y-2.5 flex-1 max-h-64 overflow-y-auto pr-1">
                    {tokens.length === 0 ? (
                      <div className="text-center p-4 text-slate-400 text-xs">
                        No active queue list. Be the first to book below!
                      </div>
                    ) : (
                      tokens.map((tok) => (
                        <div
                          key={tok.id}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                            tok.status === 'calling'
                              ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                              : tok.status === 'completed'
                              ? 'bg-slate-50 border-slate-200 opacity-60'
                              : 'bg-white border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-800">{tok.tokenNumber}</span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded whitespace-nowrap">
                                {tok.serviceType}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                              <span className="text-slate-800 font-semibold">{tok.customerName}</span>
                              {tok.customerPhone && <span className="text-blue-600">📞 {tok.customerPhone}</span>}
                              {tok.customerEmail && <span className="text-slate-400">✉️ {tok.customerEmail}</span>}
                            </div>
                            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
                              Slot: {tok.timeSlot}
                            </div>
                            {tok.additionalNotes && (
                              <div className="mt-1.5 p-1.5 bg-slate-50/50 rounded-lg text-[9px] text-slate-500 border border-slate-100 italic">
                                Note: {tok.additionalNotes}
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            {tok.status === 'calling' ? (
                              <span className="px-2 py-0.5 bg-amber-500 font-bold text-[9px] text-white uppercase rounded animate-pulse">
                                Calling Counter {tok.counterNumber || 1}
                              </span>
                            ) : tok.status === 'completed' ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-[9px] uppercase rounded">
                                Completed
                              </span>
                            ) : tok.status === 'cancelled' ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[9px] uppercase rounded">
                                Cancelled
                              </span>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] text-indigo-600 font-bold">
                                  Est ~{tok.estimatedWaitMinutes}m Wait
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {currentUser ? (
                    <button
                      id="dash-book-now-btn"
                      onClick={() => setActiveTab('booking')}
                      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl transition"
                    >
                      Process Online Booking Slotted Instant
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="mt-4 w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-xl transition"
                    >
                      Sign In to Secure Online Reservation
                    </button>
                  )}
                </div>

                {/* 2. Quick Travel Tracking Panel */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm mb-3">
                    <Truck className="w-4.5 h-4.5 text-blue-600" />
                    Interactive Cargo Timeline
                  </h4>

                  <p className="text-xs text-slate-500 mb-4">
                    Sample active tracking: <strong className="text-indigo-600">POST-7721-IN</strong> (Bengaluru to New Delhi with AI Cargo Grounding)
                  </p>

                  <div className="relative flex-1 py-1 pr-1 pl-4 border-l border-slate-200 ml-2 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">Delhi GPO Cargo Hub</p>
                        <p className="text-[10px] text-indigo-600 font-semibold">In Transit • May 23</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Arrived at Delhi cargo hub. Sorting in progress.</p>
                      </div>
                    </div>

                    <div className="relative opacity-70">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">Kempapura Logistics Center</p>
                        <p className="text-[10px] text-slate-500">Dispatched • May 22</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Dispatched towards New Delhi Mail Terminal.</p>
                      </div>
                    </div>

                    <div className="relative opacity-50">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">HAL Post Office Counter</p>
                        <p className="text-[10px] text-slate-500">Accepted • May 22</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="text-[9px] text-indigo-700 font-extrabold uppercase tracking-wider">AI Delivery Prediction</p>
                    <p className="text-xs text-slate-800 font-semibold mt-0.5">Tomorrow afternoon (Estimated 98.4% Confidence)</p>
                  </div>
                </div>

                {/* 3. AURA Quick Chat Component */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold font-mono">AURA AGENT TERMINAL</span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-bold uppercase">Kiosk v4.2</span>
                  </div>

                  <div className="flex-1 p-4 bg-slate-900 text-slate-100 h-64 overflow-y-auto space-y-3 font-mono text-xs">
                    <div className="text-slate-400 text-[10px]">Ready for user command input. Language: English / Kannada.</div>
                    
                    <div className="text-slate-300">
                      <span className="text-indigo-400 font-bold">Aura_AI:</span> Namaskara! Ask me about nearby pin codes, parcel tracking code status, or calculate Speed Post travel times. Try choosing one below:
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => handleSendMessage(undefined, "Where is my parcel POST-7721-IN?")}
                        className="w-full text-left font-sans bg-slate-800 hover:bg-slate-705 p-2 rounded text-[11px] text-indigo-200 border border-slate-700 transition"
                      >
                        👉 Where is POST-7721-IN?
                      </button>
                      <button
                        onClick={() => handleSendMessage(undefined, "Estimate Speed Post cost to Mumbai")}
                        className="w-full text-left font-sans bg-slate-800 hover:bg-slate-705 p-2 rounded text-[11px] text-blue-200 border border-slate-700 transition"
                      >
                        👉 Estimate Speed Post charges to Mumbai
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold py-2 rounded-lg transition"
                    >
                      Launch Immersive Voice & Chat Console
                    </button>
                  </div>
                </div>

              </div>

              {/* NEARBY OFFICE COMPACT LOCATOR */}
              <div id="office-locator" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm mb-4">
                  <MapPin className="w-4.5 h-4.5 text-red-500" />
                  Local post offices near your current geolocation (Bengaluru)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {localPostOffices.map((office) => (
                    <div key={office.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-indigo-400 hover:shadow-sm transition">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800">{office.name}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-full">
                          {office.distance}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{office.address}</p>
                      <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between text-[10px] text-slate-400">
                        <span>PIN: <strong className="text-slate-600">{office.pinCode}</strong></span>
                        <span>Open: <strong className="text-slate-600">{office.openTime} - {office.closeTime}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ONLINE TOKEN BOOKING SYSTEM (THE MAIN FEATURE) */}
          {activeTab === 'booking' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Digital Gatekeeping Slotted Token booking</h3>
                  <p className="text-xs text-slate-400">Save hours. Reserve an AI-estimated slot below.</p>
                </div>
              </div>

              {bookingStatusMsg && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 text-xs rounded-r-xl font-semibold">
                  {bookingStatusMsg}
                </div>
              )}

              <form onSubmit={handleBookToken} className="space-y-4 text-xs font-medium text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">Postal Service Target</label>
                    <select
                      id="booking-service"
                      value={bookService}
                      onChange={(e) => setBookService(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    >
                      <option value="Speed Post">Speed Post (Letters / Air Cargo)</option>
                      <option value="Parcel Booking">Parcel Booking (Heavy Boxes)</option>
                      <option value="Money Order">Money Order & Direct Remit</option>
                      <option value="Savings Services">Savings Services & Insurance</option>
                      <option value="Complaint Support">Complaint & Ombudsman Auditing</option>
                      <option value="Aadhaar Services">Aadhaar Services & Biometrics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">Slotted Date</label>
                    <input
                      type="date"
                      id="booking-date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-wider">Time Slot Segment</label>
                  <select
                    id="booking-timeslot"
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                  >
                    <option value="09:30 AM - 10:00 AM">09:30 AM - 10:00 AM</option>
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                    <option value="10:30 AM - 11:00 AM">10:30 AM - 11:00 AM (Recommended - High staff availability)</option>
                    <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                  </select>
                </div>

                {/* CUSTOMER PROFILE DETAIL INGRESS FOR QUEUE BOARDING */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <span className="block text-[11px] text-indigo-600 font-bold uppercase tracking-wider mb-2">Customer Check-in Details</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        required
                        value={bookCustomerName}
                        onChange={(e) => setBookCustomerName(e.target.value)}
                        placeholder="e.g. Yakshitha R Gowda"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-widest">Contact Number</label>
                      <input
                        type="tel"
                        required
                        value={bookCustomerPhone}
                        onChange={(e) => setBookCustomerPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input
                        type="email"
                        required
                        value={bookCustomerEmail}
                        onChange={(e) => setBookCustomerEmail(e.target.value)}
                        placeholder="e.g. consumer@outlook.in"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] text-slate-400 uppercase tracking-widest">Additional Notes / Special Request</label>
                    <textarea
                      rows={2}
                      value={bookAdditionalNotes}
                      onChange={(e) => setBookAdditionalNotes(e.target.value)}
                      placeholder="e.g. Aadhaar biometrics update, regular box shipping, senior citizen priority."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Estimated Queuing Time Wait</p>
                    <p className="text-sm font-black text-indigo-600">~12 Minutes Max</p>
                    <p className="text-[10px] text-slate-400">AIVA Auto-Estimator analyzes counter speeds live.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Lobby Line Wait</p>
                    <p className="text-xs text-green-600 font-bold">Excellent Flow</p>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-confirm-booking"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 mt-2 rounded-xl transition text-xs shadow-md shadow-indigo-100"
                >
                  Generate Digital Pass Token Number
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SMART PARCEL SHIPPING LOGS & TRACKER */}
          {activeTab === 'tracking' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Comprehensive Parcel Registry</h3>
                  <p className="text-xs text-slate-400">Browse current digital drops or audit a package tracker code.</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    id="panel-tracking-search"
                    placeholder="Search Tracking ID (e.g. POST-7721-IN)..."
                    value={searchTrackingId}
                    onChange={(e) => setSearchTrackingId(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                  <button
                    onClick={() => handleTrackSubmit(searchTrackingId)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition"
                  >
                    Track Code
                  </button>
                </div>

                {trackError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
                    {trackError}
                  </div>
                )}

                {/* Tracking View Result */}
                {trackedParcel && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-200/50 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-indigo-700 uppercase font-bold">ACTIVE SCAN REPORT</span>
                        <h4 className="text-lg font-black text-slate-800 mt-0.5">{trackedParcel.trackingId}</h4>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg uppercase">
                        {trackedParcel.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-100">
                      {trackedParcel.parcelName && (
                        <div className="col-span-2 border-b border-primary/10 pb-2 mb-1">
                          <p className="text-[10px] text-indigo-600 uppercase font-extrabold">Parcel Item Name</p>
                          <p className="font-bold text-slate-800 text-[13px]">{trackedParcel.parcelName}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-400 font-medium">Sender full name:</p>
                        <p className="font-bold text-slate-800">{trackedParcel.senderName}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Receiver target name:</p>
                        <p className="font-bold text-slate-800">{trackedParcel.receiverName}</p>
                        {trackedParcel.receiverPhone && (
                          <p className="text-[10px] text-blue-600 font-semibold mt-0.5">📞 {trackedParcel.receiverPhone}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Origin dispatch:</p>
                        <p className="font-semibold text-slate-700">{trackedParcel.origin}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Target Destination:</p>
                        <p className="font-semibold text-slate-700">{trackedParcel.destination}</p>
                      </div>
                      {trackedParcel.receiverAddress && (
                        <div className="col-span-2 border-t border-slate-100 pt-2">
                          <p className="text-indigo-600 font-bold text-[9px] uppercase tracking-wider">Full Delivery Target Address:</p>
                          <p className="font-bold text-slate-800 leading-normal bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/40 text-[11px] select-all mt-0.5">{trackedParcel.receiverAddress}</p>
                        </div>
                      )}
                      {trackedParcel.bookingMessage && (
                        <div className="col-span-2 border-t border-slate-100 pt-2 mt-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Customer Dispatch Note / Instructions</p>
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg italic mt-1 font-normal">
                            "{trackedParcel.bookingMessage}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* QR Code and timeline */}
                    <div className="flex flex-col md:flex-row gap-6 items-center bg-white p-4 rounded-xl">
                      <div className="flex flex-col items-center p-2 border border-slate-100 rounded-xl bg-slate-50">
                        <img 
                          src={handleGenerateParcelQRCode(trackedParcel?.trackingId)} 
                          alt="QR Barcode" 
                          className="w-24 h-24 object-contain"
                        />
                        <span className="text-[9px] font-mono mt-1 text-slate-500 font-bold">{trackedParcel.trackingId}</span>
                      </div>

                      <div className="flex-1 space-y-3.5 relative border-l border-slate-100 pl-4 py-1 ml-2">
                        {trackedParcel.timeline.map((event, index) => (
                          <div key={index} className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></span>
                            <p className="text-xs font-bold text-slate-800">{event.location}</p>
                            <p className="text-[9px] text-indigo-600 font-bold">{new Date(event.timestamp).toLocaleString()}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{event.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 bg-indigo-900 text-white rounded-xl">
                      <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">AI Delivery Prediction Estimate</p>
                      <p className="text-xs mt-0.5">Estimated destination doorstep drop by <strong>{trackedParcel.deliveryPredictionDate}</strong></p>
                    </div>
                  </div>
                )}

                {/* Parcel List */}
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">My Current Parcels</p>
                  
                  {parcels.map((parcel) => (
                    <div
                      key={parcel.id}
                      onClick={() => setTrackedParcel(parcel)}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-indigo-400 hover:bg-white transition cursor-pointer flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{parcel.trackingId}</span>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold rounded">
                            {parcel.type}
                          </span>
                          {parcel.parcelName && (
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-55 px-1.5 rounded truncate max-w-[120px]">
                              📦 {parcel.parcelName}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate max-w-[280px]">
                          Sender: {parcel.senderName} • To: {parcel.receiverName} ({parcel.receiverAddress || parcel.destination})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded">
                          {parcel.status}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1">Est. {parcel.deliveryPredictionDate}</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* RIGHT HAND SIDEBAR: SELF-SERVICE BOOKING & RATE ESTIMATOR */}
              <div className="flex flex-col gap-6 lg:col-span-1">
                
                {/* 1. DIGITAL PARCEL DISPATCH / BOOKING CARD */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Self-Service Parcel Booking</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Pre-register your package content details digitally to generate a scannable postage bar code and save counter queuing times.
                  </p>

                  <form onSubmit={handleBookParcel} className="space-y-3.5 text-xs text-slate-600 font-medium">
                    {parcelBookingStatusMsg && (
                      <div className="p-3 bg-green-50 text-green-700 font-bold border border-green-200 rounded-xl text-[11px] animate-fade-in">
                        {parcelBookingStatusMsg}
                      </div>
                    )}
                    {parcelBookingErrorMsg && (
                      <div className="p-3 bg-red-50 text-red-700 font-bold border border-red-200 rounded-xl text-[11px] animate-fade-in">
                        {parcelBookingErrorMsg}
                      </div>
                    )}

                    <div>
                      <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Parcel Name / Contents *</label>
                      <input
                        type="text"
                        required
                        value={parcelName}
                        onChange={(e) => setParcelName(e.target.value)}
                        placeholder="e.g. Leather Wallet, Academic Transcripts"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sender Name *</label>
                        <input
                          type="text"
                          required
                          value={parcelSenderName}
                          onChange={(e) => setParcelSenderName(e.target.value)}
                          placeholder="Sender full name"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Receiver Name *</label>
                        <input
                          type="text"
                          required
                          value={parcelReceiverName}
                          onChange={(e) => setParcelReceiverName(e.target.value)}
                          placeholder="Receiver full name"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Receiver Contact Number *</label>
                      <input
                        type="tel"
                        required
                        value={parcelReceiverPhone}
                        onChange={(e) => setParcelReceiverPhone(e.target.value)}
                        placeholder="e.g. +91 91100 22334"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-semibold"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Receiver Delivery Address *</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (addressResult && addressResult.suggestion) {
                              setParcelReceiverAddress(addressResult.suggestion);
                              const pinMatch = addressResult.suggestion.match(/\d{6}/);
                              if (pinMatch) {
                                setParcelDestination(pinMatch[0]);
                              }
                            } else {
                              alert("Please audit an address first in the 'AI PIN Code Auditor' tab to auto-copy!");
                            }
                          }}
                          className="text-[9px] text-indigo-600 hover:text-indigo-800 font-bold transition focus:outline-none"
                        >
                          🪄 Load from AI Auditor
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={parcelReceiverAddress}
                        onChange={(e) => {
                          setParcelReceiverAddress(e.target.value);
                          // Guess pincode of destination city to sync
                          const pinMatch = e.target.value.match(/\d{6}/);
                          if (pinMatch) {
                            setParcelDestination(pinMatch[0]);
                          }
                        }}
                        placeholder="Flat, Street, Area, City, State & PIN Code"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-xs font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Origin City *</label>
                        <input
                          type="text"
                          required
                          value={parcelOrigin}
                          onChange={(e) => setParcelOrigin(e.target.value)}
                          placeholder="Origin dispatch"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination City *</label>
                        <input
                          type="text"
                          required
                          value={parcelDestination}
                          onChange={(e) => setParcelDestination(e.target.value)}
                          placeholder="Destination city"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weight (Grams) *</label>
                        <input
                          type="number"
                          required
                          value={parcelWeight}
                          onChange={(e) => setParcelWeight(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Postal Mode *</label>
                        <select
                          value={parcelType}
                          onChange={(e) => setParcelType(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                        >
                          <option value="speed_post">Speed Post (Air)</option>
                          <option value="registered">Registered Post</option>
                          <option value="standard">Standard Surface</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Special Message / Notes</label>
                      <textarea
                        rows={2}
                        value={parcelBookingMessage}
                        onChange={(e) => setParcelBookingMessage(e.target.value)}
                        placeholder="e.g. Fragile contents. Handle with care."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition mt-2 cursor-pointer shadow-md shadow-indigo-100 uppercase text-[11px] tracking-wider"
                    >
                      Pre-Book Parcel Drop-off
                    </button>
                  </form>
                </div>

                {/* 2. SIDE COST MATRIX PREVIEW */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-slate-800 text-sm">Postage Cost Matrix</h4>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-normal">Quickly estimate Speed Post or Registered Mail rates based on weight and target distances.</p>

                  <form onSubmit={handleCalculateCost} className="space-y-3.5 text-xs text-slate-600 font-medium">
                    <div>
                      <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400">Parcel weight (grams)</label>
                      <input
                        type="number"
                        id="calc-weight-input"
                        value={calcWeight}
                        onChange={(e) => setCalcWeight(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[10px] uppercase font-bold text-slate-400">Postal category</label>
                      <select
                        id="calc-category-select"
                        value={calcType}
                        onChange={(e) => setCalcType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-slate-800"
                      >
                        <option value="standard">Standard Domestic Surface</option>
                        <option value="speed_post">Indian Air Speed Post</option>
                        <option value="registered">Secure Registered Post</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      id="btn-compute-cost"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition mt-2 cursor-pointer"
                    >
                      Calculate Cost matrix live
                    </button>
                  </form>

                  {calcResult && (
                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl flex flex-col gap-2 mt-2">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>Charges Estimate:</span>
                        <span className="text-indigo-600">₹{calcResult.charges} NPR</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Service:</span>
                        <span>{calcResult.service}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Delivery projection:</span>
                        <span>{calcResult.days}</span>
                      </div>
                      
                      {calcResult.insight && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 italic">
                          {calcResult.insight}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: AI CHATBOT ASSISTANT (AURA CELLULAR CONCIERGE) */}
          {activeTab === 'chat' && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
              <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 rounded bg-green-400 h-2 animate-pulse"></div>
                  <h3 className="font-bold text-sm font-mono tracking-tight">AURA AI CHAT INTERFACE</h3>
                </div>
                <div className="flex gap-2 text-[10px]">
                  <span className="text-indigo-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                    Multilingual Enabled
                  </span>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 flex flex-col">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] text-xs leading-relaxed ${
                      msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {msg.sender === 'user' ? 'US' : 'AU'}
                    </div>

                    <div className="flex flex-col">
                      <div
                        className={`p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                        }`}
                      >
                        <p>{msg.text}</p>
                        
                        {/* Grounded Web Links */}
                        {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            <span className="text-[10px] text-indigo-500 font-bold uppercase block">Verified Sources:</span>
                            {msg.groundingLinks.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 underline block hover:text-blue-800"
                              >
                                {link.text}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Msg suggestions */}
                      {msg.suggestions && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(undefined, sug)}
                              className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-indigo-100 transition"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-2 text-xs text-slate-400 font-mono italic self-start items-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>Aura is thinking of best solutions...</span>
                  </div>
                )}
              </div>

              {/* Chat Send */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white shadow-sm flex gap-2">
                <input
                  type="text"
                  id="chat-console-input"
                  placeholder={t.chatPlaceholder}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-xs px-4 py-2 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  id="btn-send-message"
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: POSTAL COST CALCULATOR FULL PAGE */}
          {activeTab === 'calculator' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center text-indigo-600">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">AI Postal Cost Matrix Calculator</h3>
                  <p className="text-xs text-slate-400">Instantly resolve Indian postal tariff bands and air-speed predictions.</p>
                </div>
              </div>

              <form onSubmit={handleCalculateCost} className="space-y-4 text-xs font-medium text-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-400">Dispatch PIN Origin</label>
                    <input
                      type="text"
                      id="cost-origin"
                      value={calcOrigin}
                      onChange={(e) => setCalcOrigin(e.target.value)}
                      placeholder="e.g. HAL Bengaluru, PIN 560017"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-400">Destination target Area</label>
                    <input
                      type="text"
                      id="cost-dest"
                      value={calcDest}
                      onChange={(e) => setCalcDest(e.target.value)}
                      placeholder="e.g. Saket Delhi, PIN 110001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-400">Expected Weight (grams)</label>
                    <input
                      type="number"
                      id="cost-weight"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-400">Service Carrier Method</label>
                    <select
                      id="cost-category"
                      value={calcType}
                      onChange={(e) => setCalcType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                    >
                      <option value="standard">Standard Domestic (Ground Logistics)</option>
                      <option value="speed_post">Indian Air Speed Post (Primary Flight Airmail)</option>
                      <option value="registered">Secure Registered Post (Insured tracking receipt)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-compute-full"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 mt-2 rounded-xl transition text-xs shadow-md shadow-indigo-150"
                >
                  Estimate Transport Charges & Time
                </button>
              </form>

              {calcResult && (
                <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase">Tariff Estimate Code</span>
                    <span className="text-2xl font-black text-indigo-600">₹{calcResult.charges} Domestic</span>
                  </div>

                  <hr className="border-slate-200/60" />

                  <div className="text-xs space-y-1.5 text-slate-700">
                    <p>📦 Service Category: <strong>{calcResult.service}</strong></p>
                    <p>⏱️ Estimated Doors Delivery: <strong>{calcResult.days}</strong></p>
                  </div>

                  {calcResult.insight && (
                    <div className="mt-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100/40 text-[11px] text-indigo-800 leading-relaxed font-semibold flex items-start gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                      <span>{calcResult.insight}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CYBER SPAM & FRAUD DETECTOR */}
          {activeTab === 'spam' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">AIVA Cyber fraud & spam Shield</h3>
                  <p className="text-xs text-slate-400">Paste SMS, email notifications, or fake delivery links to calculate safety indexes.</p>
                </div>
              </div>

              <form onSubmit={handleSpamAudit} className="space-y-4 text-xs font-semibold text-slate-600">
                <div>
                  <label className="block mb-1 font-bold text-slate-400">Incoming Sender Phone / Email Identifier</label>
                  <input
                    type="text"
                    id="spam-sender-input"
                    placeholder="e.g. +91 92834 11048 or alert@post-delivery-fees.xyz"
                    value={spamSender}
                    onChange={(e) => setSpamSender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-400">Raw Text Message Content</label>
                  <textarea
                    id="spam-text-input"
                    rows={4}
                    placeholder="Paste the suspicious text here..."
                    value={spamInput}
                    onChange={(e) => setSpamInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                  ></textarea>
                </div>

                <div className="flex gap-2 text-[10px] text-slate-500 font-mono mt-1">
                  <span>🚀 Pro TIP: Dark/fraud links often request immediate UPI payment of small sums like ₹25.</span>
                </div>

                <button
                  type="submit"
                  id="btn-scan-phish"
                  disabled={spamLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition cursor-pointer flex justify-center items-center gap-2"
                >
                  {spamLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Audit Safety Risk Score
                </button>
              </form>

              {scannedSpam && (
                <div className={`p-5 rounded-2xl border flex flex-col gap-3 mt-4 ${
                  scannedSpam.classification === 'fraud' 
                    ? 'bg-red-50 border-red-200/50 text-red-900' 
                    : 'bg-emerald-50 border-emerald-200/50 text-emerald-900'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10px] uppercase tracking-wider">CYBER PHISH ASSESSMENT</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      scannedSpam.classification === 'fraud' ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'
                    }`}>
                      {scannedSpam.classification.toUpperCase()} Danger Score: {scannedSpam.riskScore}%
                    </span>
                  </div>

                  <p className="text-xs italic leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-100 mt-2 text-slate-700">
                    "{scannedSpam.messageText}"
                  </p>

                  <div className="space-y-1.5 mt-2">
                    <p className="text-xs font-bold">Actionable Safety recommendations:</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] font-sans">
                      {scannedSpam.recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: AI PIN CODE & ADDRESS VALIDATION */}
          {activeTab === 'addresses' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center text-indigo-600">
                  <MapPin className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg uppercase tracking-wide">AI Pin Code Auditor & Suggester</h3>
                  <p className="text-xs text-slate-400">Instantly audit delivery locations, resolve mismatched PINs, and suggest the exact local pincode.</p>
                </div>
              </div>

              {/* Quick Sample Presets */}
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Quick Location Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Bengaluru Metro", text: "HAL 2nd Stage, near metro station, Bangalore, Karnataka" },
                    { label: "Marine Drive Mum", text: "Trident Hotel, Marine Drive, Mumbai" },
                    { label: "Connaught Pl Delhi", text: "Outer Circle block F, Connaught Place, New Delhi" },
                    { label: "Wrong PIN Test", text: "HAL Road, Indiranagar, Bangalore 110001" },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAddressInput(preset.text)}
                      className="text-[10px] bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-slate-100 rounded-lg px-2.5 py-1 text-slate-600 font-semibold transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddressAudit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-xs font-bold text-slate-500">Paste Location or Incomplete Address</label>
                  <textarea
                    id="address-check-input"
                    rows={3}
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="e.g. HAL 2nd Stage, Indiranagar, Bengaluru near metro"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none font-medium h-20"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  id="btn-audit-address"
                  disabled={addressResult.loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-black py-3 rounded-xl transition cursor-pointer shadow-md shadow-indigo-100 uppercase tracking-wider"
                >
                  {addressResult.loading ? "Auditing Location Records & PIN Matrix..." : "Audit Location & Suggest Exact PIN"}
                </button>
              </form>

              {/* LOADING SKELETON */}
              {addressResult.loading && (
                <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl animate-pulse space-y-3 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700">Aura AI Location Auditor Active</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Fetching hyper-local GPO/SO mapping coordinates & PIN code databases...</p>
                  </div>
                </div>
              )}

              {/* AUDIT RESULTS REPORT */}
              {!addressResult.loading && addressResult && (
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-4 text-xs animate-fade-in shadow-sm">
                  
                  {/* Pincode & Accuracy Banner Group */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Big Pincode Badge */}
                    <div className="bg-white p-3 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Detected PIN</span>
                      <span className="text-2xl font-black text-indigo-600 my-0.5 tracking-tight">
                        {addressResult.detectedPincode || "560038"}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold truncate max-w-full">
                        📬 {addressResult.pincodeLocationName || "Local S.O / GPO"}
                      </span>
                    </div>

                    {/* Confidence Meter */}
                    <div className="bg-white p-3 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Confidence</span>
                      <span className={`text-sm font-black mt-1.5 px-2 py-0.5 rounded-lg ${
                        addressResult.confidence === 'High' ? 'text-emerald-700 bg-emerald-50' :
                        addressResult.confidence === 'Medium' ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-100'
                      }`}>
                        🛡️ {addressResult.confidence || "High"}
                      </span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full ${
                          addressResult.confidence === 'High' ? 'w-full bg-emerald-500' :
                          addressResult.confidence === 'Medium' ? 'w-2/3 bg-amber-400' : 'w-1/3 bg-red-400'
                        }`}></div>
                      </div>
                    </div>

                    {/* Safety Status */}
                    <div className="bg-white p-3 border border-slate-200/60 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">PIN Alignment status</span>
                      <span className={`text-[10px] font-black mt-1.5 px-2 py-1 rounded-lg tracking-wider ${
                        addressResult.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-50 text-red-700'
                      }`}>
                        {addressResult.isValid ? 'MATCHED & SAFE' : 'PIN ERROR DETECTED'}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-1 font-medium">Standard Indian Post</span>
                    </div>

                  </div>

                  {/* Errors / Warnings List */}
                  {addressResult.errors.length > 0 && (
                    <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl space-y-1">
                      <p className="text-red-700 font-bold text-[10px] uppercase tracking-wider">Auditor Warnings & Mismatches:</p>
                      <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px] font-medium">
                        {addressResult.errors.map((err, eIdx) => (
                          <li key={eIdx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Alternative overlapping / nearby blocks if available */}
                  {addressResult.alternativePincodes && addressResult.alternativePincodes.length > 0 && (
                    <div className="bg-white p-3 border border-slate-100 rounded-xl space-y-1.5">
                      <p className="text-slate-400 text-[9px] font-extrabold uppercase tracking-wider">Nearby/Adjacent Alternative Pincodes:</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {addressResult.alternativePincodes.map((altPin, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={() => {
                              // Replace pinecode in text or suggest
                              setAddressInput(prev => {
                                const matched = prev.match(/\d{6}/);
                                if (matched) {
                                  return prev.replace(/\d{6}/, altPin);
                                } else {
                                  return `${prev} ${altPin}`;
                                }
                              });
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-bold px-2 py-0.5 rounded text-[10px] transition cursor-pointer"
                          >
                            📍 PIN {altPin}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr className="border-slate-200/60" />

                  {/* Suggested Clean Address Template output */}
                  <div className="space-y-1.5">
                    <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Recommended standard Indian Postal Template:</p>
                    <p className="bg-white p-3.5 border border-slate-200 rounded-xl text-slate-800 font-bold text-[11px] select-all shadow-xs leading-relaxed">
                      {addressResult.suggestion}
                    </p>
                  </div>

                  {/* Handy Action triggers */}
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(addressResult.suggestion);
                        alert("Suggested postal template copied safely!");
                      }}
                      className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold py-2 px-3 rounded-xl transition text-[11px] text-center"
                    >
                      📋 Copy Standard Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setParcelReceiverAddress(addressResult.suggestion);
                        const pinMatch = addressResult.suggestion.match(/\d{6}/);
                        if (pinMatch) {
                          setParcelDestination(pinMatch[0]);
                        } else {
                          setParcelDestination("India Courier Zone");
                        }
                        setActiveTab('dashboard');
                        alert(`Suggested standard address filled successfully into the "Self-Service Parcel Booking" console on the Dashboard!`);
                      }}
                      className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold py-2 px-3 rounded-xl transition text-[11px] text-center cursor-pointer"
                    >
                      🚚 Apply to Booking Address
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 8: CYBER GRIEVANCES OMBUDSMAN CHANNELS */}
          {activeTab === 'complaints' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center text-purple-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Digital Ombudsman complaint Register</h3>
                  <p className="text-xs text-slate-400">Lodge lost parcels, delay grievances, and receive AI Ombuds legal auto-responses.</p>
                </div>
              </div>

              {complaintStatusMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 rounded text-xs">
                  {complaintStatusMsg}
                </div>
              )}

              <form onSubmit={handleLodgeComplaint} className="space-y-4 text-xs font-semibold text-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-400">Grievance Category</label>
                    <select
                      id="complaint-category"
                      value={compType}
                      onChange={(e) => setCompType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-xs"
                    >
                      <option value="delayed_delivery">Delayed Shipping transit arrival</option>
                      <option value="lost_parcel">Lost or unaccounted parcel ID</option>
                      <option value="damaged_parcel">Damaged parcel container physical wear</option>
                      <option value="wrong_delivery">Delivered to wrong address category</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-400">Active tracking ID</label>
                    <input
                      type="text"
                      id="complaint-tracking"
                      value={compTrackingId}
                      onChange={(e) => setCompTrackingId(e.target.value)}
                      placeholder="POST-7721-IN"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-400">Describe physical or transit concern</label>
                  <textarea
                    id="complaint-desc"
                    rows={3}
                    value={compText}
                    onChange={(e) => setCompText(e.target.value)}
                    placeholder="Provide logistics concerns details..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  id="btn-lodge-complaint"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition text-xs"
                >
                  File Complaint to National Kiosk Registry
                </button>
              </form>

              {/* History complaints with AI responses */}
              <div className="space-y-3.5 mt-4">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Your lodging history</p>
                {complaints.length === 0 ? (
                  <p className="text-xs text-slate-400">No grievance reports filed inside current browser session index.</p>
                ) : (
                  complaints.map((comp) => (
                    <div key={comp.id} className="p-4 bg-slate-50 border border-slate-200/65 rounded-xl text-xs space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">{comp.trackingId} - {comp.type.replace('_', ' ').toUpperCase()}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded text-[9px]">
                          {comp.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-slate-600 font-sans italic">"{comp.description}"</p>

                      {comp.aiResponse && (
                        <div className="p-3 bg-indigo-900 text-white rounded-lg border border-indigo-950 font-sans">
                          <p className="text-[9px] text-indigo-300 font-mono font-bold tracking-widest uppercase">AI UNIFIED GRIEVANCE OFFICIOLOGY AUTO-RESPONSE</p>
                          <p className="text-[11px] leading-relaxed mt-1 font-medium">{comp.aiResponse}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 9: STAFF PANEL & ACTIVE COUNTER VIEW */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 id="staff-dashboard-header" className="font-bold text-slate-800 text-base">Authorized Staff & Admin Queue Central</h3>
                  <p className="text-xs text-slate-400">Call waiting citizens to Counter 3, advance statuses, and analyze dashboard reports.</p>
                </div>

                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg uppercase">
                    Admin role authorization ACTIVE
                  </span>
                </div>
              </div>

              {/* Queue Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Board list */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 text-slate-400">Lobby Citizens Waiting</h4>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {tokens.filter(t => t.status === 'waiting').length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No users currently queue waiting.</p>
                    ) : (
                      tokens.filter(t => t.status === 'waiting').map((tok) => (
                        <div key={tok.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="font-bold text-slate-800 text-sm">{tok.tokenNumber}</span>
                            <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 bg-slate-200/60 rounded text-slate-600">
                              {tok.serviceType}
                            </span>
                            <div className="text-[10px] text-slate-600 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                              <span className="font-bold text-slate-800">{tok.customerName}</span>
                              {tok.customerPhone && <span className="text-blue-600">📞 {tok.customerPhone}</span>}
                              {tok.customerEmail && <span className="text-slate-500">✉️ {tok.customerEmail}</span>}
                            </div>
                            <div className="text-[9px] text-slate-400">Date/Time: {tok.date} • {tok.timeSlot}</div>
                            {tok.additionalNotes && (
                              <div className="mt-1 p-1.5 bg-amber-50/40 text-slate-600 text-[10px] border border-amber-100 rounded-lg italic">
                                Note: {tok.additionalNotes}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleStaffCallToken(tok.id, 1)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shrink-0"
                            >
                              Call C1
                            </button>
                            <button
                              onClick={() => handleStaffCallToken(tok.id, 3)}
                              className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shrink-0"
                            >
                              Call C3 (You)
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs uppercase mb-2 mt-6 text-slate-400">In-Service / Calling right now</h4>
                  <div className="space-y-2">
                    {tokens.filter(t => t.status === 'calling').map((tok) => (
                      <div key={tok.id} className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl flex justify-between items-center text-xs">
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="font-extrabold text-amber-900">{tok.tokenNumber}</span>
                          <span className="ml-2 text-[10px] bg-white text-slate-700 border border-slate-200 rounded px-1">{tok.serviceType}</span>
                          <div className="text-[10px] text-slate-700 mt-1 flex flex-wrap gap-x-2 gap-y-0.5 font-medium">
                            <span className="font-bold text-slate-800">{tok.customerName}</span>
                            {tok.customerPhone && <span className="text-blue-600">📞 {tok.customerPhone}</span>}
                            {tok.customerEmail && <span className="text-slate-500">✉️ {tok.customerEmail}</span>}
                          </div>
                          <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">Active Counter {tok.counterNumber}</p>
                          {tok.additionalNotes && (
                            <div className="mt-1 p-1 bg-white text-slate-600 text-[10px] border border-slate-100 rounded italic">
                              Note: {tok.additionalNotes}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleStaffCompleteToken(tok.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition"
                        >
                          Complete Service No.
                        </button>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Parcel Dispatch State Manipulator */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase text-slate-400">Scan & Update Parcel transit status</h4>

                  <form onSubmit={handleStaffUpdateTransit} className="space-y-3.5 text-xs text-slate-600">
                    <div>
                      <label className="block mb-1 font-bold">Target Tracking ID</label>
                      <input
                        type="text"
                        id="staff-target-tracking"
                        value={adminUpdateTrackingId}
                        onChange={(e) => setAdminUpdateTrackingId(e.target.value)}
                        placeholder="POST-7721-IN"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 font-bold font-sans">Current Dispatch Station</label>
                        <input
                          type="text"
                          id="staff-target-station"
                          value={adminUpdateLocation}
                          onChange={(e) => setAdminUpdateLocation(e.target.value)}
                          placeholder="Delhi Air Cargo Terminal"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-bold font-sans">State Option</label>
                        <select
                          id="staff-target-status"
                          value={adminSelectedStatus}
                          onChange={(e) => setAdminSelectedStatus(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                        >
                          <option value="processing">Processing & Weighed</option>
                          <option value="accepted">Accepted At Counter</option>
                          <option value="dispatched">Dispatched Transit</option>
                          <option value="in_transit">In Transit Sort Center</option>
                          <option value="out_for_delivery">Out for Delivery Carrier</option>
                          <option value="delivered">Delivered Successfully</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">Transit details label description</label>
                      <input
                        type="text"
                        id="staff-target-description"
                        value={adminUpdateDesc}
                        onChange={(e) => setAdminUpdateDesc(e.target.value)}
                        placeholder="Checked through high velocity conveyor belts."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      id="btn-staff-update-parcel"
                      className="w-full bg-slate-900 text-white font-bold py-2.5 mt-2 rounded-xl text-xs transition uppercase tracking-wider cursor-pointer"
                    >
                      Scan QR Barcode & Update State
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* FOOTER INFORMANT */}
      <footer id="footer-decor" className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest shrink-0 font-bold z-10">
        <div>AI Virtual Post Office v4.2.0 • Real-time Sync Active</div>
        <div className="flex gap-6">
          <span>Security Compliance Certified</span>
          <span>Smart Network: <span className="text-emerald-500">Optimal (3000)</span></span>
        </div>
      </footer>

      {/* SECURE POPUP ROLE AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <span className="inline-flex w-10 h-10 rounded-full bg-indigo-50 items-center justify-center text-indigo-600 mb-2">
                <Lock className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Secure India Post Kiosk Gateway</h3>
              <p className="text-xs text-slate-400 mt-1">Authenticate credentials or switch live dashboard view templates.</p>
            </div>

            <form onSubmit={handleUserLogin} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-400 text-[10px] uppercase font-bold">Email Address ID</label>
                <input
                  type="email"
                  id="auth-email-input"
                  required
                  placeholder="e.g. customer@post.gov or staff@post.gov"
                  value={authEmail}
                  onChange={(e) => {
                    setAuthEmail(e.target.value);
                    if (e.target.value.includes('admin')) {
                      setAuthRole('admin');
                    } else if (e.target.value.includes('staff')) {
                      setAuthRole('staff');
                    } else {
                      setAuthRole('customer');
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block mb-0.5 text-slate-400 text-[10px] uppercase font-bold">Full Name (Label ID)</label>
                <input
                  type="text"
                  id="auth-fullname-input"
                  placeholder="e.g Yakshitha R Gowda"
                  value={authFullName}
                  onChange={(e) => setAuthFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-xs focus:ring-2"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400 text-[10px] uppercase font-bold">Role Session</label>
                <select
                  id="auth-role-select"
                  value={authRole}
                  onChange={(e) => setAuthRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:ring-2 outline-none text-xs"
                >
                  <option value="customer">Customer Session Role (General Lobby)</option>
                  <option value="staff">Station Staff Session Role (Counter 3)</option>
                  <option value="admin">Administrator Staff Session Role (Chief Admin)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-xl text-[10px] text-slate-500 font-sans font-medium space-y-1">
                <p className="font-bold text-indigo-600">Quick Test Credentials:</p>
                <p>🙋‍♂️ Customer: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">customer@post.gov</code></p>
                <p>⚙️ Counter Staff: <code className="bg-slate-100 px-1 py-0.5 rounded text-pink-700">staff@post.gov</code></p>
              </div>

              <button
                type="submit"
                id="btn-submit-auth"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition text-xs font-bold shadow-md cursor-pointer"
              >
                Authenticate Live Dashboard Now
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
