import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";

function GlobalFAB() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate("Notifications")}
    >
      <Text style={styles.fabText}>🔔</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: {
    color: "#fff",
    fontSize: 24,
  },
});

export default GlobalFAB;
