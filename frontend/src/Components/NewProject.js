import React, { useState, useEffect } from "react";
import "../App.css";
import axios from "axios";
import hash from "object-hash";
import { fm, contract, web3 } from "../index";
import bigInt from "big-integer";

const NewProject = () => {
    const [formData, setFormData] = useState({
        name: "",
        by: "",
        shortDesc: "",
        description: "",
        checkpoints: [""],
        rewards: [""],
        contact: "",
    });

    useEffect(() => {
        fm.user.login();
    }, []);

    const [submitDisabled, setSubmitDisabled] = useState(false);

    const {
        name,
        by,
        shortDesc,
        description,
        checkpoints,
        rewards,
        contact,
    } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addCheckpoint = (e) => {
        e.preventDefault();
        setFormData({
            ...formData,
            checkpoints: [...checkpoints, ""],
            rewards: [...rewards, ""],
        });
    };

    const removeCheckpoint = (e, ind) => {
        e.preventDefault();
        setFormData({
            ...formData,
            checkpoints: checkpoints.filter((_, i) => i !== ind),
            rewards: rewards.filter((_, i) => i !== ind),
        });
    };

    const editCheckpoint = (e, ind) => {
        let newCheckpoints = [...checkpoints];
        newCheckpoints[ind] = e.target.value;
        setFormData({ ...formData, checkpoints: newCheckpoints });
    };

    const editReward = (e, ind) => {
        let newRewards = [...rewards];
        newRewards[ind] = e.target.value;
        setFormData({ ...formData, rewards: newRewards });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (submitDisabled) return;
        setSubmitDisabled(true);
        try {
            let totalReward = bigInt(0);
            rewards.forEach((r) => (totalReward = totalReward.add(bigInt(web3.utils.toWei(r, "ether")))));

            const projectData = {
                title: name,
                createdBy: by,
                reward: web3.utils.fromWei(totalReward.toString(), "ether"),
                shortDesc: shortDesc,
                about: {
                    checkpoints: checkpoints,
                    description: description,
                    contact: contact,
                },
            };
            console.log(projectData);

            const dataHash = hash(projectData);

            const newProject = await axios.post(
                "/api/projects/new",
                projectData
            );

            await fm.user.login();
            const accounts = await web3.eth.getAccounts();
            contract.methods
                .addProject(
                    "0x" + newProject.data._id,
                    "0x" + dataHash,
                    rewards.map((reward) => web3.utils.toWei("" + reward, "ether"))
                )
                .send({ from: accounts[0] })
                .once("transactionHash", (hash) => {
                    console.log(hash);
                })
                .once("receipt", (receipt) => {
                    console.log(receipt);
                    setSubmitDisabled(false);
                }).catch((error)=>{
                    console.log(error.message)
                    setSubmitDisabled(false);
                })
        } catch (error) {
            console.log(error.message);
            setSubmitDisabled(false);
        }
    };

    return (
        <div>
            <div className="pagetitle">New Project</div>
            <form
                className="form"
                onSubmit={(e) => {
                    onSubmit(e);
                }}
            >
                <input
                    type="text"
                    name="name"
                    placeholder="Title"
                    value={name}
                    onChange={(e) => onChange(e)}
                    required
                />
                <input
                    type="text"
                    name="by"
                    placeholder="Create As"
                    value={by}
                    onChange={(e) => onChange(e)}
                    required
                />
                {/* <input type="number" name="reward" placeholder="Reward" min="0" step="1" value={reward} onChange={(e)=>onChange(e)}/> */}
                <input
                    type="text"
                    name="shortDesc"
                    placeholder="One Line Description"
                    value={shortDesc}
                    onChange={(e) => onChange(e)}
                    required
                />
                <textarea
                    type="text"
                    name="description"
                    placeholder="Full Description"
                    value={description}
                    onChange={(e) => onChange(e)}
                    required
                />
                <input
                    type="text"
                    name="contact"
                    placeholder="Contact Info"
                    value={contact}
                    onChange={(e) => onChange(e)}
                    required
                />
                <div className="sectionTitle"> Checkpoints </div>
                {checkpoints.map((item, ind) => (
                    <div className="fcheckpoint" key={ind}>
                        <input
                            type="text"
                            className="fcheckpointdesc"
                            placeholder="Description"
                            value={item}
                            onChange={(e) => {
                                editCheckpoint(e, ind);
                            }}
                            required
                        />
                        <input
                            type="number"
                            className="formreward"
                            name="reward"
                            placeholder="Reward (in ETH)"
                            min="0"
                            step="0.000000000000000001"
                            value={rewards[ind]}
                            onChange={(e) => {
                                editReward(e, ind);
                            }}
                            required
                        />
                        {ind !== 0 && (
                            <button
                                className="fcpdelete fbutton"
                                value="Delete"
                                onClick={(e) => {
                                    removeCheckpoint(e, ind);
                                }}
                            >
                                X
                            </button>
                        )}
                    </div>
                ))}
                <button
                    className="fbutton fcpadd"
                    value="Add Checkpoint"
                    onClick={(e) => {
                        addCheckpoint(e);
                    }}
                >
                    Add Checkpoint
                </button>
                <button
                    className="fbutton fcpsubmit"
                    disabled={submitDisabled}
                    type="submit"
                >
                    {submitDisabled ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
};

export default NewProject;
