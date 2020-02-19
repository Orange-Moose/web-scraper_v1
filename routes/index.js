const express = require('express');
const router = express.Router();
const { catchErrors } = require('../errors/errorHandlers');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'variables.env' });
let prevCount;



//MAIL
async function mail(cur, prev) {

  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  let info = await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: process.env.MAIL_TO,
    subject: "-- Nauja žinutė --",
    text: `Yra naujų įrašų! Iš viso: ${cur} įrašų. Buvo ${prev} įrašų.`,
    html: `<h3>Yra naujų įrašų! Iš viso: ${cur} įrašų.</h3>\n<i>Buvo ${prev} įrašų</i>.`
  });

}


//SCRAPER
async function scrapeListings(url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.client-info');

  const count = await page.evaluate(() => {
    const nodeList = document.querySelectorAll('.client-info');
    return Array.from(nodeList).length;
  });

  browser.close();
  return count;
}


const countItems = async () => {
  async function setCount() {
    let currentCount = await scrapeListings('https://www.orange-moose.com/pubinvoiceapp/');

    if (currentCount > prevCount || currentCount < prevCount) {
      mail(currentCount, prevCount).catch(console.error);
      const mailSent = `You have ${currentCount - prevCount} new items.`
      prevCount = currentCount;
      return mailSent;
    };

    prevCount = currentCount;
    return;
  }
  return await setCount();
};


//ROUTES
const homePage = async (req, res) => {
  res.render('home', { title: "Count items"});
};

const startApp = async (req, res) => {
  let newItems = await countItems();
  if(newItems === undefined) return;
  let time = new Date().toString();
  let log = { msg: `${newItems} | ${time.slice(4, 24)}` };
  res.json(log);
};

router.get('/', catchErrors(homePage));
router.get('/start', catchErrors(startApp));

module.exports = router;