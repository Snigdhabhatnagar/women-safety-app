import React, { Component } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
	Platform,
	TouchableHighlight,
	Modal,
	ActivityIndicator,
} from "react-native";
import Input from "../../Components/Input";
import ButtonRed from "../../Components/ButtonRed/ButtonRed";
import Icon from "react-native-vector-icons/FontAwesome";
import { AuthContext } from "../../Components/context/auth-context";
import getEnvVars from "../../environment";
const { apiUrl } = getEnvVars();

export default class SignUp extends Component {
	static contextType = AuthContext;
	state = {
		tapped: false,
		firstName: null,
		lastName: null,
		phoneNumber: null,
		password: null,
		repassword: null,
		styleType: null,
		passwordConfirmed: false,
		buttonStyle: null,
		modalVisible: false,
		isLoaded: true,
		authy_id: null,
	};
	setModalVisible = (visible) => {
		this.setState({ modalVisible: visible });
	};

	touchHandler = () => {
		this.setState({ tapped: true });
	};

	passwordConfirmHandler = (event) => {
		if (event === this.state.password) {
			this.setState({ styleType: null, passwordConfirmed: true });
		} else {
			this.setState({ styleType: styles.error, passwordConfirmed: false });
		}
	};
	lengthCheckHandler = (event) => {
		if (event.length < 6) {
			this.setState({ styleType: styles.error });
		} else {
			this.setState({ styleType: null });
		}
	};
	inputChangleHandler = (event, input) => {
		this.setState({ [input]: event });
	};
	navSignInHandler = () => {
		this.setModalVisible(!this.state.modalVisible);
		this.props.navigation.push("SignIn");
	};

	userPostHandler = async () => {
		// post user
		try {
			this.setState({ modalVisible: true });
			const response = await fetch(`${apiUrl}/api/users/signup`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					First_name: this.state.firstName,
					Last_name: this.state.lastName,
					Mobile_number: this.state.phoneNumber,
					Password: this.state.password,
				}),
			});
		} catch (err) {
			console.log("error");
			console.log(err);
		}
	};

	render() {
		const { modalVisible } = this.state;
		return (
			<View>
				{!this.state.isLoaded && (
					<View
						style={{
							height: "100%",
							width: "100%",
							alignItems: "center",
							display: "flex",
							justifyContent: "center",
							position: "absolute",
							//zIndex: "50",
						}}
					>
						<ActivityIndicator size='large' color='#FF6F91' />
					</View>
				)}
				<View style={styles.centeredView}>
					<Modal
						animationType='slide'
						transparent={true}
						visible={modalVisible}
						onRequestClose={() => {
							Alert.alert("Modal has been closed.");
						}}
					>
						<View style={styles.centeredView}>
							<View style={styles.modalView}>
								<Text style={styles.modalText}>Registered, Sign in now!</Text>

								<TouchableOpacity
									style={{
										position: "absolute",
										top: 0,
										right: 0,
										padding: 40,
										zIndex: 20,
										// backgroundColor: "black",
									}}
									onPress={() => {
										this.setModalVisible(!modalVisible);
									}}
								>
									<Text style={{ fontSize: 30 }}>X</Text>
								</TouchableOpacity>
								<View
									style={{
										display: "flex",
										flexDirection: "row",
										// width: "100%",
										// justifyContent: "space-around",
										paddingTop: 50,
									}}
								>
									<ButtonRed
										text={
											<Icon name='long-arrow-right' size={20} color='#000' />
										}
										style={styles.buttonOnSuccess}
										onPress={this.navSignInHandler}
									/>
								</View>
							</View>
						</View>
					</Modal>
				</View>

				<KeyboardAvoidingView
					behavior={Platform.OS == "ios" ? "padding" : "null"}
				>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View style={styles.container}>
							<View style={styles.form}>
								<Text style={{ fontSize: 29, paddingTop: 45 }}>
									Create account
								</Text>

								<Input
									icon='user'
									blurOnSubmit
									placeholder='Enter first name'
									onChangeText={(event) =>
										this.inputChangleHandler(event, "firstName")
									}
									value={this.state.firstName}
								/>
								<Input
									icon='user'
									blurOnSubmit
									placeholder='Enter last name'
									onChangeText={(event) =>
										this.inputChangleHandler(event, "lastName")
									}
									value={this.state.lastName}
								/>
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
									style={this.state.styleType}
									onChangeText={(event) => {
										this.inputChangleHandler(event, "password");
										this.lengthCheckHandler(event);
									}}
									value={this.state.password}
								/>
								<Text
									style={{
										fontSize: 12,
										color: "#BABABA",
										marginTop: -20,
										marginBottom: -20,

										marginLeft: "auto",
									}}
								>
									Password must be of minimum length 6.
								</Text>
								<Input
									icon='lock'
									blurOnSubmit
									secureTextEntry={true}
									textContentType='password'
									minlength={6}
									autoCorrect={false}
									style={this.state.styleType}
									placeholder='Re-enter password'
									onChangeText={(event) => {
										this.inputChangleHandler(event, "repassword");
										this.passwordConfirmHandler(event);
									}}
									value={this.state.repassword}
								/>
								<View style={styles.button}>
									<Text
										style={{
											fontSize: 24,
											paddingRight: 10,
											fontWeight: "600",
										}}
									>
										Create
									</Text>

									<TouchableWithoutFeedback
										style={{ backgroundColor: "black", width: "100%" }}
									>
										<ButtonRed
											text={
												<Icon name='long-arrow-right' size={20} color='#000' />
											}
											style={
												this.state.passwordConfirmed &&
												this.state.firstName.length > 0 &&
												this.state.lastName.length > 0 &&
												this.state.phoneNumber.length === 10
													? styles.buttonOnSuccess
													: styles.buttonOnError
											}
											disabled={
												this.state.passwordConfirmed &&
												this.state.firstName.length > 0 &&
												this.state.lastName.length > 0 &&
												this.state.phoneNumber.length === 10
													? false
													: true
											}
											onPress={() => {
												this.setModalVisible(!modalVisible);
												this.userPostHandler();
											}}
										/>
									</TouchableWithoutFeedback>
								</View>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
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
	topLeft: {
		position: "absolute",
		padding: "0%",
		margin: "0%",
		// backgroundColor: "black",

		transform: [{ translateX: -2 }, { translateY: -2 }],

		// bottom: 0,
		top: 0,
		left: 0,
		width: 150,
		height: 150,
	},
	circle: {
		position: "absolute",
		padding: "0%",
		margin: "0%",
		// width: "100%",
		height: 250,
		right: 0,
		bottom: 0,

		marginBottom: 50,
		zIndex: -10,

		left: 0,
	},
	form: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "space-around",
		// backgroundColor: "black",
		height: 600,
	},
	button: {
		display: "flex",
		flexDirection: "row",
		// width: "100%",
		alignItems: "center",
		// transform: [{ translateX: 30 }],
		justifyContent: "center",
		// backgroundColor: "black",
	},
	error: {
		color: "red",
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

	centeredView: {
		flex: 1,
		// display: "flex",
		justifyContent: "center",
		alignItems: "center",
		// marginTop: 22,
		height: "100%",
		width: "100%",
	},
	modalView: {
		margin: 20,
		backgroundColor: "rgba(255, 227, 235, 0.85)",
		width: "100%",
		height: "100%",
		// padding: 35,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
	},

	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	modalText: {
		marginBottom: 15,
		fontSize: 30,
		textAlign: "center",
	},
});
