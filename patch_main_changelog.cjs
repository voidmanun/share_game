const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

const elems = `const changelogBtn = document.getElementById('changelog-btn') as HTMLButtonElement;
const changelogModal = document.getElementById('changelog-modal') as HTMLElement;
const changelogList = document.getElementById('changelog-list') as HTMLElement;
const closeChangelogBtn = document.getElementById('close-changelog-btn') as HTMLButtonElement;
const changelogTitle = document.getElementById('changelog-title') as HTMLElement;
`;

code = code.replace("const leaderboardBtn = document.getElementById('leaderboard-btn') as HTMLButtonElement;", elems + "const leaderboardBtn = document.getElementById('leaderboard-btn') as HTMLButtonElement;");

const logic = `
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return '刚刚';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return \`\${minutes}分钟前\`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return \`\${hours}小时前\`;
  const days = Math.floor(hours / 24);
  if (days < 30) return \`\${days}天前\`;
  const months = Math.floor(days / 30);
  if (months < 12) return \`\${months}个月前\`;
  const years = Math.floor(days / 365);
  return \`\${years}年前\`;
}

if (changelogBtn) {
  changelogBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/changelog');
      const data = await res.json();
      changelogList.innerHTML = '';
      if (data && data.length > 0) {
        data.forEach((log: any) => {
          const div = document.createElement('div');
          div.style.padding = '8px';
          div.style.background = 'rgba(255, 255, 255, 0.1)';
          div.style.borderRadius = '6px';
          div.style.borderLeft = '4px solid #ffcc00';
          
          const timeSpan = document.createElement('div');
          timeSpan.style.fontSize = '12px';
          timeSpan.style.color = '#ccc';
          timeSpan.style.marginBottom = '4px';
          timeSpan.textContent = timeAgo(log.time);
          
          const msgSpan = document.createElement('div');
          msgSpan.style.fontSize = '14px';
          msgSpan.style.color = '#fff';
          msgSpan.textContent = log.msg;
          
          div.appendChild(timeSpan);
          div.appendChild(msgSpan);
          changelogList.appendChild(div);
        });
      } else {
        changelogList.innerHTML = '<div style="text-align: center; color: #ccc;">暂无中文版本记录</div>';
      }
      settingsModal.classList.add('hidden');
      changelogModal.classList.remove('hidden');
    } catch (e) {
      console.error('Failed to load changelog', e);
    }
  });
}

if (closeChangelogBtn) {
  closeChangelogBtn.addEventListener('click', () => {
    changelogModal.classList.add('hidden');
    settingsModal.classList.remove('hidden');
  });
}
`;

code = code.replace("if (leaderboardBtn) {", logic + "\nif (leaderboardBtn) {");

fs.writeFileSync('src/main.ts', code);
console.log('src/main.ts patched');
