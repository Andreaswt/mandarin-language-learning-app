import { Paywall } from "@/components/subscription/Paywall";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { useSpeakingListningStats } from "@/hooks/useSpeakingListeningStats";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function ProfileContent() {
  const { isPremium, premiumExpiresAt, profile, user } = useAuth();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const { stats, loading } = useSpeakingListningStats();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        await supabase.auth.signOut({ scope: "local" });
        toast.success("Signed out successfully");
        return;
      } else {
        toast.success("Signed out successfully");
      }
    } catch (error) {
      try {
        await supabase.auth.signOut({ scope: "local" });
        toast.success("Signed out successfully");
      } catch {
        toast.error("Failed to sign out. Please restart the app.");
      }
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: Colors.borderColor }]}
        >
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Info Card */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: Colors.light.background,
                borderColor: Colors.borderColor,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: Colors.primaryAccentColor },
              ]}
            >
              <ThemedText style={styles.avatarText}>
                {profile.full_name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={styles.userName}>{profile.full_name}</ThemedText>
            <ThemedText
              style={[styles.userEmail, { color: Colors.subduedTextColor }]}
            >
              {user?.email}
            </ThemedText>
          </View>

          {/* Statistics */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <ThemedText style={styles.statValue}>
                  {Math.floor(stats?.minutesSpoken ?? 0)}
                </ThemedText>
                <Ionicons
                  name="arrow-up"
                  size={14}
                  color="#34C759"
                  style={{ marginLeft: 2 }}
                />
                <ThemedText style={styles.statChangePositive}>
                  {Math.floor(stats?.minutesSpoken ?? 0)}
                </ThemedText>
              </View>
              <ThemedText
                style={[styles.statLabel, { color: Colors.subduedTextColor }]}
              >
                minutes spoken
              </ThemedText>
            </View>

            <View
              style={[
                styles.statSeparator,
                { backgroundColor: Colors.borderColor },
              ]}
            />

            <View style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <ThemedText style={styles.statValue}>0</ThemedText>
              </View>
              <ThemedText
                style={[styles.statLabel, { color: Colors.subduedTextColor }]}
              >
                day streak
              </ThemedText>
            </View>
          </View>

          {/* Premium card */}
          <TouchableOpacity
            style={[
              styles.premiumCard,
              {
                backgroundColor: Colors.primaryAccentColor,
              },
            ]}
            onPress={() => {
              if (!isPremium) setPaywallVisible(true);
            }}
          >
            <View style={styles.premiumLeft}>
              <Ionicons name="star" size={24} color="#FFF" />
              <View style={styles.premiumText}>
                <ThemedText style={styles.premiumTitle}>
                  {isPremium ? "Premium Active" : "Get Premium"}
                </ThemedText>
                <ThemedText style={styles.premiumSubtitle}>
                  {isPremium
                    ? premiumExpiresAt
                      ? `Premium ends ${new Date(premiumExpiresAt).toLocaleDateString()}`
                      : "Unlocked premium features"
                    : "Unlock unlimited access to all lessons"}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Settings Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: Colors.light.background,
                  borderColor: Colors.borderColor,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  Alert.alert(
                    "Settings",
                    "Language, notifications, and app preferences",
                  )
                }
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={Colors.subduedTextColor}
                  />
                  <ThemedText style={styles.menuItemTitle}>
                    App Settings
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.subduedTextColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItemLast}
                onPress={() =>
                  Alert.alert(
                    "Help",
                    "Get help, contact support, and view FAQs",
                  )
                }
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color={Colors.subduedTextColor}
                  />
                  <ThemedText style={styles.menuItemTitle}>
                    Help & Support
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.subduedTextColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.signOutButton, { borderColor: Colors.borderColor }]}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Paywall
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 70,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 36,
    textAlign: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: 20,
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statChangePositive: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#34C759",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: -2,
  },
  statSeparator: {
    width: 1,
    height: 24,
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  premiumLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8e8e93",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 24,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderColor: "#bababeff",
  },
  menuItemLast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    gap: 8,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
});
