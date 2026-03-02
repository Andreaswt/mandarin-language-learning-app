import { SpeakingOption } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

export default function SingleResponseMode({
  option,
  optionSelectionAnim,
}: {
  option: SpeakingOption;
  optionSelectionAnim: Animated.Value;
}) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.promptContainer}>
        <Animated.View
          style={[
            styles.sayItPromptContainer,
            {
              opacity: optionSelectionAnim,
              transform: [
                {
                  translateY: optionSelectionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ThemedText style={styles.sayItPrompt}>
            Record this response in Mandarin
          </ThemedText>
        </Animated.View>
      </View>
      <View
        style={[styles.singleResponseContainer, { backgroundColor: "#ffffff" }]}
      >
        <ThemedText style={styles.singleResponseEnglish}>
          {option.english}
        </ThemedText>
        <TouchableOpacity
          style={styles.revealButton}
          onPress={() => setShowAnswer((v) => !v)}
          hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
        >
          {!showAnswer ? (
            <ThemedText style={styles.instructionText}>
              Tap here to reveal how to say it
            </ThemedText>
          ) : (
            <View style={styles.singleResponseMandarin}>
              <ThemedText style={styles.optionDetailsPinyin}>
                {option.mandarin.pinyin}
              </ThemedText>
              <ThemedText
                style={[
                  styles.optionDetailsHanzi,
                  { color: Colors.subduedTextColor },
                ]}
              >
                {option.mandarin.hanzi}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  promptContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
  },
  sayItPromptContainer: {
    position: "absolute",
    bottom: 20,
  },
  sayItPrompt: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primaryAccentColor,
    textAlign: "center",
  },
  revealButton: {
    marginBottom: 8,
    marginTop: 16,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.subduedTextColor,
  },
  optionDetailsHanzi: {
    fontSize: 16,
    marginBottom: 4,
  },
  optionDetailsPinyin: {
    fontSize: 18,
    fontWeight: "bold",
  },
  singleResponseContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primaryAccentColor,
    overflow: "visible",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  singleResponseEnglish: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  singleResponseMandarin: {
    alignItems: "center",
    marginTop: 12,
  },
});
