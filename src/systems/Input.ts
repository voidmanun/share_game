export class Input {
    private keys: Set<string> = new Set();

    // Joystick state
    private joystickAxis = { x: 0, y: 0 };
    private joystickZone: HTMLElement | null;
    private joystickKnob: HTMLElement | null;
    private touchId: number | null = null;
    private joystickCenter = { x: 0, y: 0 };
    private maxRadius = 40;

    constructor() {
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        // Touch events for joystick
        this.joystickZone = document.getElementById('joystick-zone');
        this.joystickKnob = document.getElementById('joystick-knob');

        if (this.joystickZone) {
            this.joystickZone.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            this.joystickZone.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            window.addEventListener('touchend', this.handleTouchEnd.bind(this));
            window.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
        }
    }

    private handleTouchStart(e: TouchEvent) {
        e.preventDefault();
        if (this.touchId !== null) return;

        const touch = e.changedTouches[0];
        this.touchId = touch.identifier;

        const rect = this.joystickZone!.getBoundingClientRect();
        this.joystickCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };

        this.updateJoystick(touch.clientX, touch.clientY);
    }

    private handleTouchMove(e: TouchEvent) {
        e.preventDefault();
        if (this.touchId === null) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.touchId) {
                this.updateJoystick(touch.clientX, touch.clientY);
                break;
            }
        }
    }

    private handleTouchEnd(e: TouchEvent) {
        if (this.touchId === null) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchId) {
                this.touchId = null;
                this.joystickAxis = { x: 0, y: 0 };
                if (this.joystickKnob) {
                    this.joystickKnob.style.transform = `translate(0px, 0px)`;
                }
                break;
            }
        }
    }

    private updateJoystick(clientX: number, clientY: number) {
        let dx = clientX - this.joystickCenter.x;
        let dy = clientY - this.joystickCenter.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        // let normalizedDistance = distance; // keeping it just in case although it's unused
        if (distance > this.maxRadius) {
            dx = (dx / distance) * this.maxRadius;
            dy = (dy / distance) * this.maxRadius;
            // normalizedDistance = this.maxRadius;
        }

        if (this.joystickKnob) {
            this.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
        }

        this.joystickAxis = {
            x: dx / this.maxRadius,
            y: dy / this.maxRadius
        };
    }

    public isDown(code: string): boolean {
        return this.keys.has(code);
    }

    public getAxis(): { x: number; y: number } {
        let x = this.joystickAxis.x;
        let y = this.joystickAxis.y;

        if (this.isDown('ArrowUp') || this.isDown('KeyW')) y -= 1;
        if (this.isDown('ArrowDown') || this.isDown('KeyS')) y += 1;
        if (this.isDown('ArrowLeft') || this.isDown('KeyA')) x -= 1;
        if (this.isDown('ArrowRight') || this.isDown('KeyD')) x += 1;

        if (x !== 0 || y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            if (length > 1) {
                x /= length;
                y /= length;
            }
        }

        return { x, y };
    }
}
