import { TranslatedText as Text } from '@/components/translated-text';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

const items = [['Home', 'home', '/dashboard'], ['Stories', 'menu-book', '/stories'], ['Upload', 'ios-share', '/upload'], ['Impact', 'podcasts', '/podcasts'], ['Campaigns', 'campaign', '/campaigns'], ['Action', 'bolt', '/action']] as const;

export function UserBottomNav() {
  const pathname = usePathname();
  return <View style={styles.nav}>{items.map(([label, icon, route]) => {
    const active = pathname === route || (route === '/dashboard' && pathname === '/');
    return <Pressable key={route} style={styles.item} onPress={() => router.push(route as any)}><MaterialIcons name={icon} size={25} color={active ? '#087D97' : '#5B6470'} /><Text style={[styles.label, active && styles.active]}>{label}</Text></Pressable>;
  })}</View>;
}
const styles = StyleSheet.create({ nav: { flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E7DDD2', paddingTop: 10, paddingBottom: 8 }, item: { flex: 1, alignItems: 'center', gap: 3 }, label: { color: '#5B6470', fontSize: 12 }, active: { color: '#087D97', fontWeight: '700' } });
