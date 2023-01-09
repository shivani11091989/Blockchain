// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract KYC {

    struct Customer {
        string userName;   
        string data; 
        bool kycStatus;
        uint downVotes;
        uint upVotes; 
        address bank;
    }
    
    struct Bank {
        string name;
        address ethAddress;
        uint complaintsReported;
        uint kyc_count;
        bool isAllowedToVote;
        string regNumber;
    }

    struct KycRequest {
        string userName;
        address bankAddress;
        string customerData;
    }

    address admin;

    mapping(string => Customer) customers;

    mapping(address => Bank) banks;

    address[] banksCount;

    mapping(string => KycRequest) kycRequests;

    constructor(){
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can remove a Bank");
        _;
    }

    function addRequest(string memory _userName, string memory _customerData) public {
        require(banks[address(0)].ethAddress == address(0), "Not a valid bank");
        require(customers[_userName].bank == address(0), "Customer is already present, please call modifyCustomer to edit the customer data");
        require(kycRequests[_userName].bankAddress == address(0), "KYC request for the Customer is already raised");

        kycRequests[_userName].userName = _userName;
        kycRequests[_userName].customerData = _customerData;
        kycRequests[_userName].bankAddress = msg.sender;
        banks[address(0)].kyc_count = banks[address(0)].kyc_count + 1;
    }

    function removeRequest(string memory _userName) public {
        require(kycRequests[_userName].bankAddress == address(0), "KYC request for the Customer is not present");
        delete kycRequests[_userName];
    }

    
    function addCustomer(string memory _userName, string memory _customerData) public {    
        require(banks[address(0)].ethAddress == address(0), "Not a valid bank");
        require(customers[_userName].bank == address(0), "Customer is already present, please call modifyCustomer to edit the customer data");
        customers[_userName].userName = _userName;
        customers[_userName].data = _customerData;
        customers[_userName].kycStatus = true;
        customers[_userName].bank = msg.sender;
    }
    
    function viewCustomer(string memory _userName) public view returns (string memory, string memory,bool,uint,uint, address) {
        require(customers[_userName].bank != address(0), "Customer is not present in the database");
        return (customers[_userName].userName, customers[_userName].data, customers[_userName].kycStatus, customers[_userName].downVotes,customers[_userName].upVotes, customers[_userName].bank);
    }

    function upVoteCustomer(string memory _userName) public {
        require(customers[_userName].kycStatus != false, "Customer is not yet verified");
        require(banks[address(0)].isAllowedToVote, "Bank not allowed to vote");
        customers[_userName].upVotes = customers[_userName].upVotes + 1;
        setKycStatus(_userName);
    } 

    function downVoteCustomer(string memory _userName) public {
        require(customers[_userName].kycStatus != false, "Customer is not yet verified");
        require(banks[address(0)].isAllowedToVote, "Bank not allowed to vote");
        customers[_userName].downVotes = customers[_userName].downVotes + 1;
        setKycStatus(_userName);
    } 
    
    function modifyCustomer(string memory _userName, string memory _newcustomerData) public {
        require(banks[address(0)].ethAddress == address(0), "Not a valid bank");
        require(customers[_userName].bank != address(0), "Customer is not present in the database");
        removeRequest(_userName);
        customers[_userName].upVotes = 0;
        customers[_userName].downVotes = 0;
        customers[_userName].data = _newcustomerData;
    } 

    function getBankComplaints(address _bankAddress) public view returns (uint) {
        return banks[_bankAddress].complaintsReported;
    }  

    function viewBankDetails(address _bankAddress) public view returns (string memory, string memory,bool,uint,uint, address) {
        return (banks[_bankAddress].name, banks[_bankAddress].regNumber, banks[_bankAddress].isAllowedToVote, banks[_bankAddress].complaintsReported,banks[_bankAddress].kyc_count, banks[_bankAddress].ethAddress);
    }

    function reportBank(address _bankAddress) public{
        banks[_bankAddress].complaintsReported = banks[_bankAddress].complaintsReported + 1;
        if (banks[_bankAddress].complaintsReported >= banksCount.length/3) {
            banks[_bankAddress].isAllowedToVote = false;
        }
    }  

    function addBank(string memory bankName, string memory regNumber, address bankAddress) public onlyAdmin {
        banks[bankAddress].name = bankName;
        banks[bankAddress].ethAddress = bankAddress;
        banks[bankAddress].regNumber = regNumber;
        banks[bankAddress].isAllowedToVote = true;
        banksCount.push(bankAddress);
    }

    function modifyIsAllowedToVoteStateOfBank(bool isAllowed, address bankAddress) public onlyAdmin {
        banks[bankAddress].isAllowedToVote = isAllowed;
    }

    function removeBank(address bankAddress) public onlyAdmin {
        delete banks[bankAddress];
    }

    function setKycStatus(string memory customerName) private {
        if(customers[customerName].downVotes >= banksCount.length/3 || customers[customerName].downVotes > customers[customerName].upVotes) {
            customers[customerName].kycStatus = false;
        }
        customers[customerName].kycStatus = true;
    }
}    

