import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/subjectCalendar.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function SubjectCalendar() {
    const { subjectId } = useLocalSearchParams<{ subjectId: string; }>();

    const subject = useQuery(
        api.subjects.getSubjectById,
        subjectId ? { subjectId: subjectId as Id<"subjects"> } : "skip"
    );

    const subjectName = subject?.subjectName ? subject?.subjectName : " ";

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [hoursTotal, setHoursTotal] = useState("");
    const [hoursAttended, setHoursAttended] = useState("");
    const [note, setNote] = useState("");
    const [professor, setProfessor] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const lecture = useQuery(
        api.lectures.getLectureByDate,
        selectedDate && subjectId
            ? { subjectId: subjectId as Id<"subjects">, date: selectedDate }
            : "skip"
    );

    const saveLecture = useMutation(api.lectures.createOrUpdateLecture);
    const deleteLecture = useMutation(api.lectures.deleteLecture);

    useEffect(() => {
        if (loading && selectedDate) {
            setLoading(false);
            setModalVisible(true);
        }

        if (lecture) {
            setProfessor(String(lecture.professor));
            setHoursTotal(String(lecture.hoursTotal));
            setHoursAttended(String(lecture.hoursAttended));
            setNote(lecture.note ?? "");
        } else {
            setProfessor("");
            setHoursTotal("");
            setHoursAttended("");
            setNote("");
        }
    }, [lecture]);

    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
        setLoading(true);
    };

    const handleSave = async () => {
        if (!selectedDate || !subjectId || Number(hoursTotal) === 0) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        try {
            await saveLecture({
                subjectId: subjectId as Id<"subjects">,
                date: selectedDate,
                professor: professor,
                hoursTotal: Number(hoursTotal),
                hoursAttended: Number(hoursAttended),
                note,
            });
            Alert.alert("Success", "Lecture data saved!");
            setModalVisible(false);
            setSelectedDate(null);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to save lecture");
        }
    };

    const handleDelete = async () => {
        if (!lecture) {
            setModalVisible(false);
            setSelectedDate(null);
            return;
        }

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
                            await deleteLecture({ lectureId: lecture._id });
                            Alert.alert("Deleted", "Lecture record removed successfully");
                            setModalVisible(false);
                            setSelectedDate(null);
                        } catch (err) {
                            console.error(err);
                            Alert.alert("Error", "Failed to delete lecture");
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace("/")}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>

                <Text style={styles.title}>{subjectName}</Text>
            </View>

            <Calendar
                onDayPress={handleDayPress}
                markedDates={
                    selectedDate
                        ? { [selectedDate]: { selected: true, selectedColor: COLORS.primary } }
                        : {}
                }
                theme={{
                    calendarBackground: COLORS.surface,
                    dayTextColor: COLORS.white,
                    monthTextColor: COLORS.white,
                    arrowColor: COLORS.white,
                    textDisabledColor: "rgba(255, 255, 255, 0.3)",
                }}
            />

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

            {/* Lecture Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {lecture ? "Update Lecture" : "Add Lecture"} :– {selectedDate}
                                </Text>
                            </View>

                            <Text style={styles.modalSubtitle}>Total Hours</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Total Lectures"
                                placeholderTextColor={COLORS.grey}
                                keyboardType="numeric"
                                value={hoursTotal}
                                onChangeText={setHoursTotal}
                            />

                            <Text style={styles.modalSubtitle}>Hours Attended</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Lectures Attended"
                                placeholderTextColor={COLORS.grey}
                                keyboardType="numeric"
                                value={hoursAttended}
                                onChangeText={setHoursAttended}
                            />

                            <Text style={styles.modalSubtitle}>Professor</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="(Optional)"
                                placeholderTextColor={COLORS.grey}
                                value={professor}
                                onChangeText={setProfessor}
                            />

                            <Text style={styles.modalSubtitle}>Note</Text>
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                placeholder="(Optional)"
                                placeholderTextColor={COLORS.grey}
                                multiline
                                value={note}
                                onChangeText={setNote}
                            />

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.buttonText}>Save Lecture</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                <Text style={styles.buttonText}>Delete Lecture</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedDate(null);
                                    setModalVisible(false);
                                }}
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