import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { BookmarkIcon, ExternalLinkIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookmarksScreen() {
  const bookmarks = useQuery(api.entries.list, { type: 'bookmark' });

  return (
    <View className="bg-background flex-1">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View className="px-6 pt-4">
          <Text className="font-outfit-bold text-foreground mb-6 text-2xl">Bookmarks</Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {bookmarks === undefined ? (
            <View className="items-center p-8">
              <ActivityIndicator color="#22c55e" />
            </View>
          ) : bookmarks.length === 0 ? (
            <View className="items-center justify-center p-10">
              <Icon as={BookmarkIcon} className="text-muted-foreground/20 mb-3 size-8" />
              <Text className="text-muted-foreground font-outfit text-center">
                No bookmarks yet. Share a link from any app to capture it here.
              </Text>
            </View>
          ) : (
            bookmarks.map((entry) => (
              <Pressable
                key={entry._id}
                className="bg-card border-border active:bg-secondary mb-3 rounded-xl border p-4">
                {entry.urlPreview ? (
                  <View>
                    {entry.urlPreview.thumbnail && (
                      <View className="bg-secondary mb-3 h-32 w-full rounded-lg" />
                    )}
                    <Text className="font-outfit-semibold text-foreground text-base">
                      {entry.urlPreview.title}
                    </Text>
                    <Text className="text-muted-foreground mt-1 text-sm" numberOfLines={2}>
                      {entry.urlPreview.description}
                    </Text>
                    {entry.urlPreview.aiSummary && (
                      <Text className="text-primary/80 mt-2 text-sm italic" numberOfLines={3}>
                        {entry.urlPreview.aiSummary}
                      </Text>
                    )}
                  </View>
                ) : (
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Icon as={BookmarkIcon} className="text-accent size-4" />
                      <Text className="font-outfit-medium text-foreground flex-1 text-base">
                        {entry.content}
                      </Text>
                    </View>
                    {entry.url && (
                      <View className="mt-2 flex-row items-center gap-1">
                        <Icon as={ExternalLinkIcon} className="text-muted-foreground size-3" />
                        <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                          {entry.url}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                {entry.tags.length > 0 && (
                  <View className="mt-3 flex-row flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <View key={tag} className="bg-secondary rounded-full px-2 py-0.5">
                        <Text className="text-muted-foreground font-outfit text-[10px]">{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            ))
          )}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
