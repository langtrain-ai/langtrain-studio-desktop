/**
 * Curation View Component
 * Data curation and pruning with visual analysis
 */

import { useState } from 'react';
import {
    Sparkles,
    Scissors,
    BarChart3,
    Database,
    RefreshCw,
    Loader,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';
import './CurationView.css';

interface RowProfile {
    index: number;
    loss: number;
    text_length: number;
    tokens: number;
}

interface DatasetStats {
    mean_loss: number;
    min_loss: number;
    max_loss: number;
    trivial_count: number;
    easy_count: number;
    medium_count: number;
    hard_count: number;
    noise_count: number;
}

interface DatasetProfile {
    source_file: string;
    total_rows: number;
    stats: DatasetStats;
    profiles: RowProfile[];
}

// Loss histogram component
function LossHistogram({ profiles, minThreshold, maxThreshold }: {
    profiles: RowProfile[];
    minThreshold: number;
    maxThreshold: number;
}) {
    // Create bins for the histogram
    const bins = Array(10).fill(0);

    profiles.forEach(p => {
        const binIndex = Math.min(9, Math.floor(p.loss));
        bins[binIndex]++;
    });

    const maxCount = Math.max(...bins, 1);

    return (
        <div className="loss-histogram">
            <div className="histogram-chart">
                {bins.map((count, idx) => {
                    const isInRange = idx >= minThreshold && idx < maxThreshold;
                    return (
                        <div key={idx} className="histogram-bar-container">
                            <div
                                className={`histogram-bar ${isInRange ? 'histogram-bar--selected' : ''}`}
                                style={{ height: `${(count / maxCount) * 100}%` }}
                            >
                                <span className="histogram-bar__count">{count}</span>
                            </div>
                            <span className="histogram-bar__label">{idx}</span>
                        </div>
                    );
                })}
            </div>
            <div className="histogram-legend">
                <span className="legend-item legend-item--trivial">Trivial</span>
                <span className="legend-item legend-item--optimal">Optimal</span>
                <span className="legend-item legend-item--noise">Noise</span>
            </div>
        </div>
    );
}

// Stats card component
function StatCard({ label, value, icon, variant = 'default' }: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
    return (
        <div className={`curation-stat-card curation-stat-card--${variant}`}>
            <div className="curation-stat-card__icon">{icon}</div>
            <div className="curation-stat-card__content">
                <span className="curation-stat-card__value">{value}</span>
                <span className="curation-stat-card__label">{label}</span>
            </div>
        </div>
    );
}

export function CurationView() {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [profile, setProfile] = useState<DatasetProfile | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPruning, setIsPruning] = useState(false);

    // Threshold controls
    const [minLoss, setMinLoss] = useState(1.0);
    const [maxLoss, setMaxLoss] = useState(5.0);

    // Mock function to simulate scout pass
    async function handleAnalyze() {
        if (!selectedFile) return;

        setIsAnalyzing(true);

        // Simulate API call delay
        await new Promise(r => setTimeout(r, 2000));

        // Mock profile data
        const mockProfiles: RowProfile[] = Array.from({ length: 500 }, (_, i) => ({
            index: i,
            loss: Math.random() * 8 + 0.5,
            text_length: Math.floor(Math.random() * 1000) + 50,
            tokens: Math.floor(Math.random() * 200) + 10
        }));

        const mockStats: DatasetStats = {
            mean_loss: 3.2,
            min_loss: 0.5,
            max_loss: 8.5,
            trivial_count: mockProfiles.filter(p => p.loss < 1).length,
            easy_count: mockProfiles.filter(p => p.loss >= 1 && p.loss < 2.5).length,
            medium_count: mockProfiles.filter(p => p.loss >= 2.5 && p.loss < 4.5).length,
            hard_count: mockProfiles.filter(p => p.loss >= 4.5 && p.loss < 7).length,
            noise_count: mockProfiles.filter(p => p.loss >= 7).length
        };

        setProfile({
            source_file: selectedFile,
            total_rows: 500,
            stats: mockStats,
            profiles: mockProfiles
        });

        setIsAnalyzing(false);
    }

    async function handlePrune() {
        if (!profile) return;

        setIsPruning(true);
        await new Promise(r => setTimeout(r, 1500));

        // In real implementation, call backend API
        console.log(`Pruning with thresholds [${minLoss}, ${maxLoss}]`);

        setIsPruning(false);
    }

    // Calculate how many rows would be kept with current thresholds
    const keptCount = profile
        ? profile.profiles.filter(p => p.loss >= minLoss && p.loss <= maxLoss).length
        : 0;
    const keepPercentage = profile ? ((keptCount / profile.total_rows) * 100).toFixed(1) : 0;

    return (
        <div className="curation-view">
            {/* Header */}
            <div className="curation-view__header">
                <div className="curation-view__title-section">
                    <h1 className="curation-view__title">
                        <Sparkles size={24} />
                        Data Curation
                    </h1>
                    <p className="curation-view__subtitle">
                        Intelligently prune your training data for optimal results
                    </p>
                </div>
            </div>

            {/* File Selection */}
            <div className="curation-view__upload-zone">
                <Database size={32} />
                <span>Select a dataset from your uploads</span>
                <select
                    value={selectedFile || ''}
                    onChange={(e) => setSelectedFile(e.target.value)}
                    className="curation-select"
                >
                    <option value="">-- Choose Dataset --</option>
                    <option value="training_data.jsonl">training_data.jsonl</option>
                    <option value="customer_support.jsonl">customer_support.jsonl</option>
                    <option value="code_examples.jsonl">code_examples.jsonl</option>
                </select>
                <button
                    className="button button--primary"
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isAnalyzing}
                >
                    {isAnalyzing ? <Loader size={16} className="spin" /> : <BarChart3 size={16} />}
                    {isAnalyzing ? 'Analyzing...' : 'Run Scout Pass'}
                </button>
            </div>

            {/* Analysis Results */}
            {profile && (
                <>
                    {/* Stats Grid */}
                    <div className="curation-view__stats">
                        <StatCard
                            label="Total Rows"
                            value={profile.total_rows}
                            icon={<Database size={20} />}
                        />
                        <StatCard
                            label="Mean Loss"
                            value={profile.stats.mean_loss.toFixed(2)}
                            icon={<BarChart3 size={20} />}
                        />
                        <StatCard
                            label="Optimal (Keep)"
                            value={profile.stats.medium_count}
                            icon={<CheckCircle size={20} />}
                            variant="success"
                        />
                        <StatCard
                            label="Noise (Skip)"
                            value={profile.stats.noise_count + profile.stats.trivial_count}
                            icon={<AlertTriangle size={20} />}
                            variant="warning"
                        />
                    </div>

                    {/* Histogram */}
                    <div className="curation-view__chart-section">
                        <h3>Loss Distribution</h3>
                        <LossHistogram
                            profiles={profile.profiles}
                            minThreshold={minLoss}
                            maxThreshold={maxLoss}
                        />
                    </div>

                    {/* Threshold Controls */}
                    <div className="curation-view__controls">
                        <h3>Pruning Thresholds</h3>
                        <div className="threshold-controls">
                            <div className="threshold-slider">
                                <label>Min Loss (skip trivial)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    value={minLoss}
                                    onChange={(e) => setMinLoss(parseFloat(e.target.value))}
                                />
                                <span>{minLoss.toFixed(1)}</span>
                            </div>
                            <div className="threshold-slider">
                                <label>Max Loss (skip noise)</label>
                                <input
                                    type="range"
                                    min="3"
                                    max="10"
                                    step="0.5"
                                    value={maxLoss}
                                    onChange={(e) => setMaxLoss(parseFloat(e.target.value))}
                                />
                                <span>{maxLoss.toFixed(1)}</span>
                            </div>
                        </div>

                        <div className="pruning-preview">
                            <span className="pruning-preview__text">
                                Keeping <strong>{keptCount}</strong> of {profile.total_rows} rows ({keepPercentage}%)
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="curation-view__actions">
                        <button
                            className="button button--secondary"
                            onClick={handleAnalyze}
                        >
                            <RefreshCw size={16} />
                            Re-analyze
                        </button>
                        <button
                            className="button button--primary"
                            onClick={handlePrune}
                            disabled={isPruning}
                        >
                            {isPruning ? <Loader size={16} className="spin" /> : <Scissors size={16} />}
                            {isPruning ? 'Pruning...' : 'Export Curated Dataset'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
