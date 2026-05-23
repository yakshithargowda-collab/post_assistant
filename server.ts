/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  User, 
  Token, 
  Parcel, 
  Complaint, 
  SpamReport, 
  ChatMessage, 
  Notification, 
  PostOffice,
  LoginActivity
} from "./src/types";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// SECURE GEMINI CLIENT LAZY-LOAD PATTERN
// This prevents server crashing if API keys are not supplied.
// -------------------------------------------------------------
let aiInstance: GoogleGenAI | null = null;
let lastRateLimitTime = 0;
const COOLDOWN_MS = 60000; // 1-minute fallback cooldown to prevent spamming 429 errors

function getGeminiClient(): GoogleGenAI | null {
  if (Date.now() - lastRateLimitTime < COOLDOWN_MS) {
    // Under active cooldown after rate limits, use high-fidelity offline simulated logic
    return null;
  }

  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Falling back to AI simulator.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

function handleGeminiError(error: any) {
  const errMsg = String(error?.message || error || "");
  const errCode = error?.status || error?.code || "";
  
  if (
    errMsg.includes("429") || 
    errMsg.includes("RESOURCE_EXHAUSTED") || 
    errMsg.includes("quota") || 
    errCode === 429 || 
    errCode === "RESOURCE_EXHAUSTED"
  ) {
    console.warn("⚠️ Gemini API Rate Limit / Quota Exceeded (429). Initiating 60-second local fallback cooldown to avoid spam.");
    lastRateLimitTime = Date.now();
  } else {
    console.error("Gemini API Error details:", errMsg);
  }
}

// -------------------------------------------------------------
// PERSISTENT MEMORY STORE
// Initializes with high-fidelity, professional-level mock data
// -------------------------------------------------------------
let users: User[] = [
  {
    id: "user-cust-1",
    username: "customer@post.gov",
    email: "customer@post.gov",
    role: "customer",
    fullName: "Yakshitha R Gowda",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"
  },
  {
    id: "user-admin-1",
    username: "admin@post.gov",
    email: "admin@post.gov",
    role: "admin",
    fullName: "Chief Administrator GPO",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
  },
  {
    id: "user-staff-1",
    username: "staff@post.gov",
    email: "staff@post.gov",
    role: "staff",
    fullName: "Laxmi Narayan (Staff Counter 3)",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
  }
];

let tokens: Token[] = [
  {
    id: "tok-1",
    tokenNumber: "SPD-008",
    serviceType: "Speed Post",
    date: "2026-05-24",
    timeSlot: "10:30 AM - 11:00 AM",
    estimatedWaitMinutes: 12,
    status: "waiting",
    userId: "user-cust-1",
    customerName: "Yakshitha R Gowda"
  },
  {
    id: "tok-2",
    tokenNumber: "PRC-014",
    serviceType: "Parcel Booking",
    date: "2026-05-24",
    timeSlot: "11:30 AM - 12:00 PM",
    estimatedWaitMinutes: 4,
    status: "waiting",
    userId: "user-cust-1",
    customerName: "Yakshitha R Gowda"
  },
  {
    id: "tok-3",
    tokenNumber: "ADH-003",
    serviceType: "Aadhaar Services",
    date: "2026-05-24",
    timeSlot: "09:30 AM - 10:00 AM",
    estimatedWaitMinutes: 0,
    status: "completed",
    userId: "user-cust-1",
    customerName: "Yakshitha R Gowda",
    counterNumber: 3
  },
  {
    id: "tok-4",
    tokenNumber: "SPD-007",
    serviceType: "Speed Post",
    date: "2026-05-24",
    timeSlot: "10:15 AM - 10:30 AM",
    estimatedWaitMinutes: 2,
    status: "calling",
    userId: "user-cust-other",
    customerName: "Rakesh Kumar",
    counterNumber: 1
  }
];

let parcels: Parcel[] = [
  {
    id: "par-1",
    trackingId: "POST-7721-IN",
    senderName: "Yakshitha R Gowda",
    receiverName: "Amit Kumar Sharma",
    origin: "HAL Post Office, Bengaluru, Karnataka",
    destination: "Saket Ext, New Delhi, Delhi",
    weight: 450,
    type: "speed_post",
    status: "in_transit",
    deliveryPredictionDate: "May 26, 2026",
    charges: 95,
    createdAt: "2026-05-22T08:30:00Z",
    qrCode: "POST-7721-IN",
    timeline: [
      {
        status: "processing",
        timestamp: "2026-05-22T08:30:00Z",
        location: "HAL Post Office, Bengaluru",
        description: "Parcel booked digitally & dropped at HAL post counter."
      },
      {
        status: "accepted",
        timestamp: "2026-05-22T11:15:00Z",
        location: "HAL Post Office, Bengaluru",
        description: "Checked, weighed, and stamped under Speed Post guidelines."
      },
      {
        status: "dispatched",
        timestamp: "2026-05-22T19:30:00Z",
        location: "Kempapura sorting hub, Bengaluru",
        description: "Dispatched towards New Delhi Mail Terminal."
      },
      {
        status: "in_transit",
        timestamp: "2026-05-23T14:45:00Z",
        location: "Delhi GPO Air Cargo Hub",
        description: "Arrived at Delhi cargo hub. Sorting in progress."
      }
    ]
  },
  {
    id: "par-2",
    trackingId: "POST-1092-IN",
    senderName: "Praveen Gowda",
    receiverName: "Yakshitha R Gowda",
    origin: "GPO Mumbai, Maharashtra",
    destination: "Indiranagar Post Office, Bengaluru",
    weight: 1200,
    type: "standard",
    status: "delivered",
    deliveryPredictionDate: "May 22, 2026",
    charges: 120,
    createdAt: "2026-05-19T09:00:00Z",
    qrCode: "POST-1092-IN",
    timeline: [
      {
        status: "processing",
        timestamp: "2026-05-19T09:00:00Z",
        location: "GPO Mumbai",
        description: "Parcel handed over at counters."
      },
      {
        status: "dispatched",
        timestamp: "2026-05-20T10:00:00Z",
        location: "Mumbai Central Sorting District",
        description: "Routed for South Bangalore Delivery hub."
      },
      {
        status: "out_for_delivery",
        timestamp: "2026-05-22T08:00:00Z",
        location: "Indiranagar Delivery Post",
        description: "Out with letter carrier Rajesh V."
      },
      {
        status: "delivered",
        timestamp: "2026-05-22T13:40:00Z",
        location: "Bengaluru Home Address",
        description: "Delivered successfully with digital signature approval."
      }
    ]
  },
  {
    id: "par-3",
    trackingId: "POST-4819-IN",
    senderName: "Yakshitha R Gowda",
    receiverName: "Siddharth Hegde",
    origin: "Indiranagar Post Office, Bengaluru",
    destination: "Udupi Post Office, Udupi, Karnataka",
    weight: 2200,
    type: "registered",
    status: "accepted",
    deliveryPredictionDate: "May 27, 2026",
    charges: 180,
    createdAt: "2026-05-23T12:00:00Z",
    qrCode: "POST-4819-IN",
    timeline: [
      {
        status: "processing",
        timestamp: "2026-05-23T12:00:00Z",
        location: "Indiranagar Hub",
        description: "Digital booking completed by customer."
      },
      {
        status: "accepted",
        timestamp: "2026-05-23T15:10:00Z",
        location: "Indiranagar Hub",
        description: "Verified and accepted at parcel counter."
      }
    ]
  }
];

let complaints: Complaint[] = [
  {
    id: "comp-1",
    userId: "user-cust-1",
    customerName: "Yakshitha R Gowda",
    type: "delayed_delivery",
    trackingId: "POST-7721-IN",
    description: "The parcel was supposed to arrive today in Saket but still shows sorting in Delhi GPO. Please check status.",
    status: "investigating",
    aiResponse: "Based on Indian Postal flight status updates, our Delhi Cargo sorting terminal experienced a heavy monsoon delay. The AI Predictor confirms delivery should occur within 24 hours without damage risk.",
    createdAt: "2026-05-23T15:30:00Z"
  }
];

let spamReports: SpamReport[] = [
  {
    id: "spam-1",
    userId: "user-cust-1",
    source: "+91 98452 11092",
    messageText: "Your IndiaPost parcel is delayed due to incorrect house number! Urgent: Update now at http://indiapost-update-pay-alert.net/refund or shipping will be cancelled. Immediate payment of ₹25 is required.",
    riskScore: 98,
    classification: "fraud",
    recommendations: [
      "Immediate Action: Do not click the provided domain. Official IndiaPost domains always end with '.gov.in'.",
      "Notice: India Post never requests payment of small amounts like ₹25 online to change destination addresses through SMS.",
      "Security TIP: Block +91 98452 11092 and report to national cyber security portal."
    ],
    createdAt: "2026-05-23T11:00:00Z"
  }
];

let notifications: Notification[] = [
  {
    id: "not-1",
    userId: "user-cust-1",
    title: "Appointment Token Booked",
    message: "Your Token SPD-008 is booked for tomorrow at HAL Post Office. Wait estimation is 12 minutes.",
    type: "success",
    read: false,
    createdAt: "2026-05-23T16:10:00Z"
  },
  {
    id: "not-2",
    userId: "user-cust-1",
    title: "Parcel Dispatch Alert",
    message: "POST-7721-IN has left Bengaluru hub towards New Delhi Cargo Terminal.",
    type: "info",
    read: true,
    createdAt: "2026-05-22T19:35:00Z"
  }
];

let loginActivities: LoginActivity[] = [
  {
    id: "act-1",
    email: "customer@post.gov",
    role: "customer",
    timestamp: "2026-05-24T10:15:30Z",
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
    status: "success",
    type: "customer_portal"
  },
  {
    id: "act-2",
    email: "yakshithargowda@gmail.com",
    role: "Chief Post Manager",
    timestamp: "2026-05-24T09:00:12Z",
    ipAddress: "103.88.240.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36",
    status: "success",
    type: "manager_portal"
  }
];

const postOffices: PostOffice[] = [
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
  },
  {
    id: "po-4",
    name: "Koromangala Local Post Office",
    address: "80 Feet Rd, 6th Block, Koramangala, Bengaluru, Karnataka",
    distance: "4.8 km",
    pinCode: "560095",
    openTime: "09:00 AM",
    closeTime: "03:30 PM",
    phone: "080-25530113",
    lat: 12.9362,
    lng: 77.6253
  }
];

