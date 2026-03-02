import { Colors } from "@/constants/theme";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

export default function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
  destructive = false,
}: {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {title}
          </ThemedText>
          {description ? (
            <ThemedText style={styles.description}>{description}</ThemedText>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancel]}
              onPress={onCancel}
            >
              <ThemedText type="defaultSemiBold">{cancelLabel}</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                destructive ? styles.destructive : styles.confirm,
              ]}
              onPress={onConfirm}
            >
              <ThemedText
                style={
                  description ? styles.destructiveText : styles.confirmText
                }
                type="defaultSemiBold"
              >
                {confirmLabel}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
  },
  description: {
    marginTop: 8,
    opacity: 0.8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  cancel: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  confirm: {
    backgroundColor: Colors.primaryAccentColor,
  },
  confirmText: {
    color: "white",
  },
  destructive: {
    backgroundColor: "#ef4444",
  },
  destructiveText: {
    color: "white",
  },
});
