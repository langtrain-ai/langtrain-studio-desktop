/**
 * Superadmin API Client for Langtrain Desktop
 * 
 * Platform Control Plane endpoints for superadmins.
 * Note: Desktop app typically won't use these, but included for completeness.
 */

import { API_CONFIG, APIError } from './api';

// Types
export interface User {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    role: string;
    subscriptionPlan?: string;
    isActive: boolean;
    createdAt?: string;
}

export interface UsersResponse {
    users: User[];
    stats: { total: number; admins: number; users: number; suspended: number };
    total: number;
    limit: number;
    offset: number;
}

export interface SystemStats {
    timestamp: string;
    users: { total: number; active: number; newThisWeek: number };
    workspaces: { total: number };
    models: { total: number };
    jobs: { total: number; active: number };
    revenue: { mtd: number; formatted: string };
}

export interface SuperadminJob {
    id: string;
    name: string;
    status: string;
    progress: number;
    createdAt?: string;
    workspaceId?: string;
}

export interface AuditLog {
    type: string;
    message: string;
    timestamp?: string;
    resourceId: string;
}

// API Client
class SuperadminAPIClient {
    private static instance: SuperadminAPIClient;
    private readonly basePath = '/superadmin';

    private constructor() { }

    static getInstance(): SuperadminAPIClient {
        if (!SuperadminAPIClient.instance) {
            SuperadminAPIClient.instance = new SuperadminAPIClient();
        }
        return SuperadminAPIClient.instance;
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

        const token = localStorage.getItem('langtrain_auth_token');
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
                    localStorage.removeItem('langtrain_auth_token');
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

    // Users
    async listUsers(params?: { limit?: number; offset?: number; search?: string }): Promise<UsersResponse> {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        if (params?.search) query.set('search', params.search);
        return this.request(`users?${query.toString()}`);
    }

    async getUser(userId: string): Promise<User> {
        return this.request(`users/${userId}`);
    }

    async updateUser(userId: string, data: { subscriptionPlan?: string; role?: string }): Promise<{ success: boolean }> {
        return this.request(`users/${userId}`, { method: 'PATCH', body: data });
    }

    async deleteUser(userId: string): Promise<{ success: boolean }> {
        return this.request(`users/${userId}`, { method: 'DELETE' });
    }

    // Analytics
    async getStats(): Promise<SystemStats> {
        return this.request('analytics/stats');
    }

    // Jobs
    async listAllJobs(params?: { limit?: number; offset?: number; status?: string }): Promise<{ data: SuperadminJob[] }> {
        const query = new URLSearchParams();
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        if (params?.status) query.set('status', params.status);
        return this.request(`jobs?${query.toString()}`);
    }

    async cancelJob(jobId: string): Promise<{ success: boolean }> {
        return this.request(`jobs/${jobId}/cancel`, { method: 'POST' });
    }

    // Config
    async getSystemConfig(): Promise<{ appName: string; version: string; debug: boolean }> {
        return this.request('config');
    }

    // Audit
    async getAuditLogs(limit: number = 50): Promise<{ logs: AuditLog[] }> {
        return this.request(`audit/logs?limit=${limit}`);
    }
}

export const superadminApi = SuperadminAPIClient.getInstance();
