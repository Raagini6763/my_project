import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PendingStory {
  id: string;
  title: string;
  author: string;
  location: string;
  type: string;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Campaign {
  id: string;
  title: string;
  platform: string;
  posts: number;
  frequency: string;
  status: 'active' | 'draft' | 'completed';
}

export default function DashboardAdminScreen() {
  const [activeTab, setActiveTab] = useState<'stories' | 'campaigns'>('stories');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignPlatform, setCampaignPlatform] = useState('');
  const [campaignPosts, setCampaignPosts] = useState('');
  const [campaignFrequency, setCampaignFrequency] = useState('');

  const [pendingStories, setPendingStories] = useState<PendingStory[]>([
    {
      id: '1',
      title: 'Broken streetlights near school',
      author: 'Rahul Sharma',
      location: 'Wardha, MH',
      type: 'Podcast',
      description: 'Dark roads putting students at risk during evening classes',
      date: '2026-07-20',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Water shortage in slum area',
      author: 'Priya Patel',
      location: 'Mumbai, MH',
      type: 'Article',
      description: 'Residents walk over 2 km every day for clean drinking water.',
      date: '2026-07-19',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Unsafe bus stop for girls',
      author: 'Amit Kumar',
      location: 'Nagpur, MH',
      type: 'Reel',
      description: 'No shelter or lighting at main bus stop near college',
      date: '2026-07-18',
      status: 'pending',
    },
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'Instagram Campaign',
      platform: 'Instagram',
      posts: 5,
      frequency: 'Weekly',
      status: 'active',
    },
    {
      id: '2',
      title: 'WhatsApp Campaign',
      platform: 'WhatsApp',
      posts: 3,
      frequency: 'Weekly',
      status: 'active',
    },
  ]);

  const handleApprove = (storyId: string) => {
    setPendingStories(prev =>
      prev.map(story =>
        story.id === storyId
          ? { ...story, status: 'approved' }
          : story
      )
    );
    Alert.alert('Success', 'Story approved successfully!');
  };

  const handleReject = (storyId: string) => {
    Alert.alert(
      'Reject Story',
      'Are you sure you want to reject this story?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setPendingStories(prev =>
              prev.map(story =>
                story.id === storyId
                  ? { ...story, status: 'rejected' }
                  : story
              )
            );
            Alert.alert('Rejected', 'Story has been rejected.');
          },
        },
      ]
    );
  };

  const handleCreateCampaign = () => {
    if (!campaignTitle || !campaignPlatform || !campaignPosts || !campaignFrequency) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      title: campaignTitle,
      platform: campaignPlatform,
      posts: parseInt(campaignPosts),
      frequency: campaignFrequency,
      status: 'active',
    };

    setCampaigns(prev => [...prev, newCampaign]);
    setCampaignTitle('');
    setCampaignPlatform('');
    setCampaignPosts('');
    setCampaignFrequency('');
    setIsModalVisible(false);
    Alert.alert('Success', 'Campaign created successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FAD9DC';
      case 'approved': return '#DCF8E4';
      case 'rejected': return '#FFE5E5';
      default: return '#F0EDE8';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'pending': return '#B31217';
      case 'approved': return '#1B8A43';
      case 'rejected': return '#CC0000';
      default: return '#666';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'camera-alt';
      case 'WhatsApp': return 'chat';
      case 'Email': return 'email';
      default: return 'campaign';
    }
  };

  const pendingCount = pendingStories.filter(s => s.status === 'pending').length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, Admin</Text>
            <Text style={styles.subGreeting}>Manage stories & campaigns</Text>
          </View>
          <Pressable 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: () => router.push('/') 
                  },
                ]
              );
            }}
          >
            <MaterialIcons name="logout" size={24} color="#666" />
          </Pressable>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E5F0F3' }]}>
            <MaterialIcons name="pending-actions" size={28} color="#087D97" />
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Stories</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#DCF8E4' }]}>
            <MaterialIcons name="campaign" size={28} color="#1B8A43" />
            <Text style={styles.statNumber}>{campaigns.length}</Text>
            <Text style={styles.statLabel}>Active Campaigns</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'stories' && styles.activeTab]}
            onPress={() => setActiveTab('stories')}
          >
            <MaterialIcons 
              name="menu-book" 
              size={20} 
              color={activeTab === 'stories' ? '#087D97' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'stories' && styles.activeTabText]}>
              Stories ({pendingCount})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'campaigns' && styles.activeTab]}
            onPress={() => setActiveTab('campaigns')}
          >
            <MaterialIcons 
              name="campaign" 
              size={20} 
              color={activeTab === 'campaigns' ? '#087D97' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'campaigns' && styles.activeTabText]}>
              Campaigns
            </Text>
          </Pressable>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'stories' ? (
            <View>
              {pendingStories.filter(s => s.status === 'pending').length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="check-circle" size={64} color="#1B8A43" />
                  <Text style={styles.emptyStateText}>All stories reviewed!</Text>
                  <Text style={styles.emptyStateSubtext}>No pending stories to approve.</Text>
                </View>
              ) : (
                pendingStories
                  .filter(s => s.status === 'pending')
                  .map((story) => (
                    <View key={story.id} style={styles.storyCard}>
                      <View style={styles.storyHeader}>
                        <Text style={styles.storyTitle}>{story.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(story.status) }]}>
                          <Text style={[styles.statusText, { color: getStatusTextColor(story.status) }]}>
                            {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.storyAuthor}>By {story.author}</Text>
                      <Text style={styles.storyDescription}>{story.description}</Text>
                      <View style={styles.storyMeta}>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="location-on" size={16} color="#666" />
                          <Text style={styles.metaText}>{story.location}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="mic" size={16} color="#666" />
                          <Text style={styles.metaText}>{story.type}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <MaterialIcons name="calendar-today" size={16} color="#666" />
                          <Text style={styles.metaText}>{story.date}</Text>
                        </View>
                      </View>
                      <View style={styles.actionButtons}>
                        <Pressable 
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => handleApprove(story.id)}
                        >
                          <MaterialIcons name="check" size={20} color="#FFF" />
                          <Text style={styles.actionButtonText}>Approve</Text>
                        </Pressable>
                        <Pressable 
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleReject(story.id)}
                        >
                          <MaterialIcons name="close" size={20} color="#FFF" />
                          <Text style={styles.actionButtonText}>Reject</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))
              )}
            </View>
          ) : (
            <View>
              <Pressable 
                style={styles.createCampaignButton}
                onPress={() => setIsModalVisible(true)}
              >
                <MaterialIcons name="add" size={24} color="#FFF" />
                <Text style={styles.createCampaignText}>Create New Campaign</Text>
              </Pressable>

              {campaigns.map((campaign) => (
                <View key={campaign.id} style={styles.campaignCard}>
                  <View style={styles.campaignHeader}>
                    <View style={styles.campaignIconContainer}>
                      <MaterialIcons 
                        name={getPlatformIcon(campaign.platform)} 
                        size={24} 
                        color="#087D97" 
                      />
                    </View>
                    <View style={styles.campaignInfo}>
                      <Text style={styles.campaignTitle}>{campaign.title}</Text>
                      <Text style={styles.campaignDetails}>
                        {campaign.posts} posts • {campaign.frequency}
                      </Text>
                    </View>
                    <View style={[styles.campaignStatus, { backgroundColor: '#DCF8E4' }]}>
                      <Text style={styles.campaignStatusText}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Create Campaign Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Campaign</Text>
                <Pressable onPress={() => setIsModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </Pressable>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Campaign Title</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter campaign title"
                    placeholderTextColor="#999"
                    value={campaignTitle}
                    onChangeText={setCampaignTitle}
                  />
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Platform</Text>
                  <View style={styles.platformButtons}>
                    {['Instagram', 'WhatsApp', 'Email', 'Community'].map((platform) => (
                      <Pressable
                        key={platform}
                        style={[
                          styles.platformButton,
                          campaignPlatform === platform && styles.platformButtonActive,
                        ]}
                        onPress={() => setCampaignPlatform(platform)}
                      >
                        <Text 
                          style={[
                            styles.platformButtonText,
                            campaignPlatform === platform && styles.platformButtonTextActive,
                          ]}
                        >
                          {platform}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.modalRow}>
                  <View style={[styles.modalInputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.modalLabel}>Posts</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Number"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={campaignPosts}
                      onChangeText={setCampaignPosts}
                    />
                  </View>
                  <View style={[styles.modalInputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.modalLabel}>Frequency</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Weekly/Daily"
                      placeholderTextColor="#999"
                      value={campaignFrequency}
                      onChangeText={setCampaignFrequency}
                    />
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <Pressable 
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={handleCreateCampaign}
                  >
                    <Text style={styles.modalSaveText}>Create</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF9F5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D2530',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D2530',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0EDE8',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#E5F0F3',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#087D97',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  storyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7DDD2',
    padding: 16,
    marginBottom: 12,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  storyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1D2530',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  storyAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  storyDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  storyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#1B8A43',
  },
  rejectButton: {
    backgroundColor: '#CC0000',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D2530',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  createCampaignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#087D97',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  createCampaignText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  campaignCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7DDD2',
    padding: 16,
    marginBottom: 12,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E5F0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D2530',
  },
  campaignDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  campaignStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  campaignStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B8A43',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D2530',
  },
  modalForm: {
    gap: 16,
  },
  modalInputGroup: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E7DDD2',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  modalRow: {
    flexDirection: 'row',
  },
  platformButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0EDE8',
  },
  platformButtonActive: {
    backgroundColor: '#087D97',
  },
  platformButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  platformButtonTextActive: {
    color: '#FFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F0EDE8',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    backgroundColor: '#087D97',
  },
  modalSaveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});