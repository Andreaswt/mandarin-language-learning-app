import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const { width } = Dimensions.get("window");

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  billingCycle: string;
  features: string[];
  recommended?: boolean;
  savings?: string;
}

const features: Feature[] = [
  {
    icon: "book-outline",
    title: "Advanced Curriculum",
    description: "Access the world's most advanced speaking curriculum",
  },
  {
    icon: "trending-up-outline",
    title: "Target Your Mistakes",
    description: "Lessons personalized to fix your frequent mistakes",
  },
  {
    icon: "bulb-outline",
    title: "Custom Vocabulary",
    description: "Learn vocabulary tailored to your interests",
  },
  {
    icon: "people-outline",
    title: "Situational Roleplays",
    description: "Practice real-world conversations",
  },
  {
    icon: "mic-outline",
    title: "Pronunciation Coach",
    description: "Get instant feedback on your pronunciation",
  },
  {
    icon: "analytics-outline",
    title: "Progress Reports",
    description: "Track your learning journey with detailed analytics",
  },
];

const plans: { annual: Plan; monthly: Plan } = {
  annual: {
    id: "premium_annual",
    name: "Premium",
    price: "799.00",
    period: "year",
    billingCycle: "Billed yearly",
    features: ["7-day free trial", "Cancel anytime"],
    recommended: true,
    savings: "Save 40%",
  },
  monthly: {
    id: "premium_monthly",
    name: "Premium",
    price: "199.00",
    period: "month",
    billingCycle: "Billed monthly",
    features: ["7-day free trial", "Cancel anytime"],
  },
};

export function Paywall({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">(
    "annual",
  );
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const { refreshProfile } = useAuth();

  const selectedPlan = plans[billingCycle];

  const handleStartTrial = async () => {
    try {
      setIsStartingTrial(true);

      const { error } = await supabase.functions.invoke("start-trial", {
        body: { planId: selectedPlan.id },
      });

      if (error) throw error;

      await refreshProfile();
      onClose();
    } catch (err) {
      console.error("Failed to start trial:", err);
      toast.error("Could not start trial. Please try again.");
    } finally {
      setIsStartingTrial(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <LinearGradient
          colors={[Colors.primaryAccentColor, "#ff6b35", "#1a1a2e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
          locations={[0, 0.4, 1]}
        />

        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={"#fff"} />
          </Pressable>
          <Text style={styles.headerTitle}>Go Premium</Text>
          <Text style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.introSection}>
            <Text style={styles.title}>
              Join over <Text style={styles.highlight}>5 million</Text> users
            </Text>
            <Text style={styles.subtitle}>leaning with Convo!</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name={feature.icon}
                    size={24}
                    color={Colors.primaryAccentColor}
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>

          {/* Billing cycle toggle */}
          <View style={styles.toggleContainer}>
            <Pressable
              style={[
                styles.toggleButton,
                billingCycle === "annual" && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle("annual")}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === "annual" && styles.toggleTextActive,
                ]}
              >
                Annual
              </Text>
              {billingCycle === "annual" && (
                <View style={styles.savingsBadge}>
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>
                      {plans.annual.savings}
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                billingCycle === "monthly" && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle("monthly")}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === "monthly" && styles.toggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </Pressable>
          </View>

          {/* Plans */}
          <View style={styles.planCard}>
            {selectedPlan.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>BEST VALUE</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{selectedPlan.name}</Text>
                <Text style={styles.planBilling}>
                  {selectedPlan.billingCycle}
                </Text>
              </View>
              <View style={styles.planPriceContainer}>
                <Text style={styles.planPrice}>{selectedPlan.price} kr.</Text>
                <Text style={styles.planPeriod}>{selectedPlan.period}</Text>
              </View>
            </View>
            <View style={styles.planFeatures}>
              {selectedPlan.features.map((feature, index) => (
                <View key={index} style={styles.planFeatureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={styles.planFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA button */}
          <Pressable
            style={[styles.ctaButton, isStartingTrial && { opacity: 0.7 }]}
            onPress={handleStartTrial}
            disabled={isStartingTrial}
          >
            <Ionicons
              name="star"
              size={20}
              color="#fff"
              style={styles.ctaIcon}
            />
            <Text style={styles.ctaText}>
              {isStartingTrial ? "Starting..." : "Start my free week"}
            </Text>
          </Pressable>

          {/* Footer */}
          <Text style={styles.footer}>Try 7 days free. Cancel anytime.</Text>
          <Text style={styles.footerNote}>
            We'll send you a reminder before your trial ends.
          </Text>

          {/* Rating */}
          <View style={styles.rating}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={18} color="#FFD700" />
              ))}
            </View>
            <Text style={styles.ratingText}>4.8 / 5 STARS</Text>
            <Text style={styles.ratingSubtext}>
              10.000+ reviews on App Store
            </Text>
          </View>

          {/* Testimonial */}
          <View style={styles.testimonial}>
            <Text style={styles.testimonialText}>
              Convo has the best curriculum among all the language
              learning-related apps I've tried. Higher recommended.
            </Text>
            <Text style={styles.testimonialAuthor}>
              - App Store User from South Korea
            </Text>
          </View>

          {/* Legal links */}
          <View style={styles.legalLinks}>
            <Pressable>
              <Text style={styles.legalLink}>Restore Purchase</Text>
            </Pressable>
            <Text style={styles.legalSeparator}>•</Text>
            <Pressable>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </Pressable>
            <Text style={styles.legalSeparator}>•</Text>
            <Pressable>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Pressable>
          </View>

          <View style={styles.bottomSpacing}></View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  introSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  highlight: {
    color: "#FFD700",
  },
  subtitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: "rgba(26, 26, 46, 0.7)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 73, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 73, 0, 0.3)",
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(26, 26, 46, 0.6)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#fff",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  toggleTextActive: {
    color: "#1a1a2e",
  },
  savingsBadge: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.primaryAccentColor,
  },
  recommendedBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    backgroundColor: Colors.primaryAccentColor,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  planBilling: {
    fontSize: 14,
    color: Colors.subduedTextColor,
    marginTop: 4,
  },
  planPriceContainer: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  planPeriod: {
    fontSize: 14,
    color: Colors.subduedTextColor,
  },
  planFeatures: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    gap: 12,
  },
  planFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryAccentColor,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 12,
    shadowColor: Colors.primaryAccentColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaIcon: {
    marginRight: 8,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  footer: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  footerNote: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  rating: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  stars: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  ratingSubtext: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
  },
  testimonial: {
    backgroundColor: "rgba(26, 26, 46, 0.7)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  testimonialText: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 22,
    fontStyle: "italic",
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  legalLink: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textDecorationLine: "underline",
  },
  legalSeparator: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  bottomSpacing: {
    height: 40,
  },
});
