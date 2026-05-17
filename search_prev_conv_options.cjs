const fs = require('fs');
const path = require('path');

const brainDir = "C:\\Users\\saksham\\.gemini\\antigravity\\brain";
const conversations = fs.readdirSync(brainDir);

const results = [];

conversations.forEach((convId) => {
  if (convId === "2fc15250-7d41-4efd-806e-b1b19e9ba571") return; // Skip current
  
  const logPath = path.join(brainDir, convId, '.system_generated', 'logs', 'overview.txt');
  if (!fs.existsSync(logPath)) return;

  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (!line.trim()) return;
    try {
      const data = JSON.parse(line);
      if (data.content && (data.content.includes("Option 1") || data.content.includes("option 1") || data.content.includes("Option A") || data.content.includes("option A"))) {
        results.push({
          convId,
          step_index: data.step_index,
          source: data.source,
          content: data.content.substring(0, 1000)
        });
      }
    } catch (e) {}
  });
});

console.log(`Found ${results.length} matches in other conversations:`);
results.forEach((r, idx) => {
  console.log(`\nMatch ${idx + 1}: Conv ${r.convId}, Step ${r.step_index}, Source ${r.source}`);
  console.log(r.content);
  console.log("-----------------------------------------------------------------");
});
