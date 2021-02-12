import React, { Component } from "react";

import {
	View,
	Image,
	Text,
	StyleSheet,
	Modal,
	Dimensions,
	ActivityIndicator,
	TouchableHighlight,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

import Icon from "react-native-vector-icons/FontAwesome";
import ButtonRed from "../../Components/ButtonRed/ButtonRed";
import { TouchableOpacity } from "react-native-gesture-handler";
import Alarm from "../../assets/alarm.png";
import call from "react-native-phone-call";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import getEnvVars from "../../environment";
import { AuthContext } from "../../Components/context/auth-context";
import Map from "./Map";
const { apiUrl, GOOGLE_MAP_API_KEY, OPENCAGE_API } = getEnvVars();

export default class Dashboard extends Component {
	static contextType = AuthContext;

	constructor(props) {
		super(props);

		this.mapView = null;
	}

	state = {
		initialRegion: null,
		modalVisible: true,
		counter: 0,
		location: null,
		locationname: null,
		locationForAlert: null,
		coordsDirectionsOrigin: null,
		coordsDirectionsDestination: null,
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

	homeNavHandler = () => {
		this.props.navigation.navigate("Home");
	};

	componentDidMount = async () => {
		await this.getCurrentLocation();

		await this.triggerHandler();

		this.alarmHandler(this.state.counter + 1);
		this.setState({ counter: this.state.counter + 1 });
	};

	getCurrentLocation = async () => {
		await navigator.geolocation.getCurrentPosition(
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
			},
			(data) => {
				// console.log(data + "Inside socket emit");
			}
		);
	};
	alarmHandler = async (counter) => {
		if (counter % 2 == 1) {
			this.backgroundMusic = new Audio.Sound();
			try {
				await this.backgroundMusic.loadAsync(require("../../assets/siren.wav"));
				await this.backgroundMusic.setIsLoopingAsync(true);
				await this.backgroundMusic.playAsync();
			} catch (error) {
				console.log(err);
			}
		} else {
			this.backgroundMusic.stopAsync();
		}
	};
	triggerHandler = async () => {
		let { status } = await Location.requestPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg("Permission to access location was denied");
		}

		let location = await Location.getCurrentPositionAsync({});
		this.setState({ location: location });
		try {
			const response = await fetch(
				`${apiUrl}/api/contacts/getcontact/${this.context.userId}`
			);

			const responseData = await response.json();
			// console.log(responseData);
			if (!response.ok) {
				throw new Error(responseData.message);
			}
			this.setState({
				addedContacts: responseData.Users.map((object) => {
					if (object) {
						let num = object.contact.toString();
						num = "91" + num;
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
			this.setState({
				locationForAlert: responseData.results[0].formatted,
			});
		} catch (err) {
			console.log(err);
		}

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
	ambulanceHandler = () => {
		const args = {
			number: "000",
			prompt: false,
		};
		call(args).catch(console.error);
	};
	toggleAlarmHandler = () => {
		this.alarmHandler(this.state.counter + 1);
		this.setState({ counter: this.state.counter + 1 });
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
				<View style={styles.buttonsContainer}>
					<TouchableOpacity
						style={styles.emergencyButtons}
						onPress={this.ambulanceHandler}
					>
						<Icon name={"ambulance"} size={90} color='#D74A70' />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.emergencyButtons}
						onPress={this.ambulanceHandler}
					>
						<Icon name={"mobile"} size={90} color='#D74A70' />
					</TouchableOpacity>
				</View>
				<View style={styles.buttonsContainer}>
					<TouchableOpacity
						style={{ ...styles.emergencyButtons, padding: 15 }}
						onPress={this.ambulanceHandler}
					>
						<Image source={Alarm} style={{ width: "100%", height: "100%" }} />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.emergencyButtons}
						onPress={this.toggleAlarmHandler}
					>
						<Icon name={"bullhorn"} size={90} color='#D74A70' />
					</TouchableOpacity>
				</View>

				<Modal
					animationType='slide'
					transparent={true}
					visible={this.state.modalVisible}
					onRequestClose={() => {
						Alert.alert("Closed");
					}}
				>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Text style={styles.modalText}>
								Your Emergency Contacts have been informed!
							</Text>

							<TouchableHighlight
								style={styles.buttonOnSuccess}
								onPress={() => {
									this.setState((prevState) => ({
										modalVisible: false,
									}));
								}}
							>
								<Text style={{ color: "white", alignSelf: "center" }}>
									Close
								</Text>
							</TouchableHighlight>
						</View>
					</View>
				</Modal>
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
		// paddingTop: 30,
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
	mapContainer: {
		height: "60%",
		backgroundColor: "grey",
		width: "100%",
		shadowOpacity: 0.16,
		elevation: 10,
		zIndex: 998,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 0 },
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
	buttonsContainer: {
		width: "100%",
		height: "20%",
		display: "flex",

		flexDirection: "row",
		// flexWrap: "wrap",
		// flex: 1,
		justifyContent: "space-around",
		// alignContent: "space-around",
	},

	emergencyButtons: {
		width: 130,
		height: 120,
		backgroundColor: "white",
		margin: 10,
		borderRadius: 27,

		shadowOpacity: 0.2,
		elevation: 5,
		zIndex: 999,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 5 },
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	buttonOnSuccess: {
		borderRadius: 30,
		width: 60,
		height: 29,
		backgroundColor: "#FF6F91",
		// shadowColor: "rgba(0, 0, 0, 0.16)",
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
