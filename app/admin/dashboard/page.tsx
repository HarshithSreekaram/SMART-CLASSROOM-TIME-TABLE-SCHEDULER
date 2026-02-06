import { StatCard } from '@/components/ui';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Department from '@/models/Department';
import Subject from '@/models/Subject';
import Room from '@/models/Room';
import Link from 'next/link';

async function getStats() {
  await dbConnect();
  
  const [usersCount, departmentsCount, subjectsCount, roomsCount, recentUsers] = await Promise.all([
    User.countDocuments(),
    Department.countDocuments(),
    Subject.countDocuments(),
    Room.countDocuments(),
    User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return { usersCount, departmentsCount, subjectsCount, roomsCount, recentUsers };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/users">
          <StatCard
            title="Total Users"
            value={stats.usersCount}
            icon="👥"
            description="Click to manage"
          />
        </Link>
        <Link href="/admin/departments">
          <StatCard
            title="Departments"
            value={stats.departmentsCount}
            icon="🏛️"
            description="Click to manage"
          />
        </Link>
        <StatCard
          title="Subjects"
          value={stats.subjectsCount}
          icon="📚"
          description="Coming in Phase 6"
        />
        <StatCard
          title="Rooms"
          value={stats.roomsCount}
          icon="🏫"
          description="Coming in Phase 6"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/users/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            👤 Create User
          </Link>
          <Link
            href="/admin/departments/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🏛️ Add Department
          </Link>
          <Link
            href="/admin/users"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📋 View All Users
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Users
          </h2>
          <Link href="/admin/users" className="text-indigo-600 hover:text-indigo-700 text-sm">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={String(user._id)} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 capitalize">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
          ✅ Phase 4 Complete!
        </h3>
        <p className="text-green-700 dark:text-green-400 mb-2">
          User and Department management are fully functional. You can create, edit, and delete users and departments.
        </p>
        <p className="text-sm text-green-600 dark:text-green-500">
          Next: Phase 5 - HOD Module (Faculty management, Timetable approvals)
        </p>
      </div>
    </div>
  );
}
