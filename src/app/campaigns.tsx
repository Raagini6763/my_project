import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, usePathname } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, Path, Rect, Svg } from 'react-native-svg';

const getNavigationItems = (pathname: string) => [
  { label: "Home", icon: "home" as const, route: "/", active: pathname === "/" || pathname === "/dashboard" },
  { label: "Stories", icon: "menu-book" as const, route: "/stories", active: pathname === "/stories" },
  { label: "Upload", icon: "ios-share" as const, route: "/upload", active: pathname === "/upload" },
  { label: "Campaigns", icon: "campaign" as const, route: "/campaigns", active: pathname === "/campaigns" },
  { label: "Action", icon: "bolt" as const, route: "/action", active: pathname === "/action" },
];

interface Campaign {
  id: string;
  title: string;
  platform: string;
  platformIcon: any;
  posts: number;
  frequency: string;
  joined: number;
  reach: number | string;
  isJoined: boolean;
  isShared: boolean;
  color: string;
  isCustomIcon?: boolean;
}

const InstagramIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5"
      ry="5"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8" fill="none" />
    <Circle cx="18" cy="6" r="1.5" fill={color} />
  </Svg>
);

const WhatsAppIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12c0 1.89.55 3.63 1.5 5.12L2 22l4.88-1.5C8.37 21.45 10.11 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    <Path
      d="M16.5 13.2c-.3-.15-1.8-.9-2.1-1-.3-.1-.5-.15-.7.15-.2.3-.8.9-.95 1.1-.15.2-.3.25-.6.1-.3-.15-1.2-.45-2.3-1.45-.85-.8-1.4-1.75-1.55-2.05-.15-.3-.02-.45.1-.6.1-.15.25-.3.35-.45.1-.15.15-.25.25-.45.1-.2 0-.4-.05-.55-.05-.15-.7-1.7-.95-2.3-.25-.6-.5-.5-.7-.5-.15 0-.35-.05-.55-.05-.2 0-.5.05-.75.25-.25.2-1 .95-1 2.35 0 1.4 1 2.75 1.15 2.95.15.2 2 3.05 4.85 4.1.85.3 1.5.5 2.05.65.85.3 1.65.25 2.25.1.7-.15 1.8-.75 2.05-1.45.25-.7.25-1.3.15-1.45-.1-.15-.35-.25-.65-.4z"
      fill={color}
    />
  </Svg>
);

