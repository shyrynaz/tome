import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { useShareIntent } from 'expo-share-intent';
import { CheckCircle2Icon, LinkIcon, XIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Icon } from './ui/icon';
import { Text } from './ui/text';

export function ShareHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();
  const createEntry = useMutation(api.entries.create);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (error && !error.includes('appGroupIdentifier is nil')) {
      console.error('Share Intent Error:', error);
    }
  }, [error]);

  const handleCapture = async () => {
    const content = shareIntent.text || shareIntent.webUrl || '';
    if (!content) return;

    setIsProcessing(true);
    try {
      await createEntry({
        content: shareIntent.type === 'weburl' ? (shareIntent.webUrl ?? content) : content,
        type: shareIntent.type === 'weburl' ? 'bookmark' : 'note',
        url: shareIntent.type === 'weburl' ? (shareIntent.webUrl ?? undefined) : undefined,
      });

      setIsSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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

  const displayContent = shareIntent.text || shareIntent.webUrl || '';
  const isUrl = shareIntent.type === 'weburl';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" className="z-50 justify-end p-6">
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} className="bg-black/40" />

      <Animated.View
        entering={SlideInDown.springify()}
        exiting={SlideOutDown.springify()}
        className="bg-background border-border/50 overflow-hidden rounded-3xl border shadow-2xl">
        <View className="p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="bg-primary/20 rounded-xl p-2">
                <Icon as={LinkIcon} className="text-primary size-5" />
              </View>
              <Text className="font-outfit-bold text-xl">Capture to Tome</Text>
            </View>
            <TouchableOpacity onPress={handleDismiss} className="p-2">
              <Icon as={XIcon} className="text-muted-foreground size-5" />
            </TouchableOpacity>
          </View>

          <View className="mb-6 rounded-2xl border border-white/5 bg-white/5 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Icon as={isUrl ? LinkIcon : LinkIcon} className="text-muted-foreground size-3" />
              <Text className="text-muted-foreground font-outfit-medium text-[10px] tracking-widest uppercase">
                {isUrl ? 'Shared Link' : 'Shared Text'}
              </Text>
            </View>
            <Text className="font-outfit text-base leading-6" numberOfLines={3}>
              {displayContent}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCapture}
            disabled={isProcessing || isSuccess}
            className={`h-14 flex-row items-center justify-center rounded-2xl ${isSuccess ? 'bg-emerald-500' : 'bg-primary'}`}>
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
