"use client"

import { Session } from "next-auth"
import { signOut } from "next-auth/react" // Using client-side signOut
import Link from "next/link"

export default function AuthButton({ session }: { session: Session | null }) {
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session.user?.email}</span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <Link href="/login">
      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
        Sign In
      </button>
    </Link>
  )
}
