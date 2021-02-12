import React, { Component } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Dimensions,
} from "react-native";
import Input from "../../Components/Input";
import ButtonRed from "../../Components/ButtonRed/ButtonRed";
import Icon from "react-native-vector-icons/FontAwesome";
import { AuthContext } from "../../Components/context/auth-context";
import getEnvVars from "../../environment";
const { apiUrl } = getEnvVars();

export default class SignIn extends Component {
	static contextType = AuthContext;
	state = {
		phoneNumber: null,
		password: null,
		authenticationFailed: false,
		isLoaded: true,
	};
	pressHandler = () => {
		this.props.navigation.push("SignUp");
	};
	inputChangleHandler = (event, input) => {
		this.setState({ [input]: event });
	};

	userPostHandler = async () => {
		// post user
		try {
			this.setState({ isLoaded: false });
			const response = await fetch(`${apiUrl}/api/users/login`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},

				body: JSON.stringify({
					Mobile_number: this.state.phoneNumber,
					Password: this.state.password,
				}),
			});

			const responseData = await response.json();
			//console.log(responseData);

			if (responseData.token) {
				await this.context.login(
					responseData.userId,
					responseData.token,
					responseData.name,
					responseData.number
				);
				this.props.navigation.navigate("Home");

				this.setState({ isLoaded: true });
			} else {
				console.log("Authentication Failed");
				this.setState({
					isLoaded: true,
					authenticationFailed: true,
					password: null,
				});
			}
		} catch (err) {
			console.log("Hello");
			console.log(err);
		}
	};

	render() {
		return (
			<View style={styles.container}>
				{!this.state.isLoaded && (
					<View
						style={{
							flex: 1,
							height: Dimensions.get("window").height,
							width: "100%",
							alignItems: "center",
							display: "flex",
							justifyContent: "center",
							position: "absolute",
							elevation: 100,
							margin: 0,
							padding: 0,
						}}
					>
						<ActivityIndicator size='large' color='#FF6F91' />
					</View>
				)}

				<Text style={{ fontSize: 29, paddingTop: 100 }}>Sign In</Text>
				<View style={styles.form}>
					{this.state.authenticationFailed ? (
						<Text style={{ color: "red", textAlign: "center" }}>
							Please Enter Correct Credentials
						</Text>
					) : null}
					<Input
						icon='mobile'
						keyboardType='numeric'
						blurOnSubmit
						maxLength={10}
						placeholder='Enter phone number'
						onChangeText={(event) =>
							this.inputChangleHandler(event, "phoneNumber")
						}
						value={this.state.phoneNumber}
					/>
					<Input
						icon='lock'
						blurOnSubmit
						secureTextEntry={true}
						textContentType='password'
						minlength={6}
						autoCorrect={false}
						placeholder='Enter password'
						onChangeText={(event) =>
							this.inputChangleHandler(event, "password")
						}
						value={this.state.password}
					/>
					<Text
						style={{
							fontSize: 12,
							color: "#BABABA",
							marginLeft: "auto",
						}}
					>
						Forgot your password?
					</Text>
				</View>
				<View style={styles.button}>
					<Text style={{ fontSize: 24, paddingRight: 10, fontWeight: "600" }}>
						Sign In
					</Text>
					<ButtonRed
						text={<Icon name='long-arrow-right' size={20} color='#000' />}
						nav={this.props.navigation}
						style={
							this.state.password &&
							this.state.phoneNumber &&
							this.state.phoneNumber.length === 10
								? styles.buttonOnSuccess
								: styles.buttonOnError
						}
						disabled={
							this.state.password &&
							this.state.phoneNumber &&
							this.state.phoneNumber.length === 10
								? false
								: true
						}
						onPress={this.userPostHandler}
					/>
				</View>
				<View style={styles.bottom}>
					<Text
						style={{
							fontSize: 15,
							color: "#656565",
							paddingTop: 50,
						}}
					>
						Don't have an account?
					</Text>
					<TouchableOpacity onPress={this.pressHandler}>
						<Text
							style={{
								fontSize: 20,
								color: "#000",
								fontWeight: "800",
								textDecorationLine: "underline",
							}}
						>
							Create
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
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
		right: 0,
		bottom: 0,
		height: "50%",
		paddingBottom: 0,
		zIndex: -10,
		left: 0,
	},
	form: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-around",
		height: 200,
	},
	button: {
		display: "flex",
		flexDirection: "row",
		width: "100%",
		transform: [{ translateX: 30 }],
		justifyContent: "center",
	},
	bottom: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	buttonOnError: {
		borderRadius: 30,
		width: 60,
		height: 29,
		backgroundColor: "#FF6F91",
		opacity: 0.5,
		shadowOpacity: 0.16,
		elevation: 5,
		zIndex: 998,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 5 },
	},
	buttonOnSuccess: {
		borderRadius: 30,
		width: 60,
		height: 29,
		backgroundColor: "#FF6F91",
		shadowOpacity: 0.16,
		elevation: 5,
		zIndex: 998,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 5 },
	},
});
