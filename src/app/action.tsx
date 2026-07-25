import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="volunteer-activism" size={58} color="#087D97" />
        <Text style={styles.title}>Take Action</Text>
        <Text style={styles.body}>Support approved community stories by joining their campaigns.</Text>
        <Pressable style={styles.button} onPress={() => router.push('/campaigns')}>
          <Text style={styles.buttonText}>View campaigns</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF9F5' },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: '#1D2530', marginTop: 16, marginBottom: 10 },
  body: { fontSize: 17, lineHeight: 25, color: '#5B6470', textAlign: 'center', marginBottom: 28 },
  button: { backgroundColor: '#087D97', paddingHorizontal: 20, paddingVertical: 13, borderRadius: 12 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
