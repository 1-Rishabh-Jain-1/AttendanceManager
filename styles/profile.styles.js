import { COLORS } from "@/constants/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
});