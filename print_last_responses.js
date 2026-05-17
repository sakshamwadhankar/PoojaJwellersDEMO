const fs = require('fs');
const logPath = "C:\\Users\\saksham\\.gemini\\antigravity\\brain\\2fc15250-7d41-4efd-806e-b1b19e9ba571\\.system_generated\\logs\\overview.txt";

if (!fs.existsSync(logPath)) {
  console.log("Log path does not exist:", logPath);
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

const parsedLines = [];
lines.forEach((line) => {
  if (!line.trim()) return;
  try {
    const data = JSON.parse(line);
    parsedLines.push(data);
  } catch (e) {}
});

// Sort by step_index
parsedLines.sort((a, b) => a.step_index - b.step_index);

// Find the first entry of the current session (which started at 1609)
const prevEntries = parsedLines.filter(entry => entry.step_index < 1608);

console.log("Total previous entries:", prevEntries.length);

const lastPrevEntries = prevEntries.slice(-15);
lastPrevEntries.forEach((entry) => {
  console.log(`=== Step ${entry.step_index} (${entry.source} - ${entry.type}) ===`);
  if (entry.content) {
    console.log(entry.content.substring(0, 1500));
    if (entry.content.length > 1500) console.log("... [TRUNCATED in print script]");
  } else if (entry.tool_calls) {
    console.log("Tool Calls:", JSON.stringify(entry.tool_calls, null, 2));
  } else if (entry.tool_response) {
    console.log("Tool Response:", JSON.stringify(entry.tool_response, null, 2).substring(0, 1000));
  } else {
    console.log("Keys:", Object.keys(entry));
  }
  console.log("\n------------------------------------------------\n");
});
