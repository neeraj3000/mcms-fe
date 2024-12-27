import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  Animated,
  Button,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { getMessMenu } from "@/backend/messmenunew";

const RepresentativePage = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [messTimetable, setMessTimetable] = useState({});

  useEffect(() => {
    // Fetch menu data
    const fetchMenu = async () => {
      const response = await getMessMenu();
      setMessTimetable(response.menu || {});
    };
    fetchMenu();

    // Animate header fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const today = new Date().toLocaleString("en-us", { weekday: "long" });
  const todayMenu = messTimetable[today];

  const renderMeal = (title, meal) => (
    <View style={styles.mealSection}>
      <Text style={styles.cardMealTitle}>{title}:</Text>
      <Text style={styles.cardMeal}>
        {Array.isArray(meal)
          ? meal.length
            ? meal.join(", ")
            : "Not available"
          : meal || "Not available"}
      </Text>
    </View>
  );

  const renderCard = (menu) => (
    <Animatable.View animation="fadeInUp" style={styles.card}>
      <Text style={styles.cardTitle}>{menu.day}</Text>
      {renderMeal("Breakfast", menu.breakfast)}
      {renderMeal("Lunch", menu.lunch)}
      {renderMeal("Snacks", menu.snacks)}
      {renderMeal("Dinner", menu.dinner)}
    </Animatable.View>
  );

  // Function to handle sending notifications
  const handleSendNotifications = async () => {
    try {
      await sendNotificationsToAll();
      Alert.alert("Success", "Notifications sent to all users!");
    } catch (error) {
      console.error("Error sending notifications:", error);
      Alert.alert("Error", "There was an issue sending notifications.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../../assets/images/rgulogo2.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>Today's Menu</Text>
      </View>

      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>
          "A good meal can change the course of your day."
        </Text>
        <Text style={styles.quoteText}>
          "Food is the ingredient that binds us together."
        </Text>
      </View>
      <View style={styles.cardContainer}>
        {todayMenu ? (
          renderCard(todayMenu)
        ) : (
          <Text style={styles.noMenuText}>No menu available for today.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e1f5fe",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#0288d1",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  card: {
    padding: 15,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0277bd",
    marginBottom: 10,
    textAlign: "center",
  },
  mealSection: {
    marginBottom: 15,
  },
  cardMealTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },
  cardMeal: {
    fontSize: 14,
    color: "#000000",
  },
  noMenuText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginTop: 20,
  },
  quoteContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#5d4037",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default RepresentativePage;
