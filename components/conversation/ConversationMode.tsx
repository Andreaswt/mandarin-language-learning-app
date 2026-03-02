import { ConversationScenario } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { recordConversationTurn } from "@/lib/speakingListeningStats";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio, InterruptionModeIOS } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { ThemedText } from "../themed-text";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  hanzi?: string;
  pinyin?: string;
  english?: string;
}

export default function ConversationMode({
  scenario,
  onExit,
}: {
  scenario: ConversationScenario;
  onExit: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [showPinyin, setShowPinyin] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const [conversationComplete, setConversationComplete] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const lastSpokenAssistantMessageId = useRef<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      text: "你好！",
      hanzi: "你好！",
      pinyin: "Nǐ hǎo!",
      english: "Hello!",
    },
  ]);

  const confettiRef = useRef<any>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      Speech.stop();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handlePlayAudio = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "zh-CN" });
  };

  const callChatCompletion = async (params: {
    messageList: Message[];
    inputAudio?: { data: string; format: string };
  }) => {
    const { data, error } = await supabase.functions.invoke("chat-completion", {
      body: {
        messages: params.messageList.map((m) => ({
          role: m.role,
          content: m.text,
        })),
        scenario,
        inputAudio: params.inputAudio,
      },
    });

    if (error) {
      console.error("Error calling chat-completion:", error);
      return null;
    }
    return data;
  };

  const handleAssistantData = (
    data: any,
    options?: { replaceUserMessageId?: string },
  ) => {
    if (!data) return;

    setMessages((prev) => {
      let newMessages = [...prev];

      // Replace placeholder if needed
      if (
        options?.replaceUserMessageId &&
        typeof data.userTranscript === "string" &&
        data.userTranscript.trim()
      ) {
        const transcript = data.userTranscript.trim();
        const transcriptPinyin =
          typeof data.userTranscriptPinyin === "string"
            ? data.userTranscriptPinyin.trim()
            : undefined;

        newMessages = newMessages.map((m) =>
          m.id === options.replaceUserMessageId
            ? {
                ...m,
                text: transcript,
                hanzi: transcript,
                pinyin: transcriptPinyin || m.pinyin,
              }
            : m,
        );
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.text || data.hanzi,
        hanzi: data.hanzi,
        pinyin: data.pinyin,
        english: data.english,
      };

      return [...newMessages, aiResponse];
    });

    if (data.conversationComplete) {
      setTimeout(() => {
        setConversationComplete(true);
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
      }, 1000);
    }
  };

  const handleRecordToggle = async () => {
    if (isLoading) return;

    if (!isRecording) {
      try {
        Speech.stop();

        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) {
          toast.error("Microphone Permission", {
            description: "Microphone access is required to practise speaking.",
          });
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          staysActiveInBackground: true,
        });

        const preset = Audio.RecordingOptionsPresets.HIGH_QUALITY;
        const { recording } = await Audio.Recording.createAsync({
          ...preset,
          ios: {
            ...preset.ios,
            extension: ".wav",
            audioQuality: Audio.IOSAudioQuality.MAX,
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          },
          android: {
            ...preset.android,
            extension: ".wav",
            outputFormat: Audio.AndroidOutputFormat.DEFAULT,
            audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          },
        });

        recordingRef.current = recording;
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start recording:", err);
        recordingRef.current = null;
        setIsRecording(false);
        toast.error("Recording Error", {
          description: "Could not start recording.",
        });
      }
      return;
    }

    // Stop + send audio
    try {
      const recording = recordingRef.current;
      if (!recording) {
        setIsRecording(false);
        return;
      }
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) {
        setIsLoading(false);
        toast.error("Recording Error", {
          description: "No audio was recorded.",
        });
        return;
      }

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const voiceMessageId = Date.now().toString();
      setMessages((prev) => [
        ...prev,
        { id: voiceMessageId, role: "user", text: "Voice message" },
      ]);
      setIsLoading(true);

      const data = await callChatCompletion({
        messageList: messages,
        inputAudio: {
          data: base64Audio,
          format: "wav",
        },
      });
      handleAssistantData(data, { replaceUserMessageId: voiceMessageId });
      void recordConversationTurn();
    } catch (err) {
      console.error("Failed to start/stop recording:", err);
      setIsLoading(false);
      toast.error("Recording Error", {
        description: "Could not send voice message.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const userText = inputText.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const data = await callChatCompletion({
        messageList: [...messages, newMessage],
      });
      handleAssistantData(data);
      void recordConversationTurn();
    } catch (err) {
      console.error("Message sending error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    if (lastSpokenAssistantMessageId.current === lastMessage.id) return;
    lastSpokenAssistantMessageId.current = lastMessage.id;

    const speechText = lastMessage.hanzi || lastMessage.text;
    if (!speechText) return;

    const timeoutId = setTimeout(() => {
      handlePlayAudio(speechText);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.light.background }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top,
              borderBottomColor: Colors.light.icon + "20",
            },
          ]}
        >
          <TouchableOpacity onPress={onExit} style={styles.backButton}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText type="defaultSemiBold">{scenario.title}</ThemedText>
            <ThemedText
              style={{ fontSize: 12, color: Colors.subduedTextColor }}
            >
              Goal {scenario.goal}
            </ThemedText>
          </View>
          <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
            <TouchableOpacity onPress={() => setShowPinyin(!showPinyin)}>
              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: Colors.primaryAccentColor,
                }}
              >
                {showPinyin ? "拼" : "汉"}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsBlurred(!isBlurred)}>
              <Ionicons
                size={24}
                color={Colors.light.text}
                name={isBlurred ? "eye-off" : "eye"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat area */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContainer}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            let content = msg.text;

            if (showPinyin) {
              content = msg.pinyin || msg.text;
            } else {
              content = msg.hanzi || msg.text;
            }

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  isUser
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: Colors.primaryAccentColor,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: Colors.light.text + "10",
                      },
                ]}
              >
                <ThemedText
                  style={{
                    color: isUser
                      ? "white"
                      : isBlurred && !isUser
                        ? "transparent"
                        : Colors.light.text,
                    backgroundColor:
                      isBlurred && !isUser
                        ? Colors.light.text + "20"
                        : undefined,
                    borderRadius: 4,
                  }}
                >
                  {content}
                </ThemedText>
                {!isUser && (
                  <TouchableOpacity
                    style={styles.audioButton}
                    onPress={() => handlePlayAudio(msg.hanzi || msg.text)}
                  >
                    <Ionicons
                      name="volume-high"
                      size={16}
                      color={Colors.light.text}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          {isLoading && (
            <View
              style={[
                styles.messageBubble,
                {
                  alignSelf: "flex-start",
                  backgroundColor: Colors.light.text + "10",
                  minWidth: 60,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <ActivityIndicator color={Colors.light.text} size="small" />
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: insets.bottom + 10,
              borderTopColor: Colors.light.icon + "20",
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording && { backgroundColor: "#ff4444" },
            ]}
            onPress={handleRecordToggle}
          >
            <Ionicons
              size={24}
              color="white"
              name={isRecording ? "stop" : "mic"}
            />
          </TouchableOpacity>
          <View
            style={[
              styles.textInputWrapper,
              { backgroundColor: Colors.light.text + "10" },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: Colors.light.text }]}
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Conversation complete modal */}
      <Modal
        visible={conversationComplete}
        transparent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.completeModal,
              {
                backgroundColor: "#ffffff",
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.completeIconContainer}>
              <Ionicons
                name="trophy"
                size={56}
                color={Colors.primaryAccentColor}
              />
            </View>
            <ThemedText style={styles.completeTitle}>
              Conversation Complete!
            </ThemedText>
            <ThemedText style={styles.completeSubtitle}>
              Great job! You successfully completed the conversation.
            </ThemedText>
            <TouchableOpacity
              onPress={() => {
                setConversationComplete(false);
                onExit();
              }}
              style={styles.completeButton}
            >
              <ThemedText style={styles.completeButtonText}>
                Continue
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </View>

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
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerContent: {
    alignItems: "center",
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  audioButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryAccentColor,
    justifyContent: "center",
    alignItems: "center",
  },
  textInputWrapper: {
    flex: 1,
    borderRadius: 22,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryAccentColor,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  completeModal: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  completeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primaryAccentColor}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  completeSubtitle: {
    fontSize: 16,
    color: Colors.subduedTextColor,
    textAlign: "center",
    marginBottom: 32,
  },
  completeButton: {
    backgroundColor: Colors.primaryAccentColor,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  completeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
