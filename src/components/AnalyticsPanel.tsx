import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, TrendingUp, Target, Users, Zap } from 'lucide-react';

interface AnalyticsPanelProps {
  onBack: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ onBack }) => {
  const [data, setData] = useState<{ results: any[], users: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="text-white text-center p-20">Analyzing Data Streams...</div>;

  // Prepare data for charts
  const classDistribution = data.results.reduce((acc: any, curr) => {
    acc[curr.class] = (acc[curr.class] || 0) + 1;
    return acc;
  }, {});

  const classChartData = Object.entries(classDistribution).map(([name, value]) => ({ name: `Class ${name}`, value }));

  const difficultyTrend = data.results.slice(-10).map((r, i) => ({
    name: `Mission ${i + 1}`,
    difficulty: r.difficulty,
    accuracy: r.accuracy
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const avgAccuracy = data.results.length > 0 
    ? Math.round(data.results.reduce((acc, curr) => acc + curr.accuracy, 0) / data.results.length) 
    : 0;

  return (
    <div className="min-h-screen p-8 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Analytics Command</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard icon={<TrendingUp className="text-indigo-400" />} label="Avg Accuracy" value={`${avgAccuracy}%`} />
          <MetricCard icon={<Target className="text-green-400" />} label="Top Level" value={Math.max(...data.results.map(r => r.difficulty), 0).toString()} />
          <MetricCard icon={<Users className="text-blue-400" />} label="Active Cadets" value={data.users.length.toString()} />
          <MetricCard icon={<Zap className="text-yellow-400" />} label="Total Missions" value={data.results.length.toString()} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Class Distribution */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6">Mission Distribution by Class</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {classChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Trends */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6">Recent Mission Performance</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={difficultyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                  <YAxis stroke="#9ca3af" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                  <Line type="monotone" dataKey="difficulty" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
    <div className="flex items-center gap-3 mb-2 opacity-60">
      {icon}
      <span className="text-xs uppercase tracking-widest font-bold">{label}</span>
    </div>
    <p className="text-4xl font-black">{value}</p>
  </div>
);
