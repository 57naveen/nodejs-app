const express = require("express");
const app = express();
const sql = require("mssql/msnodesqlv8");
const doenv = require("dotenv");
const path=require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
//const dashboard = require('./script');
const session = require('express-session');







doenv.config(
    {
        path:'./.env',
    }
);
 
var config = {    
    database:'login',
    server:'WIN-MUSC6MOGOU0\\SQLEXPRESS',
    driver:'msnodesqlv8',
   options: {       
     trustedConnection: true
    }  
 }; 



sql.connect(config, function(err) {
    if (err) {
        console.log(err);
    }
    var request = new sql.Request();
    request.input('nameValue', sql.NVarChar, 'naveenkishore86@gmail.com');
    request.query('SELECT * FROM users WHERE EMAIL = @nameValue', function(err, recordset) {
        if (err) {
            console.log(err);
        } else { 
            console.log('mysql connection success');
        }
    });
});

app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static('/public'))
app.use(express.static(path.join(__dirname, 'public')));

const location = path.join(__dirname,"./public");
app.use(express.static(location));
app.set("view engine", "hbs")

const partialsPath = path.join(__dirname,"./views/partials");
hbs.registerPartials(partialsPath);

app.use(session({
    secret:process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true
}));

 app.use("/", require("./routes/pages"));
 app.use("/auth", require("./routes/auth"));




app.use((req, res, next) => {
    if (!req.session) {
        req.session = {}; // Initialize session if it doesn't exist
    }
    next();
});
 




// Parse JSON requests
app.use(bodyParser.json());

app.post("/signin", async (req, res) => {
    try {
        var config = {    
            database:'login',
            server:'WIN-MUSC6MOGOU0\\SQLEXPRESS',
            driver:'msnodesqlv8',
           options: {       
             trustedConnection: true
            }  
         }; 
         
        

        // Retrieve the user's email from the session
        const userEmail = req.session.email;

        if (!userEmail) {
            // If the email is not found in the session, handle the error accordingly
            res.status(400).json({ success: false, error: "User email not found in session" });
            return;
        }

        console.log("Received userEmail from session:", userEmail);

        // Connect to the database
        await sql.connect(config);

        // Query the "Users" table to retrieve the username based on the email
        const userQuery = "SELECT name FROM users WHERE email = @userEmail";
        const userRequest = new sql.Request();
        userRequest.input("userEmail", sql.NVarChar(255), userEmail);
        const userResult = await userRequest.query(userQuery);

        // Check if a matching user was found
        if (userResult.recordset.length === 0) {
            // No user found with the provided email
            res.status(400).json({ success: false, error: "User not found" });
            return;
        }

        // Get the username from the result
        const username = userResult.recordset[0].name;
        console.log("Retrieved username from users table:", username);

        // Define a parameterized query to safely insert the sign-in time and username
        const query = `
            INSERT INTO SignInTable (SignInTime, username,email)
            VALUES (@signInTime, @username,@userEmail)
        `;

        // Create a request object
        const request = new sql.Request();

        // Define the parameters and their values
        request.input("signInTime", sql.NVarChar, req.body.signInTime);
        request.input("username", sql.NVarChar, username);
        request.input("userEmail", sql.NVarChar, userEmail);

        // Execute the parameterized query
        await request.query(query);

        // Close the database connection
        await sql.close();

        res.json({ success: true });
    } catch (error) {
        console.error("Error inserting sign-in time into the database:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});


app.post("/logout", async (req, res) => {
    try {
        var config = {    
            database:'login',
            server:'WIN-MUSC6MOGOU0\\SQLEXPRESS',
            driver:'msnodesqlv8',
           options: {       
             trustedConnection: true
            }  
         }; 
         
        

        // Retrieve the user's email from the session
        const userEmail = req.session.email;

        if (!userEmail) {
            // If the email is not found in the session, handle the error accordingly
            res.status(400).json({ success: false, error: "User email not found in session" });
            return;
        }

        console.log("Received userEmail from session:", userEmail);
        const logoutTime = req.body.logoutTime;
    console.log("Received logout time:", logoutTime);

        // Connect to the database
        await sql.connect(config);

        // Query the "Users" table to retrieve the username based on the email
        const userQuery = "SELECT name FROM users WHERE email = @userEmail";
        const userRequest = new sql.Request();
        userRequest.input("userEmail", sql.NVarChar(255), userEmail);
        const userResult = await userRequest.query(userQuery);

        // Check if a matching user was found
        if (userResult.recordset.length === 0) {
            // No user found with the provided email
            res.status(400).json({ success: false, error: "User not found" });
            return;
        }

        // Get the username from the result
        const name = userResult.recordset[0].name;
        const ID = userResult.recordset[0].ID;

        console.log("Retrieved username from users table:", name);
        console.log("Retrieved ID from users table:", ID);

        // Define a parameterized query to safely insert the sign-in time and username
        const query = `

        INSERT INTO SignOutTable (sign_out, username,email)
        VALUES (@logoutTime, @name,@userEmail)
            
        `;

        //INSERT INTO logout_data (logoutTime, username)
           // VALUES (@logoutTime, @username)

        // Create a request object
        const request = new sql.Request();

        // Define the parameters and their values
        request.input("logoutTime", sql.NVarChar, req.body.logoutTime);
        request.input("name", sql.NVarChar, name);
        request.input("userEmail", sql.NVarChar, userEmail);
      

        // Execute the parameterized query
        await request.query(query);

        // Close the database connection
        await sql.close();

        res.json({ success: true });
    } catch (error) {
        console.error("Error logout time inserting sign-in time into the database:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});





app.get('/getUserName', async (req, res) => {
    try {
        var config = {    
            database:'login',
            server:'WIN-MUSC6MOGOU0\\SQLEXPRESS',
            driver:'msnodesqlv8',
           options: {       
             trustedConnection: true
            }  
         }; 
         
        

        // Retrieve the user's email from the session
        const userEmail = req.session.email;

        if (!userEmail) {
            // If the email is not found in the session, handle the error accordingly
            res.status(400).json({ success: false, error: "User email not found in session" });
            return;
        }

        console.log("Received userEmail from session:", userEmail);
       
    

        // Connect to the database
        await sql.connect(config);

        // Query the "Users" table to retrieve the username based on the email
        const userQuery = "SELECT name FROM users WHERE email = @userEmail";
        const userRequest = new sql.Request();
        userRequest.input("userEmail", sql.NVarChar(255), userEmail);
        const userResult = await userRequest.query(userQuery);

        // Check if a matching user was found
        if (userResult.recordset.length === 0) {
            // No user found with the provided email
            res.status(400).json({ success: false, error: "User not found" });
            return;
        }

        // Get the username from the result
        const name = userResult.recordset[0].name;
       

        console.log(" username from users table:", name);
        res.status(200).json({ success: true, name });
        
     }
     
      catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.listen(5000, () =>
{ 
    console.log("sever started @ port 5000");
}); 