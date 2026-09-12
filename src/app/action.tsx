import { TranslatedText as Text } from '@/components/translated-text';
import { UserBottomNav } from '@/components/user-bottom-nav';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const sections = [
  { icon: 'phone-in-talk' as const, title: 'Who to contact', items: ['Call your local ward office', 'Email the District Collector', 'Visit the Gram Panchayat'] },
  { icon: 'chat-bubble-outline' as const, title: 'What to say', items: ['Introduce yourself and location', 'State the problem clearly', 'Ask for a timeline and action'] },
  { icon: 'fact-check' as const, title: 'Evidence checklist', items: ['Collect 3 photos of the issue', 'Get 5 resident statements', 'Note important dates and times'] },
  { icon: 'calendar-month' as const, title: 'Follow-up plan', items: ['Send a reminder after 3 days', 'Visit the office after 1 week', 'Escalate if there is no response'] },
];

export default function ActionScreen() {
  return <View style={styles.screen}><SafeAreaView edges={['top']} style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.eyebrow}><MaterialIcons name="bolt" size={24} color="#FF725E" /><Text style={styles.eyebrowText}>NyayaLine Inspired</Text></View>
    <Text style={styles.title}>Move from awareness to action</Text>
    {sections.map(section => <View key={section.title} style={styles.card}><View style={styles.cardHeader}><View style={styles.iconBox}><MaterialIcons name={section.icon} size={25} color="#087D97" /></View><Text style={styles.cardTitle}>{section.title}</Text></View>{section.items.map((item, index) => <View key={item} style={styles.step}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><Text style={styles.stepText}>{item}</Text></View>)}</View>)}
    <View style={styles.quickCard}><Text style={styles.quickTitle}>Quick actions</Text><View style={styles.quickGrid}>{['Call ward office', 'Collect 3 photos', 'Get 5 statements', 'Follow up in 3 days'].map(item => <View key={item} style={styles.quickAction}><Text style={styles.quickText}>{item}</Text></View>)}</View></View>
  </ScrollView><UserBottomNav /></SafeAreaView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FCF9F5' }, safe: { flex: 1 }, content: { padding: 20, paddingBottom: 30 }, eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, eyebrowText: { color: '#FF725E', fontSize: 16, fontWeight: '700' }, title: { color: '#161C27', fontSize: 31, lineHeight: 40, fontWeight: '800', marginTop: 12, marginBottom: 20 }, reviewButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9F5F6', borderRadius: 15, padding: 14, marginBottom: 16, gap: 9 }, reviewText: { flex: 1, color: '#087D97', fontSize: 15, fontWeight: '700' }, card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E1DCCF', borderRadius: 20, padding: 20, marginBottom: 16 }, cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 }, iconBox: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#E5F4F5', alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: '#151B25', fontSize: 21, fontWeight: '800' }, step: { flexDirection: 'row', alignItems: 'center', gap: 13, marginVertical: 7 }, number: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F2EFE9', alignItems: 'center', justifyContent: 'center' }, numberText: { color: '#5B6470', fontSize: 14 }, stepText: { flex: 1, color: '#202631', fontSize: 16, lineHeight: 22 }, quickCard: { backgroundColor: '#DBD7D6', borderRadius: 20, padding: 20 }, quickTitle: { color: '#161C27', fontSize: 17, fontWeight: '800', marginBottom: 12 }, quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, quickAction: { width: '48%', minHeight: 56, backgroundColor: '#FFF', borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 8 }, quickText: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: '#1D2530' },
});
