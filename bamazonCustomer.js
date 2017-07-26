var mysql = require("mysql");
var inquirer = require("inquirer");

var password = require("./password.js");


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
        //accessing our data from the empty array (which is running through the lenght of our rows)
        for(var i =0; i<emptyArray.length; i++) {
            
            //for a especific obejct in the array, grab its item ID and compare it to our answer that we inputed that specifies its name label "askID"...
            if(emptyArray[i].item_id === parseInt(answer.askID)) {
                
                //then take the number inputed from askUnits and subtract its from the units currently available in the emptyArray Object. 
                var newQuantity = emptyArray[i].stock_quantity -= answer.askUnits;
                //update database to display remaining quantities
                //------Updating SQL----------
                    
                if(newQuantity>0) {
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
                    //the tell user its available 
                    console.log(emptyArray[i].product_name + " is available");
                    //and tell user the total cost of their product which will be the price of item multiplies by the units the of the user's input.
                    console.log("The total cost of your order is: $" + emptyArray[i].price* answer.askUnits);
                }else {
                    console.log("Insufficient quantity! Order cannot be completed");
                }
    
            }
        }
        
        
    });
}


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
        
 
