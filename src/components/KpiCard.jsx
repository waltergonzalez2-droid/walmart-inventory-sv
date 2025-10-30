import { TrendingUp } from 'lucide-react';

export default function KpiCard({ 
  title, 
  value, 
  icon: Icon = TrendingUp,
  trend = null,
  color = 'blue'
}) {
  return (
    <div className={`${color} text-white p-4 rounded-xl shadow`}>
      <h3 className="text-sm opacity-80">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}