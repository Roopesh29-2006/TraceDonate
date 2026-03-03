import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api/api";

const { width } = Dimensions.get("window");

const STATS = [
  { id: 1, label: "Lives Saved", value: "12.4k+", icon: "heart-sharp", color: "#FF4D4D" },
  { id: 2, label: "Verified", value: "100%", icon: "checkmark-seal", color: "#4CAF50" },
  { id: 3, label: "Active", value: "84", icon: "megaphone", color: "#2196F3" },
];

const CATEGORIES = [
  { name: "All", icon: "apps-outline" },
  { name: "Medical", icon: "medkit-outline" },
  { name: "Education", icon: "book-outline" },
  { name: "Emergency", icon: "alert-circle-outline" },
];

export default function DonorDashboard({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(zoomAnim, {
        toValue: 1.1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await API.get("/donation/available-requests");
      setRequests(response.data.requests || []);
    } catch (err) {
      console.log("DonorDashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests =
    activeCategory === "All"
      ? requests
      : requests.filter(r => r.category === activeCategory);

  const StatItem = ({ item }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: item.color + "15" }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );

  const CampaignCard = ({ item }) => {
    const percentage = Math.min((item.collected_amount / item.required_amount) * 100, 100);
    const isCritical = item.priority_score > 60;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("Donate", { requestId: item.id })}
        style={[styles.card, isCritical && styles.criticalCard]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Ionicons
              name={CATEGORIES.find(c => c.name === item.category)?.icon || "help-circle-outline"}
              size={14}
              color="#666"
            />
            <Text style={styles.categoryText}>{item.category || "General"}</Text>
          </View>
          {isCritical && (
            <View style={styles.urgentBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.urgentBadgeText}>URGENT</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Funding Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(percentage)}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountText}>
              <Text style={styles.amountBold}>₹{item.collected_amount.toLocaleString()}</Text> raised
            </Text>
            <Text style={styles.targetText}>Goal: ₹{item.required_amount.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.distanceText}>
            <Ionicons name="location-outline" size={14} color="#999" /> {item.distance_km || "Nearby"}
          </Text>
          <View style={styles.supportBtn}>
            <Text style={styles.supportBtnText}>Donate Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* PREMIUM HERO */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" }}
            style={[styles.heroImage, { transform: [{ scale: zoomAnim }] }]}
          />
          <BlurView intensity={20} style={styles.heroOverlay}>
            <Animated.View style={[styles.heroContent, { opacity: fadeAnim }]}>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                <Text style={styles.trustText}>100% TRANSPARENT DONATIONS</Text>
              </View>
              <Text style={styles.heroTitle}>Trace Every Penny.</Text>
              <Text style={[styles.heroTitle, { marginTop: -5 }]}>Empower Lives.</Text>
              <Text style={styles.heroSubtitle}>
                The world's first AI-powered donation platform with end-to-end tracing.
              </Text>

              <View style={styles.heroButtons}>
                <TouchableOpacity
                  style={styles.mainBtn}
                  onPress={() => navigation.navigate("Campaigns")}
                >
                  <Text style={styles.mainBtnText}>Start Giving</Text>
                  <Ionicons name="heart" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.glassBtn}>
                  <Text style={styles.glassBtnText}>How it Works</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </BlurView>
        </View>

        {/* IMPACT STATISTICS */}
        <View style={styles.statsContainer}>
          {STATS.map(stat => <StatItem key={stat.id} item={stat} />)}
        </View>

        {/* CATEGORY SELECTOR */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Help Someone Today</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Campaigns")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.name}
              onPress={() => setActiveCategory(cat.name)}
              style={[
                styles.categoryPill,
                activeCategory === cat.name && styles.activeCategoryPill,
              ]}
            >
              <Ionicons
                name={cat.icon}
                size={18}
                color={activeCategory === cat.name ? "#fff" : "#666"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.categoryLabel,
                  activeCategory === cat.name && styles.activeCategoryLabel,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* URGENT CAMPAIGNS */}
        <View style={styles.campaignList}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loaderText}>Finding active campaigns...</Text>
            </View>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map(item => <CampaignCard key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={50} color="#ddd" />
              <Text style={styles.emptyText}>No campaigns found in this category.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // HERO STYLES
  heroContainer: { height: 450, overflow: "hidden" },
  heroImage: { width: "100%", height: "100%", position: "absolute" },
  heroOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 25 },
  heroContent: { marginTop: 40 },
  trustBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  trustText: { color: "#fff", fontSize: 10, fontWeight: "800", marginLeft: 6, letterSpacing: 1 },
  heroTitle: { fontSize: 36, fontWeight: "900", color: "#fff", lineHeight: 42 },
  heroSubtitle: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 15, lineHeight: 24, paddingRight: 40 },
  heroButtons: { flexDirection: "row", marginTop: 30 },
  mainBtn: { backgroundColor: "#FF4D4D", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, flexDirection: "row", alignItems: "center" },
  mainBtnText: { color: "#fff", fontWeight: "800", fontSize: 16, marginRight: 8 },
  glassBtn: { borderContent: "rgba(255,255,255,0.5)", borderWidth: 1, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, marginLeft: 15 },
  glassBtnText: { color: "#fff", fontWeight: "700" },

  // STATS STYLES
  statsContainer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: -40 },
  statCard: { backgroundColor: "#fff", width: (width - 60) / 3, borderRadius: 16, padding: 15, elevation: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, alignItems: "center" },
  statIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: "800", color: "#111" },
  statLabel: { fontSize: 11, color: "#999", marginTop: 2 },

  // CATEGORY STYLES
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 40, marginBottom: 15 },
  sectionTitle: { fontSize: 22, fontWeight: "900", color: "#111" },
  seeAll: { color: "#FF4D4D", fontWeight: "700", fontSize: 14 },
  categoriesScroll: { marginBottom: 20 },
  categoryPill: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 30, backgroundColor: "#F5F5F7", marginRight: 10, borderWidth: 1, borderColor: "#E5E5E7" },
  activeCategoryPill: { backgroundColor: "#111", borderColor: "#111" },
  categoryLabel: { color: "#666", fontWeight: "700", fontSize: 14 },
  activeCategoryLabel: { color: "#fff" },

  // CAMPAIGN CARD STYLES
  campaignList: { paddingHorizontal: 20 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 20, elevation: 5, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 15, borderWidth: 1, borderColor: "#F0F0F2" },
  criticalCard: { borderColor: "rgba(255, 77, 77, 0.3)", backgroundColor: "#FFFBFB" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  categoryBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F1F3", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  categoryText: { fontSize: 12, color: "#666", fontWeight: "700", marginLeft: 4 },
  urgentBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEB", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF4D4D", marginRight: 6 },
  urgentBadgeText: { color: "#FF4D4D", fontSize: 10, fontWeight: "800" },
  cardTitle: { fontSize: 19, fontWeight: "800", color: "#111", marginBottom: 8 },
  cardDescription: { fontSize: 14, color: "#666", lineHeight: 20, marginBottom: 20 },
  progressSection: { marginBottom: 20 },
  progressInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 12, color: "#999", fontWeight: "600" },
  progressPercent: { fontSize: 14, fontWeight: "800", color: "#111" },
  progressBg: { height: 8, backgroundColor: "#E9E9EB", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  amountRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  amountText: { fontSize: 13, color: "#666" },
  amountBold: { fontWeight: "800", color: "#111" },
  targetText: { fontSize: 13, color: "#666", fontWeight: "600" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F5F5F7", paddingTop: 15 },
  distanceText: { color: "#999", fontSize: 13, fontWeight: "500" },
  supportBtn: { backgroundColor: "#111", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, flexDirection: "row", alignItems: "center" },
  supportBtnText: { color: "#fff", fontWeight: "800", fontSize: 14, marginRight: 6 },

  // LOADER & EMPTY
  loaderContainer: { padding: 50, alignItems: "center" },
  loaderText: { marginTop: 15, color: "#999", fontWeight: "600" },
  emptyContainer: { padding: 60, alignItems: "center" },
  emptyText: { color: "#CCC", fontWeight: "700", marginTop: 15, textAlign: "center" },
});