// Helper to calculate queue statistics
function getQueueStats() {
  const activeToken = tokens.find(t => t.status === 'calling');
  const waitingTokens = tokens.filter(t => t.status === 'waiting');
  
  // Predict overall wait time
  const averageWaitPerPerson = 6; // minutes
  const totalEstimatedWait = waitingTokens.length * averageWaitPerPerson;

  return {
    currentCallingToken: activeToken ? activeToken.tokenNumber : "None Active",
    currentCallingCounter: activeToken ? activeToken.counterNumber || 1 : null,
    waitingCount: waitingTokens.length,
    estimatedAverageWait: totalEstimatedWait,
    activeCounters: [1, 2, 3]
  };
}

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  let foundUser = users.find(u => u.email === email);
  
  if (!foundUser) {
    foundUser = {
      id: `user-cust-${Date.now()}`,
      username: email,
      email: email,
      role: email.includes("admin") ? "admin" : (email.includes("staff") ? "staff" : "customer"),
      fullName: email.split("@")[0].toUpperCase(),
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
    };
    users.push(foundUser);
  }

  // Log login activity
  const activity: LoginActivity = {
    id: `act-${Date.now()}`,
    email: foundUser.email,
    role: foundUser.role,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || "127.0.0.1",
    userAgent: req.header("user-agent") || "Web Browser Session",
    status: "success",
    type: foundUser.role === 'admin' ? "manager_portal" : "customer_portal"
  };
  loginActivities.unshift(activity);

  res.json({
    success: true,
    user: foundUser,
    token: `mock-jwt-token-for-${foundUser.role}-${foundUser.id}`
  });
});

