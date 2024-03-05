const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');

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

    await page.goto('https://www.marcusmillichap.com/properties#pageNumber=1&stb=orderdate,DESC', {
        timeout: 500000
    });

    await delay(3000);

    await page.evaluate(() => {
        const signup_btn = document.querySelector("body > header > div > div > div > div > div > a");
        signup_btn.click();
    });
    await delay(2000);
    
    const email_addr_path = '#email';
    await page.waitForSelector(email_addr_path, { timeout: 3000});
    await page.type(email_addr_path, "smallstar0924@gmail.com");
    await delay(6000);
    await page.evaluate(() => {
        const signup_btn_path = document.querySelector('#next');
        signup_btn_path.click();
    });
    await delay(2000);
    const password_path = '#password';
    await page.waitForSelector(password_path, { timeout: 3000});
    await page.type(password_path, "Angel0924");
    await page.evaluate(() => {
        const signup_btn_path = document.querySelector('#next');
        signup_btn_path.click();
    });
    console.log("login success!");
    await delay(10000);

    const data = await readFileSequentially("marcusmillichap_link.csv");
    for (const row of data) {
        const link = row[0];
        // console.log("---------- ", i, " ----------");
        // const link = "https://www.marcusmillichap.com" + link_list[i];
        console.log(link);

        await page.goto(link, {
            timeout: 300000
        });

        await delay(5000);

        let offering_link = "";
        offering_link = await page.evaluate(() => {
            try {
                const offer_btn = document.querySelector("#page-content > div > div > div > div > div > div > div > div > div > div > a");
                const target_link = offer_btn.getAttribute('href');
                if (target_link != null) {
                    return target_link;
                }
            } catch (error) {

            }
        });
        if (offering_link) {
            console.log("Offering page...");
            offering_link = 'https://www.marcusmillichap.com' + offering_link;
            console.log(offering_link);
            await page.goto(offering_link, { timeout: 300000 });
            await delay(8000);

            try {
                await page.evaluate(() => {
                    const confid_agr_btn = document.querySelector("div.deal-room-locked > a");
                    confid_agr_btn.click();
                });
                await delay(5000);
            } catch (error) {
                
            }

            try {
                await page.evaluate(() => {
                    const current_checkbox = document.querySelector('div.checkbox-row > div:nth-child(1) > div > div.checkbox > label > input');
                    current_checkbox.click();
                });
                await delay(5000);
                // await page.evaluate(() => {
                //     const date_box = document.querySelector(".date-signed-content > input");
                //     date_box.click()
                // });
                const date_box = await page.$('.date-signed-content input');
                const box = await date_box.boundingBox();
                const x = Math.round(box.x + 10);
                const y = Math.round(box.y + 10);
                await page.mouse.move(x, y);
                await page.mouse.click(x, y);
                await page.keyboard.press('0');
                await page.keyboard.press('3');
                await page.keyboard.press('0');
                await page.keyboard.press('5');
                await page.keyboard.press('2');
                await page.keyboard.press('0');
                await page.keyboard.press('2');
                await page.keyboard.press('4');
    
    
                await page.evaluate(() => {
                    const accept_checkbox = document.querySelector('div.checkbox-row > div:nth-child(2) > div > div.checkbox > label > input');
                    accept_checkbox.click();
                });
    
                await page.evaluate(() => {
                    const access_btn = document.querySelector('.btnSubmit');
                    access_btn.click();
                });
                await delay(5000);
            } catch (error) {
                
            }

            await page.evaluate(() => {
                const all_check = document.querySelector(".deal-checkbox > input");
                all_check.click();
            });
            await delay(5000);

            await page.evaluate(() => {
                const down_btn = document.querySelector(".deal-room-download");
                down_btn.click();
            });
            
        } else {
            continue;
        }
    
    }
        
    await browser.close();
    
}

async function readFileSequentially(filePath) {
    return new Promise((resolve, reject) => {
        let data = [];

        fs.createReadStream(filePath, { encoding: 'utf8' })
            .pipe(csv({ separator: ',', headers: false }))
            .on('data', chunk => {
                // console.log('data-->', chunk)
                data.push(chunk);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', error => {
                reject(error);
            });
    });
}

scrapFunction();