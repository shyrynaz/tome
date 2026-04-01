import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { BookmarkIcon, BellIcon, ClockIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface EntryCardProps {
  content: string;
  type: 'note' | 'bookmark';
  tags: string[];
  url?: string;
  reminderStatus?: string;
  reminderAt?: number;
  createdAt: number;
  onPress?: () => void;
  index?: number;
}

export function EntryCard({
  content,
  type,
  tags,
  url,
  reminderStatus,
  reminderAt,
  createdAt,
  onPress,
  index = 0,
}: EntryCardProps) {
  const isReminder = reminderStatus === 'set' || reminderStatus === 'suggested';
  const isBookmark = type === 'bookmark';

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        className="bg-card border-border active:bg-secondary mb-2 rounded-xl border p-4">
        <View className="flex-row items-start gap-3">
          {isBookmark && (
            <View className="mt-0.5">
              <Icon as={BookmarkIcon} className="text-accent size-4" />
            </View>
          )}
          {isReminder && reminderStatus === 'set' && (
            <View className="mt-0.5">
              <Icon as={BellIcon} className="text-primary size-4" />
            </View>
          )}
          <View className="flex-1">
            <Text className="font-outfit-medium text-foreground text-base leading-6">
              {content}
            </Text>
            {isBookmark && url && (
              <Text className="text-muted-foreground mt-1 text-xs" numberOfLines={1}>
                {url}
              </Text>
            )}
            {reminderAt && (
              <View className="mt-2 flex-row items-center gap-1">
                <Icon as={ClockIcon} className="text-primary size-3" />
                <Text className="text-primary text-xs">
                  {new Date(reminderAt).toLocaleDateString()}
                </Text>
              </View>
            )}
            {tags.length > 0 && (
              <View className="mt-2 flex-row flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} className="bg-secondary border-none px-2 py-0.5">
                    <Text className="text-muted-foreground font-outfit text-[10px]">{tag}</Text>
                  </Badge>
                ))}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
