import { ListeningOption } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

export default function ListeningMultipleChoiceMode({
  options,
  selectedOption,
  handleOptionPress,
  isLoading,
  showResult,
}: {
  options: ListeningOption[];
  selectedOption: number | null;
  handleOptionPress: (id: number) => void;
  isLoading: boolean;
  showResult: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.promptContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          What did you just hear?
        </ThemedText>
      </View>
      <ScrollView
        style={styles.optionsScrollView}
        contentContainerStyle={styles.optionsContentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isLoading && !showResult}
      >
        {options.map((option) => {
          const isSelected = selectedOption === option.id;

          return (
            <Pressable
              key={option.id}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption,
                {
                  backgroundColor: "#ffffff",
                  borderColor: isSelected
                    ? Colors.primaryAccentColor
                    : "#e5e7eb",
                  opacity: isLoading || showResult ? 0.7 : 1,
                  marginBottom: 16,
                },
              ]}
              onPress={() => handleOptionPress(option.id)}
              disabled={isLoading || showResult}
            >
              <ThemedText style={styles.optionText}>
                {option.english}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  promptContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsContentContainer: {
    paddingBottom: 0,
  },
  optionButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  selectedOption: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
      },
      android: {
        borderWidth: 3,
      },
    }),
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
});
