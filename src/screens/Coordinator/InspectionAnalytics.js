import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { getAllInspectionReports } from "../../../backend/inspectionnew"; // Adjust API import path

const screenWidth = Dimensions.get("window").width;

const InspectionReportScreen = () => {
  const [inspectionData, setInspectionData] = useState({
    reports: [],
    messCount: {},
    dateCount: {},
    optionsCount: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportResponse = await getAllInspectionReports();
        if (reportResponse.success) {
          const reports = reportResponse.inspectionReports;

          const messCount = {};
          const dateCount = {};
          const optionsCount = {};

          reports.forEach((report) => {
            // Counting by messNo
            messCount[report.messNo] = (messCount[report.messNo] || 0) + 1;

            // Counting by inspectionDate
            dateCount[report.inspectionDate] =
              (dateCount[report.inspectionDate] || 0) + 1;

            // Counting by options (checking if options exists and is an array)
            if (Array.isArray(report.options)) {
              report.options.forEach((option) => {
                optionsCount[option] = (optionsCount[option] || 0) + 1;
              });
            } else {
              // Handle the case when options is not an array or is undefined
              console.warn(
                `Options not available for inspection report ${report.inspectionId}`
              );
            }
          });

          setInspectionData({
            reports,
            messCount,
            dateCount,
            optionsCount,
          });
        } else {
          console.error(
            "Failed to fetch inspection reports:",
            reportResponse.message
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Prepare Pie Chart Data for Mess Distribution
  const pieDataMess = Object.keys(inspectionData.messCount).map((messNo) => ({
    name: `Mess ${messNo}`,
    population: inspectionData.messCount[messNo],
    color: ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC300"][
      Object.keys(inspectionData.messCount).indexOf(messNo) % 5
    ],
    legendFontColor: "#000",
    legendFontSize: 12,
  }));

  // Prepare Pie Chart Data for Options Distribution
  const pieDataOptions = Object.keys(inspectionData.optionsCount).map(
    (option) => ({
      name: option,
      population: inspectionData.optionsCount[option],
      color: ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#C70039", "#900C3F"][
        Object.keys(inspectionData.optionsCount).indexOf(option) % 6
      ],
      legendFontColor: "#000",
      legendFontSize: 12,
    })
  );

  // Prepare Bar Chart Data for Reports by Date
  const barDataDate = {
    labels: Object.keys(inspectionData.dateCount),
    datasets: [
      {
        data: Object.values(inspectionData.dateCount),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Inspection Reports Statistical Analysis</Text>

      {/* Pie Chart for Reports by Mess */}
      <Text style={styles.chartTitle}>Reports by Mess</Text>
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

      {/* Bar Chart for Reports by Date */}
      <Text style={styles.chartTitle}>Reports by Date</Text>
      <BarChart
        data={barDataDate}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        chartConfig={chartConfig}
        verticalLabelRotation={30}
      />

      {/* Pie Chart for Distribution of Options */}
      <Text style={styles.chartTitle}>Reports by Inspection Options</Text>
      <PieChart
        data={pieDataOptions}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />
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
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
});

export default InspectionReportScreen;
