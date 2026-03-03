const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

if (!indexHtml.includes('manifest.json')) {
    indexHtml = indexHtml.replace(
        '</head>',
        '  <link rel="manifest" href="/manifest.json" />\n  <meta name="theme-color" content="#8ced73">\n</head>'
    );
}

if (!indexHtml.includes('id="install-btn"')) {
    indexHtml = indexHtml.replace(
        '<div style="margin-bottom: 8px; pointer-events: auto;">',
        '<div style="margin-bottom: 8px; pointer-events: auto; display: flex; gap: 8px;">'
    );
    indexHtml = indexHtml.replace(
        '</button>\n          </div>',
        `</button>\n            <button id="install-btn" style="padding: 8px 16px; font-size: 18px; display: none; align-items: center; gap: 6px; border-radius: 8px; background: rgba(0,0,0,0.6); color: white; border: 2px solid #fff; font-family: 'Fredoka One', cursive; cursor: pointer;">\n              ⬇️ <span id="install-text">保存桌面</span>\n            </button>\n          </div>`
    );
}

fs.writeFileSync('index.html', indexHtml);
console.log('index.html patched with PWA button.');
