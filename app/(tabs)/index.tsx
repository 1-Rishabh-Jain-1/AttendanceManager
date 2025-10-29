import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/index.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function Index() {
  const { userId } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const subjects = useQuery(
    api.subjects.getSubjectsByUserId,
    convexUser ? { userId: convexUser?._id } : "skip"
  );

  const createSubject = useMutation(api.subjects.createSubject);

  const [modalVisible, setModalVisible] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [type, setType] = useState<"Theory" | "Practical">("Theory");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    if (!convexUser || !subjectName) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await createSubject({
        userId: convexUser._id,
        subjectName,
        hoursAttended: 0,
        hoursTotal: 0,
        type,
        description,
      });

      Alert.alert("Success", "Subject added successfully!");
      setModalVisible(false);
      setSubjectName("");
      setType("Theory");
      setDescription("");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add subject");
    }
  };

  if (!subjects) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your subjects...</Text>
      </View>
    );
  }

  const calculateAttendance = (attended: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((attended / total) * 100)}%`;
  };

  const dropdownData = [
    { label: "Theory", value: "Theory" },
    { label: "Practical", value: "Practical" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Your Subjects</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
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
              onPress={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  router.push({
                    pathname: "/subjectCalendar",
                    params: { subjectId: item._id },
                  });
                }, 500);
              }}
              style={styles.card}
            >
              <Text style={styles.subjectName}>{item.subjectName}</Text>
              <Text style={styles.attendance}>Attendance: {attendance}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)} allowSwipeDismissal={true} >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Subject</Text>

            <TextInput
              style={styles.input}
              placeholder="Subject Name"
              placeholderTextColor={COLORS.grey}
              value={subjectName}
              onChangeText={setSubjectName}
            />

            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              itemTextStyle={styles.itemTextStyle}
              activeColor={COLORS.primary + "33"}
              data={dropdownData}
              labelField="label"
              valueField="value"
              placeholder="Select Type"
              value={type}
              onChange={(item) => setType(item.value as "Theory" | "Practical")}
              renderItem={(item) => (
                <View
                  style={[
                    styles.dropdownItem,
                    item.value === type && styles.dropdownItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.itemTextStyle,
                      item.value === type && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              )}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={18} color={COLORS.grey} />
              )}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description (optional)"
              placeholderTextColor={COLORS.grey}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Loader */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loaderContainer}>
          <Image
            source={require("@/assets/loader.gif")}
            style={styles.loaderGif}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}