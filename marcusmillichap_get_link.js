const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

let parser = new Parser();

// Delay function
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapFunction() {

    const browser = await puppeteer.launch({
        headless: false,
        // args: ['--incognito'],
        args: ['--incognito', '--start-maximized'],
    });

    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080});

    // await page.goto('https://www.marcusmillichap.com/properties#pageNumber=1&stb=orderdate,DESC', {
    //     timeout: 500000
    // });

    // await delay(3000);

    const price_range = [
        {min: 0, max: 1000000},
        {min: 1000001, max: 60000000},
        {min: 60000001, max: 80000000},
        {min: 80000000, max: 100000000},
        {min: 100000001, max: 110000000},
        {min: 110000001, max: 130000000},
        {min: 130000001, max: 150000000},
        {min: 150000001, max: 170000000},
        {min: 170000001, max: 190000000},
        {min: 190000001, max: 210000000},
        {min: 210000001, max: 230000000},
        {min: 230000001, max: 250000000},
        {min: 250000001, max: 270000000},
        {min: 270000001, max: 290000000},
        {min: 290000001, max: 310000000},
        {min: 310000001, max: 330000000},
        {min: 330000001, max: 350000000},
        {min: 350000001, max: 370000000},
        {min: 370000001, max: 390000000},
        {min: 410000001, max: 430000000},
        {min: 430000001, max: 430000000},
        {min: 430000001, max: 450000000},
        {min: 450000001, max: 470000000},
        {min: 470000001, max: 490000000},
        {min: 490000001, max: 510000000},
        {min: 510000001, max: 530000000},
        {min: 530000001, max: 550000000},
        {min: 550000001, max: 570000000},
        {min: 570000001, max: 590000000},
        {min: 590000001, max: 610000000},
        {min: 610000001, max: 630000000},
        {min: 630000001, max: 650000000},
        {min: 650000001, max: 670000000},
        {min: 670000001, max: 690000000},
        {min: 690000001, max: 710000000},
        {min: 710000001, max: 730000000},
        {min: 730000001, max: 750000000},
        {min: 750000001, max: 770000000},
        {min: 770000001, max: 790000000},
        {min: 790000001, max: 810000000},
        {min: 810000001, max: 830000000},
        {min: 830000001, max: 850000000},
        {min: 850000001, max: 870000000},
        {min: 870000001, max: 890000000},
        {min: 890000001, max: 910000000},
        {min: 910000001, max: 930000000},
        {min: 930000001, max: 950000000},
        {min: 950000001, max: 970000000},
        {min: 970000001, max: 990000000},
        {min: 990000001, max: 1000000000},
        {min: 1000000001, max: 1500000000},
        {min: 1500000001, max: 2500000000},
        {min: 2500000001, max: 100000000000}
    ];

    let link_list = [];

    for (let j = 0; j < price_range.length; j++) {
        const min_price = price_range[j].min;
        const max_price = price_range[j].max;
        console.log("-- ", j, " -- >>>> ", min_price, " ~ ", max_price, " ----");
        const range_url = `https://www.marcusmillichap.com/properties#r-listingprice=${min_price}~${max_price}&pageNumber=1&stb=orderdate,DESC`
        
        await page.goto(range_url, {
            timeout: 500000
        });
        await page.reload();
        // await delay(2000);
        
        for (let i = 1; i < 10; i++) {
            try {
                await delay(3000);
                const card_list = await page.$$("#property-search > div > div > div > div > div > ul > li > div > a");
                for( let card of card_list ) {
                    const attr = await page.evaluate(el => el.getAttribute("href"), card);
                    console.log("attr >>> ", attr);
                    if (attr != null) {
                        attr = "https://www.marcusmillichap.com" + attr;
                        // link_list.push(attr);
                        const result = { attr };
                        const csv = parser.parse(result);
                        const csvDataWithoutHeader = csv.split('\n')[1] + '\n';
                        fs.appendFileSync("marcusmillichap_link.csv", csvDataWithoutHeader, 'utf8', (err) => {
                            if (err) {
                                console.error('Error appending to CSV file:', err);
                            } else {
                                console.log('CSV data appended successfully.');
                            }
                        });
                    }
                }
                let flag_text = "";
                const next_btn_flag = await page.$(".next a");
                flag_text = await page.evaluate(el => el.getAttribute("aria-label"), next_btn_flag);
                console.log("flag text >>> ", flag_text);
                await page.evaluate(() => {
                    const next_btn = document.querySelector(".next > a");
                    next_btn.click();
                })
            } catch (error) {
                break;
            }
            
        }
    }

    // console.log("result >>> ", link_list.length, link_list);
        
    await browser.close();
    
}

scrapFunction();