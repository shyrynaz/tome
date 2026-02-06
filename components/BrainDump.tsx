import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Platform, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  FadeIn,
  FadeOut,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  ZoomIn
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
  CheckIcon
} from 'lucide-react-native';
import { intentParser, Intent } from '@/lib/ai/intent-parser';
import * as Haptics from 'expo-haptics';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { modelManager } from '@/lib/ai/model-manager';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { Badge } from '@/components/ui/badge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function BrainDump() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [intent, setIntent] = useState<Intent>('UNKNOWN');
  const [cleanedText, setCleanedText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [aiStatus, setAiStatus] = useState<'LOCAL' | 'FALLBACK'>('FALLBACK');
  const inputRef = useRef<TextInput>(null);

  const captureThought = useMutation(api.brainDump.capture);
  const summarizeUrl = useAction(api.scraper.summarizeUrl);

  // Animation values
  const glowOpacity = useSharedValue(0);
  const mainScale = useSharedValue(1);
  const backgroundShift = useSharedValue(0);

  useEffect(() => {
    // Background pulse effect
    backgroundShift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 }),
        withTiming(0, { duration: 4000 })
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
    mainScale.value = withSequence(withSpring(0.95), withSpring(1));
    
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
      
      // Trigger success feedback loop
      setShowSuccess(true);
      setText('');
      setIntent('UNKNOWN');
      setCleanedText('');
      glowOpacity.value = withTiming(0);

      // Reset success message after delay
      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);

    } catch (error) {
      console.error("Failed to capture thought:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mainScale.value }],
  }));

  const bgAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(backgroundShift.value, [0, 1], [-20, 20]);
    return {
      transform: [{ translateY }],
    };
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      className="flex-1"
    >
      {/* Dynamic Background */}
      <View className="absolute inset-0 overflow-hidden">
        <Animated.View style={[bgAnimatedStyle, { position: 'absolute', inset: -50 }]}>
          <LinearGradient
            colors={
              intent === 'TASK' ? ['#1a1005', '#0F0F16'] :
              intent === 'EVENT' ? ['#05101a', '#0F0F16'] :
              ['#1a103d', '#0F0F16']
            }
            className="flex-1"
          />
        </Animated.View>
        
        {/* Glow Orbs */}
        <Animated.View 
          className="absolute top-1/4 -left-20 w-80 h-80 rounded-full blur-[100px]"
          style={{ 
            backgroundColor: intent === 'TASK' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)',
            opacity: glowOpacity 
          }} 
        />
      </View>

      <SafeAreaView className="flex-1 px-6">
        <View className="flex-1 justify-center">
          
          {/* Success Overlay */}
          {showSuccess && (
            <Animated.View 
              entering={FadeIn.duration(400)} 
              exiting={FadeOut.duration(400)}
              className="absolute inset-0 z-50 items-center justify-center"
            >
              <Animated.View 
                entering={ZoomIn.springify()}
                className="bg-emerald-500/20 border border-emerald-500/30 p-8 rounded-[40px] items-center backdrop-blur-3xl"
              >
                <View className="bg-emerald-500 p-4 rounded-full mb-4 shadow-lg shadow-emerald-500/50">
                  <Icon as={CheckIcon} className="text-white size-8" strokeWidth={3} />
                </View>
                <Text className="text-white font-outfit-bold text-2xl tracking-tight">Captured to Tome</Text>
                <Text className="text-emerald-400 font-outfit text-sm uppercase tracking-[3px] mt-2">Neural sync complete</Text>
              </Animated.View>
            </Animated.View>
          )}

          {/* The Monolith */}
          <Animated.View 
            entering={FadeInUp.springify()}
            style={animatedContainerStyle}
            className="relative"
          >
            {/* Main Card */}
            <View className="bg-card/40 border-white/10 rounded-[40px] border backdrop-blur-[40px] shadow-2xl overflow-hidden">
              <View className="p-8">
                
                {/* Intent Badge Reveal */}
                <View className="flex-row items-center justify-between mb-6 h-8">
                  {badge ? (
                    <Animated.View entering={FadeInDown.springify()}>
                      <Badge variant="outline" className={`${badge.bg} border-transparent py-1.5 px-4`}>
                        <Icon as={badge.icon} className={`size-3.5 mr-2 ${badge.color}`} />
                        <Text className={`${badge.color} font-outfit-bold text-[10px] uppercase tracking-widest`}>
                          {badge.label}
                        </Text>
                      </Badge>
                    </Animated.View>
                  ) : (
                    <View className="flex-row items-center gap-2 opacity-40">
                      <Icon as={BrainIcon} className="text-white/50 size-4" />
                      <Text className="text-white/50 font-outfit-medium text-[10px] uppercase tracking-widest">Awaiting Input</Text>
                    </View>
                  )}

                  <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                    <View className={`size-1.5 rounded-full ${aiStatus === 'LOCAL' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-primary'}`} />
                    <Text className="font-outfit-bold text-[8px] text-white/40 uppercase tracking-tighter">
                      {aiStatus === 'LOCAL' ? 'Neural Link active' : 'NLP Standard'}
                    </Text>
                  </View>
                </View>

                <TextInput
                  ref={inputRef}
                  multiline
                  placeholder="Unload your mind..."
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  className="font-outfit text-foreground min-h-[160px] text-3xl leading-[42px] tracking-tighter"
                  value={text}
                  onChangeText={handleTextChange}
                  autoFocus
                  editable={!isProcessing}
                  selectionColor="#8B5CF6"
                />

                {/* Action Bar */}
                <View className="flex-row items-center justify-between mt-8 pt-6 border-t border-white/5">
                  <View className="flex-row items-center gap-4">
                    <Pressable 
                      onPress={handlePasteLink}
                      className="size-12 items-center justify-center rounded-2xl bg-white/5 active:bg-white/10 active:scale-90 transition-all border border-white/5"
                    >
                      <Icon as={LinkIcon} className="text-white/60 size-5" />
                    </Pressable>
                    <Pressable 
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      className="size-12 items-center justify-center rounded-2xl bg-white/5 active:bg-white/10 active:scale-90 transition-all border border-white/5"
                    >
                      <Icon as={MicIcon} className="text-white/60 size-5" />
                    </Pressable>
                  </View>

                  <Pressable 
                    disabled={isProcessing || text.length === 0}
                    onPress={handleSubmit}
                    className={`size-16 items-center justify-center rounded-[24px] shadow-2xl transition-all ${
                      text.length > 0 ? 'bg-primary shadow-primary/40' : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Icon 
                        as={text.length > 0 ? SendIcon : SparklesIcon} 
                        className={`size-6 ${text.length > 0 ? 'text-white' : 'text-white/20'}`} 
                      />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Hint */}
            <Animated.View 
              entering={FadeInDown.delay(1000)}
              className="mt-8 items-center opacity-30"
            >
              <Text className="text-white text-[10px] font-outfit-medium uppercase tracking-[4px]">
                Tap <Text className="font-outfit-bold">Send</Text> to archive to your Tome
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
