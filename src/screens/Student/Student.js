import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  Animated,
  TouchableOpacity,
  ScrollView,
  Alert,
  Button,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { sendNotificationsToAll } from "../../../backend/PushNotificationnew"; // Import the function to send notifications

const StudentHomePage = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const messTimetable = [
    {
      day: "Sunday",
      breakfast: "1. Chapathi\n2. Alukurma\n3. Milk",
      lunch:
        "1. Veg Biryani Rice\n2. Chicken & Gutti Vankaya Curry\n3. Rytha\n4. Sambar\n5. Sweet",
      evening_snacks: "1. Milk Biscuits (4)\n2. Tea",
      dinner: "1. Rice\n2. Dosakaya Chutney\n3. Sambar\n4. Banana\n5. Curd",
    },
    {
      day: "Monday",
      breakfast: "1. Idly(4)\n2. Palli Chutney\n3. Boiled Egg\n4. Milk",
      lunch:
        "1. Rice\n2. Thotakura/Palakura Pappu\n3. Alu Fry\n4. Rasam\n5. Curd\n6. Banana",
      dinner:
        "1. Rice\n2. Vankaya Batani Curry\n3. Sambar\n4. Roti Chutney Cabbage\n5. Curd",
    },
    {
      day: "Tuesday",
      breakfast:
        "1. Lemon/Tamarind Rice/Pongal\n2. Katta/Sambar\n3. Boiled Egg\n4. Milk",
      lunch:
        "1. Rice\n2. Tomoto Pappu\n3. Dondakaya Fry\n4. Rasam\n5. Curd\n6. Banana",
      dinner:
        "1. Rice\n2. Beerakaya Curry\n3. Sambar\n4. Tomoto Chutney\n5. Curd",
    },
    {
      day: "Wednesday",
      breakfast: "1. Upma/Semya Upma\n2. Palli/Putnala Chutney\n3. Milk",
      lunch: "1. Rice\n2. Chicken & Paneer\n3. Sweet\n4. Banana\n5. Curd",
      dinner:
        "1. Rice\n2. Bendakaya Curry\n3. Sambar\n4. Mango Chutney\n5. Curd",
    },
    {
      day: "Thursday",
      breakfast: "1. Vada (3 No’s)\n2. Palli Chutney\n3. Boiled Egg\n4. Milk",
      lunch:
        "1. Rice\n2. Dosakaya Pappu\n3. Cabbage Fry\n4. Rasam\n5. Curd\n6. Banana",
      dinner:
        "1. Rice\n2. Chikkudukay/Beans Curry\n3. Sambar\n4. Lemon Pickle\n5. Curd",
    },
    {
      day: "Friday",
      breakfast: "1. Onion Uthappam\n2. Palli Chutney\n3. Boiled Egg\n4. Milk",
      lunch:
        "1. Rice\n2. Sorakaya Pesarapappu\n3. Beetroot/Carrot Fry\n4. Rasam\n5. Curd\n6. Banana",
      dinner:
        "1. Rice\n2. Alu Dum Fry\n3. Sambar\n4. Roti Chutney (Dondakaya)\n5. Curd",
    },
    {
      day: "Saturday",
      breakfast:
        "1. Mysore Bajji (4)\n2. Palli Chutney\n3. Boiled Egg\n4. Milk",
      lunch:
        "1. Rice\n2. Mudda Pappu\n3. Pachi Pulusu\n4. Avakaya Pickle\n5. Papad\n6. Banana\n7. Curd",
      evening_snacks: "1. Atukulu (Chuduva)\n2. Tea",
      dinner:
        "1. Rice\n2. Mixed Veg Fry (Alu+Carrot+Beans)\n3. Sambar\n4. Gongura Chutney\n5. Curd",
    },
  ];

  const today = new Date().toLocaleString("en-us", { weekday: "long" });
  const todayMenu = messTimetable.find((item) => item.day === today);

  const renderCard = (item) => (
    <Animatable.View animation="fadeInUp" style={styles.card}>
      <Text style={styles.cardTitle}>{item.day}</Text>
      <View style={styles.mealSection}>
        <Text style={styles.cardMealTitle}>Breakfast:</Text>
        <Text style={styles.cardMeal}>{item.breakfast}</Text>
      </View>
      <View style={styles.mealSection}>
        <Text style={styles.cardMealTitle}>Lunch:</Text>
        <Text style={styles.cardMeal}>{item.lunch}</Text>
      </View>
      <View style={styles.mealSection}>
        <Text style={styles.cardMealTitle}>Dinner:</Text>
        <Text style={styles.cardMeal}>{item.dinner}</Text>
      </View>
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

      <View style={styles.cardContainer}>
        {todayMenu ? (
          renderCard(todayMenu)
        ) : (
          <Text style={styles.noMenuText}>No menu available for today.</Text>
        )}
      </View>

      <View style={styles.notificationButtonContainer}>
        <Button
          title="Send Notifications to All Users"
          onPress={handleSendNotifications}
        />
      </View>

      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>
          "A good meal can change the course of your day."
        </Text>
        <Text style={styles.quoteText}>
          "Food is the ingredient that binds us together."
        </Text>
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
  notificationButtonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default StudentHomePage;
