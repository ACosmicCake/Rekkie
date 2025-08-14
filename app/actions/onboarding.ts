"use server"

import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { generateEmbedding } from "@/server/llm/embed"

interface FormData {
  homeCity: string;
  age: string;
  interests: string[];
  musicGenres: string[];
  favoriteArtists: string[];
  favoriteVenues: string[];
  favoriteTheaters: string[];
}

export async function saveOnboardingData(userId: string, formData: FormData) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update User model
      await tx.user.update({
        where: { id: userId },
        data: {
          homeCity: formData.homeCity,
          age: parseInt(formData.age, 10),
          onboardingComplete: true,
        },
      })

      // 2. Create UserProfile
      await tx.userProfile.create({
        data: {
          userId,
          // Other profile fields can be added here later
        },
      })

      // 3. Create UserPreference records
      const preferenceValues = [
        ...formData.interests.map((value) => ({ kind: 'interest', value })),
        ...formData.musicGenres.map((value) => ({ kind: 'genre', value })),
        ...formData.favoriteArtists.map((value) => ({ kind: 'artist', value })),
        ...formData.favoriteVenues.map((value) => ({ kind: 'venue', value })),
        ...formData.favoriteTheaters.map((value) => ({ kind: 'theater', value })),
      ];

      const preferencesWithEmbeddings = await Promise.all(
        preferenceValues.map(async (p) => {
          const embedding = await generateEmbedding(`${p.kind}: ${p.value}`);
          return {
            ...p,
            userId,
            embedding,
          };
        })
      );

      const validPreferences = preferencesWithEmbeddings.filter(p => p.embedding);

      if (validPreferences.length > 0) {
        await tx.userPreference.createMany({
          data: validPreferences.map(p => ({
            kind: p.kind,
            value: p.value,
            userId: p.userId,
            embedding: p.embedding as number[], // Cast because filter ensures it's not null
          })),
        });
      }
    });
  } catch (error) {
    console.error("Failed to save onboarding data:", error)
    // Handle the error appropriately in a real app
    // Maybe return an error message to the client
    return { error: "Something went wrong. Please try again." }
  }

  // Revalidate path and redirect
  revalidatePath("/onboarding")
  redirect("/dashboard") // Redirect to the main dashboard
}
