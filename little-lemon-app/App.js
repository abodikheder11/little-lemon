import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View,ActivityIndicator } from "react-native";
import OnBoarding from "./screens/OnBoarding";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfilePage from "./screens/Profile";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HomePage from "./screens/Home";

const Stack = createNativeStackNavigator();

export default function App() {
  const [userSignedIn, setUserSignedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem("userSignedIn");
        setUserSignedIn(JSON.parse(isLoggedIn));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={userSignedIn ? "Home" : "OnBoarding"}>
        <Stack.Screen name="Profile" component={ProfilePage} />
        <Stack.Screen name="OnBoarding" component={OnBoarding} />
        <Stack.Screen name="Home" component={HomePage} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});