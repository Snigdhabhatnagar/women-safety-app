import React, { Component } from "react";
import {
	withGoogleMap,
	withScriptjs,
	GoogleMap,
	DirectionsRenderer,
} from "react-google-maps";
class Map extends Component {
	state = {
		directions: null,
		initialRegion: null,
	};

	getCurrentLocation = () => {
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
			},
			(data) => {
				// console.log(data + "Inside socket emit");
			}
		);
	};

	componentDidMount = async () => {
		const directionsService = new window.google.maps.DirectionsService();

		await navigator.geolocation.watchPosition(
			async (position) => {
				// const { coordinate, routeCoordinates, distanceTravelled } = this.state;
				const { latitude, longitude } = position.coords;

				//console.log(latitude);

				//   try {
				//     const response = await fetch(
				//       `http://${apiUrl}/apirequest/getCurrentLocation`,
				//       {
				//         method: "POST",
				//         headers: {
				//           Accept: "application/json",
				//           "Content-Type": "application/json",
				//         },
				//         body: JSON.stringify({
				//           lat: latitude,
				//           long: longitude,
				//           _id: this.props.navigation.state.params._id,
				//         }),
				//       }
				//     );
				//     const responseData = await response.json();
				//     console.log("updated");
				//   } catch (err) {
				//     console.log("error");
				//     console.log(err);
				//   }
				// console.log(latitude, longitude);
				this.setState({ initialRegion: position.coords });
			},
			(error) => console.log(error),
			{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
		);
		console.log(this.state.initialRegion);
		const origin = { lat: 6.5244, lng: 3.3792 };
		const destination = { lat: 6.4667, lng: 3.45 };

		directionsService.route(
			{
				origin: origin,
				destination: destination,
				travelMode: window.google.maps.TravelMode.DRIVING,
				waypoints: [
					{
						location: new window.google.maps.LatLng(6.4698, 3.5852),
					},
					{
						location: new window.google.maps.LatLng(6.6018, 3.3515),
					},
				],
			},
			(result, status) => {
				if (status === window.google.maps.DirectionsStatus.OK) {
					console.log(result);
					this.setState({
						directions: result,
					});
				} else {
					console.error(`error fetching directions ${result}`);
				}
			}
		);
	};

	render() {
		const GoogleMapExample = withGoogleMap((props) => (
			<GoogleMap defaultCenter={{ lat: 6.5244, lng: 3.3792 }} defaultZoom={13}>
				<DirectionsRenderer directions={this.state.directions} />
			</GoogleMap>
		));

		return (
			<div>
				<GoogleMapExample
					containerElement={<div style={{ height: `500px`, width: "500px" }} />}
					mapElement={<div style={{ height: `80%` }} />}
				/>
			</div>
		);
	}
}

export default Map;
