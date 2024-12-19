import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { DataTable } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import ExcelJS from "exceljs";

// Sample inspection data
const inspectionData = [
  {
    InspectionID: 1,
    messNo: 1,
    mrId: 1,
    InspectionDate: "2024-12-15T22:23:27.000Z",
    QualityAndExpiry: 4,
    StandardsOfMaterials: 4,
    StaffAndFoodAdequacy: 5,
    MenuDiscrepancies: 3,
    SupervisorUpdates: 4,
    FoodTasteAndQuality: 5,
    KitchenHygiene: 4,
    UtensilCleanliness: 4,
    ServiceTimingsAdherence: 4,
    Comments: "Inspection completed successfully",
  },
  {
    InspectionID: 2,
    messNo: 2,
    mrId: 2,
    InspectionDate: "2024-12-15T22:23:27.000Z",
    QualityAndExpiry: 3,
    StandardsOfMaterials: 4,
    StaffAndFoodAdequacy: 4,
    MenuDiscrepancies: 4,
    SupervisorUpdates: 3,
    FoodTasteAndQuality: 4,
    KitchenHygiene: 3,
    UtensilCleanliness: 4,
    ServiceTimingsAdherence: 3,
    Comments: "Minor issues noted",
  },
];

// Function to dynamically generate table headers
const getHeaders = (data) => {
  const headers = Object.keys(data[0]);
  return headers.map((header) => ({
    label: header.replace(/([A-Z])/g, " $1").toUpperCase(),
    key: header,
  }));
};

const InspectionReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const headers = getHeaders(inspectionData);

  useEffect(() => {
    // Simulating API call to fetch reports
    const fetchReports = () => {
      setIsLoading(true);
      setTimeout(() => {
        setReports(inspectionData);
        setIsLoading(false);
      }, 1000);
    };

    fetchReports();
  }, []);

  const generateAndShareExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inspection Reports");

    // Add headers to the worksheet
    worksheet.columns = headers.map((header) => ({
      header: header.label,
      key: header.key,
      width: 25,
    }));

    // Add rows
    reports.forEach((item) => worksheet.addRow(item));

    try {
      // Write workbook to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Define file path
      const fileUri = FileSystem.documentDirectory + "inspection_reports.xlsx";

      // Write the buffer to a file
      await FileSystem.writeAsStringAsync(fileUri, buffer.toString("base64"), {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        Alert.alert("Success", "Excel file has been shared successfully!");
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate or share the Excel file.");
      console.error("Error: ", error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text>Loading inspection reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inspection Reports</Text>
      <ScrollView style={styles.scrollContainer}>
        <ScrollView horizontal>
          <DataTable>
            <DataTable.Header style={styles.header}>
              {headers.map((header, index) => (
                <DataTable.Title key={index} style={styles.cellHeader}>
                  {header.label}
                </DataTable.Title>
              ))}
            </DataTable.Header>

            {reports.map((item, index) => (
              <DataTable.Row key={index} style={styles.row}>
                {headers.map((header) => (
                  <DataTable.Cell key={header.key} style={styles.cell}>
                    {header.key === "InspectionDate"
                      ? new Date(item[header.key]).toLocaleDateString()
                      : item[header.key]}
                  </DataTable.Cell>
                ))}
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      </ScrollView>
      <Button title="Download as Excel" onPress={generateAndShareExcel} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E3F2FD", padding: 10 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E88E5",
    marginBottom: 10,
  },
  scrollContainer: { marginBottom: 10 },
  header: { backgroundColor: "#BBDEFB" },
  cellHeader: {
    fontWeight: "bold",
    color: "#1E88E5",
    minWidth: 120,
    textAlign: "center",
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  cell: {
    minWidth: 120,
    textAlign: "center",
    paddingVertical: 10,
  },
});

export default InspectionReports;
