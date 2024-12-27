import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { getAllFeedbackReports } from "../../../backend/feedbacknew"; // Adjust API import path

const screenWidth = Dimensions.get("window").width;

const FeedbackAnalytics = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllFeedbackReports();
        if (response.success) {
          setFeedbackData(response.feedbackReports);
          extractCategories(response.feedbackReports);
        } else {
          console.log("Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const extractCategories = (data) => {
    const allCategories = new Set();
    data.forEach((report) => {
      Object.keys(report.feedbackOptions).forEach((key) => {
        if (key !== "FeedbackDuration" && key !== "comment") {
          allCategories.add(key);
        }
      });
    });
    setCategories(Array.from(allCategories));
  };

  const calculateCategoryStats = (category) => {
    const categoryValues = feedbackData.map(
      (report) => report.feedbackOptions[category] || 0
    );

    // Calculate average
    const sum = categoryValues.reduce((acc, value) => acc + value, 0);
    const average = sum / categoryValues.length;

    // Frequency of each rating
    const frequency = categoryValues.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return { average, frequency };
  };

  const renderChart = (categoryStats) => {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#FF33A1",
      "#FFB533",
      "#33FFF5",
      "#F533FF",
      "#57FF33",
    ];

    const data = Object.keys(categoryStats.frequency).map((value, index) => ({
      name: `Rating ${value}`,
      population: categoryStats.frequency[value],
      color: colors[index % colors.length],
      legendFontColor: "#000",
      legendFontSize: 12,
    }));

    return (
      <PieChart
        data={data}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    );
  };

  const renderBarChart = (categoryStats) => {
    const data = {
      labels: Object.keys(categoryStats.frequency),
      datasets: [
        {
          data: Object.values(categoryStats.frequency),
        },
      ],
    };

    return (
      <BarChart
        data={data}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
      />
    );
  };

  const renderAnalytics = () => {
    return categories.map((category) => {
      const categoryStats = calculateCategoryStats(category);

      return (
        <View key={category}>
          <Text style={styles.statsText}>Category: {category}</Text>
          <Text style={styles.statsText}>
            Average Rating: {categoryStats.average.toFixed(2)}
          </Text>
          {renderChart(categoryStats)}
          {renderBarChart(categoryStats)}
        </View>
      );
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Feedback Analytics</Text>

      {renderAnalytics()}
    </ScrollView>
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  statsText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
});

export default FeedbackAnalytics;