app.post("/api/auth/signup", (req, res) => {
  const { email, fullName, role } = req.body;
  const exists = users.find(u => u.email === email);
  
  if (exists) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const newUser: User = {
    id: `user-cust-${Date.now()}`,
    username: email,
    email: email,
    role: role || "customer",
    fullName: fullName || email.split("@")[0],
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
  };

  users.push(newUser);
  res.json({
    success: true,
    user: newUser,
    token: `mock-jwt-token-for-${newUser.role}-${newUser.id}`
  });
});

// -------------------------------------------------------------
// APPOINTMENT TOKEN SYSTEM ENDPOINTS
// -------------------------------------------------------------
app.get("/api/tokens", (req, res) => {
  res.json({
    tokens,
    stats: getQueueStats()
  });
});

app.post("/api/tokens/book", (req, res) => {
  const { userId, customerName, customerEmail, customerPhone, additionalNotes, serviceType, date, timeSlot } = req.body;

  // Generate modern serial code
  const servicePrefixes: { [key: string]: string } = {
    "Speed Post": "SPD",
    "Parcel Booking": "PRC",
    "Money Order": "MNY",
    "Savings Services": "SAV",
    "Complaint Support": "CMP",
    "Aadhaar Services": "ADH"
  };

  const prefix = servicePrefixes[serviceType] || "PST";
  const sequentialNum = tokens.filter(t => t.serviceType === serviceType).length + 3; // Offset
  const tokenNumber = `${prefix}-${sequentialNum.toString().padStart(3, "0")}`;

  // Estimate unique wait time via mock math
  const initialWaitMinutes = tokens.filter(t => t.status === "waiting").length * 5 + 4;

  const newToken: Token = {
    id: `tok-${Date.now()}`,
    tokenNumber,
    serviceType,
    date: date || new Date().toISOString().split("T")[0],
    timeSlot: timeSlot || "10:00 AM - 10:30 AM",
    estimatedWaitMinutes: initialWaitMinutes,
    status: "waiting",
    userId: userId || "user-cust-1",
    customerName: customerName || "Yakshitha R Gowda",
    customerEmail,
    customerPhone,
    additionalNotes
  };

  tokens.push(newToken);

  // Trigger automated notification simulation
  notifications.unshift({
    id: `not-${Date.now()}`,
    userId: newToken.userId,
    title: "Appointment Token Issued",
    message: `Digital Token ${newToken.tokenNumber} confirmed for ${newToken.serviceType}. Wait time estimator says ~${newToken.estimatedWaitMinutes} minutes.`,
    type: "success",
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    token: newToken,
    stats: getQueueStats()
  });
});

