import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { assignMess, getAllMess } from "../../../backend/messnew"; // Assuming assignMess and getAllMess are imported from an API file
import { sendNotification, sendToAll } from "../../utils/sendNotifications";
import { getUserIdsByBatchAndGender } from "../../../backend/users";
const AssignMess = () => {
  const [mess, setMess] = useState("");
  const [batch, setBatch] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [messOptions, setMessOptions] = useState([]);

  useEffect(() => {
    const fetchMessOptions = async () => {
      setLoading(true);
      try {
        const response = await getAllMess();
        if (response.success) {
          setMessOptions(response.messList);
        } else {
          Alert.alert("Error", response.message);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch mess options.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessOptions();
  }, []);

  const handleAssign = async () => {
    if (!mess || !batch || !gender) {
      Alert.alert("Error", "Please select Mess, Batch, and Gender!");
      return;
    }

    setLoading(true);
    try {
      const response = await assignMess(mess, [batch], gender);

      if (response.success) {
        Alert.alert("Success", response.message);
        res = await getUserIdsByBatchAndGender(batch, gender);
        console.log(res.userIds);
        console.log(res.userIds.map(String));
        sendToAll("Mess Allocated", `New mess ${mess} is allocated for ${batch}`);
        setMess("");
        setBatch("");
        setGender("");
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again." + error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Assign Mess</Text>

      <Text style={styles.label}>Select Mess:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={mess}
          onValueChange={(itemValue) => setMess(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Mess" value="" />
          {messOptions.map((option) => (
            <Picker.Item
              key={option.messId}
              label={option.name}
              value={option.messId}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Batch:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={batch}
          onValueChange={(itemValue) => setBatch(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Batch" value="" />
          <Picker.Item label="R19" value="R19" />
          <Picker.Item label="R20" value="R20" />
          <Picker.Item label="R21" value="R21" />
          <Picker.Item label="R22" value="R22" />
          <Picker.Item label="R23" value="R23" />
          <Picker.Item label="R24" value="R24" />
        </Picker>
      </View>

      <Text style={styles.label}>Select Gender:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleAssign}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Assign Mess</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginVertical: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AssignMess;
