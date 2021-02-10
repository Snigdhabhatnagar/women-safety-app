import React, { Component } from "react";
import "./Register.css";
import Container from "react-bootstrap/Container";

import Input from "../../Components/Input/Input";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
class Home extends Component {
	state = {
		email: "",
		password: "",
	};
	onSignInHandler = async () => {
		try {
			const response = await fetch(`http://localhost:5001/api/login`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: this.state.email,
					password: this.state.password,
				}),
			});
			const responseData = await response.json();
			console.log(responseData);
			if (responseData.token) {
				await this.context.login(
					responseData.userId,
					responseData.token,
					responseData.email,
					responseData.placeid
				);
				this.props.history.replace("cases");
			} else {
				console.log("Authentication Failed");
			}
		} catch (err) {
			console.log("error");
			console.log(err);
		}
	};

	setemailValueHandler = (value) => {
		this.setState({ email: value });
	};

	setPassswordValueHandler = (value) => {
		this.setState({ password: value });
	};

	submitHandler = () => {
		this.props.history.replace("home");
	};
	render() {
		return (
			<div className='bg'>
				<Container className='login-form'>
					<Row style={{ display: "flex", justifyContent: "center" }}>
						<h1>Register</h1>
					</Row>
					<Row>
						<Col className='dialog-box' md={{ span: 6, offset: 3 }}>
							<br />
							<div className='image'>
								<h1>
									<strong> Log In</strong>
									<br />{" "}
								</h1>
							</div>
							<Input
								id={1}
								label='Email'
								locked={false}
								active={false}
								type='text'
								setValue={this.setemailValueHandler}
							/>

							<Input
								id={2}
								label='Password'
								type='Password'
								locked={false}
								active={false}
								setValue={this.setPassswordValueHandler}
							/>
							<div className='forgot'>Forgot Password?</div>
							<br />
							<div className='submit'>
								<Button variant='custom' size='lg' onClick={this.submitHandler}>
									Submit
								</Button>
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Home;
