import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import API from "../api/api";

export default function SubmitCompletionScreen({ route, navigation }) {
  const { id } = route.params;

  const [story, setStory] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const handleSubmit = async () => {
    if (!story || !proofUrl) {
      Alert.alert("Error", "All fields required");
      return;
    }

    try {
      await API.put(`/victim/submit-completion/${id}`, {
        story: story,
        proof_url: proofUrl,
      });

      Alert.alert("Success", "Completion story submitted!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Submission failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Completion Story</Text>

      <TextInput
        style={styles.textArea}
        placeholder="Tell donors what happened..."
        multiline
        value={story}
        onChangeText={setStory}
      />

      <TextInput
        style={styles.input}
        placeholder="Proof URL (Drive / Image link)"
        value={proofUrl}
        onChangeText={setProofUrl}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Story</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  textArea: {
    borderWidth: 1,
    padding: 10,
    height: 120,
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});