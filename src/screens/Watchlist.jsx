// src/screens/Watchlist.jsx
import {
  loadWatchlistFromStorage,
  removeMovie,
} from "@/src/redux/slices/watchlistSlice";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  RectButton,
  Swipeable,
} from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeInUp
} from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Empty State Component
const EmptyWatchlist = () => (
    <RNAnimated.View style={styles.emptyContainer}>
        <View style={styles.emptyIllustration}>
            <Ionicons name="bookmark-outline" size={120} color="#333" />
            <View style={styles.floatingIcon}>
                <Ionicons name="film-outline" size={40} color="#2b7cff" />
            </View>
        </View>
        <Animated.Text 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.emptyTitle}
        >
            Your Watchlist is Empty
        </Animated.Text>
        <Animated.Text 
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.emptySubtitle}
        >
            Save movies you want to watch later.{'\n'}
            They will appear here.
        </Animated.Text>
    </RNAnimated.View>
);

export default function Watchlist({ navigation }) {
    const dispatch = useDispatch();
    const items = useSelector((s) => s.watchlist.items || []);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadWatchlist();
    }, []);

    const loadWatchlist = async () => {
        setRefreshing(true);
        await loadWatchlistFromStorage(dispatch);
        setRefreshing(false);
    };

    const removeFromWatchlist = async (id) => {
        dispatch(removeMovie(id));
        const raw = await AsyncStorage.getItem("watchlist");
        const arr = raw ? JSON.parse(raw) : [];
        const updated = arr.filter((m) => m.id !== id);
        await AsyncStorage.setItem("watchlist", JSON.stringify(updated));
    };

    const onMoviePress = (movie) => {
        navigation.navigate("Details", { movie });
    };

    // Swipe to delete right actions
    const renderRightActions = (progress, dragX, item) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <RNAnimated.View style={[styles.swipeActions]}>
                <RectButton
                    style={styles.deleteAction}
                    onPress={() => removeFromWatchlist(item.id)}
                >
                    <RNAnimated.View style={{ transform: [{ scale }] }}>
                        <Ionicons name="trash-outline" size={24} color="#fff" />
                        <Text style={styles.deleteText}>Delete</Text>
                    </RNAnimated.View>
                </RectButton>
            </RNAnimated.View>
        );
    };

    const renderMovieItem = ({ item, index }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(500)}
            style={styles.itemContainer}
        >
            <Swipeable
                renderRightActions={(progress, dragX) =>
                    renderRightActions(progress, dragX, item)
                }
                friction={2}
                rightThreshold={40}
                overshootRight={false}
            >
                <TouchableOpacity
                    style={styles.movieRow}
                    onPress={() => onMoviePress(item)}
                    activeOpacity={0.7}
                >
                    <Image
                        source={{ uri: item.poster }}
                        style={styles.poster}
                    />
                    
                    <View style={styles.movieInfo}>
                        <Text style={styles.title} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.year}>{item.year}</Text>
                        
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.rating}>
                                {item.rating ? item.rating.toFixed(1) : 'N/A'}
                            </Text>
                        </View>

                        {item.genre && item.genre.length > 0 && (
                            <View style={styles.genreContainer}>
                                {item.genre.slice(0, 2).map((genre, idx) => (
                                    <View key={idx} style={styles.genreChip}>
                                        <Text style={styles.genreText}>{genre}</Text>
                                    </View>
                                ))}
                                {item.genre.length > 2 && (
                                    <View style={styles.genreChip}>
                                        <Text style={styles.genreText}>
                                            +{item.genre.length - 2}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    <View style={styles.chevron}>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </TouchableOpacity>
            </Swipeable>
        </Animated.View>
    );

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.container}>
                {/* Header */}
                <Animated.View 
                    entering={FadeInDown.duration(600)}
                    style={styles.header}
                >
                    <Text style={styles.headerTitle}>My Watchlist</Text>
                    <View style={styles.counter}>
                        <Text style={styles.counterText}>
                            {items.length} {items.length === 1 ? 'movie' : 'movies'}
                        </Text>
                    </View>
                </Animated.View>

                {/* Movie List */}
                {items.length > 0 ? (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMovieItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={loadWatchlist}
                    />
                ) : (
                    <EmptyWatchlist />
                )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#070707",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    counter: {
        backgroundColor: 'rgba(43, 124, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(43, 124, 255, 0.5)',
    },
    counterText: {
        color: '#2b7cff',
        fontSize: 12,
        fontWeight: '600',
    },
    listContent: {
        padding: 12,
        paddingBottom: 30,
    },
    itemContainer: {
        marginBottom: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    movieRow: {
        flexDirection: "row",
        padding: 16,
        backgroundColor: "#0b0b0b",
        alignItems: "center",
    },
    poster: {
        width: 70,
        height: 100,
        borderRadius: 12,
        marginRight: 16,
    },
    movieInfo: {
        flex: 1,
    },
    title: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 4,
    },
    year: {
        color: "#888",
        fontSize: 14,
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 4,
    },
    rating: {
        color: "#FFD700",
        fontSize: 14,
        fontWeight: "600",
    },
    genreContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    genreChip: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    genreText: {
        color: "#aaa",
        fontSize: 10,
        fontWeight: "500",
    },
    chevron: {
        paddingLeft: 8,
    },
    swipeActions: {
        width: 100,
        height: '100%',
    },
    deleteAction: {
        flex: 1,
        backgroundColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        marginLeft: 8,
    },
    deleteText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
    },
    emptyIllustration: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
        position: 'relative',
    },
    floatingIcon: {
        position: 'absolute',
        top: 30,
        right: -10,
        backgroundColor: 'rgba(43, 124, 255, 0.1)',
        padding: 8,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(43, 124, 255, 0.3)',
    },
    emptyTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    emptySubtitle: {
        color: "#888",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
});