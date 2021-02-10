import React, { Component } from "react";
import "./App.css";
import axios from "axios";
class Button extends Component {
	constructor() {
		super();
		this.state = { text: "" };
	}

	async onListenClick() {
		const response = await axios.get(
			"http://localhost:3002/api/speech-to-text/"
		);
		console.log(response);
		this.setState({ text: response.data });
	}

	render() {
		return (
			<div className='App'>
				<button onClick={this.onListenClick.bind(this)}>Start</button>
				<div style={{ fontSize: "40px" }}>{this.state.text}</div>
			</div>
		);
	}
}

export default Button;
