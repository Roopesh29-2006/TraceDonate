import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import API from "../api/api";

export default function DonateScreen({ route, navigation }) {
  const { requestId } = route.params;
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Enter valid amount");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create Order (PENDING donation)
      const response = await API.post("/donation/create-order", {
        request_id: requestId,
        amount: Number(amount),
      });

      const donationId = response.data.donation_id;

      if (!donationId) {
        Alert.alert("Error", "Order creation failed");
        setLoading(false);
        return;
      }

      // 2️⃣ Navigate to Payment Gateway Screen
      navigation.navigate("PaymentGateway", {
        donationId: donationId,
        amount: amount,
      });

      setLoading(false);

    } catch (error) {
      console.log("Create order error:", error.response?.data || error.message);

      Alert.alert(
        "Donation Failed",
        error.response?.data?.detail || "Something went wrong"
      );

      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Make a Donation</Text>

      <Text style={styles.label}>Enter Amount</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleDonate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Processing..." : "Proceed to Payment"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});