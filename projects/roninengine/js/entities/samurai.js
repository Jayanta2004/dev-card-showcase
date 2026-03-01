// ============================================================
//  RoninEngine — entities/samurai.js
//  Full samurai entity: IK skeleton, cloth robe, katana,
//  combat state machine, movement
// ============================================================

'use strict';

import { Vec2, clamp, lerp, lerpAngle, wrapAngle, randomRange } from '../core/math.js';
import { SKEL, COMBAT, CLOTH as CLOTH_CFG, GROUND_Y, ARENA_LEFT, ARENA_RIGHT }  from '../core/config.js';
import { Skeleton }     from '../engine/ik.js';
import { ClothSolver, WindField } from '../engine/cloth.js';
import { Katana }       from './katana.js';

// ─── Combat states ────────────────────────────────────────────────────────────
export const STANCE = {
  IDLE        : 'idle',
  WALK        : 'walk',
  RUN         : 'run',
  ATTACK_LIGHT: 'attackLight',
  ATTACK_HEAVY: 'attackHeavy',
  BLOCK       : 'block',
  PARRY       : 'parry',
  STAGGER     : 'stagger',
  DEATH       : 'death',
  DASH        : 'dash',
};

// ─── Samurai ──────────────────────────────────────────────────────────────────
export class Samurai {
  /**
   * @param {Vec2}   spawnPos
   * @param {number} facing   – +1 right, -1 left
   * @param {boolean} isPlayer
   */
  constructor(spawnPos, facing = 1, isPlayer = false) {
    this.spawnPos  = spawnPos.clone();
    this.facing    = facing;
    this.isPlayer  = isPlayer;

    // Position / movement
    this.pos       = spawnPos.clone();
    this.vel       = Vec2.zero();
    this.onGround  = true;
    this.moveSpeed = 160;
    this.runSpeed  = 280;
    this.dashSpeed = 480;

    // Health / combat stats
    this.health          = COMBAT.healthMax;
    this.posture         = 0;
    this.dead            = false;
    this.stance          = STANCE.IDLE;
    this.prevStance      = STANCE.IDLE;

    // Timers
    this.stanceTimer     = 0;
    this.attackTimer     = 0;
    this.attackCooldown  = 0;
    this.blockTimer      = 0;
    this.staggerTimer    = 0;
    this.dashTimer       = 0;
    this.deathTimer      = 0;
    this.postureRegenTimer = 0;

    // Locomotion
    this.walkCycle   = 0;         // 0–2PI, drives leg/arm swing
    this.walkSpeed   = 0;         // current speed magnitude

    // Build skeleton
    this.skeleton    = new Skeleton(this.pos, facing);

    // Katana (held in right hand)
    const wrist = this.skeleton.positions.rWrist || spawnPos.clone();
    this.katana  = new Katana(wrist, facing);

    // Cloth robe (rows × cols grid anchored at hip sides)
    const cx    = this.pos.x - (CLOTH_CFG.cols - 1) * CLOTH_CFG.restLength * 0.5;
    const cy    = this.pos.y - SKEL.torsoLen * 0.3;
    this.robe   = new ClothSolver(cx, cy,
      CLOTH_CFG.cols, CLOTH_CFG.rows, CLOTH_CFG.restLength);

    // Wind field (shared instance could be passed in but kept local for independence)
    this.wind    = new WindField();
    this.wind.setDirection(facing);

    // Shadow
    this.shadowY = GROUND_Y + 6;

    // Swing arc data
    this.swingArcT     = 0;
    this.swingDuration = 0.32;
    this.swingType     = 'horizontal';

    // IK targets
    this.swordArmTarget = Vec2.zero();
    this.guardArmTarget = Vec2.zero();

    // Death fall animation
    this._deathAngle = 0;
    this._deathVelY  = 0;
  }

  // ─── Public API ────────────────────────────────────────────

  /** Trigger a light attack */
  attackLight() {
    if (this.attackCooldown > 0 || this.stance === STANCE.DEATH) return false;
    this._startStance(STANCE.ATTACK_LIGHT);
    this.katana.startSwing('horizontal');
    this.swingArcT     = 0;
    this.swingDuration = 0.30;
    this.swingType     = 'horizontal';
    return true;
  }

  /** Trigger a heavy attack */
  attackHeavy() {
    if (this.attackCooldown > 0 || this.stance === STANCE.DEATH) return false;
    this._startStance(STANCE.ATTACK_HEAVY);
    this.katana.startSwing('diagonal');
    this.swingArcT     = 0;
    this.swingDuration = 0.48;
    this.swingType     = 'diagonal';
    return true;
  }

