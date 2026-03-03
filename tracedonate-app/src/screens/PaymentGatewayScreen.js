import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function PaymentGatewayScreen({ route, navigation }) {
  const { requestId, amount } = route.params;
  const { token } = useContext(AuthContext);

  const [paymentMethod, setPaymentMethod] = useState("UPI"); // UPI or CARD
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);

  const [cardNumber, setCardNumber] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [traceToken, setTraceToken] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // 1. Fetch Payment Intent when User Opens Screen
  const fetchIntent = async (method) => {
    // Basic validation to prevent 422 errors due to NaN or missing ID
    const parsedAmount = parseFloat(amount);
    if (!requestId || isNaN(parsedAmount) || parsedAmount <= 0) {
      console.log("Invalid Intent Data:", { requestId, amount });
      Alert.alert("Error", "Invalid donation details.");
      return;
    }

    setLoading(true);
    setTransaction(null);
    try {
      // NOTE: We no longer pass headers manually. Axios global defaults handle it.
      const response = await API.post("/payments/intent", {
        request_id: parseInt(requestId), // Ensure integer for schema
        amount: parsedAmount,
        payment_method: method,
      });
      setTransaction(response.data);
    } catch (error) {
      console.log("Intent Error:", error.response?.data || error.message);
      const detail = error.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : "Could not initialize payment intent.";
      Alert.alert("Error", errorMsg);
      // Optional: navigation.goBack();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIntent(paymentMethod);
  }, [paymentMethod]);

  // 2. Confirm Payment after simulation
  const handlePaymentConfirm = async () => {
    if (paymentMethod === "CARD" && !cardNumber) {
      Alert.alert("Error", "Enter card number to simulate payment.");
      return;
    }

    if (!transaction) return;

    setLoading(true);
    try {
      const response = await API.post("/payments/confirm", {
        transaction_id: transaction.transaction_id
      });

      setIsSuccess(true);
      setReceiptUrl(response.data.receipt_url);
      setTraceToken(response.data.trace_token);
      Alert.alert("Success", "Payment Successful!");
    } catch (error) {
      console.log("Confirm Error:", error.response?.data || error.message);
      Alert.alert("Error", "Payment confirmation failed.");
    }
    setLoading(false);
  };

  // 3. Download Receipt PDF
  const handleDownloadReceipt = async () => {
    if (!receiptUrl) return;
    try {
      setDownloading(true);

      const fileUri = FileSystem.documentDirectory + `Receipt_${transaction.transaction_id}.pdf`;
      const downloadRes = await FileSystem.downloadAsync(
        API.defaults.baseURL + receiptUrl,
        fileUri,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (downloadRes.status !== 200) {
        throw new Error("Failed to download file");
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Alert.alert("Saved", `Receipt saved to: ${downloadRes.uri}`);
      }
    } catch (err) {
      console.error("Download receipt error:", err);
      Alert.alert("Error", "Could not download receipt.");
    }
    setDownloading(false);
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <Text style={styles.successTitle}>🎉 Payment Successful!</Text>
        <Text style={styles.infoText}>₹{amount} towards Campaign #{requestId}</Text>
        <Text style={styles.traceText}>Trace ID: {traceToken}</Text>

        <TouchableOpacity style={styles.button} onPress={handleDownloadReceipt} disabled={downloading}>
          {downloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Download PDF Receipt</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate("DonorTabs", { screen: "Campaigns" })}
        >
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Secure Payment</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, paymentMethod === "UPI" && styles.activeToggle]}
          onPress={() => setPaymentMethod("UPI")}
        >
          <Text style={paymentMethod === "UPI" ? styles.activeText : styles.inactiveText}>UPI QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, paymentMethod === "CARD" && styles.activeToggle]}
          onPress={() => setPaymentMethod("CARD")}
        >
          <Text style={paymentMethod === "CARD" ? styles.activeText : styles.inactiveText}>Credit Card</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.amount}>Amount Payable: ₹{amount}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#16A34A" style={{ marginVertical: 30 }} />
        ) : (
          <>
            {paymentMethod === "UPI" && transaction?.qr_code_base64 && (
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: transaction.qr_code_base64 }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                <Text style={styles.instruction}>Scan from any UPI App</Text>
              </View>
            )}

            {paymentMethod === "CARD" && (
              <View style={styles.cardInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Card Number"
                  keyboardType="numeric"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
                <View style={styles.row}>
                  <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="MM/YY" />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" keyboardType="numeric" secureTextEntry />
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handlePaymentConfirm}>
              <Text style={styles.buttonText}>Simulate {paymentMethod} Payment</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, padding: 20, alignItems: "center" },
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 20 },
  successTitle: { fontSize: 26, fontWeight: "bold", color: "#16A34A", marginBottom: 10 },
  infoText: { fontSize: 18, marginBottom: 10, color: "#333" },
  traceText: { fontSize: 14, color: "#555", marginBottom: 30, fontStyle: "italic" },
  amount: { fontSize: 20, fontWeight: "600", marginBottom: 20, color: "#333" },

  toggleContainer: { flexDirection: "row", marginBottom: 20, width: "100%", borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#ddd" },
  toggleBtn: { flex: 1, padding: 12, alignItems: "center", backgroundColor: "#f9f9f9" },
  activeToggle: { backgroundColor: "#16A34A" },
  activeText: { color: "#fff", fontWeight: "bold" },
  inactiveText: { color: "#555" },

  card: { width: "100%", backgroundColor: "#fff", padding: 20, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, alignItems: "center" },

  qrContainer: { alignItems: "center", marginBottom: 20 },
  qrImage: { width: 200, height: 200, marginBottom: 10 },
  instruction: { fontSize: 14, color: "#666" },

  cardInputContainer: { width: "100%", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8, width: "100%" },

  button: { backgroundColor: "#16A34A", padding: 15, borderRadius: 8, alignItems: "center", width: "100%", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  secondaryButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#16A34A", marginTop: 15 },
  secondaryButtonText: { color: "#16A34A", fontWeight: "bold", fontSize: 16 },
});