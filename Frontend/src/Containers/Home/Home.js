import React from "react";
import { useEffect } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import micIcon from "../../Assets/mic.svg";
import "./Home.css";
import { withScriptjs } from "react-google-maps";
import Map from "../../Components/Map/Map";
import { Container, Row } from "react-bootstrap";
import Navbar from "../../Components/Navbar/Navbar";

const Home = () => {
	const {
		error,
		isRecording,
		results,
		startSpeechToText,
		stopSpeechToText,
	} = useSpeechToText({
		continuous: true,
		crossBrowser: true,
		googleApiKey: "AIzaSyBtKHZSd57mVAJa12yKnHaI-45v1Nqnk-s",
		timeout: 100000000,
	});
	const MapLoader = withScriptjs(Map);
	console.log(results);
	if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

	return (
		<div>
			<Navbar />

			<Container>
				{/* <Row style={{ display: "flex", justifyContent: "center" }}>
					<MapLoader
						googleMapURL='https://maps.googleapis.com/maps/api/js?key=AIzaSyCYoXYOQAcYfCEHnAAetDKVpVhYViCiv6E'
						loadingElement={<div style={{ height: `100%` }} />}
					/>
				</Row> */}

				<Row style={{ display: "flex", justifyContent: "center" }}>
					{/* <h1>Recording: {isRecording.toString()}</h1> */}
					<button
						className='image'
						onClick={isRecording ? stopSpeechToText : startSpeechToText}
						data-recording={isRecording}
					>
						{/* {isRecording ? "Stop Recording" : "Start Recording"} */}

						<img className='image1' src={micIcon} alt='' />
					</button>
				</Row>
				<ul>
					{results.map((result, index) => (
						<li key={index}>{result}</li>
					))}
				</ul>
			</Container>
		</div>
	);
};
export default Home;
