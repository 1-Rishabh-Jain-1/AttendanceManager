import { api } from '@/convex/_generated/api';
import { styles } from '@/styles/profile.styles';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import * as Linking from 'expo-linking';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={{ flex: 1, alignItems: 'center', paddingTop: 50 }}>
      <Image
        source={{ uri: convexUser.profilePicture ?? "" }}
        style={styles.profilePic}
      />
      <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
        {convexUser.fullname}
      </Text>
      <Text style={{ color: 'gray', marginBottom: 30 }}>{convexUser.email}</Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleSignOut}>
        <Text style={{ color: 'white', fontWeight: '600' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
