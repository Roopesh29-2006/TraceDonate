import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import API from "../api/api";
import { COLORS } from "../theme/theme";

const { width } = Dimensions.get("window");

export default function ImpactScreen() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const trackDonation = async () => {
    if (!token.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log("Tracking Token:", token.trim());
      const response = await API.get(`/payments/trace/${token.trim()}`);
      console.log("Trace Response Data:", JSON.stringify(response.data, null, 2));
      setData(response.data);
    } catch (err) {
      console.log("Track Error:", err.response?.data || err.message);
      // Ensure detail is a string, and handle the case where it might be an array (Pydantic 422)
      const errorDetail = err.response?.data?.detail;
      const message = Array.isArray(errorDetail)
        ? errorDetail[0]?.msg
        : (typeof errorDetail === 'string' ? errorDetail : null);

      setError(message || "Donation trace not found. Please check your token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Trace Your Impact</Text>
      <Text style={styles.headerSubtitle}>Enter your unique trace token from your receipt to see your contribution's journey.</Text>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="TRACE-XXXX-XXXX"
          value={token}
          onChangeText={setToken}
          autoCapitalize="characters"
          style={styles.input}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={trackDonation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Track</Text>
          )}
        </TouchableOpacity>
      </View>

      {data?._debug && (
        <Text style={{ fontSize: 10, color: '#999', alignSelf: 'center', marginTop: 5 }}>
          Backend API: {data._debug}
        </Text>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!data && !loading && !error && (
        <View style={styles.onboarding}>
          <Text style={styles.onboardingTitle}>How it works?</Text>
          <View style={styles.step}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepText}>Find the **Trace Token** on your donation receipt.</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepText}>Paste it above to see the real-time funding status.</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepText}>Once the campaign ends, you'll see the **Impact Story** directly here!</Text>
          </View>
        </View>
      )}

      {data && (
        <View style={styles.resultContainer}>
          {/* Donation Summary Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.txIdLabel}>Transaction ID</Text>
              <Text style={styles.txIdValue}>
                {data?.transaction?.id || data?.transaction?.transaction_id || "No ID Found"}
              </Text>
            </View>

            <View style={styles.mainInfo}>
              <View>
                <Text style={styles.amountLabel}>Amount Donated</Text>
                <Text style={styles.amountValue}>₹{data?.transaction?.amount ?? '0'}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Verified ✓</Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>📅 {data?.transaction?.date || "Date N/A"}</Text>
              <Text style={styles.detailText}>💳 {data?.transaction?.method || "Method N/A"}</Text>
            </View>
          </View>

          {/* Campaign Progress */}
          <Text style={styles.sectionTitle}>Campaign Progress</Text>
          <View style={[styles.card, { backgroundColor: '#F0FFF4' }]}>
            <Text style={styles.campaignTitle}>{data?.campaign?.title || "Campaign Details Unavailable"}</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${data?.campaign?.progress || 0}%` }]} />
              </View>
              <Text style={styles.progressText}>{data?.campaign?.progress || 0}% Funded</Text>
            </View>
            <Text style={styles.statText}>₹{data?.campaign?.collected || 0} / ₹{data?.campaign?.required || 0} raised</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{data?.campaign?.status}</Text>
            </View>
          </View>

          {/* Impact Stories */}
          <Text style={styles.sectionTitle}>Impact Stories</Text>
          {data?.impact_stories && data.impact_stories.length > 0 ? (
            data.impact_stories.map((story, index) => (
              <View key={index} style={styles.impactCard}>
                {story.media_url && (
                  <Image source={{ uri: story.media_url }} style={styles.impactImage} />
                )}
                <View style={styles.impactContent}>
                  <Text style={styles.impactTitle}>{story.title}</Text>
                  <Text style={styles.impactDesc}>{story.description}</Text>
                  <Text style={styles.impactDate}>Uploaded on {story.date}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyImpact}>
              <Text style={styles.emptyImpactText}>
                The victim hasn't posted an impact story yet. We'll notify you when they share their progress!
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#111", marginTop: 40 },
  headerSubtitle: { fontSize: 15, color: "#666", marginTop: 8, marginBottom: 30, lineHeight: 22 },

  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  input: { flex: 1, paddingHorizontal: 15, fontSize: 16, fontWeight: "600", color: "#111" },
  searchButton: { backgroundColor: "#000", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  searchButtonText: { color: "#fff", fontWeight: "700" },

  onboarding: { marginTop: 40 },
  onboardingTitle: { fontSize: 18, fontWeight: "800", marginBottom: 20 },
  step: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#000", color: "#fff", textAlign: "center", lineHeight: 24, fontWeight: "700", marginRight: 15, fontSize: 12 },
  stepText: { flex: 1, color: "#4B5563", fontSize: 14, lineHeight: 20 },

  errorCard: { backgroundColor: "#FEF2F2", padding: 15, borderRadius: 10, marginTop: 20, borderWidth: 1, borderColor: "#FEE2E2" },
  errorText: { color: "#DC2626", fontWeight: "600", textAlign: "center" },

  resultContainer: { marginTop: 30 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, elevation: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: "#F3F4F6" },
  cardHeader: { marginBottom: 15 },
  txIdLabel: { fontSize: 12, color: "#999", textTransform: "uppercase", letterSpacing: 1 },
  txIdValue: { fontSize: 14, fontWeight: "700", color: "#333", marginTop: 2 },

  mainInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  amountLabel: { fontSize: 13, color: "#666" },
  amountValue: { fontSize: 32, fontWeight: "800", color: "#16A34A" },
  badge: { backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: "#16A34A", fontWeight: "700", fontSize: 12 },

  detailsRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 15 },
  detailText: { color: "#666", fontSize: 13, fontWeight: "500" },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 15, marginTop: 10 },
  campaignTitle: { fontSize: 17, fontWeight: "700", color: "#111", marginBottom: 12 },
  progressContainer: { marginBottom: 12 },
  progressBg: { height: 10, backgroundColor: "#E5E7EB", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#16A34A" },
  progressText: { fontSize: 13, fontWeight: "700", color: "#16A34A", marginTop: 6 },
  statText: { fontSize: 14, color: "#666" },
  statusBadge: { alignSelf: "flex-start", marginTop: 15, backgroundColor: "#000", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  impactCard: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", marginBottom: 15, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 },
  impactImage: { width: "100%", height: 180 },
  impactContent: { padding: 15 },
  impactTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 6 },
  impactDesc: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
  impactDate: { fontSize: 12, color: "#9CA3AF", marginTop: 10 },

  emptyImpact: { padding: 30, backgroundColor: "#F9FAFB", borderRadius: 16, alignItems: "center", borderStyle: "dashed", borderWidth: 2, borderColor: "#E5E7EB" },
  emptyImpactText: { textAlign: "center", color: "#6B7280", lineHeight: 22 }
});