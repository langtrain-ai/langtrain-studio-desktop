/**
 * Langtrain API Client
 * Ported from Swift LangtrainAPI.swift
 */

// API Configuration
export const API_CONFIG = {
    baseURL: 'https://api.langtrain.xyz',
    version: 'v1',
    webURL: 'https://www.langtrain.xyz',

    get apiURL() {
        return `${this.baseURL}/${this.version}`;
    },

    get authURL() {
        return `${this.webURL}/api/auth/user`;
    },
};

// API Error types
export class APIError extends Error {
    constructor(
        public code: string,
        message: string,
        public status?: number
    ) {
        super(message);
        this.name = 'APIError';
    }

    static invalidURL() {
        return new APIError('INVALID_URL', 'Invalid API URL');
    }

    static invalidResponse() {
        return new APIError('INVALID_RESPONSE', 'Invalid response from server');
    }

    static unauthorized() {
        return new APIError('UNAUTHORIZED', 'Please log in to continue', 401);
    }

    static forbidden() {
        return new APIError('FORBIDDEN', "You don't have permission to access this resource", 403);
    }

    static notFound() {
        return new APIError('NOT_FOUND', 'Resource not found', 404);
    }

    static rateLimited() {
        return new APIError('RATE_LIMITED', 'Too many requests, please try again later', 429);
    }

    static serverError(message: string, status: number) {
        return new APIError('SERVER_ERROR', message, status);
    }
}

// Data Types
export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
}

export interface SubscriptionInfo {
    isActive: boolean;
    plan: 'free' | 'pro' | 'enterprise';
    expiresAt?: string;
    features: string[];
}

export interface ModelInfo {
    id: string;
    name: string;
    description?: string;
    parameters?: number;
    contextLength?: number;
    supportsFinetuning?: boolean;
    downloadUrl?: string;
    sizeBytes?: number;
}

export interface ModelsResponse {
    data: ModelInfo[];
}

export interface DatasetInfo {
    id: string;
    filename: string;
    purpose: string;
    bytes: number;
    createdAt: string;
}

export interface DatasetsResponse {
    data: DatasetInfo[];
}

export interface FineTuneJob {
    id: string;
    name: string;
    status: string;
    progress: number;
    config?: Record<string, unknown>;
    metrics?: Record<string, unknown>;
    errorMessage?: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
}

export interface FineTuneJobsResponse {
    data: FineTuneJob[];
}

export interface CreateFineTuneRequest {
    datasetId: string;
    name?: string;
    baseModel: string;
    modelId?: string;
    trainingMethod?: 'sft' | 'dpo' | 'rlhf' | 'lora' | 'qlora';
    hyperparameters?: {
        nEpochs?: number;
        batchSize?: number;
        learningRate?: number;
        loraRank?: number;
        loraAlpha?: number;
        maxSeqLength?: number;
    };
    useCloud?: boolean;
}

export interface AgentInfo {
    id: string;
    name: string;
    description?: string;
    modelId?: string;
    config?: Record<string, unknown>;
    isActive?: boolean;
    createdAt?: string;
}

export interface AgentsResponse {
    data: AgentInfo[];
}

export interface HealthResponse {
    status: string;
    version: string;
}

export interface UsageResponse {
    tokens: { used: number; limit: number; percentage: number; unlimited: boolean };
    finetuneJobs: { used: number; limit: number; percentage: number; unlimited: boolean };
    agentRuns: { used: number; limit: number; percentage: number; unlimited: boolean };
    period: { start: string; end?: string; lastUpdated?: string };
    limits: Record<string, number>;
}

export interface PlanResponse {
    plan: {
        id?: string;
        name: string;
        code: string;
        billingPeriod: string;
        priceInr?: number;
    };
    limits: Record<string, number>;
    billingStatus: string;
    usageSummary: {
        tokensUsed: number;
        finetuneJobsStarted: number;
        agentRunsCount: number;
        periodStart: string;
        periodEnd?: string;
    };
}

// API Client Class
class LangtrainAPIClient {
    private static instance: LangtrainAPIClient;

    private constructor() { }

    static getInstance(): LangtrainAPIClient {
        if (!LangtrainAPIClient.instance) {
            LangtrainAPIClient.instance = new LangtrainAPIClient();
        }
        return LangtrainAPIClient.instance;
    }

    private async request<T>(
        endpoint: string,
        options: {
            method?: string;
            body?: unknown;
            requiresAuth?: boolean;
        } = {}
    ): Promise<T> {
        const { method = 'GET', body, requiresAuth = true } = options;

        const url = `${API_CONFIG.apiURL}/${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'User-Agent': 'Langtrain-Studio-Desktop/1.0',
        };

        if (requiresAuth) {
            const token = localStorage.getItem('langtrain_auth_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            switch (response.status) {
                case 401:
                    // Clear auth on unauthorized
                    localStorage.removeItem('langtrain_auth_token');
                    throw APIError.unauthorized();
                case 403:
                    throw APIError.forbidden();
                case 404:
                    throw APIError.notFound();
                case 429:
                    throw APIError.rateLimited();
                default:
                    const errorData = await response.json().catch(() => ({}));
                    throw APIError.serverError(
                        errorData.detail || `Unknown error (status: ${response.status})`,
                        response.status
                    );
            }
        }

        return response.json();
    }

    // Authentication
    async getCurrentUser(): Promise<UserProfile> {
        return this.request('auth/me');
    }

    async validateSubscription(): Promise<SubscriptionInfo> {
        return this.request('subscription/status');
    }

    // Models
    async listModels(): Promise<ModelsResponse> {
        return this.request('models', { requiresAuth: false });
    }

    async getModel(id: string): Promise<ModelInfo> {
        return this.request(`models/${id}`, { requiresAuth: false });
    }

    // Datasets
    async listDatasets(workspaceId: string): Promise<DatasetsResponse> {
        return this.request(`files?workspace_id=${workspaceId}`);
    }

    // Fine-tuning Jobs
    async createFineTuningJob(request: CreateFineTuneRequest): Promise<FineTuneJob> {
        return this.request('fine-tuning/jobs', {
            method: 'POST',
            body: request,
        });
    }

    async getFineTuningJob(id: string): Promise<FineTuneJob> {
        return this.request(`fine-tuning/jobs/${id}`);
    }

    async listFineTuningJobs(workspaceId?: string): Promise<FineTuneJobsResponse> {
        const endpoint = workspaceId
            ? `fine-tuning/jobs?workspace_id=${workspaceId}`
            : 'fine-tuning/jobs';
        return this.request(endpoint);
    }

    async cancelFineTuningJob(id: string): Promise<FineTuneJob> {
        return this.request(`fine-tuning/jobs/${id}/cancel`, { method: 'POST' });
    }

    // Agents
    async listAgents(workspaceId: string): Promise<AgentsResponse> {
        return this.request(`workspaces/${workspaceId}/agents`);
    }

    // Health Check
    async healthCheck(): Promise<HealthResponse> {
        return this.request('../health', { requiresAuth: false });
    }

    // Billing & Usage
    async getUsage(workspaceId: string): Promise<UsageResponse> {
        return this.request(`billing/usage?workspace_id=${workspaceId}`);
    }

    async getPlan(workspaceId: string): Promise<PlanResponse> {
        return this.request(`billing/plan?workspace_id=${workspaceId}`);
    }
}

export const apiClient = LangtrainAPIClient.getInstance();
