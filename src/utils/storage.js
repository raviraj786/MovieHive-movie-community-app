// src/utils/storage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

// Save user to database
export const saveUserToDB = async (user) => {
  try {
    const existingUsers = await AsyncStorage.getItem("user_db");
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    
    // Check if user already exists
    const userExists = users.find(u => u.email === user.email);
    if (userExists) {
      throw new Error("User already exists with this email");
    }
    
    users.push(user);
    await AsyncStorage.setItem("user_db", JSON.stringify(users));
    return true;
  } catch (error) {
    throw error;
  }
};

// Find user by email and password
export const findUser = async (email, password) => {
  try {
    const existingUsers = await AsyncStorage.getItem("user_db");
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    
    const user = users.find(u => u.email === email && u.password === password);
    return user || null;
  } catch (error) {
    return null;
  }
};

// Set logged in user
export const setLoggedInUser = async (user) => {
  try {
    await AsyncStorage.setItem("logged_in_user", JSON.stringify(user));
    return true;
  } catch (error) {
    throw error;
  }
};

// Remove logged in user (logout)
export const removeLoggedInUser = async () => {
  try {
    await AsyncStorage.removeItem("logged_in_user");
    return true;
  } catch (error) {
    throw error;
  }
};