// ============================================================
//  RoninEngine — ai/controller.js
//  Finite-state-machine AI with aggression, feints,
//  reaction time, and randomised attack combos
// ============================================================

'use strict';

import { Vec2, clamp, randomRange, lerp } from '../core/math.js';
import { AI as CFG, COMBAT }               from '../core/config.js';
import { STANCE }                          from '../entities/samurai.js';

// ─── AI States ────────────────────────────────────────────────────────────────
const AI_STATE = {
  IDLE     : 'idle',
  APPROACH : 'approach',
  ATTACK   : 'attack',
  RETREAT  : 'retreat',
  BLOCK    : 'block',
  FEINT    : 'feint',
  CIRCLE   : 'circle',
};

// ─── AIController ─────────────────────────────────────────────────────────────
export class AIController {
  /**
   * @param {Samurai} aiSamurai   – the AI-controlled entity
   * @param {Samurai} player      – the human-controlled entity
   */
  constructor(aiSamurai, player) {
    this.ai        = aiSamurai;
    this.player    = player;

    this.state     = AI_STATE.IDLE;
    this.stateTime = 0;
    this.stateDur  = this._randDur(AI_STATE.IDLE);

    this.aggression   = CFG.aggressionBase;
    this.reactionTimer = 0;
    this.pendingAction = null;   // queued action after reaction delay

    this.circleDir    = 1;       // +1 clockwise, -1 counter
    this.circleTimer  = 0;

    this.comboStep    = 0;
    this.comboPattern = null;    // array of attack types

    this.blockHoldTimer   = 0;
    this.feintTriggered   = false;
    this.lastPlayerStance = STANCE.IDLE;

    // Performance analytics (for adaptive difficulty)
    this.playerHitCount   = 0;
    this.aiHitCount       = 0;
    this._frameTick       = 0;
  }

  // ─── Main tick ────────────────────────────────────────────

  /**
   * Update AI logic.
   * @param {number} dt  – scaled delta time (s)
   */
  update(dt) {
    if (this.ai.dead || this.player.dead) return;

    this._frameTick++;
    this.stateTime      += dt;
    this.reactionTimer  -= dt;
    if (this.circleTimer > 0) this.circleTimer -= dt;
    if (this.blockHoldTimer > 0) this.blockHoldTimer -= dt;

    // Process pending action if reaction delay elapsed
    if (this.pendingAction && this.reactionTimer <= 0) {
      this._executePending();
    }

    // State machine
    switch (this.state) {
      case AI_STATE.IDLE:     this._stateIdle(dt);     break;
      case AI_STATE.APPROACH: this._stateApproach(dt); break;
      case AI_STATE.ATTACK:   this._stateAttack(dt);   break;
      case AI_STATE.RETREAT:  this._stateRetreat(dt);  break;
      case AI_STATE.BLOCK:    this._stateBlock(dt);    break;
      case AI_STATE.FEINT:    this._stateFeint(dt);    break;
      case AI_STATE.CIRCLE:   this._stateCircle(dt);   break;
    }

    // React to player attack
    this._reactToPlayerAttack(dt);

    // Adaptive aggression
    this._adaptAggression();

    // Track player stance change
    this.lastPlayerStance = this.player.stance;
  }

  // ─── State handlers ───────────────────────────────────────

  _stateIdle(dt) {
    this._stopMovement();
    if (this.stateTime >= this.stateDur) {
      const dist = this._distToPlayer();
      if (dist > CFG.attackRangePx * 1.4) {
        this._transitionTo(AI_STATE.APPROACH);
      } else if (dist < CFG.retreatRangePx) {
        this._transitionTo(AI_STATE.RETREAT);
      } else if (Math.random() < this.aggression * 0.6) {
        this._transitionTo(AI_STATE.ATTACK);
      } else if (Math.random() < 0.3) {
        this._transitionTo(AI_STATE.CIRCLE);
      } else {
        this._transitionTo(AI_STATE.BLOCK);
      }
    }
  }

