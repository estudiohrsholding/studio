'use server';

import { personalizeRewards } from '@/ai/flows/personalized-reward-system';
import { z } from 'zod';

const formSchema = z.object({
  userHabits: z.string().min(1, 'User habits cannot be empty.'),
  userPreferences: z.string().min(1, 'User preferences cannot be empty.'),
  currentLevel: z.coerce.number().min(0, 'Level must be a positive number.'),
});

export async function getPersonalizedReward(prevState: any, formData: FormData) {
  try {
    const parsed = formSchema.safeParse({
      userHabits: formData.get('userHabits'),
      userPreferences: formData.get('userPreferences'),
      currentLevel: formData.get('currentLevel'),
    });

    if (!parsed.success) {
      return {
        reward: null,
        error: parsed.error.errors.map((e) => e.message).join(', '),
      };
    }

    const reward = await personalizeRewards(parsed.data);

    return {
      reward,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      reward: null,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}
