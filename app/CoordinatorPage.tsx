import React from "react";
import { View, ScrollView, StyleSheet, Text, Alert } from "react-native";
import { DataTable, Button } from "react-native-paper";
import ExcelJS from "exceljs";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

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
  {
    category: "050-Shoes",
    avgPrice: "$13.73",
    lastYear: "$3,640,471",
    thisYear: "$3,574,900",
    goal: "$3,640,471",
    status: "🟡",
  },
  {
    category: "040-Juniors",
    avgPrice: "$7.06",
    lastYear: "$3,105,550",
    thisYear: "$2,930,385",
    goal: "$3,105,550",
    status: "❌",
  },
];

const ReportTable = () => {
  // Function to export data to Excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reports");

    // Add Table Headers
    worksheet.columns = [
      { header: "Category", key: "category", width: 20 },
      { header: "Avg Price", key: "avgPrice", width: 15 },
      { header: "Last Year", key: "lastYear", width: 15 },
      { header: "This Year", key: "thisYear", width: 15 },
      { header: "Goal", key: "goal", width: 15 },
      { header: "Status", key: "status", width: 10 },
    ];

    // Add Table Rows
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    // File Path
    const fileUri = FileSystem.documentDirectory + "reports.xlsx";

    // Write Excel File
    const buffer = await workbook.xlsx.writeBuffer();
    await FileSystem.writeAsStringAsync(fileUri, buffer.toString("base64"), {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Share the File
    await Sharing.shareAsync(fileUri);
    Alert.alert("Success", "Report downloaded successfully!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>View Reports</Text>
      {/* Outer ScrollView for Vertical Scrolling */}
      <ScrollView style={styles.verticalScroll}>
        {/* Inner ScrollView for Horizontal Scrolling */}
        <ScrollView horizontal>
          <View>
            <DataTable>
              {/* Table Header */}
              <DataTable.Header>
                <DataTable.Title style={styles.cellHeader}>
                  Category
                </DataTable.Title>
                <DataTable.Title style={styles.cellHeader}>
                  Avg Price
                </DataTable.Title>
                <DataTable.Title style={styles.cellHeader}>
                  Last Year
                </DataTable.Title>
                <DataTable.Title style={styles.cellHeader}>
                  This Year
                </DataTable.Title>
                <DataTable.Title style={styles.cellHeader}>
                  Goal
                </DataTable.Title>
                <DataTable.Title style={styles.cellHeader}>
                  Status
                </DataTable.Title>
              </DataTable.Header>

              {/* Table Rows */}
              {data.map((item, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell style={styles.cell}>
                    {item.category}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    {item.avgPrice}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    {item.lastYear}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    {item.thisYear}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    {item.goal}
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cell}>
                    {item.status}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        </ScrollView>
      </ScrollView>
      {/* Export Button */}
      <Button mode="contained" onPress={exportToExcel} style={styles.button}>
        Download as XLSX
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, margin: 10 },
  title: { fontSize: 20, textAlign: "center", marginVertical: 10 },
  verticalScroll: { marginBottom: 10 },
  cellHeader: { width: 150, fontWeight: "bold" },
  cell: { width: 150 },
  button: { marginTop: 10 },
});

export default ReportTable;
