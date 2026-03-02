import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import API from "../api/api";
import { COLORS, SPACING, RADIUS, SHADOW } from "../theme/theme";

export default function RequestListScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // 1️⃣ Ask location permission
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Required", "Location permission denied");
        setLoading(false);
        return;
      }

      // 2️⃣ Get donor current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 3️⃣ Call backend with donor location
      const response = await API.get(
        `/donation/available-requests?donor_lat=${latitude}&donor_lon=${longitude}`
      );

      // Backend already sorts by nearest distance
      setRequests(response.data.requests || []);
    } catch (error) {
      console.log("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityMeta = (score) => {
    if (score >= 60) {
      return { label: "🔥 Critical", color: "#DC2626" };
    }
    if (score >= 40) {
      return { label: "⚠ High", color: "#F59E0B" };
    }
    return { label: "Normal", color: "#16A34A" };
  };

  const renderItem = ({ item }) => {
    const percentage =
      item.required_amount > 0
        ? (item.collected_amount / item.required_amount) * 100
        : 0;

    const priorityMeta = getPriorityMeta(item.priority_score);

    return (
      <View style={styles.card}>
        {/* Image */}
        <Image
          source={{
            uri:
              item.image_url ||
              "https://images.unsplash.com/photo-1584515933487-779824d29309",
          }}
          style={styles.image}
        />

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.badgeText}>
              {item.category || "General"}
            </Text>
          </View>

          <View style={styles.verifiedBadge}>
            <Text style={styles.badgeText}>Verified ✔</Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priorityMeta.color + "20" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: priorityMeta.color },
              ]}
            >
              {priorityMeta.label} ({item.priority_score})
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Distance */}
        {item.distance_km !== undefined && (
          <Text style={styles.distance}>
            📍 {item.distance_km} km away
          </Text>
        )}

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Amount */}
        <Text style={styles.amount}>
          ₹{item.collected_amount} raised of ₹{item.required_amount}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%` },
            ]}
          />
        </View>

        <Text style={styles.percentText}>
          {percentage.toFixed(1)}% Funded
        </Text>

        {/* Donate Button */}
        <TouchableOpacity
          style={styles.donateButton}
          onPress={() =>
            navigation.navigate("Donate", { requestId: item.id })
          }
        >
          <Text style={styles.donateButtonText}>Donate Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: SPACING.md }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    ...SHADOW,
  },

  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },

  categoryBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },

  verifiedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },

  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },

  distance: {
    fontSize: 12,
    color: COLORS.textLight,
    marginHorizontal: SPACING.sm,
    marginTop: 4,
  },

  description: {
    color: COLORS.textLight,
    marginTop: 4,
    marginHorizontal: SPACING.sm,
  },

  amount: {
    marginTop: SPACING.sm,
    fontWeight: "600",
    marginHorizontal: SPACING.sm,
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    marginHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
    overflow: "hidden",
  },

  progressFill: {
    height: 10,
    backgroundColor: COLORS.primary,
  },

  percentText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    marginHorizontal: SPACING.sm,
  },

  donateButton: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.sm,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },

  donateButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});