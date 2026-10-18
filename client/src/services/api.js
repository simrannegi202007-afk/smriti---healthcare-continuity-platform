// Centralized API client for Smriti frontend

const BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('smriti_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {}
    const err = new Error(errorData.error || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.data = errorData;
    throw err;
  }

  return response.json();
}

export const api = {
  // Auth & Profile
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  updateSettings: (data) => request('/auth/settings', { method: 'PUT', body: JSON.stringify(data) }),
  updateProfile: (profile) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  deleteMyData: () => request('/auth/delete-all-data', { method: 'DELETE' }),

  // Records & Timeline
  getRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/records?${query}`);
  },
  getRecordById: (id) => request(`/records/${id}`),
  getProtectedFileBlobUrl: async (recordId, shareToken = null) => {
    const token = localStorage.getItem('smriti_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const url = shareToken ? `/api/records/${recordId}/file?token=${shareToken}` : `/api/records/${recordId}/file`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      let msg = `Protected file error: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.error) msg = errJson.error;
      } catch (e) {}
      throw new Error(msg);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
  checkDuplicate: (data) => request('/records/check-duplicate', { method: 'POST', body: JSON.stringify(data) }),
  uploadRecord: (formData) => request('/records/upload', { method: 'POST', body: formData }),
  deleteRecord: (id) => request(`/records/${id}`, { method: 'DELETE' }),
  getTrends: (testName) => request(`/records/trends?testName=${encodeURIComponent(testName || 'HbA1c')}`),

  // AI Simplifier, Voice & Chat
  extractReportValues: (recordId) => request('/ai/extract', { method: 'POST', body: JSON.stringify({ recordId }) }),
  explainReport: (data) => request('/ai/explain', { method: 'POST', body: JSON.stringify(data) }),
  processVoiceCommand: (data) => request('/ai/voice-command', { method: 'POST', body: JSON.stringify(data) }),
  chatMessage: (data) => request('/ai/chat', { method: 'POST', body: JSON.stringify(data) }),

  // Doctor Sharing
  createShareLink: (data) => request('/share/create', { method: 'POST', body: JSON.stringify(data) }),
  revokeShareLink: (data) => request('/share/revoke', { method: 'POST', body: JSON.stringify(data) }),
  listActiveShares: () => request('/share/active'),
  getDoctorSummary: (token, otp) => {
    const url = otp ? `/share/doctor-summary/${token}?otp=${otp}` : `/share/doctor-summary/${token}`;
    return request(url);
  },
  addDoctorNote: (token, note, doctorName) => request(`/share/doctor-summary/${token}/note`, {
    method: 'POST',
    body: JSON.stringify({ note, doctorName })
  }),

  // Emergency Card
  getMyEmergencyCard: () => request('/emergency/my-card'),
  updateEmergencyCard: (data) => request('/emergency/my-card', { method: 'PUT', body: JSON.stringify(data) }),
  getPublicEmergencyCard: (token) => request(`/emergency/view/${token}`),

  // Medicines & Reminders
  getMedicines: () => request('/medicines'),
  addMedicine: (data) => request('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  toggleMedicine: (id) => request(`/medicines/${id}/toggle`, { method: 'PATCH' }),
  getReminders: () => request('/medicines/reminders'),
  addReminder: (data) => request('/medicines/reminders', { method: 'POST', body: JSON.stringify(data) }),
  toggleReminder: (id) => request(`/medicines/reminders/${id}/toggle`, { method: 'PATCH' }),
  deleteReminder: (id) => request(`/medicines/reminders/${id}`, { method: 'DELETE' }),

  // Access Logs
  getAccessLogs: () => request('/access-logs')
};
