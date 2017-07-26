var mysql = require("mysql");
var inquirer = require("inquirer");

var password = require("./password.js");
var table = require('console.table');


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

//place the database info into an empty array
var emptyArray = [];

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
    
    connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    //console.log("Items for sale: ", res);
        
    //creat a loop to sort through the results (res or each row) array of objects
        for(var i =0; i<res.length; i++) {
            //calling consolidatedData function below and having the for loop run through it allows us to loop through its properties (or columns) of our Object called NewProduct (Product is our constructor). 
        consolidatedData(res[i]);
        }
        //now that we have stored our data into our local machine by placing it into our empty array we can now use it all and begin using our info by calling the start function 
        start();
        
    });
});


function start () {
    inquirer.prompt([
        {
        type: "list",
			name: "menu",
			message: "Please select an option",
			choices: [
				"View Products for Sale",
				"View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Quit"
            ]
        }
    ]).then(function(answer){
        //accessing our data from the empty array (which is running through the lenght of our rows)
        //--------View products--------------
            if(answer.menu === "View Products for Sale") {
                console.table(emptyArray);
                
            }//--------end of Vier Products----------
                
            //must create a for loop that goes through all of the rows to determine their characterists
            //---------View low inventory---------
                if(answer.menu === "View Low Inventory") {
                    for(var i =0; i<emptyArray.length; i++) {
                //display items with an inventory count lower than 5
                    if(emptyArray[i].stock_quantity < 5) {
                        console.log("Items with low inventory: " + emptyArray[i].product_name);
                        start();
                    }
                    }
                }//--------end of low inventory
                //------------Add to inventory-----------
                if(answer.menu === "Add to Inventory") {
                    addInventory();
                    
                }//------end of if statement for "Add Inventory----
                //-----------Add new prdocuct------------
                if(answer.menu === "Add New Product") {
                       addNewProduct();       
                }//----end of add new product
                if(answer.menu === "Quit") {
                    console.log("Thank you, visit us again.");
                }
        
    })//---end of giant promise for all of our options
};

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
    var product_name = res.product_name;
    var department_name = res.department_name;
    var price = res.price;
    var stock_quantity = res.stock_quantity;
    
    var newProduct = new Product(item_id, product_name, department_name, price, stock_quantity);
    
    //this new object called newProduct (which is our specific table) displays all its data which is now stored in our local machine in our array. 
    emptyArray.push(newProduct);
    
}

//---add inventory function----
function addInventory () {
    //Prompt user to add inventory (stock_quantity) to a current product by first typing the products id. 
        inquirer.prompt([
            {
            name: "askID",
            type: "input",
            message: "Type the ID number of the item you want to add inventory to"
            },
            {
            name: "askUnits",
            type: "input",
            message: "How many units of the product would you like to add to the inventory?"
            }
        ]).then(function(answer){
            for(var i =0; i<emptyArray.length; i++) {

                if(emptyArray[i].item_id === parseInt(answer.askID)) {
                    var newQuantity = emptyArray[i].stock_quantity += parseFloat(answer.askUnits);

                    //update database to display remaining quantities
                    //------Updating SQL----------
                        var query = connection.query(
                            "UPDATE products SET ? WHERE ?",
                            [
                              {
                                stock_quantity: newQuantity
                              },
                              {
                                item_id: emptyArray[i].item_id
                              }
                            ],
                            function(err, res) {
                              console.log(res.affectedRows + " products updated!\n");

                            }
                          );
                    //------End of SQL update-----
                     console.log(answer.askUnits + " have been added to the "+ emptyArray[i].product_name + "inventory, for a total of " + newQuantity);  
                    start();
                }
            }//-----end of for loop
        });
};

function addNewProduct () {
    inquirer.prompt([
                
        {
        name: "productName",
        type: "input",
        message: "What is the name of the product that you would like to add?",
        validate: function (value) {
            for(var i=0; i< emptyArray.length; i++) {
                if (value == emptyArray[i].product_name) {
                    console.log("\n");    
                    console.log(emptyArray[i].item_id);
                           return "that product already exists type another product";

                }
            } 
            return true;


        }
        },
        {
        name: "departmentName",
        type: "input",
        message: "What is the name of the department of which you would like to add your product in?"
        },
        {
        name: "price",
        type: "input",
        message: "What is the price of the product?"
        },
        {
        name: "askUnits",
        type: "input",
        message: "How many units of the product would you like to add to the inventory?"
        }
       ]).then(function(answer){

         var query = connection.query(
            "INSERT INTO products SET ?",
            {
              item_id: answer.askID,
              product_name: answer.productName,
              department_name: answer.departmentName,
              price: answer.price,
              stock_quantity: answer.askUnits
            },
            function(err, res) {
              console.log(res.affectedRows + " product inserted!\n");
              console.log(answer.productName + "was added to the invetory");
                start();
                }

            )
        });
                            
                            
        
    
};//---end of function