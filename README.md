# Gemini Cursor Tools

A browser automation tool powered by Google's Gemini AI. This tool allows you to automate browser actions using natural language commands.

## Installation

Install the package globally:

```bash
npm install -g gemini-cursor-tools
```

## Configuration

Create a `.env` file in your project directory with your Google API key:

```env
GOOGLE_API_KEY=your_api_key_here
```

## Usage

Basic usage:
```bash
gcursor browser "Click 'Login'"
```

Complex actions:
```bash
gcursor browser "Click 'Login' | Wait 1s | Type 'user@example.com' into email"
```

Options:
```bash
# Run with visible browser
gcursor browser "Click 'Submit'" --headless=false

# Custom URL
gcursor browser "Click 'Login'" --url=http://localhost:3000

# Custom timeout
gcursor browser "Click 'Submit'" --timeout=60000
```

## Available Commands

- `browser <action>`: Execute browser actions
  - Options:
    - `-u, --url <url>`: Target URL (default: http://localhost:3001)
    - `--headless`: Run in headless mode (default: true)
    - `--timeout <ms>`: Timeout in milliseconds (default: 30000)

## Examples

Login form automation:
```bash
gcursor browser "Click 'Login' | Wait 1s | Type 'john@example.com' into email | Type 'password123' into password | Click 'Submit'" --headless=false
```

## Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gemini-cursor-tools.git
cd gemini-cursor-tools
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Link for local development:
```bash
npm link
```

## License

ISC 