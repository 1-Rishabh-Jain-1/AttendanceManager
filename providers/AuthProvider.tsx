import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

const OFFLINE_USER_KEY = "offlineUserId";

export function useAuthProvider() {
    const { isLoaded: ClerkLoaded, isSignedIn: ClerkSignedIn, userId: ClerkUserId } = useAuth();

    const [isLoaded, setIsLoaded] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [offlineMode, setOfflineMode] = useState(false);

    useEffect(() => {
        let unsub = NetInfo.addEventListener(async state => {
            const online = !!(state.isConnected && (state.isInternetReachable ?? true));

            if (!online) {
                setOfflineMode(true);

                try {
                    const saved = await AsyncStorage.getItem(OFFLINE_USER_KEY);

                    setIsLoaded(true);
                    setIsSignedIn(!!saved);
                    setUserId(saved);
                } catch {
                    setIsLoaded(true);
                    setIsSignedIn(false);
                }

                return;
            }

            setOfflineMode(false);

            if (ClerkLoaded) {
                setIsLoaded(true);
                setIsSignedIn(!!ClerkSignedIn);
                setUserId(ClerkUserId ?? null);
            }
        });

        return () => unsub();
    }, [ClerkLoaded, ClerkSignedIn, ClerkUserId]);

    return { isLoaded, isSignedIn, userId, offlineMode };
}