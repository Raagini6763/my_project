import { TranslatedText as Text } from '@/components/translated-text';
import { UserBottomNav } from '@/components/user-bottom-nav';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const values = [
  ['Youth-First', 'Built by and for young changemakers'],
  ['Grassroots', 'Rooted in community voices and local action'],
  ['Transparent', 'Clear curation process and admin feedback'],
  ['Inclusive', 'Multi-language support and accessible design'],
];

export default function AboutScreen() {
  return <View style={styles.screen}><SafeAreaView edges={['top']} style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.title}>About Us</Text><Text style={styles.subtitle}>Learn about our mission</Text>
    <View style={styles.card}><Text style={styles.cardTitle}>Our Mission</Text><Text style={styles.body}>CitznY empowers young people in rural and semi-urban communities to share their stories, build awareness campaigns, and drive real civic change through collective action.</Text></View>
    <View style={[styles.card, styles.vision]}><Text style={styles.cardTitle}>Our Vision</Text><Text style={styles.body}>A world where youth voices shape local governance and grassroots issues become impossible to ignore.</Text></View>
    <Text style={styles.valuesTitle}>Our Values</Text>{values.map(([title, body]) => <View key={title} style={styles.value}><Text style={styles.valueTitle}>{title}</Text><Text style={styles.valueBody}>{body}</Text></View>)}
    <Pressable onPress={() => router.push('/privacy')} style={styles.privacy}><Text style={styles.privacyText}>Read our Privacy Policy</Text></Pressable>
    <View style={styles.contactCard}>
      <View style={styles.contactHeading}><MaterialIcons name="mail-outline" size={23} color="#087D97" /><Text style={styles.contactTitle}>Get in Touch</Text></View>
      <Pressable accessibilityRole="link" accessibilityLabel="Email CitznY" onPress={() => void Linking.openURL('mailto:raaginirsingh@gmail.com')} style={styles.emailButton}><MaterialIcons name="mail-outline" size={20} color="#FFF" /><Text style={styles.emailButtonText}>Email Us</Text></Pressable>
      <Text style={styles.responseText}>Response within 24 hours</Text>
    </View>
  </ScrollView><UserBottomNav /></SafeAreaView></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#FCF9F5' }, safe: { flex: 1 }, content: { padding: 20, paddingBottom: 30 }, title: { fontSize: 28, fontWeight: '800', color: '#161C27' }, subtitle: { color: '#40506A', marginTop: 4, marginBottom: 20 }, card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2D8CB', borderRadius: 20, padding: 20, marginBottom: 16 }, vision: { backgroundColor: '#E3EFF0', borderColor: '#B4D3D6' }, cardTitle: { fontSize: 18, fontWeight: '800', color: '#161C27', marginBottom: 12 }, body: { fontSize: 16, lineHeight: 25, color: '#31435D' }, valuesTitle: { fontSize: 17, fontWeight: '800', color: '#161C27', margin: 5 }, value: { backgroundColor: '#F7F4F0', borderRadius: 17, padding: 16, marginTop: 10 }, valueTitle: { color: '#161C27', fontSize: 16, fontWeight: '700' }, valueBody: { color: '#40506A', fontSize: 13, marginTop: 4 }, privacy: { alignItems: 'center', padding: 18 }, privacyText: { color: '#087D97', fontWeight: '700' }, contactCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2D8CB', borderRadius: 20, padding: 20, marginTop: 4 }, contactHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }, contactTitle: { color: '#161C27', fontSize: 19, fontWeight: '800' }, emailButton: { minHeight: 48, borderRadius: 15, backgroundColor: '#087D97', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, emailButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }, responseText: { color: '#40506A', fontSize: 13, textAlign: 'center', marginTop: 13 } });
