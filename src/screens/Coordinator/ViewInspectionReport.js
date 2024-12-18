import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { DataTable, Button } from "react-native-paper";

const data = [
  {
    category: "100-Groceries",
    avgPrice: "$1.36",
    lastYear: "$810,176",
    thisYear: "$829,776",
    goal: "$810,176",
    status: "✅",
  },
  {
    category: "090-Home",
    avgPrice: "$3.28",
    lastYear: "$2,913,647",
    thisYear: "$3,053,226",
    goal: "$2,913,647",
    status: "✅",
  },
  {
    category: "070-Hosiery",
    avgPrice: "$3.57",
    lastYear: "$573,604",
    thisYear: "$486,106",
    goal: "$573,604",
    status: "❌",
  },
];

const ReportTable = () => {
  return (
    <ScrollView horizontal>
      <View>
        <Text style={styles.title}>View Reports</Text>
        <DataTable style={styles.table}>
          {/* Table Header */}
          <DataTable.Header>
            <DataTable.Title>Category</DataTable.Title>
            <DataTable.Title>Avg Price</DataTable.Title>
            <DataTable.Title>Last Year</DataTable.Title>
            <DataTable.Title>This Year</DataTable.Title>
            <DataTable.Title>Goal</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
          </DataTable.Header>

          {/* Table Rows */}
          {data.map((item, index) => (
            <DataTable.Row key={index}>
              <DataTable.Cell>{item.category}</DataTable.Cell>
              <DataTable.Cell>{item.avgPrice}</DataTable.Cell>
              <DataTable.Cell>{item.lastYear}</DataTable.Cell>
              <DataTable.Cell>{item.thisYear}</DataTable.Cell>
              <DataTable.Cell>{item.goal}</DataTable.Cell>
              <DataTable.Cell>{item.status}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>

        {/* Export Button */}
        <Button mode="contained" onPress={() => alert("Exporting to Excel...")}>
          Export to Excel
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, textAlign: "center", marginVertical: 10 },
  table: { marginHorizontal: 10 },
});

export default ReportTable;
