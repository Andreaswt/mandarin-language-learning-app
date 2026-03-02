import { ThemedText } from "@/components/themed-text";
import { Chapter, COURSE_DATA, Lesson } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useSpeakingListningStats } from "@/hooks/useSpeakingListeningStats";
import { getAllProgress } from "@/lib/lessonProgress";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_STARS = 3;

export default function LessonsContent() {
  const colors = Colors["light"];
  const { stats, loading, refresh } = useSpeakingListningStats();
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const savedProgress = await getAllProgress();
    setProgress(savedProgress);
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleLessonPress = (lesson: Lesson) => {
    router.push({ pathname: "/practise", params: { lessonId: lesson.id } });
  };

  const handlePractiseChapterPress = (chapter: Chapter) => {
    if (chapter.review) {
      router.push({
        pathname: "/practise",
        params: { lessonId: chapter.review.id },
      });
    }
  };

  const renderCompletionStatus = (count: number) => {
    const elements = [];
    const starsToDisplay = Math.min(count, MAX_STARS);

    for (let i = 1; i <= MAX_STARS; i++) {
      elements.push(
        <Ionicons
          key={`start-${i}`}
          name={i <= starsToDisplay ? "star" : "star-outline"}
          size={16}
          color={i <= starsToDisplay ? "#FFD700" : Colors.subduedTextColor}
          style={styles.starIcon}
        />,
      );
    }

    if (count > MAX_STARS) {
      const extraCount = count - MAX_STARS;
      elements.push(
        <ThemedText
          key="extra-count"
          style={[styles.extraCountText, { color: Colors.subduedTextColor }]}
        >
          +{extraCount}
        </ThemedText>,
      );
    }

    return <View style={styles.completionStarsContainer}>{elements}</View>;
  };

  const renderLessonNode = (lesson: Lesson, index: number) => {
    const completionCount = progress[lesson.id] || 0;
    const isMastered = completionCount >= MAX_STARS;
    const alignment = index % 2 === 0 ? "flex-start" : "flex-end";

    return (
      <View
        key={lesson.id}
        style={[styles.lessonNodeContainer, { alignItems: alignment }]}
      >
        <TouchableOpacity
          style={[
            styles.lessonBubble,
            {
              backgroundColor: colors.background,
              borderColor: isMastered
                ? Colors.primaryAccentColor
                : Colors.borderColor,
            },
          ]}
          onPress={() => handleLessonPress(lesson)}
        >
          <Ionicons
            name={lesson.icon}
            size={28}
            color={Colors.primaryAccentColor}
          />
          <View style={styles.lessonTextContainer}>
            <ThemedText style={styles.lessonTitle}>{lesson.title}</ThemedText>
            {renderCompletionStatus(completionCount)}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        <View
          style={[styles.header, { borderBottomColor: Colors.borderColor }]}
        >
          <TouchableOpacity>
            <ThemedText style={styles.headerTitle}>This week</ThemedText>
            <ThemedText
              style={[
                styles.headerSubtitle,
                { color: Colors.subduedTextColor },
              ]}
            >
              In reviews
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <ThemedText style={styles.statValue}>
                  {loading ? "-" : Math.floor(stats?.minutesSpoken ?? 0)}
                </ThemedText>
                <Ionicons
                  name="arrow-up"
                  size={14}
                  color="#34C759"
                  style={{ marginLeft: 2 }}
                />
                <ThemedText style={styles.statChangePositive}>
                  {Math.floor(stats?.weeklyChange.spoken ?? 0)}
                </ThemedText>
              </View>
              <ThemedText
                style={[styles.statLabel, { color: Colors.subduedTextColor }]}
              >
                minutes spoken
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.headerSeparator,
              { backgroundColor: Colors.borderColor },
            ]}
          />

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.statItem}>
              <View style={styles.statValueContainer}>
                <ThemedText style={styles.statValue}>
                  {loading ? "-" : Math.floor(stats?.minutesListened ?? 0)}
                </ThemedText>
                <Ionicons
                  name="arrow-up"
                  size={14}
                  color="#34C759"
                  style={{ marginLeft: 2 }}
                />
                <ThemedText style={styles.statChangePositive}>
                  {Math.floor(stats?.weeklyChange.listened ?? 0)}
                </ThemedText>
              </View>
              <ThemedText
                style={[styles.statLabel, { color: Colors.subduedTextColor }]}
              >
                minutes listened
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main content */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {COURSE_DATA.chapters.map((chapter) => (
            <View key={chapter.id} style={styles.chapterContainer}>
              <View style={styles.chapterHeader}>
                <Text style={styles.chapterNumberText}>
                  CHAPTER {chapter.id}
                </Text>
                <ThemedText type="title" style={styles.chapterTitleText}>
                  {chapter.title}
                </ThemedText>
              </View>

              <View style={styles.lessonsWrapper}>
                {chapter.lessons.map(renderLessonNode)}
              </View>

              {chapter.review && (
                <TouchableOpacity
                  style={[
                    styles.practiceChapterButton,
                    { backgroundColor: Colors.primaryAccentColor },
                  ]}
                  onPress={() => handlePractiseChapterPress(chapter)}
                >
                  <Ionicons name="flash" size={20} color="#FFF" />
                  <ThemedText style={styles.practiceChapterButtonText}>
                    Review '{chapter.title}'
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
    color: "#34C759", // Green for positive change
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: -2,
  },
  headerSeparator: {
    width: 1,
    height: 24,
    marginRight: -8, // Adjust spacing
  },
  scrollContainer: {
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
  chapterContainer: {
    marginBottom: 24,
  },
  chapterHeader: {
    marginBottom: 24,
  },
  chapterNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8e8e93",
    textTransform: "uppercase",
  },
  chapterTitleText: {
    marginTop: 4,
  },
  lessonsWrapper: {
    gap: 20,
  },
  lessonNodeContainer: {
    minHeight: 80,
    justifyContent: "center",
  },
  lessonBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    width: "80%",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lessonTextContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginBottom: 6,
  },
  completionStarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 3,
  },
  extraCountText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
  },
  practiceChapterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 24,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  practiceChapterButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
