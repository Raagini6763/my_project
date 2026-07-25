import { fetchApprovedStories } from '@/services/firebaseService';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ResizeMode, Video } from 'expo-av';
import { router, useFocusEffect, usePathname } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const filters = ["Podcast", "Reel", "Voice Note", "Article", "Photo Essay"];

const initialStories = [
  {
    id: "1",
    title: "Broken streetlights near school",
    type: "Podcast",
    description:
      "Dark roads putting students at risk during evening classes",
    status: "Needs awareness",
    statusColor: "#FAD9DC",
    statusText: "#B31217",
    location: "Wardha, MH",
    likes: 47,
    volunteers: 12,
    views: 188,
    isLiked: false,
    isJoined: false,
    isVolunteered: false,
  },
  {
    id: "2",
    title: "Unsafe bus stop for girls",
    type: "Reel",
    description:
      "No shelter or lighting at main bus stop near college",
    status: "Campaign live",
    statusColor: "#FFF1B5",
    statusText: "#A05A00",
    location: "Nagpur, MH",
    likes: 89,
    volunteers: 28,
    views: 356,
    isLiked: false,
    isJoined: false,
    isVolunteered: false,
  },
  {
    id: "3",
    title: "Water shortage in slum area",
    type: "Article",
    description:
      "Residents walk over 2 km every day for clean drinking water.",
    status: "Solved",
    statusColor: "#DCF8E4",
    statusText: "#1B8A43",
    location: "Mumbai, MH",
    likes: 132,
    volunteers: 45,
    views: 501,
    isLiked: false,
    isJoined: false,
    isVolunteered: false,
  },
];

const getNavigationItems = (pathname: string) => [
  { label: "Home", icon: "home" as const, route: "/", active: pathname === "/" || pathname === "/dashboard" },
  { label: "Stories", icon: "menu-book" as const, route: "/stories", active: pathname === "/stories" },
  { label: "Upload", icon: "ios-share" as const, route: "/upload", active: pathname === "/upload" },
  { label: "Campaigns", icon: "campaign" as const, route: "/campaigns", active: pathname === "/campaigns" },
  { label: "Action", icon: "bolt" as const, route: "/action", active: pathname === "/action" },
];