  /** Begin blocking pose */
  startBlock() {
    if (this.stance === STANCE.DEATH) return;
    this._startStance(STANCE.BLOCK);
    this.katana.setBlock(true);
    this.blockTimer = COMBAT.blockWindow;
  }

  /** Release block */
  stopBlock() {
    if (this.stance !== STANCE.BLOCK) return;
    this.katana.setBlock(false);
    this._startStance(STANCE.IDLE);
  }

  /** Horizontal dash */
  dash(dir) {
    if (this.dashTimer > 0 || this.stance === STANCE.DEATH) return;
    this._startStance(STANCE.DASH);
    this.vel.x = dir * this.dashSpeed;
    this.dashTimer = 0.22;
  }

  /** Apply stagger from impact */
  stagger(force) {
    if (this.stance === STANCE.DEATH) return;
    this._startStance(STANCE.STAGGER);
    this.staggerTimer = COMBAT.staggerDuration;
    this.vel.x += force.x * 0.5;
  }

  /** Take a hit – returns true if this kill */
  takeHit(damage, isHeavy, impactForce) {
    if (this.dead) return false;
    const isBlocking = this.stance === STANCE.BLOCK;
    const isParrying = this.blockTimer > COMBAT.blockWindow - COMBAT.parryWindow;

    if (isParrying) {
      // Perfect parry – no damage, no posture, riposte window
      return false;
    }

    if (isBlocking) {
      this.posture += isHeavy ? COMBAT.postureDmgBlock * 1.6 : COMBAT.postureDmgBlock;
    } else {
      this.health  -= damage;
      this.posture += isHeavy ? COMBAT.postureDmgHit * 1.4 : COMBAT.postureDmgHit;
      this.stagger(impactForce);
    }

    if (this.posture >= COMBAT.maxPosture) {
      this.health  -= 20;
      this.posture  = 0;
      this.stagger(impactForce.mul(2));
    }

    if (this.health <= 0) {
      this.health = 0;
      this._die();
      return true;
    }
    return false;
  }

  /** Reset for new round */
  reset() {
    this.pos.setV(this.spawnPos);
    this.vel.set(0, 0);
    this.health   = COMBAT.healthMax;
    this.posture  = 0;
    this.dead     = false;
    this.stance   = STANCE.IDLE;
    this.stanceTimer      = 0;
    this.attackCooldown   = 0;
    this.staggerTimer     = 0;
    this.dashTimer        = 0;
    this.deathTimer       = 0;
    this._deathAngle      = 0;
    this._deathVelY       = 0;
    this.katana.cancelSwing();
    this.skeleton.root.setV(this.pos);
    this.skeleton._defaultPose && this.skeleton._defaultPose();
    const cx = this.pos.x - (CLOTH_CFG.cols-1)*CLOTH_CFG.restLength*0.5;
    const cy = this.pos.y - SKEL.torsoLen * 0.3;
    this.robe.resetToOrigin(cx, cy);
  }

  // ─── Main Update ────────────────────────────────────────────

  /**
   * @param {number} dt       – scaled delta time (s)
   * @param {number} inputX   – horizontal move [-1, +1]
   * @param {boolean} running – run modifier
   */
  update(dt, inputX = 0, running = false) {
    if (dt <= 0) return;

    this._tickTimers(dt);
    this._applyMovement(dt, inputX, running);
    this._stanceLogic(dt);
    this._updateSkeleton(dt);
    this._updateKatana(dt);
    this._updateCloth(dt);
    this._updateFacing(inputX);
    this._postureRegen(dt);
  }

