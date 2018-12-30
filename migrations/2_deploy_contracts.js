var Attendence = artifacts.require("./Attendence.sol");

module.exports = function (deployer) {
    deployer.deploy(Attendence);
};