app.post("/api/tokens/cancel", (req, res) => {
  const { tokenId } = req.body;
  const token = tokens.find(t => t.id === tokenId);
  
  if (token) {
    token.status = "cancelled";
    res.json({ success: true, token });
  } else {
    res.status(404).json({ error: "Token not found" });
  }
});

// Staff / Admin state actions
app.post("/api/tokens/call", (req, res) => {
  const { tokenId, counterNumber } = req.body;
  
  // Set all current "calling" to completed on this counter
  tokens.forEach(t => {
    if (t.status === "calling" && t.counterNumber === counterNumber) {
      t.status = "completed";
    }
  });

  const token = tokens.find(t => t.id === tokenId);
  if (token) {
    token.status = "calling";
    token.counterNumber = counterNumber || 1;

    // Simulate notification triggers
    notifications.unshift({
      id: `not-${Date.now()}`,
      userId: token.userId,
      title: "Your Turn is UP!",
      message: `Token ${token.tokenNumber} is called at Counter ${token.counterNumber}! Please proceed to the counter immediately.`,
      type: "warning",
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, token, stats: getQueueStats() });
  } else {
    res.status(404).json({ error: "Token not found" });
  }
});

app.post("/api/tokens/complete", (req, res) => {
  const { tokenId } = req.body;
  const token = tokens.find(t => t.id === tokenId);
  
  if (token) {
    token.status = "completed";
    res.json({ success: true, token, stats: getQueueStats() });
  } else {
    res.status(44);
  }
});


// -------------------------------------------------------------
// SMART PARCEL TRACKING & MANAGEMENT ENDPOINTS
// -------------------------------------------------------------
app.get("/api/parcels", (req, res) => {
  res.json(parcels);
});

app.post("/api/parcels/track", (req, res) => {
  const { trackingId } = req.body;
  const parcel = parcels.find(p => p.trackingId.toUpperCase() === trackingId.toUpperCase());
  
  if (parcel) {
    res.json({ success: true, parcel });
  } else {
    res.status(404).json({ error: "Invalid tracking ID or parcel not scanned in current network." });
  }
});

// Staff modifies parcel tracking timeline
app.post("/api/parcels/update-status", (req, res) => {
  const { trackingId, status, location, description } = req.body;
  const parcel = parcels.find(p => p.trackingId.toUpperCase() === trackingId.toUpperCase());

  if (parcel) {
    parcel.status = status;
    const nowISO = new Date().toISOString();
    
    // Inject event
    parcel.timeline.push({
      status,
      timestamp: nowISO,
      location: location || "HQ Sort Depot",
      description: description || `Status updated to ${status}.`
    });

    // Notify customer
    notifications.unshift({
      id: `not-${Date.now()}`,
      userId: parcel.senderName === "Yakshitha R Gowda" ? "user-cust-1" : "all",
      title: `Transit Alert: ${parcel.trackingId}`,
      message: `Your package state has been scanned as [${status}] in ${location}.`,
      type: status === "delivered" ? "success" : "info",
      read: false,
      createdAt: nowISO
    });

    res.json({ success: true, parcel });
  } else {
    res.status(404).json({ error: "Parcel not found" });
  }
});

// Create speed parcel digitally
app.post("/api/parcels/create", (req, res) => {
  const { senderName, receiverName, receiverPhone, receiverAddress, parcelName, bookingMessage, origin, destination, weight, type } = req.body;
  
  const serial = Math.floor(1000 + Math.random() * 9000);
  const trackingId = `POST-${serial}-IN`;
  const baseRate = type === "speed_post" ? 95 : (type === "registered" ? 75 : 40);
  const weightChargeMultiplier = Math.ceil(weight / 500) * 15;
  const computedCharges = baseRate + weightChargeMultiplier;

  // Predict date via algorithm
  const deliveryDays = type === "speed_post" ? 2 : (type === "registered" ? 4 : 6);
  const predictionObj = new Date();
  predictionObj.setDate(predictionObj.getDate() + deliveryDays);
  const predictionStr = predictionObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const newParcel: Parcel = {
    id: `par-${Date.now()}`,
    trackingId,
    senderName: senderName || "Yakshitha R Gowda",
    receiverName: receiverName || "Recipient Name",
    receiverPhone: receiverPhone || "",
    receiverAddress: receiverAddress || destination || "",
    parcelName: parcelName || "",
    bookingMessage: bookingMessage || "",
    origin: origin || "Indiranagar Post Office",
    destination: destination || "Target Address",
    weight: weight || 250,
    type: type || "standard",
    status: "processing",
    charges: computedCharges,
    deliveryPredictionDate: predictionStr,
    createdAt: new Date().toISOString(),
    qrCode: trackingId,
    timeline: [
      {
        status: "processing",
        timestamp: new Date().toISOString(),
        location: origin || "Counter Office Hub",
        description: "Post booked digitally. Drop-off barcode registered."
      }
    ]
  };

  parcels.push(newParcel);
  
  res.json({ success: true, parcel: newParcel });
});


