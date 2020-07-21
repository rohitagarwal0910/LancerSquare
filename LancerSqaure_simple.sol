pragma solidity ^0.6.11;
//SPDX-License-Identifier: UNLICENSED

contract LancerSquare {
    
    //project desciption will be stored in a db, only its hash is stored here for proving that desciption has not been changed.
    //client - the one who created the project.
    //assignee - the freelancer
    struct Project {
        uint allProjectsIndex;
        uint clientProjectsIndex;
        uint assigneeProjectsIndex;
        address payable client;
        address payable assignee;
        string projectHash;
        uint remainingReward;
        uint[] checkpointRewards;
        bool[] checkpointsCompleted;
        uint creationTime;
    }
    
    mapping (bytes12 => Project) projects;                  //mapping from project id (created by backend) to Project struct. Stores all project details.
    bytes12[] allProjects;                                  //Stores all project id's for getter function.
    mapping(address => bytes12[]) assigneeProjects;         //Stores all project id's assigned to a user for getter function.
    mapping(address => bytes12[]) clientProjects;           //Stores all project id's created by a client for getter function.
    
    
    //------------------EVENTS------------------
    event ProjectAdded(bytes12 _id, address _clientAddress, string projectHash);
    event ProjectAssigned(bytes12 _id, address _assigneeAddress);
    event CheckpointCompleted(bytes12 _id, uint _checkpointIndex);
    event ProjectUnassigned(bytes12 _id);
    event ProjectDeleted(bytes12 _id);
    //------------------------------------------
    
    
    //------------------MODIFIERS------------------
    modifier onlyClient(bytes12 _id) {
        require(msg.sender == projects[_id].client, "Only client is allowed to do this");
        _;
    }
    
    modifier onlyAssignee(bytes12 _id) {
        require(msg.sender == projects[_id].assignee, "Only assignee can do this");
        _;
    }
    
    modifier onlyClientOrAssignee(bytes12 _id) {
        require(msg.sender == projects[_id].client || msg.sender == projects[_id].assignee, "Only client and assignee are allowed to do this");
        _;
    }
    
    modifier projectExists(bytes12 _id){
        require(bytes(projects[_id].projectHash).length > 0, "Project does not exist");
        _;
    }
    
    modifier isAssigned(bytes12 _id){
        require(projects[_id].assignee != address(0), "Project not yet assigned");
        _;
    }
    //---------------------------------------------
    
    
    //Add project. For Checkpoint only reward values as uint[] is passed. By default all checkpoints.completed == false.
    //In case client does not want to have a checkpoint based reward, a single checkpoint corresponding to 100% completion will be made (handled by stack appliaction).
    function addProject(bytes12 _id, string memory _projectHash, uint[] memory _checkpointRewards) public returns(bool) {
        require(_id.length > 0, "id required");
        require(bytes(_projectHash).length > 0, "Project Hash required");
        require(_checkpointRewards.length > 0, "Checkpoints required");
        require(bytes(projects[_id].projectHash).length == 0, "Project already added");
        
        projects[_id].checkpointRewards = _checkpointRewards;
        uint totalReward = 0;
        for (uint i=0; i<_checkpointRewards.length; i++) {
            projects[_id].checkpointsCompleted.push(false);
            totalReward += _checkpointRewards[i];
        }
        projects[_id].remainingReward = totalReward;
        projects[_id].client = msg.sender;
        projects[_id].projectHash = _projectHash;
        projects[_id].creationTime = now;
        
        projects[_id].allProjectsIndex = allProjects.length;
        projects[_id].clientProjectsIndex = clientProjects[msg.sender].length;
        allProjects.push(_id);
        clientProjects[msg.sender].push(_id);
        
        emit ProjectAdded(_id, msg.sender, _projectHash);
        return true;
    }
    
    //Assign project. Client will also have to transfer value to smart contract at this point.
    function assign(bytes12 _id, address payable assigneeAddress) projectExists(_id) onlyClient(_id) payable public returns(bool) {
        require(projects[_id].assignee == address(0), "Project already assigned");
        require(assigneeAddress != address(0), "Zero address submitted");
        require(msg.value == projects[_id].remainingReward, "Wrong amount submitted");
        
        projects[_id].assignee = assigneeAddress;
        
        projects[_id].assigneeProjectsIndex = assigneeProjects[assigneeAddress].length;
        assigneeProjects[assigneeAddress].push(_id);
        
        emit ProjectAssigned(_id, assigneeAddress);
        return true;
    }
    
    //mark checkpoint as completed and transfer reward
    function checkpointCompleted(bytes12 _id, uint index) projectExists(_id) onlyClient(_id) isAssigned(_id) public returns(bool) {
        require(index < projects[_id].checkpointsCompleted.length, "Checkpoint index out of bounds");
        require(!projects[_id].checkpointsCompleted[index], "Checkpoint already completed");
        
        projects[_id].checkpointsCompleted[index] = true;
        projects[_id].remainingReward -= projects[_id].checkpointRewards[index];
        
        emit CheckpointCompleted(_id, index);
        projects[_id].assignee.transfer(projects[_id].checkpointRewards[index]);
        
        return true;
    }
    
    //Called by client or assignee to unassign assignee from the project
    function unassign(bytes12 _id) projectExists(_id) isAssigned(_id) onlyClientOrAssignee(_id) public returns(bool) {
        
        bytes12[] storage tempAssigneeProjects = assigneeProjects[projects[_id].assignee];
        bytes12 lastAssigneeProjectId = tempAssigneeProjects[tempAssigneeProjects.length - 1];
        if (lastAssigneeProjectId != _id) {
            uint thisAssigneeProjectsIndex = projects[_id].assigneeProjectsIndex;
            tempAssigneeProjects[thisAssigneeProjectsIndex] = lastAssigneeProjectId;
            projects[lastAssigneeProjectId].assigneeProjectsIndex = thisAssigneeProjectsIndex;
        }
        delete projects[_id].assignee;
        delete projects[_id].assigneeProjectsIndex;
        tempAssigneeProjects.pop();
        
        emit ProjectUnassigned(_id);
        if(projects[_id].remainingReward > 0)
            projects[_id].client.transfer(projects[_id].remainingReward);
            
        return true;
    }
    
    //delete project. Requires unassigning first so that remainingReward is not lost.
    function deleteProject(bytes12 _id) projectExists(_id) onlyClient(_id) public returns(bool) {
        if (projects[_id].assignee != address(0))
            unassign(_id);
        
        delete allProjects[projects[_id].allProjectsIndex];
        bytes12[] storage tempClientProjects = clientProjects[projects[_id].client];
        bytes12 lastClientProjectId = tempClientProjects[tempClientProjects.length - 1];
        if (lastClientProjectId != _id) {
            uint thisClientProjectsIndex = projects[_id].clientProjectsIndex;
            tempClientProjects[thisClientProjectsIndex] = lastClientProjectId;
            projects[lastClientProjectId].clientProjectsIndex = thisClientProjectsIndex;
        }
        delete projects[_id];
        tempClientProjects.pop();
        
        emit ProjectDeleted(_id);
        return true;
    }
    
    
    //------------------GETTERS------------------
    function getAllProjects() view public returns(bytes12[] memory) {
        return allProjects;
    }
    
    function get20Projects(uint _from) view public returns(bytes12[20] memory) {
        bytes12[20] memory tempProjects;
        for(uint i = 0; i < 20 && i < allProjects.length - _from; i++)
            tempProjects[i] = allProjects[_from + i];
        return tempProjects;
    }
    
    function getProject(bytes12 _id) view public projectExists(_id) returns(address, address, string memory, uint[] memory, bool[] memory, uint) {
        return (
            projects[_id].client,
            projects[_id].assignee,
            projects[_id].projectHash,
            projects[_id].checkpointRewards,
            projects[_id].checkpointsCompleted,
            projects[_id].creationTime
        );
    }

    function getAssigneeProjects() view public returns(bytes12[] memory) {
        return assigneeProjects[msg.sender];
    }
    
    function getAssigneeProjects(address _assigneeAddress) view public returns(bytes12[] memory) {
        require(_assigneeAddress != address(0), "Zero address passed");
        return assigneeProjects[_assigneeAddress];
    }
    
    function getClientProjects() view public returns(bytes12[] memory) {
        return clientProjects[msg.sender];
    }
    
    function getClientProjects(address _clientAddress) view public returns(bytes12[] memory) {
        require(_clientAddress != address(0), "Zero address passed");
        return clientProjects[_clientAddress];
    }
    //-------------------------------------------
   
}