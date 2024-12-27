import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { Button, Menu } from "react-native-paper";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const screenWidth = Dimensions.get("window").width;

// Reusable Analytics Component
const AnalyticsView = ({ title, categories, data }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [menuVisible, setMenuVisible] = useState(false);

  // Prepare Pie Chart Data for First Tab
  const pieDataFirstTab = data.firstTab.map((item, index) => ({
    name: item.name || item.label,
    population: item[selectedCategory] || 0,
    color: ["#007BFF", "#28A745", "#FFC107", "#DC3545"][index],
    legendFontColor: "#000",
    legendFontSize: 12,
  }));

  // Prepare Bar Chart Data for First Tab
  const barDataFirstTab = {
    labels: data.firstTab.map((item) => item.name || item.label),
    datasets: [
      {
        data: data.firstTab.map((item) => item[selectedCategory] || 0),
      },
    ],
  };

  // Prepare Pie Chart Data for Second Tab
  const pieDataSecondTab = data.secondTab.map((item, index) => ({
    name: item.name || item.label,
    population: item[selectedCategory] || 0,
    color: ["#007BFF", "#28A745", "#FFC107", "#DC3545"][index],
    legendFontColor: "#000",
    legendFontSize: 12,
  }));

  // Prepare Bar Chart Data for Second Tab
  const barDataSecondTab = {
    labels: data.secondTab.map((item) => item.name || item.label),
    datasets: [
      {
        data: data.secondTab.map((item) => item[selectedCategory] || 0),
      },
    ],
  };

  // Tabs
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "First Tab" },
    { key: "second", title: "Second Tab" },
  ]);

  const renderScene = {
    first: () => (
      <ScrollView>
        <Text style={styles.chartTitle}>{selectedCategory} (Pie Chart)</Text>
        <PieChart
          data={pieDataFirstTab}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />

        <Text style={styles.chartTitle}>{selectedCategory} (Bar Chart)</Text>
        <BarChart
          data={barDataFirstTab}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
        />
      </ScrollView>
    ),
    second: () => (
      <ScrollView>
        <Text style={styles.chartTitle}>{selectedCategory} (Pie Chart)</Text>
        <PieChart
          data={pieDataSecondTab}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />

        <Text style={styles.chartTitle}>{selectedCategory} (Bar Chart)</Text>
        <BarChart
          data={barDataSecondTab}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
        />
      </ScrollView>
    ),
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

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

      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap(renderScene)}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "blue" }}
            style={{ backgroundColor: "blue" }}
            labelStyle={{ color: "white" }}
          />
        )}
      />
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4", paddingTop: 16 },
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
  },
  label: { fontSize: 16, marginRight: 8 },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
});

export default AnalyticsView;
