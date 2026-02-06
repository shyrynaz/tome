import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useShareIntent } from 'expo-share-intent';
import Animated, { 
  FadeInDown, 
  FadeOutDown, 
  SlideInBottom, 
  SlideOutBottom 
} from 'react-native-reanimated';
import { Text } from './ui/text';
import { Icon } from './ui/icon';
import { SparklesIcon, XIcon, CheckCircle2Icon, LinkIcon, FileTextIcon } from 'lucide-react-native';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { intentParser } from '@/lib/ai/intent-parser';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export function ShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const captureThought = useMutation(api.brainDump.capture);
  const summarizeUrl = useAction(api.scraper.summarizeUrl);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      console.error('Share Intent Error:', error);
    }
  }, [error]);

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
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" className="justify-end p-6 z-50">
      <Pressable 
        style={StyleSheet.absoluteFill} 
        onPress={handleDismiss}
        className="bg-black/40"
      />
      
      <Animated.View 
        entering={SlideInBottom.springify()}
        exiting={SlideOutBottom.springify()}
        className="bg-background border border-border/50 rounded-3xl overflow-hidden shadow-2xl"
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
          className="absolute inset-0"
        />
        
        <View className="p-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="bg-indigo-500/20 p-2 rounded-xl">
                <Icon as={SparklesIcon} className="text-indigo-400 size-5" />
              </View>
              <Text className="font-outfit-bold text-xl">Capture to Tome</Text>
            </View>
            <TouchableOpacity onPress={handleDismiss} className="p-2">
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </TouchableOpacity>
          </View>

          <View className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center gap-2 mb-2">
              <Icon 
                as={shareIntent.type === 'weburl' ? LinkIcon : FileTextIcon} 
                className="size-3 text-muted-foreground" 
              />
              <Text className="text-muted-foreground font-outfit-medium text-[10px] uppercase tracking-widest">
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
            className={`h-14 rounded-2xl flex-row items-center justify-center ${isSuccess ? 'bg-emerald-500' : 'bg-indigo-500'}`}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : isSuccess ? (
              <>
                <Icon as={CheckCircle2Icon} className="text-white size-5 mr-2" />
                <Text className="text-white font-outfit-semibold text-lg">Added to Tome</Text>
              </>
            ) : (
              <Text className="text-white font-outfit-semibold text-lg">Capture Thought</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

import { Pressable } from 'react-native';
