import HeaderAnimated from "@/src/components/HeaderAnimated";
import MovieCard from "@/src/components/MovieCard";
import { fetchTrendingMovies, getCurrentPage, hasMorePages } from "@/src/utils/trakApi";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function DiscoverScreen() {
  const [movies, setMovies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);

  const load = useCallback(async (page = 1, loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setRefreshing(true);
      }

      const res = await fetchTrendingMovies(page);
      
      if (loadMore) {
        setMovies(prev => [...prev, ...res]);
      } else {
        setMovies(res);
      }
      
      setHasMore(hasMorePages());
    } catch (e) {
      console.warn("fetch trending failed", e);
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onPress = (movie) => {
    navigation.navigate("Details", { movie });
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = getCurrentPage() + 1;
      load(nextPage, true);
    }
  }, [loadingMore, hasMore, load]);

  const onRefresh = useCallback(() => {
    load();
  }, [load]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#E50914" />
        <Text style={styles.loadingText}>Loading more movies...</Text>
      </View>
    );
  };

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(600).springify()}
      style={styles.cardWrapper}
    >
      <MovieCard item={item} index={index} onPress={onPress} />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <HeaderAnimated title="Trending This Week" />
      
      <AnimatedFlatList
        contentContainerStyle={styles.listContent}
        data={movies}
        keyExtractor={(m) => m.id + m.poster}
        numColumns={2}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#E50914"]}
            tintColor="#E50914"
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#070707" 
  },
  listContent: { 
    padding: 12,
    paddingBottom: 20
  },
  cardWrapper: {
    flex: 1,
    margin: 6,
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  }
});