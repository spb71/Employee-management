const mysql = require("mysql2");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "12345678!@"
});

connection.connect((err) => {
    if (err) throw err;
    start();
})

start = () => {
    userChoose();
}

userChoose = async () => {
    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View All Departments",
                "View All Roles",
                "View All Employees",
                "Add Department", 
                "Add Role", 
                "Add Employee", 
                "Update Employee Role"
            ]
        }
    ]);
    console.log(answers.action);
    select(answers);
}

viewAllDepartments = () => {
    connection.query(
        "SELECT * FROM department", 
        (err, res) => {
            if (err) throw err;
            console.table(res);
            userChoose();
        }
    )
}

viewAllRoles = () => {
    connection.query(
        "SELECT * FROM roleInfo", (err, res) => {
            if (err) throw err;
            console.table(res);
            userChoose();
        }
    )
}

viewAllEmployees = async () => {
    connection.query(
        "SELECT * FROM employee LEFT JOIN roleInfo ON employee.title=roleInfo.title LEFT JOIN department ON roleInfo.department_id=department.id",
        (err, res) => {
            if (err) throw err;
            console.table(res);
            userChoose();
        }
    )
}

addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "departmentName",
            message: "What is the name of the new department?"
        }
    ]).then(answers => {
        connection.query(
            `INSERT INTO department SET department_name = "${answers.departmentName}"`,
            (err) => {
                if (err) throw err;
                console.log("added successfully");
                // re-prompt
                userChoose();
            }
        )
    })
}

addRole = () => {
    connection.query("SELECT * FROM department", (err, res) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: "input",
                name: "roleTitle",
                message: "What is the name of the new role?"
            },

            {
                type: "input",
                name: "salary",
                message: "What is the starting salary of this position?"
            },

            {
                type: "input",
                name: "manager",
                message: "Who is the manager of this role? (if none, write None)"
            },

            {
                type: "list",
                name: "departmentID",
                message: "What is the department ID?",
                choices: () => {
                    let choiceArray = [];
                    for (let i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].id)

                    }
                    return choiceArray
                }
            }
        ]).then(answers => {
            connection.query(
                `INSERT INTO roleInfo SET ?`,
                {
                    title: answers.roleTitle,
                    salary: answers.salary,
                    manager: answers.manager,
                    department_id: answers.departmentID
                },
                (err) => {
                    if (err) throw err;
                    console.log("added role successfully");
                    // re-prompt
                    userChoose();
                }
            )
        })
    })
}

addEmployee = () => {
    //read the employees first
    connection.query("SELECT * FROM roleInfo", async (err, res) => {
        if (err) throw err;

        //ask the key questions
        const answer = await inquirer.prompt([
            {
                type: "input",
                name: "first",
                message: "What is the Employee's first name?"
            },
            {
                type: "input",
                name: "last",
                message: "What is the Employee's last name?"
            },
            {
                type: "list",
                name: "role",
                message: "What is the Employee's role?",
                choices: () => {
                    let choiceArray = [];
                    for (let i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].title);
                    }
                    return choiceArray;
                }
            },
            {
                type: "list",
                name: "manager",
                message: "What is the manager's ID?",
                choices: [
                    0, 1, 2, 3, 4, 5
                ]
            }
        ]);
        connection.query("INSERT INTO employee SET ?", {
            first_name: answer.first,
            last_name: answer.last,
            title: answer.role,
            manager_id: answer.manager
        }, (err) => {
            if (err) throw err;
            console.log("added successfully");
            // re-prompt
            userChoose();
        });
    })
};

updateRole = () => {
    //pull all the employees first
    connection.query("SELECT * FROM employee", (err, res) => {
        if (err) throw err;
        console.table(res);

        //ask who they want to modify
        inquirer.prompt([
            {
                type: "list",
                name: "name",
                message: "Which employee would you like to update the role of?",
                choices: () => {
                    let choiceArray = [];
                    for (let i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].first_name + " " + res[i].last_name);
                    }
                    return choiceArray;
                }
            },
        ]).then((answer) => {
            //split the name
            let fullName = answer.name;
            console.log(fullName);
            let splitName = fullName.split(" ");
            console.log(splitName[0]);
            connection.query("SELECT * FROM roleInfo", (err, res) => {
                inquirer.prompt([
                    {
                        type: "list",
                        name: "role",
                        message: "What would you like to update the role to be?",
                        choices: () => {
                            let choiceArray = [];
                            for (let i = 0; i < res.length; i++) {
                                choiceArray.push(res[i].title);
                            }
                            return choiceArray;
                        }
                    }
                ]).then((result) => {
                    const role = result.role
                    connection.query(
                        `UPDATE employee SET title = "${role}" WHERE first_name = "${splitName[0]}" and last_name = "${splitName[1]}"`,
                        // [ {title: answer.role}     ]
                        (err) => {
                            if (err) throw err;
                            console.log("added successfully");
                            // re-prompt
                            userChoose();
                        }
                    )
                })
            })
        })
    })
}

select = (answers) => {
    switch (answers.action) {

        //view ALL
        case ("View All Employees"):
            console.log("View All Employees");
            viewAllEmployees();
            break;

        //View Department
        case ("View All Departments"):
            console.log("View Department");
            viewAllDepartments();
            break;

        //View Role
        case ("View All Roles"):
            console.log("View Role");
            viewAllRoles();
            break;

        //Add employee
        case ("Add Employee"):
            console.log("Add Employee");
            addEmployee();
            break;

        //Update Role
        case ("Update Employee Role"):
            console.log("Update Employee Role");
            updateRole();
            break;

        //Add Department
        case ("Add Department"):
            console.log("Adding department...")
            addDepartment();
            break;

        //Add Role
        case ("Add Role"):
            console.log("Adding role...");
            addRole();
            break;

        default:
            //End connection
            console.log("Thank you for accessing the Database.");
            connection.end();
    }
}
