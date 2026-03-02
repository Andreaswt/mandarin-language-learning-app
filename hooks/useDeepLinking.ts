import { supabase } from "@/utils/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { toast } from "sonner-native";

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    console.error("Deep link error:", errorCode);
    throw new Error(errorCode);
  }

  const { access_token, refresh_token } = params;

  if (!access_token) {
    return;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    console.error("Session error:", error);
    throw error;
  }

  return data.session;
};

export const useDeepLinking = () => {
  const url = Linking.useLinkingURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url)
        .then((session) => {
          if (session) {
            console.log("Session created from deep link");
          }
        })
        .catch((error) => {
          console.error("Error creating session from URL:", error);
          toast.error("Failed to sign in. Please try again.");
        });
    }
  }, [url]);
};
