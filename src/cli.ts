#!/usr/bin/env node

import { program } from 'commander';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import GeminiCursorTools from './index';

// Load environment variables from .env file
dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '.cursor-tools.env') });

program
    .name('gcursor')
    .description('Cursor tools with Gemini API support')
    .version('1.0.0');

program
    .command('browser <action>')
    .description('Execute browser actions')
    .option('-u, --url <url>', 'Target URL', 'http://localhost:3001')
    .option('--headless', 'Run in headless mode', true)
    .option('--timeout <ms>', 'Timeout in milliseconds', '30000')
    .action(async (action, options) => {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error('Error: GOOGLE_API_KEY environment variable is required');
            console.error('Add it to your .env file or .cursor-tools.env file:');
            console.error('GOOGLE_API_KEY=your_api_key_here');
            process.exit(1);
        }

        const tools = new GeminiCursorTools(apiKey);

        try {
            await tools.init({
                url: options.url,
                headless: options.headless,
                timeout: parseInt(options.timeout)
            });

            if (action.startsWith('http')) {
                console.log('Browser opened at:', action);
            } else {
                await tools.executeAction(action);
                console.log('Action executed successfully');
            }
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        } finally {
            await tools.close();
        }
    });

program.parse(); 