import React, { useState } from 'react';
import { View, Dimensions, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { ArrowRightIcon, SparklesIcon, FolderOpenIcon, BellIcon } from 'lucide-react-native';

const SLIDES = [
  {
    id: '1',
    title: 'Capture Instantly',
    description:
      'Text or links in seconds. No categories, no friction. Just type and save — like sending yourself a message.',
    icon: SparklesIcon,
    color: '#22c55e', // Green
    gradient: ['#052e16', '#14532d', 'transparent'],
  },
  {
    id: '2',
    title: 'Organize Automatically',
    description:
      'AI auto-tags everything. Create folders when you want structure. Search semantically across everything you know.',
    icon: FolderOpenIcon,
    color: '#f59e0b', // Amber
    gradient: ['#451a03', '#78350f', 'transparent'],
  },
  {
    id: '3',
    title: 'Never Forget',
    description:
      'Smart reminders surface what matters. Bookmarks with AI summaries. Your personal knowledge engine, always at hand.',
    icon: BellIcon,
    color: '#3b82f6', // Blue
    gradient: ['#172554', '#1e3a5f', 'transparent'],
  },
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
    <View className="bg-background flex-1">
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        className="flex-1">
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
            <View
              key={slide.id}
              style={{ width, height }}
              className="items-center justify-center p-8">
              {/* Background Gradient Orb */}
              <LinearGradient
                colors={slide.gradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="opacity-30"
              />

              <Animated.View style={animatedStyle} className="items-center">
                <View className="mb-10 rounded-[40px] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/50 backdrop-blur-3xl">
                  <Icon as={slide.icon} size={64} color={slide.color} />
                </View>

                <Text className="font-outfit-bold mb-4 text-center text-4xl leading-tight tracking-tight">
                  {slide.title}
                </Text>

                <Text className="font-outfit text-muted-foreground px-4 text-center text-lg leading-7">
                  {slide.description}
                </Text>
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>

      {/* Pagination & CTA */}
      <View className="absolute right-0 bottom-12 left-0 px-8">
        <View className="mb-8 flex-row justify-center gap-2">
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
          className="bg-primary shadow-primary/20 h-14 flex-row items-center justify-center gap-2 rounded-full shadow-lg">
          <Text className="font-outfit-bold text-lg text-white">Get Started</Text>
          <Icon as={ArrowRightIcon} className="size-5 text-white" />
        </Pressable>
      </View>
    </View>
  );
}
