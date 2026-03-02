import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";

export default function ProgressHeader({
  progress,
  currentCount,
  totalCount,
  onClose,
}: {
  progress: number;
  currentCount: number;
  totalCount: number;
  onClose: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={20} style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={18} color="#9ca3af" />
      </Pressable>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]}></View>
        </View>
        <ThemedText style={styles.progressText}>
          {currentCount}/{totalCount}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  closeButton: {
    marginRight: 16,
    padding: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: "#e5e7eb",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.primaryAccentColor,
  },
  progressText: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 45,
  },
});
