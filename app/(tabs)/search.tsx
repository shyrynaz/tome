import { EntryCard } from '@/components/EntryCard';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { SearchIcon } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const entries = useQuery(
    api.entries.search,
    query.trim().length > 0 ? { query: query.trim() } : 'skip'
  );

  return (
    <View className="bg-background flex-1">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View className="px-6 pt-4">
          <Text className="font-outfit-bold text-foreground mb-4 text-2xl">Search</Text>

          <View className="border-border bg-card mb-4 flex-row items-center gap-3 rounded-xl border p-3">
            <Icon as={SearchIcon} className="text-muted-foreground size-5" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search entries..."
              placeholderTextColor="#52525b"
              className="font-outfit text-foreground flex-1 text-base"
              autoFocus
            />
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {query.trim().length === 0 ? (
            <View className="items-center justify-center p-10">
              <Text className="text-muted-foreground font-outfit text-center">
                Type to search across all your entries.
              </Text>
            </View>
          ) : entries === undefined ? (
            <View className="items-center p-8">
              <ActivityIndicator color="#22c55e" />
            </View>
          ) : entries.length === 0 ? (
            <View className="items-center justify-center p-10">
              <Text className="text-muted-foreground font-outfit text-center">
                No results for "{query}"
              </Text>
            </View>
          ) : (
            entries.map((entry, index) => (
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
            ))
          )}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
