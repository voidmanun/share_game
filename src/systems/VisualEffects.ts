/**
 * Visual Effects System - 视觉效果增强系统
 * 提供发光、阴影、粒子等高级视觉效果
 */

export interface GlowConfig {
  color: string;
  blur: number;
  intensity: number;
}

export interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface GradientConfig {
  type: 'radial' | 'linear';
  colors: { offset: number; color: string }[];
  angle?: number; // for linear gradients
}

export class VisualEffects {
  /**
   * 应用发光效果到路径
   */
  public static applyGlow(
    ctx: CanvasRenderingContext2D,
    config: GlowConfig
  ): void {
    ctx.shadowBlur = config.blur;
    ctx.shadowColor = config.color;
  }

  /**
   * 清除发光效果
   */
  public static clearGlow(ctx: CanvasRenderingContext2D): void {
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  /**
   * 应用阴影效果
   */
  public static applyShadow(
    ctx: CanvasRenderingContext2D,
    config: ShadowConfig
  ): void {
    ctx.shadowOffsetX = config.offsetX;
    ctx.shadowOffsetY = config.offsetY;
    ctx.shadowBlur = config.blur;
    ctx.shadowColor = config.color;
  }

  /**
   * 清除阴影效果
   */
  public static clearShadow(ctx: CanvasRenderingContext2D): void {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  /**
   * 创建渐变填充
   */
  public static createGradient(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    config: GradientConfig
  ): CanvasGradient {
    let gradient: CanvasGradient;

    if (config.type === 'radial') {
      gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    } else {
      const angle = config.angle || 0;
      const x1 = x - Math.cos(angle) * radius;
      const y1 = y - Math.sin(angle) * radius;
      const x2 = x + Math.cos(angle) * radius;
      const y2 = y + Math.sin(angle) * radius;
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    }

    config.colors.forEach(({ offset, color }) => {
      gradient.addColorStop(offset, color);
    });

    return gradient;
  }

  /**
   * 绘制发光圆形
   */
  public static drawGlowingCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    fillColor: string,
    glowColor: string,
    glowIntensity: number = 15
  ): void {
    ctx.save();

    // 外层发光
    this.applyGlow(ctx, { color: glowColor, blur: glowIntensity, intensity: 1 });
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.restore();
  }

  /**
   * 绘制带内阴影的形状
   */
  public static drawShapeWithShadow(
    ctx: CanvasRenderingContext2D,
    drawFn: () => void,
    shadowConfig: ShadowConfig
  ): void {
    ctx.save();
    this.applyShadow(ctx, shadowConfig);
    drawFn();
    ctx.restore();
  }

  /**
   * 绘制脉冲光环效果
   */
  public static drawPulsingRing(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    baseRadius: number,
    color: string,
    time: number,
    pulseSpeed: number = 2,
    maxExpand: number = 20
  ): void {
    const pulse = Math.sin(time * pulseSpeed) * 0.5 + 0.5;
    const radius = baseRadius + pulse * maxExpand;
    const alpha = 1 - pulse * 0.7;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    ctx.lineWidth = 3 + pulse * 2;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 绘制能量场效果
   */
  public static drawEnergyField(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    time: number,
    layers: number = 3
  ): void {
    ctx.save();

    for (let i = 0; i < layers; i++) {
      const layerRadius = radius * (1 - i * 0.15);
      const rotation = time * (1 + i * 0.5);
      const alpha = 0.3 - i * 0.08;

      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const wobble = Math.sin(angle * 3 + rotation) * 3;
        const px = x + Math.cos(angle) * (layerRadius + wobble);
        const py = y + Math.sin(angle) * (layerRadius + wobble);

        if (angle === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
      gradient.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
      gradient.addColorStop(1, color.replace(')', `, 0)`).replace('rgb', 'rgba'));
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * 绘制闪电效果
   */
  public static drawLightning(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    branches: number = 2,
    seed: number = 0
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.lineCap = 'round';

    const drawBranch = (sx: number, sy: number, ex: number, ey: number, depth: number) => {
      if (depth > 3) return;

      const segments = 5 + Math.floor(Math.random() * 3);
      const points: { x: number; y: number }[] = [{ x: sx, y: sy }];

      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const baseX = sx + (ex - sx) * t;
        const baseY = sy + (ey - sy) * t;
        const offset = (Math.random() - 0.5) * 30 * (1 - t);
        points.push({
          x: baseX + offset * (ey - sy) / Math.hypot(ex - sx, ey - sy),
          y: baseY - offset * (ex - sx) / Math.hypot(ex - sx, ey - sy)
        });
      }
      points.push({ x: ex, y: ey });

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // 分支
      if (depth < 2 && Math.random() < 0.4) {
        const branchIdx = Math.floor(Math.random() * (points.length - 2)) + 1;
        const branchPoint = points[branchIdx];
        const angle = Math.atan2(ey - sy, ex - sx) + (Math.random() - 0.5) * Math.PI * 0.5;
        const branchLen = Math.hypot(ex - sx, ey - sy) * 0.4;
        drawBranch(
          branchPoint.x,
          branchPoint.y,
          branchPoint.x + Math.cos(angle) * branchLen,
          branchPoint.y + Math.sin(angle) * branchLen,
          depth + 1
        );
      }
    };

    // 随机种子
    const oldRandom = Math.random;
    let seedVal = seed;
    Math.random = () => {
      seedVal = (seedVal * 9301 + 49297) % 233280;
      return seedVal / 233280;
    };

    for (let i = 0; i < branches; i++) {
      drawBranch(x1, y1, x2, y2, 0);
    }

    Math.random = oldRandom;
    ctx.restore();
  }

  /**
   * 绘制扫描线效果
   */
  public static drawScanLines(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    spacing: number = 4
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;

    for (let ly = y; ly < y + height; ly += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(x + width, ly);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 绘制噪点/颗粒效果
   */
  public static drawNoise(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    density: number = 0.02,
    color: string = '#000000'
  ): void {
    ctx.save();
    ctx.fillStyle = color;

    for (let px = x; px < x + width; px += 2) {
      for (let py = y; py < y + height; py += 2) {
        if (Math.random() < density) {
          ctx.globalAlpha = Math.random() * 0.3;
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }

    ctx.restore();
  }

  /**
   * 绘制动态网格背景
   */
  public static drawDynamicGrid(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    viewWidth: number,
    viewHeight: number,
    gridSize: number,
    time: number,
    color: string
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;

    const offsetX = camX % gridSize;
    const offsetY = camY % gridSize;

    // 垂直线
    for (let x = -offsetX; x < viewWidth + gridSize; x += gridSize) {
      const wave = Math.sin((x + camX) * 0.01 + time) * 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + wave, viewHeight);
      ctx.stroke();
    }

    // 水平线
    for (let y = -offsetY; y < viewHeight + gridSize; y += gridSize) {
      const wave = Math.sin((y + camY) * 0.01 + time) * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(viewWidth, y + wave);
      ctx.stroke();
    }

    ctx.restore();
  }
}

/**
 * 预定义的颜色方案
 */
export const ColorSchemes = {
  // 玩家颜色
  knight: {
    primary: '#4169E1',
    secondary: '#1E3A8A',
    glow: '#00BFFF',
    accent: '#FFD700'
  },
  warrior: {
    primary: '#DC143C',
    secondary: '#8B0000',
    glow: '#FF4500',
    accent: '#FF6347'
  },
  mage: {
    primary: '#9932CC',
    secondary: '#4B0082',
    glow: '#DA70D6',
    accent: '#FFD700'
  },
  hunter: {
    primary: '#2E8B57',
    secondary: '#006400',
    glow: '#00FF7F',
    accent: '#FFD700'
  },

  // 敌人颜色
  enemies: {
    basic: { fill: '#39FF14', glow: '#00FF00' },
    scout: { fill: '#00FFFF', glow: '#00CED1' },
    boss: { fill: '#FF0000', glow: '#FF4500' },
    tank: { fill: '#448844', glow: '#228B22' },
    elite: { fill: '#FFD700', glow: '#FFA500' }
  },

  // 特效颜色
  effects: {
    fire: ['#FF4500', '#FF6347', '#FFA500', '#FFD700'],
    ice: ['#00BFFF', '#87CEEB', '#E0FFFF', '#FFFFFF'],
    poison: ['#00FF00', '#32CD32', '#7CFC00', '#ADFF2F'],
    electric: ['#00FFFF', '#00CED1', '#48D1CC', '#40E0D0'],
    magic: ['#9932CC', '#DA70D6', '#EE82EE', '#FF00FF']
  }
};