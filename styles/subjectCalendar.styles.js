import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        position: "relative",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
        width: "100%",
    },
    modalContent: {
        backgroundColor: "#1C1C1E",
        padding: 20,
        borderRadius: 16,
        width: SCREEN_WIDTH * 0.85,
        alignSelf: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    modalTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#2C2C2E",
        color: "white",
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
    },
    saveButton: {
        backgroundColor: "#4ADE80",
        borderRadius: 10,
        padding: 14,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    deleteButton: {
        backgroundColor: "#e62828be",
        borderRadius: 10,
        padding: 14,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    cancelButton: {
        backgroundColor: "#2A2A2A",
        borderRadius: 10,
        padding: 14,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "black",
        fontWeight: "bold",
    },
    cancelText: {
        color: "#aaa",
        textAlign: "center",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    loaderGif: {
        width: 120,
        height: 120,
        borderRadius: 30,
    },
    modalSubtitle: {
        color: "white",
        marginBottom: 7,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
});