import { TranslatedText as Text } from '@/components/translated-text';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Effective September 12, 2026</Text>
        <Text style={styles.heading}>Information we process</Text>
        <Text style={styles.body}>CitznY processes story text, optional contact email, selected category and location description, and any photos, videos or audio that you choose to upload.</Text>
        <Text style={styles.heading}>How information is used</Text>
        <Text style={styles.body}>We use submitted information to review community stories, improve their clarity when requested, translate content, support campaigns and operate the application. Submissions are reviewed by an administrator and displayed publicly only after approval. Automated language-processing services may process story text and interface text for refinement or translation.</Text>
        <Text style={styles.heading}>Sharing and retention</Text>
        <Text style={styles.body}>We use trusted service providers to store and process information needed to operate CitznY. Approved stories and their media are public. Pending or rejected submissions remain restricted to authorized administrators. Information is retained only while needed to operate CitznY, meet applicable obligations or complete a valid correction or deletion request.</Text>
        <Text style={styles.heading}>Your choices</Text>
        <Text style={styles.body}>Camera, photo and microphone access is requested only when you use the corresponding story feature. You may deny these permissions. To request correction or deletion of a submitted story, contact the CitznY administrator using the developer contact shown on the Play Store listing.</Text>
        <Text style={styles.heading}>Security and children</Text>
        <Text style={styles.body}>We apply access controls and transport encryption, but no online service can guarantee absolute security. Do not submit sensitive personal information about yourself or children without appropriate permission.</Text>
        <Pressable style={styles.button} onPress={() => router.back()}><Text style={styles.buttonText}>Go back</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF9F5' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: '800', color: '#1D2530', marginBottom: 4 },
  updated: { fontSize: 14, color: '#666', marginBottom: 24 },
  heading: { fontSize: 19, fontWeight: '700', color: '#1D2530', marginTop: 16, marginBottom: 6 },
  body: { fontSize: 16, lineHeight: 24, color: '#5B6470' },
  button: { alignSelf: 'flex-start', marginTop: 28, backgroundColor: '#087D97', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
