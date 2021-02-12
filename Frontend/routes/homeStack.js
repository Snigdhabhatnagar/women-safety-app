import { createStackNavigator } from "react-navigation-stack";
import SignIn from "../Screens/SignIn/SignIn";
import SignUp from "../Screens/SignUp/SignUp";
import Welcome from "../Screens/Welcome/Welcome";
import Logout from "../Screens/Logout/Logout";
import EmergencyContacts from "../Screens/EmergencyContacts/EmergencyContacts";
import Home from "../Screens/Home/Home";
import Dashboard from "../Screens/Dashboard/Dashboard";
import HotWords from "../Screens/HotWords/HotWords";

const screens = {
	Welcome: {
		screen: Welcome,
		navigationOptions: {
			headerShown: false,
		},
	},

	SignIn: {
		screen: SignIn,
		navigationOptions: {
			headerShown: false,
		},
	},
	SignUp: {
		screen: SignUp,
		navigationOptions: {
			headerShown: false,
		},
	},
	HotWords: {
		screen: HotWords,
		navigationOptions: {
			headerShown: false,
		},
	},
	EmergencyContacts: {
		screen: EmergencyContacts,
		navigationOptions: {
			headerShown: false,
		},
	},
	Home: {
		screen: Home,
		navigationOptions: {
			headerShown: false,
		},
	},

	Dashboard: {
		screen: Dashboard,
		navigationOptions: {
			headerShown: false,
		},
	},

	Logout: {
		screen: Logout,
		navigationOptions: {
			headerShown: false,
		},
	},
};
const HomeStack = createStackNavigator(screens);
export default HomeStack;
