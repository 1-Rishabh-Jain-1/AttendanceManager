import { COLORS } from "@/constants/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    marginBottom: 40,
  },
  logoutContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    alignItems: "center",
  },
  logoutIcon: {
    fontSize: 25,
    color: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    right: -4,
  },
  logoutText: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 2,
  },
  profilePic: {
    alignItems: "center",
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  subjectList: {
    flexGrow: 1,
    width: "100%",
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
  attendance: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
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
});