  // ─── Private: timers ────────────────────────────────────────
  _tickTimers(dt) {
    if (this.stanceTimer    > 0) this.stanceTimer    -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.blockTimer     > 0) this.blockTimer     -= dt;
    if (this.staggerTimer   > 0) this.staggerTimer   -= dt;
    if (this.dashTimer      > 0) this.dashTimer      -= dt;
    if (this.deathTimer     > 0) this.deathTimer     -= dt;
  }

  _postureRegen(dt) {
    if (this.stance === STANCE.IDLE && this.posture > 0) {
      this.posture = Math.max(0, this.posture - COMBAT.postureRegen * dt);
    }
  }

  // ─── Private: movement ──────────────────────────────────────
  _applyMovement(dt, inputX, running) {
    if (this.stance === STANCE.DEATH) {
      this._deathFall(dt);
      return;
    }

    const spd = running ? this.runSpeed : this.moveSpeed;
    const isDashing = this.stance === STANCE.DASH && this.dashTimer > 0;
    const canMove   = this.stance === STANCE.IDLE  ||
                      this.stance === STANCE.WALK  ||
                      this.stance === STANCE.RUN;

    if (isDashing) {
      // Dash momentum decays
      this.vel.x *= 0.88;
    } else if (canMove) {
      this.vel.x = inputX * spd;
      // Update walk-run stance
      if (Math.abs(inputX) > 0.1) {
        this._startStance(running ? STANCE.RUN : STANCE.WALK, false);
      } else if (this.stance !== STANCE.IDLE) {
        this._startStance(STANCE.IDLE, false);
      }
    } else {
      this.vel.x *= 0.75;
    }

    // Gravity
    if (!this.onGround) {
      this.vel.y += 640 * dt;
    } else {
      this.vel.y = 0;
    }

    // Integrate position
    this.pos.addSelf(this.vel.mul(dt));

    // Ground clamp
    if (this.pos.y >= GROUND_Y) {
      this.pos.y  = GROUND_Y;
      this.vel.y  = 0;
      this.onGround = true;
    }

    // Arena clamp
    this.pos.x = clamp(this.pos.x, ARENA_LEFT, ARENA_RIGHT);

    // Walk cycle
    this.walkSpeed = Math.abs(this.vel.x);
    if (this.walkSpeed > 5) {
      this.walkCycle += dt * this.walkSpeed * 0.042;
    } else {
      this.walkCycle += dt * 0.8;  // idle sway
    }
  }

  _deathFall(dt) {
    this.deathTimer        += dt;
    this._deathVelY        += 500 * dt;
    this.pos.y             += this._deathVelY * dt;
    this.pos.y              = Math.min(this.pos.y, GROUND_Y);
    this._deathAngle       += dt * 2.5;
    this._deathAngle        = clamp(this._deathAngle, 0, Math.PI * 0.5);
    this.vel.x             *= 0.88;
    this.pos.addSelf(this.vel.mul(dt));
    this.pos.x              = clamp(this.pos.x, ARENA_LEFT, ARENA_RIGHT);
  }

  // ─── Private: stance logic ─────────────────────────────────
  _stanceLogic(dt) {
    switch (this.stance) {
      case STANCE.ATTACK_LIGHT:
      case STANCE.ATTACK_HEAVY:
        this.swingArcT += dt / this.swingDuration;
        this.katana.swingProgress = this.swingArcT;
        if (this.swingArcT >= 1) {
          this.katana.cancelSwing();
          this.attackCooldown = COMBAT.attackCooldown;
          this._startStance(STANCE.IDLE);
        }
        break;
      case STANCE.STAGGER:
        if (this.staggerTimer <= 0) this._startStance(STANCE.IDLE);
        break;
      case STANCE.DASH:
        if (this.dashTimer <= 0)    this._startStance(STANCE.IDLE);
        break;
      case STANCE.BLOCK:
        if (this.blockTimer <= 0)   this.stopBlock();
        break;
    }
  }

  _startStance(s, forceful = true) {
    if (!forceful && (
      this.stance === STANCE.STAGGER ||
      this.stance === STANCE.DEATH   ||
      this.stance === STANCE.ATTACK_LIGHT ||
      this.stance === STANCE.ATTACK_HEAVY
    )) return;
    this.prevStance = this.stance;
    this.stance = s;
    this.stanceTimer = 0;
  }

  _die() {
    this.dead          = true;
    this.stance        = STANCE.DEATH;
    this.deathTimer    = 0;
    this._deathVelY    = -60;
    this.vel.x         = this.facing * -80;
    this.katana.cancelSwing();
  }

  // ─── Private: skeleton FK/IK ────────────────────────────────
  _updateSkeleton(dt) {
    this.skeleton.root.setV(this.pos);
    this.skeleton.facing = this.facing;

    const wc  = this.walkCycle;
    const spd = this.walkSpeed;
    const vel = this.vel;

    // Idle breathing / walk bob
    const bobAmp = spd > 20 ? 0.12 : 0.025;
    const walkAmp = spd > 20 ? 0.28 : 0.0;

    this.skeleton.torso.localAngle    = Math.sin(wc) * bobAmp * 0.3 - 0.04;
    this.skeleton.neck.localAngle     = Math.sin(wc * 0.5) * 0.04 + lerp(0, -0.08 * this.facing, spd/this.runSpeed);

    // Legs
    this.skeleton.lHip.localAngle    =  Math.sin(wc)    * walkAmp + 0.08;
    this.skeleton.lKnee.localAngle   = -Math.abs(Math.sin(wc)) * walkAmp * 0.65 - 0.28;
    this.skeleton.rHip.localAngle    = -Math.sin(wc)    * walkAmp - 0.08;
    this.skeleton.rKnee.localAngle   = -Math.abs(Math.cos(wc)) * walkAmp * 0.65 - 0.28;

    // Guard arm (left)
    this.skeleton.lShoulder.localAngle = lerp(-0.5, -1.0, spd / this.runSpeed) + Math.sin(wc * 2) * walkAmp * 0.4;
    this.skeleton.lElbow.localAngle    = -1.1;

    // Death pose overrides
    if (this.stance === STANCE.DEATH) {
      this.skeleton.torso.localAngle  = this._deathAngle * this.facing * -0.8;
      this.skeleton.hip.localAngle    = this._deathAngle * this.facing * -0.3;
    }

    // Stagger head shake
    if (this.stance === STANCE.STAGGER) {
      const sh = Math.sin(this.staggerTimer * 18) * 0.12;
      this.skeleton.head.localAngle = sh;
      this.skeleton.torso.localAngle = sh * 0.5 - 0.08;
    }

    // Propagate momentum from movement
    this.skeleton.propagateMomentum(dt);

    // Integrate dynamic joints
    this.skeleton.integrate(dt);

    // Forward kinematics to resolve all world positions
    this.skeleton.forwardKinematics();

    // IK for sword arm
    this._solveSwordArm(dt);
  }

  _solveSwordArm(dt) {
    const sk = this.skeleton;
    const shoulderPos = sk.positions.rShoulder;
    if (!shoulderPos) return;

    let target;

    switch (this.stance) {
      case STANCE.ATTACK_LIGHT:
      case STANCE.ATTACK_HEAVY:
        target = sk.generateSwingArc(
          shoulderPos, this.swingArcT, this.swingType, this.facing
        );
        break;
      case STANCE.BLOCK:
        // Block guard position: blade angled across body
        target = new Vec2(
          shoulderPos.x + this.facing * 35,
          shoulderPos.y - 20
        );
        break;
      case STANCE.STAGGER:
        target = new Vec2(
          shoulderPos.x - this.facing * 20,
          shoulderPos.y + 30
        );
        break;
      default: {
        // Combat-ready idle: blade held forward and upward
        const t = Math.sin(this.walkCycle * 0.5) * 0.03;
        target = new Vec2(
          shoulderPos.x + this.facing * (SKEL.upperArmLen + SKEL.lowerArmLen - 12),
          shoulderPos.y - 28 + t * 10
        );
        break;
      }
    }

    this.swordArmTarget.setV(target);

    sk.solveIK2Bone(
      sk.rShoulder, sk.rElbow, sk.rWrist,
      target,
      SKEL.upperArmLen, SKEL.lowerArmLen,
      this.facing   // bend hint: elbow bends inward
    );

    // Recompute FK for right arm only
    sk._fkStep(sk.rShoulder, sk.rElbow,   0, -SKEL.upperArmLen);
    sk._fkStep(sk.rElbow,    sk.rWrist,   0, -SKEL.lowerArmLen);
    sk.positions.rElbow = sk.rElbow.worldPos.clone();
    sk.positions.rWrist = sk.rWrist.worldPos.clone();
  }

  // ─── Private: katana update ─────────────────────────────────
  _updateKatana(dt) {
    const wrist     = this.skeleton.positions.rWrist;
    if (!wrist) return;

    let targetAngle;
    switch (this.stance) {
      case STANCE.ATTACK_LIGHT:
        targetAngle = lerp(-0.8, 1.2, this.swingArcT) * this.facing;
        break;
      case STANCE.ATTACK_HEAVY:
        targetAngle = lerp(-1.3, 0.8, this.swingArcT) * this.facing - 0.4;
        break;
      case STANCE.BLOCK:
        targetAngle = -Math.PI * 0.55 * this.facing;
        break;
      case STANCE.STAGGER:
        targetAngle = Math.sin(this.staggerTimer * 12) * 0.4;
        break;
      default:
        targetAngle = this.facing > 0 ? 0.15 : Math.PI - 0.15;
        break;
    }

    this.katana.update(wrist, targetAngle, dt);
  }

  // ─── Private: cloth update ──────────────────────────────────
  _updateCloth(dt) {
    // Recalculate anchor positions on torso / hip
    const hipPos   = this.skeleton.positions.hip;
    const torsoPos = this.skeleton.positions.torso;
    if (!hipPos || !torsoPos) return;

    const clothW   = (this.robe.cols - 1) * this.robe.spacing;
    const anchorY  = hipPos.y - 12;
    const anchorX0 = hipPos.x - clothW * 0.5;

    // Build top-row positions
    const anchors = [];
    for (let c = 0; c < this.robe.cols; c++) {
      anchors.push(new Vec2(anchorX0 + c * this.robe.spacing, anchorY));
    }
    this.robe.pinTopRow(anchors);

    // Wind
    const gust = this.wind.update(dt);

    // Owner velocity for motion sway
    this.robe.step(dt, gust.x, gust.y, this.vel);
  }

  // ─── Private: facing ────────────────────────────────────────
  _updateFacing(inputX) {
    if (this.stance === STANCE.DEATH) return;
    if (inputX > 0.1)        this.facing =  1;
    else if (inputX < -0.1)  this.facing = -1;
  }

  // ─── Render ─────────────────────────────────────────────────

  /**
   * Draw the complete samurai (shadow, cloth, skeleton, katana).
   */
  render(ctx, opts = {}) {
    const showCloth   = opts.showCloth   !== false;
    const showShadow  = opts.showShadow  !== false;
    const silColor    = opts.color || '#0d0d0d';

    if (showShadow) this._drawShadow(ctx);

    // Robe behind body
    if (showCloth) this._drawRobe(ctx, silColor);

    // Skeleton silhouette
    this._drawSkeleton(ctx, silColor);

    // Katana
    this.katana.render(ctx, this.isPlayer, this.katana.isSwinging);

    // HUD bars ─ only in world space
    if (opts.showHUD) this._drawHUD(ctx);
  }

  _drawShadow(ctx) {
    const sx    = this.pos.x;
    const sy    = GROUND_Y + 8;
    const scaleX = 0.7 + (GROUND_Y - this.pos.y) / GROUND_Y * 0.1;

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle   = '#000';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 38 * scaleX, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  _drawRobe(ctx, silColor) {
    const quads = this.robe.getQuads();
    ctx.save();
    ctx.fillStyle   = silColor;
    ctx.globalAlpha = 0.92;
    for (const quad of quads) {
      ctx.beginPath();
      ctx.moveTo(quad[0].x, quad[0].y);
      ctx.lineTo(quad[1].x, quad[1].y);
      ctx.lineTo(quad[2].x, quad[2].y);
      ctx.lineTo(quad[3].x, quad[3].y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  _drawSkeleton(ctx, silColor) {
    const bones = this.skeleton.getBones();
    const pos   = this.skeleton.positions;

    ctx.save();
    ctx.fillStyle   = silColor;
    ctx.strokeStyle = silColor;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.globalAlpha = 1;

    for (const bone of bones) {
      if (!bone.a || !bone.b) continue;
      ctx.lineWidth = bone.r * 2;
      ctx.beginPath();
      ctx.moveTo(bone.a.x, bone.a.y);
      ctx.lineTo(bone.b.x, bone.b.y);
      ctx.stroke();
    }

    // Head circle
    if (pos.head) {
      ctx.beginPath();
      ctx.arc(pos.head.x, pos.head.y, SKEL.headRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stagger / death tint
    if (this.stance === STANCE.STAGGER) {
      ctx.globalAlpha = Math.sin(this.staggerTimer * 20) * 0.2 + 0.05;
      ctx.strokeStyle = '#ff2200';
      ctx.lineWidth   = 22;
      if (pos.torso && pos.hip) {
        ctx.beginPath();
        ctx.moveTo(pos.hip.x, pos.hip.y);
        ctx.lineTo(pos.torso.x, pos.torso.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  _drawHUD(ctx) {
    const barW  = 120, barH = 8;
    const bx    = this.pos.x - barW * 0.5;
    const by    = this.pos.y - SKEL.torsoLen - 50;

    // Health bar
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle   = '#300';
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle   = '#c00';
    ctx.fillRect(bx, by, barW * (this.health / COMBAT.healthMax), barH);

    // Posture bar
    const py = by + barH + 3;
    ctx.fillStyle = '#220';
    ctx.fillRect(bx, py, barW, 5);
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(bx, py, barW * (this.posture / COMBAT.maxPosture), 5);

    ctx.restore();
  }
}
