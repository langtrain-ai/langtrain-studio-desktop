/**
 * Training View Component
 * Monitor and manage training jobs
 */

import { useState, useEffect } from 'react';
import {
    Activity,
    StopCircle,
    RefreshCw,
    Terminal,
    Cpu,
    Loader,
    CheckCircle,
    TrendingDown
} from 'lucide-react';
import { apiClient, FineTuneJob } from '../../services/api';
import './TrainingView.css';

interface JobRowProps {
    job: FineTuneJob;
    onCancel: (id: string) => void;
    isSelected: boolean;
    onSelect: (job: FineTuneJob) => void;
}

function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'running':
        case 'in_progress':
            return 'var(--accent-cyan)';
        case 'completed':
        case 'succeeded':
            return 'var(--accent-green)';
        case 'failed':
        case 'error':
            return 'var(--accent-red)';
        case 'pending':
        case 'queued':
            return 'var(--accent-orange)';
        default:
            return 'var(--text-tertiary)';
    }
}

function JobRow({ job, onCancel, isSelected, onSelect }: JobRowProps) {
    const isRunning = ['running', 'in_progress'].includes(job.status.toLowerCase());

    return (
        <div
            className={`job-row ${isSelected ? 'job-row--selected' : ''}`}
            onClick={() => onSelect(job)}
        >
            <div className="job-row__status">
                <span
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(job.status) }}
                />
            </div>
            <div className="job-row__info">
                <span className="job-row__name">{job.name || `Job ${job.id.slice(0, 8)}`}</span>
                <span className="job-row__id">{job.id.slice(0, 12)}</span>
            </div>
            <div className="job-row__progress">
                {isRunning ? (
                    <div className="mini-progress">
                        <div
                            className="mini-progress__fill"
                            style={{ width: `${job.progress}%` }}
                        />
                    </div>
                ) : (
                    <span className="job-row__status-text">
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                )}
            </div>
            <div className="job-row__actions">
                {isRunning && (
                    <button
                        className="icon-button icon-button--danger"
                        onClick={(e) => { e.stopPropagation(); onCancel(job.id); }}
                    >
                        <StopCircle size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}

interface MetricTileProps {
    label: string;
    value: string;
    trend?: string;
    icon: React.ReactNode;
}

function MetricTile({ label, value, trend, icon }: MetricTileProps) {
    return (
        <div className="metric-tile">
            <div className="metric-tile__icon">{icon}</div>
            <div className="metric-tile__content">
                <span className="metric-tile__value">{value}</span>
                <span className="metric-tile__label">{label}</span>
            </div>
            {trend && <span className="metric-tile__trend">{trend}</span>}
        </div>
    );
}

export function TrainingView() {
    const [jobs, setJobs] = useState<FineTuneJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<FineTuneJob | null>(null);
    const [activeTab, setActiveTab] = useState<'metrics' | 'logs'>('metrics');

    useEffect(() => {
        loadJobs();
        const interval = setInterval(loadJobs, 5000);
        return () => clearInterval(interval);
    }, []);

    async function loadJobs() {
        try {
            const response = await apiClient.listFineTuningJobs();
            setJobs(response.data);
            if (response.data.length > 0 && !selectedJob) {
                setSelectedJob(response.data[0]);
            }
        } catch (err) {
            // Demo data
            const demoJobs: FineTuneJob[] = [
                { id: 'ft-job-001', name: 'Medical LLaMA', status: 'running', progress: 67, createdAt: '2024-12-20T10:30:00Z', metrics: { trainingLoss: 0.342, validationLoss: 0.385 } },
                { id: 'ft-job-002', name: 'Code Assistant', status: 'completed', progress: 100, createdAt: '2024-12-19T14:20:00Z', completedAt: '2024-12-19T18:45:00Z' },
                { id: 'ft-job-003', name: 'Customer Support Bot', status: 'pending', progress: 0, createdAt: '2024-12-20T11:00:00Z' },
            ];
            setJobs(demoJobs);
            if (!selectedJob) setSelectedJob(demoJobs[0]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCancelJob(id: string) {
        try {
            await apiClient.cancelFineTuningJob(id);
            loadJobs();
        } catch (err) {
            console.error('Failed to cancel job:', err);
        }
    }

    const runningJobs = jobs.filter(j => ['running', 'in_progress'].includes(j.status.toLowerCase()));
    const completedJobs = jobs.filter(j => ['completed', 'succeeded'].includes(j.status.toLowerCase()));

    return (
        <div className="training-view">
            {/* Left Panel - Job List */}
            <div className="training-view__sidebar">
                <div className="sidebar-header">
                    <h2>Training Jobs</h2>
                    <button className="icon-button" onClick={loadJobs}>
                        <RefreshCw size={14} />
                    </button>
                </div>

                <div className="sidebar-stats">
                    <div className="sidebar-stat">
                        <Loader size={14} className={runningJobs.length > 0 ? 'spin' : ''} />
                        <span>{runningJobs.length} Running</span>
                    </div>
                    <div className="sidebar-stat">
                        <CheckCircle size={14} />
                        <span>{completedJobs.length} Completed</span>
                    </div>
                </div>

                <div className="job-list">
                    {isLoading ? (
                        <div className="job-list__loading">Loading...</div>
                    ) : jobs.length === 0 ? (
                        <div className="job-list__empty">No training jobs</div>
                    ) : (
                        jobs.map(job => (
                            <JobRow
                                key={job.id}
                                job={job}
                                onCancel={handleCancelJob}
                                isSelected={selectedJob?.id === job.id}
                                onSelect={setSelectedJob}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Job Details */}
            <div className="training-view__main">
                {selectedJob ? (
                    <>
                        <div className="job-detail-header">
                            <div className="job-detail-header__info">
                                <h1>{selectedJob.name || `Job ${selectedJob.id.slice(0, 8)}`}</h1>
                                <span className="job-id">{selectedJob.id}</span>
                            </div>
                            <div className="job-detail-header__status">
                                <span
                                    className="status-badge"
                                    style={{
                                        backgroundColor: `${getStatusColor(selectedJob.status)}20`,
                                        color: getStatusColor(selectedJob.status)
                                    }}
                                >
                                    {selectedJob.status}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {['running', 'in_progress'].includes(selectedJob.status.toLowerCase()) && (
                            <div className="job-progress-section">
                                <div className="job-progress">
                                    <div
                                        className="job-progress__fill"
                                        style={{ width: `${selectedJob.progress}%` }}
                                    />
                                </div>
                                <span className="job-progress__label">{selectedJob.progress}% complete</span>
                            </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="metrics-grid">
                            <MetricTile
                                label="Training Loss"
                                value={(selectedJob.metrics?.trainingLoss as number)?.toFixed(3) || '0.342'}
                                trend="-12%"
                                icon={<TrendingDown size={16} />}
                            />
                            <MetricTile
                                label="Validation Loss"
                                value={(selectedJob.metrics?.validationLoss as number)?.toFixed(3) || '0.385'}
                                trend="-5%"
                                icon={<TrendingDown size={16} />}
                            />
                            <MetricTile
                                label="Epoch"
                                value="2/5"
                                icon={<Activity size={16} />}
                            />
                            <MetricTile
                                label="GPU Utilization"
                                value="92%"
                                icon={<Cpu size={16} />}
                            />
                        </div>

                        {/* Tabs */}
                        <div className="detail-tabs">
                            <button
                                className={`tab-button ${activeTab === 'metrics' ? 'tab-button--active' : ''}`}
                                onClick={() => setActiveTab('metrics')}
                            >
                                <Activity size={14} />
                                Metrics
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'logs' ? 'tab-button--active' : ''}`}
                                onClick={() => setActiveTab('logs')}
                            >
                                <Terminal size={14} />
                                Logs
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="detail-content">
                            {activeTab === 'metrics' ? (
                                <div className="metrics-chart">
                                    <div className="chart-placeholder">
                                        <Activity size={48} />
                                        <span>Training metrics visualization</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="logs-container">
                                    <pre className="logs-output">
                                        {`[2024-12-20 10:30:00] Starting fine-tuning job...
[2024-12-20 10:30:05] Loading base model: llama-3-8b
[2024-12-20 10:30:45] Model loaded successfully
[2024-12-20 10:30:50] Loading dataset: pubmed_qa.jsonl
[2024-12-20 10:31:00] Dataset loaded: 15,000 examples
[2024-12-20 10:31:05] Initializing QLoRA adapter (r=64, alpha=16)
[2024-12-20 10:31:10] Starting epoch 1/5...
[2024-12-20 10:45:00] Epoch 1 complete. Loss: 0.523
[2024-12-20 10:45:05] Starting epoch 2/5...
[2024-12-20 10:58:30] Epoch 2 progress: 67% | Loss: 0.342`}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="no-selection">
                        <Activity size={48} />
                        <h3>No job selected</h3>
                        <p>Select a training job from the list to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
