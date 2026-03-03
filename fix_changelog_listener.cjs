const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

// The block to extract
const startIdx = code.indexOf('function timeAgo(');
const endIdx = code.indexOf('if (leaderboardBtn) {');

if (startIdx !== -1 && endIdx !== -1) {
  const blockToMove = code.substring(startIdx, endIdx);
  
  // Remove it from its current position
  code = code.substring(0, startIdx) + code.substring(endIdx);
  
  // Insert it after mobileShopBtn is declared
  const insertTarget = "const mobileShopBtn = document.getElementById('mobile-shop-btn'); // the shop btn in settings\n";
  const insertIdx = code.indexOf(insertTarget);
  
  if (insertIdx !== -1) {
    code = code.substring(0, insertIdx + insertTarget.length) + '\n' + blockToMove + '\n' + code.substring(insertIdx + insertTarget.length);
    fs.writeFileSync('src/main.ts', code);
    console.log('Fixed listener position');
  } else {
    console.log('Could not find insertion point');
  }
} else {
  console.log('Could not find block');
}
