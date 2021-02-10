import React, { Component } from "react";
import { Route } from "react-router-dom";
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from "reactstrap";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

import { AuthContext } from "../Context/Auth-context";

class NavBar extends Component {
	static contextType = AuthContext;
	constructor(props) {
		super(props);
		this.toggle = this.toggle.bind(this);
		this.state = {
			isOpen: false,
			fixed: true,
		};
	}

	toggle() {
		this.setState({
			isOpen: !this.state.isOpen,
		});
	}
	userPostHandler = async () => {
		// post user
		try {
			await this.context.logout();
		} catch (err) {
			console.log(err);
		}

		// this.props.navigation.navigate("SignIn");
	};
	render() {
		return (
			<div>
				<Navbar
					style={{
						backgroundColor: "white",
						boxShadow: " -1px 4px 22px -3px rgba(0,0,0,0.75)",
						color: "#ff6f91",
					}}
					dark
					expand='md'
					sticky='top'
				>
					<NavbarBrand href='/'>
						<h3>
							{" "}
							<strong style={{ color: "#ff6f91" }}>Hi, Name</strong>
						</h3>
					</NavbarBrand>
					<NavbarToggler
						className=' custom-toggler navbar-toggler-icon'
						onClick={this.toggle}
					/>
					<Collapse isOpen={this.state.isOpen} navbar>
						<Nav className='ml-auto' navbar>
							<NavItem className='nav-item'>
								<NavLink to='/cases'>
									<span className='links '>
										<strong>Emergency Contacts</strong>
									</span>
								</NavLink>
							</NavItem>
							<NavItem className='nav-item'>
								<NavLink to='/stats'>
									<span className='links '>
										<strong>Trigger Words</strong>
									</span>
								</NavLink>
							</NavItem>

							<NavItem className='nav-item'>
								<NavLink to='/'>
									<span className='links ' onClick={this.userPostHandler}>
										<strong>Logout</strong>
									</span>
								</NavLink>
							</NavItem>
						</Nav>
					</Collapse>

					<br />
				</Navbar>
			</div>
		);
	}
}
export default NavBar;
