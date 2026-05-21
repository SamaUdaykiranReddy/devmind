interface Stats {
  total: number;
  critical: number;
  high: number;
  medium: number;
}

export default function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <p className="text-gray-400 text-sm">Total Errors</p>
        <p className="text-white text-3xl font-bold">{stats.total}</p>
      </div>
      <div className="bg-gray-900 border border-red-900 rounded-lg p-4">
        <p className="text-red-400 text-sm">Critical</p>
        <p className="text-red-400 text-3xl font-bold">{stats.critical}</p>
      </div>
      <div className="bg-gray-900 border border-orange-900 rounded-lg p-4">
        <p className="text-orange-400 text-sm">High</p>
        <p className="text-orange-400 text-3xl font-bold">{stats.high}</p>
      </div>
      <div className="bg-gray-900 border border-yellow-900 rounded-lg p-4">
        <p className="text-yellow-400 text-sm">Medium</p>
        <p className="text-yellow-400 text-3xl font-bold">{stats.medium}</p>
      </div>
    </div>
  );
}
