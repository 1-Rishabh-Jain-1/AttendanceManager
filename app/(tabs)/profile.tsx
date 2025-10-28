import { COLORS } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { styles } from '@/styles/profile.styles';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import * as Linking from 'expo-linking';
import React from 'react';
import { Image, Text, View } from 'react-native';

export default function Profile() {
  const { userId } = useAuth();
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      Linking.openURL(Linking.createURL('/'));
    } catch (err) {
      console.error(err);
    }
  };

  if (!convexUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoutContainer}>
        <Ionicons
          name="log-out-outline"
          onPress={handleSignOut}
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center', top: 50 }}>
        <Image
          source={{ uri: convexUser.profilePicture ?? "" }}
          style={styles.profilePic}
        />
        <Text style={{ color: COLORS.white, fontSize: 20, fontWeight: 'bold', marginTop: 10}}>
          {convexUser.fullname}
        </Text>
        <Text style={{ color: COLORS.grey, marginBottom: 30, marginTop: 10 }}>{convexUser.email}</Text>

      </View>
    </View>
  );
}
