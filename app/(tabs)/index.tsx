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
              className="mb-8 bg-card/30 border border-white/5 p-6 rounded-[24px] backdrop-blur-md"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="bg-primary/20 p-2 rounded-xl">
                    <Icon as={SparklesIcon} className="size-4 text-primary" />
                  </View>
                  <Text className="text-primary font-outfit-bold text-xs uppercase tracking-widest">AI Strategist</Text>
                </View>
                <Pressable 
                  onPress={() => setAiSuggestion(null)}
                  className="bg-white/5 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-muted-foreground font-outfit-medium text-[10px] uppercase tracking-wider">Dismiss</Text>
                </Pressable>
              </View>
              <Text className="font-outfit text-foreground/90 leading-7 text-lg">{aiSuggestion}</Text>
            </Animated.View>
          )}

          {/* Focus Section */}
          {focusTask ? (
            <Animated.View 
              entering={FadeInDown.delay(200).springify()}
              className="mb-10"
            >
              {/* Focus Card Gradient Border */}
              <View className="p-[1px] rounded-[32px] overflow-hidden">
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.5)', 'rgba(245, 158, 11, 0.2)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <View className="bg-[#0F0F16]/90 p-6 rounded-[31px] backdrop-blur-xl">
                   {/* Ambient Glow */}
                   <View className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[60px] -mr-10 -mt-10 rounded-full" />
                   
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center gap-2">
                      <View className="bg-primary/10 p-2 rounded-full">
                        <Icon as={TrophyIcon} className="size-4 text-primary" />
                      </View>
                      <Text className="text-primary font-outfit-bold text-xs uppercase tracking-widest">Current Focus</Text>
                    </View>
                    {focusTask.priority === 'high' && (
                       <View className="bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
                          <Text className="text-destructive font-outfit-bold text-[10px] uppercase tracking-wider">Urgent</Text>
                       </View>
                    )}
                  </View>
                  
                  <Text className="font-outfit-bold text-3xl leading-9 mb-8 text-foreground tracking-tight">{focusTask.title}</Text>
                  
                  <View className="flex-row gap-3">
                    <Pressable 
                      onPress={() => setShowFocusMode(true)}
                      className="bg-white/5 active:bg-white/10 flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 border border-white/5"
                    >
                      <Icon as={TrophyIcon} className="size-4 text-muted-foreground" />
                      <Text className="text-muted-foreground font-outfit-semibold text-sm">Focus Mode</Text>
                    </Pressable>
                    
                    <Pressable 
                      onPress={() => handleCompleteTask(focusTask._id)}
                      disabled={completingTaskId === focusTask._id}
                      className="bg-primary active:bg-primary/90 flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/25"
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
                </View>
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
            <Text className="font-outfit-bold text-lg mb-6 text-muted-foreground uppercase tracking-widest px-1">Upcoming</Text>
            {tasks === undefined ? (
              <View className="p-4 items-center">
                 <ActivityIndicator color="#6366f1" />
              </View>
            ) : pendingTasks.length === 0 ? (
              <View className="p-8 items-center justify-center opacity-50">
                 <Text className="text-muted-foreground font-outfit italic">Your schedule is clear.</Text>
              </View>
            ) : (
              pendingTasks.slice(1).map((task, index) => (
                <Animated.View 
                  key={task._id}
                  entering={FadeInDown.delay(300 + index * 100).springify()}
                  exiting={FadeOutLeft}
                  className="flex-row items-center gap-4 mb-3 bg-card/50 p-4 rounded-2xl border border-white/5 active:bg-white/5"
                >
                  <Pressable 
                    onPress={() => handleCompleteTask(task._id)}
                    className="size-6 rounded-full border-2 border-muted-foreground/30 items-center justify-center active:bg-primary/20 active:border-primary"
                  >
                  </Pressable>
                  <View className="flex-1">
                    <Text className="font-outfit-medium text-lg text-foreground/90 leading-6">{task.title}</Text>
                    {task.priority === 'high' && (
                      <Text className="text-destructive font-outfit text-[10px] uppercase tracking-wider mt-1">Urgent</Text>
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
