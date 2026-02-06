import { api } from '@/convex/_generated/api';
import { intentParser } from '@/lib/ai/intent-parser';
import { useAction, useMutation } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useShareIntent } from 'expo-share-intent';
import { CheckCircle2Icon, FileTextIcon, LinkIcon, SparklesIcon, XIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

export function ShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const captureThought = useMutation(api.brainDump.capture);
  const summarizeUrl = useAction(api.scraper.summarizeUrl);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Only log errors that aren't the transient App Group nil error
    if (error && !error.includes('appGroupIdentifier is nil')) {
      console.error('Share Intent Error:', error);
    }
  }, [error]);

  // Prevent processing while the app is in the background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && hasShareIntent) {
        // App became active and has a pending intent
      }
    });

    return () => {
      subscription.remove();
    };
  }, [hasShareIntent]);

  const handleCapture = async () => {
    if (!shareIntent.value) return;

    setIsProcessing(true);
    try {
      const content = shareIntent.value;
      const result = await intentParser.parse(content);

      let summary = undefined;
      if (shareIntent.type === 'weburl') {
        summary = await summarizeUrl({ url: content });
      }

      await captureThought({
        content: content,
        intent: result.intent,
        cleanedText: result.cleanedText,
        priority: result.priority,
        summary: summary,
      });

      setIsSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Auto-dismiss after 2 seconds
      setTimeout(() => {
        handleDismiss();
      }, 2000);
    } catch (err) {
      console.error('Capture shared content failed:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    resetShareIntent();
    setIsSuccess(false);
    setIsProcessing(false);
  };

  if (!hasShareIntent) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" className="z-50 justify-end p-6">
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} className="bg-black/40" />

      <Animated.View
        entering={SlideInDown.springify()}
        exiting={SlideOutDown.springify()}
        className="bg-background border-border/50 overflow-hidden rounded-3xl border shadow-2xl">
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
          className="absolute inset-0"
        />

        <View className="p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-xl bg-indigo-500/20 p-2">
                <Icon as={SparklesIcon} className="size-5 text-indigo-400" />
              </View>
              <Text className="font-outfit-bold text-xl">Capture to Tome</Text>
            </View>
            <TouchableOpacity onPress={handleDismiss} className="p-2">
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </TouchableOpacity>
          </View>

          <View className="mb-6 rounded-2xl border border-white/5 bg-white/5 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon
                as={shareIntent.type === 'weburl' ? LinkIcon : FileTextIcon}
                className="text-muted-foreground size-3"
              />
              <Text className="text-muted-foreground font-outfit-medium text-[10px] tracking-widest uppercase">
                {shareIntent.type === 'weburl' ? 'Shared Link' : 'Shared Text'}
              </Text>
            </View>
            <Text className="font-outfit text-base leading-6" numberOfLines={3}>
              {shareIntent.value}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCapture}
            disabled={isProcessing || isSuccess}
            className={`h-14 flex-row items-center justify-center rounded-2xl ${isSuccess ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : isSuccess ? (
              <>
                <Icon as={CheckCircle2Icon} className="mr-2 size-5 text-white" />
                <Text className="font-outfit-semibold text-lg text-white">Added to Tome</Text>
              </>
            ) : (
              <Text className="font-outfit-semibold text-lg text-white">Capture Thought</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
