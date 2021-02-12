import React, { Component } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	Dimensions,
	Alert,
	Modal,
	ActivityIndicator,
	TouchableOpacity,
	TouchableHighlight,
} from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import Icon from "react-native-vector-icons/FontAwesome";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import getEnvVars from "../../environment";
const { apiUrl, apiUrl1, GOOGLE_MAP_API_KEY, OPENCAGE_API } = getEnvVars();
import axios from "axios";
import { AuthContext } from "../../Components/context/auth-context";
import Map from "../Dashboard/Map";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const recordingOptions = {
	android: {
		extension: ".m4a",
		outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
		audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
		sampleRate: 44100,
		numberOfChannels: 2,
		bitRate: 128000,
	},
	ios: {
		extension: ".wav",
		audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
		sampleRate: 44100,
		numberOfChannels: 1,
		bitRate: 128000,
		linearPCMBitDepth: 16,
		linearPCMIsBigEndian: false,
		linearPCMIsFloat: false,
	},
};
export default class Home extends Component {
	static contextType = AuthContext;
	constructor(props) {
		super(props);

		this.recording = null;
		this.state = {
			isFetching: false,
			isRecording: false,
			query: "",
			region: null,
			visible: false,
			triggered: false,
			initialRegion: null,
			addedContacts: [{}],
			location: null,
			locationname: null,
			locationForAlert: null,
			counter: 10,
			triggerModalToggle: false,
			cancelledTrigger: false,
			hotWords: null,
			stopRecording: false,
			didFocus: false,
			placeid: null,
			coordinates: [
				{
					latitude: 37.3317876,
					longitude: -122.0054812,
				},
				{
					latitude: 37.771707,
					longitude: -122.4053769,
				},
			],
		};
	}

	componentDidMount = async () => {
		await this.getCurrentLocation();

		this.focusListener = this.props.navigation.addListener(
			"didFocus",
			async () => {
				this.setState({ didFocus: true, stopRecording: false });

				try {
					const response = await fetch(
						`${apiUrl}/api/hotword/get-hotword/${this.context.userId}`
					);

					const responseData = await response.json();
					if (!response.ok) {
						throw new Error(responseData.message);
					}
					let dict = {};
					await responseData.hotWords.map((word) => {
						dict[word.toLowerCase()] = 1;
					});
					this.setState({ hotWords: dict });
				} catch (err) {
					console.log(err);
				}
				if (!this.state.isRecording) {
					this.startRecording();
					setTimeout(() => {
						this.handleOnPressOut();
					}, 2000);
				}
			}
		);
		let { status } = await Location.requestPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg("Permission to access location was denied");
		}

