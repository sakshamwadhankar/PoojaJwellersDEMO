const fs = require('fs');
const logPath = "C:\\Users\\saksham\\.gemini\\antigravity\\brain\\2fc15250-7d41-4efd-806e-b1b19e9ba571\\.system_generated\\logs\\overview.txt";

if (!fs.existsSync(logPath)) {
  console.log("Log path does not exist:", logPath);
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (!line.trim()) return;
  try {
    const data = JSON.parse(line);
    const text = data.content || JSON.stringify(data);
    if (text.toLowerCase().includes("option")) {
      console.log(`Line ${index + 1} (Step ${data.step_index}, Source ${data.source}):`);
      // Print context of match
      const occurrences = [];
      let idx = text.toLowerCase().indexOf("option");
      while (idx !== -1) {
        occurrences.push(text.substring(Math.max(0, idx - 50), Math.min(text.length, idx + 100)));
        idx = text.toLowerCase().indexOf("option", idx + 1);
      }
      occurrences.forEach(o => console.log(`  ...${o.trim()}...`));
    }
  } catch (e) {}
});
