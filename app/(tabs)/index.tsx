import { EntryCard } from '@/components/EntryCard';
import { FilterChips } from '@/components/FilterChips';
import { Text } from '@/components/ui/text';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = ['All', 'Notes', 'Bookmarks', 'Reminders'] as const;
type Filter = (typeof FILTERS)[number];

export default function FeedScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const entries = useQuery(
    api.entries.list,
    activeFilter === 'Reminders'
      ? { reminderOnly: true }
      : activeFilter === 'Notes'
        ? { type: 'note' }
        : activeFilter === 'Bookmarks'
          ? { type: 'bookmark' }
          : {}
  );

  const groupedByDate = entries?.reduce(
    (acc, entry) => {
      const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    },
    {} as Record<string, typeof entries>
  );

  return (
    <View className="bg-background flex-1">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View className="px-6 pt-4">
          <Text className="font-outfit-bold text-foreground mb-4 text-2xl">Feed</Text>
          <FilterChips filters={FILTERS} active={activeFilter} onChange={setActiveFilter} />
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          {entries === undefined ? (
            <View className="items-center p-8">
              <ActivityIndicator color="#22c55e" />
            </View>
          ) : entries.length === 0 ? (
            <View className="items-center justify-center p-10">
              <Text className="text-muted-foreground font-outfit text-center">
                No entries yet. Tap Capture to add one.
              </Text>
            </View>
          ) : (
            Object.entries(groupedByDate || {}).map(([date, dateEntries]) => (
              <View key={date} className="mb-6">
                <Text className="text-muted-foreground font-outfit-medium mb-3 text-[10px] tracking-widest uppercase">
                  {date}
                </Text>
                {dateEntries.map((entry, index) => (
                  <EntryCard
                    key={entry._id}
                    content={entry.content}
                    type={entry.type}
                    tags={entry.tags}
                    url={entry.url}
                    reminderStatus={entry.reminderStatus}
                    reminderAt={entry.reminderAt}
                    createdAt={entry.createdAt}
                    index={index}
                  />
                ))}
              </View>
            ))
          )}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
