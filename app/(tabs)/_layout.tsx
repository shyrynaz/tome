import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { HomeIcon, FolderIcon, PlusIcon, BookmarkIcon, SearchIcon } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f0f',
          borderTopColor: '#2a2a2a',
          borderTopWidth: 1,
          elevation: 0,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#71717a',
        tabBarLabelStyle: {
          fontFamily: 'Outfit_500Medium',
          fontSize: 10,
          marginTop: 4,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <Icon as={HomeIcon} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: 'Folders',
          tabBarIcon: ({ color, size }) => <Icon as={FolderIcon} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarIcon: ({ size }) => <Icon as={PlusIcon} size={size + 8} color="#22c55e" />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, size }) => <Icon as={BookmarkIcon} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Icon as={SearchIcon} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