export default function StoriesScreen() {
  const [selectedFilter, setSelectedFilter] = useState("Podcast");
  const [stories, setStories] = useState<any[]>(initialStories);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const navigation = getNavigationItems(pathname);

  useFocusEffect(
    useCallback(() => {
      let active = true;
    const loadStories = async () => {
      setIsLoading(true);
      const approvedStories = await fetchApprovedStories();
      if (active) {
        setStories(approvedStories);
        setIsLoading(false);
      }
    };

    loadStories();
      return () => {
        active = false;
      };
    }, [])
  );

  const filteredStories = stories.filter((story) =>
    selectedFilter === ""
      ? true
      : story.type === selectedFilter
  );

  const handleLike = (storyId: string) => {
    setStories(prevStories =>
      prevStories.map(story =>
        story.id === storyId
          ? {
              ...story,
              isLiked: !story.isLiked,
              likes: story.isLiked ? story.likes - 1 : story.likes + 1,
            }
          : story
      )
    );
  };

  const handleJoin = (storyId: string) => {
    setStories(prevStories =>
      prevStories.map(story =>
        story.id === storyId
          ? {
              ...story,
              isJoined: !story.isJoined,
              volunteers: story.isJoined ? story.volunteers - 1 : story.volunteers + 1,
            }
          : story
      )
    );
    
    const story = stories.find(s => s.id === storyId);
    if (story) {
      Alert.alert(
        story.isJoined ? "Left Campaign" : "Joined Campaign!",
        story.isJoined
          ? `You have left the campaign: "${story.title}"`
          : `You have successfully joined the campaign: "${story.title}"`,
        [{ text: "OK" }]
      );
    }
  };

  const handleShare = (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (story) {
      Alert.alert(
        "Share Story",
        `Share "${story.title}" with your network?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Share",
            onPress: () => {
              // In a real app, you'd use the Share API
              Alert.alert("Shared!", `"${story.title}" has been shared.`, [{ text: "OK" }]);
            },
          },
        ]
      );
    }
  };

  const handleVolunteer = (storyId: string) => {
    setStories(prevStories =>
      prevStories.map(story =>
        story.id === storyId
          ? {
              ...story,
              isVolunteered: !story.isVolunteered,
              volunteers: story.isVolunteered ? story.volunteers - 1 : story.volunteers + 1,
            }
          : story
      )
    );
    
    const story = stories.find(s => s.id === storyId);
    if (story) {
      Alert.alert(
        story.isVolunteered ? "Withdrew Volunteer" : "Volunteered!",
        story.isVolunteered
          ? `You have withdrawn your volunteer offer for: "${story.title}"`
          : `Thank you for volunteering to help with: "${story.title}"`,
        [{ text: "OK" }]
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
          <Text style={styles.heading}>Browse Stories</Text>

          <Text style={styles.subheading}>
            {isLoading ? 'Loading approved stories...' : 'Stories by media type'}
          </Text>

          {/* FILTERS */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 18 }}
          >
            {filters.map((item) => {
              const active = item === selectedFilter;

              return (
                <Pressable
                  key={item}
                  onPress={() => setSelectedFilter(item)}
                  style={[
                    styles.filter,
                    active && styles.activeFilter,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      active && { color: "white" },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* STORIES */}

          <View style={{ marginTop: 22 }}>
            {filteredStories.length === 0 ? (
              <Text style={styles.emptyState}>No approved stories yet.</Text>
            ) : filteredStories.map((story) => (
              <View key={story.id} style={styles.card}>
                {/* Title Row */}
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={2}>
                    {story.title}
                  </Text>

                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: story.statusColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: story.statusText }
                      ]}
                    >
                      {story.status}
                    </Text>
                  </View>
                </View>

                {/* TYPE */}

                <View style={styles.typeChip}>
                  <Text style={styles.typeText}>{story.type}</Text>
                </View>

                {/* DESCRIPTION */}

                <Text style={styles.description}>
                  {story.description}
                </Text>

                {story.mediaUrl && story.mediaType === 'image' ? (
                  <Image source={{ uri: story.mediaUrl }} style={styles.storyMedia} resizeMode="cover" />
                ) : null}

                {story.mediaUrl && story.mediaType === 'video' ? (
                  <Video
                    source={{ uri: story.mediaUrl }}
                    style={styles.storyMedia}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                  />
                ) : null}

                {story.mediaUrl && story.mediaType === 'audio' ? (
                  <Pressable style={styles.audioButton} onPress={() => Linking.openURL(story.mediaUrl)}>
                    <MaterialIcons name="play-arrow" size={22} color="#FFF" />
                    <Text style={styles.audioButtonText}>Play voice recording</Text>
                  </Pressable>
                ) : null}

                {/* LOCATION */}

                <View style={styles.infoRow}>
                  <View style={styles.location}>
                    <MaterialIcons
                      name="location-on"
                      size={18}
                      color="#616161"
                    />

                    <Text style={styles.locationText}>
                      {story.location}
                    </Text>
                  </View>

                  <View style={styles.stats}>
                    <Pressable 
                      style={styles.iconText} 
                      onPress={() => handleLike(story.id)}
                    >
                      <MaterialIcons
                        name={story.isLiked ? "favorite" : "favorite-border"}
                        size={19}
                        color={story.isLiked ? "#FF3C54" : "#555"}
                      />
                      <Text style={styles.statText}>{story.likes}</Text>
                    </Pressable>

                    <View style={styles.iconText}>
                      <MaterialIcons
                        name="groups"
                        size={18}
                        color="#555"
                      />
                      <Text style={styles.statText}>{story.volunteers}</Text>
                    </View>

                    <View style={styles.iconText}>
                      <MaterialIcons
                        name="visibility"
                        size={18}
                        color="#555"
                      />
                      <Text style={styles.statText}>{story.views}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* BUTTONS */}

                <View style={styles.buttons}>
                  <Pressable
                    style={[
                      styles.button,
                      story.isJoined ? styles.joinedButton : styles.joinButton,
                    ]}
                    onPress={() => handleJoin(story.id)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        story.isJoined && { color: "#FFF" }
                      ]}
                    >
                      {story.isJoined ? "Joined ✓" : "Join"}
                    </Text>
                  </Pressable>

                  <Pressable 
                    style={styles.button}
                    onPress={() => handleShare(story.id)}
                  >
                    <Text style={styles.buttonText}>Share</Text>
                  </Pressable>

                  <Pressable 
                    style={[
                      styles.button,
                      story.isVolunteered && styles.volunteeredButton,
                    ]}
                    onPress={() => handleVolunteer(story.id)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        story.isVolunteered && { color: "#FFF" }
                      ]}
                    >
                      {story.isVolunteered ? "Volunteered ✓" : "Volunteer"}
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

                <Text
                  style={{
                    color,
                    fontSize: 12,
                  }}
                >
                  {item.label}
                </Text>
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
  },

  subheading: {
    marginTop: 6,
    fontSize: 17,
    color: "#666",
  },
  emptyState: {
    marginTop: 24,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },

  filter: {
    backgroundColor: "#EFECE6",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
    marginRight: 10,
  },

  activeFilter: {
    backgroundColor: "#087D97",
  },

  filterText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7DDD2",
    padding: 18,
    marginBottom: 20,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  title: {
    fontSize: 18,
    flex: 1,
    fontWeight: "700",
    color: "#20252E",
    lineHeight: 24,
  },

  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 25,
    flexShrink: 0,
    alignSelf: "flex-start",
    minWidth: 90,
  },

  badgeText: {
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },

  typeChip: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F0EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 14,
  },

  typeText: {
    fontSize: 14,
    color: "#5B6470",
    fontWeight: "500",
  },

  description: {
    marginTop: 14,
    color: "#5B6470",
    fontSize: 15,
    lineHeight: 22,
  },
  storyMedia: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#F0EDE8",
    marginTop: 16,
  },
  audioButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#087D97",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
  },
  audioButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  location: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationText: {
    marginLeft: 4,
    color: "#5B6470",
    fontSize: 15,
  },

  stats: {
    flexDirection: "row",
    gap: 12,
  },

  iconText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  statText: {
    fontSize: 14,
    color: "#5B6470",
  },

  divider: {
    height: 1,
    backgroundColor: "#E8DFD5",
    marginVertical: 16,
  },

  buttons: {
    flexDirection: "row",
    gap: 8,
  },

  button: {
    flex: 1,
    backgroundColor: "#F2EFE9",
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#5B6470",
    fontWeight: "600",
  },

  joinButton: {
    backgroundColor: "#DDF0F6",
  },

  joinedButton: {
    backgroundColor: "#087D97",
  },

  volunteeredButton: {
    backgroundColor: "#4CAF50",
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
