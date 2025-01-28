import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
  Text,
  Pressable,
  FlatList,
} from "react-native";
import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabaseAsync('litte_lemon.db')

export default function HomePage({ navigation }) {
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDB = () => {
      db.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS menu (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, price REAL, image TEXT);',
          [],
          () => console.log('Table created successfully'),
          (_, error) => console.error('Error creating table:', error)
        );
      });
    };

    const fetchDataFromServer = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json"
        );
        const json = await response.json();
        const menuItems = json.menu;

        db.transaction(tx => {
          tx.executeSql('DELETE FROM menu;', [], () => {
            menuItems.forEach(item => {
              tx.executeSql(
                'INSERT INTO menu (name, description, price, image) VALUES (?, ?, ?, ?);',
                [item.name, item.description, item.price, item.image],
                () => console.log('Item inserted successfully'),
                (_, error) => console.error('Error inserting item:', error)
              );
            });
          });
        });

        setData(menuItems);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadDataFromDB = () => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM menu;',
          [],
          (_, { rows: { _array } }) => {
            if (_array.length > 0) {
              setData(_array);
            } else {
              fetchDataFromServer();
            }
          },
          (_, error) => console.error('Error loading data:', error)
        );
      });
    };

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
    const verifyUser = async () => {
      const isLoggedIn = await AsyncStorage.getItem("userSignedIn");
      if (!isLoggedIn) {
        navigation.navigate("OnBoarding");
      }
    };
    initializeDB();
    verifyUser();
    getInfo();
    loadDataFromDB();

  }, []);

  const Item = ({ title, price, description, image }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.description}>{description}</Text>
        <Image
          source={{
            uri: `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${image}?raw=true`,
          }}
          style={styles.itemImage}
        />
      </View>
      <Text style={styles.price}>${price}</Text>
    </View>
  );
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.appBar}>
        <View style={{ width: 30 }}></View>
        <Image source={require("../assets/Logo.png")} style={styles.logo} />
        <Pressable onPress={() => navigation.navigate("Profile")}>
          {image ? (
            <Image source={{ uri: image }} style={styles.appBarPerson} />
          ) : (
            <View style={styles.appBarflName}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
                {`${firstName?.charAt(0)?.toUpperCase() || ""}${
                  lastName?.charAt(0)?.toUpperCase() || ""
                }`}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.headerContainer}>
        <Text style={{ fontSize: 40, color: "#f4ce14" }}>Little Lemon</Text>
        <Text style={{ fontSize: 30, color: "#fff" }}>Chicago</Text>
        <View style={styles.innerContainer}>
          <Text
            style={{ fontSize: 18, color: "#fff", flex: 1, marginRight: 13 }}
          >
            We are family owned Mediterranean resturnat, focused on traditional
            recipers server with a modern twist.
          </Text>
          <Image source={require("../assets/Hero.png")} style={styles.image} />
        </View>
      </View>
      <View>
        <Text style={{ fontSize: 24, fontWeight: "bold", margin: 20 }}>
          ORDER FOR DELIVERY!
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Pressable style={styles.categories}>
            <Text style={styles.categoriesText}>Starters</Text>
          </Pressable>
          <Pressable style={styles.categories}>
            <Text style={styles.categoriesText}>Main</Text>
          </Pressable>
          <Pressable style={styles.categories}>
            <Text style={styles.categoriesText}>Deserst</Text>
          </Pressable>
          <Pressable style={styles.categories}>
            <Text style={styles.categoriesText}>Drinks</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.divider}></View>

      <FlatList
        style={styles.list}
        data={data}
        renderItem={({ item }) => (
          <Item
            title={item.name}
            price={item.price}
            description={item.description}
            image={item.image}
          />
        )}
        keyExtractor={(item) =>
          item.id ? item.id.toString() : Math.random().toString()
        }
        ItemSeparatorComponent={() => <View style={styles.separator}></View>}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    margin: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 8,
  },
  appBar: {
    marginTop: 30,
    marginHorizontal: 10,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  appBarflName: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#62D6C4",
    height: 50,
    width: 50,
    borderRadius: 40,
  },
  logo: {
    height: 50,
  },
  appBarPerson: {
    height: 50,
    width: 50,
    resizeMode: "cover",
    borderRadius: 40,
  },
  headerContainer: {
    marginTop: 20,
    backgroundColor: "#4a6055",
    width: "100%",
    padding: 15,
  },
  image: {
    height: 180,
    width: 180,
    resizeMode: "cover",
    borderRadius: 20,
  },
  innerContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    justifyContent: "space-between",
  },
  description: {
    color: "#4a6055",
    fontSize: 16,
    marginTop: 10,
    marginRight: 20,
    flex: 1,
  },
  title: {
    color: "black",
    fontSize: 24,
    marginTop: 10,
  },
  price: {
    color: "#4a6055",
    fontSize: 24,
    marginTop: 10,
  },
  categories: {
    backgroundColor: "#ccd4d1",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginHorizontal: 13,
  },
  categoriesText: {
    color: "#4a6055",
    fontWeight: "bold",
    fontSize: 16,
  },
  divider: {
    width: "100%",
    backgroundColor: "#CCCCCC",
    height: 1,
    marginTop: 20,
  },
  itemImage: {
    width: 90,
    height: 100,
    borderRadius: 5,
  },
});
