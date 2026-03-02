import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  Text,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import API from "../api/api";
import { COLORS } from "../theme/theme";

export default function MapScreen({ navigation }) {
  const [donorLocation, setDonorLocation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      // 1️⃣ Get donor location
      let { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setDonorLocation({
        latitude,
        longitude,
      });

      // 2️⃣ Fetch approved requests
      const response = await API.get(
        `/donation/available-requests?donor_lat=${latitude}&donor_lon=${longitude}`
      );

      setRequests(response.data.requests || []);
    } catch (error) {
      console.log("Map load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (score) => {
    if (score >= 60) return "#DC2626"; // red
    if (score >= 40) return "#F59E0B"; // orange
    return "#16A34A"; // green
  };

  if (loading || !donorLocation) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: donorLocation.latitude,
        longitude: donorLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
      showsUserLocation
    >
      {requests.map((item) =>
        item.latitude && item.longitude ? (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            pinColor={getMarkerColor(item.priority_score)}
          >
            <Callout
              onPress={() =>
                navigation.navigate("Donate", {
                  requestId: item.id,
                })
              }
            >
              <View style={{ width: 200 }}>
                <Text style={{ fontWeight: "bold" }}>
                  {item.title}
                </Text>
                <Text>
                  ₹{item.collected_amount} / ₹
                  {item.required_amount}
                </Text>
                <Text>
                  📍 {item.distance_km} km away
                </Text>
              </View>
            </Callout>
          </Marker>
        ) : null
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});