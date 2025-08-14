"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { saveOnboardingData } from "@/app/actions/onboarding" // I will create this action later

const steps = ["Welcome", "Interests", "Music", "Places", "Review"]

export default function OnboardingForm({ userId }: { userId: string }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    homeCity: "",
    age: "",
    interests: [] as string[],
    musicGenres: [] as string[],
    favoriteArtists: [] as string[],
    favoriteVenues: [] as string[],
    favoriteTheaters: [] as string[],
  })

  const handleNext = () => setStep((prev) => prev + 1)
  const handlePrev = () => setStep((prev) => prev - 1)

  const handleSubmit = async () => {
    await saveOnboardingData(userId, formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <div className="mb-8">
        {/* Progress bar could go here */}
        <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</p>
        <h2 className="text-2xl font-bold">{steps[step]}</h2>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="homeCity">What city do you live in?</Label>
            <Input id="homeCity" name="homeCity" value={formData.homeCity} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="age">How old are you?</Label>
            <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <Label>What are your interests?</Label>
          {/* TODO: Add chips and free-text input for interests */}
          <p className="text-center p-8">Interest selection UI to be implemented.</p>
        </div>
      )}

      {/* TODO: Implement other steps */}
      {step > 1 && step < steps.length -1 && (
        <p className="text-center p-8">More steps to be implemented.</p>
      )}


      {step === steps.length - 1 && (
        <div>
          <h3 className="text-lg font-bold">Review your information</h3>
          <pre className="p-4 mt-4 bg-gray-100 rounded-md">{JSON.stringify(formData, null, 2)}</pre>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 0 && <Button onClick={handlePrev} variant="outline">Previous</Button>}
        <div /> {/* Spacer */}
        {step < steps.length - 1 && <Button onClick={handleNext}>Next</Button>}
        {step === steps.length - 1 && <Button onClick={handleSubmit}>Finish Onboarding</Button>}
      </div>
    </div>
  )
}
