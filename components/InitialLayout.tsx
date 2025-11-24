import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthProvider } from "../providers/AuthProvider";

export default function InitialLayout() {
    const { isLoaded, isSignedIn } = useAuthProvider();
    const segments = useSegments() || [];
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;

        const inAuthScreen = segments.length > 0 && segments[0] === "(auth)";

        if (!isSignedIn && !inAuthScreen) {
            router.replace("/(auth)/login");
        } else if (isSignedIn && inAuthScreen) {
            router.replace("/(tabs)");
        }
    }, [isLoaded, isSignedIn, segments]);

    if (!isLoaded) return null;

    return <Stack screenOptions={{ headerShown: false }} />;
}