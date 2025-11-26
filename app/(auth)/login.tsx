import { COLORS } from '@/constants/theme';
import { styles } from '@/styles/auth.styles';
import { useAuth, useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const OFFLINE_USER_KEY = "offlineUserId";

export default function login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const { userId } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      const {createdSessionId, setActive} = await startSSOFlow({strategy: 'oauth_google'});
      if (setActive && createdSessionId) {
        await setActive({session: createdSessionId});

        if (userId) {
          await AsyncStorage.setItem(OFFLINE_USER_KEY, userId);
          console.log(AsyncStorage.getItem(OFFLINE_USER_KEY));
        }
        
        router.replace("/(tabs)");
        // const checkUserLoaded = setInterval(async () => {
        //   if (userId && user.id) {
        //     clearInterval(checkUserLoaded);
        //     await AsyncStorage.setItem(OFFLINE_USER_KEY, user.id);
        //     console.log(AsyncStorage.getItem(OFFLINE_USER_KEY));
            
        //     router.replace("/(tabs)");
        //   }
        // }, 300);
      }
    } catch (error) {
      console.log("Error: " + error);
    }
  }

  return (
    <View style={styles.container}>
      {/* BRAND SECTION */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name='leaf' size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>Attendance Manager</Text>
        <Text style={styles.tagline}>Track your attendance with ease</Text>
      </View>
      {/* ILLUSTRATION */}
      <View style={styles.illustrationContainer}>
        <Image
          source={{uri: "https://drive.google.com/file/d/17gU8qsQ4H4J7VGJwi_SXwW8tMF7cR5WC/view?usp=sharing"}}
          style={styles.illustration}
          resizeMode='cover'
        />
      </View>
      {/* LOGIN SECTION */}
      <View style={styles.loginSection}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          activeOpacity={0.9}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name='logo-google' size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By continuing, you agree to the Terms and Privacy Policy
        </Text>
      </View>
    </View>
  )
}