// -------------------------------------------------------------
// POSTAL COST CALCULATOR ENDPOINT
// Uses smart estimations combined with optional AI insights
// -------------------------------------------------------------
app.post("/api/parcels/calculate-cost", async (req, res) => {
  const { weight, parcelType, origin, destination } = req.body;
  
  const baseWeight = Number(weight) || 100;
  
  // Service calculation rules
  const pricingRule = {
    standard: { rate: 30, text: "Standard National Mail", days: "5 - 7 Business Days" },
    speed_post: { rate: 80, text: "Indian Air Speed Post", days: "1 - 3 Business Days" },
    registered: { rate: 60, text: "Secure Registered Letter", days: "3 - 5 Business Days" }
  };

  const selectedRule = pricingRule[parcelType as keyof typeof pricingRule] || pricingRule.standard;
  const weightTierCharge = Math.ceil(baseWeight / 100) * 8;
  const estimatedCharge = selectedRule.rate + weightTierCharge;

  // Let's get AI recommendation if key is available
  let recommendation = `We recommend utilizing ${selectedRule.text} for cost-efficient dispatch. Ensure adequate padding is used for parcel of ${baseWeight}g.`;
  
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Act as an expert postal logistician. A package of weighing ${baseWeight} grams is being shipped from "${origin || 'Bengaluru'}" to "${destination || 'Mumbai'}". The user wants service type "${parcelType}". 
      Write a concise single-sentence professional delivery prediction recommendation and tip for this specific combination. Keep it under 25 words.`;
      
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      if (aiResponse.text) {
        recommendation = aiResponse.text.trim();
      }
    } catch (e) {
      handleGeminiError(e);
    }
  }

  res.json({
    estimatedCharges: estimatedCharge,
    estimatedDays: selectedRule.days,
    recommendedService: selectedRule.text,
    aiInsight: recommendation
  });
});


// -------------------------------------------------------------
// AI COMPLAINT SYSTEM WITH SMART RESPONSE
// -------------------------------------------------------------
app.get("/api/complaints", (req, res) => {
  res.json(complaints);
});

app.post("/api/complaints/create", async (req, res) => {
  const { userId, customerName, type, trackingId, description } = req.body;
  
  const cleanType = type || "delayed_delivery";
  const userText = description || "Parcel has not reached hub yet.";
  const customer = customerName || "An anonymous customer";

  // Formulate a smart response instantly
  let smartResponse = "We have received your grievance regarding postal dispatch. Our local postmaster is auditing sorting bins and will revert within 48 hours.";

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `You are the Virtual Post Office AI Grievance Ombudsman. 
      A customer named "${customer}" has filed a digital complaint on category "${cleanType}" for transaction ID "${trackingId || 'N/A'}".
      Description: "${userText}".
      Write a highly reassuring, formal, and authoritative email-style auto-reply response as the Ombudsman. 
      Ensure you acknowledge the issue, state that sorting operations log records are being scanned, and outline an action plan. Keep it concise, structured, and under 90 words.`;
      
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      if (aiResponse.text) {
        smartResponse = aiResponse.text.trim();
      }
    } catch (e) {
      handleGeminiError(e);
    }
  }

  const newComplaint: Complaint = {
    id: `comp-${Date.now()}`,
    userId: userId || "user-cust-1",
    customerName: customer,
    type: cleanType,
    trackingId: trackingId || "UNKNOWN-POST-ID",
    description: userText,
    status: "pending",
    aiResponse: smartResponse,
    createdAt: new Date().toISOString()
  };

  complaints.unshift(newComplaint);

  notifications.unshift({
    id: `not-${Date.now()}`,
    userId: newComplaint.userId,
    title: "Grievance Record Registered",
    message: `Grievance registered for ${newComplaint.trackingId}. AI Assistant Auto-respond feedback has been compiled.`,
    type: "info",
    read: false,
    createdAt: new Date().toISOString()
  });

  res.json({
    success: true,
    complaint: newComplaint
  });
});

app.post("/api/complaints/resolve", (req, res) => {
  const { complaintId } = req.body;
  const comp = complaints.find(c => c.id === complaintId);
  if (comp) {
    comp.status = "resolved";
    res.json({ success: true, complaint: comp });
  } else {
    res.status(404).json({ error: "Complaint not found" });
  }
});


// -------------------------------------------------------------
// AI SPAM & FRAUD DETECTION ENDPOINT
// Uses structural scoring logic or server-side Gemini prompt
// -------------------------------------------------------------
app.get("/api/spam/reports", (req, res) => {
  res.json(spamReports);
});

app.post("/api/spam/detect", async (req, res) => {
  const { messageText, source } = req.body;
  
  if (!messageText) {
    return res.status(400).json({ error: "Message text is required" });
  }

  const cleanSource = source || "Unknown Caller";
  
  // Default fallback rules
  let riskScore = 15;
  let classification: "safe" | "suspicious" | "fraud" = "safe";
  let recommendations = [
    "No suspicious indicators found. Always confirm that tracking numbers align with official receipts.",
    "Be careful sharing your screen or identity credentials during offline doorstep deliveries."
  ];

  const lowerText = messageText.toLowerCase();
  if (lowerText.includes("link") || lowerText.includes("http") || lowerText.includes("pay") || lowerText.includes("rupees") || lowerText.includes("₹") || lowerText.includes("delay")) {
    riskScore = 70;
    classification = "suspicious";
    recommendations = [
      "Alert: The text requests an action via an unofficial link. Official Indian Post tracking links only direct to indiapost.gov.in domain spaces.",
      "Advice: Verify the package via your official dashboard under the tracking module before clicking.",
      "Security TIP: Do not enter bank/UPI passwords on external redirection portals."
    ];
  }
  if (lowerText.includes("suspended") || lowerText.includes("incorrect address") || lowerText.includes("blocked") || lowerText.includes("immediate payment")) {
    riskScore = 94;
    classification = "fraud";
    recommendations = [
      "CRITICAL FRAUD ALERT: Highly aggressive phish tactic flagged. IndiaPost never blocks packages or demands quick address update fees via SMS.",
      "Protocol: Block this phone source number immediately on your mobile carrier tier.",
      "Filing: Register this digital fraud sample to cybercrime.gov.in."
    ];
  }

  // Attempt to enrich with Gemini
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Analyze this incoming SMS/text message for post-office related fraud phishing. 
      Message: "${messageText}"
      Respond in STRICT parsing-ready JSON format with exactly:
      {
        "riskScore": (integer between 0 and 100),
        "classification": ("safe", "suspicious", or "fraud"),
        "recommendations": [array of 3 highly actionable, safety-focused advice strings]
      }
      Do not return any markdown tags or backticks, return ONLY valid json text.`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (aiResponse.text) {
        const result = JSON.parse(aiResponse.text.trim());
        riskScore = result.riskScore !== undefined ? result.riskScore : riskScore;
        classification = result.classification || classification;
        recommendations = result.recommendations || recommendations;
      }
    } catch (e) {
      handleGeminiError(e);
    }
  }

  const newReport: SpamReport = {
    id: `spam-${Date.now()}`,
    userId: "user-cust-1",
    source: cleanSource,
    messageText,
    riskScore,
    classification,
    recommendations,
    createdAt: new Date().toISOString()
  };

  spamReports.unshift(newReport);

  res.json({
    success: true,
    report: newReport
  });
});


