import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { BriefcaseIcon, HeartIcon, LightbulbIcon, FolderIcon, PlusIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ICON_MAP: Record<string, any> = {
  briefcase: BriefcaseIcon,
  heart: HeartIcon,
  lightbulb: LightbulbIcon,
  folder: FolderIcon,
};

export default function FoldersScreen() {
  const folders = useQuery(api.folders.list) ?? [];

  return (
    <View className="bg-background flex-1">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View className="px-6 pt-4">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-outfit-bold text-foreground text-2xl">Folders</Text>
            <Pressable className="bg-primary size-10 items-center justify-center rounded-xl">
              <Icon as={PlusIcon} className="text-background size-5" />
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {folders === undefined ? (
            <View className="items-center p-8">
              <ActivityIndicator color="#22c55e" />
            </View>
          ) : folders.length === 0 ? (
            <View className="items-center justify-center p-10">
              <Text className="text-muted-foreground font-outfit text-center">
                No folders yet. Create one to organize your entries.
              </Text>
            </View>
          ) : (
            folders.map((folder) => {
              const FolderIconComponent = ICON_MAP[folder.icon] || FolderIcon;
              return (
                <Pressable
                  key={folder._id}
                  className="bg-card border-border active:bg-secondary mb-3 flex-row items-center gap-4 rounded-xl border p-4">
                  <View
                    className="size-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${folder.color}22` }}>
                    <Icon as={FolderIconComponent} className="size-5" color={folder.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-outfit-medium text-foreground text-base">
                      {folder.name}
                    </Text>
                  </View>
                  <Text className="text-muted-foreground font-outfit text-sm">0</Text>
                </Pressable>
              );
            })
          )}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
