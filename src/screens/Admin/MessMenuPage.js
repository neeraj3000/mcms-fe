import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import MultiSelect from "react-native-multiple-select";
import { sendNotification, sendToAll } from "../../utils/sendNotifications";
import {
  initializeMessMenu,
  getMessMenu,
  updateDayMenu,
} from "../../../backend/messmenunew";
import { MaterialCommunityIcons } from "react-native-vector-icons"; // Import the icon library

const daysOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const meals = {
  breakfast: [
    "Idly(4)",
    "Palli Chutney",
    "Boiled Egg",
    "Milk",
    "Lemon/Tamarind Rice/Pongal",
    "Katta/Sambar",
    "Upma/Semya Upma",
    "Palli/Putnala Chutney",
    "Onion Uthappam",
    "Mysore Bajji (4)",
    "Chapathi",
    "Alukurma",
  ],
  lunch: [
    "Rice",
    "Thotakura/Palakura Pappu",
    "Alu Fry",
    "Rasam",
    "Curd",
    "Banana",
    "Tomoto Pappu",
    "Dondakaya Fry",
    "Beerakaya Curry",
    "Sweet",
    "Chicken & Paneer",
    "Bendakaya Curry",
    "Mudda Pappu",
    "Pachi Pulusu",
    "Avakaya Pickle",
    "Papad",
    "Mixed Veg Fry (Alu+Carrot+Beans)",
    "Veg Biryani Rice",
    "Chicken & Gutti Vankaya Curry",
  ],
  snacks: ["Palli Chutney", "Tea", "Atukulu (Chuduva)", "Milk Biscuits (4)"],
  dinner: [
    "Rice",
    "Vankaya Batani Curry",
    "Sambar",
    "Roti",
    "Chutney",
    "Cabbage",
    "Chikkudukay/Beans Curry",
    "Tomoto Chutney",
    "Alu Dum Fry",
    "Mixed Veg Fry",
    "Gongura Chutney",
    "Dosakaya Chutney",
  ],
};

const MessMenuPage = () => {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodDetails, setFoodDetails] = useState({});
  const [newItem, setNewItem] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessMenu();
  }, []);

  const fetchMessMenu = async () => {
    setLoading(true);
    try {
      const { success, menu, error } = await getMessMenu();
      if (success && menu) {
        setMenu(menu);
        setFoodDetails(getInitialFoodDetails(menu));
      } else {
        handleInitializeMenu();
      }
    } catch (err) {
      setError(err.message || "Error fetching menu");
    }
    setLoading(false);
  };

  const getInitialFoodDetails = (menu) => {
    const initialDetails = {};
    Object.keys(menu).forEach((day) => {
      initialDetails[day] = { ...menu[day] };
    });
    return initialDetails;
  };

  const handleInitializeMenu = async () => {
    setLoading(true);
    try {
      const { success, message, error } = await initializeMessMenu();
      if (success) {
        Alert.alert("Success", message);
        fetchMessMenu();
      } else {
        setError(error || "Error initializing menu");
      }
    } catch (err) {
      setError(err.message || "Error initializing menu");
    }
    setLoading(false);
  };

  const handleUpdateDayMenu = async (day) => {
    setLoading(true);
    try {
      const updatedMenu = foodDetails[day];
      const { success, message, error } = await updateDayMenu(day, updatedMenu);
      if (success) {
        Alert.alert("Success", message);
        sendToAll("Menu Update", `Menu is Updated  for ${day}`);
        fetchMessMenu();
      } else {
        setError(error || `Error updating menu for ${day}`);
      }
    } catch (err) {
      setError(err.message || `Error updating menu for ${day}`);
    }
    setLoading(false);
  };

  const handleAddItem = (mealType, day) => {
    if (newItem[mealType]) {
      setFoodDetails({
        ...foodDetails,
        [day]: {
          ...foodDetails[day],
          [mealType]: [...foodDetails[day][mealType], newItem[mealType]],
        },
      });
      setNewItem({ ...newItem, [mealType]: "" });
    } else {
      Alert.alert("Error", "Please enter a valid item");
    }
  };

  const handleRemoveItem = (mealType, day, itemToRemove) => {
    const updatedItems = foodDetails[day][mealType].filter(
      (item) => item !== itemToRemove
    );
    setFoodDetails({
      ...foodDetails,
      [day]: {
        ...foodDetails[day],
        [mealType]: updatedItems,
      },
    });
  };

  const renderMenuItem = ({ item: day }) => (
    <View style={styles.menuDay}>
      <Text style={styles.dayHeader}>{day}</Text>
      {["breakfast", "lunch", "snacks", "dinner"].map((mealType) => (
        <View key={mealType} style={styles.mealContainer}>
          <Text style={styles.mealType}>
            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </Text>
          <MultiSelect
            items={meals[mealType].map((item) => ({ id: item, name: item }))}
            uniqueKey="id"
            onSelectedItemsChange={(selectedItems) => {
              setFoodDetails({
                ...foodDetails,
                [day]: { ...foodDetails[day], [mealType]: selectedItems },
              });
            }}
            selectedItems={foodDetails[day]?.[mealType] || []}
            selectText={`Select ${
              mealType.charAt(0).toUpperCase() + mealType.slice(1)
            }`}
            searchInputPlaceholderText={`Search for ${mealType}`}
          />
          <View style={styles.addItemContainer}>
            <TextInput
              style={styles.input}
              value={newItem[mealType]}
              onChangeText={(text) =>
                setNewItem({ ...newItem, [mealType]: text })
              }
              placeholder={`Add new ${mealType} item`}
            />
            <Button
              mode="contained"
              onPress={() => handleAddItem(mealType, day)}
              style={styles.addButton}
            >
              Add
            </Button>
          </View>

          <View style={styles.addedItemsContainer}>
            {foodDetails[day]?.[mealType]?.map((item, index) => (
              <View key={index} style={styles.addedItemRow}>
                <Text style={styles.addedItem}>{item}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(mealType, day, item)}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color="red"
                    style={styles.removeItemIcon}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ))}
      <Button
        mode="contained"
        onPress={() => handleUpdateDayMenu(day)}
        style={styles.button}
      >
        Update Menu for {day}
      </Button>
    </View>
  );

  return (
    <FlatList
      data={
        menu
          ? Object.keys(menu).sort(
              (a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b)
            )
          : []
      }
      renderItem={renderMenuItem}
      keyExtractor={(item) => item}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator animating={true} size="large" color="#6200ea" />
        ) : (
          <Text>No menu available, initializing...</Text>
        )
      }
      contentContainerStyle={styles.container}
      style={{ flex: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  button: {
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#6200ea",
    borderRadius: 4,
    padding: 8,
    marginRight: 10, // Space between input and button
    flex: 1, // Ensure the input takes up available space
  },
  addItemContainer: {
    flexDirection: "row", // Align input and button side by side
    alignItems: "center", // Vertically center the items
    marginBottom: 10,
  },
  addButton: {
    flexShrink: 0, // Prevent the button from shrinking
  },
  menuDay: {
    marginVertical: 15,
  },
  dayHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mealContainer: {
    marginBottom: 20,
  },
  mealType: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  addedItemsContainer: {
    marginTop: 10,
  },
  addedItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  addedItem: {
    fontSize: 14,
    color: "#6200ea",
    marginRight: 10, // Space between item and icon
  },
  removeItemIcon: {
    marginLeft: 5, // Space between item and icon
  },
});

export default MessMenuPage;
