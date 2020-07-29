import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { web3, contract, fm } from "../index";
import axios from "axios";
import "../App.css";
import hash from "object-hash";
import tickicon from "./tick-icon.png";
import bigInt from "big-integer";

const ProjectDetails = (props) => {
    const [project, setProject] = useState({ title: "Project Details" });
    const [status, setStatus] = useState("Loading");
    const [assignee, setAssignee] = useState("");
    const [update, setUpdate] = useState(0);
    const zeroAddress = "0x0000000000000000000000000000000000000000";

    const payReward = async (e, ind) => {
        e.preventDefault();
        try {
            await fm.user.login();
            const accounts = await web3.eth.getAccounts();
            contract.methods
                .checkpointCompleted("0x" + props.id, ind)
                .send({ from: accounts[0] })
                .once("transactionHash", (hash) => {
                    console.log(hash);
                })
                .once("receipt", (receipt) => {
                    console.log(receipt);
                    setUpdate((old) => old + 1);
                });
        } catch (error) {
            console.log(error);
            setUpdate((old) => old + 1);
        }
    };

    const assign = async (e) => {
        e.preventDefault();
        try {
            let remainingReward = bigInt(0);
            project.about.rewards.forEach((element, ind) => {
                if (!project.about.completed[ind])
                    remainingReward = remainingReward.add(
                        bigInt(web3.utils.toWei(element, "ether"))
                    );
            });
            console.log(remainingReward);
            await fm.user.login();
            const accounts = await web3.eth.getAccounts();
            contract.methods
                .assign("0x" + props.id, assignee)
                .send({
                    from: accounts[0],
                    value: remainingReward.toString(),
                })
                .once("transactionHash", (hash) => {
                    console.log(hash);
                })
                .once("receipt", (receipt) => {
                    console.log(receipt);
                    setUpdate((old) => old + 1);
                });
        } catch (error) {
            console.log(error);
        }
    };

    const unassign = async (e) => {
        e.preventDefault();
        try {
            await fm.user.login();
            const accounts = await web3.eth.getAccounts();
            contract.methods
                .unassign("0x" + props.id)
                .send({ from: accounts[0] })
                .once("transactionHash", (hash) => {
                    console.log(hash);
                })
                .once("receipt", (receipt) => {
                    console.log(receipt);
                    setUpdate((old) => old + 1);
                });
        } catch (error) {
            console.log(error);
            setUpdate((old) => old + 1);
        }
    };

    const deleteProject = async (e) => {
        e.preventDefault();
        try {
            await fm.user.login();
            const accounts = await web3.eth.getAccounts();
            contract.methods
                .deleteProject("0x" + props.id)
                .send({ from: accounts[0] })
                .once("transactionHash", (hash) => {
                    console.log(hash);
                })
                .once("receipt", (receipt) => {
                    console.log(receipt);
                    setUpdate((old) => old + 1);
                });
        } catch (error) {
            console.log(error);
            setUpdate((old) => old + 1);
        }
    };

    useEffect(() => {
        setStatus("Loading");
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        let isMounted = true;
        const getProject = async () => {
            try {
                const contractData = await contract.methods
                    .getProject("0x" + props.id)
                    .call();
                let projectData = {};
                projectData.client = contractData[0];
                projectData.assignee = contractData[1];
                projectData.about = {};
                projectData.about.rewards = [];
                projectData.reward = bigInt(0);
                contractData[3].forEach((i) => {
                    projectData.about.rewards.push(
                        web3.utils.fromWei(i, "ether")
                    );
                    projectData.reward = projectData.reward.add(bigInt(i));
                });
                projectData.reward = web3.utils.fromWei(
                    projectData.reward.toString(),
                    "ether"
                );
                projectData.about.completed = contractData[4];
                const createdOn = new Date(parseInt(contractData[5]) * 1000);
                projectData.creationTime = createdOn.toLocaleString("en", {
                    hour12: "true",
                    timeZoneName: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                });
                projectData.userIsClient = false;
                projectData.userIsAssignee = false;

                if (await fm.user.isLoggedIn()) {
                    const accounts = await web3.eth.getAccounts();
                    if (accounts[0] === projectData.client) {
                        projectData.userIsClient = true;
                    } else if (accounts[0] === projectData.assignee) {
                        projectData.userIsAssignee = true;
                    }
                }

                let dbData = await axios
                    .get(`/api/projects/${props.id}`, {
                        cancelToken: source.token,
                    })
                    .catch(async (error) => {
                        if (error.message.endsWith("404")) {
                            document
                                .getElementById("details")
                                .classList.add("error");
                            projectData.about.checkpoints = [];
                            projectData.about.rewards.forEach((_) => {
                                projectData.about.checkpoints.push("Not found");
                            });
                            if (isMounted) {
                                setProject(projectData);
                                setStatus("done");
                            }
                        }
                        throw error;
                    });
                dbData = dbData.data;
                delete dbData.__v;
                delete dbData._id;
                console.log(dbData);
                console.log(hash(projectData), contractData[2]);
                projectData.hashMatch = "0x" + hash(dbData) === contractData[2];
                projectData.about.description = dbData.about.description;
                projectData.about.checkpoints = dbData.about.checkpoints;
                projectData.about.contact = dbData.about.contact;
                projectData.createdBy = dbData.createdBy;
                projectData.shortDesc = dbData.shortDesc;
                projectData.title = dbData.title;

                console.log(projectData);
                console.log(contractData);

                if (isMounted) {
                    if (projectData.hashMatch === false) {
                        document
                            .getElementById("details")
                            .classList.add("error");
                    }
                    setProject(projectData);
                    setStatus("done");
                }
            } catch (error) {
                console.log(error);
                if (isMounted) {
                    if (
                        error.message.endsWith("Project does not exist") ||
                        error.message.includes("INVALID_ARGUMENT")
                    ) {
                        setStatus("Project Not Found");
                    } else if (!error.message.endsWith("404")) {
                        setStatus("Error");
                    }
                }
            }
        };
        getProject();
        return () => {
            source.cancel();
            isMounted = false;
        };
    }, [props.id, update]);

    return (
        <React.Fragment>
            <div className="pagetitle" id="pdtitle">
                {project.title}
                <div className="projectid">id: {props.id}</div>
                <div className="pdhash">
                    {status === "done" ? (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            {project.hashMatch ? (
                                <React.Fragment>
                                    <img
                                        src={tickicon}
                                        alt=""
                                        style={{ width: "15px" }}
                                    />
                                    <div>&nbsp;Hash Verified</div>
                                </React.Fragment>
                            ) : (
                                <div style={{ color: "red" }}>
                                    Hash does not match
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
            <div id="details">
                {status !== "done" ? (
                    <div className="status">{status}</div>
                ) : (
                    <React.Fragment>
                        <div className="details">
                            <div></div>
                            {project.hashMatch ? null : (
                                <div className="pdshortDesc">
                                    Project hash does not match. Data has been
                                    possibly tempered with or deleted by
                                    someone. Only the created by address,
                                    assignee addresses, posted on date and time,
                                    checkpoint rewards and checkpoints
                                    completion status are secure and trustable.
                                    If you posted this project then delete it to
                                    get any remaining reward held in the smart
                                    contract back.
                                </div>
                            )}
                            <div className="pdshortDesc">
                                {project.shortDesc}
                            </div>
                            <div className="pdlabel">total reward</div>
                            <div className="pdtotal">{project.reward} ETH</div>
                            <div className="pdlabel">created by</div>
                            <div>
                                <div>{project.createdBy}</div>
                                <div
                                    style={{
                                        fontFamily: "monospace",
                                        fontSize: "small",
                                        color: "teal",
                                        width: "64vw",
                                        overflowWrap: "break-word",
                                    }}
                                >
                                    <Link to={`/by/${project.client}`}>
                                        {project.client}
                                    </Link>
                                </div>
                            </div>
                            <div className="pdlabel">assigned to</div>
                            <div>
                                <div
                                    style={{
                                        fontFamily: "monospace",
                                        fontSize: "small",
                                        marginTop: "4px",
                                    }}
                                >
                                    {project.assignee !== zeroAddress
                                        ? project.assignee
                                        : "unassigned"}
                                </div>
                            </div>
                            <div className="pdlabel">about</div>
                            <div>
                                <div>{project.about.description}</div>
                                <br />
                                <div>{project.about.contact}</div>
                            </div>
                            <div className="pdlabel">Posted on</div>
                            <div>{project.creationTime}</div>
                            <div
                                className="pdlabel"
                                style={{ marginTop: "8px" }}
                            >
                                checkpoints
                            </div>
                            <div>
                                {project.about.checkpoints.map((cp, ind) => {
                                    return (
                                        <div key={ind} className="pdcp">
                                            <div className="pdcpstatus">
                                                {project.about.completed[
                                                    ind
                                                ] ? (
                                                    <img
                                                        src={tickicon}
                                                        alt=""
                                                        className="pdcptick"
                                                    />
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                            <div className="pdcpdesc">{cp}</div>
                                            <div className="pdcprow2">
                                                <div className="pdcpreward">
                                                    {project.about.rewards[ind]}{" "}
                                                    ETH
                                                </div>
                                                {project.userIsClient &&
                                                project.assignee !==
                                                    zeroAddress &&
                                                !project.about.completed[
                                                    ind
                                                ] ? (
                                                    <button
                                                        className="pdcppay fbutton"
                                                        onClick={(e) => {
                                                            payReward(e, ind);
                                                        }}
                                                    >
                                                        Pay Reward
                                                    </button>
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {project.hashMatch &&
                            project.userIsClient &&
                            project.assignee === zeroAddress ? (
                                <React.Fragment>
                                    <div
                                        className="pdlabel"
                                        style={{ marginTop: "10px" }}
                                    >
                                        assign to
                                    </div>
                                    <div className="pdassign">
                                        <input
                                            type="text"
                                            className="pdassignfield"
                                            name="assignto"
                                            placeholder="Enter Address"
                                            onChange={(e) => {
                                                e.preventDefault();
                                                setAssignee(e.target.value);
                                            }}
                                            required
                                        />
                                        <button
                                            className="pdassignbutton fbutton"
                                            onClick={(e) => {
                                                assign(e);
                                            }}
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </React.Fragment>
                            ) : null}
                        </div>
                        <div className="pdactions">
                            {project.userIsAssignee ||
                            (project.userIsClient &&
                                project.assignee !== zeroAddress) ? (
                                <button
                                    className="pdunassign fbutton"
                                    onClick={(e) => {
                                        unassign(e);
                                    }}
                                >
                                    {project.userIsAssignee
                                        ? "Leave Project"
                                        : "Unassign"}
                                </button>
                            ) : null}
                            {project.userIsClient ? (
                                <button
                                    className="pddelete fbutton"
                                    onClick={(e) => {
                                        deleteProject(e);
                                    }}
                                >
                                    Delete
                                </button>
                            ) : null}
                        </div>
                    </React.Fragment>
                )}
            </div>
        </React.Fragment>
    );
};

export default ProjectDetails;
