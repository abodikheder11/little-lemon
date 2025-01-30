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
  ActivityIndicator,
  TextInput,
} from "react-native";
import {
  initializeDB,
  getCategories,
  filterByCategories,
  getAllMenuItems,
  syncMenuData,
  searchMenuItems,
} from "../Database";

export default function HomePage({ navigation }) {
  const [menuData, setMenuData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    image: "",
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDB();
        await checkAuth();
        await loadProfile();
        await loadMenuData();
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const applyFilters = async () => {
      try {
        const filtered = await searchMenuItems(
          debouncedSearchTerm,
          selectedCategories
        );
        setMenuData(filtered);
      } catch (error) {
        console.error("Filter error:", error);
      }
    };
    applyFilters();
  }, [debouncedSearchTerm, selectedCategories]);

  useEffect(() => {
    const handleCategoryFilter = async () => {
      try {
        const filteredData = await filterByCategories(selectedCategories);
        setMenuData(filteredData);
      } catch (error) {
        console.error("Filter error:", error);
      }
    };
    handleCategoryFilter();
  }, [selectedCategories]);

  const loadMenuData = async () => {
    try {
      let localData = await getAllMenuItems();
      if (localData.length === 0) {
        const apiData = await fetchAPIData();
        await syncMenuData(apiData);
        localData = await getAllMenuItems();
      }
      setMenuData(localData);
    } catch (error) {
      console.error("Data load error:", error);
    }
  };

  const fetchAPIData = async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json"
      );
      const { menu } = await response.json();
      return menu;
    } catch (error) {
      console.error("API error:", error);
      return [];
    }
  };

  const checkAuth = async () => {
    const isLoggedIn = await AsyncStorage.getItem("userSignedIn");
    if (!isLoggedIn) navigation.navigate("OnBoarding");
  };

  const loadProfile = async () => {
    const [firstName, lastName, image] = await Promise.all([
      AsyncStorage.getItem("firstName"),
      AsyncStorage.getItem("lastName"),
      AsyncStorage.getItem("profileImage"),
    ]);
    setProfile({ firstName, lastName, image });
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };
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
    <FlatList
  ListHeaderComponent={(
    <>
      {/* Keep all components before the list inside ListHeaderComponent */}
      <View style={styles.appBar}>
        <View style={{ width: 30 }}></View>
        <Image source={require("../assets/Logo.png")} style={styles.logo} />
        <Pressable onPress={() => navigation.navigate("Profile")}>
          {profile.image ? (
            <Image
              source={{ uri: profile.image }}
              style={styles.appBarPerson}
            />
          ) : (
            <View style={styles.appBarflName}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
                {`${profile.firstName?.charAt(0)?.toUpperCase() || ""}${
                  profile.lastName?.charAt(0)?.toUpperCase() || ""
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
          <Text style={{ fontSize: 18, color: "#fff", flex: 1, marginRight: 13 }}>
            We are family-owned Mediterranean restaurant, focused on traditional
            recipes served with a modern twist.
          </Text>
          <Image source={require("../assets/Hero.png")} style={styles.image} />
        </View>
        <TextInput style={styles.searchBox} placeholder="Search dishes.." onChangeText={setSearchTerm} value={searchTerm} />
      </View>
      <View>
        <Text style={{ fontSize: 24, fontWeight: "bold", margin: 20 }}>
          ORDER FOR DELIVERY!
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category, index) => (
            <Pressable
              key={category + index}
              onPress={() => toggleCategory(category)}
              style={[
                styles.categories,
                selectedCategories.includes(category) &&
                  styles.selectedCategoryButton,
              ]}
            >
              <Text
                style={[
                  styles.categoriesText,
                  selectedCategories.includes(category) &&
                    styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <View style={styles.divider}></View>
    </>
  )}
  data={menuData}
  ListHeaderComponentStyle ={styles.listContent}
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
  ListEmptyComponent={
    <Text style={styles.emptyText}>
      No dishes found matching your criteria
    </Text>
  }
/>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list:{
    margin :10
  },
  listContent: {
    paddingBottom: 20,
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
  selectedCategoryButton: {
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#388E3C",
  },
  selectedCategoryText: {
    color: "#fff",
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
  searchBox: {
    height: 40,
    margin: 16,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#495E57",
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
