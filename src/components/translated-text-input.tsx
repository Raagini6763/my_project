import { useLanguage } from '@/contexts/language-context';
import { useEffect } from 'react';
import { TextInput as NativeTextInput, TextInputProps } from 'react-native';

export function TranslatedTextInput({ placeholder, ...props }: TextInputProps) {
  const { language, registerTexts, t } = useLanguage();
  useEffect(() => {
    if (placeholder) registerTexts([placeholder]);
  }, [language, placeholder, registerTexts]);
  return <NativeTextInput placeholder={placeholder ? t(placeholder) : undefined} {...props} />;
}
