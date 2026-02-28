export class SoundManager {
    private audioCtx: AudioContext;

    constructor() {
        // Initialize AudioContext
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContext();
    }

    public playShootSound(): void {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        // Sound parameters: Triangle wave for "pew"
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, this.audioCtx.currentTime); // Start frequency
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.2); // Drop pitch

        // Volume enevelope
        gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.2);
    }

    public playLaserSound(): void {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        // Sound parameters: Sawtooth for "buzz"
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, this.audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(200, this.audioCtx.currentTime + 0.1);

        // Volume
        gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.3);
    }

    public playPlayerHitSound(): void {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        // Sound parameters: Low square wave for impact
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.1);

        // Volume
        gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.1);
    }

    public playExplosionSound(): void {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        // Sound parameters: Low saw wave for boom
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, this.audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(10, this.audioCtx.currentTime + 0.3);

        // Volume
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.3);
    }

    public playPickupSound(): void {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        // Sound parameters: High sine wave for "ding"
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1800, this.audioCtx.currentTime + 0.1);

        // Volume
        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.1);
    }

    public playStartSound(): void {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        // Fun starting sound: arpeggio up
        oscillator.type = 'sine';
        
        const now = this.audioCtx.currentTime;
        oscillator.frequency.setValueAtTime(220, now);
        oscillator.frequency.setValueAtTime(330, now + 0.1);
        oscillator.frequency.setValueAtTime(440, now + 0.2);
        oscillator.frequency.setValueAtTime(554, now + 0.3);
        oscillator.frequency.setValueAtTime(659, now + 0.4);

        // Volume
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now + 0.4);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.8);

        oscillator.start(now);
        oscillator.stop(now + 0.8);
    }
}
