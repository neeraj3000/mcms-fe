import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Animated,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { getMessMenu } from "../../../backend/messmenunew"; // Import the function from your API utility

const MessMenupage = () => {
  const [messTimetable, setMessTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchMessTimetable();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,  
    }).start();
  }, [fadeAnim]);

  const fetchMessTimetable = async () => {
    try {
      const response = await getMessMenu(); // Call the provided function
      setMessTimetable(response.menu || {}); // Update state with the fetched menu
    } catch (error) {
      console.error("Error fetching mess timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }) => (
    <Animatable.View animation="fadeInUp" style={styles.card}>
      <Text style={styles.cardTitle}>{item.day}</Text>
      <Text style={styles.cardMealTitle}>Breakfast:</Text>
      <Text style={styles.cardMeal}>{item.breakfast.join(", ")}</Text>
      <Text style={styles.cardMealTitle}>Lunch:</Text>
      <Text style={styles.cardMeal}>{item.lunch.join(", ")}</Text>
      <Text style={styles.cardMealTitle}>Dinner:</Text>
      <Text style={styles.cardMeal}>{item.dinner.join(", ")}</Text>
      <Text style={styles.cardMealTitle}>Snacks:</Text>
      <Text style={styles.cardMeal}>{item.snacks.join(", ")}</Text>
    </Animatable.View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  // Define the correct order of the days from Sunday to Saturday
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Sort the messTimetable based on the daysOfWeek order
  const sortedTimetable = daysOfWeek.map((day) => {
    const menu = messTimetable[day];
    return {
      day: menu ? menu.day : day,
      breakfast: menu?.breakfast || [],
      lunch: menu?.lunch || [],
      dinner: menu?.dinner || [],
      snacks: menu?.snacks || [],
    };
  });

  return (
    <FlatList
      data={sortedTimetable}
      renderItem={renderCard}
      keyExtractor={(item) => item.day}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#e3f2fd",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196f3",
    marginBottom: 5,
  },
  cardMealTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardMeal: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
});

export default MessMenupage;
