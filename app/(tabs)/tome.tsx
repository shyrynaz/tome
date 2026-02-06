import React, { useState } from 'react';
import { View, SafeAreaView, ScrollView, TextInput, Pressable, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUniwind } from 'uniwind';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  SearchIcon, 
  LibraryIcon, 
  FilterIcon, 
  ClockIcon, 
  ChevronRightIcon,
  SparklesIcon,
  MessageSquareIcon,
  CheckCircle2Icon,
  CalendarIcon
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: LibraryIcon },
  { id: 'TASK', label: 'Tasks', icon: CheckCircle2Icon },
  { id: 'NOTE', label: 'Notes', icon: MessageSquareIcon },
  { id: 'EVENT', label: 'Events', icon: CalendarIcon },
];

export default function TomeScreen() {
  const { theme } = useUniwind();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const ideas = useQuery(api.ideas.search, { 
    query: searchQuery,
    intent: activeCategory
  });

  // For this demo, let's just show all and handle filtering if we add the field.
  // Actually, I'll just use the list for now.

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(168, 85, 247, 0.05)', 'transparent', 'transparent']}
        className="absolute inset-0"
      />
      
      <SafeAreaView className="flex-1">
        <View className="px-6 pt-4 pb-2">
          <Text className="font-outfit-bold text-4xl tracking-tighter">The Tome</Text>
          <Text className="text-muted-foreground font-outfit text-sm">Your collective intelligence</Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 py-4">
          <View className="bg-white/5 border border-white/10 rounded-2xl flex-row items-center px-4 h-12">
            <Icon as={SearchIcon} className="size-4 text-muted-foreground mr-3" />
            <TextInput
              placeholder="Search your thoughts..."
              placeholderTextColor="#666"
              className="flex-1 font-outfit text-foreground text-base"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <View className="mb-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                  activeCategory === cat.id 
                    ? 'bg-purple-500 border-purple-500' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <Icon 
                  as={cat.icon} 
                  className={`size-3.5 ${activeCategory === cat.id ? 'text-white' : 'text-muted-foreground'}`} 
                />
                <Text 
                  className={`font-outfit-medium text-xs ${activeCategory === cat.id ? 'text-white' : 'text-muted-foreground'}`}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Ideas List */}
        {ideas === undefined ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted-foreground font-outfit italic">Unrolling the scrolls...</Text>
          </View>
        ) : ideas.length === 0 ? (
          <View className="flex-1 items-center justify-center px-12">
            <Icon as={SparklesIcon} className="size-12 text-muted-foreground/20 mb-4" />
            <Text className="text-muted-foreground font-outfit text-center">
              No memories found. Start dumping your thoughts to fill the Tome.
            </Text>
          </View>
        ) : (
          <FlatList
            data={ideas}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInDown.delay(index * 50).springify()}
                layout={Layout.springify()}
                className="mb-4 bg-white/5 border border-white/5 rounded-2xl overflow-hidden"
              >
                <Pressable className="p-4 active:bg-white/10">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      {item.intent && (
                         <Icon 
                          as={CATEGORIES.find(c => c.id === item.intent)?.icon || LibraryIcon} 
                          className="size-3 text-muted-foreground" 
                        />
                      )}
                      <Text className="text-muted-foreground font-outfit text-[10px] uppercase tracking-wider">
                        {new Date(item._creationTime).toLocaleDateString()}
                      </Text>
                    </View>
                    {item.processed && (
                      <View className="bg-indigo-500/10 px-2 py-0.5 rounded-md">
                        <Text className="text-indigo-400 font-outfit-bold text-[8px] uppercase tracking-tighter">Processed</Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-outfit text-base leading-6 text-foreground/90" numberOfLines={3}>
                    {item.content}
                  </Text>
                  <View className="mt-3 flex-row items-center justify-end">
                    <Icon as={ChevronRightIcon} className="size-4 text-muted-foreground/30" />
                  </View>
                </Pressable>
              </Animated.View>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
