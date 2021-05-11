# Smart Contract

There two different versions of smart contract written for LancerSquare. The main version consists basic methods which allow making, assigning and unassigning a project. The extended version also consists some methods for adding more features to LancerSquare.

## Main Version
LancerSqaure is based on this version of the smart contract. It is deployed on Ropsten at [0x53195d8116b87abef1707f854f4679263bc00d8a](https://ropsten.etherscan.io/address/0x53195d8116b87abef1707f854f4679263bc00d8a#code).

Basic function description -
* ```addProject()``` - used for adding a project. Takes id, SHA1 hash of data stored on MongoDB and checkpoint rewards as input and stores it in a mapping. Function is non payable and client does not pay any reward money at this point.
* ```assign()``` - can only be called by client and is used to assign a project to someone. The function is payable and it is required that client deposits the reward amount at this point.
* ```checkpointCompleted()``` - can only be called by client. Takes an uint as input and marks that checkpoint number as completed and tranfers the corresponding reward to the assignee.
* ```unassign()``` - can only be called by client or the assignee to unassign an user from a project. Any unpaid reward held in smart contract is refunded to the client.
* ```delete()``` - can only be called by client. Deletes the project data from the smart contract. Calls ```unassign()``` if needed.

Apart from this, getter functions, events and modifiers are defined.

## Extended Version
It consists of some more functions which can be used to support the following functions in a more feature rich platform -
* Changing project details\
Clients will be able to change details of a project. However, if a project is already assigned, it will require a confirmation from the assignee too for bringing the changes in effect. Initial implementation for this is complete though it may need changes for better optimisation.
* Offering projects\
Instead of directly assigning a project to someone, client will instead "offer" a project to a user who can then choose to accept or reject a project. Initial implementation for this is complete though it may need changes for better optimisation.
* Bidding Mechanism\
Freelancers can make bids on a project stating the reward they will expect and the time they require to complete the task. Clients can then see the bids and assign the project to one of the bidders.

*Extended contract still needs some work to be able to support these functions and some optimisations for reduced gas usage.*
