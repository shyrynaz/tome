import React, { useState } from 'react';
import { View, Dimensions, Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler, 
  interpolate, 
  Extrapolation
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { ArrowRightIcon, BrainCircuitIcon, SparklesIcon, LibraryIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { storage } from '@/lib/storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Capture Instantly',
    description: 'Offload your thoughts in milliseconds. Our AI parses tasks, events, and ideas automatically.',
    icon: SparklesIcon,
    color: '#8B5CF6', // Primary Purple
    gradient: ['#4c1d95', '#5b21b6', 'transparent'],
  },
  {
    id: '2',
    title: 'Plan Intelligently',
    description: 'Turn chaos into clarity. Let the AI Strategist organize your day based on your energy and priorities.',
    icon: BrainCircuitIcon,
    color: '#F59E0B', // Amber
    gradient: ['#78350f', '#92400e', 'transparent'],
  },
  {
    id: '3',
    title: 'Recall Forever',
    description: "Your collective intelligence archive. Every thought you've ever had, searchable in an instant.",
    icon: LibraryIcon,
    color: '#0D9488', // Teal
    gradient: ['#134e4a', '#115e59', 'transparent'],
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    storage.set('hasSeenOnboarding', true);
    router.replace('/signin');
  };

  const handleScrollEnd = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  return (
    <View className="flex-1 bg-background">
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(
              scrollX.value,
              inputRange,
              [0.8, 1, 0.8],
              Extrapolation.CLAMP
            );
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.5, 1, 0.5],
              Extrapolation.CLAMP
            );
            return {
              transform: [{ scale }],
              opacity,
            };
          });

          return (
            <View key={slide.id} style={{ width, height }} className="items-center justify-center p-8">
              {/* Background Gradient Orb */}
              <LinearGradient
                colors={slide.gradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="opacity-30"
              />
              
              <Animated.View style={animatedStyle} className="items-center">
                <View className="bg-white/10 p-8 rounded-[40px] mb-10 backdrop-blur-3xl border border-white/10 shadow-2xl shadow-black/50">
                  <Icon as={slide.icon} size={64} color={slide.color} />
                </View>
                
                <Text className="font-outfit-bold text-4xl text-center mb-4 leading-tight tracking-tight">
                  {slide.title}
                </Text>
                
                <Text className="font-outfit text-muted-foreground text-center text-lg leading-7 px-4">
                  {slide.description}
                </Text>
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Pagination & CTA */}
      <View className="absolute bottom-12 left-0 right-0 px-8">
        <View className="flex-row justify-center gap-2 mb-8">
          {SLIDES.map((_, index) => {
            const animatedDotStyle = useAnimatedStyle(() => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
              const widthAnim = interpolate(
                scrollX.value,
                inputRange,
                [8, 32, 8],
                Extrapolation.CLAMP
              );
              const opacity = interpolate(
                scrollX.value,
                inputRange,
                [0.4, 1, 0.4],
                Extrapolation.CLAMP
              );
              return {
                width: widthAnim,
                opacity,
              };
            });

            return (
              <Animated.View 
                key={index} 
                style={[animatedDotStyle, { height: 8, borderRadius: 4, backgroundColor: 'white' }]}
              />
            );
          })}
        </View>

        <Pressable 
          onPress={handleContinue}
          className="bg-primary h-14 rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <Text className="font-outfit-bold text-white text-lg">Get Started</Text>
          <Icon as={ArrowRightIcon} className="text-white size-5" />
        </Pressable>
      </View>
    </View>
  );
}
