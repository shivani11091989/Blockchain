const hre = require("hardhat");

async function main(){
    const KYC = await hre.ethers.getContractFactory("KYC");

    const kyc = await KYC.deploy();

    await kyc.deployed();
     console.log("kyc deployed to : "+  kyc.address);
}

main()
.then(()=> process.exit(0))
.catch((error)=>{
    console.log(error);
})