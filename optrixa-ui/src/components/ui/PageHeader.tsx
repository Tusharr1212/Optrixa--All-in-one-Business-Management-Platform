import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

const PageHeader = ({ title, description, icon: Icon, action }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Icon size={20} className="text-indigo-600" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{description}</p>
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;