const express = require('express');
const App = express();
require("dotenv").config();
const connection = require('./database');
var BodyParser = require('body-parser');
const path = require('path')
const html = require('./htmlRender');
const http = require('http');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const GENERATOR = require('./coupon')
const mailer = require('nodemailer');

const MailTransporter = mailer.createTransport({
    host: 'mail.weeyba.com', // Replace with your mail server's SMTP host
    port: 465, // Replace with the appropriate port (e.g., 587 for TLS)
    secure: true, // Set to true if using port 465 and secure connection (SSL)
    auth: {
        user: 'noreply@weeyba.com', // Your domain email address
        pass: 'l}5P,Vp[hl}*' // Your domain email password
    }
});

const FUNCTIONS = {
    verifyJwtToken: (request, response, next) => {
        const token = request.headers.authorization?.split(' ')[1];
        if(!token) {
            return response.status(401).json({ message: 'Missing Token' })
        }
        try {
            const decodedToken = jwt.verify(token, secretKey);
            request,user =- decodedToken;
            next()
        }
        catch (error) {
            return response.status(401).json({ message: 'Invalid token' })
        }
    },
    key: () => {
        let codeOne = GENERATOR.getRandom(10030400, 90049200),
            letterCode = GENERATOR.getRandomLetters().generatedLetter,
            codeTwo = GENERATOR.getRandom(1500, 5300),
            KEYONE = `WEY${codeOne}BAWEY${letterCode}BA`,
            KEYTWO = `KEY${codeTwo}1WEY${letterCode}KEYWEEYBA`,
            secretKey = `${KEYONE}${KEYTWO}`;
    
        console.log(secretKey)
        return secretKey
    },
    generatePassToken: (request, response, next) => {
        const code = () => {
        var verificationCode = GENERATOR.getRandom(150000, 200100);
        return verificationCode;
        }
        request.passToken = code();
        next()
    },
}


const secretKey = FUNCTIONS.key();

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }))

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Unable to connect to the database:', err);
  } else {
    console.log('Connected to MySQL database');
 }
});


App.get('/', (request, response) => {
    response.send(html.Render('Welcome To Weyba', 'sign', 'Sign Up'))
})

App.get('/sign', (request, response) => {
    response.sendFile(__dirname + '/signin.html')
})

App.post("/signup", (request, response, next) => {
    const newData = {
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        email: request.body.email,
        phone: request.body.phone,
        password: request.body.pass,
        username: request.body.username,
        coupon: request.body.coupon,
        referal: request.body.refer,
    }
    
const WeeybaReferalCheck = () => {
    refQuery = 'SELECT * FROM userdata where username = ?';
    let referid = request.body.refer
    connection.query(refQuery, [referid], (selectErr, selectResult) => {
        if (selectErr) throw selectErr;
        if (selectResult.length > 0) {
            console.log('User exists', selectResult)
        }
        else {
            console.log('Username doesn\'t exists')
        }
    })
}

const WeeybaReferalBonusAdder = () => {
    let referid = request.body.refer,
        bonus = '3500',
        referalCount = '1'
        updateQuery  = 'UPDATE userdata SET referal = referal + ?, AffiliateBalance = AffiliateBalance + ? WHERE username = ?';
    connection.query(updateQuery, [referalCount, bonus, referid], (updateErr, updateResult) => {
        if (updateErr) throw updateErr;
            console.log('Balance Added', updateResult)
    })
}
// Create a function that rerturns request.body and takes oarameters for what to get from the document.
const insertQuery = 'INSERT INTO userdata SET ?';

const SQLVERIFY = () => {
    let coupon = newData.coupon;
    return new Promise((resolve) => {
        WeeybaReferalCheck();
        setTimeout(() => {
            let insertQuery = 'SELECT * FROM coupons WHERE coupon = ? AND Status = ?';
            connection.query(insertQuery, [coupon, '0'], (err, results) => {
                if (err) throw err;

                if(results.length > 0) {
                        let updateQuery = 'UPDATE coupons SET Status = ? WHERE coupon = ?';
                        connection.query(updateQuery, ["Used", coupon], (updateErr, updateResults) => {
                            if (updateErr) throw updateErr;
                            console.log(updateResults);
                            resolve(`Verified: This coupon is Present and has not been used`);
                        })
                     }
                     else {
                        return response.status(400).send('Invalid Coupon Code')
                     }
            })
        }, 2000)
    })
}
async function SQLINSERT() {
    console.log('Waiting for coupon code verification........')
    const confirmCoupon = await SQLVERIFY()
    WeeybaReferalBonusAdder()
    console.log(confirmCoupon)
    connection.query(insertQuery, newData, (err, result) => {
        if (err) throw err;
              console.log('Data added succesfully')
              response.send(result)
            })
}
SQLINSERT()
return newData
}
)
App.get('/login', (request, response) => {
    response.sendFile(__dirname + '/login.html')
})

