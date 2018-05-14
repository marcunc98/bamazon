var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    createTable();
});

function createTable() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // console.log(res);
        // connection.end();
        var table = new Table({
            head: ["ID", "Department", "Product Name", "Price", "Stock Quantity"]
        });
        for (var i = 0; i < res.length; i++) {
            // console.log(res[i].item_id + " || " + res[i].department_name + " || " + res[i].product_name + " || " + res[i].price.toFixed(2) + " || " + res[i].stock_quantity);
            table.push([res[i].item_id, res[i].department_name, res[i].product_name, res[i].price.toFixed(2), res[i].stock_quantity]);   
        }
        console.log(table.toString());
        customerResponse(res);
        
    });
}

var customerResponse = function (res) {
    inquirer.prompt([{
        type: "input",
        name: "choice",
        message: "What would you like to purchase?"
    }]).then(function (answer) {
        var correct = false;
        for (var i = 0; i < res.length; i++) {
            if (res[i].item_id == answer.choice) {
                correct = true;
                var product = answer.choice;
                var id = i;
                inquirer.prompt({
                    type: "input",
                    name: "quant",
                    message: "How many would you like to purchase?",
                    validate: function (value) { 
                        if (isNaN(value) == false) {
                            return true;
                        } else {
                            return false;
                        }
                        console.log(answer.quant);
                    }
                    
                }).then(function (answer) {
                    if ((res[id].stock_quantity - answer.quant) > 0) {
                        connection.query("UPDATE products SET stock_quantity='" + (res[id].stock_quantity - answer.quant) + "' WHERE item_id='" + product + "'", function (err, res2) {
                            console.log("\n")
                            console.log("Thank you for your purchase!");
                            console.log("Your Total Cost for today's purchase is: $" + answer.quant * res[id].price);
                            createTable();
                        })
                    } else {
                        console.log("Insufficient quantity! Please select a lower quantity.");
                        customerResponse(res);

                    }
                })
            }
        }
        if(i==res.length && correct==false){
            console.log("Invalid selection, please chose a valid option.");
            customerResponse(res);
        }
    })
}