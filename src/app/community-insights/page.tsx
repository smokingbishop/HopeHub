'use client';
import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  generateCommunitySummary,
  type CommunitySummaryOutput,
} from '@/ai/flows/community-summary';
import { BrainCircuit, Lightbulb, ListChecks, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  discussionThemes: z
    .string()
    .min(10, { message: 'Please provide more details on discussion themes.' }),
  memberEngagementData: z
    .string()
    .min(10, { message: 'Please provide more details on engagement data.' }),
});

export default function CommunityInsightsPage() {
  const [result, setResult] = useState<CommunitySummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discussionThemes: '',
      memberEngagementData: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const summaryResult = await generateCommunitySummary(values);
      setResult(summaryResult);
      toast({
        title: 'Summary Generated',
        description: 'Insights and recommendations are ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not generate the community summary.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Community Insights
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate Community Summary</CardTitle>
              <CardDescription>
                Use AI to analyze community data and get actionable insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="discussionThemes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discussion Themes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Members are discussing weekend vs. weekday events, interest in family-friendly activities, suggestions for new charity partners..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="memberEngagementData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member Engagement Data</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Event sign-up rates are up 15%, but attendance is only at 70% of sign-ups. Feedback forms show high satisfaction but request more social events..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <BrainCircuit className="mr-2 h-4 w-4" />
                    )}
                    Generate Insights
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>AI-Generated Report</CardTitle>
              <CardDescription>
                Summary, insights, and recommendations will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {result && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                      Summary
                    </h3>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Insights
                    </h3>
                    <p className="text-sm text-muted-foreground">{result.insights}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                      <ListChecks className="h-5 w-5 text-primary" />
                      Recommendations
                    </h3>
                    <p className="text-sm text-muted-foreground">{result.recommendations}</p>
                  </div>
                </div>
              )}
              {!isLoading && !result && (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  <p>Your report is waiting to be generated.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
