import { GoogleGenerativeAI } from '@google/generative-ai';
import { chromium, Browser, Page } from 'playwright';

interface BrowserOptions {
    url: string;
    headless?: boolean;
    timeout?: number;
    model?: string;
}

class GeminiCursorTools {
    private genAI: GoogleGenerativeAI;
    private browser: Browser | null = null;
    private page: Page | null = null;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async init(options: BrowserOptions) {
        this.browser = await chromium.launch({
            headless: options.headless ?? true
        });
        this.page = await this.browser.newPage();
        await this.page.goto(options.url, {
            timeout: options.timeout ?? 30000
        });
    }

    async executeAction(action: string) {
        if (!this.page) {
            throw new Error('Browser not initialized');
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        // Parse the action using Gemini
        const prompt = `Parse the following browser action and convert it to steps:
        Action: ${action}
        Return only the steps as a JSON array of objects with 'type' and 'value' properties.
        Example: ["Click 'Login'", "Type 'user@example.com' into email"] would return:
        [{"type": "click", "value": "Login"}, {"type": "type", "value": "user@example.com", "target": "email"}]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const steps = JSON.parse(response.text());

        // Execute each step
        for (const step of steps) {
            switch (step.type) {
                case 'click':
                    // Wait for element to be visible and enabled
                    await this.page.waitForSelector(`text=${step.value}`, { state: 'visible', timeout: 5000 });
                    const element = await this.page.$(`text=${step.value}`);
                    if (element) {
                        const isDisabled = await element.evaluate((el) => el.hasAttribute('disabled'));
                        if (isDisabled) {
                            console.log(`Button ${step.value} is disabled, skipping...`);
                            continue;
                        }
                    }
                    await this.page.click(`text=${step.value}`);
                    break;
                case 'type':
                    await this.page.fill(`[placeholder*="${step.target}"]`, step.value);
                    break;
                case 'wait':
                    await this.page.waitForTimeout(parseInt(step.value) * 1000);
                    break;
            }
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const actionOrUrl = args[1];
    const options = parseOptions(args.slice(2));

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('GOOGLE_API_KEY environment variable is required');
        process.exit(1);
    }

    const tools = new GeminiCursorTools(apiKey);

    try {
        switch (command) {
            case 'browser':
                await tools.init({ url: options.url || 'http://localhost:3001', ...options });
                if (actionOrUrl.startsWith('http')) {
                    // Just open the URL
                    console.log('Browser opened at:', actionOrUrl);
                } else {
                    // Execute the action
                    await tools.executeAction(actionOrUrl);
                    console.log('Action executed successfully');
                }
                break;
            default:
                console.error('Unknown command:', command);
                process.exit(1);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await tools.close();
    }
}

function parseOptions(args: string[]): Record<string, any> {
    const options: Record<string, any> = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const value = args[i + 1];
            if (value && !value.startsWith('--')) {
                options[key] = value;
                i++;
            } else {
                options[key] = true;
            }
        }
    }
    return options;
}

if (require.main === module) {
    main().catch(console.error);
}

export default GeminiCursorTools; 