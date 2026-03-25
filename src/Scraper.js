const { chromium } = require('playwright');
const axios = require('axios').default;
const Helper = require('./Helpers/Helper.js');

class WebScraper {

    constructor(config = {}) {
        this.config = {
            headless: process.env.HEADLESS_MODE,
            pageUrl: process.env.PAGE_URL,
            loginId: process.env.LOGIN_ID,
            loginPassword: process.env.LOGIN_PASSWORD,
            loginPin: process.env.LOGIN_PIN,
            ...config
        };

        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async init() {
        this.browser = await chromium.launch({
            headless: this.config.headless
        });

        this.context = await this.browser.newContext({
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36'
        });

        this.page = await this.context.newPage();

        process.on('SIGINT', async () => {
            console.log("\nShutting down gracefully...");
            await this.close();
            process.exit();
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        console.log("Starting bot...");
        this.HandleCaptchaWatcher();

        await this.ToDashboard();
        while (true) {
            try {
                Helper.PrintMsg("Checking already login...");
                try {
                    await Helper.SafeAction(this.page, "input[type='text'][name='loginKey']", "wait");
                    await this.run();
                } catch (error) {
                    Helper.PrintMsg("Already logged in, proceeding to check pending data...");
                }

                let pendingData = null;
                while (!pendingData) {
                    pendingData = await this.GetFirebaseOldestPendingData();
                }

                await this.ScrapPendingData(pendingData);
            } catch (err) {
                console.error("Error when scraping, restarting instance:", err);
                await Helper.Delay(5);
            }
        }
    }

    // Main Code
    async HandleCaptchaWatcher() {
        while (true) {
            try {
                const captcha = await this.page.$("h1:has-text('Verifikasi untuk melanjutkan')");

                if (captcha) {
                    Helper.PrintMsg("Captcha detected! Handling...");
                }

            } catch (err) {
                console.log("Captcha watcher error:", err);
            }
            await Helper.Delay(3);
        }
    }

    async ToDashboard() {
        try {
            Helper.PrintMsg("Accessing Login Page...");
            await this.page.goto(this.config.pageUrl, { waitUntil: 'networkidle' });
            await Helper.Delay(3);

            try {
                Helper.PrintMsg("Checking language selection...");
                await Helper.SafeAction(this.page, "button:has-text('Bahasa Indonesia')", "click");
            } catch (error) {
                Helper.PrintMsg("Language selection not found, maybe already selected. Skipping language selection...");
            }

            try {
                Helper.PrintMsg("Checking Login Form...");
                await Helper.SafeAction(this.page, "input[type='text'][name='loginKey']", "type", {
                    value: this.config.loginId,
                    description: "Typing login ID"
                });
                await Helper.SafeAction(this.page, "input[type='password'][name='password']", "type", {
                    value: this.config.loginPassword,
                    description: "Typing password"
                });
                await Promise.all([
                    this.page.waitForNavigation({ waitUntil: 'load' }),
                    Helper.SafeAction(this.page, "button:has-text('Log In')", "click", {
                        description: "Click button login"
                    })
                ]);

                try {
                    Helper.PrintMsg("Checking PIN Input...");
                    await Promise.all([
                        this.page.waitForNavigation({ waitUntil: 'load' }),
                        await Helper.SafeAction(this.page, "button[aria-label='Verifikasi dengan PIN ShopeePay']", "click")
                    ]);
                    await Helper.Delay(1);

                    await this.page.type.keyboard(this.config.loginPin);
                    await Helper.Delay(1);

                    await Promise.all([
                        this.page.waitForNavigation({ waitUntil: 'load' }),
                        await Helper.SafeAction(this.page, "button:has-text('OK')", "click")
                    ]);
                } catch (error) {
                    Helper.PrintMsg("PIN input not found, maybe already passed PIN verification. Skipping PIN input...");
                }

                await Helper.SafeAction(this.page, "form[role='search']", "wait");
                Helper.PrintMsg("Login successful, proceeding to dashboard...");
                await Helper.Delay(3);
            } catch (error) {
                Helper.PrintMsg("Login form not found, maybe already logged in. Skipping login process...");
            }
        } catch (error) {
            Helper.PrintErrorMsg(`Failed to access login page: ${error.message}`);
            throw error;
        }
    }

    async GetFirebaseOldestPendingData() {
        try {

        } catch (error) {
            Helper.PrintErrorMsg(`Failed to get pending data: ${error.message}`);
            throw error;
        }
    }

    async ScrapPendingData(pendingData) {
        try {

        } catch (error) {
            Helper.PrintErrorMsg(`Failed to scrap pending data: ${error.message}`);
            throw error;
        }
    }
}

module.exports = WebScraper;