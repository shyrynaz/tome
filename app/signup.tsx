import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MailIcon, LockIcon, ArrowRightIcon, ChevronLeftIcon, SparklesIcon, UserIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function SignupScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-background flex-1"
    >
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
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-16 mb-10">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="bg-primary/20 p-2 rounded-xl border border-primary/20">
                <Icon as={SparklesIcon} className="text-primary size-5" />
              </View>
              <Text className="text-primary font-outfit-bold text-xs uppercase tracking-[3px]">Initiation</Text>
            </View>
            <Text className="font-outfit-bold text-5xl tracking-tighter text-foreground">
              {pendingVerification ? 'Verify Account' : 'Join the Tome'}
            </Text>
            <Text className="text-muted-foreground font-outfit text-lg mt-2 opacity-70">
              {pendingVerification 
                ? `Enter the code sent to ${emailAddress}` 
                : 'Start your journey into collective intelligence.'}
            </Text>
          </Animated.View>

          {/* Signup Card */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Card className="bg-card/40 border-white/10 rounded-[32px] backdrop-blur-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-8 gap-6">
                
                {!pendingVerification ? (
                  <>
                    {/* Name Field */}
                    <View className="gap-2">
                      <Label nativeID="name-label" className="ml-1 text-muted-foreground/60 text-xs uppercase tracking-widest">
                        Your Name
                      </Label>
                      <View className="relative">
                        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <Icon as={UserIcon} className="text-muted-foreground/40 size-5" />
                        </View>
                        <Input
                          placeholder="What should we call you?"
                          className="h-14 rounded-2xl bg-white/5 border-white/10 pl-12 text-lg font-outfit text-foreground"
                          value={firstName}
                          onChangeText={setFirstName}
                        />
                      </View>
                    </View>

                    {/* Email Field */}
                    <View className="gap-2">
                      <Label nativeID="email-label" className="ml-1 text-muted-foreground/60 text-xs uppercase tracking-widest">
                        Email Address
                      </Label>
                      <View className="relative">
                        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <Icon as={MailIcon} className="text-muted-foreground/40 size-5" />
                        </View>
                        <Input
                          autoCapitalize="none"
                          placeholder="you@example.com"
                          className="h-14 rounded-2xl bg-white/5 border-white/10 pl-12 text-lg font-outfit text-foreground"
                          value={emailAddress}
                          onChangeText={setEmailAddress}
                          keyboardType="email-address"
                        />
                      </View>
                    </View>

                    {/* Password Field */}
                    <View className="gap-2">
                      <Label nativeID="password-label" className="ml-1 text-muted-foreground/60 text-xs uppercase tracking-widest">
                        Password
                      </Label>
                      <View className="relative">
                        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                          <Icon as={LockIcon} className="text-muted-foreground/40 size-5" />
                        </View>
                        <Input
                          placeholder="Create a strong password"
                          secureTextEntry
                          className="h-14 rounded-2xl bg-white/5 border-white/10 pl-12 text-lg font-outfit text-foreground"
                          value={password}
                          onChangeText={setPassword}
                        />
                      </View>
                    </View>
                  </>
                ) : (
                  <View className="gap-2">
                    <Label nativeID="code-label" className="ml-1 text-muted-foreground/60 text-xs uppercase tracking-widest">
                      Verification Code
                    </Label>
                    <Input
                      placeholder="123456"
                      className="h-16 rounded-2xl bg-white/5 border-white/10 text-center text-3xl font-outfit-bold text-primary tracking-[10px]"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                    />
                  </View>
                )}

                {error ? (
                  <Animated.View entering={FadeInDown} className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                    <Text className="font-outfit text-center text-sm text-destructive">{error}</Text>
                  </Animated.View>
                ) : null}

                <Button
                  onPress={pendingVerification ? onPressVerify : onSignUpPress}
                  disabled={isLoading}
                  size="lg"
                  className="mt-2 h-16 rounded-2xl bg-primary shadow-xl shadow-primary/25"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Text className="font-outfit-bold text-lg text-white">
                        {pendingVerification ? 'Verify & Continue' : 'Create Account'}
                      </Text>
                      <Icon as={ArrowRightIcon} className="size-5 text-white" />
                    </View>
                  )}
                </Button>

                <TouchableOpacity 
                  onPress={() => router.replace('/signin')} 
                  className="mt-2 active:opacity-60"
                >
                  <Text className="font-outfit text-muted-foreground text-center">
                    Already a member?{' '}
                    <Text className="font-outfit-bold text-primary">Log in</Text>
                  </Text>
                </TouchableOpacity>

              </CardContent>
            </Card>
          </Animated.View>

          {/* Footer Quote */}
          <Animated.View 
            entering={FadeInDown.delay(500).springify()}
            className="mt-12 mb-8 opacity-30"
          >
            <Text className="text-center font-outfit-medium text-xs text-muted-foreground italic px-10">
              "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
