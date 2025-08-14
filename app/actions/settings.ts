"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

interface FormData {
  homeCity: string;
  age: string;
}

export async function updateUserData(userId: string, formData: FormData) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        homeCity: formData.homeCity,
        age: parseInt(formData.age, 10) || null,
      },
    })

    // TODO: Implement logic to update UserPreference records.
    // This will involve deleting existing preferences and creating new ones.

    revalidatePath("/settings")
    return { message: "Settings updated successfully." }
  } catch (error) {
    console.error("Failed to update user data:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
