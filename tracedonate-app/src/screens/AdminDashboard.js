import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await API.get("/admin/all-requests");
      setRequests(response.data.requests || []);
    } catch (error) {
      console.log("Admin fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (id, approve) => {
    try {
      await API.put(`/admin/verify-request/${id}?approve=${approve}`);
      Alert.alert(
        approve ? "Approved" : "Rejected",
        approve
          ? "Request Approved Successfully"
          : "Request Rejected"
      );
      fetchRequests();
    } catch (error) {
      Alert.alert("Error", "Action failed");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: logout, style: "destructive" }
      ]
    );
  };

  const filteredRequests = requests.filter(
    r => filter === "ALL" || r.status === filter
  );

  const AnimatedButton = ({ label, onPress, type }) => {
    const scale = new Animated.Value(1);

    const pressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const pressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={[
            styles.actionButton,
            type === "reject" && styles.rejectButton,
          ]}
        >
          <Text style={styles.actionText}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = ({ item }) => {
    const isCritical = item.priority_score > 60;

    return (
      <View
        style={[
          styles.card,
          isCritical && styles.criticalCard,
        ]}
      >
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.description}>
          {item.description}
        </Text>

        <Text style={styles.section}>
          📍 {item.location_name || "Location not provided"}
        </Text>

        <Text style={styles.section}>🏥 Authority</Text>
        <Text>Name: {item.authority_name}</Text>
        <Text>Org: {item.authority_organization}</Text>
        <Text>Contact: {item.authority_contact}</Text>

        {item.authority_proof_url && (
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(item.authority_proof_url)
            }
          >
            <Text style={styles.link}>
              View Proof Document
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.status}>
          Status: {item.status}
        </Text>

        {item.status === "PENDING" && (
          <View style={styles.buttonRow}>
            <AnimatedButton
              label="Approve"
              onPress={() =>
                handleVerification(item.id, true)
              }
            />
            <AnimatedButton
              label="Reject"
              type="reject"
              onPress={() =>
                handleVerification(item.id, false)
              }
            />
          </View>
        )}

        {item.status === "APPROVED" && (
          <View style={styles.badgeApproved}>
            <Text style={styles.badgeText}>
              Approved ✔
            </Text>
          </View>
        )}

        {item.status === "REJECTED" && (
          <View style={styles.badgeRejected}>
            <Text style={styles.badgeText}>
              Rejected ✖
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>
          Admin Control Center
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* FILTER TABS */}
      <View style={styles.tabs}>
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={[
              styles.tab,
              filter === tab && styles.activeTab,
            ]}
          >
            <Text
              style={
                filter === tab
                  ? styles.activeTabText
                  : styles.tabText
              }
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    padding: 20,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#E5E5E5",
  },

  activeTab: {
    backgroundColor: "#000",
  },

  tabText: {
    color: "#333",
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 18,
    borderRadius: 15,
    elevation: 6,
  },

  criticalCard: {
    borderWidth: 1,
    borderColor: "#FF3B30",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  description: {
    marginVertical: 8,
    color: "#555",
  },

  section: {
    marginTop: 6,
    fontWeight: "600",
  },

  link: {
    color: "#000",
    marginTop: 5,
    fontWeight: "600",
  },

  status: {
    marginTop: 8,
    fontWeight: "700",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },

  rejectButton: {
    backgroundColor: "#FF3B30",
  },

  actionText: {
    color: "#fff",
    fontWeight: "700",
  },

  badgeApproved: {
    marginTop: 12,
    backgroundColor: "#000",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  badgeRejected: {
    marginTop: 12,
    backgroundColor: "#FF3B30",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoutBtn: {
    padding: 10,
  },
});