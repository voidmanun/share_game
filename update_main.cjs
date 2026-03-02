const fs = require('fs');
let code = fs.readFileSync('src/main.ts', 'utf8');

const settingsLogic = `
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const mobileShopBtn = document.getElementById('mobile-shop-btn'); // the shop btn in settings

  settingsBtn?.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.remove('hidden');
    game.pause();
  });

  closeSettingsBtn?.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.add('hidden');
    game.resume();
  });

  // When clicking shop from settings, close settings so it doesn't overlap
  mobileShopBtn?.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.add('hidden');
    // The shop toggle logic handles pausing/resuming
  });

  // Similarly for leaderboard and encyclopedia, they might not pause/resume cleanly if settings isn't closed
  // But they are just modals that don't resume game by themselves currently. Wait, leaderboard btn doesn't pause game today?
  // Let's modify leaderboard and encyclopedia to just hide settings modal when opened.
  leaderboardBtn?.addEventListener('click', async (e) => {
    if (settingsModal) settingsModal.classList.add('hidden');
`;

code = code.replace("leaderboardBtn?.addEventListener('click', async (e) => {", settingsLogic);

// Wait, what about encyclopedia?
code = code.replace("encyclopediaBtn?.addEventListener('click', (e) => {", 
  "encyclopediaBtn?.addEventListener('click', (e) => {\n    if (settingsModal) settingsModal.classList.add('hidden');");

// What about close Leaderboard? It should probably resume game if it was opened from Settings. 
// Actually, earlier leaderboard didn't pause the game at all. We should make it pause/resume.
// Or we can just let Settings be the only thing that pauses, and when we close leaderboard, we resume.
// Let's just hook resume onto close Leaderboard and close Encyclopedia.
code = code.replace("closeLeaderboardBtn?.addEventListener('click', () => {", 
  "closeLeaderboardBtn?.addEventListener('click', () => {\n    game.resume();");

code = code.replace("closeEncyclopediaBtn?.addEventListener('click', () => {", 
  "closeEncyclopediaBtn?.addEventListener('click', () => {\n    game.resume();");


fs.writeFileSync('src/main.ts', code);
console.log('Updated main.ts');
