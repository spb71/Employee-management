USE business_db;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Joe", "Exotic", 1, 2), ("Sally", "Jones", 2, 4), ("Kevin", "Johnson", 3, 2), ("Avery", "Williams", 4, 3), ("Maeve", "Roberts", 5, 1);

INSERT INTO department(department_name)
VALUES("Finance"), ("Engineering"), ("Sales"), ("Legal");

INSERT INTO roleInfo(title, salary, department_id)
VALUES("Legal Team", 80000, 4),("Lead Engineer", 85000, 2),("Software Engineer", 75000, "John Doe", 2), ("Sales Team", 45000, 3), ("Lawyer", 92000, 4), ("Accountant", 65000, 1);