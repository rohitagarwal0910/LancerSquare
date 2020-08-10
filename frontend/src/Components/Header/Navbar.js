import React from "react";
import "../../App.css";
import { Link } from "react-router-dom";
import { fm } from "../../index";

const navbar = () => {

    const openAccount = async () => {
        fm.user.settings();
    };

    return (
        <div className="navbar">
            <Link to="/" className="navbarlink">
                All Projects
            </Link>
            <Link to="/assigned" className="navbarlink">
                Assigned to me
            </Link>
            <Link to="/posted" className="navbarlink">
                Posted by me
            </Link>
            <Link to="/new" className="navbarlink">
                Post New Project
            </Link>
            <Link to="/about" className="navbarlink">
                About
            </Link>
            <div className="navbarlink" onClick={openAccount}>
                Account
            </div>
        </div>
    );
};

export default navbar;
