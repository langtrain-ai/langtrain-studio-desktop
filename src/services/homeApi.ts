/**
 * Home API Client for Langtrain Desktop
 * 
 * Product Experience endpoints for regular users.
 */

import { API_CONFIG, APIError } from './api';

// Types
export interface TrainingJob {
    id: string;
    name: string;
    status: string;
    progress: number;
    config?: Record<string, unknown>;
    createdAt?: string;
    startedAt?: string;
    completedAt?: string;
}

export interface Agent {
    id: string;
    name: string;
    status: string;
    config?: Record<string, unknown>;
    createdAt?: string;
}

export interface Dataset {
    id: string;
    name: string;
    rows?: number;
    createdAt?: string;
}

export interface Deployment {
    id: string;
    name: string;
    status: string;
    endpoint?: string;
    createdAt?: string;
}

export interface UsageSummary {
    periodDays: number;
    apiCalls: number;
    totalCost: number;
    startDate: string;
    endDate: string;
}

export interface UserProfile {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    subscriptionPlan?: string;
    createdAt?: string;
}

// API Client
class HomeAPIClient {
    private static instance: HomeAPIClient;
    private readonly basePath = '/home';

    private constructor() { }

    static getInstance(): HomeAPIClient {
        if (!HomeAPIClient.instance) {
            HomeAPIClient.instance = new HomeAPIClient();
        }
        return HomeAPIClient.instance;
    }

    private async request<T>(
        endpoint: string,
        options: { method?: string; body?: unknown } = {}
    ): Promise<T> {
        const { method = 'GET', body } = options;
        const url = `${API_CONFIG.apiURL}${this.basePath}/${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'User-Agent': 'Langtrain-Studio-Desktop/1.0',
        };

        const token = secureStorage.getItem('langtrain_auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            switch (response.status) {
                case 401:
                    secureStorage.removeItem('langtrain_auth_token');
                    throw APIError.unauthorized();
                case 403:
                    throw APIError.forbidden();
                case 404:
                    throw APIError.notFound();
                default:
                    const errorData = await response.json().catch(() => ({}));
                    throw APIError.serverError(
                        errorData.detail || `Error (${response.status})`,
                        response.status
                    );
            }
        }

        return response.json();
    }

    // Training
    async listTrainingJobs(params?: { limit?: number; offset?: number; status?: string }): Promise<{ data: TrainingJob[] }> {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        if (params?.status) query.set('status', params.status);
        return this.request(`training?${query.toString()}`);
    }

    async getTrainingJob(jobId: string): Promise<TrainingJob> {
        return this.request(`training/${jobId}`);
    }

    // Agents
    async listAgents(params?: { limit?: number; offset?: number }): Promise<{ data: Agent[] }> {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        return this.request(`agents?${query.toString()}`);
    }

    async getAgent(agentId: string): Promise<Agent> {
        return this.request(`agents/${agentId}`);
    }

    // Datasets
    async listDatasets(params?: { limit?: number; offset?: number }): Promise<{ data: Dataset[] }> {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        return this.request(`datasets?${query.toString()}`);
    }

    async getDataset(datasetId: string): Promise<Dataset> {
        return this.request(`datasets/${datasetId}`);
    }

    async getDatasetProfile(datasetId: string): Promise<any> {
        return this.request(`files/${datasetId}/profile`);
    }

    // Deployments
    async listDeployments(params?: { limit?: number; offset?: number }): Promise<{ data: Deployment[] }> {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        return this.request(`deployments?${query.toString()}`);
    }

    async getDeployment(deploymentId: string): Promise<Deployment> {
        return this.request(`deployments/${deploymentId}`);
    }

    // Usage
    async getUsageSummary(days: number = 30): Promise<UsageSummary> {
        return this.request(`usage?days=${days}`);
    }

    async getTransactions(limit: number = 20): Promise<{ data: Array<{ id: string; amount: number; status: string; createdAt?: string }> }> {
        return this.request(`usage/transactions?limit=${limit}`);
    }

    // Settings
    async getProfile(): Promise<UserProfile> {
        return this.request('settings/profile');
    }

    async updateProfile(data: { fullName?: string; avatarUrl?: string }): Promise<{ success: boolean }> {
        return this.request('settings/profile', { method: 'PATCH', body: data });
    }
}

export const homeApi = HomeAPIClient.getInstance();
