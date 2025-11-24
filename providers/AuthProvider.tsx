import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

const OFFLINE_USER_KEY = "userId";
export function AuthProvider() {
    const clerk = useAuth();
    const { isLoaded: ClerkLoaded, isSignedIn: ClerkSignedIn, userId: ClerkUserId } = clerk;

    const [isLoaded, setIsLoaded] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        let unsub: (() => void) | null = null;
        NetInfo.fetch().then(state => {
            const online = !!(state.isConnected && (state.isInternetReachable ?? true));
            if (online) {
                if (ClerkLoaded) {
                    setIsLoaded(true);
                    setIsSignedIn(!!ClerkSignedIn);
                    setUserId(ClerkUserId ?? null);
                } else {
                    setIsLoaded(false);
                }
            } else {
                AsyncStorage.getItem(OFFLINE_USER_KEY).then(saved => {
                    setIsLoaded(true);
                    setIsSignedIn(!!saved);
                    setUserId(saved);
                }).catch(() => {
                    setIsLoaded(true);
                    setIsSignedIn(false);
                    setUserId(null);
                });
            }
        });

        unsub = NetInfo.addEventListener(state => {
            const online = !!(state.isConnected && (state.isInternetReachable ?? true));
            if (online) {
                if (ClerkLoaded) {
                    setIsLoaded(true);
                    setIsSignedIn(!!ClerkSignedIn);
                    setUserId(ClerkUserId ?? null);
                } else {
                    setIsLoaded(false);
                }
            } else {
                AsyncStorage.getItem(OFFLINE_USER_KEY).then(saved => {
                    setIsLoaded(true);
                    setIsSignedIn(!!saved);
                    setUserId(saved);
                }).catch(() => {
                    setIsLoaded(true);
                    setIsSignedIn(false);
                    setUserId(null);
                });
            }
        });
        return () => {
            if (unsub) unsub();
        };
    }, [ClerkLoaded, ClerkSignedIn, ClerkUserId]);

    return { isLoaded, isSignedIn, userId, clerk };
};