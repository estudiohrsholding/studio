'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Gift, Sparkles, Wand2 } from 'lucide-react';
import { getPersonalizedReward } from '@/app/(dashboard)/profile/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  reward: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Generating...' : <>
      <Wand2 className="mr-2 h-4 w-4" />
      Personalize Reward
      </>}
    </Button>
  );
}

export function RewardsPanel() {
  const [state, formAction] = useFormState(getPersonalizedReward, initialState);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-primary" /> AI-Powered Rewards
          </CardTitle>
          <CardDescription>
            Personalize rewards based on user habits and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userHabits">User Habits</Label>
            <Textarea
              id="userHabits"
              name="userHabits"
              placeholder="e.g., Logs in daily, primarily uses the POS feature, engages with statistics weekly."
              defaultValue="Logs in daily, primarily uses the POS feature, engages with statistics weekly."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userPreferences">User Preferences</Label>
            <Textarea
              id="userPreferences"
              name="userPreferences"
              placeholder="e.g., Prefers dark mode UI, interested in discounts on edibles."
              defaultValue="Prefers dark mode UI, interested in discounts on edibles."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentLevel">Current Level</Label>
            <Input
              id="currentLevel"
              name="currentLevel"
              type="number"
              defaultValue="5"
            />
          </div>

          {state.reward && (
            <Alert className="border-accent bg-accent/10">
                <Gift className="h-4 w-4 text-accent" />
                <AlertTitle className="font-headline text-accent">Personalized Reward Generated!</AlertTitle>
                <AlertDescription className="space-y-2 text-foreground">
                    <p>{state.reward.rewardDescription}</p>
                    <p>
                        <strong>Points Awarded:</strong> {state.reward.pointsAwarded} |{' '}
                        <strong>New Level:</strong> {state.reward.levelUnlocked}
                    </p>
                </AlertDescription>
            </Alert>
          )}

           {state.error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
           )}

        </CardContent>
        <CardFooter>
            <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
