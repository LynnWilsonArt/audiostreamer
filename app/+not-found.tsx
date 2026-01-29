import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (

    <View style={styles.container}>
        <Text>Redirecting…</Text>
     </View>
    );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c7a500',
    padding: 20,
    alignItems: 'center',
  },
});
