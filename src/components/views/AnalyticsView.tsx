/**
 * Analytics View Component
 * View training metrics and insights
 */

import { useState } from 'react';
import {
    BarChart3,
    TrendingDown,
    Clock,
    Zap,
    Target,
    Activity,
    PieChart,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import './AnalyticsView.css';

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType = 'neutral', icon }: StatCardProps) {
    return (
        <div className="analytics-stat-card">
            <div className="analytics-stat-card__icon">{icon}</div>
            <div className="analytics-stat-card__content">
                <span className="analytics-stat-card__title">{title}</span>
                <span className="analytics-stat-card__value">{value}</span>
                {change && (
                    <span className={`analytics-stat-card__change analytics-stat-card__change--${changeType}`}>
                        {changeType === 'positive' ? <ArrowUpRight size={12} /> :
                            changeType === 'negative' ? <ArrowDownRight size={12} /> : null}
                        {change}
                    </span>
                )}
            </div>
        </div>
    );
}

function BarChartViz() {
    const data = [65, 78, 52, 88, 92, 75, 85, 68, 95, 82, 70, 88];
    const maxValue = Math.max(...data);

    return (
        <div className="bar-chart">
            {data.map((value, index) => (
                <div key={index} className="bar-chart__column">
                    <div
                        className="bar-chart__bar"
                        style={{ height: `${(value / maxValue) * 100}%` }}
                    />
                    <span className="bar-chart__label">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                    </span>
                </div>
            ))}
        </div>
    );
}

function LineChartViz() {
    const points = [
        { x: 0, y: 80 },
        { x: 1, y: 65 },
        { x: 2, y: 72 },
        { x: 3, y: 58 },
        { x: 4, y: 45 },
        { x: 5, y: 52 },
        { x: 6, y: 38 },
        { x: 7, y: 42 },
        { x: 8, y: 35 },
        { x: 9, y: 28 },
    ];

    const width = 400;
    const height = 150;
    const padding = 20;

    const xScale = (x: number) => (x / 9) * (width - padding * 2) + padding;
    const yScale = (y: number) => height - padding - (y / 100) * (height - padding * 2);

    const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`)
        .join(' ');

    return (
        <svg className="line-chart" viewBox={`0 0 ${width} ${height}`}>
            <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="100%" stopColor="var(--accent-blue)" />
                </linearGradient>
            </defs>
            <path
                d={pathData}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {points.map((p, i) => (
                <circle
                    key={i}
                    cx={xScale(p.x)}
                    cy={yScale(p.y)}
                    r="4"
                    fill="var(--bg-primary)"
                    stroke="var(--accent-cyan)"
                    strokeWidth="2"
                />
            ))}
        </svg>
    );
}

function DonutChart() {
    const data = [
        { label: 'Completed', value: 65, color: 'var(--accent-green)' },
        { label: 'Running', value: 20, color: 'var(--accent-cyan)' },
        { label: 'Failed', value: 10, color: 'var(--accent-red)' },
        { label: 'Pending', value: 5, color: 'var(--accent-orange)' },
    ];

    const total = data.reduce((acc, d) => acc + d.value, 0);
    let currentAngle = -90;

    return (
        <div className="donut-chart-container">
            <svg className="donut-chart" viewBox="0 0 100 100">
                {data.map((item, index) => {
                    const angle = (item.value / total) * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;

                    const x1 = 50 + 35 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 50 + 35 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 50 + 35 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                    const y2 = 50 + 35 * Math.sin(((startAngle + angle) * Math.PI) / 180);

                    const largeArcFlag = angle > 180 ? 1 : 0;

                    return (
                        <path
                            key={index}
                            d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                            fill={item.color}
                        />
                    );
                })}
                <circle cx="50" cy="50" r="22" fill="var(--bg-card)" />
            </svg>
            <div className="donut-chart__legend">
                {data.map((item, index) => (
                    <div key={index} className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: item.color }} />
                        <span className="legend-label">{item.label}</span>
                        <span className="legend-value">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AnalyticsView() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    return (
        <div className="analytics-view">
            {/* Header */}
            <div className="analytics-view__header">
                <div className="analytics-view__title-section">
                    <h1 className="analytics-view__title">Analytics</h1>
                    <p className="analytics-view__subtitle">View training metrics and insights</p>
                </div>
                <div className="analytics-view__actions">
                    <div className="time-range-selector">
                        <button
                            className={timeRange === '7d' ? 'active' : ''}
                            onClick={() => setTimeRange('7d')}
                        >
                            7 days
                        </button>
                        <button
                            className={timeRange === '30d' ? 'active' : ''}
                            onClick={() => setTimeRange('30d')}
                        >
                            30 days
                        </button>
                        <button
                            className={timeRange === '90d' ? 'active' : ''}
                            onClick={() => setTimeRange('90d')}
                        >
                            90 days
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="analytics-view__stats">
                <StatCard
                    title="Total Jobs"
                    value="127"
                    change="+18%"
                    changeType="positive"
                    icon={<Activity size={20} />}
                />
                <StatCard
                    title="Success Rate"
                    value="94.2%"
                    change="+2.5%"
                    changeType="positive"
                    icon={<Target size={20} />}
                />
                <StatCard
                    title="Avg. Training Time"
                    value="2h 34m"
                    change="-12%"
                    changeType="positive"
                    icon={<Clock size={20} />}
                />
                <StatCard
                    title="GPU Hours Used"
                    value="847"
                    change="+23%"
                    changeType="neutral"
                    icon={<Zap size={20} />}
                />
            </div>

            {/* Charts Row */}
            <div className="analytics-view__charts">
                {/* Training Jobs Chart */}
                <div className="chart-card chart-card--wide">
                    <div className="chart-card__header">
                        <div className="chart-card__title">
                            <BarChart3 size={16} />
                            <span>Training Jobs by Month</span>
                        </div>
                        <span className="chart-card__subtitle">Jobs started per month</span>
                    </div>
                    <div className="chart-card__content">
                        <BarChartViz />
                    </div>
                </div>

                {/* Job Status Distribution */}
                <div className="chart-card">
                    <div className="chart-card__header">
                        <div className="chart-card__title">
                            <PieChart size={16} />
                            <span>Job Status</span>
                        </div>
                        <span className="chart-card__subtitle">Distribution by status</span>
                    </div>
                    <div className="chart-card__content">
                        <DonutChart />
                    </div>
                </div>
            </div>

            {/* Loss Curve */}
            <div className="analytics-view__bottom">
                <div className="chart-card chart-card--full">
                    <div className="chart-card__header">
                        <div className="chart-card__title">
                            <TrendingDown size={16} />
                            <span>Average Training Loss</span>
                        </div>
                        <span className="chart-card__subtitle">Across all completed jobs</span>
                    </div>
                    <div className="chart-card__content">
                        <LineChartViz />
                    </div>
                </div>
            </div>
        </div>
    );
}
