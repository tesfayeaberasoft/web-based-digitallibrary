
const fs = require('fs');
const content = fs.readFileSync('C:/Users/tesfa/Desktop/Web development/digitalliberary/web-based-digitallibrary/frontend/src/pages/admin/SuperAdminDashboard.js', 'utf8');

const lines = content.split('\n');
let balance = 0;
lines.forEach((line, index) => {
  const opens = (line.match(/<Grid/g) || []).length;
  const closes = (line.match(/<\/Grid>/g) || []).length;
  if (opens !== closes) {
    balance += (opens - closes);
    console.log(`Line ${index + 1}: balance ${balance} (${opens} opens, ${closes} closes) - ${line.trim()}`);
  }
});
console.log(`Final balance: ${balance}`);
