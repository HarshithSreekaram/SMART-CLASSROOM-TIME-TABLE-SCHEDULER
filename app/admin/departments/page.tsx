'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, Input, Table, Badge, Loading, Modal } from '@/components/ui';

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  hod?: { _id: string; name: string; email: string };
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; department: Department | null }>({ open: false, department: null });
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/departments?${params}`);
      const data = await res.json();

      if (res.ok) {
        setDepartments(data.departments);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDepartments();
  };

  const handleDelete = async () => {
    if (!deleteModal.department) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/departments/${deleteModal.department._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteModal({ open: false, department: null });
        fetchDepartments();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Department',
      render: (dept: Department) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{dept.name}</div>
          <div className="text-sm text-gray-500">Code: {dept.code}</div>
        </div>
      ),
    },
    {
      key: 'hod',
      label: 'Head of Department',
      render: (dept: Department) => (
        <div className="text-gray-600 dark:text-gray-400">
          {dept.hod ? (
            <div>
              <div className="font-medium">{dept.hod.name}</div>
              <div className="text-sm">{dept.hod.email}</div>
            </div>
          ) : (
            <span className="text-gray-400">Not assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (dept: Department) => (
        <span className="text-gray-600 dark:text-gray-400 truncate max-w-xs block">
          {dept.description || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (dept: Department) => (
        <Badge variant={dept.isActive ? 'success' : 'error'}>
          {dept.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (dept: Department) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/departments/${dept._id}/edit`}>
            <Button variant="ghost" size="sm">Edit</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setDeleteModal({ open: true, department: dept })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Department Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all departments and assign HODs</p>
        </div>
        <Link href="/admin/departments/new">
          <Button>+ Add New Department</Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {/* Departments Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No departments found</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={departments} />
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} departments
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, department: null })}
        title="Delete Department"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete <strong>{deleteModal.department?.name}</strong>? 
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteModal({ open: false, department: null })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Department'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
