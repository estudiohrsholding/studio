'use server';

/**
 * @fileOverview Personalized reward system AI agent.
 *
 * - personalizeRewards - A function that handles the reward personalization process.
 * - PersonalizeRewardsInput - The input type for the personalizeRewards function.
 * - PersonalizeRewardsOutput - The return type for the personalizeRewards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeRewardsInputSchema = z.object({
  userHabits: z
    .string()
    .describe('The user habits, such as frequency of use and features used.'),
  userPreferences: z
    .string()
    .describe('The user preferences, such as preferred UI and desired discounts.'),
  currentLevel: z.number().describe('The current level of the user.'),
});
export type PersonalizeRewardsInput = z.infer<typeof PersonalizeRewardsInputSchema>;

const PersonalizeRewardsOutputSchema = z.object({
  rewardDescription: z
    .string()
    .describe('A description of the personalized reward or level benefit.'),
  pointsAwarded: z.number().describe('The number of points awarded.'),
  levelUnlocked: z.number().describe('The level unlocked by the user.'),
});
export type PersonalizeRewardsOutput = z.infer<typeof PersonalizeRewardsOutputSchema>;

export async function personalizeRewards(input: PersonalizeRewardsInput): Promise<PersonalizeRewardsOutput> {
  return personalizeRewardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeRewardsPrompt',
  input: {schema: PersonalizeRewardsInputSchema},
  output: {schema: PersonalizeRewardsOutputSchema},
  prompt: `You are an AI assistant specializing in personalizing rewards and level benefits for users based on their habits and preferences.

  Analyze the user's habits and preferences to suggest a reward that motivates them to engage with the app daily and achieve a higher level.

  User Habits: {{{userHabits}}}
  User Preferences: {{{userPreferences}}}
  Current Level: {{{currentLevel}}}

  Based on this information, provide a personalized reward description, the number of points to award, and the level the user unlocks.
  Ensure that the reward aligns with their preferences and encourages continued engagement.

  Output:
  - rewardDescription: A description of the personalized reward or level benefit.
  - pointsAwarded: The number of points awarded.
  - levelUnlocked: The level unlocked by the user.
  `,
});

const personalizeRewardsFlow = ai.defineFlow(
  {
    name: 'personalizeRewardsFlow',
    inputSchema: PersonalizeRewardsInputSchema,
    outputSchema: PersonalizeRewardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
