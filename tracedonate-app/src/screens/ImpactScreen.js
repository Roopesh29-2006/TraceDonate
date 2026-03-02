import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/theme";

export default function ImpactScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Impact</Text>
      <Text style={styles.stat}>₹45,000 Donated</Text>
      <Text style={styles.stat}>12 Families Supported</Text>
      <Text style={styles.stat}>3 Campaigns Completed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  stat: {
    fontSize: 18,
    marginBottom: 12,
  },
});