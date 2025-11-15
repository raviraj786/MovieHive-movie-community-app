import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function HeaderAnimated({ title = "MovieHive" }) {
  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <LinearGradient colors={["#1f2937", "#111827"]} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    paddingTop: 36,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
