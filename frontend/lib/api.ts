// API Client for Auto-Standard Backend
import axios, { AxiosInstance } from 'axios';

// API Base URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for LLM inference
});

// Types matching backend schemas
export interface QueryRequest {
  question: string;
  user_id?: number;
  top_k?: number;
  filters?: {
    release?: string;
    domain?: string;
    spec_type?: string;
  };
}

export interface Source {
  text: string;
  metadata: {
    spec_id: string;
    release: string;
    domains: string[];
    filename?: string;
  };
  score: number;
}

export interface QueryResponse {
  answer: string;
  question: string;
  sources: Source[];
  query_id?: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  vector_store_count: number;
  model_loaded: boolean;
}

export interface MetricsResponse {
  total_queries: number;
  total_users: number;
  total_documents: number;
  avg_rating?: number;
  recent_queries: Array<{
    id: number;
    question: string;
    created_at: string;
  }>;
}

export interface IngestRequest {
  pdf_path: string;
}

export interface IngestResponse {
  success: boolean;
  filename: string;
  spec_id: string;
  release: string;
  total_chunks: number;
  message: string;
}

// Query API
export const queryAPI = {
  /**
   * Submit a query to the RAG system
   */
  submitQuery: async (data: QueryRequest): Promise<QueryResponse> => {
    const response = await apiClient.post<QueryResponse>('/query/', data);
    return response.data;
  },

  /**
   * Get system health status
   */
  getHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  /**
   * Get system metrics
   */
  getMetrics: async (): Promise<MetricsResponse> => {
    const response = await apiClient.get<MetricsResponse>('/admin/metrics');
    return response.data;
  },

  /**
   * Ingest a new document
   */
  ingestDocument: async (pdfPath: string): Promise<IngestResponse> => {
    const response = await apiClient.post<IngestResponse>('/admin/ingest', {
      pdf_path: pdfPath,
    });
    return response.data;
  },
};

export interface DocNode {
  id: string;
  name: string;
  type: 'org' | 'release' | 'spec';
  children?: DocNode[];
  metadata?: {
    release?: string;
    lastIndexed?: string;
    domains?: string[];
    total_chunks?: number;
  };
}

export const documentsAPI = {
  getTree: async (): Promise<DocNode[]> => {
    const response = await apiClient.get('/documents/tree');
    return response.data;
  },
  getMetadata: async (specId: string) => {
    const response = await apiClient.get(`/documents/spec/${specId}/metadata`);
    return response.data;
  },
  getContent: async (specId: string) => {
    const response = await apiClient.get(`/documents/spec/${specId}/content`);
    return response.data;
  }
};

export const personalizationAPI = {
  getDashboard: async (userId: number) => {
    const response = await apiClient.get(`/personalization/dashboard/${userId}`);
    return response.data;
  }
};

export interface AttributionData {
  source: string;
  contribution: number;
}

export interface RetrievalFactor {
  factor: string;
  value: number;
  color: string;
}

export interface RecentQuery {
  id: number;
  text: string;
}

export interface ExplainabilityDashboardResponse {
  answerAttribution: AttributionData[];
  retrievalFactors: RetrievalFactor[];
  recentQueries: RecentQuery[];
}

export const explainabilityAPI = {
  getDashboard: async (): Promise<ExplainabilityDashboardResponse> => {
    const response = await apiClient.get<ExplainabilityDashboardResponse>('/explainability/dashboard');
    return response.data;
  },
  getAttribution: async (queryId: number) => {
    const response = await apiClient.get(`/explainability/attribution/${queryId}`);
    return response.data;
  }
};

export const evaluationAPI = {
  getRuns: async () => {
    const response = await apiClient.get('/evaluation/runs');
    return response.data;
  },
  getFailures: async () => {
    const response = await apiClient.get('/evaluation/failures');
    return response.data;
  }
};

// Error handling helper
export const handleAPIError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      return error.response.data?.detail || error.response.statusText;
    } else if (error.request) {
      // Request made but no response
      return 'No response from server. Please check if the backend is running.';
    }
  }
  return error.message || 'An unexpected error occurred';
};

export default apiClient;
