const express = require('express');
const App = express();
const connection = require('./database');
const COUPON = {
    variables: {
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'D',
        5: 'E',
        6: 'F',
        7: 'G',
        8: 'H',
        9: 'I',
        10: 'J',
    },
    getRandom: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min)
    },
    getRandomLetters: () => {
        let letterIndex = COUPON.getRandom(1, 5);
        let generatedLetter = COUPON.variables[letterIndex];
        return {generatedLetter, letterIndex};
    },
    getRandomNumbers: () => {
        let code = COUPON.getRandom(10000, 90000)
            return code;
    },
    assemble: () => {
        let letterOutput = COUPON.getRandomLetters();
        let numberOutput = COUPON.getRandomNumbers();
        let couponCode = `1WEY${letterOutput.generatedLetter}${numberOutput}BA`
        return couponCode;
    },
    getCoupon: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(COUPON.assemble());
            }, 2000)
        })
    },
    generate: async () => {
        console.log('Waiting For Coupon Code.')
        const couponCode = await COUPON.getCoupon();
        console.log(couponCode);
        let sqlQuery = 'INSERT INTO coupons (coupon, Status) VALUES (?, ?)';
        connection.query(sqlQuery, [couponCode, '0'], (err, results) => {
            if (err) throw err;
            console.log('Coupon added to database')
        })
    }
}

// COUPON.generate();


module.exports = COUPON;