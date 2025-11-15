import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedImage = Animated.createAnimatedComponent(Image);


const StarIcon = ({ size = 16, color = "#FFD700" }) => (
  <View style={[styles.starContainer, { width: size, height: size }]}>
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={color}
      />
    </Svg>
  </View>
);

export default function MovieCard({ item, index, onPress }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: withSpring(1, {
            damping: 15,
            stiffness: 150
          })
        }
      ]
    };
  });

  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle]}
      onPress={() => onPress(item)}
      entering={FadeIn.delay(index * 150).duration(800)}
      activeOpacity={0.7}
    >
      {/* Poster Image with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <AnimatedImage
          source={{ uri: item.poster }}
          style={styles.poster}
          resizeMode="cover"
          sharedTransitionTag={`poster-${item.id}`}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
        
        {/* Rating Badge */}
        <View style={styles.ratingContainer}>
          <StarIcon size={14} />
          <Text style={styles.ratingText}>
            {item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Movie Title */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.year}>
          {item.year || 'N/A'}
        </Text>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    margin: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 2/3,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  ratingContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  starContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    padding: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 18,
  },
  year: {
    color: '#888',
    fontSize: 12,
  },
});


import Svg, { Path } from 'react-native-svg';

