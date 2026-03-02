import React, { useEffect, useState } from "react";
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
} from "react-native";
import { BlurView } from "expo-blur";
import API from "../api/api";

export default function DonorDashboard({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchRequests();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await API.get("/donation/available-requests");
      setRequests(response.data.requests || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Medical", "Education", "Emergency"];

  const filteredRequests =
    activeCategory === "All"
      ? requests
      : requests.filter(r => r.category === activeCategory);

  const AnimatedButton = ({ children, onPress }) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.blackButton}
        >
          <Text style={styles.blackButtonText}>{children}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HERO WITH GLASS BLUR */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
        }}
        style={styles.hero}
      >
        <BlurView intensity={60} style={styles.heroOverlay}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.heroTitle}>
              Trace Every Penny.
            </Text>
            <Text style={styles.heroTitle}>
              Empower Every Life.
            </Text>

            <Text style={styles.heroSubtitle}>
              Transparent giving. Real impact.
            </Text>

            <AnimatedButton
              onPress={() => navigation.navigate("Campaigns")}
            >
              Explore Campaigns
            </AnimatedButton>
          </Animated.View>
        </BlurView>
      </ImageBackground>

      {/* CATEGORY TABS */}
      <View style={styles.tabs}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.tab,
              activeCategory === cat && styles.activeTab,
            ]}
          >
            <Text
              style={
                activeCategory === cat
                  ? styles.activeTabText
                  : styles.tabText
              }
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* URGENT CAUSES */}
      <Text style={styles.sectionTitle}>Urgent Causes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        filteredRequests.map(item => {
          const percentage =
            (item.collected_amount / item.required_amount) * 100;

          const isCritical = item.priority_score > 60;

          return (
            <Animated.View
              key={item.id}
              style={[
                styles.card,
                isCritical && styles.criticalCard,
              ]}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>

              <Text style={styles.cardDescription}>
                {item.description}
              </Text>

              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${percentage}%` },
                  ]}
                />
              </View>

              <Text style={styles.amount}>
                ₹{item.collected_amount} raised of ₹
                {item.required_amount}
              </Text>

              {isCritical && (
                <Text style={styles.urgentText}>
                  ⚠ Critical Emergency
                </Text>
              )}

              <AnimatedButton
                onPress={() =>
                  navigation.navigate("Donate", {
                    requestId: item.id,
                  })
                }
              >
                Support Cause
              </AnimatedButton>
            </Animated.View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  hero: {
    height: 320,
    justifyContent: "center",
  },

  heroOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },

  heroSubtitle: {
    color: "#eee",
    marginVertical: 12,
    textAlign: "center",
  },

  blackButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },

  blackButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#E5E5E5",
  },

  activeTab: {
    backgroundColor: "#000",
  },

  tabText: {
    color: "#333",
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginLeft: 20,
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 15,
    elevation: 6,
  },

  criticalCard: {
    borderWidth: 1,
    borderColor: "#FF3B30",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  cardDescription: {
    marginVertical: 8,
    color: "#555",
  },

  progressBg: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
  },

  progressFill: {
    height: 6,
    backgroundColor: "#000",
  },

  amount: {
    marginTop: 6,
    fontWeight: "600",
  },

  urgentText: {
    marginTop: 6,
    color: "#FF3B30",
    fontWeight: "700",
  },
});