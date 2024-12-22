import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { DataTable } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import ExcelJS from "exceljs";
import { getfeedbackReportsByMessNo } from "../../../backend/inspectionnew"; // Replace with correct path
import { getFeedbackReportsByMessId } from "../../../backend/feedbacknew"; // Replace with correct path


const ViewFeedBack = () => {
  const [messNo, setMessNo] = useState(""); // Selected mess number
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);

  const fetchReports = async (selectedMessNo) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getFeedbackReportsByMessId(selectedMessNo);
      if (response.success) {
        setReports(response.feedbackReports);

        let headers = [];
        let rows = [];

        // Loop through the reports to build headers and rows
        for (let i = 0; i < response.feedbackReports.length; i++) {
          // Sort feedbackOptions by keys before processing
          const sortedOptions = Object.fromEntries(
            Object.entries(response.feedbackReports[i].feedbackOptions).sort(
              ([keyA], [keyB]) => keyA.localeCompare(keyB)
            )
          );

          let obj = sortedOptions; // Assign the sorted options to obj
          let row = [];

          // For the first row, populate headers
          if (i === 0) {
            for (let key in obj) {
              row.push(obj[key]); // Add the option value to the row
              headers.push(key); // Add the key (option name) to the headers
            }
          } else {
            // For other rows, just add the values for options
            for (let key in obj) {
              row.push(obj[key]);
            }
          }
          rows.push(row);
        }


        // Now, headers and rows are ready
        setHeaders(headers);
        setRows(rows);
      } else {
        setReports([]);
        setError(response.message || "Failed to fetch reports.");
      }
    } catch (err) {
      setError("An error occurred while fetching reports.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndShareExcel = async () => {
    if (reports.length === 0) {
      Alert.alert("Error", "No reports available to download.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("feedback Reports");

    // Add header row
    if (reports.length > 0) {
      const columns = Object.keys(reports[0]).map((key) => ({
        header: key.replace(/([A-Z])/g, " $1").toUpperCase(),
        key,
        width: 25,
      }));
      worksheet.columns = columns;

      // Add rows
      reports.forEach((report) => worksheet.addRow(report));

      // Write Excel to file
      const fileUri = FileSystem.documentDirectory + "feedbackReports.xlsx";

      try {
        const buffer = await workbook.xlsx.writeBuffer();
        await FileSystem.writeAsStringAsync(
          fileUri,
          buffer.toString("base64"),
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
          Alert.alert("Success", "Excel file shared successfully!");
        } else {
          Alert.alert("Error", "Sharing is not available on this device.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to generate Excel file.");
        console.error("Error: ", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>feedback Reports</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Mess Number:</Text>
        <Picker
          selectedValue={messNo}
          onValueChange={(value) => {
            setMessNo(value);
            if (value) fetchReports(value);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select Mess Number" value="" />
          <Picker.Item label="Mess 1" value="1" />
          <Picker.Item label="Mess 2" value="2" />
          <Picker.Item label="Mess 3" value="3" />
          <Picker.Item label="Mess 4" value="4" />
          <Picker.Item label="Mess 5" value="5" />
          <Picker.Item label="Mess 6" value="6" />
          <Picker.Item label="Mess 7" value="7" />
          <Picker.Item label="Mess 8" value="8" />
        </Picker>
      </View>

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text>Loading feedback reports...</Text>
        </View>
      )}

      {!isLoading && error ? <Text style={styles.error}>{error}</Text> : null}

      {!isLoading && rows.length > 0 && (
        <ScrollView horizontal style={styles.scrollContainer}>
          <View style={styles.tableContainer}>
            {/* Render the header row */}
            <View style={styles.row}>
              {headers.map((header, index) => (
                <View
                  key={index}
                  style={[
                    styles.cellHeader,
                    { width: `${100 / headers.length}%` },
                  ]}
                >
                  <Text style={styles.headerText}>{header}</Text>
                </View>
              ))}
            </View>

            {/* Render the data rows */}
            {rows.map((row, index) => (
              <View key={index} style={styles.row}>
                {row.map((value, idx) => (
                  <View
                    key={idx}
                    style={[styles.cell, { width: `${100 / headers.length}%` }]}
                  >
                    <Text>{value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <Button title="Download as Excel" onPress={generateAndShareExcel} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E88E5",
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
  },
  picker: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    marginBottom: 20,
  },
  tableContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cellHeader: {
    backgroundColor: "#1E88E5",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 120,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cell: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 120,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
});

export default ViewFeedBack;
