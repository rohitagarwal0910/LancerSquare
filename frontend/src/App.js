import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import fetchProjects from "./methods/fetchProjects";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer";
import ProjectsList from "./Components/ProjectsList";
import NewProject from "./Components/NewProject";
import ProjectDetails from "./Components/ProjectDetails";
import About from "./Components/About"

const App = () => {
    return (
        <Router>
            <div className="app">
                <Header />
                <div className="content">
                    <Route
                        exact
                        path="/"
                        render={() => (
                            <ProjectsList
                                title="All Projects"
                                fetch={fetchProjects.all}
                            />
                        )}
                    />
                    <Switch>
                        <Route
                            exact
                            path="/assigned"
                            render={() => (
                                <ProjectsList
                                    title="Assigned to me"
                                    fetch={fetchProjects.assigned}
                                />
                            )}
                        />
                        <Route
                            exact
                            path="/posted"
                            render={() => (
                                <ProjectsList
                                    title="Posted by me"
                                    fetch={fetchProjects.posted}
                                />
                            )}
                        />
                        <Route
                            exact
                            path="/details/:id"
                            render={(props) => (
                                <ProjectDetails id={props.match.params.id} />
                            )}
                        />
                        <Route exact path="/new" component={NewProject} />
                        <Route
                            exact
                            path="/by/:address"
                            render={(props) => (
                                <ProjectsList
                                    title={
                                        <div>
                                            Posted by
                                            <div
                                                style={{
                                                    fontFamily: "monospace",
                                                    fontSize: "15px",
                                                    overflowWrap: "break-word",
                                                }}
                                            >
                                                {props.match.params.address}
                                            </div>
                                        </div>
                                    }
                                    fetch={async () => {
                                        return await fetchProjects.by(
                                            props.match.params.address
                                        );
                                    }}
                                />
                            )}
                        />
                        <Route exact path="/about" component={About} />
                    </Switch>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
