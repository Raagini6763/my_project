import { TranslatedText as Text } from '@/components/translated-text';
import { UserBottomNav } from '@/components/user-bottom-nav';
import { fetchCampaignInteraction, fetchCampaigns, updateCampaignInteraction } from '@/services/firebaseService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Campaign = {
  id: string;
  title: string;
  platform: string;
  description: string;
  campaignUrl: string;
  joined: number;
  isJoined: boolean;
};

export default function CampaignsScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const items = await fetchCampaigns();
        const hydrated = await Promise.all(items.map(async (item: any) => {
          const interaction: { joined?: boolean; shared?: boolean } = await fetchCampaignInteraction(item.id).catch(() => ({}));
          return {
            id: item.id,
            title: item.title,
            platform: item.platform,
            description: item.description || 'Open this campaign to learn more and take part.',
            campaignUrl: item.campaignUrl,
            joined: Number(item.joined) || 0,
            isJoined: interaction.joined === true,
          };
        }));
        if (active) setCampaigns(hydrated);
      } catch (error) {
        console.warn('Campaign loading failed:', error);
        if (active) Alert.alert('Unable to load campaigns', 'Please try again shortly.');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []));

  const openCampaign = async (campaign: Campaign) => {
    try {
      if (!(await Linking.canOpenURL(campaign.campaignUrl))) throw new Error('Unsupported URL');
      await Linking.openURL(campaign.campaignUrl);
    } catch {
      Alert.alert('Invalid link', 'The link added by the administrator cannot be opened.');
    }
  };

  const volunteer = async (campaign: Campaign) => {
    if (campaign.isJoined || pendingCampaignId) return;
    setPendingCampaignId(campaign.id);
    try {
      const result = await updateCampaignInteraction(campaign.id, 'joined', true);
      setCampaigns(items => items.map(item => item.id === campaign.id ? { ...item, joined: result.count, isJoined: true } : item));
      Alert.alert('Volunteered!', 'Thank you for joining this campaign.');
    } catch (error: any) {
      console.warn('Campaign participation failed:', error);
      Alert.alert('Unable to volunteer', error?.message || 'Please try again.');
    } finally {
      setPendingCampaignId(null);
    }
  };

  return <View style={styles.screen}><SafeAreaView edges={['top']} style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.eyebrow}><MaterialIcons name="auto-awesome" size={22} color="#087D97" /><Text style={styles.eyebrowText}>Campaign Pack</Text></View>
      <Text style={styles.heading}>Ready to share &amp; spread</Text>
      {isLoading && <ActivityIndicator size="large" color="#087D97" style={styles.loader} />}
      {!isLoading && campaigns.length === 0 && <Text style={styles.empty}>No active campaigns yet.</Text>}
      {campaigns.map(campaign => <View key={campaign.id} style={styles.card}>
        <View style={styles.cardHeader}><View style={styles.cardHeading}><Text style={styles.platform}>{campaign.platform}</Text><Text style={styles.title}>{campaign.title}</Text></View><Pressable accessibilityLabel={`Open ${campaign.title}`} onPress={() => openCampaign(campaign)}><MaterialIcons name="open-in-new" size={23} color="#087D97" /></Pressable></View>
        <Text style={styles.description}>{campaign.description}</Text>
        <View style={styles.volunteerCount}><MaterialIcons name="groups" size={18} color="#5B6470" /><Text style={styles.countText}>{campaign.joined} volunteers</Text></View>
        <View style={styles.actions}>
          <Pressable style={[styles.button, styles.shareButton]} onPress={() => openCampaign(campaign)}><MaterialIcons name="share" size={19} color="#FFF" /><Text style={styles.shareText}>Share</Text></Pressable>
          <Pressable disabled={campaign.isJoined || pendingCampaignId === campaign.id} style={[styles.button, styles.volunteerButton, campaign.isJoined && styles.joinedButton]} onPress={() => volunteer(campaign)}>
            {pendingCampaignId === campaign.id ? <ActivityIndicator size="small" color="#087D97" /> : <MaterialIcons name={campaign.isJoined ? 'check' : 'group-add'} size={19} color="#087D97" />}
            <Text style={styles.volunteerText}>{campaign.isJoined ? 'Volunteered' : 'Volunteer'}</Text>
          </Pressable>
        </View>
      </View>)}
    </ScrollView><UserBottomNav />
  </SafeAreaView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FCF9F5' }, safe: { flex: 1 }, content: { padding: 18, paddingBottom: 30 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, eyebrowText: { color: '#087D97', fontSize: 16, fontWeight: '700' }, heading: { color: '#101722', fontSize: 29, lineHeight: 36, fontWeight: '800', marginTop: 10, marginBottom: 20 }, loader: { marginTop: 30 }, empty: { color: '#5B6470', textAlign: 'center', paddingVertical: 35 },
  card: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2D8CB', padding: 18, marginBottom: 15 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, cardHeading: { flex: 1, paddingRight: 12 }, platform: { color: '#121923', fontSize: 20, fontWeight: '800' }, title: { color: '#31435D', fontSize: 14, fontWeight: '600', marginTop: 4 }, description: { color: '#31435D', fontSize: 16, lineHeight: 23, marginTop: 13 }, volunteerCount: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }, countText: { color: '#5B6470', fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 9, marginTop: 16 }, button: { flex: 1, minHeight: 48, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, shareButton: { backgroundColor: '#087D97' }, shareText: { color: '#FFF', fontWeight: '700' }, volunteerButton: { backgroundColor: '#E4F1F3' }, joinedButton: { opacity: 0.75 }, volunteerText: { color: '#087D97', fontWeight: '700' },
});
