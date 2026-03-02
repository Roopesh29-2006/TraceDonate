import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import API from "../api/api";

export default function TrackDonationScreen() {
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);

  const trackDonation = async () => {
    try {
      await API.post(
  `/donation/donate?request_id=${requestId}&amount=${parseFloat(amount)}`
);
      setData(response.data);
    } catch (error) {
      alert("Donation not found");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter Trace Token"
        value={token}
        onChangeText={setToken}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <Button title="Track" onPress={trackDonation} />

      {data && (
        <View style={{ marginTop: 20 }}>
          <Text>Amount: ₹{data.amount}</Text>
          <Text>Status: {data.status}</Text>
          <Text>Request ID: {data.request_id}</Text>
        </View>
      )}
    </View>
  );
}