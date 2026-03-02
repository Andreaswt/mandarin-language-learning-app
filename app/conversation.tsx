import ConversationMode from "@/components/conversation/ConversationMode";
import { ConversationScenario, COURSE_DATA } from "@/constants/CourseData";
import { getCustomScenario } from "@/lib/customScenarios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default function ConversationScreen() {
  const params = useLocalSearchParams<{
    scenarioId?: string | string[];
    customScenarioId?: string | string[];
  }>();

  const scenarioId = firstParam(params.scenarioId);
  const customScenarioId = firstParam(params.customScenarioId);

  const presetScenario = useMemo(() => {
    if (!scenarioId) return null;

    return COURSE_DATA.scenarios.find((s) => s.id === scenarioId) ?? null;
  }, [scenarioId]);

  const [customScenario, setCustomScenario] =
    useState<ConversationScenario | null>(null);
  const [isLoadingScenario, setIsLoadingScenario] = useState(false);

  useEffect(() => {
    if (!customScenarioId) {
      setCustomScenario(null);
      setIsLoadingScenario(false);
      return;
    }

    let cancelled = false;
    setCustomScenario(null);
    setIsLoadingScenario(true);

    (async () => {
      const scenario = await getCustomScenario(customScenarioId);
      if (cancelled) return;
      setCustomScenario(scenario);
      setIsLoadingScenario(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [customScenarioId]);

  const scenario = presetScenario ?? customScenario;

  if (isLoadingScenario || !scenario) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return <ConversationMode scenario={scenario} onExit={() => router.back()} />;
}
