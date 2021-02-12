import React, { Component } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	ActivityIndicator,
	Keyboard,
} from "react-native";
import { NavigationActions, StackActions } from "react-navigation";
import Icon from "react-native-vector-icons/FontAwesome";
import Input from "../../Components/Input";
import ButtonRed from "../../Components/ButtonRed/ButtonRed";
import { AuthContext } from "../../Components/context/auth-context";
import getEnvVars from "../../environment";
const { apiUrl } = getEnvVars();

export default class EmergencyContacts extends Component {
	static contextType = AuthContext;
	state = {
		name: null,
		phoneNumber: null,
		addedContacts: [{}],
		isLoaded: true,
	};

	inputChangleHandler = (event, input) => {
		this.setState({ [input]: event });
	};

	componentDidMount = async () => {
		//   Get all contacts and save them into addedContacts
		try {
			const response = await fetch(
				`${apiUrl}/api/contacts/getcontact/${this.context.userId}`
			);

			const responseData = await response.json();
			if (!response.ok) {
				throw new Error(responseData.message);
			}
			this.setState({
				addedContacts: responseData.Users.map((object) => {
					return { name: object.name, id: object._id, number: object.contact };
				}),
			});
		} catch (err) {
			console.log(err);
		}
	};

	contactPostHandler = async () => {
		Keyboard.dismiss();
		//   Post a contact
		try {
			//console.log(this.context.userId);
			this.setState({ isLoaded: false });
			const response = await fetch(
				`${apiUrl}/api/contacts/addcontact/${this.context.userId}`,
				{
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						contactnum: this.state.phoneNumber,
						name: this.state.name,
					}),
				}
			);
			const responseData = await response.json();
			if (responseData.Users) {
				this.setState({
					addedContacts: responseData.Users.map((object) => {
						return { name: object.name, id: object._id };
					}),
				});
			}
			this.setState({ isLoaded: true, name: null, phoneNumber: null });
		} catch (err) {
			console.log(err);
		}
	};
	deleteContactHandler = async (contactid) => {
		//   delete acontact and update the addedContactarray
		try {
			this.setState({ isLoaded: false });
			const response = await fetch(
				`${apiUrl}/api/contacts/deletecontact/${this.context.userId}/${contactid}`,
				{
					method: "DELETE",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				}
			);
			const responseData = await response.json();
			let addedContactArray = this.state.addedContacts;

			var removeIndex = addedContactArray
				.map((item) => {
					return item.id;
				})
				.indexOf(contactid);
			addedContactArray.splice(removeIndex, 1);
			this.setState({ addedContacts: addedContactArray });
			this.setState({ isLoaded: true });
		} catch (err) {
			console.log(err);
		}
	};
	render() {
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
							elevation: 100,
						}}
					>
						<ActivityIndicator size='large' color='#FF6F91' />
					</View>
				)}

				<Text style={{ fontSize: 29, paddingTop: 70, paddingBottom: 20 }}>
					Emergency Contacts
				</Text>

				<View style={styles.form}>
					<Input
						icon='user'
						blurOnSubmit
						maxLength={10}
						placeholder='Enter Name'
						onChangeText={(event) => this.inputChangleHandler(event, "name")}
						value={this.state.name}
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
					<View style={styles.buttonView}>
						<Text style={{ fontSize: 24, paddingRight: 10, fontWeight: "600" }}>
							Add
						</Text>
						<ButtonRed
							onPress={this.contactPostHandler}
							text={<Icon name='long-arrow-right' size={20} color='#000' />}
						/>
					</View>
				</View>
				<View style={styles.bottomView}>
					<Text style={{ fontSize: 24, paddingTop: 45 }}>Added Contacts</Text>
					{this.state.addedContacts.length > 0 ? (
						this.state.addedContacts.map((contact) => {
							console.log(contact);
							return (
								<View style={styles.addedContacts} key={Math.random()}>
									<Icon name='user' size={20} />
									<View
										style={{
											paddingLeft: 15,
											paddingRight: 15,
											width: "80%",
											display: "flex",
											flexDirection: "row",
											justifyContent: "space-between",
										}}
									>
										<Text>{contact.name}</Text>
										<Text>{contact.number}</Text>
									</View>
									<Icon
										name='times-circle'
										size={20}
										onPress={this.deleteContactHandler.bind(this, contact.id)}
									/>
								</View>
							);
						})
					) : (
						<Text>No Emergency Contacts are added yet!</Text>
					)}
				</View>
				<View style={styles.buttonView}>
					<Text style={{ fontSize: 24, paddingRight: 10, fontWeight: "600" }}>
						Done
					</Text>
					<ButtonRed
						text={<Icon name='long-arrow-right' size={20} color='#000' />}
						onPress={() => {
							// this.props.navigation.navigate("Home");
							const resetAction = StackActions.reset({
								index: 0,
								actions: [NavigationActions.navigate({ routeName: "Home" })],
							});
							this.props.navigation.dispatch(resetAction);
						}}
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
	mainContainer: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%",
		alignItems: "center",
		justifyContent: "space-around",
		paddingTop: "10%",
	},
	golGol: {
		position: "absolute",
		padding: "0%",
		margin: "-1%",
		// bottom: 0,
		bottom: 0,
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
		top: 0,
		height: "70%",
		paddingBottom: 0,
		zIndex: -10,
		// backgroundColor: "black",

		left: 0,
	},
	form: {
		width: "100%",
		height: "40%",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "space-evenly",
	},
	buttonView: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
	},
	bottomView: {
		height: "60%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		// backgroundColor: "black",
		alignItems: "center",
	},
	addedContacts: {
		backgroundColor: "black",
		height: 53,
		width: 318,
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
});
