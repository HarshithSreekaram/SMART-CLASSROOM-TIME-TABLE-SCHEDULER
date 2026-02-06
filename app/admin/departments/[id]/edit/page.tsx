'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Select, Loading } from '@/components/ui';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  hod?: { _id: string };
  isActive: boolean;
}

export default function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hodUsers, setHodUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    hod: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch department and HOD users in parallel
        const [deptRes, hodRes] = await Promise.all([
          fetch(`/api/departments/${id}`),
          fetch('/api/users?role=hod&limit=100'),
        ]);

        const deptData = await deptRes.json();
        const hodData = await hodRes.json();

        if (deptRes.ok && deptData.department) {
          const dept: Department = deptData.department;
          setFormData({
            name: dept.name,
            code: dept.code,
            description: dept.description || '',
            hod: dept.hod?._id || '',
            isActive: dept.isActive,
          });
        } else {
          setError('Department not found');
        }

        if (hodRes.ok) {
          setHodUsers(hodData.users);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load department data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/departments');
      } else {
        setError(data.error || 'Failed to update department');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      setError('Failed to update department');
    } finally {
      setSaving(false);
    }
  };

  const hodOptions = [
    { value: '', label: 'No HOD Assigned' },
    ...hodUsers.map(u => ({ value: u._id, label: `${u.name} (${u.email})` })),
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Department</h1>
        <p className="text-gray-600 dark:text-gray-400">Update department details</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Input
            label="Department Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Computer Science and Engineering"
          />

          <Input
            label="Department Code"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="CSE"
            hint="Short unique code (will be uppercase)"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the department"
            />
          </div>

          <Select
            label="Head of Department (HOD)"
            options={hodOptions}
            value={formData.hod}
            onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-indigo-600 rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
              Active Department
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/departments')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
