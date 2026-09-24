import { TranslatedText as Text } from '@/components/translated-text';
import { TranslatedTextInput as TextInput } from '@/components/translated-text-input';
import { fetchApprovedStories } from '@/services/firebaseService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ThemeMode = 'light' | 'dark';

type Story = {
  id: string;
  title: string;
  location: string;
  likes: number;
};

const themes = {
  light: {
    background: '#FCF9F5',
    surface: '#FFFFFF',
    text: '#071426',
    body: '#40506A',
    accent: '#087D97',
    border: '#E2D8CB',
    search: '#F0ECE6',
    nav: '#FFFFFF',
  },
  dark: {
    background: '#111614',
    surface: '#1C2220',
    text: '#F7F3EA',
    body: '#CBD3CE',
    accent: '#43B5CA',
    border: '#3A403C',
    search: '#252C29',
    nav: '#1C2220',
  },
} as const;

const actions = [
  {
    label: 'Browse\nstories',
    icon: 'menu-book' as const,
    color: '#087D97',
    iconBackground: '#E4F2F5',
  },
  {
    label: 'Join an\nawareness\ncampaign',
    icon: 'campaign' as const,
    color: '#FF725E',
    iconBackground: '#FFF0ED',
  },
  {
    label: 'Get action steps',
    icon: 'bolt' as const,
    color: '#B96A00',
    iconBackground: '#FFF6E8',
  },
  {
    label: 'About Us',
    icon: 'info-outline' as const,
    color: '#FFFFFF',
    iconBackground: '#958F91',
  },
];

const getNavigationItems = (pathname: string) => [
  {
    label: 'Home',
    icon: 'home' as const,
    route: '/',
    active: pathname === '/' || pathname === '/dashboard',
  },
  {
    label: 'Stories',
    icon: 'menu-book' as const,
    route: '/stories',
    active: pathname === '/stories',
  },
  {
    label: 'Upload',
    icon: 'ios-share' as const,
    route: '/upload',
    active: pathname === '/upload',
  },
  {
    label: 'Impact',
    icon: 'podcasts' as const,
    route: '/podcasts',
    active: pathname === '/podcasts',
  },
  {
    label: 'Campaigns',
    icon: 'campaign' as const,
    route: '/campaigns',
    active: pathname === '/campaigns',
  },
  {
    label: 'Action',
    icon: 'bolt' as const,
    route: '/action',
    active: pathname === '/action',
  },
];

