import React, { useCallback } from "react";
import { StyleSheet, Text, View, Image, StatusBar } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Navigator from "./routes/drawer";
import Welcome from "./Screens/Welcome/Welcome";
import { AuthContext } from "./Components/context/auth-context";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

// const TASK_NAME = "BACKGROUND_TASK";

// TaskManager.defineTask(TASK_NAME, () => {
// 	try {
// 		// fetch data here...
// 		const receivedNewData = "Simulated fetch " + Math.random();
// 		console.log("My task ", receivedNewData);
// 		return receivedNewData
// 			? BackgroundFetch.Result.NewData
// 			: BackgroundFetch.Result.NoData;
// 	} catch (err) {
// 		return BackgroundFetch.Result.Failed;
// 	}
// });

export default class App extends React.Component {
	state = {
		appIsReady: false,
		token: false,
		name: false,
		userId: false,
		phoneNumber: false,
	};

	// RegisterBackgroundTask = async () => {
	// 	try {
	// 		await BackgroundFetch.registerTaskAsync(TASK_NAME, {
	// 			minimumInterval: 2, // seconds,
	// 		});
	// 		console.log("Task registered");
	// 	} catch (err) {
	// 		console.log("Task Register failed:", err);
	// 	}
	// };
	async componentDidMount() {
		// Prevent native splash screen from autohiding
		//this.RegisterBackgroundTask();
		try {
			await SplashScreen.preventAutoHideAsync();
		} catch (e) {
			console.warn(e);
		}
		this.prepareResources();
	}

	/**
	 * Method that serves to load resources and make API calls
	 */
	prepareResources = async () => {
		await performAPICalls();
		await downloadAssets();

		this.setState({ appIsReady: true }, async () => {
			await SplashScreen.hideAsync();
		});
	};

	login = (uid, token, name, phoneNumber) => {
		//console.log("called login");
		this.setState({
			token: token,
			userId: uid,
			name: name,
			phoneNumber: phoneNumber,
		});
	};

	logout = () => {
		//console.log("called logout");
		this.setState({ token: null, userId: null, name: null, phoneNumber: null });
	};

	render() {
		if (!this.state.appIsReady) {
			return null;
		}

		return (
			<AuthContext.Provider
				value={{
					isLoggedIn: !!this.state.token,
					token: this.state.token,
					userId: this.state.userId,
					login: this.login,
					logout: this.logout,
					name: this.state.name,
					phoneNumber: this.state.phoneNumber,
				}}
			>
				<StatusBar barStyle='dark-content' translucent={true} />
				<Navigator style={styles.container} />
			</AuthContext.Provider>
		);
	}
}

// Put any code you need to prepare your app in these functions
async function performAPICalls() {
	console.log("s");
}
async function downloadAssets() {}
// var { width } = Dimensions.get("window");
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "space-around",

		width: "100%",
		height: "100%",
		backgroundColor: "white",
	},
});
