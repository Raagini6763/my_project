// app/dashboard.tsx
import { SymbolView } from '@/components/symbol-view';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ThemeMode = 'light' | 'dark';

const palettes = {
  light: {
    background: '#FFFEFC',
    text: '#061325',
    body: '#31425D',
    accent: '#087D97',
    accentPressed: '#06677D',
    iconPanel: '#E5F0F3',
    chip: '#F0EDE8',
    chipText: '#405066',
    inactiveAction: '#938C8D',
    divider: '#D9D0C5',
    cardBg: '#FFFFFF',
    cardShadow: 'rgba(0,0,0,0.05)',
    searchBg: '#F5F3F0',
    searchText: '#061325',
    placeholder: '#8A8A8A',
  },
  dark: {
    background: '#111614',
    text: '#F7F3EA',
    body: '#D1D7D3',
    accent: '#0B839E',
    accentPressed: '#096D84',
    iconPanel: '#20343A',
    chip: '#242B28',
    chipText: '#D1D7D3',
    inactiveAction: '#6F6668',
    divider: '#37332F',
    cardBg: '#1A1F1D',
    cardShadow: 'rgba(0,0,0,0.3)',
    searchBg: '#242B28',
    searchText: '#F7F3EA',
    placeholder: '#8A8A8A',
  },
} as const;

type Story = {
  id: string;
  title: string;
  location: string;
  likes: number;
  category: string;
  timestamp: string;
};

const sampleStories: Story[] = [
  {
    id: '1',
    title: 'Broken streetlights near school',
    location: 'Wardha, MH',
    likes: 47,
    category: 'Infrastructure',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    title: 'Unsafe bus stop for girls',
    location: 'Nagpur, MH',
    likes: 89,
    category: 'Safety',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    title: 'Water shortage in slum area',
    location: 'Mumbai, MH',
    likes: 124,
    category: 'Water & Sanitation',
    timestamp: '1 day ago',
  },
  {
    id: '4',
    title: 'Dirty public park needs cleaning',
    location: 'Pune, MH',
    likes: 32,
    category: 'Environment',
    timestamp: '2 days ago',
  },
  {
    id: '5',
    title: 'No streetlights on main road',
    location: 'Nagpur, MH',
    likes: 56,
    category: 'Infrastructure',
    timestamp: '3 days ago',
  },
  {
    id: '6',
    title: 'Broken footpath near market',
    location: 'Wardha, MH',
    likes: 18,
    category: 'Infrastructure',
    timestamp: '5 days ago',
  },
];

export default function DashboardScreen() {
  const [themeMode] = useState<ThemeMode>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const palette = palettes[themeMode];

  const categories = ['All', 'Infrastructure', 'Safety', 'Water & Sanitation', 'Environment'];

  const filteredStories = sampleStories.filter((story) => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || selectedCategory === 'All' ||
      story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStory = ({ item }: { item: Story }) => (
    <Pressable
      style={({ pressed }) => [
        styles.storyCard,
        { backgroundColor: palette.cardBg },
        pressed && styles.pressed,
      ]}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.storyTitle, { color: palette.text }]}>{item.title}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: palette.iconPanel }]}>
            <Text style={[styles.categoryText, { color: palette.accent }]}>
              {item.category}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.locationContainer}>
            <SymbolView
              name={{ ios: 'location', web: 'location_on' }}
              size={14}
              tintColor={palette.body}
            />
            <Text style={[styles.locationText, { color: palette.body }]}>
              {item.location}
            </Text>
          </View>
          <View style={styles.likesContainer}>
            <SymbolView
              name={{ ios: 'heart', web: 'favorite' }}
              size={16}
              tintColor="#E74C3C"
            />
            <Text style={[styles.likesText, { color: palette.body }]}>
              {item.likes}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SymbolView
                name={{ ios: 'megaphone', web: 'campaign' }}
                size={32}
                tintColor={palette.accent}
              />
              <Text style={[styles.appName, { color: palette.text }]}>Awaaz</Text>
            </View>
            <Pressable
              style={[styles.profileButton, { backgroundColor: palette.iconPanel }]}>
              <SymbolView
                name={{ ios: 'person', web: 'account_circle' }}
                size={24}
                tintColor={palette.text}
              />
            </Pressable>
          </View>

          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: palette.searchBg }]}>
            <SymbolView
              name={{ ios: 'magnifyingglass', web: 'search' }}
              size={20}
              tintColor={palette.placeholder}
            />
            <TextInput
              style={[styles.searchInput, { color: palette.searchText }]}
              placeholder="Search issues, places, campaigns..."
              placeholderTextColor={palette.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable
              style={[styles.quickAction, { backgroundColor: palette.iconPanel }]}>
              <SymbolView
                name={{ ios: 'doc.text', web: 'description' }}
                size={20}
                tintColor={palette.text}
              />
              <Text style={[styles.quickActionText, { color: palette.text }]}>
                Browse approved stories
              </Text>
            </Pressable>
            <Pressable
              style={[styles.quickAction, { backgroundColor: palette.iconPanel }]}>
              <SymbolView
                name={{ ios: 'megaphone', web: 'campaign' }}
                size={20}
                tintColor={palette.text}
              />
              <Text style={[styles.quickActionText, { color: palette.text }]}>
                Build an awareness campaign
              </Text>
            </Pressable>
            <Pressable
              style={[styles.quickAction, { backgroundColor: palette.iconPanel }]}>
              <SymbolView
                name={{ ios: 'list.bullet', web: 'checklist' }}
                size={20}
                tintColor={palette.text}
              />
              <Text style={[styles.quickActionText, { color: palette.text }]}>
                Get action steps
              </Text>
            </Pressable>
            <Pressable
              style={[styles.quickAction, { backgroundColor: palette.iconPanel }]}>
              <SymbolView
                name={{ ios: 'info.circle', web: 'info' }}
                size={20}
                tintColor={palette.text}
              />
              <Text style={[styles.quickActionText, { color: palette.text }]}>
                About Us
              </Text>
            </Pressable>
          </View>

          {/* Impact Section */}
          <View style={styles.impactSection}>
            <View style={styles.impactHeader}>
              <Text style={[styles.impactTitle, { color: palette.text }]}>
                Impact in Action
              </Text>
              <Pressable>
                <Text style={[styles.seeAll, { color: palette.accent }]}>See all</Text>
              </Pressable>
            </View>

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category === 'All' ? null : category)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: 
                        (category === 'All' && selectedCategory === null) ||
                        selectedCategory === category
                          ? palette.accent
                          : palette.chip,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: 
                          (category === 'All' && selectedCategory === null) ||
                          selectedCategory === category
                            ? '#FFFFFF'
                            : palette.chipText,
                      },
                    ]}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Stories List */}
          <FlatList
            data={filteredStories}
            renderItem={renderStory}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.storiesList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: palette.body }]}>
                  No stories found matching your criteria
                </Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    padding: 0,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  impactSection: {
    marginBottom: 16,
  },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  storiesList: {
    paddingBottom: 80,
  },
  storyCard: {
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  cardContent: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    lineHeight: 22,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

