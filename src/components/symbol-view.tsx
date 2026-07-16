import { SymbolView as ExpoSymbolView } from 'expo-symbols';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

type PlatformSymbolName =
  | string
  | {
      ios?: string;
      android?: string;
      web?: string;
    };

type SymbolViewProps = {
  name: PlatformSymbolName;
  size?: number;
  tintColor?: string;
  style?: StyleProp<ViewStyle>;
  fallback?: ReactNode;
  weight?: unknown;
  type?: string;
};

export function SymbolView({ name, size = 24, tintColor, style, fallback }: SymbolViewProps) {
  const iosName = typeof name === 'string' ? name : name.ios;

  if (Platform.OS === 'ios' && ExpoSymbolView && iosName) {
    return <ExpoSymbolView name={iosName as never} size={size} tintColor={tintColor} style={style} />;
  }

  return (
    <Text
      style={[
        styles.fallback,
        {
          color: tintColor,
          fontSize: Math.max(10, Math.round(size * 0.72)),
          height: size,
          lineHeight: size,
          width: size,
        },
        style as StyleProp<TextStyle>,
      ]}>
      {fallback ?? getFallbackText(name)}
    </Text>
  );
}

function getFallbackText(name: PlatformSymbolName) {
  const symbolName = typeof name === 'string' ? name : name.android ?? name.web ?? name.ios ?? '';

  if (symbolName.includes('chevron')) return '>';
  if (symbolName.includes('heart') || symbolName.includes('favorite')) return '+';
  if (symbolName.includes('search') || symbolName.includes('magnifyingglass')) return '?';
  if (symbolName.includes('location')) return '@';
  if (symbolName.includes('info')) return 'i';
  if (symbolName.includes('person') || symbolName.includes('account')) return 'u';
  if (symbolName.includes('sun')) return 'L';
  if (symbolName.includes('moon') || symbolName.includes('dark')) return 'D';

  return '*';
}

const styles = StyleSheet.create({
  fallback: {
    fontWeight: '800',
    textAlign: 'center',
  },
});
