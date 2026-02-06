import { View, SafeAreaView, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUniwind } from 'uniwind';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2Icon, CircleIcon, SparklesIcon, TrophyIcon, BrainCircuitIcon, CheckIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Id } from '@/convex/_generated/dataModel';
import { FocusMode } from '@/components/FocusMode';

export default function DailyPlanScreen() {
  const { theme } = useUniwind();
  const tasks = useQuery(api.tasks.list);
  const generatePlan = useAction(api.planner.generateDailyPlan);
  const updateTaskStatus = useMutation(api.tasks.updateStatus);
  
  const [isPlanning, setIsPlanning] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [showFocusMode, setShowFocusMode] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
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

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.08)', 'transparent', 'transparent']}
        className="absolute inset-0"
      />
      
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-muted-foreground font-outfit-medium text-sm uppercase tracking-widest">{today}</Text>
              <Text className="font-outfit-bold text-4xl tracking-tighter mt-1">Today's Plan</Text>
            </View>
            <Pressable 
              onPress={handleGeneratePlan}
              disabled={isPlanning}
              className={`h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/20 ${isPlanning ? 'opacity-50' : ''}`}
            >
              {isPlanning ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Icon as={BrainCircuitIcon} className="text-white size-6" />
              )}
            </Pressable>
          </View>

          {/* AI Suggestion Area */}
          {aiSuggestion && (
            <Animated.View 
              entering={FadeInDown.springify()}
              className="mb-8 bg-purple-500/10 border border-purple-500/20 p-5 rounded-3xl"
            >
              <View className="flex-row items-center gap-2 mb-3">
                <Icon as={SparklesIcon} className="size-4 text-purple-400" />
                <Text className="text-purple-400 font-outfit-semibold text-xs uppercase tracking-wider">AI Strategist</Text>
              </View>
              <Text className="font-outfit text-foreground/90 leading-6">{aiSuggestion}</Text>
              <Pressable 
                onPress={() => setAiSuggestion(null)}
                className="mt-4 self-end"
              >
                <Text className="text-muted-foreground font-outfit-medium text-xs">Dismiss</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Focus Section */}
          {focusTask ? (
            <Animated.View 
              entering={FadeInDown.delay(200).springify()}
              className="mb-10 bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl"
            >
              <View className="flex-row items-center gap-2 mb-3">
                <Icon as={TrophyIcon} className="size-4 text-indigo-400" />
                <Text className="text-indigo-400 font-outfit-semibold text-xs uppercase tracking-wider">Current Focus</Text>
              </View>
              <Text className="font-outfit-bold text-2xl leading-8 mb-4">{focusTask.title}</Text>
              <View className="flex-row gap-3">
                <Pressable 
                  onPress={() => setShowFocusMode(true)}
                  className="bg-white/10 self-start px-5 py-2.5 rounded-full flex-row items-center gap-2"
                >
                  <Icon as={TrophyIcon} className="size-4 text-indigo-400" />
                  <Text className="text-indigo-400 font-outfit-semibold text-sm">Focus</Text>
                </Pressable>
                <Pressable 
                  onPress={() => handleCompleteTask(focusTask._id)}
                  disabled={completingTaskId === focusTask._id}
                  className="bg-indigo-500 self-start px-5 py-2.5 rounded-full flex-row items-center gap-2"
                >
                  {completingTaskId === focusTask._id ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Icon as={CheckCircle2Icon} className="size-4 text-white" />
                      <Text className="text-white font-outfit-semibold text-sm">Complete</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </Animated.View>
          ) : (
             <Animated.View 
              entering={FadeInDown.delay(200).springify()}
              className="mb-10 bg-white/5 border border-white/10 p-8 rounded-3xl items-center justify-center border-dashed"
            >
              <Icon as={SparklesIcon} className="size-8 text-muted-foreground/30 mb-3" />
              <Text className="text-muted-foreground font-outfit text-center">No focus set for today.{"\n"}Capture some thoughts to get started.</Text>
            </Animated.View>
          )}

          {/* Tasks List */}
          <View className="mb-12">
            <Text className="font-outfit-bold text-xl mb-4">Upcoming</Text>
            {tasks === undefined ? (
              <Text className="text-muted-foreground italic">Loading your plan...</Text>
            ) : pendingTasks.length === 0 ? (
              <Text className="text-muted-foreground italic">All caught up!</Text>
            ) : (
              pendingTasks.slice(1).map((task, index) => (
                <Animated.View 
                  key={task._id}
                  entering={FadeInDown.delay(300 + index * 100).springify()}
                  exiting={FadeOutLeft}
                  className="flex-row items-center gap-4 mb-4 bg-white/5 p-4 rounded-2xl border border-white/5"
                >
                  <Pressable 
                    onPress={() => handleCompleteTask(task._id)}
                    className="active:scale-90"
                  >
                    <Icon as={CircleIcon} className="size-6 text-muted-foreground/50" />
                  </Pressable>
                  <View className="flex-1">
                    <Text className="font-outfit-medium text-lg">{task.title}</Text>
                    {task.priority === 'high' && (
                      <Text className="text-rose-400 font-outfit text-xs uppercase">High Priority</Text>
                    )}
                  </View>
                </Animated.View>
              ))
            )}
          </View>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <View className="mb-12">
              <Text className="font-outfit-bold text-xl mb-4 text-muted-foreground">Completed</Text>
              {completedTasks.map((task, index) => (
                <Animated.View 
                  key={task._id}
                  entering={FadeInDown.delay(index * 50).springify()}
                  className="flex-row items-center gap-4 mb-3 p-3 opacity-50"
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
