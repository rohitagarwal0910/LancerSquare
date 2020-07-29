import React, { useState, useEffect } from "react";
import "../App.css";
import Card from "./ProjectCard/Card";
import axios from "axios";
import { Link } from "react-router-dom";

const ProjectsList = (props) => {
    const [list, setList] = useState([]);
    const [status, setStatus] = useState("Loading");
    const [notFoundList, setNotFoundList] = useState([]);

    useEffect(() => {
        setStatus("Loading");
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        let isMounted = true;
        const getProjects = async () => {
            try {
                console.log("getting ids");
                const idList = await props.fetch();
                if (idList.length > 0) {
                    console.log("getting projects");
                    const result = await axios.post(
                        "/api/projects/",
                        { ids: idList.map((id) => id.slice(2)) },
                        { cancelToken: source.token }
                    );
                    let projects = result.data;
                    projects.sort((a, b) => b._id.localeCompare(a._id));
                    setList(projects);
                    if (
                        props.title !== "All Projects" &&
                        projects.length !== idList.length
                    ) {
                        let notFoundProjects = idList;
                        setNotFoundList(
                            notFoundProjects.filter(
                                (element) =>
                                    !projects.some(
                                        (p) => "0x" + p._id === element
                                    )
                            )
                        );
                        setStatus("done");
                    } else if (projects.length > 0) setStatus("done");
                    else setStatus("No Projects Found");
                } else {
                    if (isMounted) setStatus("No Projects Found");
                }
            } catch (error) {
                console.log(error);
                if (isMounted) {
                    setStatus("Error");
                    if (error.code === -32603) setStatus("Login Required");
                }
            }
        };
        getProjects();
        return () => {
            source.cancel();
            isMounted = false;
        };
    }, [props.title]);

    return (
        <React.Fragment>
            <div className="pagetitle">{props.title}</div>
            {status === "done" ? (
                <React.Fragment>
                    {notFoundList.length > 0 ? (
                        <div className="notFound">
                            The following project(s) exists but their details
                            have not been found in database. They may have been
                            deleted by someone. Click on the id to see details.
                            <ul>
                                {notFoundList.map((i) => (
                                    <li key={i}>
                                        <Link
                                            to={`/details/${i.slice(2)}`}
                                            style={{ fontFamily: "monospace" }}
                                        >
                                            {i.slice(2)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    <div className="projects">
                        {list.map((item) => (
                            <Card
                                title={item.title}
                                key={item._id}
                                id={item._id}
                                by={item.createdBy}
                                desc={item.shortDesc}
                                amount={item.reward}
                                currency="ETH"
                            />
                        ))}
                    </div>
                </React.Fragment>
            ) : (
                <div className="status">{status}</div>
            )}
        </React.Fragment>
    );
};

export default ProjectsList;