  _stateApproach(dt) {
    const dir  = this._dirToPlayer();
    this._moveInput = dir;
    const dist = this._distToPlayer();

    if (dist <= CFG.attackRangePx) {
      if (Math.random() < this.aggression) {
        this._queueAction('attack', CFG.reactionTime * 0.5);
      } else {
        this._transitionTo(AI_STATE.CIRCLE);
      }
      return;
    }

    if (this.stateTime >= this.stateDur) {
      this._transitionTo(AI_STATE.IDLE);
    }
  }

  _stateAttack(dt) {
    const dist = this._distToPlayer();
    if (dist > CFG.attackRangePx * 1.35) {
      this._transitionTo(AI_STATE.APPROACH);
      return;
    }

    if (this.stateTime >= this.stateDur) {
      // Execute combo step
      if (!this.comboPattern) {
        this.comboPattern = this._buildCombo();
        this.comboStep    = 0;
      }

      if (this.comboStep < this.comboPattern.length) {
        const atk = this.comboPattern[this.comboStep];
        this._queueAction(atk, CFG.reactionTime);
        this.comboStep++;
        this.stateDur = randomRange(0.2, 0.45);
        this.stateTime = 0;
      } else {
        this.comboPattern = null;
        this._transitionTo(Math.random() < 0.5 ? AI_STATE.RETREAT : AI_STATE.IDLE);
      }
    }
  }

  _stateRetreat(dt) {
    const dir  = this._dirToPlayer();
    this._moveInput = -dir;
    const dist = this._distToPlayer();

    if (dist >= CFG.attackRangePx * 0.8) {
      this._transitionTo(AI_STATE.IDLE);
      return;
    }

    if (this.stateTime >= this.stateDur) {
      this._transitionTo(AI_STATE.BLOCK);
    }
  }

  _stateBlock(dt) {
    if (this.stateTime < 0.05) {
      this.ai.startBlock();
      this.blockHoldTimer = randomRange(0.25, 0.65);
    }

    if (this.blockHoldTimer <= 0 || this.stateTime >= this.stateDur) {
      this.ai.stopBlock();
      const dist = this._distToPlayer();
      if (dist < CFG.attackRangePx && Math.random() < this.aggression * 0.8) {
        this._transitionTo(AI_STATE.ATTACK);
      } else {
        this._transitionTo(AI_STATE.IDLE);
      }
    }

    this._stopMovement();
  }

  _stateFeint(dt) {
    const dir = this._dirToPlayer();
    // Move in, then abruptly retreat
    if (this.stateTime < this.stateDur * 0.5) {
      this._moveInput = dir * 0.6;
    } else {
      this._moveInput = -dir;
      if (!this.feintTriggered && this.stateTime >= this.stateDur * 0.7) {
        this.feintTriggered = true;
        this._queueAction('attackLight', CFG.reactionTime * 0.3);
      }
    }

    if (this.stateTime >= this.stateDur) {
      this.feintTriggered = false;
      this._transitionTo(AI_STATE.RETREAT);
    }
  }

  _stateCircle(dt) {
    if (this.circleTimer <= 0) {
      this.circleDir   = Math.random() < 0.5 ? 1 : -1;
      this.circleTimer = randomRange(0.4, 1.0);
    }

    this._moveInput = this.circleDir * 0.7;
    const dist = this._distToPlayer();

    // Occasionally lunge in while circling
    if (dist <= CFG.attackRangePx && Math.random() < this.aggression * dt * 3) {
      this._queueAction('attackLight', CFG.reactionTime);
    }

    if (this.stateTime >= this.stateDur) {
      this._transitionTo(AI_STATE.IDLE);
    }
  }

  // ─── Reaction logic ───────────────────────────────────────

  _reactToPlayerAttack(dt) {
    const p = this.player;
    const wasAttacking = (
      this.lastPlayerStance !== STANCE.ATTACK_LIGHT &&
      this.lastPlayerStance !== STANCE.ATTACK_HEAVY
    );
    const nowAttacking = (
      p.stance === STANCE.ATTACK_LIGHT ||
      p.stance === STANCE.ATTACK_HEAVY
    );

    if (wasAttacking && nowAttacking) {
      // Player just started attacking
      const roll = Math.random();
      if (roll < this.aggression * 0.4) {
        // Counter-attack
        this._queueAction('attackLight', CFG.reactionTime * lerp(0.6, 1.4, Math.random()));
      } else if (roll < 0.8) {
        // Block
        this._queueAction('block', CFG.reactionTime * 0.5);
      } else {
        // Dash away
        this._queueAction('dash', CFG.reactionTime * 0.3);
      }
    }
  }

