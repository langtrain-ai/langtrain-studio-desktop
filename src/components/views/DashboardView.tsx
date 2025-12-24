/**
 * Dashboard View Component
 * Ported from Swift MonitoringView.swift
 */

import { useState, useEffect } from 'react';
import { Server } from 'lucide-react';
import './DashboardView.css';

interface MetricCardProps {
    title: string;
    value: string;
    change: string;
    changeLabel: string;
    isPositive?: boolean;
}

function MetricCard({ title, value, change, changeLabel, isPositive = true }: MetricCardProps) {
    return (
        <div className="metric-card">
            <span className="metric-card__title">{title}</span>
            <span className="metric-card__value">{value}</span>
            <div className="metric-card__footer">
                <span className={`metric-card__change ${isPositive ? 'metric-card__change--positive' : 'metric-card__change--negative'}`}>
                    {change}
                </span>
                <span className="metric-card__label">{changeLabel}</span>
            </div>
        </div>
    );
}

interface GaugeItemProps {
    value: number;
    label: string;
    valueText: string;
    color: string;
}

function GaugeItem({ value, label, valueText, color }: GaugeItemProps) {
    const circumference = 2 * Math.PI * 26;
    const offset = circumference - (value * circumference);

    return (
        <div className="gauge-item">
            <div className="gauge-item__ring">
                <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle
                        cx="30"
                        cy="30"
                        r="26"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                    />
                    <circle
                        cx="30"
                        cy="30"
                        r="26"
                        fill="none"
                        stroke={color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform="rotate(-90 30 30)"
                    />
                </svg>
                <div className="gauge-item__value">
                    <span className="gauge-item__number">{valueText.split(' ')[0]}</span>
                    <span className="gauge-item__unit">{valueText.split(' ')[1] || ''}</span>
                </div>
            </div>
            <span className="gauge-item__label">{label}</span>
        </div>
    );
}

interface InfoGridItemProps {
    label: string;
    value: string;
    icon: React.ReactNode;
}

function InfoGridItem({ label, value, icon }: InfoGridItemProps) {
    return (
        <div className="info-grid-item">
            <span className="info-grid-item__label">{label}</span>
            <div className="info-grid-item__value">
                {icon}
                <span>{value}</span>
            </div>
        </div>
    );
}

export function DashboardView() {
    const [trainingLoss, setTrainingLoss] = useState(0.342);
    const [validationLoss, setValidationLoss] = useState(0.385);

    // Simulate changing values
    useEffect(() => {
        const interval = setInterval(() => {
            setTrainingLoss(prev => Math.max(0.1, prev + (Math.random() - 0.55) * 0.01));
            setValidationLoss(prev => Math.max(0.15, prev + (Math.random() - 0.52) * 0.01));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard__header">
                <div className="dashboard__breadcrumb">
                    <span className="dashboard__breadcrumb-item">Dashboard</span>
                    <span className="dashboard__breadcrumb-sep">/</span>
                    <span className="dashboard__breadcrumb-current">Monitoring</span>
                </div>

                <div className="dashboard__status">
                    <span className="dashboard__status-dot" />
                    <span className="dashboard__status-text">System Healthy</span>
                </div>
            </div>

            {/* Content */}
            <div className="dashboard__content">
                {/* Run Info Card */}
                <div className="run-info-card">
                    <div className="run-info-card__header">
                        <div className="run-info-card__title-section">
                            <h2 className="run-info-card__title">Medical LLaMA Fine-Tuning</h2>
                            <span className="run-info-card__subtitle">Run ID: #ft-29384 • Started 2h 15m ago</span>
                        </div>
                        <div className="run-info-card__actions">
                            <button className="button button--secondary">View Logs</button>
                            <button className="button button--primary">Stop Run</button>
                        </div>
                    </div>

                    <div className="run-info-card__grid">
                        <InfoGridItem
                            label="Base Model"
                            value="Llama-3-8b"
                            icon={<span className="info-icon">◢</span>}
                        />
                        <InfoGridItem
                            label="Dataset"
                            value="PubMed-QA"
                            icon={<span className="info-icon">◎</span>}
                        />
                        <InfoGridItem
                            label="Method"
                            value="QLoRA r=64, alpha=16"
                            icon={<span className="info-icon">⬢</span>}
                        />
                        <InfoGridItem
                            label="Status"
                            value="Training"
                            icon={<span className="info-icon info-icon--active">●</span>}
                        />
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="dashboard__metrics">
                    <MetricCard
                        title="TRAINING LOSS"
                        value={trainingLoss.toFixed(3)}
                        change="-12%"
                        changeLabel="Epoch 2/5"
                        isPositive={true}
                    />
                    <MetricCard
                        title="VALIDATION LOSS"
                        value={validationLoss.toFixed(3)}
                        change="-5%"
                        changeLabel="Best: 0.310"
                        isPositive={true}
                    />
                    <MetricCard
                        title="THROUGHPUT"
                        value="4.2k"
                        change="+8%"
                        changeLabel="tokens/sec"
                        isPositive={true}
                    />
                </div>

                {/* Bottom Row */}
                <div className="dashboard__bottom">
                    {/* Loss Curve Chart */}
                    <div className="loss-curve-card">
                        <div className="loss-curve-card__header">
                            <span className="loss-curve-card__title">Loss Curve</span>
                            <div className="loss-curve-card__legend">
                                <span className="legend-item">
                                    <span className="legend-dot legend-dot--white" />
                                    Train
                                </span>
                                <span className="legend-item">
                                    <span className="legend-dot legend-dot--blue" />
                                    Val
                                </span>
                            </div>
                        </div>
                        <div className="loss-curve-card__chart">
                            {/* Simple bar visualization */}
                            {Array.from({ length: 20 }, (_, i) => (
                                <div
                                    key={i}
                                    className="loss-bar"
                                    style={{
                                        height: `${Math.max(20, 100 - i * 4 + Math.random() * 10)}%`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Hardware Stats */}
                    <div className="hardware-card">
                        <div className="hardware-card__header">
                            <Server size={14} className="hardware-card__icon" />
                            <span className="hardware-card__title">Hardware</span>
                        </div>
                        <div className="hardware-card__grid">
                            <GaugeItem value={0.92} label="GPU UTIL" valueText="92%" color="white" />
                            <GaugeItem value={0.75} label="VRAM" valueText="18 GB" color="#A855F7" />
                            <GaugeItem value={0.45} label="RAM" valueText="45 GB" color="#3B82F6" />
                            <GaugeItem value={0.34} label="TEMP" valueText="34 °C" color="#22C55E" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
