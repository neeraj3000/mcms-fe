import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Alert, ScrollView } from "react-native";
import { Button, TextInput, ActivityIndicator } from "react-native-paper";
import {
  initializeMessMenu,
  getMessMenu,
  updateDayMenu,
} from "../../../backend/messmenunew"; // Adjust path accordingly

const daysOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MessMenuPage = () => {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodDetails, setFoodDetails] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Fetching mess menu...");
    fetchMessMenu();
  }, []);

  const fetchMessMenu = async () => {
    setLoading(true);
    try {
      console.log("Calling getMessMenu...");
      const { success, menu, error } = await getMessMenu();
      if (success && menu) {
        console.log("Menu fetched successfully:", menu);
        setMenu(menu);
        setFoodDetails(getInitialFoodDetails(menu));
      } else {
        console.log("Menu does not exist, initializing...");
        handleInitializeMenu();
      }
    } catch (err) {
      console.error("Error while fetching menu:", err);
      setError(err.message || "Error fetching menu");
    }
    setLoading(false);
  };

  const getInitialFoodDetails = (menu) => {
    const initialDetails = {};
    Object.keys(menu).forEach((day) => {
      initialDetails[day] = {
        breakfast: Array.isArray(menu[day].breakfast)
          ? menu[day].breakfast.join(", ") // Convert array to string for display
          : "",
        lunch: Array.isArray(menu[day].lunch) ? menu[day].lunch.join(", ") : "",
        snacks: Array.isArray(menu[day].snacks)
          ? menu[day].snacks.join(", ")
          : "",
        dinner: Array.isArray(menu[day].dinner)
          ? menu[day].dinner.join(", ")
          : "",
      };
    });
    return initialDetails;
  };

  const handleInitializeMenu = async () => {
    setLoading(true);
    try {
      console.log("Initializing mess menu...");
      const { success, message, error } = await initializeMessMenu();
      if (success) {
        console.log("Mess menu initialized successfully:", message);
        Alert.alert("Success", message);
        fetchMessMenu();
      } else {
        console.error("Error initializing menu:", error);
        setError(error || "Error initializing menu");
      }
    } catch (err) {
      console.error("Error while initializing menu:", err);
      setError(err.message || "Error initializing menu");
    }
    setLoading(false);
  };

  const handleUpdateDayMenu = async (day) => {
    setLoading(true);
    console.log(`Updating menu for ${day}...`);
    try {
      // Convert string input back to array
      const updatedMenu = {
        breakfast: foodDetails[day]?.breakfast
          .split(",")
          .map((item) => item.trim()),
        lunch: foodDetails[day]?.lunch.split(",").map((item) => item.trim()),
        snacks: foodDetails[day]?.snacks.split(",").map((item) => item.trim()),
        dinner: foodDetails[day]?.dinner.split(",").map((item) => item.trim()),
      };

      const { success, message, error } = await updateDayMenu(day, updatedMenu);
      if (success) {
        console.log(`Menu for ${day} updated successfully:`, message);
        Alert.alert("Success", message);
        fetchMessMenu();
      } else {
        console.error(`Error updating menu for ${day}:`, error);
        setError(error || `Error updating menu for ${day}`);
      }
    } catch (err) {
      console.error(`Error while updating menu for ${day}:`, err);
      setError(err.message || `Error updating menu for ${day}`);
    }
    setLoading(false);
  };

  // Sorting the menu by day order
  const sortedMenu = menu
    ? Object.keys(menu).sort((a, b) => {
        return daysOrder.indexOf(a) - daysOrder.indexOf(b);
      })
    : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Mess Menu</Text>
      {loading ? (
        <ActivityIndicator animating={true} size="large" color="#6200ea" />
      ) : (
        <View>
          {menu ? (
            <>
              <Button
                mode="contained"
                onPress={() => handleUpdateDayMenu("all")}
                style={[styles.button, styles.updateButton]}
                disabled={loading}
              >
                Update All Menus
              </Button>
              {sortedMenu.map((day) => (
                <View key={day} style={styles.menuDay}>
                  <Text style={styles.dayHeader}>{day}</Text>
                  <View style={styles.menuDetails}>
                    <TextInput
                      label="Breakfast"
                      value={foodDetails[day]?.breakfast || ""}
                      onChangeText={(text) =>
                        setFoodDetails({
                          ...foodDetails,
                          [day]: { ...foodDetails[day], breakfast: text },
                        })
                      }
                      style={styles.textInput}
                    />
                    <TextInput
                      label="Lunch"
                      value={foodDetails[day]?.lunch || ""}
                      onChangeText={(text) =>
                        setFoodDetails({
                          ...foodDetails,
                          [day]: { ...foodDetails[day], lunch: text },
                        })
                      }
                      style={styles.textInput}
                    />
                    <TextInput
                      label="Snacks"
                      value={foodDetails[day]?.snacks || ""}
                      onChangeText={(text) =>
                        setFoodDetails({
                          ...foodDetails,
                          [day]: { ...foodDetails[day], snacks: text },
                        })
                      }
                      style={styles.textInput}
                    />
                    <TextInput
                      label="Dinner"
                      value={foodDetails[day]?.dinner || ""}
                      onChangeText={(text) =>
                        setFoodDetails({
                          ...foodDetails,
                          [day]: { ...foodDetails[day], dinner: text },
                        })
                      }
                      style={styles.textInput}
                    />
                    <Button
                      mode="contained"
                      onPress={() => handleUpdateDayMenu(day)}
                      style={styles.button}
                    >
                      Update Menu for {day}
                    </Button>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Text>No menu available, initializing...</Text>
          )}
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6200ea",
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
  updateButton: {
    backgroundColor: "#007bff", // Blue theme
  },
  menuDay: {
    marginVertical: 15,
  },
  dayHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  menuDetails: {
    marginTop: 20,
  },
  textInput: {
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default MessMenuPage;
