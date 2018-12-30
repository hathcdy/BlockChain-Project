pragma solidity >=0.4.22 <0.6.0;

contract Attendence {

    address[10] public students;  
    bool[10] public states = [false,false,false,false,false,false,false,false,false,false];

    function check_in(uint sid) public returns (uint) {
        require(sid >= 0 && sid <= 9);  // 确保id在数组长度内
        
        students[sid] = msg.sender;        // 保存调用者地址 
        states[sid] = true;
        return sid;
    }

    function init(address[10] memory _students) public {
        students = _students;
    }

    function getStudents() public view returns (address[10] memory) {
        return students;
    }

    function getStates() public view returns (bool[10] memory) {
        return states;
    }
}
