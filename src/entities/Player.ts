import { Entity } from './Entity';
import { Input } from '../systems/Input';
import { Weapon } from '../weapons/Weapon';

export class Player extends Entity {
  private input: Input;
  private speed: number = 200; // pixels per second
  private weapons: Weapon[] = [];
  public hp: number = 20;

  constructor(x: number, y: number, input: Input) {
    super(x, y, 15, '#4CAF50'); // Green circle
    this.input = input;
  }

  public takeDamage(amount: number): void {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.isDead = true;
    }
  }

  public addWeapon(weapon: Weapon): void {
    this.weapons.push(weapon);
  }

  public upgradeSpeed(): void {
    this.speed += 20;
  }

  public upgradeDamage(): void {
    // This requires Weapon to have setDamage or modify damage
    // For now we assume we can access it or re-implement
    // Ideally Weapon has a modifier
  }

  public update(deltaTime: number): void {
    const { x, y } = this.input.getAxis();
    this.x += x * this.speed * deltaTime;
    this.y += y * this.speed * deltaTime;

    this.weapons.forEach(w => w.update(deltaTime));
  }
}
