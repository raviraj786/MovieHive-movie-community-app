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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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

// Bottom Sheet Component
const ReviewBottomSheet = ({ visible, onClose, movie, onSubmitReview }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSubmit = () => {
    if (review.trim() && rating > 0) {
      onSubmitReview({
        movieId: movie.id,
        movieTitle: movie.title,
        review: review.trim(),
        rating,
        date: new Date().toISOString(),
      });
      setReview('');
      setRating(0);
      onClose();
    } else {
      Alert.alert('Error', 'Please add a review and select a rating');
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color={star <= rating ? "#FFD700" : "#666"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View style={[styles.bottomSheet, animatedStyle]}>
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Write a Review</Text>
          <Text style={styles.sheetSubtitle}>{movie.title}</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.sheetContent}
        >
          <ScrollView style={styles.scrollContent}>
            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Your Rating</Text>
              {renderStars()}
              <Text style={styles.ratingText}>
                {rating > 0 ? `${rating}/5 stars` : 'Tap to rate'}
              </Text>
            </View>

            {/* Review Input */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Your Review</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your thoughts about this movie..."
                placeholderTextColor="#666"
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {review.length}/500 characters
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!review.trim() || rating === 0) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!review.trim() || rating === 0}
              >
                <Text style={styles.submitText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
};

export default function MovieDetail({ route, navigation }) {
  const { movie } = route.params;
  const dispatch = useDispatch();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);

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

  const handleSubmitReview = (reviewData) => {
    // Save review to AsyncStorage
    saveReview(reviewData);
    Alert.alert("Success", "Review submitted successfully!");
  };

  const saveReview = async (reviewData) => {
    try {
      const existingReviews = await AsyncStorage.getItem("movie_reviews");
      const reviews = existingReviews ? JSON.parse(existingReviews) : [];
      reviews.push(reviewData);
      await AsyncStorage.setItem("movie_reviews", JSON.stringify(reviews));
    } catch (error) {
      console.error("Error saving review:", error);
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
    <GestureHandlerRootView style={styles.container}>
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
                onPress={() => setShowReviewSheet(true)}
              >
                <Ionicons name="create-outline" size={20} color="#2b7cff" />
                <Text style={styles.ghostText}>Write Review</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Review Bottom Sheet */}
        <ReviewBottomSheet
          visible={showReviewSheet}
          onClose={() => setShowReviewSheet(false)}
          movie={movie}
          onSubmitReview={handleSubmitReview}
        />
      </View>
    </GestureHandlerRootView>
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
  // Bottom Sheet Styles
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: SCREEN_HEIGHT * 0.8,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 16,
  },
  sheetHeader: {
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 12,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sheetSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  sheetContent: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    color: '#888',
    fontSize: 14,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    padding: 16,
    backgroundColor: '#2b7cff',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});