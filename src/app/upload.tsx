import { TranslatedText as Text } from '@/components/translated-text';
import { TranslatedTextInput as TextInput } from '@/components/translated-text-input';
import { createStory } from '@/services/firebaseService';
import { refineStoryText } from '@/services/geminiService';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import { router, usePathname } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getNavigationItems = (pathname: string) => [
  { label: "Home", icon: "home" as const, route: "/", active: pathname === "/" || pathname === "/dashboard" },
  { label: "Stories", icon: "menu-book" as const, route: "/stories", active: pathname === "/stories" },
  { label: "Upload", icon: "ios-share" as const, route: "/upload", active: pathname === "/upload" },
  { label: "Campaigns", icon: "campaign" as const, route: "/campaigns", active: pathname === "/campaigns" },
  { label: "Action", icon: "bolt" as const, route: "/action", active: pathname === "/action" },
];

export default function UploadScreen() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("");
  const [writingContent, setWritingContent] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [whyMatters, setWhyMatters] = useState("");
  const [whatChange, setWhatChange] = useState("");
  const [howHelp, setHowHelp] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentField, setCurrentField] = useState("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedMediaUri, setUploadedMediaUri] = useState<string | null>(null);
  const [uploadedMediaType, setUploadedMediaType] = useState<'text' | 'image' | 'video' | 'audio'>('text');

  const pathname = usePathname();
  const navigation = getNavigationItems(pathname);

  const formats = [
    { id: "writing", label: "Writing", icon: "edit" },
    { id: "video", label: "Video/Reel", icon: "videocam" },
    { id: "podcast", label: "Podcast", icon: "mic" },
    { id: "photos", label: "Photos", icon: "photo-camera" },
  ];

  const categories = [
    "Safety", 
    "Education", 
    "Water", 
    "Healthcare", 
    "Infrastructure", 
    "Environment", 
    "Sanitation", 
  ];

  const handleFormatSelect = async (formatId: string) => {
    setFormat(formatId);

    if (formatId === "writing") {
      // Open notepad for writing
      setCurrentQuestion("Write your story");
      setCurrentField("writing");
      setNoteContent(writingContent);
      setIsNoteModalVisible(true);
    } else if (formatId === "video" || formatId === "photos") {
      // Open camera
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.granted) {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: formatId === "photos" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 1,
        });
        if (!result.canceled) {
          const uri = result.assets?.[0]?.uri ?? null;
          setUploadedMediaUri(uri);
          setUploadedMediaType(formatId === "photos" ? "image" : "video");
          Alert.alert(
            "Success!",
            `${formatId === "photos" ? "Photo" : "Video"} captured successfully!`,
            [{ text: "OK" }]
          );
        }
      } else {
        Alert.alert(
          "Permission Denied",
          "Please allow camera access to capture photos/videos.",
          [{ text: "OK" }]
        );
      }
    } else if (formatId === "podcast") {
      // Start audio recording
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (permission.granted) {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setIsRecording(true);
        Alert.alert("Recording", "Recording started... Tap again to stop.");
      } else {
        Alert.alert(
          "Permission Denied",
          "Please allow microphone access to record podcasts.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      
      setUploadedMediaUri(uri);
      setUploadedMediaType('audio');
      Alert.alert(
        "Recording Complete",
        "Your podcast has been recorded successfully!",
        [{ text: "OK" }]
      );
    }
  };

  const handleQuestionPress = (question: string, field: string, placeholder: string) => {
    setCurrentQuestion(question);
    setCurrentField(field);
    
    // Get existing content based on field
    let existingContent = "";
    switch(field) {
      case "whatHappened": existingContent = whatHappened; break;
      case "whyMatters": existingContent = whyMatters; break;
      case "whatChange": existingContent = whatChange; break;
      case "howHelp": existingContent = howHelp; break;
      case "location": existingContent = location; break;
      case "category": existingContent = category; break;
    }
    
    setNoteContent(existingContent);
    setIsNoteModalVisible(true);
  };

  const saveNote = () => {
    switch(currentField) {
      case "writing":
        setWritingContent(noteContent.trim());
        setUploadedMediaType('text');
        Alert.alert("Story Saved", "Your writing has been saved!");
        break;
      case "whatHappened": setWhatHappened(noteContent); break;
      case "whyMatters": setWhyMatters(noteContent); break;
      case "whatChange": setWhatChange(noteContent); break;
      case "howHelp": setHowHelp(noteContent); break;
      case "location": setLocation(noteContent); break;
      case "category": setCategory(noteContent); break;
    }
    setIsNoteModalVisible(false);
  };

  const handlePublishStory = async () => {
    if (!title || !format || !category) {
      Alert.alert('Incomplete', 'Please add a title, select a format, and choose a category.');
      return;
    }

    if (!whatHappened || !whyMatters || !whatChange || !howHelp || !location) {
      Alert.alert('Incomplete', 'Please complete all story details before publishing.');
      return;
    }

    if (format === 'writing' && !writingContent.trim()) {
      Alert.alert('Incomplete', 'Please write your story before publishing.');
      return;
    }

    if (format !== 'writing' && !uploadedMediaUri) {
      Alert.alert('Incomplete', 'Please record or select the media for this story format.');
      return;
    }

    setIsSubmitting(true);

    try {
      const storyBody = `${writingContent.trim() ? `${writingContent.trim()}\n\n` : ''}What happened: ${whatHappened}\n\nWhy it matters: ${whyMatters}\n\nWhat change: ${whatChange}\n\nHow others can help: ${howHelp}`;
      let refinedResult = { needsRefinement: false, refinedText: storyBody };
      try {
        refinedResult = await refineStoryText(storyBody);
      } catch (error) {
        console.warn('Story refinement unavailable; submitting original text:', error);
      }
      const refinedDescription = refinedResult.refinedText || storyBody;

      await createStory({
        title,
        description: refinedDescription,
        location,
        category,
        storyType: format === 'writing' ? 'Article' : format === 'podcast' ? 'Podcast' : format === 'video' ? 'Reel' : 'Photo Essay',
        authorEmail: 'anonymous@citzny.app',
        mediaUri: uploadedMediaUri,
        mediaType: uploadedMediaType,
      });

      setIsSuccessModalVisible(true);

      setTitle('');
      setFormat('');
      setWritingContent('');
      setWhatHappened('');
      setWhyMatters('');
      setWhatChange('');
      setHowHelp('');
      setLocation('');
      setCategory('');
      setCustomCategory('');
      setUploadedMediaUri(null);
      setUploadedMediaType('text');
      setStep(1);
    } catch (error) {
      console.warn('Story publish failed:', error);
      Alert.alert('Error', 'Could not publish story right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (selectedCategory: string) => {
    if (selectedCategory === "Other") {
      setShowCustomCategoryInput(true);
      setCategory(""); // Clear the category when "Other" is selected
    } else {
      setCategory(selectedCategory);
      setCustomCategory("");
      setShowCustomCategoryInput(false);
      setIsCategoryModalVisible(false);
    }
  };

  const saveCustomCategory = () => {
    if (customCategory.trim()) {
      setCategory(customCategory.trim());
      setShowCustomCategoryInput(false);
      setIsCategoryModalVisible(false);
    } else {
      Alert.alert("Error", "Please enter a category name.");
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.subheading}>Choose your format and answer the guided questions</Text>

      <Text style={styles.inputLabel}>Story Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Broken streetlights near school"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.inputLabel, { marginTop: 24 }]}>How do you want to tell your story?</Text>
      <View style={styles.formatGrid}>
        {formats.map((f) => (
          <Pressable
            key={f.id}
            style={[
              styles.formatCard,
              format === f.id && styles.formatCardActive,
            ]}
            onPress={() => handleFormatSelect(f.id)}
          >
            <MaterialIcons 
              name={f.icon as any} 
              size={32} 
              color={format === f.id ? "#087D97" : "#666"} 
            />
            <Text style={[
              styles.formatLabel,
              format === f.id && styles.formatLabelActive,
            ]}>
              {f.label}
            </Text>
            {format === f.id && f.id === "podcast" && (
              <Pressable 
                style={styles.recordButton}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <MaterialIcons 
                  name={isRecording ? "stop" : "fiber-manual-record"} 
                  size={20} 
                  color={isRecording ? "#FF3B30" : "#087D97"} 
                />
                <Text style={styles.recordText}>
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </Text>
              </Pressable>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable 
        style={styles.nextButton}
        onPress={() => {
          if (title && format) {
            setStep(2);
          } else {
            Alert.alert("Incomplete", "Please add a title and select a format.");
          }
        }}
      >
        <Text style={styles.nextButtonText}>Next →</Text>
      </Pressable>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.subheading}>Answer these questions to build your story</Text>

      <Pressable 
        style={styles.questionCard}
        onPress={() => handleQuestionPress(
          "1. What happened?",
          "whatHappened",
          "Describe the issue or event clearly..."
        )}
      >
        <Text style={styles.questionLabel}>1. What happened?</Text>
        <Text style={[styles.questionAnswer, whatHappened && { color: '#333' }]}>
          {whatHappened || "Describe the issue or event clearly..."}
        </Text>
        <MaterialIcons name="edit" size={20} color="#087D97" />
      </Pressable>

      <Pressable 
        style={styles.questionCard}
        onPress={() => handleQuestionPress(
          "2. Why does this matter to you?",
          "whyMatters",
          "Explain the impact on your community..."
        )}
      >
        <Text style={styles.questionLabel}>2. Why does this matter to you?</Text>
        <Text style={[styles.questionAnswer, whyMatters && { color: '#333' }]}>
          {whyMatters || "Explain the impact on your community..."}
        </Text>
        <MaterialIcons name="edit" size={20} color="#087D97" />
      </Pressable>

      <Pressable 
        style={styles.questionCard}
        onPress={() => handleQuestionPress(
          "3. What change do you want?",
          "whatChange",
          "What should happen to fix this?..."
        )}
      >
        <Text style={styles.questionLabel}>3. What change do you want?</Text>
        <Text style={[styles.questionAnswer, whatChange && { color: '#333' }]}>
          {whatChange || "What should happen to fix this?..."}
        </Text>
        <MaterialIcons name="edit" size={20} color="#087D97" />
      </Pressable>

      <Pressable 
        style={styles.questionCard}
        onPress={() => handleQuestionPress(
          "4. How can others help?",
          "howHelp",
          "What actions can people take?..."
        )}
      >
        <Text style={styles.questionLabel}>4. How can others help?</Text>
        <Text style={[styles.questionAnswer, howHelp && { color: '#333' }]}>
          {howHelp || "What actions can people take?..."}
        </Text>
        <MaterialIcons name="edit" size={20} color="#087D97" />
      </Pressable>

      <Pressable 
        style={styles.questionCard}
        onPress={() => handleQuestionPress(
          "5. Where is this happening?",
          "location",
          "Village, district, state..."
        )}
      >
        <Text style={styles.questionLabel}>5. Where is this happening?</Text>
        <Text style={[styles.questionAnswer, location && { color: '#333' }]}>
          {location || "Village, district, state..."}
        </Text>
        <MaterialIcons name="edit" size={20} color="#087D97" />
      </Pressable>

      <Pressable 
        style={styles.questionCard}
        onPress={() => setIsCategoryModalVisible(true)}
      >
        <Text style={styles.questionLabel}>6. Category</Text>
        <Text style={[styles.questionAnswer, category && { color: '#333' }]}>
          {category || "Select a category..."}
        </Text>
        <MaterialIcons name="chevron-right" size={20} color="#087D97" />
      </Pressable>

      <View style={styles.stepButtons}>
        <Pressable 
          style={[styles.button, styles.backButton]}
          onPress={() => setStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <Pressable 
          style={[styles.button, styles.publishButton, isSubmitting && styles.publishButtonDisabled]}
          onPress={handlePublishStory}
          disabled={isSubmitting}
        >
          <Text style={styles.publishButtonText}>{isSubmitting ? 'Submitting...' : 'Publish Story'}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.heading}>Share Your Story</Text>

          {step === 1 ? renderStep1() : renderStep2()}
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

      {/* Note Modal */}
      <Modal
        visible={isNoteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNoteModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentQuestion}</Text>
              <Pressable onPress={() => setIsNoteModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <TextInput
              style={styles.modalInput}
              multiline
              numberOfLines={10}
              placeholder="Write your response here..."
              placeholderTextColor="#999"
              value={noteContent}
              onChangeText={setNoteContent}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsNoteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveNote}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsCategoryModalVisible(false);
          setShowCustomCategoryInput(false);
          setCustomCategory("");
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Pressable onPress={() => {
                setIsCategoryModalVisible(false);
                setShowCustomCategoryInput(false);
                setCustomCategory("");
              }}>
                <MaterialIcons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            {!showCustomCategoryInput ? (
              <ScrollView>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryOption,
                      category === cat && styles.categoryOptionActive,
                    ]}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      category === cat && styles.categoryOptionTextActive,
                    ]}>
                      {cat}
                    </Text>
                    {category === cat && (
                      <MaterialIcons name="check" size={20} color="#087D97" />
                    )}
                  </Pressable>
                ))}
                <Pressable
                  style={[
                    styles.categoryOption,
                    styles.otherOption,
                  ]}
                  onPress={() => handleCategorySelect("Other")}
                >
                  <Text style={styles.categoryOptionText}>Other</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#087D97" />
                </Pressable>
              </ScrollView>
            ) : (
              <View>
                <Text style={styles.customCategoryLabel}>Please specify the category:</Text>
                <TextInput
                  style={styles.customCategoryInput}
                  placeholder="Enter category name..."
                  placeholderTextColor="#999"
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  autoFocus
                />
                <View style={styles.modalButtons}>
                  <Pressable 
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => {
                      setShowCustomCategoryInput(false);
                      setCustomCategory("");
                    }}
                  >
                    <Text style={styles.modalCancelText}>Back</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={saveCustomCategory}
                  >
                    <Text style={styles.modalSaveText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSuccessModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.successModalContent]}>
            <View style={styles.successIcon}>
              <MaterialIcons name="check" size={52} color="#FFF" />
            </View>
            <Text style={styles.successTitle}>Story sent for approval</Text>
            <Text style={styles.successMessage}>
              Your story was submitted successfully. It will appear on the Stories page after an admin approves it.
            </Text>
            <Pressable
              style={styles.successPrimaryButton}
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.push('/stories');
              }}
            >
              <Text style={styles.successPrimaryText}>View Stories</Text>
            </Pressable>
            <Pressable style={styles.successSecondaryButton} onPress={() => setIsSuccessModalVisible(false)}>
              <Text style={styles.successSecondaryText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E7DDD2",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
  },
  formatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  formatCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#E7DDD2",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  formatCardActive: {
    borderColor: "#087D97",
    backgroundColor: "#F0F9FC",
  },
  formatLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  formatLabelActive: {
    color: "#087D97",
    fontWeight: "700",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: "#E8F4F8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordText: {
    fontSize: 12,
    color: "#087D97",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#087D97",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  questionCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E7DDD2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D2530",
    width: "100%",
    marginBottom: 6,
  },
  questionAnswer: {
    fontSize: 15,
    color: "#999",
    flex: 1,
    marginRight: 8,
  },
  stepButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#F2EFE9",
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  publishButton: {
    backgroundColor: "#087D97",
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  successModalContent: {
    alignItems: "center",
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B8A43",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1D2530",
    textAlign: "center",
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    lineHeight: 23,
    color: "#5B6470",
    textAlign: "center",
    marginBottom: 24,
  },
  successPrimaryButton: {
    width: "100%",
    backgroundColor: "#087D97",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  successPrimaryText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  successSecondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  successSecondaryText: {
    color: "#087D97",
    fontSize: 16,
    fontWeight: "700",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1D2530",
    flex: 1,
    marginRight: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E7DDD2",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#F2EFE9",
  },
  modalCancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveButton: {
    backgroundColor: "#087D97",
  },
  modalSaveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  categoryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE8",
  },
  categoryOptionActive: {
    backgroundColor: "#F0F9FC",
  },
  categoryOptionText: {
    fontSize: 16,
    color: "#333",
  },
  categoryOptionTextActive: {
    color: "#087D97",
    fontWeight: "600",
  },
  otherOption: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E7DDD2",
  },
  customCategoryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D2530",
    marginBottom: 12,
  },
  customCategoryInput: {
    borderWidth: 1,
    borderColor: "#E7DDD2",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FFF",
    marginBottom: 16,
  },
});
