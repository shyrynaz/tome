import { View, SafeAreaView, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  CheckCircle2Icon, 
  CircleIcon, 
  SparklesIcon, 
  TrophyIcon, 
  BrainCircuitIcon, 
  CheckIcon,
  ZapIcon,
  LayoutGridIcon,
  FlameIcon
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import Animated, { FadeInDown, FadeOutLeft, Layout } from 'react-native-reanimated';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Id } from '@/convex/_generated/dataModel';
import { FocusMode } from '@/components/FocusMode';
import { useUser } from '@clerk/clerk-expo';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    day: 'numeric' 
  });

  const handleGeneratePlan = async () => {
    setIsPlanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await generatePlan({ userId: "me" }); 
      setAiSuggestion(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleCompleteTask = async (taskId: Id<"tasks">) => {
    setCompletingTaskId(taskId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await updateTaskStatus({ taskId, status: "done" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingTaskId(null);
    }
  };

  const pendingTasks = tasks?.filter(t => t.status === 'todo') || [];
  const completedTasks = tasks?.filter(t => t.status === 'done') || [];
  const focusTask = pendingTasks[0];
  
  const totalTasks = (tasks?.length || 0);
  const progress = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'transparent', 'transparent']}
        className="absolute inset-0"
        pointerEvents="none"
      />
      
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          
          {/* Top Bar */}
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center gap-3">
              <Avatar className="size-10 border border-white/10">
                <AvatarImage source={{ uri: user?.imageUrl }} />
                <AvatarFallback className="bg-primary">
                  <Text className="text-white text-xs">{user?.firstName?.[0] || 'U'}</Text>
                </AvatarFallback>
              </Avatar>
              <View>
                <Text className="text-muted-foreground font-outfit-medium text-[10px] uppercase tracking-[2px]">
                  {today}
                </Text>
                <Text className="font-outfit-bold text-lg text-foreground tracking-tight">
                  Hi, {user?.firstName || 'Tome Traveler'}
                </Text>
              </View>
            </View>
            <Pressable 
              onPress={handleGeneratePlan}
              disabled={isPlanning}
              className="size-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10"
            >
              {isPlanning ? (
                <ActivityIndicator color="#8B5CF6" size="small" />
              ) : (
                <Icon as={BrainCircuitIcon} className="text-primary size-5" />
              )}
            </Pressable>
          </View>

          {/* Hero Bento Section */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-10">
            <Card className="bg-card/40 border-white/5 rounded-[32px] overflow-hidden backdrop-blur-3xl">
              <CardContent className="p-6">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-2">
                    <Icon as={LayoutGridIcon} className="size-4 text-primary" />
                    <Text className="text-primary font-outfit-bold text-[10px] uppercase tracking-widest">Daily Progress</Text>
                  </View>
                  <Text className="text-foreground font-outfit-bold text-sm">{Math.round(progress)}% Done</Text>
                </View>
                <Progress value={progress} className="h-2 bg-white/5" />
                <View className="flex-row items-center gap-4 mt-6">
                   <View className="flex-1 flex-row items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <View className="bg-amber-500/20 p-2 rounded-xl">
                        <Icon as={FlameIcon} className="size-4 text-amber-500" />
                      </View>
                      <View>
                        <Text className="text-foreground font-outfit-bold text-base">5</Text>
                        <Text className="text-muted-foreground font-outfit text-[10px] uppercase">Streak</Text>
                      </View>
                   </View>
                   <View className="flex-1 flex-row items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <View className="bg-indigo-500/20 p-2 rounded-xl">
                        <Icon as={CheckCircle2Icon} className="size-4 text-indigo-500" />
                      </View>
                      <View>
                        <Text className="text-foreground font-outfit-bold text-base">{completedTasks.length}/{totalTasks}</Text>
                        <Text className="text-muted-foreground font-outfit text-[10px] uppercase">Tasks</Text>
                      </View>
                   </View>
                </View>
              </CardContent>
            </Card>
          </Animated.View>

          {/* Focus Bento Section */}
          {focusTask ? (
            <Animated.View 
              entering={FadeInDown.delay(200).springify()}
              className="mb-10"
            >
              <View className="p-[1px] rounded-[32px] overflow-hidden">
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.4)', 'rgba(245, 158, 11, 0.2)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <View className="bg-card/90 p-6 rounded-[31px] backdrop-blur-xl">
                  {/* Glow */}
                  <View className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[60px] -mr-10 -mt-10 rounded-full" />
                   
                  <View className="flex-row items-center justify-between mb-6">
                    <Badge className="bg-primary/20 border-primary/20 flex-row gap-1.5 items-center">
                      <Icon as={TrophyIcon} className="size-3 text-primary" />
                      <Text className="text-primary font-outfit-bold text-[10px] uppercase tracking-widest">Main Focus</Text>
                    </Badge>
                    {focusTask.priority === 'high' && (
                       <Badge variant="destructive" className="bg-destructive/20 border-destructive/20">
                          <Text className="text-destructive font-outfit-bold text-[10px] uppercase tracking-wider">Urgent</Text>
                       </Badge>
                    )}
                  </View>
                  
                  <Text className="font-outfit-bold text-3xl leading-9 mb-10 text-foreground tracking-tight">{focusTask.title}</Text>
                  
                  <View className="flex-row gap-3">
                    <Button 
                      variant="outline"
                      onPress={() => setShowFocusMode(true)}
                      className="flex-1 bg-white/5 border-white/10 h-14 rounded-2xl"
                    >
                      <View className="flex-row items-center gap-2">
                        <Icon as={TrophyIcon} className="size-4 text-muted-foreground" />
                        <Text className="text-muted-foreground font-outfit-semibold text-sm">Focus Mode</Text>
                      </View>
                    </Button>
                    
                    <Button 
                      onPress={() => handleCompleteTask(focusTask._id)}
                      disabled={completingTaskId === focusTask._id}
                      className="flex-1 bg-primary h-14 rounded-2xl shadow-lg shadow-primary/20"
                    >
                      {completingTaskId === focusTask._id ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <View className="flex-row items-center gap-2">
                          <Icon as={CheckCircle2Icon} className="size-4 text-white" />
                          <Text className="text-white font-outfit-semibold text-sm">Complete</Text>
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
            <Animated.View 
              entering={FadeInDown.springify()}
              className="mb-10"
            >
              <Card className="bg-primary/5 border-primary/10 rounded-[32px] backdrop-blur-xl border-dashed">
                <CardContent className="p-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-2">
                      <View className="bg-primary/20 p-2 rounded-xl">
                        <Icon as={SparklesIcon} className="size-4 text-primary" />
                      </View>
                      <Text className="text-primary font-outfit-bold text-[10px] uppercase tracking-widest">AI Strategist</Text>
                    </View>
                    <Pressable onPress={() => setAiSuggestion(null)} className="p-1 opacity-40">
                      <Icon as={CheckIcon} className="size-4 text-foreground" />
                    </Pressable>
                  </View>
                  <Text className="font-outfit text-foreground/80 leading-7 text-lg">{aiSuggestion}</Text>
                </CardContent>
              </Card>
            </Animated.View>
          )}

          {/* Upcoming List */}
          <View className="mb-12">
            <View className="flex-row items-center justify-between mb-6 px-1">
              <Text className="font-outfit-bold text-lg text-foreground tracking-tight">Upcoming Tasks</Text>
              <Text className="text-primary font-outfit-medium text-xs">See All</Text>
            </View>
            
            {tasks === undefined ? (
              <View className="p-4 items-center">
                 <ActivityIndicator color="#8B5CF6" />
              </View>
            ) : pendingTasks.length <= 1 && !focusTask ? (
              <View className="bg-white/5 border border-white/5 rounded-[32px] p-10 items-center justify-center border-dashed">
                 <Icon as={ZapIcon} className="size-8 text-muted-foreground/20 mb-3" />
                 <Text className="text-muted-foreground font-outfit text-center italic">Your schedule is clear.</Text>
              </View>
            ) : (
              pendingTasks.slice(focusTask ? 1 : 0).map((task, index) => (
                <Animated.View 
                  key={task._id}
                  entering={FadeInDown.delay(300 + index * 100).springify()}
                  exiting={FadeOutLeft}
                  layout={Layout.springify()}
                  className="flex-row items-center gap-4 mb-3 bg-card/30 p-4 rounded-3xl border border-white/5 active:bg-white/5"
                >
                  <Pressable 
                    onPress={() => handleCompleteTask(task._id)}
                    className="size-7 rounded-full border-2 border-primary/30 items-center justify-center active:bg-primary/20 active:border-primary"
                  >
                  </Pressable>
                  <View className="flex-1">
                    <Text className="font-outfit-medium text-lg text-foreground/90 leading-6">{task.title}</Text>
                    {task.priority === 'high' && (
                      <Badge variant="destructive" className="bg-destructive/10 border-none p-0 h-auto self-start mt-1">
                        <Text className="text-destructive font-outfit-bold text-[8px] uppercase tracking-wider">Urgent</Text>
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
              <Text className="font-outfit-bold text-sm mb-4 text-muted-foreground uppercase tracking-widest px-1">Completed</Text>
              {completedTasks.map((task, index) => (
                <Animated.View 
                  key={task._id}
                  entering={FadeInDown.delay(index * 50).springify()}
                  className="flex-row items-center gap-4 mb-2 p-2 opacity-30"
                >
                  <Icon as={CheckIcon} className="size-5 text-emerald-500" />
                  <Text className="font-outfit text-base line-through text-muted-foreground">{task.title}</Text>
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
