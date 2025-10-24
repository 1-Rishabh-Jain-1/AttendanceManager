import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";


export default function ClerkAndConvexProvider({children}: {children: React.ReactNode}) {
    const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string);
    return (
        <ClerkProvider tokenCache={tokenCache}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <ClerkLoaded>
                    {children}
                </ClerkLoaded>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}