export default function DashboardScreen() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const pathname = usePathname();
  const navigation = getNavigationItems(pathname);
  const [searchQuery, setSearchQuery] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const palette = themes[themeMode];
  const filteredStories = stories.filter((story) => {
    const query = searchQuery.trim().toLowerCase();
    return !query || `${story.title} ${story.location}`.toLowerCase().includes(query);
  });

  useFocusEffect(useCallback(() => {
    let active = true;
    setStoriesLoading(true);
    fetchApprovedStories()
      .then(items => {
        if (active) setStories(items.slice(0, 4) as Story[]);
      })
      .catch(error => {
        console.warn('Homepage stories could not be loaded:', error);
        if (active) setStories([]);
      })
      .finally(() => {
        if (active) setStoriesLoading(false);
      });
    return () => { active = false; };
  }, []));

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View>
              <Text style={[styles.appName, { color: palette.text }]}>CitznY</Text>
              <Text style={[styles.tagline, { color: palette.body }]}>Youth Civic Storytelling</Text>
            </View>
            <View style={styles.themeActions}>
              <Pressable
                accessibilityLabel="Use light theme"
                onPress={() => setThemeMode('light')}
                hitSlop={10}>
                <MaterialIcons name="light-mode" size={23} color={palette.body} />
              </Pressable>
              <Pressable
                accessibilityLabel="Use dark theme"
                onPress={() => setThemeMode('dark')}
                hitSlop={10}>
                <MaterialIcons name="dark-mode" size={23} color={palette.body} />
              </Pressable>
            </View>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: palette.search }]}>
            <MaterialIcons name="search" size={23} color={palette.body} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search issues, places, campaigns..."
              placeholderTextColor={palette.body}
              style={[styles.searchInput, { color: palette.text }]}
            />
          </View>

          <View style={styles.actionGrid}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                onPress={() => {
                  switch (action.label) {
                    case "Browse\nstories":
                      router.push("/stories");
                      break;

                    case "Join an\nawareness\ncampaign":
                      router.push("/campaigns");
                      break;

                    case "Get action steps":
                      router.push("/action");
                      break;

                    case "About Us":
                      router.push("/about");
                      break;
                  }
                }}
                style={({ pressed }) => [
                  styles.actionCard,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  },
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.actionIcon, { backgroundColor: action.iconBackground }]}>
                  <MaterialIcons name={action.icon} size={23} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: palette.text }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.impactHeader}>
            <Text style={[styles.impactTitle, { color: palette.text }]}>Impact in Action</Text>
            <Pressable
              hitSlop={10}
              onPress={() => router.push("/stories")}>
              <Text style={[styles.seeAll, { color: palette.accent }]}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.storyList}>
            {storiesLoading && <ActivityIndicator size="large" color={palette.accent} style={styles.storyLoader} />}
            {filteredStories.map((story) => (
              <Pressable
                key={story.id}
                onPress={() => router.push("/stories")}
                style={({ pressed }) => [
                  styles.storyCard,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.storyTitle, { color: palette.text }]}>{story.title}</Text>
                <View style={styles.storyMeta}>
                  <View style={styles.locationRow}>
                    <MaterialIcons name="location-on" size={17} color={palette.body} />
                    <Text style={[styles.locationText, { color: palette.body }]}>{story.location}</Text>
                  </View>
                  <View style={styles.likeRow}>
                    <MaterialIcons name="favorite" size={18} color="#FF304F" />
                    <Text style={styles.likeText}>{story.likes}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
            {!storiesLoading && filteredStories.length === 0 && (
              <Text style={[styles.emptyText, { color: palette.body }]}>{searchQuery.trim() ? 'No stories found' : 'No stories available yet'}</Text>
            )}
          </View>
        </ScrollView>

        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: palette.nav,
              borderColor: palette.border,
            },
          ]}>
          {navigation.map((item) => {
            const color = item.active
              ? palette.accent
              : palette.body;

            return (
              <Pressable
                key={item.label}
                style={styles.navItem}
                onPress={() => router.push(item.route as any)}
              >
                <MaterialIcons
                  name={item.icon}
                  size={25}
                  color={color}
                />

                <Text
                  style={[
                    styles.navLabel,
                    {
                      color,
                    },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 104 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: { fontSize: 23, lineHeight: 28, fontWeight: '800' },
  tagline: { fontSize: 15, lineHeight: 21 },
  themeActions: { flexDirection: 'row', alignItems: 'center', gap: 22, paddingRight: 10 },
  searchContainer: {
    minHeight: 74,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 18, lineHeight: 24, paddingVertical: 0 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 26 },
  actionCard: {
    width: '48%',
    minHeight: 143,
    borderWidth: 1,
    borderRadius: 19,
    padding: 18,
    justifyContent: 'space-between',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 16, lineHeight: 19, fontWeight: '700' },
  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  impactTitle: { fontSize: 19, lineHeight: 24, fontWeight: '800' },
  seeAll: { fontSize: 15, fontWeight: '600' },
  storyList: { gap: 12 },
  storyLoader: { paddingVertical: 30 },
  storyCard: { borderWidth: 1, borderRadius: 19, padding: 15, minHeight: 85 },
  storyTitle: { fontSize: 18, lineHeight: 23, fontWeight: '600', marginBottom: 9 },
  storyMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { fontSize: 15, lineHeight: 20 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  likeText: { color: '#FF304F', fontSize: 15 },
  emptyText: { textAlign: 'center', fontSize: 16, paddingVertical: 30 },
  bottomNav: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 74,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: 9,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navLabel: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  pressed: { opacity: 0.72 },
});
