import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import API from "../api/api";
import { COLORS, SPACING, RADIUS } from "../theme/theme";

export default function CreateRequestScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authorityName, setAuthorityName] = useState("");
  const [authorityContact, setAuthorityContact] = useState("");
  const [authorityOrganization, setAuthorityOrganization] = useState("");
  const [authorityProofUrl, setAuthorityProofUrl] = useState("");

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      let { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission denied"
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    } catch (error) {
      console.log("Location error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !amount) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert("Error", "Location not detected");
      return;
    }
    if (
  !authorityName ||
  !authorityContact ||
  !authorityOrganization ||
  !authorityProofUrl
) {
  Alert.alert("Error", "All authority details are required");
  return;
}

    try {
      setLoading(true);

      await API.post("/victim/request", {
        title,
        description,
        required_amount: Number(amount),
        latitude,
        longitude,
        authority_name: authorityName,
        authority_contact: authorityContact,
        authority_organization: authorityOrganization,
        authority_proof_url: authorityProofUrl,
      });

      Alert.alert("Success", "Request submitted successfully");
      navigation.goBack();
    } catch (error) {
      console.log(error.response?.data || error);
      Alert.alert("Error", "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Fundraising Request</Text>

      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Description"
        style={[styles.input, { height: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        placeholder="Required Amount"
        keyboardType="numeric"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
      />
      <Text style={styles.label}>Authority Name</Text>
<TextInput
  style={styles.input}
  value={authorityName}
  onChangeText={setAuthorityName}
  placeholder="Doctor / Officer Name"
/>

<Text style={styles.label}>Authority Organization</Text>
<TextInput
  style={styles.input}
  value={authorityOrganization}
  onChangeText={setAuthorityOrganization}
  placeholder="Hospital / NGO Name"
/>

<Text style={styles.label}>Authority Contact</Text>
<TextInput
  style={styles.input}
  value={authorityContact}
  onChangeText={setAuthorityContact}
  placeholder="Phone / Email"
/>

<Text style={styles.label}>Authority Proof URL</Text>
<TextInput
  style={styles.input}
  value={authorityProofUrl}
  onChangeText={setAuthorityProofUrl}
  placeholder="Upload link (Drive / PDF link)"
/>

      {latitude && longitude && (
        <Text style={styles.locationText}>
          📍 Location detected
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Submit Request
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  locationText: {
    marginBottom: 10,
    color: COLORS.accent,
    fontWeight: "600",
  },
});