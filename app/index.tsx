import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';
import { storage } from '@/lib/storage';
import { useEffect, useState } from 'react';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = storage.getBoolean('hasSeenOnboarding');
    setHasSeenOnboarding(!!seen);
  }, []);

  if (!isLoaded || hasSeenOnboarding === null) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    );
  }

  // 1. If signed in, always go to the dashboard
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // 2. If not signed in and never seen onboarding, show it
  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // 3. Otherwise, go to login
  return <Redirect href="/login" />;
}
