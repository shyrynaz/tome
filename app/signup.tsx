import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ArrowRightIcon, ChevronLeftIcon, SparklesIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

export default function EmailSignupScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle the initial sign up
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send the email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setPendingVerification(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      // console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle the verification
  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log('Verification complete:', completeSignUp);

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(tabs)');
      } else {
        // console.error(JSON.stringify(completeSignUp, null, 2));
        setError('Verification failed. Check the code.');
      }
    } catch (err: any) {
      // console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="bg-background flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="px-8 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-8 h-10 w-10 items-center justify-center rounded-full bg-white/5">
              <Icon as={ChevronLeftIcon} className="text-foreground size-6" />
            </TouchableOpacity>

            {!pendingVerification ? (
              <Animated.View entering={FadeInDown.springify()}>
                <Text className="font-outfit-bold mb-2 text-4xl tracking-tighter">
                  Create Account
                </Text>
                <Text className="text-muted-foreground font-outfit mb-8 text-lg">
                  Start organizing your thoughts.
                </Text>

                <View className="gap-6">
                  <View>
                    <Text className="font-outfit-medium text-muted-foreground mb-2 ml-1 text-sm">
                      Email Address
                    </Text>
                    <TextInput
                      autoCapitalize="none"
                      placeholder="you@example.com"
                      placeholderTextColor="#666"
                      className="font-outfit text-foreground h-14 rounded-2xl border border-white/10 bg-white/5 px-4 text-lg"
                      value={emailAddress}
                      onChangeText={setEmailAddress}
                      keyboardType="email-address"
                    />
                  </View>

                  <View>
                    <Text className="font-outfit-medium text-muted-foreground mb-2 ml-1 text-sm">
                      Password
                    </Text>
                    <TextInput
                      placeholder="Create a password"
                      placeholderTextColor="#666"
                      secureTextEntry
                      className="font-outfit text-foreground h-14 rounded-2xl border border-white/10 bg-white/5 px-4 text-lg"
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>

                  {error ? (
                    <Text className="font-outfit text-center text-sm text-rose-400">{error}</Text>
                  ) : null}

                  <TouchableOpacity
                    onPress={onSignUpPress}
                    disabled={isLoading}
                    className="mt-4 h-14 flex-row items-center justify-center rounded-2xl bg-indigo-500">
                    <Text className="font-outfit-semibold mr-2 text-lg text-white">Continue</Text>
                    <Icon as={ArrowRightIcon} className="size-5 text-white" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.replace('/signin')} className="mt-4">
                    <Text className="font-outfit text-muted-foreground text-center">
                      Already have an account?{' '}
                      <Text className="font-outfit-bold text-indigo-400">Log In</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInRight.springify()}>
                <Text className="font-outfit-bold mb-2 text-4xl tracking-tighter">
                  Verify Email
                </Text>
                <Text className="text-muted-foreground font-outfit mb-8 text-lg">
                  We sent a code to {emailAddress}
                </Text>

                <View className="gap-6">
                  <View>
                    <Text className="font-outfit-medium text-muted-foreground mb-2 ml-1 text-sm">
                      Verification Code
                    </Text>
                    <TextInput
                      placeholder="123456"
                      placeholderTextColor="#666"
                      className="font-outfit text-foreground h-14 rounded-2xl border border-white/10 bg-white/5 px-4 text-center text-2xl tracking-[10px]"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                    />
                  </View>

                  {error ? (
                    <Text className="font-outfit text-center text-sm text-rose-400">{error}</Text>
                  ) : null}

                  <TouchableOpacity
                    onPress={onPressVerify}
                    disabled={isLoading}
                    className="mt-4 h-14 flex-row items-center justify-center rounded-2xl bg-indigo-500">
                    <Text className="font-outfit-semibold mr-2 text-lg text-white">
                      Verify Account
                    </Text>
                    <Icon as={SparklesIcon} className="size-5 text-white" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