// -------------------------------------------------------------
// AI ADDRESS VALIDATION ENDPOINT
// Checks pincodes, spelling, and formats addresses cleanly
// -------------------------------------------------------------
app.post("/api/address/validate", async (req, res) => {
  const { originalAddress } = req.body;
  if (!originalAddress) {
    return res.status(400).json({ error: "Address text is required" });
  }

  let isValid = true;
  let suggestion = originalAddress;
  let errors: string[] = [];

  let detectedPincode = "";
  let pincodeLocationName = "";
  let confidence = "Low";
  let alternativePincodes: string[] = [];

  const lowerAddress = originalAddress.toLowerCase();
  
  // Rule based fallback checks
  if (!/\d{6}/.test(originalAddress)) {
    isValid = false;
    errors.push("Missing or invalid 6-digit Indian PIN Code.");
    // Guess a placeholder pin code from popular cities
    if (lowerAddress.includes("bengaluru") || lowerAddress.includes("bangalore")) {
      suggestion += ", PIN Code: 560001 (Assumed Bangalore GPO Pin)";
      detectedPincode = "560001";
      pincodeLocationName = "Bengaluru GPO";
    } else if (lowerAddress.includes("delhi")) {
      suggestion += ", PIN Code: 110001 (Assumed GPO Delhi Pin)";
      detectedPincode = "110001";
      pincodeLocationName = "New Delhi GPO";
    }
  }

  if (lowerAddress.split(/[\s,]+/).length < 4) {
    isValid = false;
    errors.push("Address is too short. Specify sector, locality, street, and state details.");
  }

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `Analyze this Indian postal address or location. Detect and suggest the exact, most hyper-local 6-digit Indian PIN Code matching this specific location.
      If the user entered an incorrect/mismatched PIN Code compared to the local area/street, flag it, explain the discrepancy, and set isValid to false.
      
      Address/Location: "${originalAddress}"
      
      Respond in STRICT parsing-ready JSON with these exact fields:
      {
        "isValid": (boolean, true if address has correct PIN code matching the locality/street, false if wrong/missing/imprecise PIN),
        "detectedPincode": "string (the exact audited 6-digit PIN code of that location/street, or 'Not Found')",
        "pincodeLocationName": "string (sub-post office area/locality name, e.g. Indiranagar SO)",
        "confidence": "string (High | Medium | Low depending on location precision provided)",
        "errors": ["array of text strings explaining pin errors, mismatched pincodes, spelling typos"],
        "suggestion": "string (re-constructed, capitalized standard Indian postal address with correct 6-digit PIN code)",
        "alternativePincodes": ["array of string alternative pincodes for adjacent or overlapping postal blocks if any"]
      }
      Do not return any markdown formatting outside valid JSON.`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (aiResponse.text) {
        const parsing = JSON.parse(aiResponse.text.trim());
        isValid = parsing.isValid === undefined ? isValid : parsing.isValid;
        suggestion = parsing.suggestion || suggestion;
        errors = parsing.errors || errors;
        detectedPincode = parsing.detectedPincode || detectedPincode;
        pincodeLocationName = parsing.pincodeLocationName || pincodeLocationName;
        confidence = parsing.confidence || confidence;
        alternativePincodes = parsing.alternativePincodes || alternativePincodes;
      }
    } catch (e) {
      handleGeminiError(e);
    }
  }

  res.json({
    isValid,
    suggestion,
    errors,
    detectedPincode,
    pincodeLocationName,
    confidence,
    alternativePincodes
  });
});


