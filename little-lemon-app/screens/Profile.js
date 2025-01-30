import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
  Image,
  Button,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import CheckBox from "react-native-check-box";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInputMask } from "react-native-masked-text";

export default function ProfilePage({ navigation }) {
  const [image, setImage] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber,setPhoneNumber] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
 
    const getInfo = async () => {
      const firstName = await AsyncStorage.getItem("firstName");
      const lastName = await AsyncStorage.getItem("lastName");
      const email = await AsyncStorage.getItem("email");
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      const savedImage = await AsyncStorage.getItem("profileImage");
      if (savedImage) {
        setImage(savedImage);
      }
      if (firstName) {
        setFirstName(firstName);
      }
      if (lastName) {
        setLastName(lastName);
      }
      if (email) {
        setEmail(email);
      }
      if (phoneNumber) {
        setPhoneNumber(phoneNumber);
      }
    };
    const verifyUser = async()=>{
      const isLoggedIn = await AsyncStorage.getItem("userSignedIn");
      if(!isLoggedIn){
        navigation.navigate("OnBoarding");
      }
    }
    verifyUser();
    getInfo();
  }, []);

  const removeImage = async()=>{
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove the profile picture ?",
      [
        {text:"Cancel"  ,style:"cancel"},
        {text:"Remove" , style:"destructive" , onPress : ()=>{
          setImage(null);
          AsyncStorage.removeItem("profileImage");
        } }
      ]
    )
  }

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult) {
      alert("sorry u don't have permission");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setImage(selectedImage);
      await AsyncStorage.setItem("profileImage", selectedImage);
    }
  };
  const logout = async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem("userSignedIn" , JSON.stringify(false));
    navigation.navigate("OnBoarding");
  };

  const saveChanges = async () => {
    try {
      await AsyncStorage.setItem("email", email);
      await AsyncStorage.setItem("firstName", firstName);
      await AsyncStorage.setItem("lastName", lastName);
      await AsyncStorage.setItem("phoneNumber", phoneNumber);
      alert("Changes have been submitted");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.appBar}>
        <Pressable style={styles.button} onPress={()=>navigation.pop()}>
          <Icon name="arrow-back" color="#fff" size={24} />
        </Pressable>
        <Image source={require("../assets/Logo.png")} style={styles.logo} />
        {image ? (
          <Image source={{ uri: image }} style={styles.appBarPerson} />
        ) : (
          <View style={styles.appBarflName}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
              {`${firstName?.charAt(0)?.toUpperCase() || ""}${
                lastName?.charAt(0)?.toUpperCase() || ""
              }`}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View>
          <Text style={styles.header}>Personal Information</Text>
        </View>
        <View style={styles.profileRow}>
          <Pressable style={{ width: 70, height: 70 }} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.contentPicture} />
            ) : (
              <View style={styles.flName}>
                <Text
                  style={{ fontSize: 30, fontWeight: "bold", color: "#fff" }}
                >
                  {`${firstName?.charAt(0)?.toUpperCase() || ""}${
                    lastName?.charAt(0)?.toUpperCase() || ""
                  }`}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.changeBotton} onPress={pickImage}>
            <Text style={{ color: "#fff" }}>Change</Text>
          </Pressable>
          <Pressable style={styles.cancelBotton} onPress={removeImage} disabled={!image}>
            <Text style={{ color: "#4a6055" }}>Remove</Text>
          </Pressable>
        </View>
        <View style={styles.form}>
          <Text>First Name</Text>
          <TextInput
            style={styles.box}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.form}>
          <Text>Last Name</Text>
          <TextInput
            style={styles.box}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <View style={styles.form}>
          <Text>Email</Text>
          <TextInput style={styles.box} value={email} onChangeText={setEmail} />
        </View>
        <View style={styles.form}>
          <Text>Phone Number</Text>
          <TextInputMask
            type={"cel-phone"}
            options={{
              maskType: "SYR",
              withDDD: true,
              dddMask: "(999) ",
            }}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType = "numeric"
            style={styles.box}
          />
        </View>
        <View style={styles.notifications}>
          <Text style={{ fontSize: 24 }}>Email notifications</Text>
          <CheckBox rightText="Order Statuses" isChecked={isChecked} onClick={() => setIsChecked(!isChecked)}
          checkBoxColor={isChecked ? "#4a6055" : "#ccc"} />
          <CheckBox rightText="Password Changes"  isChecked={isChecked} onClick={() => setIsChecked(!isChecked)}
          checkBoxColor={isChecked ? "#4a6055" : "#ccc"}/>
          <CheckBox rightText="Special Offers"  isChecked={isChecked} onClick={() => setIsChecked(!isChecked)}
          checkBoxColor={isChecked ? "#4a6055" : "#ccc"}/>
          <CheckBox rightText="New Sletter"  isChecked={isChecked} onClick={() => setIsChecked(!isChecked)}
          checkBoxColor={isChecked ? "#4a6055" : "#ccc"}/>
        </View>
        <Pressable color="yellow" style={styles.logoutBotton} onPress={logout}>
          <Text style={{ fontWeight: "500" }}>Log out</Text>
        </Pressable>
        <View style={styles.footer}>
          <Pressable style={styles.saveBotton}>
            <Text style={{ color: "#4a6055" }}>Discard Changes</Text>
          </Pressable>
          <Pressable style={styles.discardBotton} onPress={saveChanges}>
            <Text style={{ color: "#fff" }}>Save Changes</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderRadius: 5,
    borderColor: "grey",
    borderWidth: 0.5,
  },

  appBar: {
    padding: 10,
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    marginTop: 20,
  },
  button: {
    height: 40,
    width: 40,
    backgroundColor: "#4a6055",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  logo: {
    height: 40,
    width: 170,
    resizeMode: "contain",
  },
  appBarPerson: {
    height: 50,
    width: 50,
    resizeMode: "cover  ",
    borderRadius: 40,
  },
  contentPicture: {
    height: 70,
    width: 80,
    resizeMode: "cover",
    borderRadius: 40,
  },
  divider: {
    height: 1,
    backgroundColor: "black",
    width: "100%",
  },
  header: {
    fontSize: 25,
    padding: 10,
  },
  profileRow: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  flName: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#62D6C4",
    height: 70,
    width: 70,
    borderRadius: 40,
  },
  appBarflName: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#62D6C4",
    height: 50,
    width: 50,
    borderRadius: 40,
  },
  changeBotton: {
    marginLeft: 20,
    backgroundColor: "#4a6055",
    width: 90,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    color: "#fff",
  },
  cancelBotton: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    width: 90,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    color: "#4a6055",
    borderColor: "#4a6055",
    borderWidth: 1,
  },
  box: {
    marginTop: 5,
    width: "100%",
    height: 45,
    borderRadius: 10,
    borderColor: "black",
    borderWidth: 1,
  },
  form: {
    marginHorizontal: 17,
    marginVertical: 10,
  },
  notifications: {
    marginHorizontal: 14,
    gap: 10,
  },
  logoutBotton: {
    backgroundColor: "#f4ce14",
    height: 35,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    marginRight: 20,
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 20,
  },
  saveBotton: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    width: 120,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    color: "#4a6055",
    borderColor: "#4a6055",
    borderWidth: 1,
  },
  discardBotton: {
    marginLeft: 20,
    backgroundColor: "#4a6055",
    width: 120,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    color: "#fff",
  },
});
