import { Paywall } from "@/components/subscription/Paywall";
import { ThemedText } from "@/components/themed-text";
import { ConversationScenario, COURSE_DATA } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import {
  createCustomScenarioId,
  listCustomScenarios,
  saveCustomScenario,
} from "@/lib/customScenarios";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function ConversationsScreen() {
  const { isPremium } = useAuth();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isPhrasebookOpen, setIsPhrasebookOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] =
    useState<ConversationScenario | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [customMyRole, setCustomMyRole] = useState("");
  const [customAiRole, setCustomAiRole] = useState("");
  const [customScene, setCustomScene] = useState("");
  const [customScenarios, setCustomScenarios] = useState<
    ConversationScenario[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const load = async () => {
        try {
          const saved = await listCustomScenarios();
          if (isActive) setCustomScenarios(saved);
        } catch (err) {
          console.error("Failed to load custom scenarios:", err);
        }
      };

      void load();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleScenarioPress = (scenario: ConversationScenario) => {
    if (scenario.isFree || isPremium) {
      setSelectedScenario(scenario);
    } else {
      setPaywallVisible(true);
    }
  };

  const handleStartConversation = () => {
    if (selectedScenario) {
      const id = selectedScenario.id;
      setSelectedScenario(null);
      setIsPhrasebookOpen(false);

      if (id.startsWith("custom_")) {
        router.push({
          pathname: "/conversation",
          params: { customScenarioId: id },
        });
        return;
      }

      router.push({
        pathname: "/conversation",
        params: { scenarioId: id },
      });
    }
  };

  const handleCreateCustom = () => {
    if (isPremium) {
      setIsCreatingCustom(true);
      return;
    }

    setPaywallVisible(true);
  };

  const handleStartCustomConversation = async () => {
    if (!customScene.trim() || isGeneratingScenario) return;

    setIsGeneratingScenario(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "scenario-generate",
        {
          body: {
            myRole: customMyRole,
            aiRole: customAiRole,
            sceneDescription: customScene,
          },
        },
      );

      if (error) {
        console.error("Error calling scenario-generate", error);
        toast.error("Could not generate scenario", {
          description: "Please try again in a moment",
        });
        return;
      }

      const id = createCustomScenarioId();
      const scenario: ConversationScenario = {
        id,
        title: data?.title,
        icon: "color-wand",
        isFree: false,
        description: data?.description,
        goal: data?.goal,
        tasks: data?.tasks,
        difficulty: data?.difficulty,
        phrasebook: data?.phrasebook,
      };

      await saveCustomScenario(scenario);
      setCustomScenarios((prev) => [scenario, ...prev]);

      setIsCreatingCustom(false);
      setIsPhrasebookOpen(false);
      setCustomMyRole("");
      setCustomAiRole("");
      setCustomScene("");
      setSelectedScenario(scenario);
    } catch (err) {
      console.error("Coudln't generate custom scenario:", err);
      toast.error("Could not start Free Talk", {
        description: "Please try again.",
      });
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "left", "right"]}
    >
      <View style={{ flex: 1 }}>
        <View
          style={[styles.header, { borderBottomColor: Colors.borderColor }]}
        >
          <ThemedText style={styles.headerTitle}>Topics</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {!isPremium && (
            <TouchableOpacity
              style={[
                styles.premiumBanner,
                { backgroundColor: Colors.primaryAccentColor },
              ]}
              onPress={() => setPaywallVisible(true)}
            >
              <View style={styles.premiumContent}>
                <Ionicons
                  name="chatbox"
                  size={24}
                  color="#fff"
                  style={{ marginBottom: 8 }}
                />
                <ThemedText style={styles.premiumTitle}>
                  Get full access to Convo
                </ThemedText>
                <ThemedText style={styles.premiumSubtitle}>
                  Unlock Convo Premium to get access to custom scenarios and
                  more
                </ThemedText>
                <View style={styles.premiumButton}>
                  <ThemedText
                    style={[
                      styles.premiumButtonText,
                      { color: Colors.primaryAccentColor },
                    ]}
                  >
                    Start free trial
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.freeTalkCard, { borderColor: Colors.borderColor }]}
            onPress={handleCreateCustom}
          >
            <View style={styles.freeTalkContent}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                Free Talk
              </ThemedText>
              <ThemedText
                style={{ color: Colors.subduedTextColor, marginTop: 4 }}
              >
                Describe a scenario of your choice to create you custom Roleplay
                experience.
              </ThemedText>
            </View>
            <View style={styles.crystalBallContainer}>
              <Ionicons name="color-wand" size={32} color="#A855F7" />
            </View>
          </TouchableOpacity>

          {/* Scenarios grid */}
          <View style={styles.gridContainer}>
            {[...customScenarios, ...COURSE_DATA.scenarios].map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={[
                  styles.scenarioCard,
                  { borderColor: Colors.borderColor },
                ]}
                onPress={() => handleScenarioPress(scenario)}
              >
                {scenario.id.startsWith("custom_") && (
                  <View
                    style={[
                      styles.freeBadge,
                      { backgroundColor: Colors.light.text + "22" },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.freeBadgeText,
                        { color: Colors.subduedTextColor },
                      ]}
                    >
                      CUSTOM
                    </ThemedText>
                  </View>
                )}
                {scenario.isFree && (
                  <View
                    style={[
                      styles.freeBadge,
                      { backgroundColor: Colors.primaryAccentColor },
                    ]}
                  >
                    <ThemedText style={[styles.freeBadgeText]}>FREE</ThemedText>
                  </View>
                )}
                {!scenario.isFree && !isPremium && (
                  <View style={[styles.lockBadge]}>
                    <Ionicons
                      name="lock-closed"
                      size={24}
                      color={Colors.subduedTextColor}
                    />
                  </View>
                )}
                <ThemedText type="defaultSemiBold" style={styles.scenarioTitle}>
                  {scenario.title}
                </ThemedText>
                <View style={styles.scenarioIconContainer}>
                  <Ionicons
                    name={scenario.icon}
                    size={40}
                    color={
                      scenario.isFree || isPremium
                        ? Colors.primaryAccentColor
                        : Colors.subduedTextColor
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Scenario Detail Modal */}
      <Modal
        visible={!!selectedScenario}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setSelectedScenario(null);
          setIsPhrasebookOpen(false);
        }}
      >
        <View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  if (isPhrasebookOpen) {
                    setIsPhrasebookOpen(false);
                    return;
                  }
                  setSelectedScenario(null);
                  setIsPhrasebookOpen(false);
                }}
                style={styles.backButton}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={Colors.light.text}
                />
              </TouchableOpacity>
              <ThemedText type="defaultSemiBold">
                {isPhrasebookOpen ? "Phrasebook" : ""}
              </ThemedText>
              <View style={{ width: 40 }}></View>
            </View>
            <ScrollView
              key={isPhrasebookOpen ? "phrasebook" : "scenario"}
              contentContainerStyle={styles.modalContent}
            >
              {isPhrasebookOpen ? (
                (selectedScenario?.phrasebook ?? []).map((p, idx) => (
                  <View
                    key={`${p.hanzi}-${idx}`}
                    style={[
                      styles.phraseRow,
                      {
                        borderColor: Colors.borderColor,
                      },
                    ]}
                  >
                    <ThemedText style={styles.phraseZh}>{p.hanzi}</ThemedText>
                    <ThemedText style={{ color: Colors.subduedTextColor }}>
                      {p.pinyin}
                    </ThemedText>
                    <ThemedText style={{ color: Colors.subduedTextColor }}>
                      {p.english}
                    </ThemedText>
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.modalIconContainer}>
                    <Ionicons
                      name={selectedScenario?.icon}
                      size={64}
                      color={Colors.primaryAccentColor}
                    />
                  </View>

                  <ThemedText type={"title"} style={styles.modalTitle}>
                    {selectedScenario?.title}
                  </ThemedText>

                  <View style={styles.section}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.sectionHeader}
                    >
                      Scenario
                    </ThemedText>
                    <ThemedText style={{ color: Colors.subduedTextColor }}>
                      {selectedScenario?.description}
                    </ThemedText>
                  </View>

                  <View style={styles.guidelinesCard}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ marginBottom: 8 }}
                    >
                      Free Talk Guidelines
                    </ThemedText>
                    <View style={styles.guidelineItem}>
                      <Ionicons
                        name="warning-outline"
                        size={16}
                        color="#F59E0B"
                      />
                      <ThemedText style={styles.guidelineText}>
                        No inappropriate conversations
                      </ThemedText>
                    </View>
                    <View style={styles.guidelineItem}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color="#F59E0B"
                      />
                      <ThemedText style={styles.guidelineText}>
                        Not intended for advice
                      </ThemedText>
                    </View>
                    <View style={styles.guidelineItem}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={16}
                        color="#F59E0B"
                      />
                      <ThemedText style={styles.guidelineText}>
                        Don't share sensitive information
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.sectionHeader}
                    >
                      Goal
                    </ThemedText>
                    <View
                      style={[
                        styles.goalCard,
                        { borderColor: Colors.borderColor },
                      ]}
                    >
                      <ThemedText type="defaultSemiBold">
                        {selectedScenario?.goal}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.sectionHeader}
                    >
                      Tasks
                    </ThemedText>
                    {selectedScenario?.tasks.map((task, index) => (
                      <View
                        key={index}
                        style={[
                          styles.taskCard,
                          {
                            borderColor: Colors.borderColor,
                          },
                        ]}
                      >
                        <Ionicons
                          size={20}
                          color={Colors.subduedTextColor}
                          name="checkmark-circle-outline"
                        />
                        <ThemedText>{task}</ThemedText>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.phrasebookButton,
                      { backgroundColor: Colors.light.text + "10" },
                    ]}
                    onPress={() => {
                      const entries = selectedScenario?.phrasebook ?? [];
                      if (!entries.length) {
                        toast.error("No phrasebook available", {
                          description:
                            "This scenario doesn't have phrasebook entries yet.",
                        });
                        return;
                      }
                      setIsPhrasebookOpen(true);
                    }}
                  >
                    <Ionicons
                      name="book-outline"
                      size={20}
                      color={Colors.primaryAccentColor}
                    />
                    <ThemedText
                      style={{
                        color: Colors.primaryAccentColor,
                        fontWeight: "600",
                      }}
                    >
                      View Phrasebook
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            {!isPhrasebookOpen && (
              <View
                style={[styles.footer, { borderTopColor: Colors.borderColor }]}
              >
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    { backgroundColor: Colors.primaryAccentColor },
                  ]}
                  onPress={handleStartConversation}
                >
                  <ThemedText style={styles.startButtonText}>Start</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Custom Conversation Modal */}
      <Modal
        visible={isCreatingCustom}
        animationType="slide"
        presentationStyle={isGeneratingScenario ? "fullScreen" : "pageSheet"}
        onRequestClose={() => {
          if (isGeneratingScenario) return;
          setIsCreatingCustom(false);
        }}
      >
        <View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1 }}
              keyboardVerticalOffset={0}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    if (isGeneratingScenario) return;
                    setIsCreatingCustom(false);
                  }}
                  disabled={isGeneratingScenario}
                  style={[
                    styles.backButton,
                    isGeneratingScenario && {
                      opacity: 0.4,
                    },
                  ]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={Colors.light.text}
                  />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold">Create</ThemedText>
                <View style={{ width: 40 }}></View>
              </View>

              <ScrollView
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <ThemedText
                  style={{ color: Colors.subduedTextColor, marginBottom: 20 }}
                >
                  Fill out each role and describe in detail the scene and the
                  conversation you want to have.
                </ThemedText>

                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputContainer,
                      { borderColor: Colors.borderColor },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={Colors.subduedTextColor}
                    />
                    <TextInput
                      style={[styles.input, { color: Colors.light.text }]}
                      placeholder="My role"
                      placeholderTextColor={Colors.subduedTextColor}
                      value={customMyRole}
                      onChangeText={setCustomMyRole}
                    />
                  </View>
                  <View
                    style={[
                      styles.inputContainer,
                      { borderColor: Colors.borderColor },
                    ]}
                  >
                    <Ionicons
                      name="happy-outline"
                      size={20}
                      color={Colors.subduedTextColor}
                    />
                    <TextInput
                      style={[styles.input, { color: Colors.light.text }]}
                      placeholder="AI's role"
                      placeholderTextColor={Colors.subduedTextColor}
                      value={customAiRole}
                      onChangeText={setCustomAiRole}
                    />
                  </View>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: Colors.borderColor,
                        height: 120,
                        alignItems: "flex-start",
                        paddingTop: 16,
                      },
                    ]}
                  >
                    <Ionicons
                      name="image-outline"
                      size={20}
                      color={Colors.subduedTextColor}
                      style={{ marginTop: 5 }}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: Colors.light.text,
                          height: "100%",
                          textAlignVertical: "top",
                        },
                      ]}
                      placeholder="Set the scene and the chat topic here"
                      placeholderTextColor={Colors.subduedTextColor}
                      value={customScene}
                      multiline
                      onChangeText={setCustomScene}
                    />
                  </View>
                </View>
              </ScrollView>

              <View
                style={[styles.footer, { borderTopColor: Colors.borderColor }]}
              >
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    {
                      backgroundColor: Colors.primaryAccentColor,
                      opacity: customScene && !isGeneratingScenario ? 1 : 0.5,
                    },
                  ]}
                  disabled={!customScene || isGeneratingScenario}
                  onPress={handleStartCustomConversation}
                >
                  <ThemedText style={styles.startButtonText}>
                    {isGeneratingScenario ? "Generating..." : "Start chatting"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>

      <Paywall
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingBottom: 115,
    paddingTop: 20,
  },
  premiumBanner: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumContent: {
    alignItems: "center",
  },
  premiumTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  premiumSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  premiumButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  premiumButtonText: {
    color: "#2563EB",
    fontWeight: "bold",
  },
  freeTalkCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  freeTalkContent: {
    flex: 1,
    paddingRight: 16,
  },
  crystalBallContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  scenarioCard: {
    width: "47%",
    maxWidth: 200,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  freeBadge: {
    backgroundColor: "#2563EB",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  freeBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  lockBadge: {
    alignSelf: "flex-start",
    padding: 4,
  },
  scenarioTitle: {
    fontSize: 20,
  },
  scenarioIconContainer: {
    alignSelf: "flex-end",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  modalContent: {
    padding: 24,
  },
  modalIconContainer: {
    alignSelf: "center",
    marginBottom: 24,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 8,
    fontSize: 18,
  },
  guidelinesCard: {
    backgroundColor: "#FFFBEB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  guidelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  guidelineText: {
    fontSize: 13,
    color: "#92400E",
    flex: 1,
  },
  goalCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  phrasebookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  phraseRow: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  phraseZh: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  startButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputGroup: {
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
