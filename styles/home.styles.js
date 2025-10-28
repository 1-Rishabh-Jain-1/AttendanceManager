import { COLORS } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
    },
    loadingText: {
        color: "white",
        fontSize: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    heading: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },
    subjectList: {
        flexGrow: 1,
        width: "100%",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: 16,
        width: "90%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.white,
        marginBottom: 15,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.grey,
        borderRadius: 8,
        padding: 10,
        color: COLORS.white,
        marginBottom: 10,
        backgroundColor: COLORS.surface,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: COLORS.grey,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: COLORS.surface,
        height: 50,
        marginBottom: 10,
        justifyContent: "center",
    },
    dropdownContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        borderColor: COLORS.grey,
        borderWidth: 1,
    },
    placeholderStyle: {
        color: COLORS.grey,
        fontSize: 16,
    },
    selectedTextStyle: {
        color: COLORS.white,
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: "bold",
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 10,
        alignItems: "center",
    },
    cancelText: {
        color: COLORS.grey,
        fontSize: 14,
    },
    card: {
        backgroundColor: "#1c1c1e",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    subjectName: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    professor: {
        color: "#9ca3af",
        fontSize: 14,
        marginTop: 4,
    },
    attendance: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: "600",
        marginTop: 8,
    },
});