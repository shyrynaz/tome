import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinkIcon, SendIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CaptureScreen() {
  const router = useRouter();
  const createEntry = useMutation(api.entries.create);

  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createEntry({
        content: content.trim(),
        type: showUrlField && url.trim() ? 'bookmark' : 'note',
        url: showUrlField && url.trim() ? url.trim() : undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setContent('');
      setUrl('');
      setShowUrlField(false);
      router.back();
    } catch (err) {
      console.error(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View className="bg-background flex-1">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View className="flex-1 px-6 pt-4">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-outfit-bold text-foreground text-xl">Capture</Text>
            <Pressable onPress={handleSave} disabled={!content.trim()}>
              <Icon
                as={SendIcon}
                className={`size-6 ${content.trim() ? 'text-primary' : 'text-muted-foreground'}`}
              />
            </Pressable>
          </View>

          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="What's on your mind?"
            placeholderTextColor="#52525b"
            multiline
            autoFocus
            className="font-outfit text-foreground min-h-[200px] text-lg leading-7"
            textAlignVertical="top"
          />

          {showUrlField && (
            <View className="border-border bg-card mt-4 flex-row items-center gap-2 rounded-xl border p-3">
              <Icon as={LinkIcon} className="text-muted-foreground size-4" />
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="Paste URL..."
                placeholderTextColor="#52525b"
                className="font-outfit text-foreground flex-1 text-base"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          )}

          <View className="mt-4 flex-row gap-3">
            <Button
              variant="outline"
              onPress={() => setShowUrlField(!showUrlField)}
              className="border-border rounded-xl">
              <View className="flex-row items-center gap-2">
                <Icon as={LinkIcon} className="text-muted-foreground size-4" />
                <Text className="font-outfit-medium text-muted-foreground text-sm">
                  {showUrlField ? 'Hide URL' : 'Add URL'}
                </Text>
              </View>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
