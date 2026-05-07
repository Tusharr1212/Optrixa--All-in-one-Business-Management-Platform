import type { LucideIcon } from 'lucide-react';
import {TrendingUp, TrendingDown } from 'lucide-react';


interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  subtitle,
}: Props) => {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={22} className={iconColor} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend.positive
              ? 'text-green-700 bg-green-50'
              : 'text-red-700 bg-red-50'
          }`}>
            {trend.positive
              ? <TrendingUp size={12} />
              : <TrendingDown size={12} />
            }
            {trend.value}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
};

export default StatCard;