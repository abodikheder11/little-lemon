import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OnBoarding({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const login = async () => {
    try {
      await AsyncStorage.setItem("userSignedIn", JSON.stringify(true));
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("firstName", firstName);
      await AsyncStorage.setItem("lastName",lastName);
      await AsyncStorage.setItem("userSignedIn" , JSON.stringify(true));
      navigation.navigate("Profile");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../assets/Logo.png")} style={styles.logo} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Let us get to know you</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#8A8A8A"
          />
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#8A8A8A"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#8A8A8A"
            keyboardType="email-address"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#dee3e9",
    width: "100%",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  logo: {
    height: 50,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#cbd2d9",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4a6055",
    marginBottom: 20,
    marginTop: 30,
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a6055",
    marginBottom: 8,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#4a6055",
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 20,
  },
  footer: {
    backgroundColor: "#dee3e9",
    paddingVertical: 20,
    alignItems: "flex-end",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#D3DCE6",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: "#4a6055",
    fontWeight: "bold",
  },
});
