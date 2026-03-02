import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function VictimDashboard({ navigation }) {
  const { logout } = useContext(AuthContext);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRequests();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await API.get("/victim/my-requests");
      setRequests(response.data || []);
    } catch (error) {
      console.log("Victim fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel" },
        { text: "Logout", onPress: logout },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const percentage =
      item.required_amount > 0
        ? (item.collected_amount / item.required_amount) * 100
        : 0;

    return (
      <Animated.View
        style={[styles.card, { opacity: fadeAnim }]}
      >
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.description}>
          {item.description}
        </Text>

        {/* Progress */}
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%` },
            ]}
          />
        </View>

        <Text style={styles.amount}>
          ₹{item.collected_amount} raised of ₹
          {item.required_amount}
        </Text>

        {/* Status Badge */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              item.status === "APPROVED"
                ? styles.approved
                : item.status === "REJECTED"
                ? styles.rejected
                : styles.pending,
            ]}
          >
            <Text style={styles.statusText}>
              {item.status}
            </Text>
          </View>

          {item.is_verified_by_admin && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.statusText}>
                Verified ✔
              </Text>
            </View>
          )}
        </View>

        {/* Completion */}
        {item.status === "COMPLETED" && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>
              Campaign Completed 🎉
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <BlurView intensity={80} style={styles.header}>
        <Text style={styles.headerTitle}>
          My Campaign Dashboard
        </Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() =>
            navigation.navigate("CreateRequest")
          }
        >
          <Text style={styles.createText}>
            + Create New Request
          </Text>
        </TouchableOpacity>
      </BlurView>

      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  header: {
    padding: 20,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: width > 768 ? 26 : 20,
    fontWeight: "800",
    marginBottom: 10,
  },

  createButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  createText: {
    color: "#fff",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: width > 768 ? 100 : 20,
    marginVertical: 10,
    padding: 18,
    borderRadius: 15,
    elevation: 6,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  description: {
    marginVertical: 8,
    color: "#555",
  },

  progressBg: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
  },

  progressFill: {
    height: 6,
    backgroundColor: "#000",
  },

  amount: {
    marginTop: 6,
    fontWeight: "600",
  },

  statusRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
  },

  approved: {
    backgroundColor: "#000",
  },

  rejected: {
    backgroundColor: "#FF3B30",
  },

  pending: {
    backgroundColor: "#E5E5E5",
  },

  verifiedBadge: {
    backgroundColor: "#16A34A",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  statusText: {
    color: "#fff",
    fontWeight: "600",
  },

  completedBadge: {
    marginTop: 10,
    backgroundColor: "#000",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  completedText: {
    color: "#fff",
    fontWeight: "700",
  },

  logoutButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});