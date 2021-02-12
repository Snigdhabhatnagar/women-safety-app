import { createDrawerNavigator } from "react-navigation-drawer";
import { createAppContainer } from "react-navigation";
import homeStack from "./homeStack";
import Logout from "../Screens/Logout/Logout";
import EmergencyContacts from "../Screens/EmergencyContacts/EmergencyContacts";
import HotWords from "../Screens/HotWords/HotWords";

const RootDrawerNavigator = createDrawerNavigator(
	{
		Home: {
			screen: homeStack,
			// navigationOptions: {
			//   drawerLockMode: "locked-closed",
			// },
		},
		EmergencyContacts: {
			screen: EmergencyContacts,
			navigationOptions: {
				drawerLabel: "Emergency Contacts",
			},
		},
		Hotwords: {
			screen: HotWords,
			navigationOptions: {
				drawerLabel: "Wake Words",
			},
		},
		Logout: {
			screen: Logout,
		},
	},
	{
		contentOptions: {
			activeTintColor: "#D74A70",
		},
		drawerPosition: "right",
	}
);

export default createAppContainer(RootDrawerNavigator);
