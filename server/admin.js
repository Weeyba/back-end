const connection = require('./database');

const Admin = {
    getTotalUsers: (sqlvar, table, param) => {
        var getQuery = `SELECT COUNT(*) AS totals FROM ${table}`;
        connection.query(getQuery, (err, result) => {
            if (err) throw err;
            const varDb = result[0].totals;
            console.log(`Total number of ${param}`, varDb)
            console.log(result)
            return varDb;
        })
    },
    getSum: (column, args, table) => {
        var sumQuery = `SELECT SUM(${column}) AS totalCount FROM ${table}`
        connection.query(sumQuery, (sumErr, sumResult) => {
            if (sumErr) throw sumErr
            let countDb = sumResult[0].totalCount
            console.log(`Total Sum for ${args}: `, countDb)
            console.log(sumResult);
            return sumResult;
        })
    },
    // getDate: () => {
    //    let date = new Date()
    //    console.log(date)
    // }
    // ActivityBalance: (username) => {
    //     let bonus = '1000';
    //     let userParam = username;
    //     let updateQuery  = 'UPDATE userdata SET ActivityBalance = ActivityBalance + ? WHERE username = ?';
    //     connection.query(updateQuery, [bonus, userParam], (updateErr, updateResult) => {
    //         if (updateErr) throw updateErr;
    //             console.log('Balance Added', updateResult)
    //     })
    }
    



Admin.getTotalUsers('totalUsers', 'userdata', 'users')
Admin.getTotalUsers('totalCoupons', 'coupons', 'coupon');
Admin.getSum('ActivityBalance', 'Activity Balance', 'userdata');
Admin.getSum('AffiliateBalance', 'Affiliate Balance', 'userdata')
Admin.ActivityBalance('Prozymax901')