  // ─── Action queue ─────────────────────────────────────────

  _queueAction(type, delay) {
    if (this.pendingAction) return;   // don't overwrite
    this.pendingAction  = type;
    this.reactionTimer  = clamp(delay, 0.02, 0.5);
  }

  _executePending() {
    const action = this.pendingAction;
    this.pendingAction  = null;

    if (this.ai.dead) return;

    switch (action) {
      case 'attackLight':
        if (this.ai.attackCooldown <= 0) {
          this.ai.attackLight();
          this.aiHitCount++;
        }
        break;
      case 'attackHeavy':
        if (this.ai.attackCooldown <= 0) {
          this.ai.attackHeavy();
        }
        break;
      case 'block':
        this._transitionTo(AI_STATE.BLOCK);
        break;
      case 'dash': {
        const dir = this._distToPlayer() < 100 ? -this._dirToPlayer() : this._dirToPlayer();
        this.ai.dash(dir);
        break;
      }
      case 'attack':
        this._transitionTo(AI_STATE.ATTACK);
        break;
      default: break;
    }
  }

  // ─── Combo builder ────────────────────────────────────────

  _buildCombo() {
    const r = Math.random();
    if (r < 0.35) return ['attackLight'];
    if (r < 0.60) return ['attackLight', 'attackLight'];
    if (r < 0.75) return ['attackLight', 'attackHeavy'];
    if (r < 0.88) return ['attackHeavy'];
    return ['attackLight', 'attackLight', 'attackHeavy'];
  }

  // ─── Adaptive difficulty ──────────────────────────────────

  _adaptAggression() {
    if (this._frameTick % 180 !== 0) return;   // every ~3s at 60fps
    const ratio = this.playerHitCount / (this.aiHitCount + 1);
    if (ratio > 1.5) {
      // Player is winning – increase aggression
      this.aggression = clamp(this.aggression + 0.06, 0.2, 0.95);
    } else if (ratio < 0.5) {
      // AI is dominating – back off slightly for fairness  
      this.aggression = clamp(this.aggression - 0.03, 0.2, 0.95);
    }
  }

  // ─── Internal helpers ─────────────────────────────────────

  _transitionTo(newState) {
    if (this.state === newState) { this.stateTime = 0; return; }
    this.state     = newState;
    this.stateTime = 0;
    this.stateDur  = this._randDur(newState);
    this._moveInput = 0;
  }

  _distToPlayer() {
    return Math.abs(this.ai.pos.x - this.player.pos.x);
  }

  _dirToPlayer() {
    return this.ai.pos.x < this.player.pos.x ? 1 : -1;
  }

  _stopMovement() {
    this._moveInput = 0;
  }

  _randDur(state) {
    const d = CFG.stateDurations[state] || [0.5, 1.2];
    return randomRange(d[0], d[1]);
  }

  // ─── Public move intent ───────────────────────────────────

  /**
   * Returns current desired horizontal movement [-1, +1].
   * Call this from main loop to feed into ai.update().
   */
  get moveIntent() {
    return this._moveInput || 0;
  }

  /** Called by collision system when player lands a hit */
  onPlayerHit() {
    this.playerHitCount++;
  }

  /** Called by collision system when AI lands a hit */
  onAIHit() {
    this.aiHitCount++;
  }

  // ─── Debug info ────────────────────────────────────────────
  getDebugInfo() {
    return {
      state       : this.state,
      aggression  : this.aggression.toFixed(2),
      stateTime   : this.stateTime.toFixed(2),
      pending     : this.pendingAction || '–',
      reaction    : this.reactionTimer.toFixed(3),
      dist        : this._distToPlayer().toFixed(0),
      combo       : this.comboPattern ? this.comboPattern.join(',') : '–',
      comboStep   : this.comboStep,
    };
  }
}
