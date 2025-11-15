import DiscoverScreen from "@/src/screens/DiscoverScreen";
import ProfileSrc from "@/src/screens/ProfileSrc";
import Watchlist from "@/src/screens/Watchlist";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, View } from "react-native";

const Tab = createBottomTabNavigator();

export default function TabScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#2b7cff",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerFocused : styles.iconContainer}>
              <MaterialIcons name="search" size={24} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Watchlist"
        component={Watchlist}
        options={{
          tabBarLabel: "Watchlist",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerFocused : styles.iconContainer}>
              <Ionicons name="bookmark" size={22} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileSrc}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerFocused : styles.iconContainer}>
              <Feather name="user" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderTopColor: "#1f1f1f",
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  iconContainerFocused: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 124, 255, 0.15)',
  },
});