import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOW } from "../theme/theme";

export default function AppCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 20,
    ...SHADOW,
  },
});