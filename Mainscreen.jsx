// src/screens/Mainscreen.jsx
import { loadUserFromStorage } from "@/src/redux/slices/authSlice";
import DiscoverScreen from "@/src/screens/DiscoverScreen";
import LoginScreen from "@/src/screens/LoginScreen";
import MovieDetailsSrc from '@/src/screens/MovieDetailsSrc';
import ProfileSrc from "@/src/screens/ProfileSrc";
import RegisterScreen from "@/src/screens/RegisterScreen";
import TabScreen from "@/src/screens/TabScreen";
import Watchlist from "@/src/screens/Watchlist";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Stack = createNativeStackNavigator();

export default function Mainscreen() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Load user from storage on app start
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#070707' 
      }}>
        <ActivityIndicator size="large" color="#2b7cff" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        // Auth Stack - when user is not logged in
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Main App Stack - when user is logged in
        <>
          <Stack.Screen name="Tab" component={TabScreen} />
          <Stack.Screen name="Discover" component={DiscoverScreen} />
          <Stack.Screen name="Details" component={MovieDetailsSrc} />
          <Stack.Screen name="Watchlist" component={Watchlist} />
          <Stack.Screen name="Profile" component={ProfileSrc} />
        </>
      )}
    </Stack.Navigator>
  );
}