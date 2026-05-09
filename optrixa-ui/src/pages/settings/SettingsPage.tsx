import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Shield, Database, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import axiosClient from '../../api/axiosClient';

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

const defaultRegisterForm: RegisterForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'Employee',
};

const SettingsPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'Admin';
  const [registerForm, setRegisterForm] =
    useState<RegisterForm>(defaultRegisterForm);

  const registerMutation = useMutation({
    mutationFn: async (dto: RegisterForm) => {
      const response = await axiosClient.post('/Auth/register', dto);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message ?? 'User created successfully!');
      setRegisterForm(defaultRegisterForm);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to create user.'
      );
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName || !registerForm.email || !registerForm.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    registerMutation.mutate(registerForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
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

      {/* Security */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Shield size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Security</h3>
            <p className="text-sm text-gray-500">
              Authentication and access control
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">
                JWT Authentication
              </div>
              <div className="text-xs text-gray-500">
                Token-based secure authentication
              </div>
            </div>
            <span className="badge-success">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">
                Role-based Access
              </div>
              <div className="text-xs text-gray-500">
                Admin and Employee roles
              </div>
            </div>
            <span className="badge-success">Active</span>
          </div>
        </div>
      </div>

      {/* Add User — Admin only */}
      {isAdmin && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <UserPlus size={24} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                Add New User
              </h3>
              <p className="text-sm text-gray-500">
                Create Admin or Employee accounts
              </p>
            </div>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  className="input"
                  placeholder="Jane Smith"
                  value={registerForm.fullName}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="jane@optrixa.com"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Min 8 chars, 1 uppercase, 1 digit"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={registerForm.role}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {registerMutation.isPending && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

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
            { label: 'Backend',      value: 'ASP.NET Core 8 + C#' },
            { label: 'Database',     value: 'SQL Server (Docker)' },
            { label: 'Frontend',     value: 'React 18 + TypeScript' },
            { label: 'Architecture', value: 'Clean Architecture + CQRS' },
            { label: 'Auth',         value: 'JWT Bearer Tokens' },
            { label: 'Version',      value: 'Optrixa v1.0.0' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
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