import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  interpolateColor,
  withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export const AIBorderGlow = ({ active }: { active: boolean }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    } else {
      progress.value = withTiming(0);
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ scale: 1 + progress.value * 0.02 }],
    };
  });

  return (
    <Animated.View 
      style={[
        StyleSheet.absoluteFill, 
        animatedStyle,
        { borderRadius: 16, overflow: 'hidden' }
      ]}
    >
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.5)', 'rgba(168, 85, 247, 0.5)', 'rgba(99, 102, 241, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};
