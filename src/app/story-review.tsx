import { TranslatedText as Text } from '@/components/translated-text';
import { UserBottomNav } from '@/components/user-bottom-nav';
import { fetchMyStories } from '@/services/firebaseService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Story = { id: string; title: string; location: string; status: string; createdAt?: Date | null; updatedAt?: Date | null };
const stages = ['Submitted', 'Under Review', 'Approved', 'Campaign Ready'];
const progressFor = (status: string) => status === 'approved' ? 3 : status === 'rejected' ? 2 : 1;
const dateLabel = (date?: Date | null) => date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';

export default function StoryReviewScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchMyStories().then(setStories).catch(() => setStories([])).finally(() => setLoading(false)); }, []);
  return <View style={styles.screen}><SafeAreaView edges={['top']} style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Story Review</Text><Text style={styles.subtitle}>Track your submission status</Text>
    {loading && <ActivityIndicator size="large" color="#087D97" style={styles.loader} />}
    {!loading && stories.length === 0 && <View style={styles.empty}><MaterialIcons name="description" size={45} color="#9AA3AD" /><Text style={styles.emptyTitle}>No submissions yet</Text><Text style={styles.emptyText}>Upload a story and its review progress will appear here.</Text></View>}
    {stories.map(story => { const progress = progressFor(story.status); return <View key={story.id} style={styles.storyBlock}><View style={styles.storyCard}><Text style={styles.storyTitle}>{story.title}</Text><View style={styles.location}><MaterialIcons name="location-on" size={16} color="#5B6470" /><Text style={styles.locationText}>{story.location}</Text></View><View style={styles.badge}><Text style={styles.badgeText}>{story.status === 'approved' ? 'Campaign Ready' : story.status === 'rejected' ? 'Needs Edits' : 'Under Review'}</Text></View></View>
      <View style={styles.timeline}>{stages.map((stage, index) => { const done = index <= progress; return <View key={stage} style={styles.timelineRow}>{index < stages.length - 1 && <View style={[styles.line, done && styles.lineDone]} />}<View style={[styles.dot, done && styles.dotDone]}><MaterialIcons name={done ? 'check-circle' : 'radio-button-unchecked'} size={22} color={done ? '#18A957' : '#ADB4BA'} /></View><View><Text style={styles.stage}>{story.status === 'rejected' && index === 2 ? 'Needs Edits' : stage}</Text><Text style={styles.date}>{index === 0 ? dateLabel(story.createdAt) : index === progress ? dateLabel(story.updatedAt) : done ? 'Completed' : 'Waiting'}</Text></View></View>; })}</View>
    </View>; })}
  </ScrollView><UserBottomNav /></SafeAreaView></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#FCF9F5' }, safe: { flex: 1 }, content: { padding: 20, paddingBottom: 30 }, title: { fontSize: 28, fontWeight: '800', color: '#161C27' }, subtitle: { color: '#5B6470', marginTop: 4, marginBottom: 18 }, loader: { marginTop: 40 }, empty: { backgroundColor: '#FFF', borderRadius: 18, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#E2DDD4' }, emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 10 }, emptyText: { textAlign: 'center', color: '#5B6470', marginTop: 6 }, storyBlock: { marginBottom: 28 }, storyCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2DDD4', padding: 17 }, storyTitle: { fontSize: 17, fontWeight: '800', color: '#161C27' }, location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 }, locationText: { color: '#5B6470', fontSize: 13 }, badge: { alignSelf: 'flex-start', backgroundColor: '#DCF8E4', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 }, badgeText: { color: '#147A3D', fontWeight: '700', fontSize: 13 }, timeline: { marginTop: 16 }, timelineRow: { minHeight: 72, flexDirection: 'row', gap: 14, position: 'relative' }, line: { position: 'absolute', left: 10, top: 22, bottom: 0, width: 2, backgroundColor: '#D4D8DA' }, lineDone: { backgroundColor: '#18A957' }, dot: { width: 22, zIndex: 1, backgroundColor: '#FCF9F5' }, dotDone: {}, stage: { color: '#161C27', fontSize: 15, fontWeight: '600' }, date: { color: '#5B6470', fontSize: 13, marginTop: 3 } });
