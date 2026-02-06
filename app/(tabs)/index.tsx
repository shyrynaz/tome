import { FocusMode } from '@/components/FocusMode';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/clerk-expo';
import { useAction, useMutation, useQuery } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BrainCircuitIcon,
  CheckCircle2Icon,
  CheckIcon,
  CircleIcon,
  FlameIcon,
  LayoutGridIcon,
  SparklesIcon,
  TrophyIcon,
  ZapIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutLeft, Layout } from 'react-native-reanimated';

export default function DailyPlanScreen() {
  const { user } = useUser();
  const tasks = useQuery(api.tasks.list);
  const generatePlan = useAction(api.planner.generateDailyPlan);
  const updateTaskStatus = useMutation(api.tasks.updateStatus);

  const [isPlanning, setIsPlanning] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [showFocusMode, setShowFocusMode] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleGeneratePlan = async () => {
    setIsPlanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await generatePlan({ userId: 'me' });
      setAiSuggestion(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleCompleteTask = async (taskId: Id<'tasks'>) => {
    setCompletingTaskId(taskId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await updateTaskStatus({ taskId, status: 'done' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingTaskId(null);
    }
  };

  const pendingTasks = tasks?.filter((t) => t.status === 'todo') || [];
  const completedTasks = tasks?.filter((t) => t.status === 'done') || [];
  const focusTask = pendingTasks[0];

  const totalTasks = tasks?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  return (
    <View className="bg-background flex-1">
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'transparent', 'transparent']}
        className="absolute inset-0"
        pointerEvents="none"
      />

      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          {/* Top Bar */}
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Avatar alt="user-profile" className="size-10 border border-white/10">
                <AvatarImage source={{ uri: user?.imageUrl }} />
                <AvatarFallback className="bg-primary">
                  <Text className="text-xs text-white">{user?.firstName?.[0] || 'U'}</Text>
                </AvatarFallback>
              </Avatar>
              <View>
                <Text className="text-muted-foreground font-outfit-medium text-[10px] tracking-[2px] uppercase">
                  {today}
                </Text>
                <Text className="font-outfit-bold text-foreground text-lg tracking-tight">
                  Hi, {user?.firstName || 'Tome Traveler'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleGeneratePlan}
              disabled={isPlanning}
              className="size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              {isPlanning ? (
                <ActivityIndicator color="#8B5CF6" size="small" />
              ) : (
                <Icon as={BrainCircuitIcon} className="text-primary size-5" />
              )}
            </Pressable>
          </View>

          {/* Hero Bento Section */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-10">
            <Card className="bg-card/40 overflow-hidden rounded-[32px] border-white/5 backdrop-blur-3xl">
              <CardContent className="p-6">
                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Icon as={LayoutGridIcon} className="text-primary size-4" />
                    <Text className="text-primary font-outfit-bold text-[10px] tracking-widest uppercase">
                      Daily Progress
                    </Text>
                  </View>
                  <Text className="text-foreground font-outfit-bold text-sm">
                    {Math.round(progress)}% Done
                  </Text>
                </View>
                <Progress value={progress} className="h-2 bg-white/5" />
                <View className="mt-6 flex-row items-center gap-4">
                  <View className="flex-1 flex-row items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3">
                    <View className="rounded-xl bg-amber-500/20 p-2">
                      <Icon as={FlameIcon} className="size-4 text-amber-500" />
                    </View>
                    <View>
                      <Text className="text-foreground font-outfit-bold text-base">5</Text>
                      <Text className="text-muted-foreground font-outfit text-[10px] uppercase">
                        Streak
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1 flex-row items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3">
                    <View className="rounded-xl bg-indigo-500/20 p-2">
                      <Icon as={CheckCircle2Icon} className="size-4 text-indigo-500" />
                    </View>
                    <View>
                      <Text className="text-foreground font-outfit-bold text-base">
                        {completedTasks.length}/{totalTasks}
                      </Text>
                      <Text className="text-muted-foreground font-outfit text-[10px] uppercase">
                        Tasks
                      </Text>
                    </View>
                  </View>
                </View>
              </CardContent>
            </Card>
          </Animated.View>

          {/* Focus Bento Section */}
          {focusTask ? (
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-10">
              <View className="overflow-hidden rounded-[32px] p-[1px]">
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.4)', 'rgba(245, 158, 11, 0.2)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <View className="bg-card/90 rounded-[31px] p-6 backdrop-blur-xl">
                  {/* Glow */}
                  <View className="bg-primary/20 absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full blur-[60px]" />

                  <View className="mb-6 flex-row items-center justify-between">
                    <Badge className="bg-primary/20 border-primary/20 flex-row items-center gap-1.5">
                      <Icon as={TrophyIcon} className="text-primary size-3" />
                      <Text className="text-primary font-outfit-bold text-[10px] tracking-widest uppercase">
                        Main Focus
                      </Text>
                    </Badge>
                    {focusTask.priority === 'high' && (
                      <Badge
                        variant="destructive"
                        className="bg-destructive/20 border-destructive/20">
                        <Text className="text-destructive font-outfit-bold text-[10px] tracking-wider uppercase">
                          Urgent
                        </Text>
                      </Badge>
                    )}
                  </View>

                  <Text className="font-outfit-bold text-foreground mb-10 text-3xl leading-9 tracking-tight">
                    {focusTask.title}
                  </Text>

                  <View className="flex-row gap-3">
                    <Button
                      variant="outline"
                      onPress={() => setShowFocusMode(true)}
                      className="h-14 flex-1 rounded-2xl border-white/10 bg-white/5">
                      <View className="flex-row items-center gap-2">
                        <Icon as={TrophyIcon} className="text-muted-foreground size-4" />
                        <Text className="text-muted-foreground font-outfit-semibold text-sm">
                          Focus Mode
                        </Text>
                      </View>
                    </Button>

                    <Button
                      onPress={() => handleCompleteTask(focusTask._id)}
                      disabled={completingTaskId === focusTask._id}
                      className="bg-primary shadow-primary/20 h-14 flex-1 rounded-2xl shadow-lg">
                      {completingTaskId === focusTask._id ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <View className="flex-row items-center gap-2">
                          <Icon as={CheckCircle2Icon} className="size-4 text-white" />
                          <Text className="font-outfit-semibold text-sm text-white">Complete</Text>
                        </View>
                      )}
                    </Button>
                  </View>
                </View>
              </View>
            </Animated.View>
          ) : null}

          {/* AI Suggestion (Bento Card) */}
          {aiSuggestion && (
            <Animated.View entering={FadeInDown.springify()} className="mb-10">
              <Card className="bg-primary/5 border-primary/10 rounded-[32px] border-dashed backdrop-blur-xl">
                <CardContent className="p-6">
                  <View className="mb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="bg-primary/20 rounded-xl p-2">
                        <Icon as={SparklesIcon} className="text-primary size-4" />
                      </View>
                      <Text className="text-primary font-outfit-bold text-[10px] tracking-widest uppercase">
                        AI Strategist
                      </Text>
                    </View>
                    <Pressable onPress={() => setAiSuggestion(null)} className="p-1 opacity-40">
                      <Icon as={CheckIcon} className="text-foreground size-4" />
                    </Pressable>
                  </View>
                  <Text className="font-outfit text-foreground/80 text-lg leading-7">
                    {aiSuggestion}
                  </Text>
                </CardContent>
              </Card>
            </Animated.View>
          )}

          {/* Upcoming List */}
          <View className="mb-12">
            <View className="mb-6 flex-row items-center justify-between px-1">
              <Text className="font-outfit-bold text-foreground text-lg tracking-tight">
                Upcoming Tasks
              </Text>
              <Text className="text-primary font-outfit-medium text-xs">See All</Text>
            </View>

            {tasks === undefined ? (
              <View className="items-center p-4">
                <ActivityIndicator color="#8B5CF6" />
              </View>
            ) : pendingTasks.length <= 1 && !focusTask ? (
              <View className="items-center justify-center rounded-[32px] border border-dashed border-white/5 bg-white/5 p-10">
                <Icon as={ZapIcon} className="text-muted-foreground/20 mb-3 size-8" />
                <Text className="text-muted-foreground font-outfit text-center italic">
                  Your schedule is clear.
                </Text>
              </View>
            ) : (
              pendingTasks.slice(focusTask ? 1 : 0).map((task, index) => (
                <Animated.View
                  key={task._id}
                  entering={FadeInDown.delay(300 + index * 100).springify()}
                  exiting={FadeOutLeft}
                  layout={Layout.springify()}
                  className="bg-card/30 mb-3 flex-row items-center gap-4 rounded-3xl border border-white/5 p-4 active:bg-white/5">
                  <Pressable
                    onPress={() => handleCompleteTask(task._id)}
                    className="border-primary/30 active:bg-primary/20 active:border-primary size-7 items-center justify-center rounded-full border-2"></Pressable>
                  <View className="flex-1">
                    <Text className="font-outfit-medium text-foreground/90 text-lg leading-6">
                      {task.title}
                    </Text>
                    {task.priority === 'high' && (
                      <Badge
                        variant="destructive"
                        className="bg-destructive/10 mt-1 h-auto self-start border-none p-0">
                        <Text className="text-destructive font-outfit-bold text-[8px] tracking-wider uppercase">
                          Urgent
                        </Text>
                      </Badge>
                    )}
                  </View>
                </Animated.View>
              ))
            )}
          </View>

          {/* Completed Tasks (Minimalist) */}
          {completedTasks.length > 0 && (
            <View className="mb-12">
              <Text className="font-outfit-bold text-muted-foreground mb-4 px-1 text-sm tracking-widest uppercase">
                Completed
              </Text>
              {completedTasks.map((task, index) => (
                <Animated.View
                  key={task._id}
                  entering={FadeInDown.delay(index * 50).springify()}
                  className="mb-2 flex-row items-center gap-4 p-2 opacity-30">
                  <Icon as={CheckIcon} className="size-5 text-emerald-500" />
                  <Text className="font-outfit text-muted-foreground text-base line-through">
                    {task.title}
                  </Text>
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Focus Mode Overlay */}
      {showFocusMode && focusTask && (
        <FocusMode
          task={focusTask}
          onClose={() => setShowFocusMode(false)}
          onComplete={() => setShowFocusMode(false)}
        />
      )}
    </View>
  );
}
