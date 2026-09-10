/**
 * API Service Client for JALDRISHTI MongoDB Atlas Backend.
 * Handles authenticated API calls for accounts, profile locations, and community feedback.
 */

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://jaldrishti-backend.onrender.com/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jaldrishti_auth_token');
};

export const setAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('jaldrishti_auth_token', token);
    localStorage.setItem('jaldrishti_auth_session', 'true');
    localStorage.setItem('jaldrishti_onboarding_status', 'true');
  } else {
    localStorage.removeItem('jaldrishti_auth_token');
    localStorage.removeItem('jaldrishti_auth_session');
  }
};

const authHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Authentication
  register: async (email: string, pass: string, name?: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Registration failed');
    }
    if (data.token) setAuthToken(data.token);
    return data;
  },

  login: async (email: string, pass: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Invalid email or password.');
    }
    if (data.token) setAuthToken(data.token);
    return data;
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: authHeaders(),
      });
    } catch (e) {
      // Best effort
    }
    setAuthToken(null);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },

  // Profile Preferences
  updateHome: async (home: any) => {
    const res = await fetch(`${API_BASE_URL}/profile/home`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(home),
    });
    return res.json();
  },

  updateWork: async (work: any) => {
    const res = await fetch(`${API_BASE_URL}/profile/work`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(work),
    });
    return res.json();
  },

  updateNotifications: async (settings: any) => {
    const res = await fetch(`${API_BASE_URL}/profile/notifications`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Community Feedback
  getAllFeedbacks: async () => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.communityFeedbacks || {};
  },

  createFeedback: async (spotId: string, text: string, photoUrl?: string | null) => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ spotId, text, photoUrl }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Unable to save feedback right now.');
    }
    return res.json();
  },

  deleteFeedback: async (feedbackId: string) => {
    const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Unable to delete feedback right now.');
    }
    return res.json();
  },

  addReply: async (feedbackId: string, text: string) => {
    const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/replies`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Unable to post reply right now.');
    }
    return res.json();
  },

  deleteReply: async (feedbackId: string, replyId: string) => {
    const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/replies/${replyId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Unable to delete reply right now.');
    }
    return res.json();
  },

  toggleFeedbackReaction: async (feedbackId: string, reactionType: 'LIKE' | 'DISLIKE') => {
    const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/reaction`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ reactionType }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Unable to toggle reaction right now.');
    }
    return res.json();
  },

  toggleReplyReaction: async (feedbackId: string, replyId: string, reactionType: 'LIKE' | 'DISLIKE') => {
    const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/replies/${replyId}/reaction`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ reactionType }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Unable to toggle reply reaction right now.');
    }
    return res.json();
  },

  // GIS Digital Twin & Navigation APIs
  getWaterloggingPrediction: async (lat: number, lon: number, name?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/prediction/waterlogging?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name || '')}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  getHomeStatus: async (lat: number, lon: number, locality?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/home/status?lat=${lat}&lon=${lon}&locality=${encodeURIComponent(locality || '')}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  searchGeocoding: async (q: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/home/geocode/search?q=${encodeURIComponent(q)}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  getHotspots: async (timestep?: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/navigation/hotspots?timestep=${timestep || 0}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  getWeatherStations: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/home/weather`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  getMunicipalAlerts: async (timestep?: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/navigation/alerts?timestep=${timestep || 0}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  getCriticalInfrastructure: async (timestep?: any, mode?: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/navigation/infrastructure?timestep=${timestep || 0}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  getCityDecisionSupport: async (timestep?: any, mode?: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/agent/decision-support?timestep=${timestep || 0}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  getDataHealthFeeds: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/health`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  getCatchmentSummary: async (timestep?: any, mode?: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/navigation/catchment-summary?timestep=${timestep || 0}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  getHistoricalReplayEvents: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/navigation/replay-events`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  getModelHealthTelemetry: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/telemetry`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  getPredictionProvenance: async (predId?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/prediction/provenance/${predId || ''}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  evaluateRoutesDetailed: async (origin: any, destination: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  calculateSafeRoute: async (req: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  getValidationLabData: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system/validation-lab`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  getLocationExplanation: async (selectedLocationId?: string, mode?: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/explainability/location/${selectedLocationId || 'road_102'}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },
};

export const JaldrishtiApi = api;
export default api;
