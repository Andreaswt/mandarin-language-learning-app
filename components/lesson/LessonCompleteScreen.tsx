import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { ThemedText } from "../themed-text";
import { LessonStats } from "./LessonContent";

export default function LessonCompleteScreen({
  lessonStats,
  onContinue,
  onReview,
}: {
  lessonStats: LessonStats;
  onContinue: () => void;
  onReview: () => void;
}) {
  const confettiRef = useRef<any>(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      confettiRef.current?.start();
    }, 400);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getPerformanceMessage = () => {
    if (lessonStats.accuracy >= 90) return "Outstanding! 🌟";
    if (lessonStats.accuracy >= 75) return "Great work! 🎉";
    if (lessonStats.accuracy >= 60) return "Good effort! 💪";
    return "Keep practicing! 📚";
  };

  const getPerformanceColor = () => {
    if (lessonStats.accuracy >= 90) return "#FFD700";
    if (lessonStats.accuracy >= 75) return "#34C759";
    if (lessonStats.accuracy >= 60) return Colors.primaryAccentColor;
    return Colors.subduedTextColor;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.gradient}
        colors={["#ffffff", "#f9fafb", "#f3f4f6"]}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.badgeContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primaryAccentColor, "#ff6b35"]}
            style={styles.badgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="trophy" size={56} color="#fff" />
          </LinearGradient>
          <ThemedText style={styles.completeTitle}>Lesson Complete!</ThemedText>
          <ThemedText style={styles.performanceMessage}>
            {getPerformanceMessage()}
          </ThemedText>
        </Animated.View>

        {/* Accuracy Card */}
        <Animated.View
          style={[
            styles.accuracyCard,
            {
              opacity: fadeAnim,
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
            },
          ]}
        >
          <View
            style={[
              styles.accuracyIcon,
              { backgroundColor: getPerformanceColor() + "20" },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={40}
              color={getPerformanceColor()}
            />
          </View>
          <View style={styles.accuracyText}>
            <ThemedText style={styles.accuracyValue}>
              {lessonStats.accuracy}%
            </ThemedText>
            <ThemedText
              style={[styles.accuracyLabel, { color: Colors.subduedTextColor }]}
            >
              {lessonStats.correctAnswers}/{lessonStats.totalQuestions} correct
            </ThemedText>
          </View>
        </Animated.View>

        {/* Questions to review */}
        {lessonStats.wrongQuestions &&
          lessonStats.wrongQuestions.length > 0 && (
            <Animated.View style={[styles.wrongSection, { opacity: fadeAnim }]}>
              <View style={styles.wrongHeader}>
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
                <ThemedText style={styles.wrongTitle}>
                  Questions to Review
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.wrongSubtitle,
                  { color: Colors.subduedTextColor },
                ]}
              >
                Focus on these for improvement
              </ThemedText>

              {lessonStats.wrongQuestions.map((question, index) => (
                <View
                  key={index}
                  style={[
                    styles.wrongQuestionCard,
                    {
                      backgroundColor: "#ffffff",
                      borderColor: "rgba(239, 68, 68, 0.2)",
                    },
                  ]}
                >
                  <View style={styles.wrongIndicator}>
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                  </View>
                  <View style={styles.questionContent}>
                    <ThemedText style={styles.questionEnglish}>
                      {question.english}
                    </ThemedText>
                    <View style={styles.questionMandarin}>
                      <ThemedText style={styles.questionPinyin}>
                        {question.mandarin.pinyin}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.questionHanzi,
                          { color: Colors.subduedTextColor },
                        ]}
                      >
                        {question.mandarin.hanzi}
                      </ThemedText>
                    </View>
                  </View>
                  {question.attempts > 0 && (
                    <View style={styles.attemptsIndicator}>
                      <Ionicons name="refresh" size={16} color="#ef4444" />
                      <ThemedText
                        style={[styles.attemptsText, { color: "#ef4444" }]}
                      >
                        {question.attempts}
                      </ThemedText>
                    </View>
                  )}
                </View>
              ))}
            </Animated.View>
          )}
      </ScrollView>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.actionButtons,
          {
            opacity: fadeAnim,
            backgroundColor: "#ffffff",
            borderTopColor: "#e5e7eb",
          },
        ]}
      >
        <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
          <LinearGradient
            colors={[Colors.primaryAccentColor, "#ff6b35"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <ThemedText style={styles.primaryButtonText}>Continue</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>

        {lessonStats.wrongQuestions &&
          lessonStats.wrongQuestions.length > 0 && (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: "#e5e7eb" }]}
              onPress={onReview}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={Colors.primaryAccentColor}
              />
              <ThemedText style={styles.secondaryButtonText}>
                Practice Again
              </ThemedText>
            </TouchableOpacity>
          )}
      </Animated.View>

      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
        fallSpeed={4000}
        explosionSpeed={350}
        colors={[
          Colors.primaryAccentColor,
          "#ff6b35",
          "#FFD700",
          "#34C759",
          "#FF9F0A",
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 180,
  },
  badgeContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  badgeGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: Colors.primaryAccentColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  performanceMessage: {
    fontSize: 16,
    textAlign: "center",
  },
  accuracyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  accuracyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  accuracyText: {
    flex: 1,
  },
  accuracyValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  accuracyLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  wrongSection: {
    marginBottom: 32,
  },
  wrongHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  wrongTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  wrongSubtitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  wrongQuestionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  wrongIndicator: {
    marginRight: 12,
    marginTop: 2,
  },
  questionContent: {
    flex: 1,
    marginRight: 12,
  },
  questionEnglish: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  questionMandarin: {
    gap: 4,
  },
  questionPinyin: {
    fontSize: 16,
    fontWeight: "600",
  },
  questionHanzi: {
    fontSize: 15,
  },
  attemptsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  attemptsText: {
    fontSize: 14,
    fontWeight: "700",
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 10,
    gap: 12,
    borderTopWidth: 1,
  },
  primaryButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.primaryAccentColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primaryAccentColor,
  },
});
