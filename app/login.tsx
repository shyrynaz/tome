import React, { useCallback } from 'react';
import { View, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { useOAuth } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/icon';
import { SparklesIcon, GithubIcon, MailIcon, ChromeIcon } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startGithubFlow } = useOAuth({ strategy: "oauth_github" });

  const [isLoading, setIsLoading] = React.useState(false);

  const onSelectAuth = useCallback(async (strategy: 'google' | 'github') => {
    setIsLoading(true);
    try {
      const startFlow = strategy === 'google' ? startGoogleFlow : startGithubFlow;
      
      const { createdSessionId, setActive } = await startFlow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'tome-app' }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error("OAuth error", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.15)', 'transparent']}
        className="absolute inset-0"
      />
      
      <SafeAreaView className="flex-1 justify-center px-8">
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          className="items-center mb-12"
        >
          <View className="bg-indigo-500 p-4 rounded-3xl mb-6 shadow-xl shadow-indigo-500/20">
            <Icon as={SparklesIcon} className="size-10 text-white" />
          </View>
          <Text className="font-outfit-bold text-5xl tracking-tighter text-center">Tome</Text>
          <Text className="text-muted-foreground font-outfit text-lg text-center mt-2 px-8">
            Your intelligence, organized.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} className="gap-4">
          <TouchableOpacity 
            onPress={() => router.push('/signin')}
            className="bg-foreground h-14 rounded-2xl flex-row items-center justify-center gap-3"
          >
            <Icon as={MailIcon} className="text-background size-5" />
            <Text className="text-background font-outfit-semibold text-lg">Sign in with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/signup')}
            className="bg-white/5 border border-white/10 h-14 rounded-2xl flex-row items-center justify-center gap-3"
          >
            <Text className="text-foreground font-outfit-semibold text-lg">Create new account</Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-white/10" />
            <Text className="px-4 text-muted-foreground font-outfit text-xs uppercase tracking-widest">Or</Text>
            <View className="flex-1 h-px bg-white/10" />
          </View>

          <TouchableOpacity 
            onPress={() => onSelectAuth('google')}
            disabled={isLoading}
            className="bg-white/5 border border-white/10 h-14 rounded-2xl flex-row items-center justify-center gap-3"
          >
             <Icon as={ChromeIcon} className="text-foreground size-5" />
             <Text className="text-foreground font-outfit-semibold text-lg">Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => onSelectAuth('github')}
            disabled={isLoading}
            className="bg-white/5 border border-white/10 h-14 rounded-2xl flex-row items-center justify-center gap-3"
          >
             <Icon as={GithubIcon} className="text-foreground size-5" />
             <Text className="text-foreground font-outfit-semibold text-lg">Continue with GitHub</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(600).springify()}
          className="mt-12 opacity-50"
        >
          <Text className="text-center font-outfit text-xs text-muted-foreground px-12">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
