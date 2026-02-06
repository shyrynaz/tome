import React, { useCallback } from 'react';
import { View, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useOAuth } from '@clerk/clerk-expo';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/icon';
import { SparklesIcon, GithubIcon, MailIcon, ChromeIcon, ArrowRightIcon } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
        redirectUrl: Linking.createURL('/(tabs)', { scheme: 'tome-app' }),
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
      
      {/* Atmosphere Background */}
      <View className="absolute inset-0 overflow-hidden">
        <LinearGradient
          colors={['#1a103d', '#0F0F16']}
          className="absolute inset-0"
        />
        {/* Ambient Glows */}
        <View className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full" />
        <View className="absolute top-1/2 -right-20 w-60 h-60 bg-secondary/10 blur-[80px] rounded-full" />
      </View>
      
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 justify-center">
          
          {/* Logo & Intro */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="items-center mb-16"
          >
            <View className="bg-primary p-5 rounded-[32px] mb-8 shadow-2xl shadow-primary/30">
              <Icon as={SparklesIcon} className="size-12 text-white" />
            </View>
            <Text className="font-outfit-bold text-6xl tracking-tighter text-center text-foreground">Tome</Text>
            <Text className="text-muted-foreground font-outfit text-xl text-center mt-3 px-6 opacity-70 leading-7">
              Your collective intelligence, organized.
            </Text>
          </Animated.View>

          {/* Auth Options Card */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Card className="bg-card/40 border-white/10 rounded-[40px] backdrop-blur-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-8 gap-4">
                
                <Button 
                  onPress={() => router.push('/signin')}
                  size="lg"
                  className="bg-primary h-16 rounded-2xl shadow-lg shadow-primary/20"
                >
                  <View className="flex-row items-center gap-3">
                    <Icon as={MailIcon} className="text-white size-5" />
                    <Text className="text-white font-outfit-bold text-lg">Continue with Email</Text>
                  </View>
                </Button>

                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-px bg-white/10" />
                  <Text className="px-4 text-muted-foreground font-outfit text-[10px] uppercase tracking-[3px] opacity-40">Or</Text>
                  <View className="flex-1 h-px bg-white/10" />
                </View>

                <View className="flex-row gap-4">
                  <TouchableOpacity 
                    onPress={() => onSelectAuth('google')}
                    disabled={isLoading}
                    className="flex-1 bg-white/5 border border-white/10 h-16 rounded-2xl items-center justify-center active:bg-white/10"
                  >
                    <Icon as={ChromeIcon} className="text-foreground size-6" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => onSelectAuth('github')}
                    disabled={isLoading}
                    className="flex-1 bg-white/5 border border-white/10 h-16 rounded-2xl items-center justify-center active:bg-white/10"
                  >
                    <Icon as={GithubIcon} className="text-foreground size-6" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={() => router.push('/signup')} 
                  className="mt-6 active:opacity-60"
                >
                  <Text className="font-outfit text-muted-foreground text-center">
                    New here? <Text className="font-outfit-bold text-primary">Create an account</Text>
                  </Text>
                </TouchableOpacity>

              </CardContent>
            </Card>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(600).springify()}
            className="mt-16 opacity-30"
          >
            <Text className="text-center font-outfit text-[10px] text-muted-foreground px-12 uppercase tracking-widest leading-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
