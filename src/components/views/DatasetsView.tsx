/**
 * Datasets View Component
 * Displays and manages training datasets
 */

import { useState, useEffect } from 'react';
import {
    Database,
    Upload,
    Trash2,
    FileText,
    HardDrive,
    Calendar,
    MoreVertical,
    Search,
    Filter,
    Download,
    Eye
} from 'lucide-react';
import { apiClient, DatasetInfo } from '../../services/api';
import './DatasetsView.css';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function getPurposeLabel(purpose: string): string {
    return purpose.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

interface DatasetRowProps {
    dataset: DatasetInfo;
    onDelete: (id: string) => void;
}

function DatasetRow({ dataset, onDelete }: DatasetRowProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="dataset-row">
            <div className="dataset-row__icon">
                <FileText size={18} />
            </div>
            <div className="dataset-row__info">
                <span className="dataset-row__name">{dataset.filename}</span>
                <span className="dataset-row__id">{dataset.id.slice(0, 12)}</span>
            </div>
            <div className="dataset-row__purpose">
                <span className="purpose-badge">{getPurposeLabel(dataset.purpose)}</span>
            </div>
            <div className="dataset-row__size">
                <HardDrive size={12} />
                <span>{formatBytes(dataset.bytes)}</span>
            </div>
            <div className="dataset-row__date">
                <Calendar size={12} />
                <span>{formatDate(dataset.createdAt)}</span>
            </div>
            <div className="dataset-row__actions">
                <button
                    className="icon-button"
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <MoreVertical size={16} />
                </button>
                {showMenu && (
                    <div className="dataset-row__dropdown">
                        <button>
                            <Eye size={14} />
                            Preview
                        </button>
                        <button>
                            <Download size={14} />
                            Download
                        </button>
                        <button className="danger" onClick={() => { onDelete(dataset.id); setShowMenu(false); }}>
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function DatasetsView() {
    const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        loadDatasets();
    }, []);

    async function loadDatasets() {
        try {
            setIsLoading(true);
            const response = await apiClient.listDatasets('default');
            setDatasets(response.data);
        } catch (err) {
            console.error('Failed to load datasets:', err instanceof Error ? err.message : 'Unknown error');
            setDatasets([]);
        } finally {
            setIsLoading(false);
        }
    }

    function handleDelete(id: string) {
        console.log('Delete dataset:', id);
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave() {
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        console.log('Dropped files:', files);
    }

    const filteredDatasets = datasets.filter(d =>
        d.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalSize = datasets.reduce((acc, d) => acc + d.bytes, 0);

    return (
        <div className="datasets-view">
            {/* Header */}
            <div className="datasets-view__header">
                <div className="datasets-view__title-section">
                    <h1 className="datasets-view__title">Datasets</h1>
                    <p className="datasets-view__subtitle">Upload and manage training datasets</p>
                </div>
                <button className="button button--primary">
                    <Upload size={16} />
                    Upload Dataset
                </button>
            </div>

            {/* Stats */}
            <div className="datasets-view__stats">
                <div className="stat-card">
                    <Database size={20} className="stat-card__icon" />
                    <div className="stat-card__content">
                        <span className="stat-card__value">{datasets.length}</span>
                        <span className="stat-card__label">Datasets</span>
                    </div>
                </div>
                <div className="stat-card">
                    <HardDrive size={20} className="stat-card__icon" />
                    <div className="stat-card__content">
                        <span className="stat-card__value">{formatBytes(totalSize)}</span>
                        <span className="stat-card__label">Total Size</span>
                    </div>
                </div>
            </div>

            {/* Upload Zone */}
            <div
                className={`datasets-view__upload-zone ${isDragging ? 'datasets-view__upload-zone--active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Upload size={32} className="upload-icon" />
                <span className="upload-text">Drag and drop files here, or click to browse</span>
                <span className="upload-hint">Supports JSONL, CSV, and Parquet files</span>
            </div>

            {/* Search & Filter */}
            <div className="datasets-view__toolbar">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search datasets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="icon-button">
                    <Filter size={16} />
                </button>
            </div>

            {/* Dataset List */}
            <div className="datasets-view__content">
                {isLoading ? (
                    <div className="datasets-view__loading">Loading datasets...</div>
                ) : filteredDatasets.length === 0 ? (
                    <div className="datasets-view__empty">
                        <Database size={48} className="empty-icon" />
                        <h3>No datasets found</h3>
                        <p>Upload your first dataset to get started</p>
                    </div>
                ) : (
                    <div className="datasets-view__table">
                        <div className="datasets-view__table-header">
                            <span>Name</span>
                            <span>Purpose</span>
                            <span>Size</span>
                            <span>Created</span>
                            <span></span>
                        </div>
                        {filteredDatasets.map(dataset => (
                            <DatasetRow
                                key={dataset.id}
                                dataset={dataset}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
