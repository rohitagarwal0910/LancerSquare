pragma solidity ^0.6.11;

contract LancerSquare {
    
    address public owner;
    
    struct Checkpoint {
        uint reward;
        bool completed;
    }
    
    //project desciption will be stored in a db, only its hash is stored here for proving that desciption has not been changed.
    //client - the one who created the project.
    //assignee - the freelancer
    struct Project {
        address payable client;
        address payable assignee;
        string projectHash;
        uint remainingReward;
        Checkpoint[] checkpoints;
    }
    
    //Clients can propose changes to the project details but performing those changes will require approval from assignee too.
    //This struct stores the proposal
    struct ProposedChange{
        string newProjectHash;
        uint newRemainingReward;
        Checkpoint[] newCheckpoints;
    }
    
    //mapping from project id (created by backend) to Project struct. Stores all projects.
    mapping (string => Project) projects;
    //storing project details change proposals in a mapping
    mapping (string => ProposedChange) proposedChanges;
    
    
    constructor() public {
        owner = msg.sender;
    }
    
    
    //---------MODIFIERS---------
    modifier isProjectClient(string memory _id) {
        require(msg.sender == projects[_id].client, "Only client is allowed to do this");
        _;
    }
    
    modifier isAssignee(string memory _id) {
        require(msg.sender == projects[_id].assignee, "Only assignee can do this");
        _;
    }
    
    modifier projectExists(string memory _id){
        require(bytes(projects[_id].projectHash).length > 0, "Project does not exist");
        _;
    }
    
    modifier proposalExists(string memory _id){
        require(bytes(proposedChanges[_id].newProjectHash).length > 0, "Proposal does not exist");
        _;
    }
    
    //When a change is propsed and not yet approved or rejected by the assignee or deleted by the client, the project "pauses".
    //This is for better money management because making and accepting/rejecting proposals also include value transfers.
    modifier proposalDoesNotExist(string memory _id){
        require(bytes(proposedChanges[_id].newProjectHash).length == 0, "Proposal pending review exists");
        _;
    }
    //---------------------------
    
    
    //Add project. For Checkpoint only reward values as uint[] is passed. By default all checkpoints.completed == false.
    //In case client does not want to have a checkpoint based reward, a single checkpoint corresponding to 100% completion will be made (handled by stack appliaction).
    function addProject(string memory _id, string memory _projectHash, uint[] memory _checkpointRewards) public returns (bool){
        require(bytes(_id).length > 0, "id required");
        require(bytes(_projectHash).length > 0, "Project Hash required");
        require(_checkpointRewards.length > 0, "Checkpoints required");
        require(bytes(projects[_id].projectHash).length == 0, "Project already added");
        for (uint i=0; i<_checkpointRewards.length; i++){
            projects[_id].checkpoints.push(Checkpoint(_checkpointRewards[i], false));
            projects[_id].remainingReward += _checkpointRewards[i];
        }
        projects[_id].client = msg.sender;
        projects[_id].projectHash = _projectHash;
        return true;
    }
    
    //Assign project. Client will also have to transfer value to smart contract at this point.
    function assign(string memory _id, address payable assigneeAddress) projectExists(_id) isProjectClient(_id) payable public returns(bool){
        require(projects[_id].assignee == address(0), "Project already assigned");
        require(msg.value == projects[_id].remainingReward, "Wrong amount submitted");
        projects[_id].assignee = assigneeAddress;
        return true;
    }
    
    //unassign project and tranfer remainingReward back to the client
    function unassign(string memory _id) projectExists(_id) isProjectClient(_id) proposalDoesNotExist(_id) public returns(bool) {
        require(projects[_id].assignee != address(0), "Project not yet assigned");
        projects[_id].assignee = address(0);
        if(projects[_id].remainingReward>0) {
            msg.sender.transfer(projects[_id].remainingReward);
        }
        return true;
    }
    
    //delete project. Requires unassigning first so that remainingReward is not lost.
    function deleteProject(string memory _id) projectExists(_id) isProjectClient(_id) proposalDoesNotExist(_id) public returns(bool) {
        require(projects[_id].assignee == address(0), "Unassign project first");
        delete projects[_id];
        return true;
    }
    
    //mark checkpoint as completed and transfer reward
    function checkpointCompleted(string memory _id, uint index) projectExists(_id) isProjectClient(_id) proposalDoesNotExist(_id) public returns(bool) {
        require(!projects[_id].checkpoints[index].completed, "Checkpoint already completed");
        projects[_id].checkpoints[index].completed = true;
        projects[_id].remainingReward -= projects[_id].checkpoints[index].reward;
        projects[_id].assignee.transfer(projects[_id].checkpoints[index].reward);
        return true;
    }
    
    //Creates a proposal for changing project details. If unassigned, the changes are done in this step only.
    //If assigned, then proposal is stored in the proposedChanges mapping.
    //If assigned and if reward is increased, the change in reward must be paid by client here only.
    //If assigned and if reward is decreased, the change will be paid back to client when proposal is accepted by the assignee.
    //At a time, only a single proposal can exists for a project.
    function createProposal(string memory _id, uint[] memory _checkpointRewards, bool[] memory _checkpointsCompleted, string memory _newProjectHash) projectExists(_id) isProjectClient(_id) proposalDoesNotExist(_id) payable public returns(bool){
        require(bytes(_newProjectHash).length > 0, "Project Hash required");
        require(_checkpointRewards.length > 0, "Checkpoints required");
        require(_checkpointRewards.length == _checkpointsCompleted.length, "Array lengths do not match");
        uint newAmountToBePaid = 0;
        if (projects[_id].assignee == address(0)) {
            delete projects[_id].checkpoints;
            for (uint i = 0; i<_checkpointRewards.length; i++){
                if(!_checkpointsCompleted[i]){
                    newAmountToBePaid += _checkpointRewards[i];
                }
                projects[_id].checkpoints.push(Checkpoint(_checkpointRewards[i], _checkpointsCompleted[i]));
            }
            projects[_id].projectHash = _newProjectHash;
            projects[_id].remainingReward = newAmountToBePaid;
        }
        else {
            delete proposedChanges[_id].newCheckpoints;
            for (uint i = 0; i<_checkpointRewards.length; i++){
                if(!_checkpointsCompleted[i]){
                    newAmountToBePaid += _checkpointRewards[i];
                }
                proposedChanges[_id].newCheckpoints.push(Checkpoint(_checkpointRewards[i], _checkpointsCompleted[i]));
            }
            if(newAmountToBePaid - projects[_id].remainingReward > 0) {
                require(msg.value == newAmountToBePaid - projects[_id].remainingReward, "Wrong amount submitted");
            }
            proposedChanges[_id].newProjectHash = _newProjectHash;
            proposedChanges[_id].newRemainingReward = newAmountToBePaid;
        }
        return true;
    }
    
    //Delete proposal to be called when client wants to take back the proposal.
    //Automatic calls to this method before executing methods like deleteContract() can be handled in stack application.
    function deleteProposal(string memory _id) projectExists(_id) isProjectClient(_id) proposalExists(_id) public returns(bool) {
        return rejectChanges(_id);
    }
    
    //reject changes and return the extra money submitted by client in case an increase in reward was proposed.
    function rejectChanges(string memory _id) projectExists(_id) proposalExists(_id) internal returns(bool) {
        if (projects[_id].remainingReward < proposedChanges[_id].newRemainingReward) {
            projects[_id].client.transfer(proposedChanges[_id].newRemainingReward - projects[_id].remainingReward);
        }
        delete proposedChanges[_id];
        return true;
    }
    
    //accept or reject the changes. If accepted, transfer extra money back to client in case reward was decreased.
    function assigneeResponse(string memory _id, bool response) projectExists(_id) isAssignee(_id) proposalExists(_id) public returns(bool){
        if(response) {
            if (projects[_id].remainingReward > proposedChanges[_id].newRemainingReward) {
                projects[_id].client.transfer(projects[_id].remainingReward - proposedChanges[_id].newRemainingReward);
            }
            projects[_id].projectHash = proposedChanges[_id].newProjectHash;
            projects[_id].checkpoints = proposedChanges[_id].newCheckpoints;
            projects[_id].remainingReward = proposedChanges[_id].newRemainingReward;
            delete proposedChanges[_id];
            return true;
        }
        else return rejectChanges(_id);
    }
    
}