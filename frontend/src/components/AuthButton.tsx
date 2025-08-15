'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AuthButton() {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <button onClick={logout} className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm">
        Logout
      </button>
    );
  }

  return (
    <Link href="/login">
      <span className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm">Login</span>
    </Link>
  );
}
