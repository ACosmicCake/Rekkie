"use client"

import { useState } from "react"
import { User, UserProfile, UserPreference } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateUserData } from "@/app/actions/settings" // I will create this action later

type UserWithRelations = User & {
  profile: UserProfile | null;
  preferences: UserPreference[];
};

export default function SettingsForm({ user }: { user: UserWithRelations }) {
  const [formData, setFormData] = useState({
    homeCity: user.homeCity ?? "",
    age: user.age?.toString() ?? "",
    // TODO: Add other preferences
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserData(user.id, formData);
    // TODO: Show a success message
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="homeCity">Home City</Label>
          <Input id="homeCity" name="homeCity" value={formData.homeCity} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} />
        </div>
      </div>

      {/* Placeholder for other preferences */}
      <div className="p-8 bg-gray-50 rounded-md">
        <p className="text-center text-muted-foreground">
          Editing for interests, genres, artists, and other preferences will be implemented here.
        </p>
      </div>

      <Button type="submit">Save Changes</Button>
    </form>
  )
}