		let location = await Location.getCurrentPositionAsync({});
		this.setState({ location: location });
		try {
			const response = await fetch(
				`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${this.state.location.coords.latitude},${this.state.location.coords.longitude}&radius=1500&type=police&key=${GOOGLE_MAP_API_KEY}`
			);
			const responseData = await response.json();

			const responsePlaceID = await fetch(
				`https://maps.googleapis.com/maps/api/place/details/json?place_id=${responseData.results[0].place_id}&fields=name,geometry&key=${GOOGLE_MAP_API_KEY}`
			);
			const accurateDestinationCoordinates = await responsePlaceID.json();

			this.setState({
				coordinates: [
					{
						latitude: this.state.location.coords.latitude,
						longitude: this.state.location.coords.longitude,
					},
					{
						latitude:
							accurateDestinationCoordinates.result.geometry.location.lat,
						longitude:
							accurateDestinationCoordinates.result.geometry.location.lng,
					},
				],
			});
		} catch (err) {
			console.log(err);
		}
	};

	deleteRecordingFile = async () => {
		console.log("Deleting file");
		try {
			const info = await FileSystem.getInfoAsync(this.recording.getURI());
			await FileSystem.deleteAsync(info.uri);
		} catch (error) {
			console.log("There was an error deleting recording file", error);
		}
	};

	// send audio file to backend to be sent to google speech to text api and get back the transcribed audio
	getTranscription = async () => {
		let { status } = await Location.requestPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg("Permission to access location was denied");
		}

		let location = await Location.getCurrentPositionAsync({});
		this.setState({ location: location });

		JSON.stringify(this.state.location);

		this.setState({ isFetching: true });
		try {
			const { uri } = await FileSystem.getInfoAsync(this.recording.getURI());

			const formData = new FormData();
			formData.append("file", {
				uri,
				type: Platform.OS === "ios" ? "audio/x-wav" : "audio/m4a",
				name: Platform.OS === "ios" ? `${Date.now()}.wav` : `${Date.now()}.m4a`,
			});

			const { data } = await axios.post(`${apiUrl1}/speech`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			this.setState({ transcript: data.transcript });
			console.log("transcribedd");
			console.log(this.state.transcript);

			let transcriptArray = data.transcript.split(" ");
			let trig = false;

			transcriptArray.map((word) => {
				let smallword = word.toString().toLowerCase();

				if (this.state.hotWords[smallword] === 1) trig = true;
			});
			if (trig) {
				clearInterval(counterInterval);
				this.setState({ triggerModalToggle: true, counter: 10 });
				let counterInterval = setInterval(() => {
					this.counterDec();
				}, 1500);

				setTimeout(() => {
					if (!this.state.cancelledTrigger) {
						clearInterval(counterInterval);

						this.triggerHandler();
					}
				}, 10000);
			} else {
				console.log("retry");
				if (!this.state.stopRecording) {
					console.log("Recorddong", this.state.stopRecording);
					this.startRecording();
					setTimeout(() => {
						this.handleOnPressOut();
					}, 2000);
				}
			}
		} catch (error) {
			console.log("There was an error reading file", error);
			this.stopRecording();
			this.resetRecording();
		}
		this.setState({ isFetching: false });
	};

	// ask for permission for microphone and start recording audio
	startRecording = async () => {
		console.log("start");
		const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);

		if (status !== "granted") return;
		if (!this.state.isRecording) {
			this.setState({ isRecording: true });
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
				playsInSilentModeIOS: true,
				shouldDuckAndroid: true,
				interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
				playThroughEarpieceAndroid: true,
			});
			const recording = new Audio.Recording();

			try {
				await recording.prepareToRecordAsync(recordingOptions);
				await recording.startAsync();
			} catch (error) {
				console.log(error);
				this.stopRecording();
			}

			this.recording = recording;
		}
	};

	stopRecording = async () => {
		console.log("stop");
		this.setState({ isRecording: false });
		try {
			await this.recording.stopAndUnloadAsync();
		} catch (error) {}
	};

	resetRecording = () => {
		this.deleteRecordingFile();
		this.recording = null;
	};

	handleOnPressIn = () => {
		this.startRecording();
	};

	handleOnPressOut = async () => {
		await this.stopRecording();
		this.getTranscription();
	};

	handlQueryChange = (query) => {
		this.setState({ query });
	};

	getCurrentLocation = async () => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				let region = {
					latitude: parseFloat(position.coords.latitude),
					longitude: parseFloat(position.coords.longitude),
					latitudeDelta: 0.01,
					longitudeDelta: 0.01,
				};
				this.setState({
					initialRegion: region,
				});
			},
			(error) => console.log(error),
			{
				enableHighAccuracy: true,
				timeout: 20000,
				maximumAge: 1000,
			}
		);
	};

	triggerHandler = async () => {
		this.setState({
			triggered: true,
			triggerModalToggle: false,
			stopRecording: true,
		});

		try {
			const response = await fetch(
				`${apiUrl}/api/contacts/getcontact/${this.context.userId}`
			);

			const responseData = await response.json();
			//console.log(responseData);
			if (!response.ok) {
				throw new Error(responseData.message);
			}
			this.setState({
				addedContacts: responseData.Users.map((object) => {
					if (object) {
						let num = object.contact.toString();
						num = "+91" + num;
						return num;
					}
				}),
			});
		} catch (err) {
			console.log(err);
		}

		try {
			const response = await fetch(
				`https://api.opencagedata.com/geocode/v1/json?q=${this.state.location.coords.latitude}%2C${this.state.location.coords.longitude}&key=${OPENCAGE_API}&language=en&pretty=1`
			);
			const responseData = await response.json();
			//console.log(responseData.results[0].formatted);
			this.setState({
				locationForAlert: responseData.results[0].formatted,
			});
		} catch (err) {
			console.log(err);
		}

		this.props.navigation.navigate("Dashboard");
	};

	counterDec = () => {
		this.setState((prevState) => ({
			counter: prevState.counter - 1,
		}));
	};
	render() {
		const { counter } = this.state;
		let latlang;
		if (this.state.location) {
			latlang = {
				longitude: this.state.longitude,
				latitude: this.state.latitude,
			};
		}

		if (this.state.triggerModalToggle) {
			setTimeout(() => {
				//   this.setState((prevState) => ({ counter: prevState.counter - 1 }));
			}, 1000);
		}
		return (
			<View style={styles.container}>
				<Modal
					animationType='slide'
					transparent={true}
					visible={this.state.triggerModalToggle}
					onRequestClose={() => {
						Alert.alert("Closed");
					}}
				>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Text style={styles.modalText}>
								SOS Alert! Triggering in {this.state.counter}
							</Text>

							<TouchableHighlight
								style={styles.buttonOnSuccess}
								onPress={() => {
									this.setState((prevState) => ({
										triggerModalToggle: false,
										cancelledTrigger: true,
										triggered: false,
										isRecording: false,
										counter: 10,
									}));

									this.startRecording();
									setTimeout(() => {
										this.handleOnPressOut();
									}, 2000);
								}}
							>
								<Text style={{ color: "white", alignSelf: "center" }}>
									Close
								</Text>
							</TouchableHighlight>
						</View>
					</View>
				</Modal>

				<View style={styles.header}>
					<Text style={styles.headerText}>Hi, {this.context.name}</Text>

					<Icon
						style={styles.breadCrumbs}
						name='bars'
						size={30}
						color='#FF6F91'
						onPress={() => {
							this.props.navigation.openDrawer();
							if (!this.state.stopRecording) {
								this.stopRecording();
							}
							this.setState({ stopRecording: true });
						}}
					/>
				</View>
				<View style={styles.mapContainer}>
					{this.state.initialRegion ? (
						<Map
							initialRegion={this.state.initialRegion}
							coordinates={this.state.coordinates}
						/>
					) : (
						<View
							style={{
								height: "100%",
								width: "100%",
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<ActivityIndicator
								size='large'
								color='#FF6F91'
								style={{ zIndex: 100, position: "absolute" }}
							/>
							<MapView
								provider={PROVIDER_GOOGLE}
								initialRegion={this.state.initialRegion}
								style={styles.mapStyle}
								followUserLocation={true}
								zoomEnabled={true}
								showsUserLocation={true}
								// initialRegion={this.state.initialRegion}
							></MapView>
						</View>
					)}
				</View>
				<View style={styles.triggerButtonContainer}>
					<TouchableOpacity
						style={styles.triggerButton}
						onPress={() => {
							this.handleOnPressOut();
							clearInterval(counterInterval);
							let counterInterval = setInterval(() => {
								this.counterDec();
							}, 1000);
							this.setState({
								triggerModalToggle: true,
								isRecording: false,
								counter: 10,
							});

							setTimeout(() => {
								if (!this.state.cancelledTrigger) {
									this.triggerHandler();
									clearInterval(counterInterval);
								}
							}, 10000);
						}}
					>
						<Text style={{ color: "white", fontSize: 80 }}>!</Text>
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
		paddingTop: 30,
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22,
	},

	circle: {
		position: "absolute",
		padding: "0%",
		margin: "0%",
		right: 0,
		bottom: 0,
		height: "40%",
		marginBottom: 120,
		zIndex: -10,
		left: 0,
	},
	header: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 10,
	},

	headerText: {
		fontSize: 36,
	},
	breadCrumbs: {},
	mapContainer: {
		height: "60%",
		width: "100%",
		shadowOpacity: 0.16,
		elevation: 10,
		zIndex: 999,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 0 },
	},

	triggerButtonContainer: {
		height: "30%",
		width: "100%",
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	triggerButton: {
		backgroundColor: "#D74A70",
		width: 150,
		height: 150,
		borderRadius: 100,
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		shadowOpacity: 0.2,
		elevation: 6,
		zIndex: 999,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 7 },
	},
	mapStyle: {
		width: "100%",
		height: "100%",
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center",
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22,
	},

	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	buttonOnSuccess: {
		borderRadius: 30,
		width: 60,
		height: 29,
		backgroundColor: "#FF6F91",

		shadowOpacity: 0.16,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		elevation: 5,
		zIndex: 999,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 5 },
	},
});
