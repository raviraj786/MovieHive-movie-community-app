// src/screens/MovieDetail.jsx
import { addMovie } from "@/src/redux/slices/watchlistSlice";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useDispatch } from "react-redux";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MovieDetail({ route, navigation }) {
  const { movie } = route.params;
  const dispatch = useDispatch();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Animation values
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 600 });
    opacity.value = withTiming(1, { duration: 800 });
    checkIfInWatchlist();
  }, []);

  const aniStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const checkIfInWatchlist = async () => {
    try {
      const raw = await AsyncStorage.getItem("watchlist");
      const arr = raw ? JSON.parse(raw) : [];
      const exists = arr.find((m) => m.id === movie.id);
      setIsInWatchlist(!!exists);
    } catch (error) {
      console.error("Error checking watchlist:", error);
    }
  };

  async function onAddWatchlist() {
    const payload = {
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      year: movie.year,
      rating: movie.rating,
      genres: movie.genre || movie.genres,
      runtime: movie.runtime,
      overview: movie.overview,
      raw: movie.raw,
    };
    
    dispatch(addMovie(payload));
    
    try {
      const raw = await AsyncStorage.getItem("watchlist");
      const arr = raw ? JSON.parse(raw) : [];
      const exists = arr.find((m) => m.id === payload.id);
      
      if (!exists) {
        arr.push(payload);
        await AsyncStorage.setItem("watchlist", JSON.stringify(arr));
        setIsInWatchlist(true);
        Alert.alert("Success", "Movie added to watchlist!");
      } else {
        Alert.alert("Info", "Movie already in watchlist");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add to watchlist");
    }
  }

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out "${movie.title}" (${movie.year}) - Rating: ${movie.rating}/10`,
        url: movie.poster,
        title: movie.title
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share movie");
    }
  };

  const renderGenreChips = () => {
    const genres = movie.genre || movie.genres || [];
    return (
      <View style={styles.genreContainer}>
        {genres.map((genre, index) => (
          <Animated.View
            key={genre}
            entering={FadeInDown.delay(300 + index * 100).duration(500)}
            style={styles.genreChip}
          >
            <Text style={styles.genreText}>{genre}</Text>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderInfoRow = (icon, label, value) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <Ionicons name={icon} size={16} color="#888" />
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Animated.View 
          style={styles.header}
          entering={FadeInUp.duration(600)}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Ionicons name="share-social" size={24} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Poster Section */}
        <View style={styles.posterSection}>
          <Animated.View style={[styles.posterWrap, aniStyle]}>
            <Image
              source={{ uri: movie.backdrop || movie.poster }}
              style={styles.backImage}
            />
            <LinearGradient
              colors={["transparent", "rgba(7,7,7,0.1)", "#070707"]}
              style={styles.gradient}
            />
            
            {/* Rating Badge */}
            <Animated.View 
              style={styles.ratingBadge}
              entering={SlideInDown.delay(200).duration(600)}
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {movie.rating > 0 ? movie.rating.toFixed(1) : 'N/A'}
              </Text>
            </Animated.View>
          </Animated.View>

          {/* Movie Poster Thumbnail */}
          <Animated.View 
            style={styles.posterThumbnail}
            entering={FadeInUp.delay(400).duration(600)}
          >
            <Image
              source={{ uri: movie.poster }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </Animated.View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title and Year */}
          <Animated.View 
            style={styles.titleSection}
            entering={FadeInDown.delay(500).duration(600)}
          >
            <Text style={styles.title}>
              {movie.title}
            </Text>
            <Text style={styles.year}>
              {movie.year ? `(${movie.year})` : ''}
            </Text>
          </Animated.View>

          {/* Genres */}
          {renderGenreChips()}

          {/* Movie Info */}
          <Animated.View 
            style={styles.infoSection}
            entering={FadeInDown.delay(700).duration(600)}
          >
            {renderInfoRow("time-outline", "Runtime", movie.runtime || "N/A")}
            {renderInfoRow("calendar-outline", "Release", movie.year || "N/A")}
            {renderInfoRow("star-outline", "Votes", movie.votes || "N/A")}
          </Animated.View>

          {/* Overview */}
          <Animated.View 
            style={styles.overviewSection}
            entering={FadeInDown.delay(900).duration(600)}
          >
            <Text style={styles.overviewTitle}>Overview</Text>
            <Text style={styles.overview}>
              {movie.overview || "No overview available."}
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            style={styles.actions}
            entering={FadeInDown.delay(1100).duration(600)}
          >
            <TouchableOpacity 
              style={[
                styles.primaryBtn, 
                isInWatchlist && styles.addedBtn
              ]} 
              onPress={onAddWatchlist}
            >
              <Ionicons 
                name={isInWatchlist ? "checkmark" : "add"} 
                size={20} 
                color="#FFF" 
              />
              <Text style={styles.primaryText}>
                {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => navigation.navigate("WriteReview", { movie })}
            >
              <Ionicons name="create-outline" size={20} color="#2b7cff" />
              <Text style={styles.ghostText}>Write Review</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#070707" 
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterSection: {
    height: SCREEN_HEIGHT * 0.5,
    position: 'relative',
  },
  posterWrap: { 
    flex: 1, 
    overflow: "hidden" 
  },
  backImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover" 
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  ratingBadge: {
    position: 'absolute',
    top: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  ratingText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  posterThumbnail: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    width: 120,
    height: 180,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  content: {
    marginTop: 40,
    padding: 20,
    paddingTop: 30,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: { 
    color: "#fff", 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 4,
    lineHeight: 32,
  },
  year: { 
    color: "#888", 
    fontSize: 18, 
    fontWeight: "600" 
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  genreChip: {
    backgroundColor: 'rgba(43, 124, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(43, 124, 255, 0.5)',
  },
  genreText: {
    color: '#2b7cff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabelText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  overviewSection: {
    marginBottom: 30,
  },
  overviewTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  overview: { 
    color: "#d1d5db", 
    lineHeight: 22,
    fontSize: 15,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#2b7cff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: "#2b7cff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addedBtn: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
  },
  primaryText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 16,
  },
  ghostBtn: {
    flex: 1,
    borderColor: "#2b7cff",
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ghostText: { 
    color: "#2b7cff", 
    fontWeight: "600",
    fontSize: 16,
  },
});