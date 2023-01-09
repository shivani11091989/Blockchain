// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract BasicMarketPlace {

    struct Product {
        uint256 id;
        string itemName;
        address creator;
        address owner;
        uint256 price;
        bool isSold;
    }

    mapping(uint256 => Product) public products;
    uint256 public numProduct;

    event savingEvent(uint256 indexed _productId);

    constructor(){
        numProduct = 0;
        addProduct("Product 1", 100);
    }

    function addProduct(string memory name,uint256 price) public{
        products[numProduct] = Product(
            numProduct,name,msg.sender,msg.sender,price,false
        );
        numProduct++;
    }

    function getProduct(uint256 productid) public view returns (Product memory){
        return products[productid];
    }

    function getProducts() public view returns (Product[] memory){
        Product[] memory productList = new Product[](numProduct);
        for(uint256 i=0;i<numProduct;i++){
            productList[i] = products[i];
        }
        return productList;
    }

    function buyProduct(uint256 productId) public{
        Product storage prod = products[productId];
        prod.owner = msg.sender;
        prod.isSold = true;
    }
}