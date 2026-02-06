import React from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { CheckCircle2Icon, XIcon, TrophyIcon, SparklesIcon } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutDown,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

interface FocusModeProps {
  task: {
    _id: Id<"tasks">;
    title: string;
    priority?: string;
  };
  onClose: () => void;
  onComplete: () => void;
}

export function FocusMode({ task, onClose, onComplete }: FocusModeProps) {
  const updateTaskStatus = useMutation(api.tasks.updateStatus);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleComplete = async () => {
    setIsCompleting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await updateTaskStatus({ taskId: task._id, status: "done" });
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Animated.View 
      entering={FadeIn}
      exiting={FadeOut}
      className="absolute inset-0 z-50"
    >
      <LinearGradient
        colors={['#0f0f23', '#1a1a3e', '#0f0f23']}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center px-8">
          {/* Close Button */}
          <Pressable 
            onPress={onClose}
            className="absolute top-16 right-6 h-12 w-12 items-center justify-center rounded-full bg-white/5"
          >
            <Icon as={XIcon} className="text-white/50 size-6" />
          </Pressable>

          {/* Focus Badge */}
          <Animated.View 
            entering={SlideInUp.delay(200).springify()}
            className="flex-row items-center gap-2 mb-8"
          >
            <View className="bg-indigo-500/20 p-2 rounded-xl">
              <Icon as={TrophyIcon} className="text-indigo-400 size-5" />
            </View>
            <Text className="text-indigo-400 font-outfit-semibold text-sm uppercase tracking-widest">
              Current Focus
            </Text>
          </Animated.View>

          {/* Task Title */}
          <Animated.View style={pulseStyle}>
            <Text className="font-outfit-bold text-4xl text-center text-white leading-tight mb-12">
              {task.title}
            </Text>
          </Animated.View>

          {/* Motivational Quote */}
          <Animated.View 
            entering={FadeIn.delay(500)}
            className="mb-16 opacity-40"
          >
            <Text className="font-outfit-medium text-white/60 text-center italic text-lg">
              "One task at a time. This is your only priority."
            </Text>
          </Animated.View>

          {/* Complete Button */}
          <Animated.View entering={SlideInUp.delay(300).springify()}>
            <Pressable 
              onPress={handleComplete}
              disabled={isCompleting}
              className="bg-emerald-500 px-12 py-5 rounded-full flex-row items-center gap-3 shadow-2xl shadow-emerald-500/30"
            >
              <Icon as={CheckCircle2Icon} className="text-white size-6" />
              <Text className="text-white font-outfit-bold text-xl">
                {isCompleting ? 'Completing...' : 'Mark Complete'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
