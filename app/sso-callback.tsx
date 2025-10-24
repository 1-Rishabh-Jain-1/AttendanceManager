import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function SSOCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        router.replace("/");
      } catch (err) {
        console.log("SSO callback error:", err);
      }
    })();
  }, []);

  return null;
}