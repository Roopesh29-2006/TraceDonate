import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import API from "../api/api";
import { COLORS } from "../theme/theme";

export default function SubmitCompletionScreen({ route, navigation }) {
  const { id } = route.params;

  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !story || !proofUrl) {
      Alert.alert("Error", "Please fill in all fields to share your impact.");
      return;
    }

    setLoading(true);
    try {
      await API.put(`/victim/submit-completion/${id}`, {
        title: title,
        story: story,
        proof_url: proofUrl,
      });

      Alert.alert(
        "Impact Shared! 🎉",
        "Your story has been submitted and will be visible to your donors via their Trace Token.",
        [{ text: "Great!", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.log("Submit Error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to submit story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Share the Impact</Text>
        <Text style={styles.subheader}>
          Your donors would love to see how their contribution helped. Share a title, your story, and a link to proof (images/videos).
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Story Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Surgery Successful! or Back to School"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>The Full Story</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell your donors about the outcome..."
            multiline
            numberOfLines={6}
            value={story}
            onChangeText={setStory}
            placeholderTextColor="#999"
            textAlignVertical="top"
          />

          <Text style={styles.label}>Proof / Media Link</Text>
          <TextInput
            style={styles.input}
            placeholder="Link to photos, medical bills, etc."
            value={proofUrl}
            onChangeText={setProofUrl}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Publish Impact Story</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 25 },
  header: { fontSize: 28, fontWeight: "800", color: "#111", marginTop: 20 },
  subheader: { fontSize: 16, color: "#666", marginTop: 10, marginBottom: 30, lineHeight: 24 },

  form: { marginTop: 10 },
  label: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#111",
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#111",
    marginBottom: 20,
    minHeight: 150,
  },
  button: {
    backgroundColor: "#16A34A",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#16A34A",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  disabledButton: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  secondaryButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: { color: "#6B7280", fontWeight: "600" },
});