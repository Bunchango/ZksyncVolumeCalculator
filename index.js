const puppeteer = require("puppeteer")

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

const getData = async () => {
    // Start a Puppeteer session with:
    // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
    // - no default viewport (`defaultViewport: null` - website page will in full width and height)
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });
  
    // Open a new page
    const page = await browser.newPage();
  
    // On this new page:
    const address = "0xa351b9F4BEE0e87660fc080817ad5Fa84E9CdA8E"
    await page.goto("https://explorer.zksync.io/address/" + address, {
      waitUntil: "networkidle0",
    });
  
    let total = 0;


    while (true) {

        // Scrape the data on the current page
        const vol = await page.evaluate(() => {
            const elements = document.querySelectorAll('.table-container.has-head.has-footer.transactions-table.high-rows.transactions-table .token-price');
            return Array.from(elements, el => el.innerHTML);
        });

        // Calculate the total amount
        vol.forEach(val => {
            total += parseFloat(val.replace("$", ""));
        });

        const isDisabled = await page.$eval('.pagination-page-button.arrow.right', button => {
            return button.classList.contains('disabled');
        });
        
        if (!isDisabled) {
            // If the button is not disabled, click it
            await page.click('.pagination-page-button.arrow.right');
            await delay(500);
        } else {
            // If disabled, break the loop
            break;
        }
    }
    
    console.log(`Your total volume is: `, Math.round(total, 2));

    // Close the browser
    await browser.close();
};

// Start the scraping
getData();
  