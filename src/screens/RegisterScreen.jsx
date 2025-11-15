// src/screens/RegisterScreen.jsx
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
import { saveUserToDB } from "../utils/storage";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);
  
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });
    translateX.value = withTiming(0, { duration: 450 });
  }, []);
  
  const aniStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const onRegister = async () => {
    if (!email.includes("@") || password.length < 4 || name.length < 2) {
      return Alert.alert(
        "Invalid",
        "Fill valid name, email and password (min 4 chars)"
      );
    }

    setLoading(true);
    
    try {
      const newUser = { 
        id: Date.now().toString(), 
        name, 
        email, 
        password,
        createdAt: new Date().toISOString()
      };

      await saveUserToDB(newUser);
      Alert.alert("Success", "Account created successfully! Please login.");
      navigation.navigate("Login");
      
    } catch (error) {
      Alert.alert("Error", error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, aniStyle]}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join MovieHive today</Text>
      
      <View style={styles.form}>
        <TextInput
          placeholder="Full name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="words"
        />
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
          onPress={onRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>Login</Text>
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
    fontSize: 28, 
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