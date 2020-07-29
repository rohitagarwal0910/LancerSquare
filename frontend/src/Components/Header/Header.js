import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "../../App.css";
import { fm } from "../../index";
import { Link } from "react-router-dom";

const Header = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const showLoading = async () => {
            console.log("web3 loading");
            await fm.user.isLoggedIn();
            console.log("loaded");
            document.getElementById("header").classList.remove("loading");
            setLoading(false);
        };
        showLoading();
    }, []);

    return (
        <div className="top">
            <Link to="/" className="header loading" id="header">
                LANCER
                <br />
                SQUARE
                <br />
                {loading ? (
                    <div className="loadingweb3">loading web3</div>
                ) : null}
            </Link>
            <Navbar />
        </div>
    );
};

export default Header;
