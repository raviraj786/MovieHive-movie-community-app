// src/screens/LoginScreen.jsx
import { loginFailure, loginStart, loginSuccess } from "@/src/redux/slices/authSlice";
import { findUser, setLoggedInUser } from "@/src/utils/storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });
    translateY.value = withTiming(0, { duration: 450 });
  }, []);

  const aniStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const onLogin = async () => {
    if (!email.includes("@") || password.length < 4) {
      Alert.alert(
        "Invalid",
        "Please enter valid email and password (min 4 chars)"
      );
      return;
    }

    dispatch(loginStart());
    
    try {
      const user = await findUser(email, password);
      if (!user) {
        dispatch(loginFailure("Invalid email or password"));
        Alert.alert("Error", "Invalid email or password");
        return;
      }
      
      // Save to AsyncStorage
      await setLoggedInUser(user);
      
      // Update Redux state
      dispatch(loginSuccess(user));
      
    } catch (error) {
      dispatch(loginFailure("Login failed"));
      Alert.alert("Error", "Login failed. Please try again.");
    }
  };

  return (
    <Animated.View style={[styles.container, aniStyle]}>
      <Text style={styles.title}>🎬 MovieHive</Text>
      <Text style={styles.subtitle}>Login to your account</Text>
      
      <View style={styles.form}>
        <TextInput
          placeholder="Email address"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.btn, loading && styles.btnDisabled]} 
          onPress={onLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#070707",
  },
  title: { 
    fontSize: 32, 
    fontWeight: "bold", 
    marginBottom: 8,
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  input: {
    width: "100%",
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: "#0b0b0b",
    color: "#fff",
    fontSize: 16,
  },
  btn: {
    marginTop: 20,
    width: "100%",
    padding: 16,
    backgroundColor: "#2b7cff",
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row", 
    marginTop: 20,
    justifyContent: "center",
  },
  footerText: {
    color: "#9ca3af",
  },
  footerLink: { 
    color: "#2b7cff", 
    fontWeight: "600",
  },
});