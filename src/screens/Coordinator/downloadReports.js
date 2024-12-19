import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";

const InspectionReportScreen = () => {
  const [inspectionReports, setInspectionReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statistics, setStatistics] = useState({});

  // Fetch data from backend
  const fetchInspectionReports = async () => {
    setIsLoading(true);
    try {
      // Simulate backend API call (replace with your API endpoint)
      // const response = await fetch(
      //   "https://api.example.com/inspection-reports"
      // );
      // const data = await response.json();
      const data = [
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
        {
          InspectionID: 3,
          messNo: 3,
          mrId: 3,
          InspectionDate: "2024-12-15T22:23:27.000Z",
          QualityAndExpiry: 4,
          StandardsOfMaterials: 5,
          StaffAndFoodAdequacy: 4,
          MenuDiscrepancies: 4,
          SupervisorUpdates: 4,
          FoodTasteAndQuality: 5,
          KitchenHygiene: 4,
          UtensilCleanliness: 5,
          ServiceTimingsAdherence: 5,
          Comments: "Satisfactory",
        },
        {
          InspectionID: 4,
          messNo: 4,
          mrId: 4,
          InspectionDate: "2024-12-15T22:23:27.000Z",
          QualityAndExpiry: 3,
          StandardsOfMaterials: 3,
          StaffAndFoodAdequacy: 3,
          MenuDiscrepancies: 3,
          SupervisorUpdates: 3,
          FoodTasteAndQuality: 3,
          KitchenHygiene: 3,
          UtensilCleanliness: 3,
          ServiceTimingsAdherence: 3,
          Comments: "Average inspection",
        },
        {
          InspectionID: 5,
          messNo: 5,
          mrId: 5,
          InspectionDate: "2024-12-15T22:23:27.000Z",
          QualityAndExpiry: 4,
          StandardsOfMaterials: 4,
          StaffAndFoodAdequacy: 4,
          MenuDiscrepancies: 4,
          SupervisorUpdates: 4,
          FoodTasteAndQuality: 4,
          KitchenHygiene: 4,
          UtensilCleanliness: 4,
          ServiceTimingsAdherence: 4,
          Comments: "Good overall",
        },
      ];

      setInspectionReports(data);
      calculateStatistics(data);
    } catch (error) {
      console.error("Error fetching inspection reports:", error);
      Alert.alert("Error", "Failed to fetch inspection reports.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to calculate statistics
  const calculateStatistics = (data) => {
    const totalReports = data.length;

    // Group reports by status (e.g., Passed, Failed)
    const statusCounts = data.reduce((acc, report) => {
      const status = report.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    setStatistics({
      totalReports,
      statusCounts,
    });
  };

  // Function to export data to Excel
  const exportToExcel = async () => {
    setIsDownloading(true);

    try {
      if (inspectionReports.length === 0) {
        Alert.alert("No Data", "No inspection reports to export.");
        setIsDownloading(false);
        return;
      }

      // Convert JSON data to Excel
      const ws = XLSX.utils.json_to_sheet(inspectionReports);
      const keys = Object.keys(inspectionReports[0]);
      XLSX.utils.sheet_add_aoa(ws, [keys], { origin: "A1" });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "InspectionReports");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // Save the file to the device using Expo FileSystem
      const fileUri = FileSystem.documentDirectory + "inspection_reports.xlsx";

      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert("Success", `File saved to: ${fileUri}`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      Alert.alert("Error", "Failed to export the data.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchInspectionReports();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inspection Reports</Text>

      {/* Show Loader while fetching */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <>
          {/* Display Statistical Summaries */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Statistical Summary</Text>
            <Text>Total Reports: {statistics.totalReports || 0}</Text>
            {Object.entries(statistics.statusCounts || {}).map(
              ([status, count]) => (
                <Text key={status}>
                  {status}: {count}
                </Text>
              )
            )}
          </View>

          {/* Display Data in a List */}
          {inspectionReports.length > 0 ? (
            <FlatList
              data={inspectionReports}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.reportItem}>
                  <Text style={styles.reportText}>
                    ID: {item.id} | Name: {item.name} | Status: {item.status} |
                    Date: {item.date}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noDataText}>No reports to display.</Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Refresh Data"
              onPress={fetchInspectionReports}
              color="#007BFF"
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title={isDownloading ? "Downloading..." : "Export to Excel"}
              onPress={exportToExcel}
              color="#28A745"
              disabled={isDownloading}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#E7F3FE",
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  reportItem: {
    backgroundColor: "#FFF",
    padding: 12,
    marginVertical: 4,
    borderRadius: 6,
    elevation: 2,
  },
  reportText: {
    fontSize: 14,
    color: "#333",
  },
});

export default InspectionReportScreen;
