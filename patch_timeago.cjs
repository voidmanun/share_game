const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

const oldTimeAgo = `function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return '刚刚';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return \\\`\\\${\\minutes}分钟前\\\`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return \\\`\\\${\\hours}小时前\\\`;
  const days = Math.floor(hours / 24);
  if (days < 30) return \\\`\\\${\\days}天前\\\`;
  const months = Math.floor(days / 30);
  if (months < 12) return \\\`\\\${\\months}个月前\\\`;
  const years = Math.floor(days / 365);
  return \\\`\\\${\\years}年前\\\`;
}`;

const newTimeAgo = `function timeAgo(dateString: string, lang: string = 'zh'): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return lang === 'zh' ? '刚刚' : 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return lang === 'zh' ? \`\${minutes}分钟前\` : \`\${minutes} mins ago\`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return lang === 'zh' ? \`\${hours}小时前\` : \`\${hours} hrs ago\`;
  const days = Math.floor(hours / 24);
  if (days < 30) return lang === 'zh' ? \`\${days}天前\` : \`\${days} days ago\`;
  const months = Math.floor(days / 30);
  if (months < 12) return lang === 'zh' ? \`\${months}个月前\` : \`\${months} mos ago\`;
  const years = Math.floor(days / 365);
  return lang === 'zh' ? \`\${years}年前\` : \`\${years} yrs ago\`;
}`;

// need a regex to match the timeAgo function and replace it
code = code.replace(/function timeAgo\([\s\S]*?return.*\n\}/, newTimeAgo);
code = code.replace('timeAgo(log.time)', 'timeAgo(log.time, getLanguage())');

fs.writeFileSync('src/main.ts', code);
console.log('src/main.ts timeago patched');
