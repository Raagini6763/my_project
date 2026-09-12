import { TranslatedText as Text } from '@/components/translated-text';
import { TranslatedTextInput as TextInput } from '@/components/translated-text-input';
import { createCampaign, createPodcast, fetchAdminAnalytics, fetchAdminProfile, fetchCampaigns, fetchPendingStories, fetchPublishedPodcasts, logoutAdmin, subscribeToAdminSession, updateAdminCredentials, updateStoryStatus } from '@/services/firebaseService';
import { normalizeCampaignUrl } from '@/utils/validation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
  description: string;
  joined: number;
  posts?: number;
  frequency?: string;
  status: 'active' | 'draft' | 'completed';
  campaignUrl: string;
}

type Analytics = { submitted: number; pending: number; approved: number; rejected: number; campaigns: number; volunteers: number; writing: number; media: number };
type Podcast = { id: string; title: string; description: string; listenUrl: string; status: 'published' };

const emptyAnalytics: Analytics = { submitted: 0, pending: 0, approved: 0, rejected: 0, campaigns: 0, volunteers: 0, writing: 0, media: 0 };

export default function DashboardAdminScreen() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'stories' | 'campaigns' | 'podcasts'>('analytics');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCampaignSuccessVisible, setIsCampaignSuccessVisible] = useState(false);
  const [isPodcastModalVisible, setIsPodcastModalVisible] = useState(false);
  const [podcastTitle, setPodcastTitle] = useState('');
  const [podcastDescription, setPodcastDescription] = useState('');
  const [podcastUrl, setPodcastUrl] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignPlatform, setCampaignPlatform] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignUrl, setCampaignUrl] = useState('');
  const [isCredentialsModalVisible, setIsCredentialsModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);

  const [pendingStories, setPendingStories] = useState<PendingStory[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [adminName, setAdminName] = useState('Admin');
  const [analytics, setAnalytics] = useState<Analytics>(emptyAnalytics);

  useEffect(() => {
    const loadData = async () => {
      const [storiesData, campaignsData, adminProfile, analyticsData, podcastData] = await Promise.all([
        fetchPendingStories(),
        fetchCampaigns(),
        fetchAdminProfile(),
        fetchAdminAnalytics(),
        fetchPublishedPodcasts(),
      ]);

      setPendingStories(storiesData as PendingStory[]);
      setCampaigns(campaignsData as Campaign[]);
      setAdminName(adminProfile?.name || 'Admin');
      setAnalytics(analyticsData);
      setPodcasts(podcastData as Podcast[]);
    };

    const unsubscribe = subscribeToAdminSession((isAdmin) => {
      if (!isAdmin) {
        router.replace('/login');
        return;
      }
      loadData().catch(() => Alert.alert('Error', 'Admin data could not be loaded.'));
    });
    return unsubscribe;
  }, []);

  const handleApprove = async (storyId: string) => {
    const success = await updateStoryStatus(storyId, 'approved');
    if (success) {
      setPendingStories(prev => prev.filter(story => story.id !== storyId));
      setAnalytics(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), approved: prev.approved + 1 }));
      Alert.alert('Success', 'Story approved successfully!');
    } else {
      Alert.alert('Error', 'Could not approve story right now.');
    }
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
          onPress: async () => {
            const success = await updateStoryStatus(storyId, 'rejected');
            if (success) {
              setPendingStories(prev => prev.filter(story => story.id !== storyId));
              setAnalytics(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), rejected: prev.rejected + 1 }));
              Alert.alert('Rejected', 'Story has been rejected.');
            } else {
              Alert.alert('Error', 'Could not reject story right now.');
            }
          },
        },
      ]
    );
  };

  const handleCreateCampaign = async () => {
    if (!campaignTitle.trim() || !campaignPlatform || !campaignDescription.trim() || !campaignUrl.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const normalizedUrl = normalizeCampaignUrl(campaignUrl);
    if (!normalizedUrl) {
      Alert.alert('Error', 'Please enter a valid campaign link.');
      return;
    }

    const created = await createCampaign({
      title: campaignTitle,
      platform: campaignPlatform,
      description: campaignDescription.trim(),
      campaignUrl: normalizedUrl,
    });

    if (created) {
      setCampaigns(prev => [...prev, created as Campaign]);
      setAnalytics(prev => ({ ...prev, campaigns: prev.campaigns + 1 }));
      setCampaignTitle('');
      setCampaignPlatform('');
      setCampaignDescription('');
      setCampaignUrl('');
      setIsModalVisible(false);
      setIsCampaignSuccessVisible(true);
    } else {
      Alert.alert('Error', 'Could not create campaign right now.');
    }
  };

  const handleCreatePodcast = async () => {
    if (!podcastTitle.trim() || !podcastDescription.trim() || !podcastUrl.trim()) {
      Alert.alert('Incomplete', 'Please add the podcast title, description and link.');
      return;
    }
    const normalizedUrl = normalizeCampaignUrl(podcastUrl);
    if (!normalizedUrl) {
      Alert.alert('Invalid link', 'Please enter a valid podcast link.');
      return;
    }
    try {
      const created = await createPodcast({ title: podcastTitle, description: podcastDescription, listenUrl: normalizedUrl });
      setPodcasts(items => [...items, created as Podcast]);
      setPodcastTitle('');
      setPodcastDescription('');
      setPodcastUrl('');
      setIsPodcastModalVisible(false);
      Alert.alert('Podcast published', 'The podcast is now visible under Stories → Podcast.');
    } catch (error: any) {
      Alert.alert('Unable to publish podcast', error?.message || 'Please try again.');
    }
  };

  const closeCredentialsModal = () => {
    setIsCredentialsModalVisible(false);
    setCurrentPassword('');
    setNewEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleUpdateCredentials = async () => {
    if (!currentPassword) return Alert.alert('Error', 'Enter your current password.');
    if (!newEmail.trim() && !newPassword) return Alert.alert('Error', 'Enter a new email or password.');
    if (newPassword && newPassword.length < 6) return Alert.alert('Error', 'The new password must be at least 6 characters.');
    if (newPassword !== confirmNewPassword) return Alert.alert('Error', 'The new passwords do not match.');

    try {
      setIsUpdatingCredentials(true);
      await updateAdminCredentials({ currentPassword, newEmail: newEmail.trim(), newPassword });
      closeCredentialsModal();
      Alert.alert('Success', 'Admin credentials updated successfully.');
    } catch (error: any) {
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'The current password is incorrect.',
        'auth/wrong-password': 'The current password is incorrect.',
        'auth/email-already-in-use': 'That email address is already in use.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/weak-password': 'Choose a stronger password.',
      };
      Alert.alert('Update failed', messages[error?.code] || error?.message || 'Could not update admin credentials.');
    } finally {
      setIsUpdatingCredentials(false);
    }
  };

  const performLogout = async () => {
    try {
      await logoutAdmin();
      router.replace('/');
    } catch (error) {
      console.warn('Admin logout failed:', error);
      Alert.alert('Logout failed', 'Could not log out. Please try again.');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm('Are you sure you want to logout?')) void performLogout();
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => void performLogout() },
    ]);
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

  const openCampaignsTab = async () => {
    setActiveTab('campaigns');
    const latestCampaigns = await fetchCampaigns();
    setCampaigns(latestCampaigns as Campaign[]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, {adminName}</Text>
            <Text style={styles.subGreeting}>Manage stories & campaigns</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.logoutButton} accessibilityLabel="Update admin credentials" onPress={() => setIsCredentialsModalVisible(true)}>
              <MaterialIcons name="manage-accounts" size={25} color="#087D97" />
            </Pressable>
            <Pressable style={styles.logoutButton} onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={24} color="#666" />
            </Pressable>
          </View>
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
          <Pressable style={[styles.tab, activeTab === 'analytics' && styles.activeTab]} onPress={() => setActiveTab('analytics')}>
            <MaterialIcons name="analytics" size={20} color={activeTab === 'analytics' ? '#087D97' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
          </Pressable>
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
            onPress={() => void openCampaignsTab()}
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
          <Pressable style={[styles.tab, activeTab === 'podcasts' && styles.activeTab]} onPress={() => setActiveTab('podcasts')}>
            <MaterialIcons name="podcasts" size={20} color={activeTab === 'podcasts' ? '#087D97' : '#666'} />
            <Text style={[styles.tabText, activeTab === 'podcasts' && styles.activeTabText]}>Podcasts</Text>
          </Pressable>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'analytics' ? (
            <View>
              <View style={styles.analyticsHeadingRow}>
                <MaterialIcons name="bar-chart" size={25} color="#087D97" />
                <Text style={styles.analyticsEyebrow}>Private admin area</Text>
              </View>
              <Text style={styles.analyticsTitle}>Analytics dashboard</Text>
              <Text style={styles.analyticsSubtitle}>Program activity at a glance</Text>
              <View style={styles.analyticsGrid}>
                {[
                  ['Stories submitted', analytics.submitted],
                  ['Awaiting review', analytics.pending],
                  ['Stories approved', analytics.approved],
                  ['Stories rejected', analytics.rejected],
                  ['Active campaigns', analytics.campaigns],
                  ['Campaign volunteers', analytics.volunteers],
                  ['Writing stories', analytics.writing],
                  ['Media stories', analytics.media],
                ].map(([label, value]) => (
                  <View key={String(label)} style={styles.analyticsCard}>
                    <Text style={styles.analyticsNumber}>{value}</Text>
                    <Text style={styles.analyticsLabel}>{label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.qualityCard}>
                <Text style={styles.qualityTitle}>Participation quality</Text>
                {[
                  ['Approval rate', analytics.submitted ? Math.round((analytics.approved / analytics.submitted) * 100) : 0],
                  ['Review completion', analytics.submitted ? Math.round(((analytics.approved + analytics.rejected) / analytics.submitted) * 100) : 0],
                  ['Media participation', analytics.submitted ? Math.round((analytics.media / analytics.submitted) * 100) : 0],
                ].map(([label, value]) => (
                  <View key={String(label)} style={styles.qualityRow}>
                    <Text style={styles.qualityLabel}>{label}</Text>
                    <Text style={styles.qualityValue}>{value}%</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : activeTab === 'stories' ? (
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
          ) : activeTab === 'campaigns' ? (
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
                      <Text style={styles.campaignDetails}>{campaign.description || 'No description provided.'}</Text>
                      <Text style={styles.campaignVolunteerCount}>{Number(campaign.joined) || 0} volunteers</Text>
                      <Text style={[styles.campaignDetails, styles.legacyCampaignDetails]}>
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
          ) : (
            <View>
              <Pressable style={styles.createCampaignButton} onPress={() => setIsPodcastModalVisible(true)}>
                <MaterialIcons name="add" size={24} color="#FFF" />
                <Text style={styles.createCampaignText}>Add Podcast</Text>
              </Pressable>
              {podcasts.length === 0 && <Text style={styles.emptyStateSubtext}>No podcast episodes published yet.</Text>}
              {podcasts.map(podcast => (
                <View key={podcast.id} style={styles.campaignCard}>
                  <View style={styles.campaignHeader}>
                    <View style={styles.campaignIconContainer}><MaterialIcons name="podcasts" size={24} color="#087D97" /></View>
                    <View style={styles.campaignInfo}>
                      <Text style={styles.campaignTitle}>{podcast.title}</Text>
                      <Text style={styles.campaignDetails}>{podcast.description}</Text>
                      <Text style={styles.podcastLink} numberOfLines={1}>{podcast.listenUrl}</Text>
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

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Short description</Text>
                  <TextInput
                    style={[styles.modalInput, styles.descriptionInput]}
                    placeholder="Tell users what this campaign is about"
                    placeholderTextColor="#999"
                    value={campaignDescription}
                    onChangeText={setCampaignDescription}
                    multiline
                    textAlignVertical="top"
                    maxLength={300}
                  />
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Campaign link</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="https://example.com/campaign"
                    placeholderTextColor="#999"
                    keyboardType="url"
                    autoCapitalize="none"
                    value={campaignUrl}
                    onChangeText={setCampaignUrl}
                  />
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

        <Modal visible={isPodcastModalVisible} animationType="slide" transparent onRequestClose={() => setIsPodcastModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Podcast</Text>
                <Pressable onPress={() => setIsPodcastModalVisible(false)}><MaterialIcons name="close" size={24} color="#333" /></Pressable>
              </View>
              <View style={styles.modalForm}>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Podcast title</Text>
                  <TextInput style={styles.modalInput} placeholder="Enter episode title" placeholderTextColor="#999" value={podcastTitle} onChangeText={setPodcastTitle} />
                </View>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Description</Text>
                  <TextInput style={[styles.modalInput, styles.descriptionInput]} placeholder="Describe this episode" placeholderTextColor="#999" value={podcastDescription} onChangeText={setPodcastDescription} multiline textAlignVertical="top" maxLength={500} />
                </View>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Podcast link</Text>
                  <TextInput style={styles.modalInput} placeholder="https://open.spotify.com/..." placeholderTextColor="#999" value={podcastUrl} onChangeText={setPodcastUrl} keyboardType="url" autoCapitalize="none" />
                </View>
                <View style={styles.modalButtons}>
                  <Pressable style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setIsPodcastModalVisible(false)}><Text style={styles.modalCancelText}>Cancel</Text></Pressable>
                  <Pressable style={[styles.modalButton, styles.modalSaveButton]} onPress={() => void handleCreatePodcast()}><Text style={styles.modalSaveText}>Publish</Text></Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={isCampaignSuccessVisible} animationType="fade" transparent onRequestClose={() => setIsCampaignSuccessVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, styles.successModalContent]}>
              <View style={styles.successIcon}>
                <MaterialIcons name="check" size={48} color="#FFF" />
              </View>
              <Text style={styles.successTitle}>Campaign created</Text>
              <Text style={styles.successMessage}>The campaign was created successfully and is now visible to users.</Text>
              <Pressable style={styles.successButton} onPress={() => setIsCampaignSuccessVisible(false)}>
                <Text style={styles.successButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={isCredentialsModalVisible} animationType="slide" transparent onRequestClose={closeCredentialsModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update admin credentials</Text>
                <Pressable onPress={closeCredentialsModal}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </Pressable>
              </View>
              <View style={styles.modalForm}>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Current password</Text>
                  <TextInput style={styles.modalInput} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" />
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>New email (optional)</Text>
                  <TextInput style={styles.modalInput} value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>New password (optional)</Text>
                  <TextInput style={styles.modalInput} value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" />
                </View>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Confirm new password</Text>
                  <TextInput style={styles.modalInput} value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry autoCapitalize="none" />
                </View>
                <View style={styles.modalButtons}>
                  <Pressable style={[styles.modalButton, styles.modalCancelButton]} onPress={closeCredentialsModal} disabled={isUpdatingCredentials}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, styles.modalSaveButton, isUpdatingCredentials && styles.disabledButton]} onPress={handleUpdateCredentials} disabled={isUpdatingCredentials}>
                    <Text style={styles.modalSaveText}>{isUpdatingCredentials ? 'Updating...' : 'Update'}</Text>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
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
  analyticsHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  analyticsEyebrow: { color: '#087D97', fontSize: 16, fontWeight: '700' },
  analyticsTitle: { color: '#1D2530', fontSize: 28, fontWeight: '800', marginTop: 12 },
  analyticsSubtitle: { color: '#666', fontSize: 16, marginTop: 4, marginBottom: 20 },
  analyticsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  analyticsCard: { width: '48%', minHeight: 120, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2DDD4', borderRadius: 18, padding: 18, justifyContent: 'center' },
  analyticsNumber: { color: '#087D97', fontSize: 31, fontWeight: '800' },
  analyticsLabel: { color: '#5B6470', fontSize: 15, lineHeight: 20, marginTop: 10 },
  qualityCard: { backgroundColor: '#E2EFF0', borderWidth: 1, borderColor: '#A9CDD1', borderRadius: 20, padding: 20, marginTop: 20 },
  qualityTitle: { color: '#1D2530', fontSize: 18, fontWeight: '800', marginBottom: 14 },
  qualityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  qualityLabel: { color: '#5B6470', fontSize: 15 },
  qualityValue: { color: '#1D2530', fontSize: 16, fontWeight: '700' },
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
  campaignVolunteerCount: {
    color: '#087D97',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  podcastLink: {
    color: '#087D97',
    fontSize: 12,
    marginTop: 7,
  },
  legacyCampaignDetails: {
    display: 'none',
  },
  successModalContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B8A43',
    marginBottom: 18,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D2530',
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    lineHeight: 23,
    color: '#5B6470',
    textAlign: 'center',
    marginBottom: 22,
  },
  successButton: {
    width: '100%',
    backgroundColor: '#087D97',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
  descriptionInput: {
    minHeight: 90,
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
