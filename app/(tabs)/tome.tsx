import React, { useState, useMemo } from 'react';
import { View, ScrollView, TextInput, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
  CalendarIcon,
  LinkIcon,
  QuoteIcon
} from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import Animated, { FadeInDown, Layout, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: LibraryIcon },
  { id: 'TASK', label: 'Tasks', icon: CheckCircle2Icon },
  { id: 'NOTE', label: 'Notes', icon: MessageSquareIcon },
  { id: 'EVENT', label: 'Events', icon: CalendarIcon },
];

const MasonryColumn = ({ data, columnIndex }) => {
  return (
    <View className="flex-1 gap-4">
      {data.map((item, index) => (
        <Animated.View 
          key={item._id}
          entering={FadeInDown.delay((columnIndex * 100) + (index * 50)).springify()}
          layout={Layout.springify()}
          className={`bg-card/40 border-white/5 rounded-[24px] overflow-hidden border backdrop-blur-md ${item.intent === 'NOTE' ? 'bg-purple-500/5' : ''}`}
        >
          <Pressable className="p-4 active:bg-white/5">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full">
                <Icon 
                  as={CATEGORIES.find(c => c.id === item.intent)?.icon || LibraryIcon} 
                  className={`size-3 ${item.intent === 'TASK' ? 'text-amber-400' : 'text-purple-400'}`} 
                />
                <Text className="text-muted-foreground font-outfit-medium text-[10px] uppercase tracking-wider">
                  {item.intent || 'Note'}
                </Text>
              </View>
              {item.summary && (
                <View className="bg-primary/10 p-1 rounded-full">
                  <Icon as={SparklesIcon} className="size-3 text-primary" />
                </View>
              )}
            </View>

            {/* Content */}
            <Text className="font-outfit text-base leading-6 text-foreground/90 mb-2" numberOfLines={item.summary ? 4 : 6}>
              {item.summary || item.content}
            </Text>

            {/* Footer */}
            <View className="mt-2 flex-row items-center justify-between opacity-50">
              <Text className="font-outfit text-[10px] text-muted-foreground">
                {new Date(item._creationTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
              {item.content.includes('http') && <Icon as={LinkIcon} className="size-3 text-muted-foreground" />}
            </View>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
};

export default function TomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const ideas = useQuery(api.ideas.search, { 
    query: searchQuery,
    intent: activeCategory
  });

  const columns = useMemo(() => {
    if (!ideas) return [[], []];
    const col1 = [];
    const col2 = [];
    ideas.forEach((item, i) => {
      if (i % 2 === 0) col1.push(item);
      else col2.push(item);
    });
    return [col1, col2];
  }, [ideas]);

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(76, 29, 149, 0.15)', 'transparent', 'transparent']}
        className="absolute inset-0"
        pointerEvents="none"
      />
      
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-4">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-outfit-bold text-4xl tracking-tighter text-foreground">The Tome</Text>
            <View className="bg-white/5 p-2 rounded-full border border-white/5">
               <Icon as={ClockIcon} className="size-5 text-muted-foreground" />
            </View>
          </View>
          <Text className="text-muted-foreground font-outfit text-sm tracking-wide opacity-70">Collective Intelligence Archive</Text>
        </View>

        {/* Floating Search Bar */}
        <View className="px-6 mb-6">
          <View className="bg-card/50 border border-white/10 rounded-[20px] flex-row items-center px-4 h-14 backdrop-blur-xl shadow-lg shadow-black/20">
            <Icon as={SearchIcon} className="size-5 text-muted-foreground mr-3" />
            <TextInput
              placeholder="Ask your archive..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              className="flex-1 font-outfit text-foreground text-lg"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} className="bg-white/10 p-1 rounded-full">
                <Icon as={ChevronRightIcon} className="size-4 text-muted-foreground" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Categories (Horizontal Scroll) */}
        <View className="mb-6 h-10">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
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

        {/* Masonry Grid */}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
          {ideas === undefined ? (
             <View className="mt-20 items-center">
               <Text className="text-muted-foreground font-outfit italic">Unrolling scrolls...</Text>
             </View>
          ) : ideas.length === 0 ? (
            <View className="mt-20 items-center justify-center px-10">
              <View className="bg-white/5 p-6 rounded-full mb-6">
                 <Icon as={SparklesIcon} className="size-10 text-muted-foreground/30" />
              </View>
              <Text className="text-muted-foreground font-outfit text-center text-lg leading-7">
                Your tome is empty.<br/>Capture a thought to begin your legacy.
              </Text>
            </View>
          ) : (
            <View className="flex-row gap-4">
              <MasonryColumn data={columns[0]} columnIndex={0} />
              <MasonryColumn data={columns[1]} columnIndex={1} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
