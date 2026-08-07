import { useLanguage } from '@/contexts/language-context';
import { Children, ReactNode, useEffect, useMemo } from 'react';
import { Text as NativeText, TextProps } from 'react-native';

const collectStrings = (node: ReactNode): string[] => {
  const strings: string[] = [];
  Children.forEach(node, (child) => {
    if (typeof child === 'string') strings.push(child);
    else if (Array.isArray(child)) strings.push(...collectStrings(child));
  });
  return strings;
};

export function TranslatedText({ children, ...props }: TextProps) {
  const { language, registerTexts, t } = useLanguage();
  const strings = useMemo(() => collectStrings(children), [children]);
  const signature = strings.join('\u0000');

  useEffect(() => {
    registerTexts(strings);
  }, [language, registerTexts, signature, strings]);

  const translatedChildren = Children.map(children, (child) => typeof child === 'string' ? t(child) : child);
  return <NativeText {...props}>{translatedChildren}</NativeText>;
}
