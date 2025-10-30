import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/subjectCalendar.styles";
import { Ionicons } from "@expo/vector-icons";
import { useConvex, useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function SubjectCalendar() {
    const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
    const convex = useConvex();
    const subject = useQuery(
        api.subjects.getSubjectById,
        subjectId ? { subjectId: subjectId as Id<"subjects"> } : "skip"
    );
    const subjectName = subject?.subjectName || " ";
    const subjectType = subject?.type ?? "Theory";
    const subjectHoursAttended = subject?.hoursAttended ?? 0;
    const subjectHoursTotal = subject?.hoursTotal ?? 0;
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [hoursTotal, setHoursTotal] = useState("");
    const [hoursAttended, setHoursAttended] = useState("");
    const [note, setNote] = useState("");
    const [professor, setProfessor] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [monthCache, setMonthCache] = useState<Record<string, any[]>>({});

    const calculateAttendanceAllowance = (hoursAttended: number, hoursTotal: number, type: string) => {
        if (!hoursTotal || hoursTotal === 0) {
            return { message: "No attendance data yet", hours: 0, status: "neutral" };
        }

        const minReq = type === "Practical" ? 0.8 : 0.75;
        const percent = (hoursAttended / hoursTotal) * 100;

        if (percent < minReq * 100) {
            const needed = Math.ceil((minReq * hoursTotal - hoursAttended) / (1 - minReq));
            return {
                message: `📉 You need to attend ${needed} more hour${needed > 1 ? "s" : ""} to reach ${minReq * 100}%`,
                hours: needed,
                status: "below",
            };
        } else {
            const canMiss = Math.floor((hoursAttended - minReq * hoursTotal) / minReq);
            return {
                message: `📈 You can skip ${canMiss} hour${canMiss !== 1 ? "s" : ""} and still maintain ${minReq * 100}%`,
                hours: canMiss,
                status: "above",
            };
        }
    };

    const { message: attendanceMessage, status: attendanceStatus } = useMemo(() =>
        calculateAttendanceAllowance(subjectHoursAttended, subjectHoursTotal, subjectType),
        [subjectHoursAttended, subjectHoursTotal, subjectType]
    );

    const keyFor = (y: number, m: number) => `${y}-${m}`;

    const fetchMonth = async (y: number, m: number, force = false) => {
        const key = keyFor(y, m);
        if (!force && monthCache[key]) return monthCache[key];

        try {
            const res = await convex.query(api.lectures.getLecturesByMonth, {
                subjectId: subjectId as Id<"subjects">,
                year: y,
                month: m,
            });
            setMonthCache((prev) => ({ ...prev, [key]: res || [] }));
            return res || [];
        } catch (err) {
            console.error("fetchMonth error", err);
            setMonthCache((prev) => ({ ...prev, [key]: [] }));
            return [];
        }
    };

    useEffect(() => {
        let cancelled = false;

        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        const doPrefetch = async () => {
            if (!subjectId) return;
            setLoading(true);

            const wantKeys = [keyFor(prevYear, prevMonth), keyFor(currentYear, currentMonth), keyFor(nextYear, nextMonth)];
            const missing = wantKeys.filter((k) => !monthCache[k]);

            try {
                await Promise.all(
                    missing.map(async (k) => {
                        if (cancelled) return;
                        const [yStr, mStr] = k.split("-");
                        const y = Number(yStr);
                        const m = Number(mStr);
                        try {
                            const data = await convex.query(api.lectures.getLecturesByMonth, {
                                subjectId: subjectId as Id<"subjects">,
                                year: y,
                                month: m,
                            });
                            if (cancelled) return;
                            setMonthCache((prev) => ({ ...prev, [k]: data || [] }));
                        } catch (e) {
                            console.error("prefetch month error", e);
                            if (cancelled) return;
                            setMonthCache((prev) => ({ ...prev, [k]: [] }));
                        }
                    })
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        const allPresent = [keyFor(prevYear, prevMonth), keyFor(currentYear, currentMonth), keyFor(nextYear, nextMonth)].every(
            (k) => !!monthCache[k]
        );

        if (allPresent) {
            setLoading(false);
        } else {
            doPrefetch();
        }

        return () => {
            cancelled = true;
        };
    }, [subjectId, currentMonth, currentYear]);

    const lecture = useQuery(
        api.lectures.getLectureByDate,
        selectedDate && subjectId
            ? { subjectId: subjectId as Id<"subjects">, date: selectedDate }
            : "skip"
    );

    const saveLecture = useMutation(api.lectures.createOrUpdateLecture);
    const deleteLecture = useMutation(api.lectures.deleteLecture);

    useEffect(() => {
        if (lecture) {
            setProfessor(String(lecture.professor || ""));
            setHoursTotal(String(lecture.hoursTotal ?? ""));
            setHoursAttended(String(lecture.hoursAttended ?? ""));
            setNote(lecture.note ?? "");
        } else {
            setProfessor("");
            setHoursTotal("");
            setHoursAttended("");
            setNote("");
        }

        if (selectedDate) {
            setLoading(false);
            setModalVisible(true);
        }
    }, [lecture]);

    useEffect(() => {
        return () => {
            setLoading(false);
            setModalVisible(false);
            setSelectedDate(null);
        };
    }, []);

    const handleDayPress = async (day: any) => {
        setSelectedDate(day.dateString);
        setLoading(true);
    };

    const handleMonthChange = (monthObj: any) => {
        setLoading(true);
        setCurrentMonth(monthObj.month);
        setCurrentYear(monthObj.year);
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
                professor,
                hoursTotal: Number(hoursTotal),
                hoursAttended: Number(hoursAttended),
                note,
            });

            const d = new Date(selectedDate);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const k = keyFor(y, m);

            const newData = await fetchMonth(y, m, true);
            setMonthCache((prev) => ({ ...prev, [k]: newData || [] }));

            setRefreshKey((x) => x + 1);

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

        Alert.alert("Confirm Delete", "Are you sure you want to delete this record?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteLecture({ lectureId: lecture._id });

                        const d = new Date(selectedDate!);
                        const y = d.getFullYear();
                        const m = d.getMonth() + 1;
                        const k = keyFor(y, m);

                        const newData = await fetchMonth(y, m, true);
                        setMonthCache((prev) => ({ ...prev, [k]: newData || [] }));

                        setRefreshKey((x) => x + 1);

                        setModalVisible(false);
                        setSelectedDate(null);

                    } catch (err) {
                        console.error(err);
                        Alert.alert("Error", "Failed to delete lecture");
                    }
                },
            },
        ]);
    };

    const todayStr = today.toISOString().split("T")[0];

    const markedDates = useMemo(() => {
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        const allLectures = [
            ...(monthCache[keyFor(prevYear, prevMonth)] || []),
            ...(monthCache[keyFor(currentYear, currentMonth)] || []),
            ...(monthCache[keyFor(nextYear, nextMonth)] || []),
        ];

        if (!allLectures.length) return {};

        const marks: Record<string, any> = {};
        allLectures.forEach((lec) => {
            const dateObj = new Date(lec.date);
            const lecMonth = dateObj.getMonth() + 1;
            const lecYear = dateObj.getFullYear();
            const isOutsideMonth = lecMonth !== currentMonth || lecYear !== currentYear;

            const color =
                lec.hoursTotal > 0 && lec.hoursAttended === 0
                    ? COLORS.noHoursAttended
                    : lec.hoursTotal > 0 && lec.hoursAttended < lec.hoursTotal
                        ? COLORS.partialHoursAttended
                        : lec.hoursTotal === lec.hoursAttended && lec.hoursTotal > 0
                            ? COLORS.fullHoursAttended
                            : undefined;

            marks[lec.date] = {
                selected: selectedDate === lec.date,
                selectedColor: selectedDate === lec.date ? COLORS.primary : undefined,
                marked: lec.professor || lec.note ? true : false,
                dotColor: lec.professor || lec.note ? COLORS.secondary : undefined,
                customStyles: {
                    container: { backgroundColor: color || "transparent" },
                    text: {
                        color: isOutsideMonth ? COLORS.white + "CC" : COLORS.white,
                        opacity: isOutsideMonth ? 0.7 : 1,
                    },
                },
            };
        });

        if (!marks[todayStr]) {
            marks[todayStr] = {
                customStyles: {
                    text: { color: COLORS.white},
                },
            };
        } else {
            marks[todayStr].customStyles = {
                ...marks[todayStr].customStyles,
                text: {
                    ...(marks[todayStr].customStyles?.text || {}),
                    color: COLORS.white,
                    fontWeight: "bold",
                },
            };
        }

        if (selectedDate && !marks[selectedDate]) {
            marks[selectedDate] = {
                selected: true,
                selectedColor: COLORS.primary,
            };
        }

        return marks;
    }, [monthCache, currentMonth, currentYear, selectedDate, refreshKey]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/")}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{subjectName}</Text>
                    <Text style={styles.subtitle}>{subjectType}</Text>
                </View>
            </View>

            <Calendar
                onDayPress={(d) => handleDayPress(d)}
                onMonthChange={(m) => handleMonthChange(m)}
                markingType="custom"
                markedDates={markedDates}
                enableSwipeMonths={true}
                theme={{
                    calendarBackground: COLORS.surface,
                    dayTextColor: COLORS.white,
                    monthTextColor: COLORS.white,
                    arrowColor: COLORS.white,
                    textDisabledColor: "rgba(255, 255, 255, 0.3)",
                }}
            />

            <Modal visible={loading} transparent animationType="fade">
                <View style={styles.loaderContainer}>
                    <Image source={require("@/assets/loader.gif")} style={styles.loaderGif} resizeMode="contain" />
                </View>
            </Modal>

            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{lecture ? "Update Lecture" : "Add Lecture"} :– {selectedDate}</Text>
                            </View>

                            <Text style={styles.modalSubtitle}>Hours Attended</Text>
                            <TextInput style={styles.input} placeholder="Lectures Attended" placeholderTextColor={COLORS.grey} keyboardType="numeric" value={hoursAttended} onChangeText={setHoursAttended} />

                            <Text style={styles.modalSubtitle}>Total Hours</Text>
                            <TextInput style={styles.input} placeholder="Total Lectures" placeholderTextColor={COLORS.grey} keyboardType="numeric" value={hoursTotal} onChangeText={setHoursTotal} />

                            <Text style={styles.modalSubtitle}>Professor</Text>
                            <TextInput style={styles.input} placeholder="(Optional)" placeholderTextColor={COLORS.grey} value={professor} onChangeText={setProfessor} />

                            <Text style={styles.modalSubtitle}>Note</Text>
                            <TextInput style={[styles.input, { height: 80 }]} placeholder="(Optional)" placeholderTextColor={COLORS.grey} multiline value={note} onChangeText={setNote} />

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.buttonText}>Save Lecture</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                <Text style={styles.buttonText}>Delete Lecture</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { setSelectedDate(null); setModalVisible(false); }} style={styles.cancelButton}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            <View style={styles.legendContainer}>
                <View style={styles.legendRow}>
                    <View style={[styles.legendColorBox, { backgroundColor: COLORS.noHoursAttended }]} />
                    <Text style={styles.legendText}>No Lectures Attended</Text>
                </View>

                <View style={styles.legendRow}>
                    <View style={[styles.legendColorBox, { backgroundColor: COLORS.partialHoursAttended }]} />
                    <Text style={styles.legendText}>Partial Lectures Attended</Text>
                </View>

                <View style={styles.legendRow}>
                    <View style={[styles.legendColorBox, { backgroundColor: COLORS.fullHoursAttended }]} />
                    <Text style={styles.legendText}>All Lectures Attended</Text>
                </View>

                <View style={styles.legendRow}>
                    <View style={[styles.legendColorBox, { backgroundColor: COLORS.marking }, { borderRadius: 6 }]} />
                    <Text style={styles.legendText}>Professor or Note present</Text>
                </View>
            </View>

            <View style={styles.attendanceMessageContainer}>
                <Text
                    style={[
                        styles.attendanceMessageText,
                        attendanceStatus === "below"
                            ? { color: COLORS.noHoursAttended }
                            : attendanceStatus === "above"
                                ? { color: COLORS.fullHoursAttended }
                                : { color: COLORS.grey },
                    ]}
                >
                    {attendanceMessage}
                </Text>
            </View>
        </View>
    );
}