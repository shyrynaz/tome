import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Platform, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { KeyboardAvoidingView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  FadeIn,
  FadeOut,
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence,
  withTiming,
  interpolate,
  ZoomIn,
  SlideInBottom
} from 'react-native-reanimated';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
import { 
  CalendarIcon, 
  CheckCircle2Icon, 
  FileTextIcon, 
  MicIcon, 
  SendIcon,
  SparklesIcon,
  LinkIcon,
  BrainIcon,
  CheckIcon,
  XIcon
} from 'lucide-react-native';
import { intentParser, Intent } from '@/lib/ai/intent-parser';
import * as Haptics from 'expo-haptics';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { modelManager } from '@/lib/ai/model-manager';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { Badge } from '@/components/ui/badge';

export function BrainDump() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [intent, setIntent] = useState<Intent>('UNKNOWN');
  const [cleanedText, setCleanedText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [aiStatus, setAiStatus] = useState<'LOCAL' | 'FALLBACK'>('FALLBACK');
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const captureThought = useMutation(api.brainDump.capture);
  const summarizeUrl = useAction(api.scraper.summarizeUrl);

  const glowOpacity = useSharedValue(0);
  const backgroundShift = useSharedValue(0);

  useEffect(() => {
    backgroundShift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000 }),
        withTiming(0, { duration: 8000 })
      ),
      -1,
      true
    );

    const checkStatus = () => setAiStatus(modelManager.status);
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTextChange = async (val: string) => {
    setText(val);
    glowOpacity.value = withTiming(val.length > 0 ? 1 : 0);
    
    if (val.length > 3) {
      const result = await intentParser.parse(val);
      setCleanedText(result.cleanedText);
      setPriority(result.priority);
      if (result.intent !== intent) {
        setIntent(result.intent);
        if (result.intent !== 'UNKNOWN') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } else {
      setIntent('UNKNOWN');
      setCleanedText(val);
      setPriority('medium');
    }
  };

  const handlePasteLink = async () => {
    const content = await Clipboard.getStringAsync();
    const isUrl = content.startsWith('http');
    if (isUrl) {
      handleTextChange(content);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSubmit = async () => {
    if (text.trim().length === 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      const isUrl = text.trim().startsWith('http');
      let summary = undefined;

      if (isUrl) {
        summary = await summarizeUrl({ url: text.trim() });
      }

      await captureThought({
        content: text,
        intent: isUrl ? 'NOTE' : intent,
        cleanedText: cleanedText || text,
        priority: priority,
        summary: summary,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      setText('');
      setIntent('UNKNOWN');
      setCleanedText('');
      glowOpacity.value = withTiming(0);

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("Failed to capture thought:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const bgAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(backgroundShift.value, [0, 1], [-50, 50]);
    return { transform: [{ translateY }] };
  });

  const getBadgeConfig = (intent: Intent) => {
    switch (intent) {
      case 'TASK':
        return { label: 'Task', icon: CheckCircle2Icon, color: 'text-amber-400', bg: 'bg-amber-400/10' };
      case 'EVENT':
        return { label: 'Event', icon: CalendarIcon, color: 'text-blue-400', bg: 'bg-blue-400/10' };
      case 'NOTE':
        return { label: 'Note', icon: FileTextIcon, color: 'text-primary', bg: 'bg-primary/10' };
      default:
        return null;
    }
  };

  const badge = getBadgeConfig(intent);

  return (
    <View className="flex-1 bg-[#0F0F16]">
      {/* Immersive Atmospheric Background */}
      <View className="absolute inset-0 overflow-hidden">
        <Animated.View style={[bgAnimatedStyle, { position: 'absolute', inset: -150 }]}>
          <LinearGradient
            colors={
              intent === 'TASK' ? ['#1a1005', '#0F0F16'] :
              intent === 'EVENT' ? ['#05101a', '#0F0F16'] :
              ['#1a103d', '#0F0F16']
            }
            className="flex-1"
          />
        </Animated.View>
        
        {/* Glow Orb */}
        <Animated.View 
          className="absolute top-0 -left-20 w-full h-full rounded-full blur-[120px]"
          style={{ 
            backgroundColor: intent === 'TASK' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(139, 92, 246, 0.12)',
            opacity: glowOpacity 
          }} 
        />
      </View>

      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-8 pt-4">
          
          {/* Subtle Metadata Header */}
          <View className="flex-row items-center justify-between mb-12 opacity-40">
            <View className="flex-row items-center gap-2">
              <Icon as={BrainIcon} className="text-white size-4" />
              <Text className="text-white font-outfit-bold text-[10px] uppercase tracking-[3px]">Intake</Text>
            </View>
            <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
              <View className={`size-1 rounded-full ${aiStatus === 'LOCAL' ? 'bg-emerald-500' : 'bg-primary'}`} />
              <Text className="font-outfit-bold text-[8px] text-white/60 uppercase tracking-tighter">
                {aiStatus === 'LOCAL' ? 'Neural Link' : 'Processing'}
              </Text>
            </View>
          </View>

          {/* Immersive Quote */}
          {text.length === 0 && (
            <Animated.View entering={FadeIn.delay(400)} exiting={FadeOut} className="mb-8">
              <Text className="font-outfit-medium text-xl text-white/20 italic leading-8">
                "Your mind is for having ideas, not holding them."
              </Text>
            </Animated.View>
          )}

          {/* Core Input - Taking full height */}
          <View className="flex-1">
            <TextInput
              ref={inputRef}
              multiline
              placeholder="Start typing..."
              placeholderTextColor="rgba(255,255,255,0.1)"
              className="font-outfit text-foreground text-4xl leading-[56px] tracking-tight"
              value={text}
              onChangeText={handleTextChange}
              autoFocus
              editable={!isProcessing}
              selectionColor="#8B5CF6"
              textAlignVertical="top"
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Action Bar - Pinned to Keyboard */}
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View 
          className="bg-background/80 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex-row items-center justify-between"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="flex-row items-center gap-3">
            {badge ? (
              <Animated.View entering={ZoomIn.springify()} exiting={FadeOut}>
                <Badge className={`${badge.bg} border-transparent py-2 px-4 rounded-2xl`}>
                  <Icon as={badge.icon} className={`size-3.5 mr-2 ${badge.color}`} />
                  <Text className={`${badge.color} font-outfit-bold text-[10px] uppercase tracking-widest`}>
                    {badge.label}
                  </Text>
                </Badge>
              </Animated.View>
            ) : null}
            
            <Pressable 
              onPress={handlePasteLink}
              className="size-12 items-center justify-center rounded-2xl bg-white/5 active:bg-white/10"
            >
              <Icon as={LinkIcon} className="text-white/60 size-5" />
            </Pressable>
            <Pressable 
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              className="size-12 items-center justify-center rounded-2xl bg-white/5 active:bg-white/10"
            >
              <Icon as={MicIcon} className="text-white/60 size-5" />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-3">
            {text.length > 0 && (
              <Pressable 
                onPress={() => { setText(''); setIntent('UNKNOWN'); }}
                className="size-12 items-center justify-center rounded-2xl bg-white/5 active:bg-white/10"
              >
                <Icon as={XIcon} className="text-white/40 size-5" />
              </Pressable>
            )}
            <Pressable 
              disabled={isProcessing || text.length === 0}
              onPress={handleSubmit}
              className={`size-14 items-center justify-center rounded-2xl shadow-2xl ${
                text.length > 0 ? 'bg-primary' : 'bg-white/5'
              }`}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Icon 
                  as={text.length > 0 ? SendIcon : SparklesIcon} 
                  className={`size-6 ${text.length > 0 ? 'text-white' : 'text-white/20'}`} 
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardStickyView>

      {/* Success Modal */}
      {showSuccess && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 z-50 items-center justify-center bg-background/95 backdrop-blur-3xl"
        >
          <Animated.View entering={ZoomIn.springify()} className="items-center">
            <View className="bg-emerald-500 p-6 rounded-full mb-6">
              <Icon as={CheckIcon} className="text-white size-12" strokeWidth={4} />
            </View>
            <Text className="text-white font-outfit-bold text-3xl">Archived</Text>
            <Text className="text-emerald-400 font-outfit-medium text-[10px] uppercase tracking-[4px] mt-3">Memory synchronized</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
