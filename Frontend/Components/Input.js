import React from "react";
import { TextInput, StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
const Input = (props) => {
  return (
    <View style={styles.searchSection}>
      <Icon name={props.icon} size={30} color="#000" />
      <TextInput {...props} style={{ ...styles.input, ...props.style }} />
    </View>
  );
};
export default Input;
const styles = StyleSheet.create({
  input: {
    backgroundColor: "white",
    width: "90%",

    height: "80%",
    paddingLeft: 15,
    paddingRight: 15,
  },
  searchSection: {
    height: 53,
    width: 318,
    borderRadius: 30,
    zIndex: 999,
    shadowOpacity: 0.16,
    elevation: 5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 13 },
    // flex: 1,
    paddingLeft: 15,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
