import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { NavBar } from '@/components/NavBar';
import { Text, View } from '@/components/Themed';

export default function MoreScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <NavBar title="More" />
      <View style={styles.content}>
        <Pressable
          onPress={() => router.replace('/login')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
  },
});
