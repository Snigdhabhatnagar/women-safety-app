import logo from "./logo.svg";
import "./App.css";
import Button from "./Button";
import Register from "./Containers/Register/Register";
import { Route, Switch } from "react-router-dom";
import { Component } from "react";
import { AuthContext } from "./Components/Context/Auth-context";
import Home from "./Containers/Home/Home";

export default class App extends Component {
	state = {
		appIsReady: false,
		token: false,
		userId: false,
		email: false,
		placeid: false,
	};

	login = (uid, token, email, placeid) => {
		//console.log("called login");
		this.setState({
			token: token,
			userId: uid,
			email: email,
			placeid: placeid,
		});
	};

	logout = () => {
		//console.log("called logout");
		this.setState({ token: null, userId: null, email: null, placeid: null });
	};
	render() {
		return (
			<AuthContext.Provider
				value={{
					isLoggedIn: !!this.state.token,
					token: this.state.token,
					userId: this.state.userId,
					login: this.login,
					logout: this.logout,
					email: this.state.email,
					placeid: this.state.placeid,
				}}
			>
				<Switch>
					<Route exact path='/' component={Register} />
					<Route exact path='/home' component={Home} />
					{/* <Route exact path="/cases" component={Cases} />
          <Route exact path="/stats" component={Stats} />
          <Route
            path="/tracking/&:id"
            render={(props) => (
              <Track id={document.location.toString().split("&")[1]} />
            )}
          /> */}
				</Switch>
			</AuthContext.Provider>
		);
	}
}
