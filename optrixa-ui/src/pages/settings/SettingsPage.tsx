import { useAuthStore } from '../../store/authStore';
import { User, Shield, Bell, Database } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <User size={24} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Profile</h3>
            <p className="text-sm text-gray-500">Your account information</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={user?.fullName ?? ''} readOnly />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={user?.email ?? ''} readOnly />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input" value={user?.role ?? ''} readOnly />
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Shield size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Security</h3>
            <p className="text-sm text-gray-500">Authentication and access control</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">JWT Authentication</div>
              <div className="text-xs text-gray-500">Token-based secure authentication</div>
            </div>
            <span className="badge-success">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">Role-based Access</div>
              <div className="text-xs text-gray-500">Admin and Employee roles</div>
            </div>
            <span className="badge-success">Active</span>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Database size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">System</h3>
            <p className="text-sm text-gray-500">Technical information</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Backend', value: 'ASP.NET Core 8 + C#' },
            { label: 'Database', value: 'SQL Server (Docker)' },
            { label: 'Frontend', value: 'React 18 + TypeScript' },
            { label: 'Architecture', value: 'Clean Architecture + CQRS' },
            { label: 'Auth', value: 'JWT Bearer Tokens' },
            { label: 'Version', value: 'Optrixa v1.0.0' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-700">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;