App.post('/profile', async (request, response, next) => {
    const email = request.body.email,
        pass = request.body.pass;


    const sql = 'SELECT * FROM userdata WHERE email = ? AND password = ?';
    const balanceAdder = 'UPDATE userdata SET ActivityBalance = ActivityBalance + ?, logindate = ? WHERE email = ?';
    const toAdd = '200.00';
    const date = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`

    async function UserLogin() {
        let ourPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let dateQuery = 'SELECT logindate FROM userdata WHERE email = ? AND password = ?';
                connection.query(dateQuery, [email, pass], (dateErr, dateResult) => {
                    if (dateErr) throw dateErr;
                    if (dateResult.length > 0) {
                        console.log(dateResult[0].logindate);
                        let dbDate = dateResult[0].logindate;
                        if (dbDate === date) {
                            console.log('Booth are same');
                            resolve(true);
                        } else {
                            console.log('Arecnt same');
                            resolve(false);
                        }
                    } else {
                        console.log('Couldnt fetch Date......');
                    }
                });
            }, 2000);
        });

        console.log('Getting Date Verification....');
        const dateChecker = await ourPromise;
        if (!dateChecker) {
            connection.query(sql, [email, pass], (err, results) => {
                if (err) {
                    console.error('Error executing the SELECT query:', err);
                    throw err;
                } else {
                    // Process the results returned from the database
                    console.log('Data logged in');
                    connection.query(balanceAdder, [toAdd, date, email], (err, result) => {
                        if (err) throw err;
                        console.log('Successful adding...', result);
                    });
                    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
                    console.log('Full user detaiils ', results);
                    response.json({ token, user: results[0]});
                }
            });
        } 
        else {
           connection.query(sql, [email, pass], (err, result) => {
            if (err) throw err;
                console.log('Didnt touch database', result)
                response.send(result);
           })
        }
    }
    UserLogin();
});


App.get('/coupon', (request, response) => {
    response.sendFile(__dirname + '/coupon.html')
})

App.get('/admin', (request, response) => {
    response.sendFile(__dirname + '/admin.html')
})

App.post('/admin/dashboard', (request, response) => {
    let username = request.body.username,
        password = request.body.pass;
        const logQuery = 'SELECT * FROM admin WHERE username = ? AND password = ?';
        connection.query(logQuery, [username, password], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                console.log(result);
            console.log('Logged in: ', result)
            const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
            response.json({ JWT: token, user: result })
            }
            else {
                console.log('Admin does not exist', result)
                response.send('Adminn does not exist')
            }
        })
        
})


process.on('SIGINT', () => {
    connection.end((err) => {
        if (err) {
            console.log('Unable to close Database Connection', err)
        }
        else {
            console.log('Database Connection closed succesfully');
            process.exit(0);
        }
    })
})

App.get('/forgot', (request, response) => {
  response.sendFile(__dirname + '/forgotEmail.html');  
})

App.post('/token-sent', FUNCTIONS.generatePassToken, (request, response) => {   
    const email = request.body.email;
    const mailOptions = {
                from: 'noreply@weeyba.com',
                to: email,
                subject: 'Forgotten Password',
                text: `Do Not Dissclose this code to anybody else. Your recovery password is ${request.passToken}`
            };
            MailTransporter.sendMail(mailOptions);
            console.log('Code has been sent')
            // sending token and email to database
            const emailQuery = 'INSERT INTO verify (email, token) VALUES (?,?)';
    connection.query(emailQuery, [email, request.passToken], (insertErr, insertResult) => {
        if (insertErr) throw insertErr;
        // if (insertResult.length > 0) {
        //     console.log('Credentials Added: ', insertResult);
        //     response.sendFile(__dirname + '/verification.html')
        // }
        console.log(insertResult);
        response.sendFile(__dirname + '/verification.html')
    })
})

App.post('/updateForm', (request, response) => {
    let ReceivedToken = request.body.token;
    let codeQuery = 'SELECT * FROM verify WHERE token = ?'
    connection.query(codeQuery, [ReceivedToken], (SelectErr, SelectResult) => {
        if (SelectErr) throw SelectErr;
        if (SelectResult.length > 0) {
            console.log(SelectResult[0])
            response.json({ result: SelectResult[0]})
        }
        else {
            console.log('INCORRECT VERIFICATION CODE')
            response.json({ message: 'INCORRECT VERIFICATION CODE' });
        }
    })
})

App.post('/reset', (request, response) => {
    let email = request.body.email;
    let newPass = request.body.pass;
    let updateQuery = 'UPDATE userdata SET password = ? WHERE email = ?'

    connection.query(updateQuery, [newPass, email], (UpdateErr, UpdateResult) => {
        if (UpdateErr) throw UpdateErr;
        if (UpdateResult.changedRows > 0) {
            console.log(UpdateResult)
            response.json({ message: 'Password Updated', result: UpdateResult })
        }
        else {
            console.log('Unable to change password');
            response.status(500).json({ message: 'Unable to Update Password | Password changed already | Password are a match' });
        }
    })
})


App.get('/update', (request,response) => {
    response.sendFile(__dirname + '/updatePass.html')
})

// Endpoints for updatig password 
App.post('/updatePassword', (request, response) => {
    let oldPass = request.body.oldPass;
    let newPass = request.body.newPass;
    let email = request.body.email;
    let updateQuery = 'UPDATE userdata SET password=? WHERE password=? AND email=?';
    connection.query(updateQuery, [newPass, oldPass, email], (err, result) => {
        if(err) throw err;
        if (result.changedRows > 0 && result.affectedRows > 0) {
            console.log(result);
            const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
            response.json({JWT: token, result: result, message: 'Password has  been updated' })
        }
        else {
            response.json({ message: 'Unable to find password match or change password'})
        }
    })
})
App.get('/withdraw', (request, response) => {response.sendFile(__dirname + '/withdraw.html')})

App.post('/ActivityWithdraw', (request, response, next) => {
    let email = request.body.email,
        username = request.body.username,
        reqAmount = request.body.amount;
        let NewPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                const wdQuery = 'SELECT * FROM userdata WHERE email=? AND username=?';
                connection.query(wdQuery, [email, username], (err, result) => {
                    if (err) throw err;
                    if (result.length > 0) {
                        console.log(result[0]);
                        resolve(result);
                    }
                    else {
                        console.log('Error gettin username')
                    }
    
            })
       }, 2000)
    
        })
        async function ActivityTransferData() {
            let ActivityWithdrawalthreshold = '9000';
            const result = await NewPromise;
            const newData = {
                Name: `${result[0].firstname} ${result[0].lastname}`,
                ActivityBalance: `${result[0].ActivityBalance}`,
                RequestedAmount: reqAmount,
                AccountNumber: `${result[0].accountNumber}`,
                AccountName: `${result[0].accountName}`,
                Bank: `${result[0].bank}`
            }
           if (Number(newData.RequestedAmount) <= Number(newData.ActivityBalance) && Number(newData.RequestedAmount) >= Number(ActivityWithdrawalthreshold)) {
            const dataQuery = 'INSERT INTO withdrawal SET ?';
            connection.query(dataQuery, newData, (err, result) => {
                if (err) throw err;
                console.log('Withdrawal placed', result)
                response.json({ message: 'Withdrawal Placed', result })
            })
        }
        else {
               response.json({ message: 'User Balance is lower that requested amount' });
           }
        }
        ActivityTransferData()
})

App.post('/Affiliatewithdrawal', (request, response) => {
    let email = request.body.email,
        username = request.body.username,
        reqAmount = request.body.amount;
    let NewPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            const wdQuery = 'SELECT * FROM userdata WHERE email=? AND username=?';
            connection.query(wdQuery, [email, username], (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    console.log(result[0]);
                    resolve(result);
                }
                else {
                    console.log('Error gettin username')
                }

        })
   }, 2000)

    })
    //for affiliate
    async function AffiliateTransferData() {
        let AffiliateWithdrawalthreshold = '6000';
        const result = await NewPromise;
        const newData = {
            Name: `${result[0].firstname} ${result[0].lastname}`,
            AffiliateBalance: `${result[0].AffiliateBalance}`,
            RequestedAmount: reqAmount,
            Referals: `${result[0].referal}`,
            AccountNumber: `${result[0].accountNumber}`,
            AccountName: `${result[0].accountName}`,
            Bank: `${result[0].bank}`
        }
       if (Number(newData.RequestedAmount) <= Number(newData.AffiliateBalance) && Number(newData.RequestedAmount) >= Number(AffiliateWithdrawalthreshold)) {
        const dataQuery = 'INSERT INTO affiliatewithdrawal SET ?';
        connection.query(dataQuery, newData, (err, result) => {
            if (err) throw err;
            console.log('Withdrawal placed', result)
            response.json({ message: 'Withdrawal Placed', result })
        })
    }
    else {
           response.json({ message: 'User Balance is lower that requested amount' });
       }
    }
    AffiliateTransferData()
})

App.get('/get-all-activity-withdraw', (request, response) => {
    let query = 'SELECT * FROM withdrawal';
    connection.query(query, (err, result) => {
        if (err) throw err;
        console.log('All users', result);
        response.json({ user: result });
    })
})
App.get('/get-all-affiliate-withdraw', (request, response) => {
    let query = 'SELECT * FROM affiliatewithdrawal';
    connection.query(query, (err, result) => {
        if (err) throw err;
        console.log('All users', result);
        response.json({ user: result });
    })
})
App.listen(5000, () => {
    console.log('App is starting at localhost: 5000')
})

module.exports = connection;