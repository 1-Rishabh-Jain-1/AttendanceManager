import { COLORS } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { styles } from '@/styles/profile.styles';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export default function Profile() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectType, setSubjectType] = useState<"Theory" | "Practical">("Theory");
  const [description, setDescription] = useState("");

  const { userId } = useAuth();
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : 'skip'
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

  const subjects = useQuery(
    api.subjects.getSubjectsByUserId,
    convexUser ? { userId: convexUser?._id } : 'skip'
  );

  const updateSubject = useMutation(api.subjects.updateSubject);
  const deleteSubject = useMutation(api.subjects.deleteSubject);

  const calculateAttendance = (attended: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((attended / total) * 100)}%`;
  };

  const handleSubjectTuplePress = (subject: any) => {
    setSelectedSubject(subject);
    setSubjectName(subject.subjectName);
    setSubjectType(subject.type);
    setDescription(subject.description);
    setModalVisible(true);
  };

  const handleUpdateSubject = async () => {
  if (!subjectName.trim()) {
    Alert.alert("Missing Name", "Please enter a subject name");
    return;
  }
  try {
    await updateSubject({
      subjectId: selectedSubject._id,
      subjectName,
      type: subjectType,
    });
    setModalVisible(false);
    setSelectedSubject(null);
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Failed to update subject");
  }
};

const handleDeleteSubject = async () => {
  try {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSubject({ subjectId: selectedSubject._id });
              setModalVisible(false);
              setSelectedSubject(null);
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete subject");
            }
          },
        },
      ]
    );
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Failed to delete subject");
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

      <View style={{ alignItems: 'center', marginTop: 50, marginBottom: 30 }}>
        <Image
          source={{ uri: convexUser.profilePicture ?? '' }}
          style={styles.profilePic}
        />
        <Text
          style={{
            color: COLORS.white,
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 10,
          }}
        >
          {convexUser.fullname}
        </Text>
        <Text style={{ color: COLORS.grey, marginTop: 8 }}>
          {convexUser.email}
        </Text>
      </View>

      <FlatList
        contentContainerStyle={{ paddingBottom: 40 }}
        style={styles.subjectList}
        data={subjects}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const attended = item.hoursAttended ?? 0;
          const total = item.hoursTotal ?? 0;
          const attendance = calculateAttendance(attended, total);

          return (
            <TouchableOpacity
              onPress={() => handleSubjectTuplePress(item)}
              style={styles.card}
            >
              <Text style={styles.subjectName}>{item.subjectName}</Text>
              <Text style={styles.attendance}>Attendance: {attendance}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Subject Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Update or Delete Subject
                </Text>
              </View>

              <Text style={styles.modalSubtitle}>Subject Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter subject name"
                placeholderTextColor={COLORS.grey}
                value={subjectName}
                maxLength={50}
                onChangeText={setSubjectName}
              />

              <Text style={styles.modalSubtitle}>Type</Text>
              <Dropdown
                style={styles.input}
                data={[
                  { label: 'Theory', value: 'Theory' },
                  { label: 'Practical', value: 'Practical' },
                ]}
                labelField="label"
                valueField="value"
                value={subjectType}
                placeholder="Select type"
                placeholderStyle={{ color: COLORS.grey }}
                selectedTextStyle={{ color: COLORS.white }}
                onChange={(item) => setSubjectType(item.value)}
              />

              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Description (optional)"
                placeholderTextColor={COLORS.grey}
                value={description}
                maxLength={500}
                onChangeText={setDescription}
                multiline
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateSubject}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteSubject}
              >
                <Text style={styles.buttonText}>Delete Subject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}