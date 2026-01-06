import { Layers, Activity, Zap, Beaker } from 'lucide-react';
import './ConfigurationWidget.css';


export interface TrainingConfig {
    learningRate: number;
    epochs: number;
    batchSize: number;
    useMixedPrecision: boolean;
    loraRank: number;
    loraAlpha: number;
}

interface ConfigurationWidgetProps {
    config: TrainingConfig;
    setConfig: (config: TrainingConfig) => void;
    onConfirm: () => void;
}

export function ConfigurationWidget({ config, setConfig, onConfirm }: ConfigurationWidgetProps) {
    const handleChange = (key: keyof TrainingConfig, value: any) => {
        setConfig({ ...config, [key]: value });
    };

    return (
        <div className="config-widget">
            <div className="config-widget__header">
                <div className="config-widget__title">
                    <Beaker size={16} className="text-accent-cyan" />
                    <span>Hyperparameter Tuning</span>
                </div>
                <span className="config-widget__subtitle">Advanced</span>
            </div>

            <div className="config-widget__content">

                {/* LoRA Settings */}
                <div className="config-section">
                    <div className="config-section__label">
                        <Layers size={14} /> Adapter Config
                    </div>
                    <div className="config-grid">
                        <div className="config-field">
                            <label>LoRA Rank (r)</label>
                            <input
                                type="number"
                                className="config-input"
                                value={config.loraRank}
                                onChange={(e) => handleChange("loraRank", parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="config-field">
                            <label>LoRA Alpha</label>
                            <input
                                type="number"
                                className="config-input"
                                value={config.loraAlpha}
                                onChange={(e) => handleChange("loraAlpha", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                </div>

                {/* Training Loop */}
                <div className="config-section">
                    <div className="config-section__label">
                        <Activity size={14} /> Training Loop
                    </div>

                    <div className="config-slider-container">
                        <div className="config-slider-header">
                            <label>Learning Rate</label>
                            <span className="config-value">{config.learningRate}</span>
                        </div>
                        <input
                            type="range"
                            className="config-slider"
                            min="1"
                            max="50"
                            value={config.learningRate * 100000}
                            onChange={(e) => handleChange("learningRate", parseInt(e.target.value) / 100000)}
                        />
                    </div>

                    <div className="config-grid">
                        <div className="config-field">
                            <label>Epochs</label>
                            <input
                                type="number"
                                className="config-input"
                                value={config.epochs}
                                onChange={(e) => handleChange("epochs", parseInt(e.target.value) || 1)}
                            />
                        </div>
                        <div className="config-field">
                            <label>Batch Size</label>
                            <input
                                type="number"
                                className="config-input"
                                value={config.batchSize}
                                onChange={(e) => handleChange("batchSize", parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                </div>

                {/* Optimization */}
                <div className="config-switch">
                    <div className="switch-label">
                        <Zap size={16} style={{ color: 'var(--accent-purple)' }} />
                        <div>
                            <div className="switch-text">Mixed Precision (FP16)</div>
                            <span className="switch-subtext">Faster training, less memory</span>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        className="switch-input"
                        checked={config.useMixedPrecision}
                        onChange={(e) => handleChange("useMixedPrecision", e.target.checked)}
                    />
                </div>

                <div className="config-actions">
                    <button className="btn-apply" onClick={onConfirm}>
                        Apply Configuration
                    </button>
                </div>

            </div>
        </div>
    );
}

export const defaultConfig: TrainingConfig = {
    learningRate: 2e-4,
    epochs: 3,
    batchSize: 4,
    useMixedPrecision: true,
    loraRank: 16,
    loraAlpha: 32
};
