const fs = require('fs');

const enemyPath = 'src/entities/Enemy.ts';
let enemyCode = fs.readFileSync(enemyPath, 'utf8');

// Add poison dot state
if (!enemyCode.includes('public poisonTimer: number = 0;')) {
    enemyCode = enemyCode.replace('public antiHealTimer: number = 0;', 'public antiHealTimer: number = 0;\n    public poisonTimer: number = 0;\n    public poisonDamage: number = 0;\n    public poisonTickTimer: number = 0;');
}

// Update poison dot in update
if (!enemyCode.includes('if (this.poisonTimer > 0) {')) {
    enemyCode = enemyCode.replace('if (this.antiHealTimer > 0) {', `if (this.poisonTimer > 0) {
            this.poisonTimer -= deltaTime;
            this.poisonTickTimer -= deltaTime;
            if (this.poisonTickTimer <= 0) {
                this.takeDamage(this.poisonDamage);
                this.poisonTickTimer = 1.0; // 1 tick per second
            }
        }

        if (this.antiHealTimer > 0) {`);
}

// Render poison dot effect
if (!enemyCode.includes('// Draw poison effect')) {
    enemyCode = enemyCode.replace('// Draw anti-heal icon', `// Draw poison effect
        if (this.poisonTimer > 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)'; // Green border indicating poison
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Bubbles
            ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(10, -10, 3, 0, Math.PI * 2);
            ctx.arc(-5, -15, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw anti-heal icon`);
}

fs.writeFileSync(enemyPath, enemyCode);

const poisonGunPath = 'src/weapons/PoisonGun.ts';
let pgCode = fs.readFileSync(poisonGunPath, 'utf8');

if (!pgCode.includes('enemy.poisonTimer = 5;')) {
    pgCode = pgCode.replace('enemy.antiHealTimer = 5; // Apply anti-heal effect for 5 seconds', 
`enemy.antiHealTimer = 5; // Apply anti-heal effect for 5 seconds
        enemy.poisonTimer = 5;
        enemy.poisonDamage = this.damage * 0.5; // DoT damage
        enemy.poisonTickTimer = 1;`);
}

fs.writeFileSync(poisonGunPath, pgCode);

console.log("Poison DoT added!");
