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
const multer = require('multer');
const upload = multer(); // Initialize multer
const { google } = require('googleapis'); 
const sheets = google.sheets('v4');
const nodemailer = require('nodemailer');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const ExcelJS = require('exceljs');
const crypto = require('crypto');
const schedule = require('node-schedule');









doenv.config(
    {
        path:'./.env',
    }
);
 
var config = {    
    database:'login_crud',
    server:'WIN-A6RB8151NC6\\SQLEXPRESS',
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
            database:'login_crud',
            server:'WIN-A6RB8151NC6\\SQLEXPRESS',
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

        // Generate a random token of a specific length (e.g., 32 characters)
function generateRandomToken(length) {
    return crypto.randomBytes(length).toString('hex');
}

// Usage example:
const token = generateRandomToken(10); 

        // Define a parameterized query to safely insert the sign-in time and username
       /* const query = `
            INSERT INTO SignInTable (SignInTime, username,email)
            VALUES (@signInTime, @username,@userEmail)
        `;*/
       
        const query = `
        INSERT INTO EmployeeAttendance ( username,email,SignInTime, Token)
         VALUES (@username,@userEmail,@signInTime,@token)
    `;
       
    req.session.Token = token;
        

        // Create a request object
        const request = new sql.Request();

        // Define the parameters and their values
        request.input("signInTime", sql.NVarChar, req.body.signInTime);
        request.input("username", sql.NVarChar, username);
        request.input("userEmail", sql.NVarChar, userEmail);
        request.input("token", sql.NVarChar, token);

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


// Define a scheduled job to update SignOutTime every day at a specific time (e.g., midnight '0 0 * * *' or */1 * * * *' )
const updateSignOutTimeJob = schedule.scheduleJob('0 0 * * *' , async () => {
    try {
        var config = {    
            database:'login_crud',
            server:'WIN-A6RB8151NC6\\SQLEXPRESS',
            driver:'msnodesqlv8',
           options: {       
             trustedConnection: true
            }  
         }; 
        // Connect to the database
        await sql.connect(config);

        // Define the query to update SignOutTime
        const query = `
            UPDATE EmployeeAttendance
            SET SignOutTime = GETDATE() -- Use your appropriate date/time function here
            WHERE SignOutTime IS NULL; -- Update only if SignOutTime is NULL
        `;

        // Create a request object
        const request = new sql.Request();

        // Execute the query to update SignOutTime
        const result = await request.query(query);

        // Close the database connection
        await sql.close();

        console.log('SignOutTime updated for records:', result.rowsAffected);
    } catch (error) {
        console.error('Error updating SignOutTime:', error);
    }
});




app.post("/logout", async (req, res) => {
    try {
        var config = {    
            database:'login_crud',
            server:'WIN-A6RB8151NC6\\SQLEXPRESS',
            driver:'msnodesqlv8',
           options: {       
             trustedConnection: true
            }  
         }; 
        
         const token = req.session.Token;
        

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
        /*const query = `

        INSERT INTO SignOutTable (sign_out, username,email)
        VALUES (@logoutTime, @name,@userEmail)
            
        `;*/
        const query = `

        update EmployeeAttendance set SignOutTime=@logoutTime where username=@name and email=@userEmail and Token=@token and SignOutTime IS NULL
            
        `;
        

     
        // Create a request object
        const request = new sql.Request();

        // Define the parameters and their values
        request.input("logoutTime", sql.NVarChar, req.body.logoutTime);
        request.input("name", sql.NVarChar, name);
        request.input("userEmail", sql.NVarChar, userEmail);
        request.input("token", sql.NVarChar, token);
      

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
            database:'login_crud',
            server:'WIN-A6RB8151NC6\\SQLEXPRESS',
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

// Function to update Google Sheets without deleting previous records
async function updateGoogleSheets(data) {
    try {
        // Load your service account credentials
        const creds = require('./public/tranquil.json');

        // Create a JWT client
        const client = new google.auth.JWT(
            creds.client_email,
            null,
            creds.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        // Authorize the client and get an access token
        await client.authorize();

        // Define the spreadsheet ID and sheet name
        const spreadsheetId = '16Yjv9e9LSFd5Mu5Un2MH8wcIuIJag9-wh_n5PtmfHF0'; // Replace with your actual spreadsheet ID
        const sheetName = 'Sheet1'; // Replace with your sheet name

        // Determine the last row index
        const lastRowIndex = (await sheets.spreadsheets.values.get({
            auth: client,
            spreadsheetId: spreadsheetId,
            range: `${sheetName}!A1:A`,
        })).data.values.length;

        // Calculate the range for the last row (next empty row)
        const range = `${sheetName}!A${lastRowIndex + 1}:J${lastRowIndex + 1}`;

        // Define the values to insert in the last row
        const values = [
            [data.Date, data.ConsultantName, data.TicketNumber, data.TypeOfTicket, data.ProcessDocumentRevision, data.Status, data.From, data.To, data.TicketAssignedDate, data.BriefDetails],
        ];

        // Update Google Sheets with the new data (insert into the last row)
        const response = await sheets.spreadsheets.values.update({
            auth: client,
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'RAW',
            resource: {
                values: values,
            },
        });

        console.log('Updated range (last row):', response.data.updatedRange);
    } catch (error) {
        console.error('Error updating Google Sheets:', error.message);
    }
}




app.post('/sideinput', async (req, res) => {
    const { Date, ConsultantName, TicketNumber, TypeOfTicket, ProcessDocumentRevision, Status, From, To, TicketAssignedDate, BriefDetails } = req.body;
    
    // Define your SQL Server connection configuration
    const config = {    
        database:'login_crud',
        server:'WIN-A6RB8151NC6\\SQLEXPRESS',
        driver:'msnodesqlv8',
       options: {       
         trustedConnection: true
        }  
    }; 


    

    try {
        // Check if TicketNumber is null or undefined
        if (TicketNumber === null || TicketNumber === undefined) {
            return res.render('sideinput', { msg: 'Ticket Number is required', msg_type: 'error' });
        }

        // Create a SQL Server connection pool
        const pool = new sql.ConnectionPool(config);
        await pool.connect();

        // Define your SQL query to insert data into the database
        const query = `
            INSERT INTO details (Date, ConsultantName, TicketNumber, TypeOfTicket, ProcessDocumentRevision, Status, FromTime, ToTime, TicketAssignedDate, BriefDetails)
            VALUES (
                @Date,
                @ConsultantName,
                @TicketNumber,
                @TypeOfTicket,
                @ProcessDocumentRevision,
                @Status,
                @From,
                @To,
                @TicketAssignedDate,
                @BriefDetails
            )
        `;

        // Execute the SQL query with parameters
        const request = pool.request();
        request.input('Date', sql.Date, Date);
        request.input('ConsultantName', sql.NVarChar, ConsultantName);
        request.input('TicketNumber', sql.Int, TicketNumber);
        request.input('TypeOfTicket', sql.NVarChar, TypeOfTicket);
        request.input('ProcessDocumentRevision', sql.NVarChar, ProcessDocumentRevision);
        request.input('Status', sql.NVarChar, Status);
        request.input('From', sql.Time, From);
        request.input('To', sql.Time, To);
        request.input('TicketAssignedDate', sql.Date, TicketAssignedDate);
        request.input('BriefDetails', sql.NVarChar, BriefDetails);

        await request.query(query);

        console.log('Data inserted successfully.');
        await updateGoogleSheets(req.body);
        await sentmail(req,res)

        // Close the connection pool
        await pool.close();

        return res.render('dash');
      
    } catch (error) {
        console.error('Error inserting data:', error);
    return res.render('dash', { msg: 'Error inserting data', msg_type: 'error' });
    }


    
});



async function sentmail(req,res,data) {


    
        var config = {    
            database:'login_crud',
            server:'WIN-A6RB8151NC6\\SQLEXPRESS',
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
    try {
        // Load your service account credentials (JSON key file)
        const creds = require('./public/tranquil.json');

        // Create a JWT client for Google Drive
        const driveClient = new google.auth.JWT(
            creds.client_email,
            null,
            creds.private_key,
            [
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/gmail.send' // Add Gmail send scope for sending emails
            ]
        );

        // Authorize the client and get an access token for Google Drive
        await driveClient.authorize();

        // Create a Google Drive API instance
        const drive = google.drive({ version: 'v3', auth: driveClient });

        // Specify the ID of the Google Drive file you want to download and export
        const fileId = '16Yjv9e9LSFd5Mu5Un2MH8wcIuIJag9-wh_n5PtmfHF0'; // Replace with the actual file ID

        // Export the Google Sheets file as a CSV (for simplicity)
        const exportResponse = await drive.files.export({
            fileId: fileId,
            mimeType: 'text/csv' // Export as CSV
        }, {
            responseType: 'text' // Response will be plain text CSV data
        });

        // Parse the CSV data into an array (assuming data is in CSV format)
        const csvData = exportResponse.data.split('\n').map(row => row.split(','));

        // Create an Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Populate the Excel worksheet with your data
        csvData.forEach(row => {
            worksheet.addRow(row);
        });

        // Generate Excel file buffer
        const excelBuffer = await workbook.xlsx.writeBuffer();

        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Or use your email provider's SMTP configuration
            auth: {
                user: 'esspldummy18@gmail.com',
                pass: 'ltbbkzepalbenyce' // Replace with your email password or generate an app-specific password
            },
        });

        // Define email data
        const mailOptions = {
            from: 'esspldummy18@gmail.com',
            to: 'naveenkishored18ca057@gmail.com',
            subject: 'Daily Time Sheet',
            text:`Hi All ,

            please find the attached document of Daily Time Sheet
            
            Best regards,
            ${name}`,
            attachments: [
                {
                    filename: 'time_sheet.xlsx', // Customize the filename with .xlsx extension
                    content: excelBuffer, // Attach the Excel content as a buffer
                },
            ],
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', info.response);
    } catch (error) {
        console.error('Error:', error);
    }
}






































app.listen(5000, () =>
{ 
    console.log("sever started @ port 5000");
}); 