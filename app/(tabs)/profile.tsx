import React from 'react';
import { View, SafeAreaView, ScrollView, Pressable, Image, Switch } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  LogOutIcon, 
  UserIcon, 
  SettingsIcon, 
  BellIcon, 
  MoonIcon, 
  ShieldIcon, 
  HelpCircleIcon, 
  ChevronRightIcon,
  SparklesIcon,
  ZapIcon
} from 'lucide-react-native';
import { useUniwind } from 'uniwind';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { theme } = useUniwind();

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await signOut();
  };

  const SettingsItem = ({ icon, label, value, type = 'arrow', color = 'text-muted-foreground' }) => (
    <Pressable className="flex-row items-center justify-between p-4 active:bg-white/5 rounded-2xl">
      <View className="flex-row items-center gap-3">
        <View className="bg-white/5 p-2 rounded-xl">
          <Icon as={icon} className={`size-5 ${color}`} />
        </View>
        <Text className="font-outfit text-foreground text-base">{label}</Text>
      </View>
      
      {type === 'arrow' && (
        <Icon as={ChevronRightIcon} className="size-5 text-muted-foreground/30" />
      )}
      {type === 'value' && (
         <Text className="font-outfit-medium text-muted-foreground">{value}</Text>
      )}
      {type === 'switch' && (
        <Switch 
          value={true} 
          trackColor={{ false: '#3f3f46', true: '#5b21b6' }}
          thumbColor="#fafafa"
        />
      )}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(76, 29, 149, 0.1)', 'transparent']}
        className="absolute inset-0"
        pointerEvents="none"
      />

      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          
          {/* Header & Avatar */}
          <Animated.View 
            entering={FadeInDown.springify()}
            className="items-center mb-10"
          >
            <View className="relative">
              <View className="size-24 rounded-full border-4 border-white/5 overflow-hidden shadow-2xl">
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} className="size-full" />
                ) : (
                  <View className="size-full bg-primary items-center justify-center">
                    <Text className="font-outfit-bold text-3xl text-white">
                      {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U'}
                    </Text>
                  </View>
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-emerald-500 size-6 rounded-full border-4 border-background" />
            </View>
            
            <Text className="font-outfit-bold text-2xl mt-4 text-foreground">
              {user?.fullName || 'Tome Traveler'}
            </Text>
            <Text className="font-outfit text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
            
            <View className="flex-row gap-2 mt-4">
              <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Text className="text-primary font-outfit-bold text-xs uppercase tracking-wider">Pro Plan</Text>
              </View>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View 
            entering={FadeInDown.delay(100).springify()}
            className="flex-row gap-4 mb-8"
          >
            <View className="flex-1 bg-card/40 border border-white/5 p-4 rounded-3xl backdrop-blur-md">
              <Icon as={SparklesIcon} className="size-6 text-purple-400 mb-2" />
              <Text className="font-outfit-bold text-2xl text-foreground">1,248</Text>
              <Text className="font-outfit text-xs text-muted-foreground uppercase tracking-wider">Thoughts</Text>
            </View>
            <View className="flex-1 bg-card/40 border border-white/5 p-4 rounded-3xl backdrop-blur-md">
              <Icon as={ZapIcon} className="size-6 text-amber-400 mb-2" />
              <Text className="font-outfit-bold text-2xl text-foreground">84%</Text>
              <Text className="font-outfit text-xs text-muted-foreground uppercase tracking-wider">Focus Score</Text>
            </View>
          </Animated.View>

          {/* Settings Section */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="bg-card/30 border border-white/5 rounded-3xl overflow-hidden mb-6"
          >
            <Text className="font-outfit-bold text-xs text-muted-foreground uppercase tracking-widest px-6 pt-6 mb-2">Preferences</Text>
            <SettingsItem icon={UserIcon} label="Account" />
            <SettingsItem icon={BellIcon} label="Notifications" type="switch" color="text-rose-400" />
            <SettingsItem icon={MoonIcon} label="Dark Mode" value="On" type="value" color="text-indigo-400" />
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(300).springify()}
            className="bg-card/30 border border-white/5 rounded-3xl overflow-hidden mb-8"
          >
            <Text className="font-outfit-bold text-xs text-muted-foreground uppercase tracking-widest px-6 pt-6 mb-2">Support</Text>
            <SettingsItem icon={ShieldIcon} label="Privacy Policy" color="text-emerald-400" />
            <SettingsItem icon={HelpCircleIcon} label="Help & Support" color="text-blue-400" />
            
            <Pressable 
              onPress={handleSignOut}
              className="flex-row items-center gap-3 p-4 active:bg-white/5"
            >
              <View className="bg-white/5 p-2 rounded-xl">
                <Icon as={LogOutIcon} className="size-5 text-destructive" />
              </View>
              <Text className="font-outfit-medium text-destructive text-base">Sign Out</Text>
            </Pressable>
          </Animated.View>
          
          <Text className="text-center font-outfit text-xs text-muted-foreground/30 mb-8">
            Tome v1.0.0 (Build 42)
          </Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
