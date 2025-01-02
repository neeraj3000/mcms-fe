import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { Button, Card, TextInput as PaperTextInput } from "react-native-paper";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import {
  getUserByCollegeId,
  updateStudentProfileByCollegeId,
  deleteUserByCollegeId,
} from "../../../backend/studentnew"; // Adjust the path as needed

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#1976D2", // Blue color
    background: "#FFFFFF", // White background for light theme
    surface: "#F5F5F5", // Light grey surface
    text: "#000000", // Black text color
    placeholder: "#888888", // Placeholder color
    disabled: "#BDBDBD", // Disabled button/text color
  },
};

const ViewStudents = () => {
  const [collegeId, setCollegeId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getUserByCollegeId(collegeId);
      if (response.success) {
        setStudents([response.user]);
      } else {
        Alert.alert("Error", "No students found for this College ID.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditData(student); // Set selected student for editing
    setIsEditing(true); // Show the edit form
  };

  const saveEdit = async () => {
    try {
      const { name, mobileNo, gender, batch, messId } = editData;
      const response = await updateStudentProfileByCollegeId(collegeId, {
        name,
        mobileNo,
        gender,
        batch,
        messId,
      });
      if (response.success) {
        Alert.alert("Success", response.message);
        fetchStudents(); // Refresh the list
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteUserByCollegeId(collegeId);
      if (response.success) {
        Alert.alert("Success", response.message);
        setStudents([]);
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <PaperProvider theme={customTheme}>
      <View style={styles.container}>
        <Text style={styles.title}>Student Management</Text>
        <PaperTextInput
          mode="outlined"
          label="Enter College ID"
          value={collegeId}
          onChangeText={setCollegeId}
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={fetchStudents}
          loading={loading}
          disabled={loading}
        >
          View Students
        </Button>
        <FlatList
          data={students}
          keyExtractor={(item, index) => `${item.collegeId}-${index}`}
          renderItem={({ item }) => (
            <Card style={styles.studentCard}>
              <Card.Title title={item.name} subtitle={`Batch: ${item.batch}`} />
              <Card.Content>
                <Text>Mobile No: {item.mobileNo}</Text>
                <Text>Gender: {item.gender}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleEdit(item)}>Edit</Button>
                <Button onPress={handleDelete} color="red">
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
        {isEditing && (
          <View style={styles.editForm}>
            <Text style={styles.subtitle}>Edit Student Details</Text>
            <PaperTextInput
              mode="outlined"
              label="Name"
              value={editData.name}
              onChangeText={(text) =>
                setEditData((prev) => ({ ...prev, name: text }))
              }
              style={styles.input}
            />
            <PaperTextInput
              mode="outlined"
              label="Mobile No"
              value={editData.mobileNo}
              onChangeText={(text) =>
                setEditData((prev) => ({ ...prev, mobileNo: text }))
              }
              style={styles.input}
            />
            <PaperTextInput
              mode="outlined"
              label="Gender"
              value={editData.gender}
              onChangeText={(text) =>
                setEditData((prev) => ({ ...prev, gender: text }))
              }
              style={styles.input}
            />
            <PaperTextInput
              mode="outlined"
              label="Batch"
              value={editData.batch}
              onChangeText={(text) =>
                setEditData((prev) => ({ ...prev, batch: text }))
              }
              style={styles.input}
            />
            <PaperTextInput
              mode="outlined"
              label="Mess ID"
              value={editData.messId}
              onChangeText={(text) =>
                setEditData((prev) => ({ ...prev, messId: text }))
              }
              style={styles.input}
            />
            <Button mode="contained" onPress={saveEdit}>
              Save Changes
            </Button>
            <Button
              mode="text"
              onPress={() => setIsEditing(false)}
              color="gray"
            >
              Cancel
            </Button>
          </View>
        )}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#1976D2", // Blue title color
  },
  input: {
    marginVertical: 8,
  },
  studentCard: {
    marginVertical: 8,
  },
  editForm: {
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});

export default ViewStudents;
