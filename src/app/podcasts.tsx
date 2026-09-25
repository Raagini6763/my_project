import { TranslatedText as Text } from '@/components/translated-text';
import { UserBottomNav } from '@/components/user-bottom-nav';
import { fetchPublishedPodcasts } from '@/services/firebaseService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Podcast = {
  id: string;
  title: string;
  description: string;
  listenUrl?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
};

export default function PodcastsScreen() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    fetchPublishedPodcasts()
      .then(items => { if (active) setPodcasts(items as Podcast[]); })
      .catch(() => { if (active) Alert.alert('Unable to load podcasts', 'Please try again shortly.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  const openPodcast = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Invalid link', 'This podcast link cannot be opened.');
    }
  };

  return <View style={styles.screen}><SafeAreaView edges={['top']} style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.eyebrow}><MaterialIcons name="podcasts" size={23} color="#087D97" /><Text style={styles.eyebrowText}>CitznY Podcasts</Text></View>
      <Text style={styles.heading}>Listen, learn and take action</Text>
      <Text style={styles.subtitle}>Podcast updates and community conversations published by CitznY.</Text>

      {loading && <ActivityIndicator size="large" color="#087D97" style={styles.loader} />}
      {!loading && podcasts.length === 0 && <View style={styles.empty}><MaterialIcons name="podcasts" size={48} color="#93A2A8" /><Text style={styles.emptyTitle}>No podcasts/pictures yet</Text><Text style={styles.emptyText}>New episodes and updates will appear here.</Text></View>}
      {podcasts.map(podcast => {
        const images = podcast.imageUrls?.length ? podcast.imageUrls : podcast.imageUrl ? [podcast.imageUrl] : [];
        return <View key={podcast.id} style={styles.card}>
        {images.length ? <View style={styles.gallery}>{images.map((uri, index) => <View key={`${uri}-${index}`} style={styles.galleryItem}><Image source={{ uri }} style={styles.cover} resizeMode="cover" />{images.length > 1 ? <View style={styles.imageCount}><Text style={styles.imageCountText}>{index + 1}/{images.length}</Text></View> : null}</View>)}</View> : <View style={styles.placeholder}><MaterialIcons name="graphic-eq" size={48} color="#087D97" /></View>}
        <View style={styles.cardBody}>
          <View style={styles.label}><MaterialIcons name="verified" size={15} color="#087D97" /><Text style={styles.labelText}>CitznY Podcast</Text></View>
          <Text style={styles.title}>{podcast.title}</Text>
          <Text style={styles.description}>{podcast.description}</Text>
          {podcast.listenUrl ? <Pressable style={styles.listenButton} onPress={() => void openPodcast(podcast.listenUrl!)}><MaterialIcons name="play-arrow" size={22} color="#FFF" /><Text style={styles.listenText}>Open Podcast</Text></Pressable> : null}
        </View>
      </View>;})}
    </ScrollView>
    <UserBottomNav />
  </SafeAreaView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FCF9F5' },
  safe: { flex: 1 },
  content: { padding: 20, paddingBottom: 30 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrowText: { color: '#087D97', fontSize: 16, fontWeight: '800' },
  heading: { color: '#161C27', fontSize: 29, lineHeight: 37, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#5B6470', fontSize: 15, lineHeight: 22, marginTop: 7, marginBottom: 22 },
  loader: { marginTop: 40 },
  empty: { alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2DDD4', borderRadius: 20, padding: 30 },
  emptyTitle: { color: '#1D2530', fontSize: 18, fontWeight: '800', marginTop: 10 },
  emptyText: { color: '#5B6470', textAlign: 'center', marginTop: 5 },
  card: { overflow: 'hidden', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#B9D9DC', borderRadius: 22, marginBottom: 20 },
  cover: { width: '100%', height: 190, backgroundColor: '#E4EFF0' },
  gallery: { width: '100%', gap: 3 },
  galleryItem: { position: 'relative' },
  imageCount: { position: 'absolute', right: 12, bottom: 10, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  imageCountText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  placeholder: { width: '100%', height: 145, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4F1F2' },
  cardBody: { padding: 18 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  labelText: { color: '#087D97', fontSize: 12, fontWeight: '800' },
  title: { color: '#1D2530', fontSize: 21, lineHeight: 28, fontWeight: '800', marginTop: 7 },
  description: { color: '#5B6470', fontSize: 15, lineHeight: 23, marginTop: 9 },
  listenButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#087D97', borderRadius: 14, paddingHorizontal: 17, paddingVertical: 11, marginTop: 17 },
  listenText: { color: '#FFF', fontWeight: '800' },
});
