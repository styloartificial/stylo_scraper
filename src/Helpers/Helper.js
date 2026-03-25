class Helper {
    static async Delay(s) {
        return new Promise(resolve => setTimeout(resolve, s * 1000));
    }

    static PrintMsg(msg) {
        console.log(
            colors.yellow(moment().format("YYYY-MM-DD hh:mm:ss")),
            colors.green(msg)
        );
    }

    static PrintErrorMsg(msg) {
        console.error(
            colors.yellow(moment().format("YYYY-MM-DD hh:mm:ss")),
            colors.red(msg)
        );
    }

    static async SafeAction(p, selector, action, options = {}) {
        const {
            value = null,
            description = selector,
            timeout = 5000,
            delay = 100,
            hidden = false,
            nth = null,
            state = null,
            maxRetries = 2
        } = options;

        const config = await getConfig();

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                Helper.PrintMsg(`[${attempt}/${maxRetries}] ${action.toUpperCase()} on: ${description}`);

                if (action !== 'wait') {
                    await p.waitForSelector(selector, {
                        state: hidden ? 'attached' : state ? state : "visible",
                        timeout: timeout
                    });
                }

                let locator = p.locator(selector);
                if (nth !== null && nth !== undefined) {
                    locator = locator.nth(nth);
                } else {
                    locator = locator.first();
                }

                switch (action) {
                    case 'click':
                        await locator.click({ timeout: timeout });
                        break;
                    case 'type':
                        await locator.type(value, { delay: delay, timeout: timeout });
                        break;
                    case 'fill':
                        await locator.fill(value, { timeout: timeout });
                        break;
                    case 'text':
                        return await locator.textContent();
                    case 'wait':
                        await p.waitForSelector(selector, { state: state ? state : "visible", timeout: timeout });
                        break;
                    default:
                        throw new Error(`Action '${action}' not supported`);
                }
                await Helper.Delay(1);
                return true;

            } catch (error) {
                if (attempt === maxRetries) {
                    const msg = `Failed at ${description} after ${maxRetries} attempts. Change element selector maybe needed`;
                    Helper.PrintErrorMsg(msg);
                }
            }
        }
    }
}

module.exports = Helper;