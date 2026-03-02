import { Word } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "../themed-text";

interface TooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
  width: number;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;
const CARD_MIN_HEIGHT = 90;
const OPEN_POSITION = 0;
const CLOSED_POSITION = CARD_MAX_HEIGHT - CARD_MIN_HEIGHT;

export default function SentenceBreakdownCard({
  sentence,
  disabled,
}: {
  sentence: {
    english: string;
    pinyin: string;
    hanzi: string;
    words: Word[];
    breakdown: string;
  };
  disabled?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(CLOSED_POSITION);
  const context = useSharedValue({ y: 0 });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const cardRef = useRef<Animated.View>(null);
  const tooltipWidthRef = useRef<number>(0);
  const hanziWordRefs = useRef<Array<View | null>>([]);
  const pinyinWordRefs = useRef<Array<View | null>>([]);
  const [selectedWord, setSelectedWord] = useState<{
    type: "hanzi" | "pinyin";
    index: number;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const closeCard = () => {
    "worklet";
    translateY.value = withSpring(CLOSED_POSITION, {
      damping: 30,
      stiffness: 200,
      mass: 1,
    });
  };

  const openCard = () => {
    "worklet";
    translateY.value = withSpring(OPEN_POSITION, {
      damping: 30,
      stiffness: 200,
      mass: 1,
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = context.value.y + event.translationY;
      translateY.value = Math.max(translateY.value, OPEN_POSITION);
    })
    .onEnd(() => {
      if (translateY.value > CLOSED_POSITION / 2) {
        closeCard();
      } else {
        openCard();
      }
    });

  const hideTooltip = () => {
    setTooltip(null);
    setSelectedWord(null);
  };

  const playAudio = () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    const text = sentence.hanzi || sentence.pinyin;
    if (!text) return;

    setIsPlaying(true);
    Speech.speak(text, {
      language: "zh-CN",
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const showTooltip = (word: Word, type: "hanzi" | "pinyin", index: number) => {
    const wordRef =
      type === "hanzi"
        ? hanziWordRefs.current[index]
        : pinyinWordRefs.current[index];
    if (!wordRef) return;

    wordRef.measureInWindow((wordX, wordY, wordWidth) => {
      cardRef.current?.measureInWindow((cardX, cardY) => {
        setTooltip({
          visible: true,
          text: word.english,
          x: wordX + wordWidth / 2,
          y: wordY - cardY,
          width: wordWidth,
        });
        setSelectedWord({ type, index });
      });
    });
  };

  const renderInteractiveSentence = (type: "hanzi" | "pinyin") => (
    <Pressable onPress={hideTooltip}>
      <View style={styles.interactiveSentenceContainer}>
        {sentence.words.map((word, index) => (
          <Pressable
            key={index}
            ref={(ref) => {
              if (type === "hanzi") hanziWordRefs.current[index] = ref;
              else pinyinWordRefs.current[index] = ref;
            }}
            onPress={() => showTooltip(word, type, index)}
          >
            <ThemedText
              style={[
                type === "hanzi" ? styles.hanziValue : styles.pinyinValue,
                selectedWord &&
                  selectedWord.type === type &&
                  selectedWord.index === index &&
                  styles.selectedWord,
              ]}
            >
              {word[type]}{" "}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </Pressable>
  );

  const cardInner = (
    <Animated.View
      ref={cardRef}
      pointerEvents={disabled ? "none" : "auto"}
      style={[
        styles.cardContainer,
        {
          height: CARD_MAX_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          opacity: disabled ? 0.6 : 1,
        },
        animatedStyle,
      ]}
    >
      <Pressable style={{ flex: 1 }} onPress={hideTooltip}>
        <Pressable
          onPress={() => {
            if (translateY.value === OPEN_POSITION) {
              closeCard();
            } else {
              openCard();
            }
          }}
          style={styles.handleContainer}
        >
          <View style={styles.handle}></View>
        </Pressable>

        <View style={styles.peekContent}>
          <Ionicons name="help-circle-outline" size={24} color="#9ca3af" />
          <ThemedText style={styles.peekText}>
            Swipe up for detailed help
          </ThemedText>
        </View>

        <ScrollView
          style={styles.fullContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.title}>Sentence Breakdown</ThemedText>

          <View style={styles.wordHintContainer}>
            <ThemedText style={styles.wordHintText}>
              Tap any word to see its meaning
            </ThemedText>
          </View>

          <View style={styles.breakdownItem}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemedText style={styles.label}>Pinyin:</ThemedText>
              <Pressable
                onPress={playAudio}
                disabled={disabled}
                style={styles.playButton}
                hitSlop={8}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={20}
                  color={Colors.primaryAccentColor}
                />
              </Pressable>
            </View>
            {renderInteractiveSentence("pinyin")}
          </View>
          <View style={styles.breakdownItem}>
            <ThemedText style={styles.label}>Hanzi:</ThemedText>
            {renderInteractiveSentence("hanzi")}
          </View>
          <View style={styles.breakdownItem}>
            <ThemedText style={styles.label}>English:</ThemedText>
            <ThemedText style={styles.englishValue}>
              {sentence.english}
            </ThemedText>
          </View>
          <View style={styles.breakdownItem}>
            <ThemedText style={styles.label}>Breakdown:</ThemedText>
            <ThemedText style={styles.breakdownText}>
              {sentence.breakdown}
            </ThemedText>
          </View>
        </ScrollView>
      </Pressable>

      {tooltip?.visible && (
        <View
          style={[
            styles.tooltipContainer,
            {
              top: tooltip.y - 48,
              left: Math.max(
                8,
                Math.min(
                  tooltip.x - tooltipWidthRef.current / 2,
                  SCREEN_WIDTH - tooltipWidthRef.current - 8,
                ),
              ),
            },
          ]}
          onLayout={(e) => {
            tooltipWidthRef.current = e.nativeEvent.layout.width;
          }}
        >
          <ThemedText style={styles.tooltipText}>{tooltip.text}</ThemedText>
        </View>
      )}
    </Animated.View>
  );

  if (disabled) {
    return cardInner;
  }

  return <GestureDetector gesture={panGesture}>{cardInner}</GestureDetector>;
}

const styles = StyleSheet.create({
  cardContainer: {
    position: "absolute",
    bottom: -CARD_MIN_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8, // lowered so it sits behind the result
    zIndex: 0, // ensure this is lower than the result overlay
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#e5e7eb",
  },
  peekContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
  },
  peekText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.subduedTextColor, // Gray-500
    fontWeight: "500",
  },
  fullContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1c1e", // Dark text
    marginBottom: 5,
  },
  breakdownItem: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: Colors.subduedTextColor, // Gray-500
    textTransform: "uppercase",
  },
  interactiveSentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  pinyinValue: {
    fontSize: 18,
    color: "#1c1c1e",
    fontWeight: "600",
    lineHeight: 30,
  },
  hanziValue: {
    fontSize: 22,
    color: "#1c1c1e",
    lineHeight: 34,
  },
  englishValue: {
    fontSize: 18,
    color: "#1c1c1e",
    lineHeight: 26,
  },
  breakdownText: {
    fontSize: 16,
    color: "#1c1c1e",
    lineHeight: 24,
  },
  tooltipContainer: {
    position: "absolute",
    backgroundColor: "#f3f4f6", // Light gray
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tooltipText: {
    color: "#1c1c1e",
    fontSize: 14,
    textAlign: "center",
  },
  selectedWord: {
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 0,
    paddingHorizontal: 2,
    textDecorationLine: "underline",
    textDecorationColor: Colors.primaryAccentColor,
    textDecorationStyle: "solid",
  },
  wordHintContainer: {
    marginBottom: 20,
  },
  wordHintText: {
    fontSize: 13,
    color: Colors.subduedTextColor,
    fontStyle: "italic",
  },
  playButton: {
    marginLeft: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#ffe0d2",
    justifyContent: "center",
    alignItems: "center",
  },
});
