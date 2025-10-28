import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/home.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
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
  const [professor, setProfessor] = useState("");
  const [type, setType] = useState<"Theory" | "Practical">("Theory");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    if (!convexUser || !subjectName || !professor) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await createSubject({
        userId: convexUser._id,
        subjectName,
        professor,
        lecturesAttended: 0,
        lecturesTotal: 0,
        type,
        description,
      });

      Alert.alert("Success", "Subject added successfully!");
      setModalVisible(false);
      setSubjectName("");
      setProfessor("");
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
          const attended = item.lecturesAttended ?? 0;
          const total = item.lecturesTotal ?? 0;
          const attendance = calculateAttendance(attended, total);

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/subjectCalendar",
                  params: { subjectId: item._id },
                })
              }
              style={styles.card}
            >
              <Text style={styles.subjectName}>{item.subjectName}</Text>
              <Text style={styles.professor}>{item.professor}</Text>
              <Text style={styles.attendance}>Attendance: {attendance}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
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
            <TextInput
              style={styles.input}
              placeholder="Professor Name"
              placeholderTextColor={COLORS.grey}
              value={professor}
              onChangeText={setProfessor}
            />

            <Dropdown
              style={styles.dropdown}
              containerStyle={styles.dropdownContainer}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              data={dropdownData}
              labelField="label"
              valueField="value"
              placeholder="Select Type"
              value={type}
              onChange={(item) => setType(item.value as "Theory" | "Practical")}
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

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}