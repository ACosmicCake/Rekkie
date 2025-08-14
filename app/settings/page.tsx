import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import SettingsForm from "@/components/settings/SettingsForm"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      preferences: true,
    },
  })

  if (!user) {
    // This should not happen for a logged-in user
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <SettingsForm user={user} />
    </div>
  )
}
