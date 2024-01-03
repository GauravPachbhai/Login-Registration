const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'userdb',
});


const app = express();
app.use(express.json());
app.use(cors());

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(express.urlencoded({ extended: true }));

// Endpoint for user signup
app.post('/signup', async (req, res) => {
    try {
        const { firstname, lastname, username, email, password, phone } = req.body;

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO userlogin (firstname, lastname, username, email, password, phone) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [firstname, lastname, username, email, hashedPassword, phone];

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error signing up:', err);
                return res.status(500).json('Error signing up');
            }
            // Successful signup response
            return res.status(201).json('Signup successful');
        });
    } catch (error) {
        console.error('Error in signup:', error);
        return res.status(500).json('Internal server error');
    }
});

// Endpoint for user login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email and password presence
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const sql = 'SELECT * FROM userlogin WHERE email = ?';
        connection.query(sql, [email], async (err, data) => {
            if (err) {
                console.error('Error logging in:', err);
                return res.status(500).json({ error: 'Error logging in' });
            }

            if (data.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = data[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Here you could generate a token for the authenticated user session
            // Example: const token = generateAuthToken(user.id);

            // Successful login response
            if (match) {
                console.log("Login sucessfully")

            }
            return res.status(200).json({ message: 'Login successful', user: user });
        });
    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Create a new vehicle
app.post('/vehicles', (req, res) => {
    try {
        const { name, feedback } = req.body;
        const query = 'INSERT INTO VEHICLE (name, Feedback) VALUES (?, ?)';
        connection.query(query, [name, feedback], (err, results) => {
            if (err) {
                console.error('Error creating new vehicle:', err);
                return res.status(500).send('Error creating new vehicle');
            }
            console.log(results)
            return res.status(201).send('New vehicle created successfully');
        });
    } catch (error) {
        console.log(error)
    }

});
app.get('/getVehicles', (req, res) => {
    const query = 'SELECT * FROM VEHICLE'; // Replace with your table name
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching vehicles:', err);
            return res.status(500).send('Error fetching vehicles');
        }
        res.status(200).json(results);
    });
});

app.get('/getUsers', (req, res) => {
    const query = 'SELECT * FROM userlogin'; // Replace with your table name
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching  users');
        }
        res.status(200).json(results);
    });
});

// Modify vehicle details
app.put('/vehicles/:vehicleID', (req, res) => {
    const { name, feedback } = req.body;
    const { vehicleID } = req.params;
    const query = 'UPDATE VEHICLE SET name = ?, Feedback = ? WHERE vehicleID = ?';
    connection.query(query, [name, feedback, vehicleID], (err, results) => {
        if (err) {
            console.error('Error modifying vehicle details:', err);
            return res.status(500).send('Error modifying vehicle details');
        }
        return res.status(200).send('Vehicle details updated successfully');
    });
});

app.delete('/vehicles/:vehicleID', (req, res) => {
    const { vehicleID } = req.params;
    const query = 'DELETE FROM VEHICLE WHERE vehicleID = ?'; // Replace with your table name
    connection.query(query, [vehicleID], (err, results) => {
        if (err) {
            console.error('Error deleting vehicle:', err);
            return res.status(500).send('Error deleting vehicle');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Vehicle not found');
        }
        res.status(200).send('Vehicle deleted successfully');
    });
});

// Assign a vehicle to a user
app.post('/assign', (req, res) => {
    const { vehicleID, userID } = req.body;

    // Validate and sanitize input data (e.g., check if IDs are valid, sanitize for SQL injection)

    // SQL query using prepared statement to prevent SQL injection
    const assignVehicleQuery = 'INSERT INTO VehicleAssignment (name, firstname) VALUES (?, ?)';
    connection.query(assignVehicleQuery, [vehicleID, userID], (err, result) => {
        if (err) {
            console.error('Error assigning vehicle:', err);
            return res.status(500).send('Error assigning vehicle');
        }
        return res.status(200).send('Vehicle assigned successfully');
    });
});


app.get('/getAssign', (req, res) => {
    const query = 'SELECT * FROM vehicleassignment'; // Replace with your table name
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Error fetching  users');
        }
        res.status(200).json(results);
    });
});


// Remove assigned vehicle
app.delete('/assign/:vehicleID', (req, res) => {
    // Extract vehicleID from request parameters
    const { vehicleID } = req.params;

    // Your logic to remove an assigned vehicle goes here
    // Perform removal operations using vehicleID

    // Example logic (replace this with your actual removal logic)
    // For example purposes, assuming a successful removal of the assignment
    // In reality, this logic should interface with your database or storage

    // Assuming the assigned vehicle has been successfully removed
    return res.status(200).send('Assigned vehicle removed successfully');
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
