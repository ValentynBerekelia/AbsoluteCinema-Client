import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/api/statistics';
import { DashboardStatsResponse } from '@/types/statistics';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { useToast } from '@/context/ToastContext/ToastContext';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error('Failed to load stats:', err);
                showToast('error', 'Could not load statistics data');
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [showToast]);

    if (loading) return <div className={styles.loading}>Loading analytics...</div>;
    if (!stats) return <div className={styles.error}>No data available to display.</div>;

    const COLORS = ['#E50914', '#2196F3', '#4CAF50', '#FFBB28', '#AF19FF'];

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>📊 Statistics & Analytics</h1>
            </header>

            <div className={styles.chartsGrid}>
                {/* 1. TOP MOVIES */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>🔥 Top Movies by Sales</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.topMovies}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis dataKey="movieName" stroke="var(--muted)" tick={{fontSize: 11}} />
                            <YAxis stroke="var(--muted)" tick={{fontSize: 11}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#060c22', border: '1px solid rgba(200, 220, 255, 0.2)' }}
                                itemStyle={{ color: 'var(--text)' }}
                            />
                            <Bar dataKey="ticketsSold" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. HALL OCCUPANCY */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>🏢 Hall Occupancy (%)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.hallOccupancy} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} stroke="var(--muted)" />
                            <YAxis dataKey="hallName" type="category" stroke="var(--muted)" width={80} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#060c22', border: '1px solid rgba(200, 220, 255, 0.2)' }}
                                formatter={(val: number | string | any) => `${Number(val || 0).toFixed(1)}%`}
                            />
                            <Bar dataKey="occupancyPercentage" fill="#2196F3" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. GENRES */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>🎭 Genre Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.genreStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                dataKey="ticketsSold"
                                nameKey="genreName"
                                paddingAngle={5}
                            >
                                {stats.genreStats.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#060c22', border: '1px solid rgba(200, 220, 255, 0.2)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.legend}>
                        {stats.genreStats.map((entry, index) => (
                            <div key={entry.genreName} className={styles.legendItem}>
                                <div className={styles.colorDot} style={{ background: COLORS[index % COLORS.length] }} />
                                {entry.genreName} ({entry.percentage}%)
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. PEAK HOURS */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>⏰ Sales by Hour</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={[...stats.peakHours].sort((a, b) => a.hour - b.hour)}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="hour" stroke="var(--muted)" tickFormatter={(h) => `${h}:00`} />
                            <YAxis stroke="var(--muted)" />
                            <Tooltip contentStyle={{ backgroundColor: '#060c22', border: '1px solid rgba(200, 220, 255, 0.2)' }} />
                            <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};