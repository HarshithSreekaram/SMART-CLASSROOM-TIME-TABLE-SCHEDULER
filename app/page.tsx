import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  // If user is logged in, redirect to their dashboard
  if (session?.user) {
    const role = session.user.role;
    switch (role) {
      case 'admin':
        redirect('/admin/dashboard');
      case 'hod':
        redirect('/hod/dashboard');
      case 'coordinator':
        redirect('/coordinator/dashboard');
      case 'faculty':
        redirect('/faculty/dashboard');
      case 'student':
        redirect('/student/dashboard');
      default:
        redirect('/login');
    }
  }

  // If not logged in, redirect to login page
  redirect('/login');
}
