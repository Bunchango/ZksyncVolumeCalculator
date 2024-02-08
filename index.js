const puppeteer = require("puppeteer");

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

const getData = async (address) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.goto("https://explorer.zksync.io/address/" + address, {
        waitUntil: "networkidle0",
    });

    let total = 0;

    while (true) {
        const vol = await page.evaluate(() => {
            const elements = document.querySelectorAll('.table-container.has-head.has-footer.transactions-table.high-rows.transactions-table .token-price');
            return Array.from(elements, el => el.innerHTML);
        });

        vol.forEach(val => {
            total += parseFloat(val.replace("$", ""));
        });

        const isDisabled = await page.$eval('.pagination-page-button.arrow.right', button => {
            return button.classList.contains('disabled');
        });

        if (!isDisabled) {
            await page.click('.pagination-page-button.arrow.right');
            await delay(500);
        } else {
            break;
        }
    }

    console.log(`Total volume for address ${address}: `, total.toFixed(2));

    await browser.close();
};

// Extracting command line arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error("Usage: node script.js <address>");
    process.exit(1);
}

const address = args[0];

getData(address);
