import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import OnboardingForm from "@/components/onboarding/OnboardingForm"

export default async function OnboardingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (user?.onboardingComplete) {
    redirect("/dashboard") // I will create this page later
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-2">Welcome! Let's get you set up.</h1>
      <p className="text-muted-foreground mb-8">
        Tell us a bit about yourself so we can find the best events for you.
      </p>
      <OnboardingForm userId={session.user.id} />
    </div>
  )
}
