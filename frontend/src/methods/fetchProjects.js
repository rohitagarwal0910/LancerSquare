import { fm, web3, contract } from "../index";

const fetchProjects = {
    all: async () => {
        try {
            const data = await contract.methods.getAllProjects().call();
            return data;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    assigned: async () => {
        try {
            await fm.user.login();
            const accounts = await web3.eth.getAccounts();
            const data = await contract.methods
                .getAssigneeProjects(accounts[0])
                .call();
            return data;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    posted: async () => {
        try {
            await fm.user.login();
            const accounts = await web3.eth.getAccounts();
            const data = await contract.methods
                .getClientProjects(accounts[0])
                .call();
            console.log(data);
            return data;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    by: async (address) => {
        try {
            const data = await contract.methods
                .getClientProjects(address)
                .call();
                console.log(data);
            return data;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
};

export default fetchProjects;
