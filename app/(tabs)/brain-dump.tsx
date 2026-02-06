import { BrainDump } from '@/components/BrainDump';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { SettingsIcon, UserIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, SafeAreaView } from 'react-native';
import { useUniwind } from 'uniwind';
import { LinearGradient } from 'expo-linear-gradient';

export default function BrainDumpScreen() {
  const { theme } = useUniwind();

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(79, 70, 229, 0.05)', 'transparent', 'transparent']}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4">
          <View>
            <Text className="font-outfit-bold text-2xl tracking-tight">Capture</Text>
            <Text className="text-muted-foreground font-outfit text-sm">Clear your mind</Text>
          </View>
        </View>

        <View className="flex-1 px-4 py-8">
           <View className="items-center justify-center">
              <Text className="font-outfit-medium text-muted-foreground/40 text-center text-lg italic">
                "Your mind is for having ideas, not holding them."
              </Text>
           </View>
        </View>

        <BrainDump />
      </SafeAreaView>
    </View>
  );
}
