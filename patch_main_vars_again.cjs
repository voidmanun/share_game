const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

const elems = `const changelogBtn = document.getElementById('changelog-btn') as HTMLButtonElement;
const changelogModal = document.getElementById('changelog-modal') as HTMLElement;
const changelogList = document.getElementById('changelog-list') as HTMLElement;
const closeChangelogBtn = document.getElementById('close-changelog-btn') as HTMLButtonElement;
const changelogTitle = document.getElementById('changelog-title') as HTMLElement;
`;

code = code.replace("const leaderboardBtn = document.getElementById('leaderboard-btn');", elems + "\nconst leaderboardBtn = document.getElementById('leaderboard-btn');");

fs.writeFileSync('src/main.ts', code);
console.log('src/main.ts variables patched again');
