import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About Awaaz</Text>
        <Text style={styles.body}>
          Awaaz helps communities share local stories, build campaigns, and turn awareness into action.
        </Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF9F5' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: '#1D2530', marginBottom: 16 },
  body: { fontSize: 17, lineHeight: 26, color: '#5B6470', marginBottom: 28 },
  button: { alignSelf: 'flex-start', backgroundColor: '#087D97', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
