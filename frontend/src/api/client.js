/**
 * MockMate AI - API Client
 * Centralized fetch helper handling base URL, JSON headers, FormData uploads, and JWT Bearer authorization.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('mockmate_token');

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  // Only set Content-Type to JSON if body is NOT FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (data && typeof data === 'object' && (data.detail || data.message)) ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  signup: (payload) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    request('/auth/me', {
      method: 'GET',
    }),

  getHealth: () =>
    request('/health', {
      method: 'GET',
    }),
};

export const interviewsApi = {
  startInterview: (payload) =>
    request('/interviews/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getInterview: (interviewId) =>
    request(`/interviews/${interviewId}`, {
      method: 'GET',
    }),

  getInterviewReport: (interviewId) =>
    request(`/interviews/${interviewId}/report`, {
      method: 'GET',
    }),

  getInterviewHistory: () =>
    request('/interviews/history', {
      method: 'GET',
    }),
};

export const answersApi = {
  uploadAnswer: (interviewId, questionId, audioBlob, bodyLanguageMetrics = {}) => {
    const formData = new FormData();
    formData.append('interview_id', interviewId.toString());
    formData.append('question_id', questionId.toString());
    formData.append('file', audioBlob, `answer_int${interviewId}_q${questionId}.webm`);

    if (bodyLanguageMetrics.eye_contact_pct !== undefined) {
      formData.append('eye_contact_pct', bodyLanguageMetrics.eye_contact_pct.toString());
    }
    if (bodyLanguageMetrics.head_tilt_pct !== undefined) {
      formData.append('head_tilt_pct', bodyLanguageMetrics.head_tilt_pct.toString());
    }
    if (bodyLanguageMetrics.smile_pct !== undefined) {
      formData.append('smile_pct', bodyLanguageMetrics.smile_pct.toString());
    }
    if (bodyLanguageMetrics.face_visible_pct !== undefined) {
      formData.append('face_visible_pct', bodyLanguageMetrics.face_visible_pct.toString());
    }

    return request('/answers/upload', {
      method: 'POST',
      body: formData,
    });
  },
};

