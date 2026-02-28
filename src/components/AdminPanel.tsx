import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Database, Users, History, ArrowLeft, Download } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [data, setData] = useState<{ results: any[], users: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const exportToCSV = () => {
    if (!data) return;
    const headers = ["ID", "Gmail", "Name", "Score", "Accuracy", "Class", "Difficulty", "Timestamp"];
    const rows = data.results.map(r => [r.id, r.email, r.fullName || 'N/A', r.score, r.accuracy, r.class, r.difficulty, r.timestamp]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mission_data.csv';
    a.click();
  };

  if (loading) return <div className="text-white text-center p-20">Loading Database...</div>;

  return (
    <div className="min-h-screen p-8 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Command Center</h1>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-2xl font-bold transition-all"
          >
            <Download size={20} /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4 text-indigo-400">
                <Users size={24} />
                <h2 className="text-xl font-bold">Total Cadets</h2>
              </div>
              <p className="text-5xl font-black">{data?.users.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4 text-green-400">
                <History size={24} />
                <h2 className="text-xl font-bold">Missions Flown</h2>
              </div>
              <p className="text-5xl font-black">{data?.results.length}</p>
            </div>
          </div>

          {/* Results Table (Spreadsheet) */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <Database className="text-indigo-400" size={20} />
              <h2 className="text-xl font-bold">Mission Logs (Spreadsheet View)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="p-4">Gmail</th>
                    <th className="p-4">Full Name</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Accuracy</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.results.map((res) => (
                    <tr key={res.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold">{res.email}</td>
                      <td className="p-4 text-gray-400">{res.fullName || '—'}</td>
                      <td className="p-4 text-indigo-400 font-mono">{res.score}</td>
                      <td className="p-4 text-green-400 font-mono">{res.accuracy}%</td>
                      <td className="p-4">{res.class}</td>
                      <td className="p-4">{res.difficulty}</td>
                      <td className="p-4 text-xs text-gray-500">{new Date(res.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
