const { ethers } = require("ethers");

App = {
  contract :{},
  init : async function () {
    console.log("init is called"); 

    const provider = new ethers.providers.Web3Provider(window.ethereum,"any");
    await provider.send("eth_requestAccounts",[]);
    const signer = provider.getSigner();
    let userAddress = await signer.getAddress();

    document.getElementById("wallet").innerText = "Your wallet address is : "+userAddress;
    const resourceAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    $.getJSON("../artifacts/contracts/BasicMarketPlace.sol/BasicMarketPlace.json",function(BasicMarketPlaceArtifact){
       
       const contract = new ethers.Contract(resourceAddress, BasicMarketPlaceArtifact.abi,signer);
       App.contract = contract;
       contract.getProducts().then((data)=>{
        console.log(data);
        var allItemsDiv = $("#allItems");
        var itemTemplate = $("#itemTemplate");
        for(var i=0;i<data.length;i++){
            itemTemplate.find(".itemName").text(data[i].itemName);
            itemTemplate.find(".itemOwner").text(data[i].owner);
            itemTemplate.find(".itemCreator").text(data[i].creator);
            itemTemplate.find(".askingPrice").text(data[i].askingPrice);
            itemTemplate.find(".itemStatus").text(data[i].isSold ? "Sold" : "Available");
            itemTemplate.find(".btn-buy").attr("data-id",data[i].id)
            if(data[i].isSold){
                itemTemplate.find(".btn_buy").hide();
            }
            else{
                itemTemplate.find(".btn_buy").show();
            }
            allItemsDiv.append(itemTemplate.html());
        }
       })
    })
    return App.bindEvents();
  },
  bindEvents : function(){
    $(document).on('click',".btn_add",App.handleAdd);
    $(document).on('click',".btn_buy",{id:this.id},App.handleBuy);
  },
  handleAdd : function(){
    console.log("add btn clicked");
    var itemName = $("#new_itemName").value();
    var askingPrice = $("#new_asking_price").value();
    App.contract.addProduct(itemName, askingPrice);
  },
  handleBuy : function(event) {
    var product_id = parseInt($(event.target).data("id"));
    console.log("product-id:" + product_id);
    App.contract.buyProduct(product_id);
  }
};

App.init();
