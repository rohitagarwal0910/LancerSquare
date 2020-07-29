import React from "react";
import "../../App.css";
import { Link } from "react-router-dom";

const card = (props) => {
    return (
        <Link to={"/details/" + props.id}>
            <div className="card">
                <div className="title">{props.title}</div>
                <div className="by">{props.by}</div>
                <div className="desc">
                    <div className="about">
                        {props.desc}
                    </div>
                </div>
                <div className="reward">
                    <div className="amount">{props.amount}</div>
                    <div>{props.currency}</div>
                </div>
            </div>
        </Link>
    );
};

export default card;
