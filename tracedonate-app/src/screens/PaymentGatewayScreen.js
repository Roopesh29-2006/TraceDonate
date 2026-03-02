import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import API from "../api/api";

export default function PaymentGatewayScreen({ route, navigation }) {
  const { donationId, amount } = route.params;

  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!cardNumber) {
      Alert.alert("Error", "Enter card number");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      try {
        await API.post("/donation/confirm-payment", {
          donation_id: donationId,
        });

        setLoading(false);
        Alert.alert("Success", "Payment Successful!");

        // ✅ Correct navigation to Campaigns tab
        navigation.navigate("DonorTabs", {
          screen: "Campaigns",
        });

      } catch (error) {
        setLoading(false);
        Alert.alert("Error", "Payment Failed");
      }
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Payment</Text>
      <Text style={styles.amount}>Amount: ₹{amount}</Text>

      <TextInput
        style={styles.input}
        placeholder="Card Number"
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={setCardNumber}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#16A34A" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handlePayment}>
          <Text style={styles.buttonText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  amount: { fontSize: 18, marginBottom: 20 },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});