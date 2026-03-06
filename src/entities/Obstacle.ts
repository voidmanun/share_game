import { Entity } from './Entity';

export type ObstacleType = 'grass' | 'tree' | 'rock' | 'bush' | 'forest';

export class Obstacle extends Entity {
    private type: ObstacleType;
    private swayOffset: number;

    constructor(x: number, y: number, type: ObstacleType = 'grass') {
        const radius = Obstacle.getRadiusForType(type);
        const color = Obstacle.getColorForType(type);
        super(x, y, radius, color);
        this.type = type;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.frameCount = 1;
        this.frameInterval = 0.15;
    }

    private static getRadiusForType(type: ObstacleType): number {
        switch (type) {
            case 'forest': return 60 + Math.random() * 30; // Large forest area
            case 'tree': return 25 + Math.random() * 15;
            case 'rock': return 15 + Math.random() * 10;
            case 'bush': return 18 + Math.random() * 8;
            case 'grass':
            default: return 8 + Math.random() * 6;
        }
    }

    private static getColorForType(type: ObstacleType): string {
        switch (type) {
            case 'forest': return '#1a5c1a'; // Darker green for forest
            case 'tree': return '#228B22';
            case 'rock': return '#696969';
            case 'bush': return '#32CD32';
            case 'grass':
            default: return '#7CFC00';
        }
    }

    public update(deltaTime: number): void {
        super.update(deltaTime);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);

        const time = Date.now() / 1000;
        const sway = Math.sin(time * 2 + this.swayOffset) * 0.05;

        switch (this.type) {
            case 'forest':
                this.renderForest(ctx, sway);
                break;
            case 'tree':
                this.renderTree(ctx, sway);
                break;
            case 'rock':
                this.renderRock(ctx);
                break;
            case 'bush':
                this.renderBush(ctx, sway);
                break;
            case 'grass':
            default:
                this.renderGrass(ctx, sway);
                break;
        }

        ctx.restore();
    }

    private renderTree(ctx: CanvasRenderingContext2D, sway: number): void {
        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-this.radius * 0.2, -this.radius * 0.3, this.radius * 0.4, this.radius * 0.5);

        // Foliage layers with slight sway
        const foliageSway = sway * 0.3;
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(foliageSway, -this.radius * 0.5, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(foliageSway * 1.2, -this.radius * 0.7, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, this.radius * 0.3, this.radius * 0.6, this.radius * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderForest(ctx: CanvasRenderingContext2D, sway: number): void {
        // Draw multiple trees clustered together for forest effect
        const treeCount = 5 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < treeCount; i++) {
            const angle = (i / treeCount) * Math.PI * 2;
            const dist = this.radius * 0.4;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            
            ctx.save();
            ctx.translate(tx, ty);
            
            const treeScale = 0.6 + (i % 3) * 0.2;
            ctx.scale(treeScale, treeScale);
            
            // Trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-this.radius * 0.15, -this.radius * 0.25, this.radius * 0.3, this.radius * 0.4);
            
            // Foliage
            const foliageSway = sway * 0.3;
            ctx.fillStyle = i % 2 === 0 ? '#228B22' : '#1a5c1a';
            ctx.beginPath();
            ctx.arc(foliageSway, -this.radius * 0.4, this.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#32CD32';
            ctx.beginPath();
            ctx.arc(foliageSway * 1.1, -this.radius * 0.55, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // Ground shadow for entire forest
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, this.radius * 0.5, this.radius * 0.9, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderRock(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.8, this.radius * 0.3);
        ctx.lineTo(-this.radius * 0.5, -this.radius * 0.6);
        ctx.lineTo(this.radius * 0.3, -this.radius * 0.8);
        ctx.lineTo(this.radius * 0.9, -this.radius * 0.2);
        ctx.lineTo(this.radius * 0.7, this.radius * 0.5);
        ctx.lineTo(this.radius * 0.2, this.radius * 0.7);
        ctx.lineTo(-this.radius * 0.6, this.radius * 0.6);
        ctx.closePath();
        ctx.fill();

        // Highlights
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.2, -this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    private renderBush(ctx: CanvasRenderingContext2D, sway: number): void {
        ctx.fillStyle = '#32CD32';
        
        // Multiple circles for bush shape
        const offsets = [
            { x: 0, y: 0, r: 1 },
            { x: -0.5, y: 0.2, r: 0.7 },
            { x: 0.5, y: 0.2, r: 0.7 },
            { x: -0.3, y: -0.4, r: 0.6 },
            { x: 0.3, y: -0.4, r: 0.6 },
        ];

        offsets.forEach(offset => {
            ctx.beginPath();
            ctx.arc(
                offset.x * this.radius * (1 + sway),
                offset.y * this.radius,
                offset.r * this.radius,
                0, Math.PI * 2
            );
            ctx.fill();
        });

        // Berries
        ctx.fillStyle = '#DC143C';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI + Math.PI;
            const bx = Math.cos(angle) * this.radius * 0.5;
            const by = Math.sin(angle) * this.radius * 0.3;
            ctx.beginPath();
            ctx.arc(bx, by, this.radius * 0.1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    private renderGrass(ctx: CanvasRenderingContext2D, sway: number): void {
        ctx.fillStyle = '#7CFC00';
        
        const bladeCount = 5;
        const baseWidth = this.radius * 0.3;
        const height = this.radius * 1.5;

        for (let i = 0; i < bladeCount; i++) {
            const x = (i - (bladeCount - 1) / 2) * baseWidth;
            const lean = sway * (i - (bladeCount - 1) / 2) * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.quadraticCurveTo(x + lean, -height * 0.5, x + lean * 2, -height);
            ctx.quadraticCurveTo(x + lean * 1.5, -height * 0.7, x + baseWidth * 0.3, 0);
            ctx.closePath();
            ctx.fill();
        }

        // Darker grass in front
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * baseWidth * 0.8;
            const lean = sway * (i - 1) * 0.3;
            
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.quadraticCurveTo(x + lean, -height * 0.4, x + lean * 1.5, -height * 0.7);
            ctx.quadraticCurveTo(x + lean, -height * 0.5, x + baseWidth * 0.2, 0);
            ctx.closePath();
            ctx.fill();
        }
    }

    public getType(): ObstacleType {
        return this.type;
    }
}
