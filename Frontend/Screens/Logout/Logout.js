import React, { Component } from "react";

import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	Modal,
} from "react-native";

import { NavigationActions, StackActions } from "react-navigation";

import Input from "../../Components/Input";
import ButtonRed from "../../Components/ButtonRed/ButtonRed";
import Icon from "react-native-vector-icons/FontAwesome";
import { AuthContext } from "../../Components/context/auth-context";

export default class Logout extends Component {
	static contextType = AuthContext;
	state = {
		phoneNumber: null,
		password: null,
	};
	pressHandler = () => {
		this.props.navigation.push("SignUp");
	};
	inputChangleHandler = (event, input) => {
		this.setState({ [input]: event });
	};
	homeNavHandler = () => {
		this.props.navigation.goBack();
	};

	userPostHandler = async () => {
		// post user
		try {
			await this.context.logout();
			const resetAction = StackActions.reset({
				index: 0,
				actions: [NavigationActions.navigate({ routeName: "SignIn" })],
			});
			this.props.navigation.dispatch(resetAction);
		} catch (err) {
			console.log(err);
		}

		// this.props.navigation.navigate("SignIn");
	};

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.backButton}>
					<ButtonRed
						text={<Icon name='long-arrow-left' size={20} color='#000' />}
						onPress={this.homeNavHandler}
					/>
				</View>

				<View style={styles.button}>
					<Text
						style={{
							fontSize: 24,
							paddingLeft: 10,
							fontWeight: "600",
							marginBottom: "5%",
							alignSelf: "flex-start",
						}}
					>
						{this.context.name},{"\n"} do you want to Log Out?
					</Text>
					<ButtonRed
						text={<Icon name='long-arrow-right' size={20} color='#000' />}
						nav={this.props.navigation}
						style={styles.buttonOnSuccess}
						onPress={this.userPostHandler}
					/>
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	backButton: {
		position: "absolute",
		left: 0,
		top: 0,
		margin: 50,
		elevation: 10,
		zIndex: 999,
		marginLeft: 20,
	},
	container: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%",
		alignItems: "center",
		justifyContent: "space-evenly",
	},
	topRight: {
		position: "absolute",
		padding: "0%",
		margin: "0%",

		// bottom: 0,
		top: 0,
		right: 0,
		width: 180,
		height: 180,
	},
	circle: {
		position: "absolute",
		padding: "0%",
		margin: "0%",
		width: 150,
		// height: 260,
		right: 0,
		bottom: 0,
		height: "50%",
		paddingBottom: 0,
		zIndex: -10,
		// backgroundColor: "black",

		left: 0,
	},
	form: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-around",
		// backgroundColor: "black",
		height: 200,
	},
	button: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		// transform: [{ translateY: 30 }],
		// transform: [{ translateX: 30 }],
		justifyContent: "center",
		alignItems: "center",
		// backgroundColor: "black",
	},
	bottom: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
	buttonOnError: {
		borderRadius: 30,
		width: 60,
		height: 29,
		backgroundColor: "#FF6F91",
		opacity: 0.5,
		// shadowColor: "rgba(0, 0, 0, 0.16)",
		shadowOpacity: 0.16,
		elevation: 5,
		zIndex: 999,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 5 },
	},
	buttonOnSuccess: {
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
});
