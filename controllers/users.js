    const mysql= require("mysql");
    const sql = require("mssql/msnodesqlv8");
    const bcrypt = require("bcryptjs")
    const jwt = require("jsonwebtoken");
    const { promisify } = require("util");
    const crypto= require('crypto');
    const session = require('express-session');
    const nodemailer = require('nodemailer')
    const axios = require('axios');
    const bodyParser = require('body-parser');
    const doenv = require("dotenv");
const { error } = require("console");
   


/*
var config = {
    database: process.env.DATABASE,
    server: process.env.DATABASE_SERVER,
    driver: process.env.DATABASE_DRIVER,
    options: {  
        trustedConnection: true
    }
};*/


doenv.config(
    {
        path:'env',
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


 



 // Configure session middleware

 
 
 exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render("index", { msg: 'Please Enter Your Email and Password', msg_type: "error" });
        } 
        // Store the email in a session or a cookie
        req.session.email = email; // Using session

        const pool = await sql.connect(config);  
        const request = new sql.Request(pool);

        request.input('EmailParam', sql.VarChar, email);
        request.query('SELECT ID, name, password FROM users WHERE email = @EmailParam', async (error, result) => {
            if (error) {
                console.log('Error:', error);
                return;
            }

            console.log('Query Result:', result); // Log the entire query result
 
            const user = result.recordset[0];

            if (!user) {
                return res.status(401).render('index', { msg: 'Invalid credentials', msg_type: "error" });
            }

            console.log('User Object:', user); // Log the user object to check its structure

            // Check if the user object has a password property
            if (!user.hasOwnProperty('password')) {
                return res.status(401).render('index', { msg: 'No password found for the user', msg_type: "error" });
            }
           
            const trimmedPassword = password.trim();

            // Compare the hashed password with the input password
            const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);

            console.log('Password Match Result:', passwordMatch);

            if (!passwordMatch) {
                return res.status(401).render('index', { msg: 'Invalid credentials', msg_type: "error" });
            } else {
                // Correct password, proceed to generate JWT token

                const id = user.ID; // Make sure the property name matches your DB schema
                const name = user.name; // Get the user's name
                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN,
                });

                console.log("The Token is: " + token);
                 // Send the user's name as part of the response
                
                const cookieOptions ={
                    expires: 
                    new Date(
                        Date.now() +
                        process.env.JWT_COOKIE_EXPIRES *24*60*60*1000
                    ),
                    httpOnly:true,
                };
                res.cookie("naveen:",token,cookieOptions);
                res.status(200).redirect("/dash");

            }
        });
        res.status(200).json({ success: true, name: name, });
    } catch (error) {
        console.error(error);
    }
};





exports.register =(req, res) =>
{   

    // res.send("Form submitted ")
    //console.log(name);
    // console.log(email);


console.log(req.body);
const{name,email,password,confirm_password}=req.body

sql.connect(config, function(err) {
    if (err) {
        console.log(err);
    }
    var request = new sql.Request();

    request.input('EmailParam', sql.VarChar, email);
    request.query('SELECT COUNT(*) AS count FROM users WHERE email=@EmailParam',async(error, result) => {
        if (error) {
            console.log('Error:', error);
            return;
        }
       const existingCount = result.recordset[0].count;

        if (existingCount > 0) { 
        return res.render('register', { msg: 'Email ID already taken', msg_type:"error" });
         }
         else if(password!==confirm_password)
         {
            return res.render('register', { msg: 'Password do not match', msg_type:"error" });
         }
         let hashedPassword =await bcrypt.hash(password,8);
         //console.log(hashedPassword);
         request.input('Name', sql.VarChar, name);
         request.input('Email', sql.VarChar, email);
         request.input('HashedPassword', sql.VarChar, hashedPassword);

         request.query('INSERT INTO users (name, email, password) VALUES (@Name, @Email, @HashedPassword)', (insertError, insertResult) => {
           if(error){
                console.log(error);
            }else{
                console.log(result);
                return res.render('register', { msg: 'User registration success', msg_type:"good" });
 
            }
        });
         
    });
});  
   
};  



exports.isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.naveen) {
            console.log("Cookie Present");
        } else {
            console.log("Cookie Not Present");
            next();
        }
    } catch (error) {
        console.error("Error:", error);
    }
};


function storeToken(token){
    console.log('tests', token)

    // if(token)
    // {
       
    
    //     localStorage.setItem('setToken', token)
    //    }
    //    else {
    //     let getToken = localStorage.getItem('setToken')
    //     if(getToken) return getToken
    //    }
}



exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    // SQL Server configuration
    var config = {    
        database:'login',
        server:'WIN-MUSC6MOGOU0\\SQLEXPRESS',
        driver:'msnodesqlv8',
       options: {       
         trustedConnection: true
        }  
     }; 
    

    let token;
    let sixDigitCode; // Variable to store the six-digit code

    try {
        const pool = await sql.connect(config);

        // Check if the email exists in the database
        const queryResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM users WHERE email = @email');

        if (queryResult.recordset.length === 0) {
            return res.render('forgotpage', { msg: 'Failed to send reset email', msg_type: 'error' });
        }

        // Email exists, generate a reset token
        //token = crypto.randomBytes(32).toString('hex');

        // Generate a random six-digit code
        sixDigitCode = Math.floor(100000 + Math.random() * 900000);

        // Store the token and code in the session
       // req.session.resetToken = token;
        req.session.sixDigitCode = sixDigitCode;

      
 // Get the current date and time
const currentDate = new Date();
const expirationDate = new Date(currentDate.getTime() + 3600 * 1000); // Add one hour (3600 seconds)

const year = expirationDate.getFullYear();
const month = String(expirationDate.getMonth() + 1).padStart(2, '0');
const day = String(expirationDate.getDate()).padStart(2, '0');
const hours = String(expirationDate.getHours()).padStart(2, '0');
const minutes = String(expirationDate.getMinutes()).padStart(2, '0');
const seconds = String(expirationDate.getSeconds()).padStart(2, '0');

// Format the date and time as 'YYYY-MM-DD HH:MI:SS'
const formattedExpiresTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

const insertTokenQuery = await pool.request()
    .input('email', sql.NVarChar, email)
   // .input('token', sql.NVarChar, token)
    .input('expires', sql.NVarChar, formattedExpiresTime) // Use formatted time
    .input('sixDigitCode',sql.NVarChar, sixDigitCode)
    .query('INSERT INTO PasswordResetTokens (email,expires,verification_code) VALUES (@email,@expires,@sixDigitCode)');




        // Send a password reset link to the user's email
        const transporter = nodemailer.createTransport({
            // Configure your email service (e.g., SMTP settings)
                 host: 'smtp.gmail.com',
                 port: 465,
                secure: true, // Set to true for secure (SSL/TLS) connection
                auth: {
                    user: 'esspldummy18@gmail.com',
                    pass: 'ltbbkzepalbenyce'
    },
   

    // Increase the timeout (in milliseconds)
    timeout: 120000, // 60 seconds, adjust as needed
        });

        const mailOptions = {
            from: 'esspldummy18@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `To reset your password, click the following link: "http://localhost:5000/passreset\n\n Verfication code: ${sixDigitCode}`,
           // html: `To reset your password, click the following link: <a href="http://localhost:5000/passreset?token=${token}">Reset Password</a>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
                return res.render('forgotpage', { msg: 'Failed to send reset email', msg_type:"error" })
            } else {     
                console.log('Email sent:', info.response);
                return res.render('forgotpage', { msg: 'Mail sent succesfully', msg_type:"good" })
               
            }
        });
        
        
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        sql.close();
    }
};




exports.resetPassword = async (req, res) => {
    const {Verfication, newPassword, confirmPassword } = req.body;

    // Extract the token from session
    //const token = req.session.resetToken;
   // const code=req.session.verification_code;
   const code=Verfication;

    // Check if the token is in the session
  
    console.log(code);

    // SQL Server configuration
    var config = {    
        database:'login',
        server:'WIN-MUSC6MOGOU0\\SQLEXPRESS',
        driver:'msnodesqlv8',
       options: {       
         trustedConnection: true
        }  
     }; 
    
    

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
        return res.render('passreset', { msg: 'Password do not match', msg_type: 'error' });
    }

    try {
        const pool = await sql.connect(config);

        // Check if the token is valid and not expired
        const queryResult = await pool.request()
           // .input('token', sql.NVarChar, token)
            .input('code', sql.NVarChar, code)
            .query('SELECT * FROM PasswordResetTokens WHERE verification_code = @code AND expires > GETDATE()');

        if (queryResult.recordset.length === 0) {
            // Token is either invalid or expired
            return res.render('passreset', { msg: 'Invalid or expired verification code', msg_type: 'error' });
        }

        // Valid token, hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the 'users' table
        const updateUserQuery = await pool.request()
            .input('email', sql.NVarChar, queryResult.recordset[0].email)
            .input('hashedPassword', sql.NVarChar, hashedPassword)
            .query('UPDATE users SET password = @hashedPassword WHERE email = @email');

        if (updateUserQuery.rowsAffected[0] === 1) {
            // Password successfully updated
            // Remove the used token from the 'PasswordResetTokens' table
            const deletecodeQuery = await pool.request()
                //.input('token', sql.NVarChar, token)
                .input('code', sql.NVarChar, code)
                .query('DELETE FROM PasswordResetTokens WHERE verification_code = @code');

            if (deletecodeQuery.rowsAffected[0] === 1) {
                // Token successfully deleted
                return res.render('passreset', { msg: 'Password reset successful', msg_type: 'good' });
            } else {
                // Failed to delete token
                return res.render('passreset', { msg: 'Failed to delete token', msg_type: 'error' });
            }
        } else {
            // Failed to update password
            return res.render('passreset', { msg: 'Failed to update password', msg_type: 'error' });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.render('passreset', { msg: 'Internal server error', msg_type: 'error' });
    } finally {
        sql.close();
    }
};













