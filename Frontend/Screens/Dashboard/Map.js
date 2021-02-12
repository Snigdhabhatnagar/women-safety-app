import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

import MapViewDirections from "react-native-maps-directions";
import getEnvVars from "../../environment";

const { GOOGLE_MAP_API_KEY } = getEnvVars();

class Map extends Component {
	componentDidMount = () => {
		console.log(this.props.coordinates);
	};
	render() {
		return (
			<View style={StyleSheet.absoluteFill}>
				<MapView
					provider={PROVIDER_GOOGLE}
					initialRegion={this.props.initialRegion}
					style={StyleSheet.absoluteFill}
					showsUserLocation={true}
					followUserLocation={true}
					onPress={this.onMapPress}
				>
					<MapViewDirections
						origin={this.props.coordinates[0]}
						destination={this.props.coordinates[1]}
						// waypoints={this.state.coordinates.slice(1, -1)}
						mode='WALKING'
						apikey={GOOGLE_MAP_API_KEY}
						language='en'
						strokeWidth={4}
						strokeColor='blue'
					/>
				</MapView>
			</View>
		);
	}
}

export default Map;
