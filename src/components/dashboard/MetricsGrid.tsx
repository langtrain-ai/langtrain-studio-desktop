import { useEffect, useState } from 'react';
// import { Card } from '@/components/ui/card';
import { Activity, Server, Clock, BarChart3 } from 'lucide-react';

interface MetricsData {
    uptime_seconds: number;
    requests: {
        total: number;
        avg_latency_ms: number;
    };
    training: {
        jobs_completed: number;
        success_rate: number;
    };
    inference: {
        requests: number;
    };
}

const MetricsGrid = () => {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);

    useEffect(() => {
        // In desktop app, we might need a configurable base URL. 
        // For now assuming localhost:8000 or the same network interface.
        const fetchMetrics = async () => {
            try {
                const res = await fetch('http://localhost:8000/metrics');
                if (res.ok) {
                    const data = await res.json();
                    setMetrics(data);
                }
            } catch (e) {
                console.error("Failed to fetch metrics", e);
            }
        }
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        return `${hrs}h`;
    };

    const cards = [
        { title: 'Requests', val: metrics?.requests.total.toLocaleString() ?? '-', icon: Activity },
        { title: 'Latency', val: metrics ? `${metrics.requests.avg_latency_ms}ms` : '-', icon: Clock },
        { title: 'Training', val: metrics?.training.jobs_completed.toLocaleString() ?? '-', icon: BarChart3 },
        { title: 'Uptime', val: metrics ? formatUptime(metrics.uptime_seconds) : '-', icon: Server },
    ];

    return (
        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {cards.map((c, i) => (
                <div key={i} className="metric-card" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>{c.title}</span>
                        <c.icon size={16} color="var(--accent-primary, #646cff)" />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{c.val}</div>
                </div>
            ))}
        </div>
    );
};

export default MetricsGrid;
