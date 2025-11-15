import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const GenreBarChart = ({ data }) => {
  if (!data.length) return null;

  const maxCount = Math.max(...data.map((item) => item.count));
  const chartWidth = SCREEN_WIDTH - 100;

  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => {
        const barWidth = (item.count / maxCount) * chartWidth;
        return (
          <Animated.View
            key={item.genre}
            entering={SlideInRight.delay(index * 100).duration(600)}
            style={styles.barRow}
          >
            <View style={styles.genreInfo}>
              <Text style={styles.genreName} numberOfLines={1}>
                {item.genre}
              </Text>
              <Text style={styles.genreCount}>{item.count}</Text>
            </View>

            <View style={styles.barBackground}>
              <LinearGradient
                colors={["#2b7cff", "#1e40af"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: barWidth }]}
              />
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default function ProfileSrc() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch()

  const watchlist = useSelector((state) => state.watchlist.items || []);

  const genreStats = useMemo(() => {
    const map = {};
    watchlist.forEach((movie) => {
      const genres =
        movie.genres ||
        movie.genre ||
        (movie.raw && movie.raw.Genre ? movie.raw.Genre.split(", ") : []) ||
        [];
      genres.forEach((genre) => {
        map[genre] = (map[genre] || 0) + 1;
      });
    });

    return Object.entries(map)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [watchlist]);

  const totalMovies = watchlist.length;
  const favoriteGenre = genreStats[0]?.genre || "None";
  const totalGenres = genreStats.length;

  const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("logged_in_user");
                            
                            dispatch(logout());
                        } catch (error) {
                            console.log("Logout error:", error);
                        }
                    }
                }
            ]
        );
    }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
        <LinearGradient colors={["#1e3a8a", "#1e40af"]} style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U"}
          </Text>
        </LinearGradient>

        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.name || "User"}</Text>
          <Text style={styles.email}>{user?.email || "user@example.com"}</Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(200).duration(600)}
        style={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Ionicons name="film-outline" size={24} color="#2b7cff" />
          <Text style={styles.statNumber}>{totalMovies}</Text>
          <Text style={styles.statLabel}>Total Movies</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{genreStats[0]?.count || 0}</Text>
          <Text style={styles.statLabel}>Top Genre</Text>
          <Text style={styles.genreNameSmall}>{favoriteGenre}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="stats-chart" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{totalGenres}</Text>
          <Text style={styles.statLabel}>Genres</Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(400).duration(600)}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Genre Preferences</Text>
          <Text style={styles.viewAllText}>
            {totalGenres > 0 ? `${totalGenres} genres` : "No data"}
          </Text>
        </View>

        {genreStats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={48} color="#444" />
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add movies to your watchlist to see your genre preferences
            </Text>
          </View>
        ) : (
          <GenreBarChart data={genreStats} />
        )}
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(600).duration(600)}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Your Movie Taste</Text>
        <View style={styles.tasteInfo}>
          <View style={styles.tasteItem}>
            <Ionicons name="trending-up" size={20} color="#10b981" />
            <Text style={styles.tasteText}>Most watched: {favoriteGenre}</Text>
          </View>
          <View style={styles.tasteItem}>
            <Ionicons name="diversity" size={20} color="#8b5cf6" />
            <Text style={styles.tasteText}>{totalGenres} different genres</Text>
          </View>
          <View style={styles.tasteItem}>
            <Ionicons name="calendar" size={20} color="#f59e0b" />
            <Text style={styles.tasteText}>
              {totalMovies} movies in collection
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(800).duration(600)}
        style={styles.appInfo}
      >
        <Text style={styles.appVersion}>MovieHive v1.0.0</Text>
        <Text style={styles.appDescription}>
          Your personal movie collection manager
        </Text>
      </Animated.View>

      <Pressable
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
          backgroundColor: "red",
          marginInline: 20,
          borderRadius: 10,
          marginBottom: 40,
        }}
        onPress={handleLogout}
      >
        <Text style={{ fontSize: 20, color: "#fff", fontWeight: "bold" }}>
          Logout
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070707",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#2b7cff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    color: "#9ca3af",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },
  genreNameSmall: {
    color: "#2b7cff",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#0b0b0b",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAllText: {
    color: "#2b7cff",
    fontSize: 14,
    fontWeight: "600",
  },
  chartContainer: {
    marginTop: 8,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    height: 24,
  },
  genreInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 90,
    justifyContent: "space-between",
  },
  genreName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  genreCount: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 8,
  },
  barBackground: {
    flex: 1,
    height: 14,
    backgroundColor: "#1f2937",
    borderRadius: 7,
    marginLeft: 12,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 7,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  tasteInfo: {
    gap: 12,
  },
  tasteItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tasteText: {
    color: "#d1d5db",
    fontSize: 14,
  },
  appInfo: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
  },
  appVersion: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  appDescription: {
    color: "#6b7280",
    fontSize: 12,
  },
});
