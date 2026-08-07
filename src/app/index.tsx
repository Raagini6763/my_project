import { SymbolView } from '@/components/symbol-view';
import { TranslatedText as Text } from '@/components/translated-text';
import { SUPPORTED_LANGUAGES, useLanguage } from '@/contexts/language-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type ThemeMode = 'light' | 'dark';

const palettes = {
  light: {
    background: '#FFFEFC',
    text: '#061325',
    body: '#31425D',
    accent: '#087D97',
    accentPressed: '#06677D',
    iconPanel: '#E5F0F3',
    chip: '#F0EDE8',
    chipText: '#405066',
    inactiveAction: '#938C8D',
    divider: '#D9D0C5',
    modeBg: '#F0EDE8',
  },
  dark: {
    background: '#111614',
    text: '#F7F3EA',
    body: '#D1D7D3',
    accent: '#0B839E',
    accentPressed: '#096D84',
    iconPanel: '#20343A',
    chip: '#242B28',
    chipText: '#D1D7D3',
    inactiveAction: '#6F6668',
    divider: '#37332F',
    modeBg: '#242B28',
  },
} as const;

export default function HomeScreen() {
  const { language, setLanguage, isTranslating, translationError } = useLanguage();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [showMoreLanguages, setShowMoreLanguages] = useState(false);
  const palette = palettes[themeMode];

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={[styles.iconPanel, { backgroundColor: palette.iconPanel }]}>
            <SymbolView
              name={{ ios: 'megaphone', web: 'campaign' }}
              size={48}
              tintColor={palette.accent}
            />
          </View>

          <View style={styles.copy}>
            <Text style={[styles.title, { color: palette.text }]}>Impact in Action</Text>
            <Text style={[styles.subtitle, { color: palette.body }]}>Share stories from your community, turn them into campaigns, and guide people toward action.</Text>
          </View>

          <View style={styles.languageWrap}>
            {SUPPORTED_LANGUAGES.slice(0, 5).map((item) => {
              const isSelected = item.code === language;
              return (
                <Pressable
                  key={item.code}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setLanguage(item.code)}
                  style={({ pressed }) => [
                    styles.languageChip,
                    { backgroundColor: isSelected ? palette.accent : palette.chip },
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.languageText,
                      { color: isSelected ? '#FFFFFF' : palette.chipText },
                    ]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              accessibilityRole="button"
              onPress={() => setShowMoreLanguages(true)}
              style={({ pressed }) => [
                styles.languageChip,
                { backgroundColor: palette.chip },
                pressed && styles.pressed,
              ]}>
              <Text style={[styles.moreText, { color: palette.chipText }]}>+ More</Text>
            </Pressable>
          </View>

          {isTranslating ? <Text style={[styles.translationStatus, { color: palette.body }]}>Translating application…</Text> : null}
          {translationError ? <Text style={styles.translationError}>{translationError}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/dashboard')}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? palette.accentPressed : palette.accent },
              ]}>
              <SymbolView
                name={{ ios: 'book', web: 'menu_book' }}
                size={21}
                tintColor="#FFFFFF"
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Browse Issues</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/login')}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? '#06677D' : '#087D97' },
                pressed && styles.pressed,
              ]}>
              <MaterialIcons name="admin-panel-settings" size={21} color="#FFFFFF" />
              <Text style={styles.actionText}>Admin Login</Text>
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: palette.divider }]} />

          <View style={styles.modeWrap}>
            {(['light', 'dark'] as const).map((mode) => {
              const isActive = themeMode === mode;
              return (
                <Pressable
                  key={mode}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => setThemeMode(mode)}
                  style={({ pressed }) => [
                    styles.modeButton,
                    { backgroundColor: isActive ? palette.accent : palette.modeBg },
                    pressed && styles.pressed,
                  ]}>
                  <MaterialIcons
                    name={mode === 'light' ? 'light-mode' : 'dark-mode'}
                    size={17}
                    color={isActive ? '#FFFFFF' : palette.body}
                  />
                  <Text
                    style={[
                      styles.modeText,
                      { color: isActive ? '#FFFFFF' : palette.body },
                    ]}>
                    {mode === 'light' ? 'Light' : 'Dark'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={showMoreLanguages}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreLanguages(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowMoreLanguages(false)}>
          <Pressable style={[styles.languageModal, { backgroundColor: palette.background }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Choose a language</Text>
              <Pressable onPress={() => setShowMoreLanguages(false)}>
                <MaterialIcons name="close" size={24} color={palette.body} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.moreLanguageList}>
              {SUPPORTED_LANGUAGES.slice(5).map((item) => (
                <Pressable
                  key={item.code}
                  style={[styles.moreLanguageOption, { backgroundColor: palette.chip }]}
                  onPress={() => {
                    setLanguage(item.code);
                    setShowMoreLanguages(false);
                  }}>
                  <Text style={[styles.moreLanguageText, { color: palette.chipText }]}>{item.label}</Text>
                  {language === item.code ? <MaterialIcons name="check" size={20} color={palette.accent} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 392,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingTop: 49,
    paddingBottom: 18,
  },
  iconPanel: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 31,
  },
  copy: {
    alignItems: 'center',
    gap: 17,
    marginBottom: 42,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 324,
  },
  languageWrap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 10,
    rowGap: 11,
    marginBottom: 51,
  },
  languageChip: {
    minHeight: 34,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  moreText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: 14,
    marginBottom: 48,
  },
  translationStatus: {
    fontSize: 13,
    marginTop: -38,
    marginBottom: 22,
  },
  translationError: {
    color: '#B31217',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -38,
    marginBottom: 22,
  },
  actionButton: {
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 22,
    height: 22,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginBottom: 31,
  },
  modeWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  modeButton: {
    minHeight: 34,
    minWidth: 90,
    borderRadius: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modeText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.78,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  languageModal: {
    maxHeight: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  moreLanguageList: {
    gap: 10,
    paddingBottom: 20,
  },
  moreLanguageOption: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreLanguageText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
