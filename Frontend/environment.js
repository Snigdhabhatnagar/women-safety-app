import Constants from "expo-constants";
import { Platform } from "react-native";

// sets the environment variables for urls used in frontend to be able to configure easily when run in development or in production
// Replace localhost conditional url with your ip address to run it locally!(Ex: http://192.168.1.2:5001)
const localhost =
	Platform.OS === "ios"
		? "https://women-safety-app-wit.herokuapp.com"
		: "https://women-safety-app-wit.herokuapp.com";

const hapiURL =
	Platform.OS === "ios"
		? "https://women-safety-app-hapi.herokuapp.com"
		: "https://women-safety-app-hapi.herokuapp.com";

const ENV = {
	dev: {
		apiUrl: localhost,
		apiUrl1: hapiURL,
		amplitudeApiKey: null,
		GOOGLE_MAP_API_KEY: "", // Please enter api key here.
		OPENCAGE_KEY: "a0357ccb779a46c89403ffa385f183e6",
	},
	staging: {
		apiUrl: "[your.staging.api.here]",
		amplitudeApiKey: "[Enter your key here]",
		// Add other keys you want here
	},
	prod: {
		apiUrl: "[your.production.api.here]",
		amplitudeApiKey: "[Enter your key here]",
		// Add other keys you want here
	},
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
	// This variable is set to true when react-native is running in Dev mode.
	// __DEV__ is true when run locally, but false when published.
	if (__DEV__) {
		return ENV.dev;
	} else if (env === "staging") {
		return ENV.staging;
	} else if (env === "prod") {
		return ENV.prod;
	}
};

export default getEnvVars;
