import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

export default function ButtonRed(props) {
  return (
    <TouchableOpacity style={{ ...styles.button, ...props.style }} {...props}>
      <View style={styles.view}>
        <Text style={styles.text}>{props.text}</Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    borderRadius: 30,
    width: 60,
    height: 29,
    backgroundColor: "#FF6F91",
    // shadowColor: "rgba(0, 0, 0, 0.16)",
    shadowOpacity: 0.16,
    elevation: 5,
    zIndex: 999,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 5 },
  },
  text: {
    color: "white",
    padding: "0%",
    // paddingTop: "5%",
    margin: "0%",
  },
  view: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "0%",

    margin: "0%",
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
});
