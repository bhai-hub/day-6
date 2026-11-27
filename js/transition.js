window.OrbitalTurntable = class OrbitalTurntable {
  constructor({ stageEl, trackEl, slotA, slotB, rimGlowEl, onSwitchStart, onSwitchComplete }) {
    this.stageEl = stageEl;
    this.trackEl = trackEl;
    this.slots = [slotA, slotB];
    this.activeSlotIdx = 0;
    this.rimGlowEl = rimGlowEl;
    this.onSwitchStart = onSwitchStart || (() => {});
    this.onSwitchComplete = onSwitchComplete || (() => {});

    this.items = [];
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.rafId = null;
    this.idleStart = performance.now();

    // Drag / tap gesture tracking
    this.pointer = {
      active: false,
      id: null,
      startX: 0,
      startY: 0,
      downTime: 0,
      dx: 0,
      dy: 0,
      dragOffset: { x: 0, y: 0, scale: 1, rotZ: 0 },
    };

    this._bindEvents();
  }

  setProducts(items, initialIndex = 0) {
    this.items = items;
    this.snapTo(initialIndex);
  }

  getActiveSlot() {
    return this.slots[this.activeSlotIdx];
  }

  getIdleSlot() {
    return this.slots[1 - this.activeSlotIdx];
  }

  snapTo(index) {
    this._cancelAnimation();
    this.isTransitioning = false;
    this.currentIndex = this._wrapIndex(index);

    const product = this.items[this.currentIndex];
    const active = this.getActiveSlot();
    const idle = this.getIdleSlot();

    this._setSlotImage(active, product);
    this._applyTransform(active, 0, 0, 1, product.setupAngle || 0, 0, 1, 1);
    active.style.zIndex = '2';

    this._applyTransform(idle, 0, 0, 0.3, 0, 0, 0, 0.15);
    idle.style.zIndex = '1';

    if (this.rimGlowEl && product.rimTint) {
      this.rimGlowEl.style.background = `radial-gradient(circle, ${product.rimTint} 0%, rgba(200, 197, 190, 0.02) 44%, rgba(0, 0, 0, 0) 74%)`;
    }

    this._startIdleLoop();
  }

  rotateBy(dir, fromDrag = null) {
    if (!this.items.length) return;
    if (this.isTransitioning) {
      // Allow responsive snappy interrupt by jumping outgoing fast before starting new turn
      this.snapTo(this.targetIndex !== undefined ? this.targetIndex : this.currentIndex);
    }

    const nextIndex = this._wrapIndex(this.currentIndex + dir);
    this.targetIndex = nextIndex;
    this.currentIndex = nextIndex;

    const incomingProduct = this.items[nextIndex];
    const outgoingEl = this.getActiveSlot();
    const incomingEl = this.getIdleSlot();

    this._setSlotImage(incomingEl, incomingProduct);
    outgoingEl.style.zIndex = '2';
    incomingEl.style.zIndex = '3';

    this.isTransitioning = true;
    this._stopIdleLoop();
    this.onSwitchStart(nextIndex, incomingProduct, dir);

    const stageRect = this.stageEl.getBoundingClientRect();
    const distX = Math.max(220, Math.min(stageRect.width * 0.44, 360));
    const distY = Math.max(95, Math.min(stageRect.height * 0.23, 155));

    const startState = fromDrag || {
      x: 0,
      y: 0,
      scale: 1,
      rotZ: this.items[this._wrapIndex(nextIndex - dir)]?.setupAngle || 0,
    };

    // Match reference video choreography:
    // Outgoing exits curved down-left (or down-right when reversed) over 540ms
    // Overlapping incoming sweeps up along orbital arc + precision watch-gear spin 200ms..1080ms
    const OUT_DURATION = 540;
    const IN_DELAY = 200;
    const IN_DURATION = 880;
    const TOTAL_DURATION = IN_DELAY + IN_DURATION;
    const targetAngle = incomingProduct.setupAngle || 0;

    if (this.rimGlowEl) {
      this.rimGlowEl.style.opacity = '0.35';
      this.rimGlowEl.style.transform = 'scale(0.86)';
      setTimeout(() => {
        if (!this.rimGlowEl) return;
        if (incomingProduct.rimTint) {
          this.rimGlowEl.style.background = `radial-gradient(circle, ${incomingProduct.rimTint} 0%, rgba(200, 197, 190, 0.02) 44%, rgba(0, 0, 0, 0) 74%)`;
        }
        this.rimGlowEl.style.opacity = '1';
        this.rimGlowEl.style.transform = 'scale(1)';
      }, 280);
    }

    const t0 = performance.now();

    const step = (now) => {
      const elapsed = now - t0;

      // 1. Outgoing phase
      const u = Math.min(1, elapsed / OUT_DURATION);
      const easeInQ = u * u;
      const easeOutC = 1 - Math.pow(1 - u, 3);
      const pOutX = Math.pow(u, 0.88);
      const pOutY = Math.sin(u * Math.PI * 0.52);

      const outX = startState.x - dir * distX * pOutX;
      const outY = startState.y + distY * pOutY;
      const outScale = this._lerp(startState.scale, 0.32, easeOutC);
      const outRotZ = startState.rotZ - dir * 82 * easeOutC;
      const outRotY = -dir * 28 * u;
      const outOpacity = Math.max(0, 1 - easeInQ * 1.05);
      const outBright = Math.max(0.14, 1 - 0.86 * easeInQ);

      this._applyTransform(outgoingEl, outX, outY, outScale, outRotZ, outRotY, outOpacity, outBright);

      // 2. Overlapping Incoming phase
      if (elapsed < IN_DELAY) {
        this._applyTransform(incomingEl, dir * distX, distY * 1.08, 0.32, targetAngle + dir * 124, dir * 28, 0, 0.14);
      } else {
        const v = Math.min(1, (elapsed - IN_DELAY) / IN_DURATION);
        // Mechanical watch-escapement quintic deceleration
        const pIn = 1 - Math.pow(1 - v, 3.35);
        const gearSettle = 1 - Math.pow(1 - v, 3.7);

        const inX = dir * distX * (1 - pIn);
        const orbitalLift = -Math.sin(v * Math.PI) * 32 * (1 - v);
        const inY = distY * 1.08 * Math.pow(1 - pIn, 1.32) + orbitalLift;
        const inScale = this._lerp(0.32, 1.0, pIn);
        const inRotZ = targetAngle + dir * 124 * (1 - gearSettle);
        const inRotY = dir * 28 * (1 - pIn);

        const inOpacity = Math.min(1, Math.pow(v * 1.45, 0.85));
        const inBright = Math.min(1.04, 0.15 + 0.9 * (1 - Math.pow(1 - v, 2.2)));

        this._applyTransform(incomingEl, inX, inY, inScale, inRotZ, inRotY, inOpacity, inBright);
      }

      if (elapsed < TOTAL_DURATION) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this._applyTransform(outgoingEl, 0, 0, 0.3, 0, 0, 0, 0.15);
        outgoingEl.style.zIndex = '1';
        this._applyTransform(incomingEl, 0, 0, 1, targetAngle, 0, 1, 1);
        incomingEl.style.zIndex = '2';

        this.activeSlotIdx = 1 - this.activeSlotIdx;
        this.isTransitioning = false;
        this._startIdleLoop();
        this.onSwitchComplete(nextIndex, incomingProduct);
      }
    };

    this.rafId = requestAnimationFrame(step);
  }

  _startIdleLoop() {
    this._stopIdleLoop();
    this.idleStart = performance.now();

    const tick = (now) => {
      if (this.isTransitioning || this.pointer.active) return;
      const product = this.items[this.currentIndex];
      if (!product) return;

      const t = (now - this.idleStart) * 0.001;
      const baseAngle = product.setupAngle || 0;
      const driftAngle = baseAngle + Math.sin(t * 1.05) * 2.4;
      const driftY = Math.sin(t * 1.45) * 4.5;
      const driftScale = 1 + Math.sin(t * 1.2) * 0.011;

      const active = this.getActiveSlot();
      this._applyTransform(active, 0, driftY, driftScale, driftAngle, Math.sin(t * 0.8) * 3, 1, 1);
      this.idleRafId = requestAnimationFrame(tick);
    };

    this.idleRafId = requestAnimationFrame(tick);
  }

  _stopIdleLoop() {
    if (this.idleRafId) {
      cancelAnimationFrame(this.idleRafId);
      this.idleRafId = null;
    }
  }

  _cancelAnimation() {
    this._stopIdleLoop();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _bindEvents() {
    this.stageEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      this.pointer.active = true;
      this.pointer.id = e.pointerId;
      this.pointer.startX = e.clientX;
      this.pointer.startY = e.clientY;
      this.pointer.downTime = performance.now();
      this.pointer.dx = 0;
      this.pointer.dy = 0;
      this.stageEl.setPointerCapture(e.pointerId);
      this._stopIdleLoop();
    });

    this.stageEl.addEventListener('pointermove', (e) => {
      if (!this.pointer.active || e.pointerId !== this.pointer.id || this.isTransitioning) return;
      const dx = e.clientX - this.pointer.startX;
      this.pointer.dx = dx;

      const active = this.getActiveSlot();
      const baseAngle = this.items[this.currentIndex]?.setupAngle || 0;
      const dragX = Math.max(-180, Math.min(180, dx * 0.48));
      const dragY = Math.min(54, Math.abs(dx) * 0.14);
      const dragScale = Math.max(0.76, 1 - Math.abs(dx) * 0.001);
      const dragRot = baseAngle + dx * 0.14;

      this.pointer.dragOffset = { x: dragX, y: dragY, scale: dragScale, rotZ: dragRot };
      this._applyTransform(active, dragX, dragY, dragScale, dragRot, -dx * 0.05, 1, Math.max(0.7, 1 - Math.abs(dx) * 0.001));
    });

    const handleRelease = (e) => {
      if (!this.pointer.active || e.pointerId !== this.pointer.id) return;
      this.pointer.active = false;
      const dx = e.clientX - this.pointer.startX;
      const elapsed = performance.now() - this.pointer.downTime;

      if (this.stageEl.hasPointerCapture(e.pointerId)) {
        this.stageEl.releasePointerCapture(e.pointerId);
      }

      // Click / Tap -> Next specimen cleanly
      if (Math.abs(dx) < 12 && elapsed < 360) {
        this.rotateBy(1);
        return;
      }

      // Right-to-left swipe -> Next; Left-to-right swipe -> Previous
      if (dx <= -38) {
        this.rotateBy(1, { ...this.pointer.dragOffset });
      } else if (dx >= 38) {
        this.rotateBy(-1, { ...this.pointer.dragOffset });
      } else {
        // Gentle spring return to center if below threshold
        this._springReset();
      }
    };

    this.stageEl.addEventListener('pointerup', handleRelease);
    this.stageEl.addEventListener('pointercancel', handleRelease);

    this.stageEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.rotateBy(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.rotateBy(-1);
      }
    });
  }

  _springReset() {
    if (this.isTransitioning) return;
    const active = this.getActiveSlot();
    const start = { ...this.pointer.dragOffset };
    const targetAngle = this.items[this.currentIndex]?.setupAngle || 0;
    const t0 = performance.now();
    const dur = 260;

    const tick = (now) => {
      const u = Math.min(1, (now - t0) / dur);
      const p = 1 - Math.pow(1 - u, 3);
      this._applyTransform(
        active,
        this._lerp(start.x, 0, p),
        this._lerp(start.y, 0, p),
        this._lerp(start.scale, 1, p),
        this._lerp(start.rotZ, targetAngle, p),
        0,
        1,
        1
      );
      if (u < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this._startIdleLoop();
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  _setSlotImage(slotEl, product) {
    const img = slotEl.querySelector('img');
    if (img) {
      img.src = product.plateImg;
      img.alt = `${product.title} studio profile`;
    }
  }

  _applyTransform(el, x, y, scale, rotZ, rotY, opacity, brightness) {
    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotateZ(${rotZ.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    el.style.opacity = opacity.toFixed(3);
    el.style.filter = `brightness(${brightness.toFixed(3)})`;
  }

  _wrapIndex(i) {
    const len = this.items.length;
    return ((i % len) + len) % len;
  }

  _lerp(a, b, t) {
    return a + (b - a) * t;
  }
};
