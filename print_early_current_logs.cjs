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

console.log("Total entries in log:", parsedLines.length);

const earlyEntries = parsedLines.slice(0, 15);
earlyEntries.forEach((entry) => {
  console.log(`=== Step ${entry.step_index} (${entry.source} - ${entry.type}) ===`);
  if (entry.content) {
    console.log(entry.content.substring(0, 2000));
    if (entry.content.length > 2000) console.log("... [TRUNCATED in print script]");
  } else if (entry.tool_calls) {
    console.log("Tool Calls:", JSON.stringify(entry.tool_calls, null, 2));
  } else {
    console.log("Keys:", Object.keys(entry));
  }
  console.log("\n------------------------------------------------\n");
});
