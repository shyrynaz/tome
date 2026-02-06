import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator } from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeOutUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
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
  LinkIcon
} from 'lucide-react-native';
import { AIBorderGlow } from './AIBorderGlow';
import { intentParser, Intent } from '@/lib/ai/intent-parser';
import * as Haptics from 'expo-haptics';
import { useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { modelManager } from '@/lib/ai/model-manager';
import * as Clipboard from 'expo-clipboard';

export function BrainDump() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [intent, setIntent] = useState<Intent>('UNKNOWN');
  const [cleanedText, setCleanedText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [aiStatus, setAiStatus] = useState<'LOCAL' | 'FALLBACK'>('FALLBACK');
  const inputRef = useRef<TextInput>(null);

  const captureThought = useMutation(api.brainDump.capture);
  const summarizeUrl = useAction(api.scraper.summarizeUrl);

  useEffect(() => {
    // Check AI status and update UI
    const checkStatus = () => {
      setAiStatus(modelManager.status);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const scale = useSharedValue(1);

  const handleTextChange = async (val: string) => {
    setText(val);
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
      setText('');
      setIntent('UNKNOWN');
      setCleanedText('');
    } catch (error) {
      console.error("Failed to capture thought:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const onFocus = () => {
    scale.value = withSpring(1.02);
  };

  const onBlur = () => {
    scale.value = withSpring(1);
  };

  const getBadgeConfig = (intent: Intent) => {
    switch (intent) {
      case 'TASK':
        return { label: 'Task', icon: CheckCircle2Icon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' };
      case 'EVENT':
        return { label: 'Event', icon: CalendarIcon, color: 'text-amber-400', bg: 'bg-amber-400/10' };
      case 'NOTE':
        return { label: 'Note', icon: FileTextIcon, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
      default:
        return null;
    }
  };

  const badge = getBadgeConfig(intent);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 justify-end p-6"
    >
      <Animated.View 
        entering={FadeInDown.delay(200).springify()}
        style={animatedInputStyle}
        className="relative mb-8"
      >
        <AIBorderGlow active={text.length > 0} />
        
        <View className="bg-card border-white/10 overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl shadow-black/50">
          <View className="flex-row items-center p-4">
            <View className="flex-1">
              <TextInput
                ref={inputRef}
                multiline
                placeholder="What's on your mind?"
                placeholderTextColor="#666"
                className="font-outfit text-foreground min-h-[100px] text-lg leading-7 tracking-tight"
                value={text}
                onChangeText={handleTextChange}
                onFocus={onFocus}
                onBlur={onBlur}
                autoFocus
                editable={!isProcessing}
              />
            </View>
          </View>

          <View className="border-white/5 flex-row items-center justify-between border-t bg-white/[0.02] p-3">
            <View className="flex-row items-center gap-2">
              <Pressable 
                onPress={() => {/* Voice placeholder */}}
                className="active:scale-95 h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
              >
                <Icon as={MicIcon} className="text-muted-foreground size-5" />
              </Pressable>

              <Pressable 
                onPress={handlePasteLink}
                className="active:scale-95 h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
              >
                <Icon as={LinkIcon} className="text-muted-foreground size-5" />
              </Pressable>
              
              <View className="h-4 w-px bg-white/10 mx-1" />

              <View className="flex-row items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                <View className={`size-1.5 rounded-full ${aiStatus === 'LOCAL' ? 'bg-emerald-500' : 'bg-primary'}`} />
                <Text className="font-outfit text-[10px] text-muted-foreground uppercase tracking-tighter">
                  {aiStatus === 'LOCAL' ? 'On-Device AI' : 'Local NLP'}
                </Text>
              </View>
              
              {badge && (
                <View className="flex-row items-center gap-2">
                  <Animated.View 
                    entering={FadeInDown.springify()}
                    className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${badge.bg}`}
                  >
                    <Icon as={badge.icon} className={`size-3.5 ${badge.color}`} />
                    <Text className={`font-outfit-medium text-xs ${badge.color}`}>
                      {badge.label}
                    </Text>
                  </Animated.View>
                  
                  {priority === 'high' && (
                    <Animated.View 
                      entering={FadeInDown.delay(100).springify()}
                      className="bg-destructive/10 px-2 py-1 rounded-md"
                    >
                      <Text className="text-destructive font-outfit-bold text-[10px] uppercase">Urgent</Text>
                    </Animated.View>
                  )}
                </View>
              )}
            </View>

            <Pressable 
              disabled={isProcessing || text.length === 0}
              className={`h-10 w-10 items-center justify-center rounded-full transition-colors ${text.length > 0 ? 'bg-primary shadow-lg shadow-indigo-500/20' : 'bg-white/5'}`}
              onPress={handleSubmit}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Icon 
                  as={text.length > 0 ? SendIcon : SparklesIcon} 
                  className={`size-5 ${text.length > 0 ? 'text-white' : 'text-muted-foreground'}`} 
                />
              )}
            </Pressable>
          </View>
        </View>
        
        <Animated.View className="mt-4 flex-row justify-center opacity-40">
           <Text className="font-outfit text-xs text-muted-foreground">
             Press <Text className="font-outfit-bold">Send</Text> to capture to your Tome
           </Text>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
