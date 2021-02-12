import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Button from "../../Components/ButtonRed/ButtonRed";

export default function Welcome({ navigation }) {
	const navSignInHandler = () => {
		navigation.push("SignIn");
	};
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Women Safety App{"\n"}</Text>

			<Button onPress={navSignInHandler} text='Start' />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		// padding: 50,
		width: "100%",
		height: "100%",
		backgroundColor: "white",
	},
	welcome_image: {
		// width: width * 0.5,
		width: "100%",

		height: "65%",
		transform: [{ translateX: -0 }],
		// paddingRight: "50%",
	},
	text: {
		color: "black",
		fontSize: 52,
		fontWeight: "100",
		paddingTop: "10%",
		textAlign: "center",
	},
	caption_view: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		justifyContent: "center",
	},
	caption: {
		fontWeight: "normal",
		fontSize: 12,
		lineHeight: 18,
		// width: "100%",

		color: "#656565",
	},
	signInButton: {
		// marginLeft: "20%",
	},
});
