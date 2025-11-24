import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";

const OFFLINE_USER_KEY = "offlineUserId";

export function useAuthProvider() {
    const { isLoaded: ClerkLoaded, isSignedIn: ClerkSignedIn, userId: ClerkUserId } = useAuth();

    const [isLoaded, setIsLoaded] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [offlineMode, setOfflineMode] = useState(false);

    const offlineLock = useRef(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(async (state) => {
            const online = !!(state.isConnected && (state.isInternetReachable ?? true));

            if (!online) {
                offlineLock.current = true;
                setOfflineMode(true);

                try {
                    const saved = await AsyncStorage.getItem(OFFLINE_USER_KEY);

                    setIsLoaded(true);
                    setIsSignedIn(!!saved);
                    setUserId(saved);
                } catch {
                    setIsLoaded(true);
                    setIsSignedIn(false);
                    setUserId(null);
                }

                return;
            }

            offlineLock.current = false;
            setOfflineMode(false);

            if (ClerkLoaded) {
                setIsLoaded(true);
                setIsSignedIn(!!ClerkSignedIn);
                setUserId(ClerkUserId ?? null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (offlineLock.current) return;

        if (ClerkLoaded) {
            setIsLoaded(true);
            setIsSignedIn(!!ClerkSignedIn);
            setUserId(ClerkUserId ?? null);
        }
    }, [ClerkLoaded, ClerkSignedIn, ClerkUserId]);

    return { isLoaded, isSignedIn, userId, offlineMode };
}