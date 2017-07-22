var mysql = require("mysql");
var inquirer = require("inquirer");

var password = require("./password.js");
//console.log(password);

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: password,
  database: "bamazon"
});

//place the databae info into an empty array
var emptyArray = [];

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
    
    connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    //console.log("Items for sale: ", res);
        
    //creat a loop to sort through the object array...
        for(var i =0; i<res.length; i++) {
        consolidatedData(res[i]);
        }
        start();
       // console.log("empty Array: ", emptyArray);
        
    });
});

function start () {
    inquirer.prompt([
        {
        name: "askID",
        type: "input",
        message: "Type the ID number of the item you are looking for?"
        },
        {
        name: "askUnits",
        type: "input",
        message: "How many units of the product would you like to buy?"
        }
    ]).then(function(answer){
        
        for(var i =0; i<emptyArray.length; i++) {
            
            
            if(emptyArray[i].item_id === parseInt(answer.askID)) {
            
                console.log("emptyArray: ", emptyArray[i].product_name);
                //update database to display remaining quantities
                //display total price of purchase to customers
            }
        }
        
        //if stock_quantity >0 then display sql databse to reflect new quantity
        
        //then show customer the total cost of his purchase
        //else tell customer there are not enough in stock
    });
}


//access the database
//-----connection.query("SELECT * FROM products", function(err, res) {
//    if (err) throw err;
//    console.log("Items for sale: ", res);
//create cosntructor to access the info in the array. 
var Product = function (item_id, product_name, department_name, price, stock_quantity) {
    this.item_id  = item_id;
    this.product_name  = product_name;
    this.department_name  = department_name;
    this.price = price;
    this.stock_quantity  = stock_quantity;
    
    
};
        
function consolidatedData (res) {
    var item_id = res.item_id;
    var product = res.product_name;
    var department = res.department_name;
    var price = res.price;
    var stock = res.stock_quantity;
    
    var newProduct = new Product(item_id, product, department, price, stock);
    
    emptyArray.push(newProduct);
    
}
        
 
