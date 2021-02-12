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
	ScrollView,
	TouchableHighlight,
	Modal,
	SafeAreaView,
	Dimensions,
	ActivityIndicator,
	SegmentedControlIOSComponent,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";
import Input from "../../Components/Input";
import ButtonRed from "../../Components/ButtonRed/ButtonRed";
import Icon from "react-native-vector-icons/FontAwesome";
import { AuthContext } from "../../Components/context/auth-context";
import getEnvVars from "../../environment";
import axios from "axios";

const { apiUrl, apiUrl1 } = getEnvVars();

const recordingOptions = {
	// android not currently in use. Not getting results from speech to text with .m4a
	// but parameters are required
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
export default class HotWords extends Component {
	static contextType = AuthContext;
	constructor(props) {
		super(props);
		this.recording = null;
		this.state = {
			hotWords: [],
			word: null,
			isLoaded: true,
			keyboardShow: false,
			isRecording: false,
			isFetching: false,
			wordsDetectedArray: null,
			addingNewWord: false,
		};
	}
	componentDidMount = async () => {
		//   Get all contacts and save them into addedContacts
		// Only names of the contacts
		this.focusListener = this.props.navigation.addListener(
			"didFocus",
			async () => {
				this.setState({ word: null });
			}
		);
		console.log("tri");
		try {
			const response = await fetch(
				`${apiUrl}/api/hotword/get-hotword/${this.context.userId}`
			);

			const responseData = await response.json();
			if (!response.ok) {
				throw new Error(responseData.message);
			}

			this.setState({ hotWords: responseData.hotWords });
		} catch (err) {
			console.log(err);
		}
	};

	inputChangleHandler = (event, input) => {
		this.setState({ [input]: event });
	};
	startRecording = async () => {
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
			// console.log(recording);
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
	deleteRecordingFile = async () => {
		console.log("Deleting file");
		try {
			const info = await FileSystem.getInfoAsync(this.recording.getURI());
			await FileSystem.deleteAsync(info.uri);
		} catch (error) {
			console.log("There was an error deleting recording file", error);
		}
	};

	handleOnPressIn = () => {
		this.startRecording();
	};

	handleOnPressOut = async () => {
		await this.stopRecording();
		this.getTranscription();
	};

	getTranscription = async () => {
		this.setState({ isFetching: true, isLoaded: false });
		try {
			const { uri } = await FileSystem.getInfoAsync(this.recording.getURI());

			const formData = new FormData();
			formData.append("file", {
				uri,
				type: Platform.OS === "ios" ? "audio/x-wav" : "audio/m4a",
				name: Platform.OS === "ios" ? `${Date.now()}.wav` : `${Date.now()}.m4a`,
			});
			//   console.log("formdata", formData);

			const { data } = await axios.post(`${apiUrl1}/speech`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			//   console.log("transcript", data.transcript);
			this.setState({ transcript: data.transcript });
			let transcriptArray = data.transcript.split(" ");

			transcriptArray = await transcriptArray.filter(
				(item, index) => transcriptArray.indexOf(item) === index
			);

			this.setState({
				wordsDetectedArray: transcriptArray,
				word: null,
				isLoaded: true,
			});
			this.resetRecording();
		} catch (error) {
			console.log("There was an error reading file", error);
			this.stopRecording();
			this.resetRecording();
		}
		this.setState({ isFetching: false });
	};

	wordPosthandler = async () => {
		try {
			console.log(this.context.userId);
			this.setState({ isLoaded: false });
			const response = await fetch(
				`${apiUrl}/api/hotword/add-hotword/${this.context.userId}`,
				{
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						word: this.state.word,
					}),
				}
			);
			const responseData = await response.json();
			this.setState({ hotWords: responseData.hotWords });
			this.setState({
				isLoaded: true,
				word: null,
				addingNewWord: false,
				wordsDetectedArray: null,
			});
		} catch (err) {
			console.log(err);
		}
	};

	deleteWordHandler = async (word) => {
		//   delete acontact and update the addedContactarray
		try {
			//console.log(this.context.userId);
			this.setState({ isLoaded: false });
			const response = await fetch(
				`${apiUrl}/api/hotword/delete-hotword/${this.context.userId}/${word}`,
				{
					method: "DELETE",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				}
			);
			const responseData = await response.json();
			let addedHotwordsArray = this.state.hotWords;

			var removeIndex = addedHotwordsArray.indexOf(word);
			addedHotwordsArray.splice(removeIndex, 1);
			this.setState({ hotWords: addedHotwordsArray });
			this.setState({ isLoaded: true });
		} catch (err) {
			console.log(err);
		}
	};

	render() {
		console.log(this.state.wordsDetectedArray);
		const screenHeight = Dimensions.get("window").height;
		return (
			<View style={styles.mainContainer}>
				<View style={styles.backButton}>
					<ButtonRed
						text={<Icon name='long-arrow-left' size={20} color='#000' />}
						onPress={() => {
							this.props.navigation.goBack();
						}}
					/>
				</View>
				{!this.state.isLoaded && (
					<View
						style={{
							height: "100%",
							width: "100%",
							alignItems: "center",
							display: "flex",
							justifyContent: "center",
							position: "absolute",
							//zIndex: "100",
							elevation: 100,
							backgroundColor: "rgba(245, 0, 0, 0.1)",
						}}
					>
						<ActivityIndicator size='large' color='#FF6F91' />
					</View>
				)}
				<KeyboardAvoidingView
					behavior={Platform.OS == "ios" ? "padding" : "null"}
				>
					<View style={styles.container}>
						<View style={styles.form}>
							<Text style={{ fontSize: 29, paddingTop: 45 }}>
								Add Triggering Words
							</Text>
							{/* <Input
                icon="user"
                blurOnSubmit
                placeholder="Enter a word"
                onChangeText={(event) =>
                  this.inputChangleHandler(event, "word")
                }
                value={this.state.word}
              /> */}
							<Text>Hold the button to record your word.</Text>
							{this.state.isRecording ? (
								<Text>Recording your Voice.</Text>
							) : null}
							<View style={styles.triggerButtonContainer}>
								<TouchableOpacity
									style={styles.triggerButton}
									onPressIn={() => {
										this.startRecording();
										this.setState({ addingNewWord: true });
									}}
									onPressOut={() => {
										this.handleOnPressOut();
									}}
								>
									<Text style={{ color: "white", fontSize: 80 }}>
										<Icon name='microphone' size={35} color='#ffff' />
									</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.bottomView}>
							{this.state.wordsDetectedArray ? (
								<Text>Choose the word from the following.</Text>
							) : null}
							{this.state.wordsDetectedArray ? (
								<SafeAreaView
									style={{
										// flex: 1,
										width: "100%",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										// height: "50%",
										marginTop: 10,
										marginBottom: 10,
										maxHeight: "50%",
									}}
								>
									<ScrollView
										style={styles.scrollView}
										contentContainerStyle={{
											display: "flex",
											// width: 318,
											paddingTop: 25,
											paddingBottom: 25,
											// backgroundColor: "grey",
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										{this.state.wordsDetectedArray.length > 0 ? (
											this.state.wordsDetectedArray.map((word) => {
												if (word != "") {
													return (
														<View style={styles.hotWords} key={word}>
															<Text
																onPress={() => {
																	this.setState({ word: word });
																}}
																style={{ paddingLeft: 15, width: "80%" }}
															>
																{word.charAt(0).toUpperCase() + word.slice(1)}
															</Text>
															<Text>
																{this.state.word === word ? (
																	<Icon
																		name='check-circle'
																		size={20}
																		color='#000'
																	/>
																) : null}
															</Text>
														</View>
													);
												}
											})
										) : (
											<Text>No words are added yet!</Text>
										)}
									</ScrollView>
								</SafeAreaView>
							) : null}
							{this.state.wordsDetectedArray && this.state.word ? (
								<View style={styles.buttonView}>
									<Text
										style={{
											fontSize: 24,
											paddingRight: 10,
											fontWeight: "600",
										}}
									>
										Add
									</Text>
									<ButtonRed
										onPress={this.wordPosthandler}
										text={
											<Icon name='long-arrow-right' size={20} color='#000' />
										}
									/>
								</View>
							) : null}
							{this.state.wordsDetectedArray ? (
								<View style={{ ...styles.buttonView, paddingTop: "5%" }}>
									<Text
										style={{
											fontSize: 24,
											paddingRight: 10,
											fontWeight: "600",
										}}
									>
										Cancel
									</Text>
									<ButtonRed
										text={
											<Icon
												name='times'
												size={20}
												color='#000'
												onPress={() => {
													this.setState({
														wordsDetectedArray: null,
														addingNewWord: false,
													});
													// console.log("pressed");
												}}
											/>
										}
									/>
								</View>
							) : null}

							{/* </View> */}
							{this.state.addingNewWord ? null : (
								<Text style={{ fontSize: 24, paddingTop: 45 }}>
									Added Trigerring Words
								</Text>
							)}
							{this.state.addingNewWord ? null : (
								<SafeAreaView
									style={{
										flex: 1,
										width: "100%",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<ScrollView
										style={styles.scrollView}
										contentContainerStyle={{
											display: "flex",
											// width: 318,
											// backgroundColor: "grey",
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										{this.state.hotWords && this.state.hotWords.length > 0 ? (
											this.state.hotWords.map((word) => {
												return (
													<View style={styles.hotWords} key={Math.random()}>
														<Text style={{ paddingLeft: 15, width: "80%" }}>
															{word.charAt(0).toUpperCase() + word.slice(1)}
														</Text>
														<Icon
															name='times-circle'
															size={20}
															onPress={this.deleteWordHandler.bind(this, word)}
														/>
													</View>
												);
											})
										) : (
											<Text>No words are added yet!</Text>
										)}
									</ScrollView>
								</SafeAreaView>
							)}
						</View>
					</View>
				</KeyboardAvoidingView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%",
		alignItems: "center",
		justifyContent: "space-around",
		paddingTop: "10%",
	},
	triggerButton: {
		backgroundColor: "#D74A70",
		width: 100,
		height: 100,
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

	triggerButtonContainer: {
		// height: "30%",
		// backgroundColor: "red",
		// width: "100%",
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	backButton: {
		position: "absolute",
		left: 0,
		top: 0,
		margin: 50,
		elevation: 10,
		zIndex: 999,
		marginLeft: 20,
	},
	buttonView: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
	},
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
		paddingTop: 80,
		height: 350,
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
	// ========OTP========
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
	hotWords: {
		// backgroundColor: "black",
		height: 53,
		width: 318,
		// width: "100%",
		borderRadius: 30,
		zIndex: 999,
		shadowOpacity: 0.16,
		elevation: 5,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 13 },
		// flex: 1,
		marginTop: 20,
		paddingLeft: 15,
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
		backgroundColor: "#fff",
	},

	bottomView: {
		height: "60%",
		width: "100%",
		display: "flex",
		// overflow: "scroll",
		flexDirection: "column",
		// backgroundColor: "black",
		alignItems: "center",
		justifyContent: "center",
	},
	scrollView: {
		display: "flex",
		// backgroundColor: "grey",
		width: "100%",
		// justifyContent: "center",
	},
});
