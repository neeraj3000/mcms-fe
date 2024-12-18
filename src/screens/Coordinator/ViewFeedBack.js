import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { Button, Menu, Provider } from "react-native-paper";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const screenWidth = Dimensions.get("window").width;

const categories = [
  "TimelinessOfService",
  "CleanlinessOfDiningHall",
  "FoodQuality",
  "QuantityOfFood",
  "CourtesyOfStaff",
  "StaffHygiene",
  "MenuAdherence",
  "WashAreaCleanliness",
  "Comments",
];

const FeedbackScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("FoodQuality");
  const [feedbackData, setFeedbackData] = useState({
    messFeedback: [],
    timeFeedback: [],
  });

  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    // Simulated backend data fetch
    const fetchData = async () => {
      const data = {
        messFeedback: [
          { name: "Mess A", FoodQuality: 80, StaffHygiene: 70 },
          { name: "Mess B", FoodQuality: 60, StaffHygiene: 85 },
          { name: "Mess C", FoodQuality: 90, StaffHygiene: 75 },
        ],
        timeFeedback: [
          { label: "Jun-Jul", FoodQuality: 70, StaffHygiene: 60 },
          { label: "Jul-Aug", FoodQuality: 80, StaffHygiene: 70 },
        ],
      };
      setFeedbackData(data);
    };

    fetchData();
  }, []);

  // Prepare Pie Chart Data for Mess Feedback
  const pieDataMess = feedbackData.messFeedback.map((item, index) => ({
    name: item.name,
    population: item[selectedCategory] || 0,
    color: ["#007BFF", "#28A745", "#FFC107"][index],
    legendFontColor: "#000",
    legendFontSize: 12,
  }));

  // Prepare Pie Chart Data for Time Feedback
  const pieDataTime = feedbackData.timeFeedback.map((item, index) => ({
    name: item.label,
    population: item[selectedCategory] || 0,
    color: ["#007BFF", "#28A745", "#FFC107", "#DC3545"][index],
    legendFontColor: "#000",
    legendFontSize: 12,
  }));

  // Prepare Bar Chart Data for Mess Feedback
  const barDataMess = {
    labels: feedbackData.messFeedback.map((item) => item.name),
    datasets: [
      {
        data: feedbackData.messFeedback.map(
          (item) => item[selectedCategory] || 0
        ),
      },
    ],
  };

  // Prepare Bar Chart Data for Time Feedback
  const barDataTime = {
    labels: feedbackData.timeFeedback.map((item) => item.label),
    datasets: [
      {
        data: feedbackData.timeFeedback.map(
          (item) => item[selectedCategory] || 0
        ),
      },
    ],
  };

  // Tab Routes
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "mess", title: "Feedback by Mess" },
    { key: "time", title: "Feedback by Time Period" },
  ]);

  // Tab Scenes
  const renderScene = SceneMap({
    mess: () => (
      <ScrollView>
        {/* Pie Chart for Feedback by Mess */}
        <Text style={styles.chartTitle}>
          {selectedCategory} by Mess (Pie Chart)
        </Text>
        <PieChart
          data={pieDataMess}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />

        {/* Bar Chart for Feedback by Mess */}
        <Text style={styles.chartTitle}>
          {selectedCategory} by Mess (Bar Chart)
        </Text>
        <BarChart
          data={barDataMess}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          chartConfig={chartConfig}
          verticalLabelRotation={30}
        />
      </ScrollView>
    ),
    time: () => (
      <ScrollView>
        {/* Pie Chart for Feedback Over Time */}
        <Text style={styles.chartTitle}>
          {selectedCategory} Over Time (Pie Chart)
        </Text>
        <PieChart
          data={pieDataTime}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />

        {/* Bar Chart for Feedback Over Time */}
        <Text style={styles.chartTitle}>
          {selectedCategory} Over Time (Bar Chart)
        </Text>
        <BarChart
          data={barDataTime}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          chartConfig={chartConfig}
          verticalLabelRotation={30}
        />
      </ScrollView>
    ),
  });

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.title}>Mess Feedback Dashboard</Text>

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.label}>Select Category: </Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setMenuVisible(true)}>
                {selectedCategory}
              </Button>
            }
          >
            {categories.map((category) => (
              <Menu.Item
                key={category}
                title={category}
                onPress={() => {
                  setSelectedCategory(category);
                  setMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </View>

        {/* Tabs */}
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: screenWidth }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={{ backgroundColor: "blue" }}
              style={{ backgroundColor: "blue" }}
              labelStyle={{ color: "blue" }}
            />
          )}
        />
      </View>
    </Provider>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
});

export default FeedbackScreen;