// -------------------------------------------------------------
// CHATBOT AI (AURA - ADVANCED VIRTUAL RECEPTIONIST)
// Uses Google GenAI, supporting query routing (booking, tracking, maps)
// -------------------------------------------------------------
app.get("/api/chatbot/history", (req, res) => {
  res.json({
    history: [
      { id: "chat1", sender: "ai", text: "Namaskara! I am Aura, your Intelligent IndiaPost Digital Receptionist. Ask me anything about Speed Post booking, real-time queues, tracking, nearby offices, or calculate delivery times.", timestamp: new Date().toISOString() }
    ]
  });
});

app.post("/api/chatbot/message", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Query is required" });
  }

  const userQuery = message.toLowerCase();
  let aiText = "I am listening to your query. Our system is standing by to serve your request.";
  let suggestions: string[] = [
    "Track a parcel",
    "Book Speed Post digital token",
    "Calculate postage fees",
    "Test address for error"
  ];
  let groundingLinks: { text: string; url: string }[] = [];

  // Parse if user queries about existing structures
  if (userQuery.includes("track") || userQuery.includes("post-")) {
    const trackedId = userQuery.match(/post-\d+-in/i);
    if (trackedId) {
      const matched = parcels.find(p => p.trackingId.toUpperCase() === trackedId[0].toUpperCase());
      if (matched) {
        aiText = `🔍 **Tracking Found: ${matched.trackingId}** \n\nOur system registers this SPEED POST parcel dispatched to *${matched.destination}*. Current status is **${matched.status.toUpperCase()}**. Estimated safe delivery predictions target *${matched.deliveryPredictionDate}*.`;
        suggestions = ["Show timeline steps", "Calculate postage for similar weights", "Report a delayed delivery"];
        return res.json({ id: `ai-${Date.now()}`, sender: "ai", text: aiText, suggestions, timestamp: new Date().toISOString() });
      }
    }
  }

  // Postal cost calculator trigger
  if (userQuery.includes("cost") || userQuery.includes("calculate") || userQuery.includes("price") || userQuery.includes("charges")) {
    aiText = `⚖️ **Postal Fee Matrix Guidelines**:\n\nOur system computes speed post items according to destination range: \n- Under 50g: ₹35 onwards\n- From 50g to 200g: ~₹55\n- Over 500g: ~₹95 base rate. \n\nYou can utilize our specialized **Postal Cost Calculator** module in the sidebar to get AI-enabled custom quotes.`;
    suggestions = ["Open Cost Calculator", "Book appointment token"];
    return res.json({ id: `ai-${Date.now()}`, sender: "ai", text: aiText, suggestions, timestamp: new Date().toISOString() });
  }

  // Token booking instructions
  if (userQuery.includes("book") || userQuery.includes("appointment") || userQuery.includes("token") || userQuery.includes("queue")) {
    const totalWaiting = tokens.filter(t => t.status === "waiting").length;
    aiText = `🎫 **Digital Online Token Booking**:\n\nAvoid physical lines! We currently have **${totalWaiting} citizens waiting** in the virtual lobby. Book a slotted token under Speed Post, Aadhaar, or Parcel Booking to reserve your instant spot.\n\nWould you like me to guide you to the **Book Token** section?`;
    suggestions = ["Book Speed Post TokenNow", "Go to Live Queue Dashboard"];
    return res.json({ id: `ai-${Date.now()}`, sender: "ai", text: aiText, suggestions, timestamp: new Date().toISOString() });
  }

  // Try calling Gemini
  const ai = getGeminiClient();
  if (ai) {
    try {
      // Build a short relevant context
      const context = `You are "Aura", the state-of-the-art AI postal operations concierge assistant at building entrance kiosks.
      You support: online slotted token reservations, real-time cargo parcel tracking, security anti-phishing, digital lockers, and multi-lingual services.
      Current timezone: May 2026.
      
      User is asking: "${message}"
      
      Respond professionally, warmthly, with high-clarity structure. Do not speak about internals or mock labels. Integrate local regional context such as Bengaluru offices where appropriate. Limit responses to 120 words.
      `;

      // Call Gemini 3.5-flash
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: context
      });

      if (aiResponse.text) {
        aiText = aiResponse.text.trim();
        
        // Populate links if grounding was triggered or custom maps
        const metadata = aiResponse.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
          groundingLinks = metadata.groundingChunks
            .filter((chunk: any) => chunk.web || chunk.maps)
            .map((chunk: any) => {
              if (chunk.maps) {
                return { text: chunk.maps.title || "Maps Location", url: chunk.maps.uri };
              }
              return { text: chunk.web.title || "Web Link", url: chunk.web.uri };
            });
        }
      }
    } catch (e) {
      handleGeminiError(e);
      aiText = "Namaskara, I experienced a network transition. I can confirm you have 3 active options on your portal dashboard: Book highly automated token appointments, inspect real-time track timelines, or run instant fraud verification scans.";
    }
  } else {
    // Elegant system assistant responses
    aiText = `Namaskara! I am your IndiaPost AI agent Aura. I can support your services digitally today to ensure you avoid waiting in long post office queues. 

Current statistics:
- **Lobby Status**: Normal, average speed post wait is 12 mins.
- **Track Status**: 3 tracking samples are preloaded in tracking log database.
- **Languages**: English, Kannada (ಕನ್ನಡ), Hindi (हिन्दी), and Telugu (తెలుగు) can be triggered.

Tell me if you wish to track our sample code **POST-7721-IN**!`;
  }

  res.json({
    id: `ai-${Date.now()}`,
    sender: "ai",
    text: aiText,
    suggestions,
    groundingLinks,
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// NOTIFICATIONS SYSTEM ENDPOINTS
// -------------------------------------------------------------
app.get("/api/notifications", (req, res) => {
  res.json(notifications);
});

app.post("/api/notifications/mark-read", (req, res) => {
  const { id } = req.body;
  const item = notifications.find(n => n.id === id);
  if (item) {
    item.read = true;
  }
  res.json({ success: true });
});

app.post("/api/notifications/clear-all", (req, res) => {
  notifications = [];
  res.json({ success: true });
});

// -------------------------------------------------------------
// LOGIN ACTIVITIES TRACKING ENDPOINTS
// -------------------------------------------------------------
app.get("/api/login-activities", (req, res) => {
  res.json(loginActivities);
});

app.post("/api/login-activities", (req, res) => {
  const { email, role, type, status, ipAddress, userAgent } = req.body;
  const newActivity: LoginActivity = {
    id: `act-${Date.now()}`,
    email: email || "unknown@post.gov",
    role: role || "customer",
    timestamp: new Date().toISOString(),
    ipAddress: ipAddress || req.ip || "127.0.0.1",
    userAgent: userAgent || req.header("user-agent") || "Web Browser Session",
    status: status || "success",
    type: type || "customer_portal"
  };
  loginActivities.unshift(newActivity);
  res.json({ success: true, activity: newActivity });
});

// -------------------------------------------------------------
// STATIC AND VITE SERVER MIDDLEWARE CONFIGURATION
// Handles dev VS production pipelines seamlessly
// -------------------------------------------------------------
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware registered successfully.");
  } else {
    // In production, serve bundled static files
    const distPath = path.join(process.cwd(), "dist");
    
    // Ensure dir exists to prevent startup failures
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static distribution pipeline configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Virtual Post Assistant backend operational on http://0.0.0.0:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Severe startup error registering Express pipeline: ", err);
});
