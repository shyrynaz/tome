import { Text } from '@/components/ui/text';
import { Pressable, ScrollView } from 'react-native';

interface FilterChipsProps<T extends string> {
  filters: readonly T[];
  active: T;
  onChange: (filter: T) => void;
}

export function FilterChips<T extends string>({ filters, active, onChange }: FilterChipsProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {filters.map((filter) => (
        <Pressable
          key={filter}
          onPress={() => onChange(filter)}
          className={`mr-2 rounded-full px-4 py-2 ${active === filter ? 'bg-primary' : 'bg-secondary'}`}>
          <Text
            className={`font-outfit-medium text-xs ${active === filter ? 'text-background' : 'text-muted-foreground'}`}>
            {filter}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
