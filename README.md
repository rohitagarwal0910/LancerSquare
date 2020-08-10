# LancerSquare

LancerSquare is a prototype of a freelancing platform which stores it's data on blockchain.
Blockchain ensures that the data is always secure and can not be tampered with and provides a secure and integrated payment system too.

Application deployed on Heroku at [lancersquare.herokuapp.com](https://lancersquare.herokuapp.com), currently running on Ropsten Test network.\
Smart Contract deployed at address [0x53195d8116b87abef1707f854f4679263bc00d8a](https://ropsten.etherscan.io/address/0x53195d8116b87abef1707f854f4679263bc00d8a#code).

## Basic Overview
Idea of LancerSqaure is to ease the difficulties faced by freelancers now-a-days such as unsurity about payment and high fees charged by middlemen.
Blockchain can help by guaranteeing payments with help of smart contracts, providing security and an integrated payment system which can save time delays and fees in cases of international payments and its decentralised nature means there is no middleman to charge fees.

LancerSqaure is a simple implementation of the above idea. New projects can be created by users (reffered to as creators, posters or clients) which are then listed on the website. Freelancers (reffered to as assignees) can look through these projects and contact the clients who can then assign their projects to the freelancer they like.\
Before assigning a project, the clients have to deposit the reward money in a smart contract (kind of like an escrow) that can be released upon completion of the task. Through this, assignees can verify that the client indeed have enough money to fund the project. Temper-proof nature of blockchain ensures that all the data is secured.

Read the original pitch [here](https://github.com/Zubi-io/Project-Ideas/issues/11)

### Architecture
The architecture was designed so that a balance is kept between security and costs.
It is developed using solidity for smart contract development, MERN Stack for the application layer and [Fortmatic](https://fortmatic.com) as web3 and public node access provider.

Each project consists of details such as task description, contact info, the client address, the assignee address and reward.\
While creating a project, data such as description and contact info (which are expensive to store on a blockchain) are stored on a MongoDB database whereas all sensitive data such as addresses of people and details of money involved are stored on the blockchain. To guarantee the authenticy of data stored on MongoDB, a SHA1 hash of the data is also stored in blockchain which can be verified anytime to check if the data is correct.

For seeing details of a project, the user application queries both MongoDB and the blockchain to collect all the pieces of project data. Then it calculates the SHA1 hash of the data stored in the MongoDB and matches it with the hash stored in blockchain to verify its authenticity.\
*Even if MongoDB database is compromised in future, no loss will be faced by anyone as it can be easily detected.*\
Instead of MongoDB, decentralised file storage systems such as [IPFS](https://ipfs.io) can be used for a truly decentralised platform.

### Smart Contract
Checkout [Smart Contract](https://github.com/rohitagarwal0910/LancerSquare/tree/master/Smart%20Contract) folder to know more.
