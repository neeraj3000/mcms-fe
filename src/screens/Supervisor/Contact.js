import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Linking,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSession } from "@/src/SessionContext";
import {
  getSupervisorByUserId,
  getStudentsByMessId,
} from "../../../backend/supervisornew";

export default function ContactMessCoordinator() {
  const [messRepresentatives, setMessRepresentatives] = useState([]);
  const [mess, setMess] = useState(null);

  const { user } = useSession();

  const fetchMessAndRepresentatives = async () => {
    try {
      // Get mess details
      const supervisorResponse = await getSupervisorByUserId(user.id);
      const messId = supervisorResponse.supervisorData?.messId;
      if (!messId) {
        throw new Error("Mess ID not found for the user.");
      }
      setMess(messId);

      // Get representatives based on messId
      const studentsResponse = await getStudentsByMessId(messId);
      setMessRepresentatives(studentsResponse.students || []);
    } catch (error) {
      console.error(
        "Error fetching mess details or representatives:",
        error.message
      );
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMessAndRepresentatives();
    }
  }, [user]);

  const makeCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const sendEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Contact Mess Coordinator</Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => makeCall("1234567890")}
          style={styles.iconWrapper}
        >
          <Ionicons name="call" size={40} color="#007BFF" />
          <Text style={styles.iconText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => sendEmail("messcoordinator@example.com")}
          style={styles.iconWrapper}
        >
          <Ionicons name="mail" size={40} color="#007BFF" />
          <Text style={styles.iconText}>Mail</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Contact Mess Representatives</Text>
      {messRepresentatives.length > 0 ? (
        messRepresentatives.map((rep, index) => (
          <View key={index} style={styles.repContainer}>
            <Text style={styles.repName}>{rep.name}</Text>

            <View style={styles.contactIcons}>
              <TouchableOpacity
                onPress={() => makeCall(rep.phone)}
                style={styles.contactIconWrapper}
              >
                <Ionicons name="call" size={30} color="#28a745" />
                <Text style={styles.iconText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => sendEmail(rep.email)}
                style={styles.contactIconWrapper}
              >
                <Ionicons name="mail" size={30} color="#28a745" />
                <Text style={styles.iconText}>Mail</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No representatives found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  subHeader: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 30,
    marginBottom: 10,
    color: "#333",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  iconWrapper: {
    alignItems: "center",
  },
  iconText: {
    marginTop: 5,
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "500",
  },
  repContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  repName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  contactIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactIconWrapper: {
    alignItems: "center",
    padding: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});
