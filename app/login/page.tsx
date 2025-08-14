import { signIn } from "@/auth"
import { Button } from "@/components/ui/button" // I will create this later
import { Input } from "@/components/ui/input" // I will create this later
import { Label } from "@/components/ui/label" // I will create this later

export default function LoginPage() {
  async function signInWithGithub() {
    "use server"
    await signIn("github")
  }

  async function signInWithEmail(formData: FormData) {
    "use server"
    const email = formData.get("email") as string
    await signIn("email", { email })
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <form action={signInWithGithub}>
          <Button type="submit" className="w-full">Sign in with GitHub</Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-white text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <form action={signInWithEmail} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" name="email" placeholder="you@example.com" required />
          </div>
          <Button type="submit" className="w-full">Sign in with Email</Button>
        </form>
      </div>
    </div>
  )
}
