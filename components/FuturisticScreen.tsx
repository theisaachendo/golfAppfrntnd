import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from '@/components/GradientBackground';
import { NavBar } from '@/components/NavBar';

type FuturisticScreenProps = {
  title: string;
  showBack?: boolean;
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export function FuturisticScreen({
  title,
  showBack,
  children,
  scroll = true,
  contentStyle,
}: FuturisticScreenProps) {
  const insets = useSafeAreaInsets();

  const content = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 32 },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <>{children}</>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <GradientBackground />
      <NavBar title={title} showBack={showBack} lightStyle />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
