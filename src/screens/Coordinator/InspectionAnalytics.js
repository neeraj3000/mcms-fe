import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { Button, Menu, Provider } from "react-native-paper";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const screenWidth = Dimensions.get("window").width;

// Categories for inspection reports
const categories = [
  "Cleanliness",
  "SafetyStandards",
  "EquipmentMaintenance",
  "FirePreparedness",
  "StaffTraining",
  "EmergencyExits",
  "StorageSafety",
  "OverallScore",
];

const InspectionReportScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("Cleanliness");
  const [inspectionData, setInspectionData] = useState({
    locationReports: [],
    timeReports: [],
  });

  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    // Simulated backend data fetch
    const fetchData = async () => {
      const data = {
        locationReports: [
          { name: "Building A", Cleanliness: 85, SafetyStandards: 90 },
          { name: "Building B", Cleanliness: 78, SafetyStandards: 88 },
          { name: "Building C", Cleanliness: 92, SafetyStandards: 95 },
        ],
        timeReports: [
          { label: "Jan-Feb", Cleanliness: 80, SafetyStandards: 85 },
          { label: "Feb-Mar", Cleanliness: 88, SafetyStandards: 87 },
        ],
      };
      setInspectionData(data);
    };

    fetchData();
  }, []);

  // Prepare Pie Chart Data for Location Reports
  const pieDataLocation = inspectionData.locationReports.map((item, index) => ({
    name: item.name,
    population: item[selectedCategory] || 0,
    color: ["#007BFF", "#28A745", "#FFC107"][index],
    legendFontColor: "#000",
    legendFontSize: 12,
  }));

  // Prepare Pie Chart Data for Time Reports
  const pieDataTime = inspectionData.timeReports.map((item, index) => ({
    name: item.label,
    population: item[selectedCategory] || 0,
    color: ["#007BFF", "#28A745", "#FFC107", "#DC3545"][index],
    legendFontColor: "#000",
    legendFontSize: 12,
  }));

  // Prepare Bar Chart Data for Location Reports
  const barDataLocation = {
    labels: inspectionData.locationReports.map((item) => item.name),
    datasets: [
      {
        data: inspectionData.locationReports.map(
          (item) => item[selectedCategory] || 0
        ),
      },
    ],
  };

  // Prepare Bar Chart Data for Time Reports
  const barDataTime = {
    labels: inspectionData.timeReports.map((item) => item.label),
    datasets: [
      {
        data: inspectionData.timeReports.map(
          (item) => item[selectedCategory] || 0
        ),
      },
    ],
  };

  // Tab Routes
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "location", title: "Reports by Location" },
    { key: "time", title: "Reports by Time Period" },
  ]);

  // Tab Scenes
  const renderScene = SceneMap({
    location: () => (
      <ScrollView>
        {/* Pie Chart for Reports by Location */}
        <Text style={styles.chartTitle}>
          {selectedCategory} by Location (Pie Chart)
        </Text>
        <PieChart
          data={pieDataLocation}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />

        {/* Bar Chart for Reports by Location */}
        <Text style={styles.chartTitle}>
          {selectedCategory} by Location (Bar Chart)
        </Text>
        <BarChart
          data={barDataLocation}
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
        {/* Pie Chart for Reports Over Time */}
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

        {/* Bar Chart for Reports Over Time */}
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
        <Text style={styles.title}>Inspection Reports Dashboard</Text>

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

export default InspectionReportScreen;
