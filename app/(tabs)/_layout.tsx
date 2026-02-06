import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { CalendarIcon, SparklesIcon, LibraryIcon } from 'lucide-react-native';
import { useUniwind } from 'uniwind';
import { NAV_THEME } from '@/lib/theme';

export default function TabsLayout() {
  const { theme } = useUniwind();
  const colors = NAV_THEME[theme ?? 'light'].colors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#0A0A0A' : '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme === 'dark' ? '#6366f1' : colors.primary,
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontFamily: 'Outfit_500Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Icon as={CalendarIcon} size={size} style={{ color }} />,
        }}
      />
      <Tabs.Screen
        name="brain-dump"
        options={{
          title: 'Capture',
          tabBarIcon: ({ color, size }) => <Icon as={SparklesIcon} size={size} style={{ color }} />,
        }}
      />
      <Tabs.Screen
        name="tome"
        options={{
          title: 'Tome',
          tabBarIcon: ({ color, size }) => <Icon as={LibraryIcon} size={size} style={{ color }} />,
        }}
      />
    </Tabs>
  );
}
