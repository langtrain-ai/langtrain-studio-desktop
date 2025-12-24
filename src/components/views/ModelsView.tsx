/**
 * Models View Component
 * Browse and download base models for fine-tuning
 */

import { useState, useEffect } from 'react';
import {
    Box,
    Download,
    Search,
    Filter,
    ExternalLink,
    Cpu,
    Layers,
    Zap,
    CheckCircle,
    Clock
} from 'lucide-react';
import { apiClient, ModelInfo } from '../../services/api';
import './ModelsView.css';

function formatParams(params?: number): string {
    if (!params) return 'N/A';
    if (params >= 1e9) return `${(params / 1e9).toFixed(1)}B`;
    if (params >= 1e6) return `${(params / 1e6).toFixed(0)}M`;
    return params.toString();
}

function formatSize(bytes?: number): string {
    if (!bytes) return 'N/A';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
}

interface ModelCardProps {
    model: ModelInfo;
    onDownload: (id: string) => void;
}

function ModelCard({ model, onDownload }: ModelCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    async function handleDownload() {
        setIsDownloading(true);
        await onDownload(model.id);
        setIsDownloading(false);
    }

    return (
        <div className="model-card">
            <div className="model-card__header">
                <div className="model-card__icon">
                    <Box size={24} />
                </div>
                <div className="model-card__badges">
                    {model.supportsFinetuning && (
                        <span className="badge badge--success">
                            <Zap size={10} />
                            Fine-tune Ready
                        </span>
                    )}
                </div>
            </div>

            <div className="model-card__body">
                <h3 className="model-card__name">{model.name}</h3>
                <p className="model-card__description">
                    {model.description || 'A powerful language model for fine-tuning.'}
                </p>

                <div className="model-card__specs">
                    <div className="spec-item">
                        <Cpu size={14} />
                        <span className="spec-label">Parameters</span>
                        <span className="spec-value">{formatParams(model.parameters)}</span>
                    </div>
                    <div className="spec-item">
                        <Layers size={14} />
                        <span className="spec-label">Context</span>
                        <span className="spec-value">{model.contextLength?.toLocaleString() || '4096'}</span>
                    </div>
                    <div className="spec-item">
                        <Download size={14} />
                        <span className="spec-label">Size</span>
                        <span className="spec-value">{formatSize(model.sizeBytes)}</span>
                    </div>
                </div>
            </div>

            <div className="model-card__footer">
                <button className="button button--secondary">
                    <ExternalLink size={14} />
                    Details
                </button>
                <button
                    className="button button--primary"
                    onClick={handleDownload}
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <Clock size={14} className="spin" />
                            Downloading...
                        </>
                    ) : (
                        <>
                            <Download size={14} />
                            Download
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export function ModelsView() {
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFinetune, setFilterFinetune] = useState(false);

    useEffect(() => {
        loadModels();
    }, []);

    async function loadModels() {
        try {
            setIsLoading(true);
            const response = await apiClient.listModels();
            setModels(response.data);
        } catch (err) {
            console.error('Failed to load models:', err);
            setModels([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDownload(id: string) {
        console.log('Download model:', id);
        // Simulate download
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const filteredModels = models.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFilter = !filterFinetune || m.supportsFinetuning;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="models-view">
            {/* Header */}
            <div className="models-view__header">
                <div className="models-view__title-section">
                    <h1 className="models-view__title">Models</h1>
                    <p className="models-view__subtitle">Browse and download base models for fine-tuning</p>
                </div>
            </div>

            {/* Stats */}
            <div className="models-view__stats">
                <div className="stat-pill">
                    <CheckCircle size={14} />
                    <span>{models.filter(m => m.supportsFinetuning).length} Fine-tune Ready</span>
                </div>
                <div className="stat-pill">
                    <Box size={14} />
                    <span>{models.length} Total Models</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="models-view__toolbar">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    className={`filter-button ${filterFinetune ? 'filter-button--active' : ''}`}
                    onClick={() => setFilterFinetune(!filterFinetune)}
                >
                    <Filter size={16} />
                    Fine-tune Ready
                </button>
            </div>

            {/* Model Grid */}
            <div className="models-view__content">
                {isLoading ? (
                    <div className="models-view__loading">Loading models...</div>
                ) : filteredModels.length === 0 ? (
                    <div className="models-view__empty">
                        <Box size={48} className="empty-icon" />
                        <h3>No models found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="models-view__grid">
                        {filteredModels.map(model => (
                            <ModelCard
                                key={model.id}
                                model={model}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
