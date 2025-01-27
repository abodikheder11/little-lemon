import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import OnBoarding from "./screens/OnBoarding";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfilePage from "./screens/Profile";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();

export default function App() {

  const [userSignedIn, setUserSignedIn] = useState(null); 
useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      const isLoggedIn = await AsyncStorage.getItem("userSignedIn");
      setUserSignedIn(JSON.parse(isLoggedIn));  
    } catch (error) {}
  };
  checkLoginStatus();
}, []);
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown : false}} initialRouteName={userSignedIn ? "OnBoarding" : "ProfilePage"}>
      <Stack.Screen name="ProfilePage" component={ProfilePage}/>
      <Stack.Screen name="OnBoarding" component={OnBoarding}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
// {userSignedIn ? (
//   <>
//     <Stack.Screen name="ProfilePage" component={ProfilePage} />
//   </>
// ) : (
//   <Stack.Screen name="OnBoarding" component={OnBoarding} />
// )}