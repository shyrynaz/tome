import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSignIn } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ArrowRightIcon, ChevronLeftIcon, LockIcon, MailIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SigninScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError('');

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      console.log('completeSignIn', completeSignIn.status);

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

            <Animated.View entering={FadeInDown.springify()}>
              <Text className="font-outfit-bold mb-2 text-4xl tracking-tighter">Welcome Back</Text>
              <Text className="text-muted-foreground font-outfit mb-8 text-lg">
                Log in to your Tome.
              </Text>

              <View className="gap-6">
                <View>
                  <Text className="font-outfit-medium text-muted-foreground mb-2 ml-1 text-sm">
                    Email Address
                  </Text>
                  <View className="relative">
                    <TextInput
                      autoCapitalize="none"
                      placeholder="you@example.com"
                      placeholderTextColor="#666"
                      className="font-outfit text-foreground h-14 rounded-2xl border border-white/10 bg-white/5 px-4 pl-12 text-lg"
                      value={emailAddress}
                      onChangeText={setEmailAddress}
                      keyboardType="email-address"
                    />
                    <Icon
                      as={MailIcon}
                      className="text-muted-foreground absolute top-4.5 left-4 size-5"
                    />
                  </View>
                </View>

                <View>
                  <Text className="font-outfit-medium text-muted-foreground mb-2 ml-1 text-sm">
                    Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor="#666"
                      secureTextEntry
                      className="font-outfit text-foreground h-14 rounded-2xl border border-white/10 bg-white/5 px-4 pl-12 text-lg"
                      value={password}
                      onChangeText={setPassword}
                    />
                    <Icon
                      as={LockIcon}
                      className="text-muted-foreground absolute top-4.5 left-4 size-5"
                    />
                  </View>
                </View>

                {error ? (
                  <Text className="font-outfit text-center text-sm text-rose-400">{error}</Text>
                ) : null}

                <TouchableOpacity
                  onPress={onSignInPress}
                  disabled={isLoading}
                  className="mt-4 h-14 flex-row items-center justify-center rounded-2xl bg-indigo-500">
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text className="font-outfit-semibold mr-2 text-lg text-white">Log In</Text>
                      <Icon as={ArrowRightIcon} className="size-5 text-white" />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace('/signup')} className="mt-4">
                  <Text className="font-outfit text-muted-foreground text-center">
                    Don't have an account?{' '}
                    <Text className="font-outfit-bold text-indigo-400">Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