export default function CampaignsScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      title: "Instagram",
      platform: "Instagram",
      platformIcon: "instagram",
      posts: 5,
      frequency: "Weekly",
      joined: 28,
      reach: "2,400+",
      isJoined: false,
      isShared: false,
      color: "#E4405F",
      isCustomIcon: true,
    },
    {
      id: "2",
      title: "WhatsApp",
      platform: "WhatsApp",
      platformIcon: "whatsapp",
      posts: 3,
      frequency: "Weekly",
      joined: 45,
      reach: "3,100+",
      isJoined: false,
      isShared: false,
      color: "#25D366",
      isCustomIcon: true,
    },
    {
      id: "3",
      title: "Email",
      platform: "Email",
      platformIcon: "email",
      posts: 2,
      frequency: "Weekly",
      joined: 12,
      reach: "890+",
      isJoined: false,
      isShared: false,
      color: "#EA4335",
      isCustomIcon: false,
    },
    {
      id: "4",
      title: "Community",
      platform: "Community",
      platformIcon: "people",
      posts: 1,
      frequency: "Ongoing",
      joined: 156,
      reach: "Expanding",
      isJoined: false,
      isShared: false,
      color: "#7B61FF",
      isCustomIcon: false,
    },
  ]);

  const pathname = usePathname();
  const navigation = getNavigationItems(pathname);

  const handleShare = (campaignId: string) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? {
              ...campaign,
              isShared: !campaign.isShared,
            }
          : campaign
      )
    );
    
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      Alert.alert(
        campaign.isShared ? "Unshared" : "Shared!",
        campaign.isShared
          ? `You have unshared the ${campaign.platform} campaign.`
          : `You have shared the ${campaign.platform} campaign with your network! 📢`,
        [{ text: "OK" }]
      );
    }
  };

  const handleVolunteer = (campaignId: string) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? {
              ...campaign,
              isJoined: !campaign.isJoined,
              joined: campaign.isJoined 
                ? campaign.joined - 1 
                : campaign.joined + 1,
            }
          : campaign
      )
    );
    
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      Alert.alert(
        campaign.isJoined ? "Left Campaign" : "Volunteered!",
        campaign.isJoined
          ? `You have left the ${campaign.platform} campaign.`
          : `Thank you for volunteering for the ${campaign.platform} campaign! 🙌`,
        [{ text: "OK" }]
      );
    }
  };

  const renderPlatformIcon = (campaign: Campaign) => {
    if (campaign.platform === "Instagram" && campaign.isCustomIcon) {
      return <InstagramIcon color={campaign.color} />;
    } else if (campaign.platform === "WhatsApp" && campaign.isCustomIcon) {
      return <WhatsAppIcon color={campaign.color} />;
    } else {
      return (
        <MaterialIcons 
          name={campaign.platformIcon} 
          size={24} 
          color={campaign.color} 
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.heading}>Campaign Pack</Text>
          <Text style={styles.subheading}>Ready to share & spread</Text>

          <View style={styles.campaignsList}>
            {campaigns.map((campaign) => (
              <View key={campaign.id} style={styles.campaignCard}>
                {/* Platform Header */}
                <View style={styles.platformHeader}>
                  <View style={styles.platformInfo}>
                    <View style={[styles.iconContainer, { backgroundColor: campaign.color + '15' }]}>
                      {renderPlatformIcon(campaign)}
                    </View>
                    <View>
                      <Text style={styles.platformTitle}>{campaign.platform}</Text>
                      <Text style={styles.platformDetails}>
                        {campaign.posts} posts • {campaign.frequency}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${Math.min((campaign.joined / 200) * 100, 100)}%`,
                            backgroundColor: campaign.color 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <MaterialIcons name="groups" size={18} color="#666" />
                      <Text style={styles.statText}>{campaign.joined} joined</Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialIcons name="visibility" size={18} color="#666" />
                      <Text style={styles.statText}>{campaign.reach} reach</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      campaign.isShared ? styles.sharedButton : styles.shareButton,
                    ]}
                    onPress={() => handleShare(campaign.id)}
                  >
                    <MaterialIcons 
                      name={campaign.isShared ? "check" : "share"} 
                      size={20} 
                      color={campaign.isShared ? "#FFF" : campaign.color} 
                    />
                    <Text 
                      style={[
                        styles.actionButtonText,
                        campaign.isShared && { color: "#FFF" }
                      ]}
                    >
                      {campaign.isShared ? "Shared ✓" : "Share"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.actionButton,
                      campaign.isJoined ? styles.volunteeredButton : styles.volunteerButton,
                    ]}
                    onPress={() => handleVolunteer(campaign.id)}
                  >
                    <MaterialIcons 
                      name={campaign.isJoined ? "check" : "volunteer-activism"} 
                      size={20} 
                      color={campaign.isJoined ? "#FFF" : campaign.color} 
                    />
                    <Text 
                      style={[
                        styles.actionButtonText,
                        campaign.isJoined && { color: "#FFF" }
                      ]}
                    >
                      {campaign.isJoined ? "Volunteered ✓" : "Volunteer"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {navigation.map((item) => {
            const color = item.active
              ? "#087D97"
              : "#5B6470";

            return (
              <Pressable
                key={item.label}
                style={styles.navItem}
                onPress={() => router.push(item.route as any)}
              >
                <MaterialIcons
                  name={item.icon}
                  size={26}
                  color={color}
                />
                <Text style={{ color, fontSize: 12 }}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCF9F5",
  },
  content: {
    padding: 22,
    paddingBottom: 110,
  },
  heading: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1D2530",
    marginBottom: 6,
  },
  subheading: {
    fontSize: 17,
    color: "#666",
    marginBottom: 24,
  },
  campaignsList: {
    gap: 16,
  },
  campaignCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7DDD2",
    padding: 18,
  },
  platformHeader: {
    marginBottom: 16,
  },
  platformInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  platformTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1D2530",
  },
  platformDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  progressSection: {
    backgroundColor: "#F8F6F3",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  progressItem: {
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E8E5DF",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  shareButton: {
    backgroundColor: "#FFF",
    borderColor: "#E7DDD2",
  },
  sharedButton: {
    backgroundColor: "#087D97",
    borderColor: "#087D97",
  },
  volunteerButton: {
    backgroundColor: "#FFF",
    borderColor: "#E7DDD2",
  },
  volunteeredButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#E5DDD3",
    flexDirection: "row",
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
});