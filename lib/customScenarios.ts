import { ConversationScenario } from "@/constants/CourseData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

const STATS_KEY = "custom_scenarios";

type StoredCustomScenario = {
  scenario: ConversationScenario;
  createdAt: string;
};

type StorageType = Record<string, StoredCustomScenario>;

const readStorage = async (): Promise<StorageType> => {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as StorageType;
  } catch {
    return {};
  }
};

const writeStorage = async (data: StorageType) => {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(data));
};

export const createCustomScenarioId = () => `custom_${uuid.v4()}`;

export const saveCustomScenario = async (scenario: ConversationScenario) => {
  const store = await readStorage();
  store[scenario.id] = { scenario, createdAt: new Date().toISOString() };
  await writeStorage(store);
};

export const getCustomScenario = async (
  id: string,
): Promise<ConversationScenario | null> => {
  const store = await readStorage();
  return store[id]?.scenario ?? null;
};

export const listCustomScenarios = async (): Promise<
  ConversationScenario[]
> => {
  const store = await readStorage();
  return Object.values(store)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((x) => x.scenario);
};
