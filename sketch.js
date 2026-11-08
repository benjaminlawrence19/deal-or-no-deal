/***********************
 Deal or No Deal
 ***********************/

// ---------- ENUMS ----------
const STATE = Object.freeze({
  START: "START",
  PICK_PLAYER_BOX: "PICK_PLAYER_BOX",
  OPENING: "OPENING",
  OFFER: "OFFER",
  BUTTON_GAME: "BUTTON_GAME",
  BUTTON_GAME_RESULT: "BUTTON_GAME_RESULT",
  SPECIAL_SECOND_CHANCE: "SPECIAL_SECOND_CHANCE",
  CLOWN_GAME: "CLOWN_GAME",
  SWAP: "SWAP",
  GAMBLE: "GAMBLE",
  END_REVEAL: "END_REVEAL",
  BOX23: "BOX23",
  COUNTER_OFFER: "COUNTER_OFFER",
  COUNTER_OFFER_RESULT: "COUNTER_OFFER_RESULT",
  FINISHED: "FINISHED",
  STATS: "STATS",
  MENU: "MENU",
  INFO: "INFO",
  SETTINGS: "SETTINGS",
  SOUND: "SOUND",
  PRESETS: "PRESETS",
});

// ---------- CONFIG ----------
const CFG = {
  columns: 4,
  boardWidthFrac: 3 / 4,
  ribbonWidthFrac: 1 / 4,

  baseRoundsITV: [5, 3, 3, 3, 3, 2, 1],
  baseRoundsC4: [5, 3, 3, 3, 3, 3],
  baseRoundsUS: [6, 5, 4, 3, 2, 1, 1, 1, 1],

  amountsITV: [0.01, 0.1, 0.5, 1, 5, 10, 50, 100, 250, 500, 750, 1000, 2000, 3000, 4000, 5000, 7500, 10000, 25000, 50000, 75000, 100000],
  amountsC4: [0.01, 0.1, 0.5, 1, 5, 10, 50, 100, 250, 500, 750, 1000, 3000, 5000, 10000, 15000, 20000, 35000, 50000, 75000, 100000, 250000],
  amountsUS: [0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 750, 1000, 5000, 10000, 25000, 50000, 75000, 100000, 200000, 300000, 400000, 500000, 750000, 1000000],

  // Special Game replacement boards
  specialAmountsITV: [0.01, 0.1, 0.5, 1, 5, 10, 50, 100, 250, 500, 750, 1000, 3000, 5000, 7500, 10000, 15000, 25000, 50000, 75000, 100000, 200000],
  specialAmountsC4: [0.01, 0.1, 0.5, 1, 5, 10, 50, 100, 250, 500, 750, 1000, 3000, 5000, 10000, 20000, 35000, 50000, 75000, 100000, 250000, 500000],
  specialAmountsUS: [0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 750, 1000, 5000, 10000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 750000, 1000000, 2000000],

  // Golden/Box23 effects per set
  goldenEffectsITV: ["DOUBLE", "+£5,000", "MONEY BACK", "HALF", "NOTHING"],
  goldenEffectsC4: ["DOUBLE", "+£10,000", "MONEY BACK", "HALF", "NOTHING"],
  goldenEffectsUS: ["DOUBLE", "+$25,000", "MONEY BACK", "HALF", "NOTHING"],
};

// ---------- GLOBAL APP ----------
const app = {
  layout: { boxW: 0, boxH: 0 },
  assets: {
    images: {
      ukBoxes: [],
      usCases: [],
      goldenCase: null,
      background: null,
      start: null,
    },
    audio: {
      loops: { offer: [], opening: [] },
      oneShots: {},
      startMusic: null,
      openingPlayerBox: null,
    },
  },
  audio: null,
  ui: null,
  fsm: null,
  game: null,
  settings: null,
};

let pointerX = 0;
let pointerY = 0;

function updatePointerFromMouse() {
  pointerX = mouseX;
  pointerY = mouseY;
}

function updatePointerFromTouch() {
  if (touches && touches.length > 0) {
    pointerX = touches[0].x;
    pointerY = touches[0].y;
  }
}

//
// =======================
// 1) ASSETS
// =======================
//
function preload() {

  // Change this whenever you replace an image/audio asset.
  const ASSET_VERSION = "2";

  function asset(path) {
    return `${path}?v=${ASSET_VERSION}`;
  }

  app.assets.images.boxImages = [];
  for (let i = 1; i <= 23; i++) {
    const path = asset("images/Box_" + i + ".jpg");

    app.assets.images.boxImages[i - 1] = loadImage(
      path
    );
  }

  app.assets.images.usCases = [];
  for (let i = 1; i <= 26; i++) {
    const path = asset("images/Case_" + i + ".jpg");

    app.assets.images.usCases[i - 1] = loadImage(
      path
    );
  }

  app.assets.images.goldenCase = loadImage(
    asset("images/Golden_Case.jpg")
  );

  app.assets.images.background = loadImage(
    asset("images/Background_Image.jpg")
  );

  app.assets.images.start = loadImage(
    asset("images/Start_Screen_Background.jpg")
  );

  function sound(path) {
    return loadSound(
      asset(path)
    );
  }

  const offer1 = sound("sound/offer1.mp3");
  const offer2 = sound("sound/offer2.mp3");
  const offer3 = sound("sound/offer3.mp3");
  const offer4 = sound("sound/offer4.mp3");

  const opening1 = sound("sound/openingBoxes1.mp3");
  const opening2 = sound("sound/openingBoxes2.mp3");

  [offer1, offer2, offer3, offer4].forEach(s => s.setVolume(0.25));
  [opening1, opening2].forEach(s => s.setVolume(0.15));

  app.assets.audio.loops.offer = [
    offer1, offer2, offer3, offer4
  ];

  app.assets.audio.loops.opening = [
    opening1, opening2
  ];

  app.assets.audio.oneShots = {
    open100k: sound("sound/100000BoxOpened.mp3"),
    open1p: sound("sound/0.01BoxOpened.mp3"),
    boxOpen: sound("sound/boxOpen.mp3"),
    phone: sound("sound/phoneRing.mp3"),
    smallClap: sound("sound/smallClapping.mp3"),
    largeClap: sound("sound/largeClapping.mp3"),
    groan: sound("sound/groan.mp3")
  };

  app.assets.audio.oneShots.open100k.setVolume(1.0);
  app.assets.audio.oneShots.open1p.setVolume(0.35);
  app.assets.audio.oneShots.boxOpen.setVolume(0.5);
  app.assets.audio.oneShots.phone.setVolume(0.35);
  app.assets.audio.oneShots.smallClap.setVolume(0.5);
  app.assets.audio.oneShots.largeClap.setVolume(0.5);
  app.assets.audio.oneShots.groan.setVolume(0.5);

  app.assets.audio.openingPlayerBox =
    sound("sound/openingPlayerBox.mp3");
  app.assets.audio.openingPlayerBox.setVolume(0.5);

  app.assets.audio.startMusic =
    sound("sound/startScreenMusic.mp3");
  app.assets.audio.startMusic.setVolume(0.25);
}

function setup() {
  
  const c = createCanvas(windowWidth, windowHeight);

  // iOS/iPadOS: stop gestures/scroll from stealing taps
  c.elt.style.touchAction = "none";
  c.elt.addEventListener("touchstart", (e) => e.preventDefault(), {
    passive: false,
  });
  c.elt.addEventListener("touchmove", (e) => e.preventDefault(), {
    passive: false,
  });
  c.elt.addEventListener("touchend", (e) => e.preventDefault(), {
    passive: false,
  });

  computeLayout();

  app.settings = loadSettings();
  app.audio = new AudioSystem(app.assets.audio);
  app.game = new GameModel();
  app.ui = new UISystem();
  app.fsm = new StateMachine();

  app.game.loadHistory();
  app.game.bankerMood = app.game.getStartingMood();
  // GameModel's constructor already initializes runtime state. The actual
  // game reset happens only when Play is pressed, so the game is not
  // randomly generated twice on startup.
  app.fsm.returnState = null;

  registerStates();
  app.fsm.transitionTo(STATE.START);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  computeLayout();
  app.game.relayout(app.layout);
}

function computeLayout() {
  app.layout.boxW = windowWidth * 0.065;
  app.layout.boxH = app.layout.boxW * (55 / 84);
}

//
// =======================
// 2) STATE MACHINE
// =======================
//
class StateMachine {
  constructor() {
    this.state = null;
    this.handlers = new Map();
    this.returnState = null; // where to go back to after overlays
  }

  register(
    state,
    { onEnter, onExit, update, render, onKey, onClick, onWheel } = {}
  ) {
    this.handlers.set(state, {
      onEnter,
      onExit,
      update,
      render,
      onKey,
      onClick,
      onWheel,
    });
  }

  // Overlay states do NOT become returnState; instead we return to the last "real" gameplay state
  _isOverlay(s) {
    return [STATE.MENU, STATE.INFO, STATE.SETTINGS, STATE.SOUND, STATE.PRESETS, STATE.STATS].includes(s);
  }

  transitionTo(nextState, payload = {}) {
    if (this.state === nextState) return;

    const prev = this.state;
    const prevH = prev ? this.handlers.get(prev) : null;
    if (app.ui?.consumedButtons) app.ui.consumedButtons.clear();

    if (prevH?.onExit) {
      prevH.onExit(payload);
    }

    /*
      Only remember the state when opening MENU.
  
      Example:
      OPENING -> MENU
      returnState = OPENING
  
      MENU -> SETTINGS
      do NOT change returnState
  
      SETTINGS -> MENU
      keep returnState = OPENING
  
      MENU -> OPENING
      clear returnState
    */

    if (nextState === STATE.MENU && !this._isOverlay(prev)) {
      this.returnState = prev;
    }

    if (nextState === this.returnState && !this._isOverlay(nextState)) {
      // returning to gameplay
      this.returnState = null;
    }

    this.state = nextState;

    app.audio.applyPolicyForState(nextState);

    const nextH = this.handlers.get(nextState);

    if (nextH?.onEnter) {
      nextH.onEnter(payload);
    }
  }

  update() {
    const h = this.handlers.get(this.state);
    if (h?.update) h.update();
  }

  render() {
    const h = this.handlers.get(this.state);
    if (h?.render) h.render();
  }

  keyPressed() {
    const h = this.handlers.get(this.state);
    if (h?.onKey) h.onKey();
  }

  mousePressed() {
    const h = this.handlers.get(this.state);
    if (h?.onClick) h.onClick();
  }

  mouseDragged() {
    const h = this.handlers.get(this.state);
    if (h?.onDrag) h.onDrag();
  }

  mouseWheel(evt) {
    if (this.state === STATE.STATS) {
      app.game.scrollOffset += evt.delta;

      const maxScroll = max(0, app.game.statsHeight - height);

      app.game.scrollOffset = constrain(app.game.scrollOffset, 0, maxScroll);

      return false;
    }

    if (this.state === STATE.INFO) {
      app.game.scrollOffset += evt.delta;

      app.game.scrollOffset = constrain(
        app.game.scrollOffset,
        0,
        max(0, app.game.infoHeight - height)
      );

      return false;
    }

    const h = this.handlers.get(this.state);
    if (h?.onWheel) h.onWheel(evt);
  }
}

//
// =======================
// 3) AUDIO SYSTEM
// =======================
//
class AudioSystem {
  constructor(audioAssets) {
    this.assets = audioAssets;
    this.pool = { offer: [], opening: [] };
    this.current = { offer: null, opening: null };
    this.loopToken = { offer: 0, opening: 0 };

    // tracks the active "category" so we don't restart it unnecessarily
    this.activeCategory = null; // "start" | "offer" | "opening" | null
    this.applyVolumes();
  }

  applyVolumes() {
    const a = app.settings?.audio || { master: 1, music: 1, sfx: 1 };
    const master = constrain(Number(a.master), 0, 1);
    const music = constrain(Number(a.music), 0, 1);
    const sfx = constrain(Number(a.sfx), 0, 1);
    for (const s of this.assets.loops.offer) s.setVolume(0.25 * master * music);
    for (const s of this.assets.loops.opening) s.setVolume(0.15 * master * music);
    if (this.assets.startMusic) this.assets.startMusic.setVolume(0.25 * master * music);
    if (this.assets.openingPlayerBox) this.assets.openingPlayerBox.setVolume(0.5 * master * sfx);
    const base = { open100k:1, open1p:0.35, boxOpen:0.5, phone:0.35, smallClap:0.5, largeClap:0.5, groan:0.5 };
    for (const [name, vol] of Object.entries(base)) {
      if (this.assets.oneShots[name]) this.assets.oneShots[name].setVolume(vol * master * sfx);
    }
  }

  _isOverlayState(s) {
    return [STATE.MENU, STATE.INFO, STATE.SETTINGS, STATE.SOUND, STATE.PRESETS, STATE.STATS].includes(s);
  }

  _effectiveState(state) {
    return this._isOverlayState(state)
      ? app.fsm.returnState ?? STATE.START
      : state;
  }

  _desiredCategoryForState(effectiveState) {
    if (effectiveState === STATE.START) return "start";

    const openingStates = [
      STATE.PICK_PLAYER_BOX,
      STATE.OPENING,
      STATE.CLOWN_GAME,
      STATE.FINISHED,
    ];
    const offerStates = [
      STATE.OFFER,
      STATE.SWAP,
      STATE.GAMBLE,
      STATE.BOX23,
      STATE.BUTTON_GAME,
      STATE.BUTTON_GAME_RESULT,
      STATE.SPECIAL_SECOND_CHANCE,
      STATE.COUNTER_OFFER,
      STATE.COUNTER_OFFER_RESULT,
    ];

    if (openingStates.includes(effectiveState)) return "opening";
    if (offerStates.includes(effectiveState)) return "offer";
    return null;
  }

  stopLoops() {
    for (const k of ["offer", "opening"]) {
      this.loopToken[k]++; // invalidate onended callbacks
      const cur = this.current[k];
      if (cur) {
        if (cur.isPlaying()) cur.stop();
      }
      this.current[k] = null;
      this.pool[k] = [];
    }
  }

  stopAll() {
    // do NOT stop one-shots here (prevents killing 1p etc.)
    this.stopLoops();
    if (this.assets.startMusic?.isPlaying()) this.assets.startMusic.stop();
    if (this.assets.openingPlayerBox?.isPlaying())
      this.assets.openingPlayerBox.stop();
    this.activeCategory = null;
  }

  applyPolicyForState(state) {
    const eff = this._effectiveState(state);
    const desired = this._desiredCategoryForState(eff);

    // If we already have the correct category playing, DO NOTHING (prevents restart)
    if (desired === this.activeCategory) {
      // A loop can naturally finish while the category remains active.
      // Resume it when entering/remaining in a state that still wants it.
      if (desired === "opening" && !this.current.opening?.isPlaying()) this.playLoop("opening");
      if (desired === "offer" && !this.current.offer?.isPlaying()) this.playLoop("offer");
      return;
    }

    // Otherwise change category cleanly
    if (this.assets.startMusic?.isPlaying()) this.assets.startMusic.stop();
    this.stopLoops();

    this.activeCategory = desired;

    if (desired === "start") {
      this.assets.startMusic.setLoop(true);
      this.assets.startMusic.play();
      return;
    }

    if (desired === "opening") this.playLoop("opening");
    if (desired === "offer") this.playLoop("offer");
  }

  playLoop(kind) {
    if (this.current[kind]?.isPlaying()) return;

    const myToken = ++this.loopToken[kind];

    if (this.pool[kind].length === 0) {
      this.pool[kind] = [...this.assets.loops[kind]];
      shuffleInPlace(this.pool[kind]);
    }

    const next = this.pool[kind].pop();

    this.current[kind] = next;

    next.play();

    next.onended(() => {
      if (this.loopToken[kind] !== myToken) return;

      if (
        (kind === "opening" && this.activeCategory !== "opening") ||
        (kind === "offer" && this.activeCategory !== "offer")
      ) {
        return;
      }

      this.current[kind] = null;
      this.playLoop(kind);
    });
  }

  oneShot(name, resumeOpening = false) {
    const s = this.assets.oneShots[name];

    if (!s) return;

    if (resumeOpening) {
      this.stopLoops();
    }

    // Phone is a one-shot notification, never a persistent/retriggerable
    // sound.  Stop any previous instance before starting a new ring.
    if (name === "phone" && s.isPlaying()) {
      s.stop();
    }

    s.play();

    if (resumeOpening) {
      s.onended(() => {
        if (this.activeCategory === "opening") {
          this.playLoop("opening");
        }
      });
    }
  }

  stopOneShot(name) {
    const s = this.assets.oneShots[name];
    if (s?.isPlaying()) s.stop();
  }
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function playCrowdReaction(openedValue) {
  const g = app.game;

  const remainingBefore = g.unopenedNon23().map((b) => b.value);

  if (remainingBefore.length <= 1) return;

  const oldEV =
    remainingBefore.reduce((a, b) => a + b, 0) / remainingBefore.length;

  const newEV =
    (remainingBefore.reduce((a, b) => a + b, 0) - openedValue) /
    (remainingBefore.length - 1);

  let changePct = ((newEV - oldEV) / oldEV) * 100;

  stopCrowdReaction();

  const reactionId = ++g.crowdReactionId;

  let soundName = null;
  if (g.dealAccepted == null) {
    if (changePct >= 4) {
      g.roundLargeClaps++;
      soundName = "largeClap";
    } else if (changePct < 0) {
      g.roundGroans++;
      soundName = "groan";
    } else {
      soundName = "smallClap";
    }
  } else {
    if (changePct >= 4) {
      g.roundGroans++;
      soundName = "groan";
    } else if (changePct < 0) {
      g.roundLargeClaps++;
      soundName = "largeClap";
    } else {
      soundName = "smallClap";
    }
  }

  // Delay crowd reaction by 0.4 seconds
  setTimeout(() => {
    if (g.crowdReactionId !== reactionId) return;

    app.audio.oneShot(soundName);
  }, 400);
}

function stopCrowdReaction() {
  const sounds = ["smallClap", "largeClap", "groan"];

  for (const s of sounds) {
    app.audio.stopOneShot(s);
  }

  app.game.crowdReactionId++;
}

function playButtonGameReaction(success) {
  setTimeout(() => {
    app.audio.stopLoops();
    app.audio.activeCategory = null;
    if (success) {
      app.audio.oneShot("largeClap");

      // Delay 0.01 box sound slightly longer
      setTimeout(() => {
        app.audio.oneShot("open1p");
      }, 250);
    } else {
      app.audio.oneShot("groan");
    }
  }, 400);
}

function playOfferReaction(previousOffer, newOffer) {
  const g = app.game;

  // After dealing, compare to the deal amount instead
  if (g.dealAccepted != null) {
    if (newOffer < g.dealAccepted) {
      app.audio.oneShot("largeClap");
    }
    return; // Otherwise stay silent
  }

  // Before dealing: a new offer at least as high as the last offer gets a
  // large clap. A lower offer gets a small clap. Equal offers therefore count
  // as positive/neutral for the audience reaction.
  if (newOffer >= previousOffer) {
    app.audio.oneShot("largeClap");
  } else {
    app.audio.oneShot("smallClap");
  }
}

function playPlayerBoxReaction() {
  setTimeout(() => {
    const g = app.game;

    const remaining = g.unopenedNon23ExceptPlayer().map((b) => b.value);

    const it = g.initialTakenHome;
    const pv = g.playerBox.value;
    const lastOffer = g.offerHistory[g.offerHistory.length - 1]?.amount;

    const lost = it < pv || (it === pv && pv < lastOffer);

    // Player beat the banker
    if (!lost) {
      app.audio.oneShot("largeClap");
      return;
    }

    // Both remaining boxes were above the final take,
    // but player picked the lower one
    const bothAboveIT = pv > it && remaining[0] > it;

    const playerWasLower = pv === Math.min(pv, remaining[0]);

    if (bothAboveIT && playerWasLower) {
      app.audio.oneShot("smallClap");
    } else {
      app.audio.oneShot("groan");
    }
  }, 400);
}

function playBox23Reaction(effect, accepted) {
  setTimeout(() => {
    const g = app.game;
    const initial = g.initialTakenHome;

    const plusAmount = /^(?:2x )?\+[£$]/.test(effect);

    const isDouble = effect === "DOUBLE";
    const isMoneyBack = effect === "MONEY BACK";

    // -----------------------
    // Accepted Box 23
    // -----------------------
    if (accepted) {
      if (initial >= 1000) {
        // Existing behaviour
        if (plusAmount || isDouble || isMoneyBack) {
          app.audio.oneShot("largeClap");
        } else {
          app.audio.oneShot("groan");
        }
      } else if (initial >= 100) {
        if (plusAmount || isDouble) {
          app.audio.oneShot("largeClap");
        } else if (isMoneyBack) {
          app.audio.oneShot("smallClap");
        } else {
          app.audio.oneShot("groan");
        }
      } else if (initial >= 10) {
        if (plusAmount) {
          app.audio.oneShot("largeClap");
        } else if (isDouble) {
          app.audio.oneShot("smallClap");
        } else {
          app.audio.oneShot("groan");
        }
      } else {
        if (plusAmount) {
          app.audio.oneShot("largeClap");
        } else {
          app.audio.oneShot("groan");
        }
      }
    }

    // -----------------------
    // Rejected Box 23
    // -----------------------
    else {
      if (initial >= 1000) {
        // Existing behaviour
        if (plusAmount || isDouble) {
          app.audio.oneShot("smallClap");
        } else {
          app.audio.oneShot("largeClap");
        }
      } else {
        if (plusAmount || isDouble) {
          app.audio.oneShot("groan");
        } else if (isMoneyBack) {
          app.audio.oneShot("smallClap");
        } else {
          app.audio.oneShot("largeClap");
        }
      }
    }
  }, 400);
}

function waitForCrowdReaction(callback) {
  setTimeout(() => {
    const check = setInterval(() => {
      const sounds = ["smallClap", "largeClap", "groan"];

      const playing = sounds.some((s) =>
        app.assets.audio.oneShots[s]?.isPlaying()
      );

      if (!playing) {
        clearInterval(check);
        callback();
      }
    }, 100);
  }, 401);
}

function waitForPhone(callback) {
  const phone = app.assets.audio.oneShots.phone;
  if (!phone) {
    callback();
    return;
  }

  // Never leave a polling interval alive if an audio implementation fails
  // to report isPlaying() correctly.  A phone ring is finite, so 15 seconds
  // is more than enough for the sound to finish.
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearInterval(check);
    clearTimeout(timeout);
    callback();
  };

  const check = setInterval(() => {
    if (!phone.isPlaying()) finish();
  }, 50);

  const timeout = setTimeout(() => {
    // Safety valve: forcibly stop the phone and continue.
    if (phone.isPlaying()) phone.stop();
    finish();
  }, 15000);
}

//
// =======================
// 4) UI SYSTEM
// =======================
//
// FULL REPLACEMENT: UISystem
class UISystem {
  constructor() {
    this.buttons = [];
    this.debounceMs = 120;
    this.lastClickAt = 0;
    this.consumedButtons = new Set();
    this.sliders = [];
  }

  beginFrame() {
    this.buttons = [];
    this.sliders = [];
  }

  // Draw + register a clickable button
  button(id, label, x, y, w, h, onClick) {
    // draw
    rectMode(CENTER);
    fill(70);
    noStroke();
    rect(x, y, w, h, h * 0.16);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(Math.min(h * 0.35, w / Math.max(label.length * 0.55, 1)));
    text(label, x, y);

    rectMode(CORNER);

    // register hitbox
    this.buttons.push({ id, x, y, w, h, onClick });
  }

  slider(id, label, x, y, w, value, onChange) {
    const h = Math.max(10, w * 0.035);
    const clamped = constrain(value, 0, 1);
    const knobX = x - w / 2 + clamped * w;

    fill(0);
    textAlign(LEFT, CENTER);
    textSize(Math.min(windowWidth * 0.014, h * 2.4));
    text(`${label}: ${Math.round(clamped * 100)}%`, x - w / 2, y - h * 1.8);

    stroke(90);
    strokeWeight(h);
    line(x - w / 2, y, x + w / 2, y);
    noStroke();
    fill(70);
    circle(knobX, y, h * 2.2);

    this.sliders.push({ id, x, y, w, h: h * 3, onChange });
  }

  handleClick(mx, my) {
    const now = millis();
    if (now - this.lastClickAt < this.debounceMs) return false;
    this.lastClickAt = now;

    // Sliders are handled before buttons.
    for (let i = this.sliders.length - 1; i >= 0; i--) {
      const sl = this.sliders[i];
      if (mx >= sl.x - sl.w / 2 && mx <= sl.x + sl.w / 2 &&
          my >= sl.y - sl.h / 2 && my <= sl.y + sl.h / 2) {
        const value = constrain((mx - (sl.x - sl.w / 2)) / sl.w, 0, 1);
        sl.onChange(value);
        return true;
      }
    }

    // top-most wins
    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const b = this.buttons[i];
      const hit =
        mx >= b.x - b.w / 2 &&
        mx <= b.x + b.w / 2 &&
        my >= b.y - b.h / 2 &&
        my <= b.y + b.h / 2;

      if (hit) {
        const repeatable = b.id === "boxSet" || /^tog/.test(String(b.id));
        if (!repeatable) {
          if (this.consumedButtons.has(b.id)) return true;
          this.consumedButtons.add(b.id);
        }
        if (typeof b.onClick === "function") b.onClick();
        return true;
      }
    }
    return false;
  }

  handleDrag(mx, my) {
    for (let i = this.sliders.length - 1; i >= 0; i--) {
      const sl = this.sliders[i];
      if (my >= sl.y - sl.h / 2 && my <= sl.y + sl.h / 2) {
        const value = constrain((mx - (sl.x - sl.w / 2)) / sl.w, 0, 1);
        sl.onChange(value);
        return true;
      }
    }
    return false;
  }
}

//
// =======================
// 5) SETTINGS (persisted)
// =======================
//
function loadSettings() {
  const raw = localStorage.getItem("dondSettings");
  const defaults = {
    boxSet: "ITV", // "ITV" | "C4" | "US"
    enableGamble: false,
    enableSwap: true,
    enableButtonGame: false,
    enableSpecialGame: false,
    enableBox23: false,
    enableCounterOffer: false,
    enableMidRoundOffer: false,
    useITVRounds: true,
    jackpotChase: false,
    jackpotChaseNext: { ITV: 1, C4: 1, US: 1 },
    audio: { master: 1, music: 1, sfx: 1 },
    customPresets: [null, null, null],
  };
  if (!raw) return defaults;
  try {
    const saved = JSON.parse(raw);
    return {
      ...defaults,
      ...saved,
      jackpotChaseNext: {
        ...defaults.jackpotChaseNext,
        ...(saved.jackpotChaseNext || {}),
      },
      audio: { ...defaults.audio, ...(saved.audio || {}) },
      customPresets: Array.isArray(saved.customPresets)
        ? [...saved.customPresets, null, null, null].slice(0, 3)
        : defaults.customPresets,
    };
  } catch {
    return defaults;
  }
}

function saveSettings() {
  localStorage.setItem("dondSettings", JSON.stringify(app.settings));
}

function getPresetSettingsSnapshot() {
  return {
    boxSet: app.settings.boxSet,
    enableSpecialGame: !!app.settings.enableSpecialGame,
    enableButtonGame: !!app.settings.enableButtonGame,
    enableCounterOffer: !!app.settings.enableCounterOffer,
    enableMidRoundOffer: !!app.settings.enableMidRoundOffer,
    enableSwap: !!app.settings.enableSwap,
    enableGamble: !!app.settings.enableGamble,
    enableBox23: !!app.settings.enableBox23,
    jackpotChase: !!app.settings.jackpotChase,
    useITVRounds: !!app.settings.useITVRounds,
  };
}

function normalizePresetConfig(cfg) {
  // Presets should contain only game settings. This also makes older custom
  // presets safe when new settings are added later.
  if (!cfg || typeof cfg !== "object") return null;

  const normalized = {
    boxSet: ["ITV", "C4", "US"].includes(cfg.boxSet) ? cfg.boxSet : app.settings.boxSet,
    enableSpecialGame: !!cfg.enableSpecialGame,
    enableButtonGame: !!cfg.enableButtonGame,
    enableCounterOffer: !!cfg.enableCounterOffer,
    enableMidRoundOffer: !!cfg.enableMidRoundOffer,
    enableSwap: !!cfg.enableSwap,
    enableGamble: !!cfg.enableGamble,
    enableBox23: !!cfg.enableBox23,
    jackpotChase: !!cfg.jackpotChase,
    useITVRounds: !!cfg.useITVRounds,
  };

  return normalized;
}

function getValidCustomPreset(index) {
  const slot = Array.isArray(app.settings.customPresets)
    ? app.settings.customPresets[index]
    : null;

  if (!slot || typeof slot !== "object") return null;

  const config = normalizePresetConfig(slot.config);
  if (!config) return null;

  return {
    name: typeof slot.name === "string" && slot.name.trim()
      ? slot.name.trim()
      : `Custom ${index + 1}`,
    config,
  };
}

function applyPresetConfig(cfg) {
  const normalized = normalizePresetConfig(cfg);
  if (!normalized) return;

  Object.assign(app.settings, normalized);
  saveSettings();
}

function builtInPresets() {
  const currentBoxSet = app.settings.boxSet;
  const p = (boxSet, special, button, counter, mid, swap, gamble, box23, chase, rounds) => ({
    boxSet, enableSpecialGame: special, enableButtonGame: button,
    enableCounterOffer: counter, enableMidRoundOffer: mid, enableSwap: swap,
    enableGamble: gamble, enableBox23: box23, jackpotChase: chase,
    useITVRounds: rounds === "ITV",
  });
  return [
    ["ITV Classic (Default)", p("ITV",false,false,false,false,true,false,false,false,"ITV")],
    ["C4 Classic", p("C4",false,false,false,false,true,false,false,false,"C4")],
    ["US Classic", p("US",false,false,false,false,true,false,false,false,"US")],
    ["C4 Expanded", p("C4",true,true,false,true,true,true,true,false,"C4")],
    ["US Expanded excl. Chase", p("US",false,false,true,false,true,false,false,false,"US")],
    ["US Expanded incl. Chase", p("US",false,false,true,false,true,false,false,true,"US")],
    ["All excl. Chase", p(currentBoxSet,true,true,true,true,true,true,true,false,currentBoxSet === "ITV" ? "ITV" : currentBoxSet === "C4" ? "C4" : "US")],
    ["All incl. Chase", p(currentBoxSet,true,true,true,true,true,true,true,true,currentBoxSet === "ITV" ? "ITV" : currentBoxSet === "C4" ? "C4" : "US")],
  ];
}

function getActiveBoxSet() {
  return app.game?.boxSetAtStart || app.settings.boxSet;
}

function isC4() {
  return getActiveBoxSet() === "C4";
}

function isUS() {
  return getActiveBoxSet() === "US";
}

function getAmounts() {
  if (app.game?.specialGame && app.game.specialAmounts) {
    return getSpecialAmounts();
  }
  if (getActiveBoxSet() === "C4") return [...CFG.amountsC4];
  if (getActiveBoxSet() === "US") return [...CFG.amountsUS];
  return [...CFG.amountsITV];
}

function getSpecialAmounts(boxSet = getActiveBoxSet()) {
  if (boxSet === "C4") return [...CFG.specialAmountsC4];
  if (boxSet === "US") return [...CFG.specialAmountsUS];
  return [...CFG.specialAmountsITV];
}

function getSpecialBox23Effects() {
  const setAPlus = isUS() ? "+$50,000" : isC4() ? "+£20,000" : "+£10,000";
  const setBPlus = isUS() ? "+$25,000" : isC4() ? "+£10,000" : "+£5,000";
  return random() < 0.5
    ? ["DOUBLE", setAPlus, "HALF", "QUARTER", "NOTHING"]
    : ["DOUBLE", setBPlus, setBPlus, "QUARTER", "NOTHING"];
}

function formatSpecialBox23Effect(effect) {
  if (!effect) return "";
  if (effect === "DOUBLE" || effect === "MONEY BACK" || effect === "HALF" || effect === "QUARTER" || effect === "NOTHING") return effect;
  const m = String(effect).match(/^\+([£$])(\d[\d,]*)$/);
  if (!m) return String(effect);
  const amount = Number(m[2].replace(/,/g, ""));
  return `+${m[1]}${amount.toLocaleString("en-GB")}`;
}

function getSpecialBox23Type(effects) {
  // The special Box 23 set is fixed for the whole game. Set A contains one
  // bonus outcome; Set B contains that same bonus outcome twice. The 2x is
  // purely descriptive and never changes the actual Box 23 effect.
  if (!Array.isArray(effects)) return "";

  const moneyEffects = effects.filter(e => /^\+([£$])\d[\d,]*$/.test(String(e)));

  if (moneyEffects.length >= 2 && moneyEffects.every(e => e === moneyEffects[0])) {
    return `2x ${formatSpecialBox23Effect(moneyEffects[0])}`;
  }

  if (moneyEffects.length >= 1) {
    return formatSpecialBox23Effect(moneyEffects[0]);
  }

  // Never expose a normal/non-special label for a Special Game. If state is
  // somehow malformed, derive the correct special bonus from the active set
  // rather than returning "Standard" or "Special".
  const boxSet = getActiveBoxSet();
  const specialBonus = boxSet === "US" ? "+$50,000" : boxSet === "C4" ? "+£20,000" : "+£10,000";
  return specialBonus;
}

function specialMechanicsText() {
  const g = app.game;
  if (!g?.specialGame) return [];
  const lines = ["Special Game!"];
  if (g.specialAmounts) lines.push("Boosted Boxes");
  if (g.specialLookMode === "CLOWN") lines.push("Clown Game");
  else if (g.specialLookMode === "SECOND_CHANCE") lines.push("Second Chance Button Game");
  const box23Type = getSpecialBox23Type(g.specialBox23Effects);
  lines.push((isUS() ? "Golden Case: " : "Box 23: ") + box23Type);
  return lines;
}

function bankerDebug(label, data = {}) {
  console.log(`[BANKER DEBUG] ${label}`, data);
}

function bankerDebugSummary(g, label = "state") {
  if (!g) return;
  const knownIds = [...(g.bankerKnownBoxIds || new Set())];
  const known = knownIds.map(id => {
    const b = g.boxes?.find(x => x.id === id);
    return b ? { box: id + 1, value: b.value } : { box: id + 1, value: null };
  });
  if (g.bankerLookedAtPlayer && g.playerBox) {
    known.push({ box: g.playerBox.id + 1, value: g.playerBox.value, playerBox: true });
  }
  bankerDebug(label, {
    lyingChance: g.bankerLyingChance,
    knownCount: known.length,
    known,
    offer: g.offer,
    fairOffer: g.fairOfferBeforeRandomness,
    bankerWantsDeal: g.bankerWantsDeal,
    bankerLookResolved: g.bankerLookResolved,
    specialLookMode: g.specialLookMode,
    round: displayRound(g.roundIndex),
    remaining: g.unopenedNon23().length
  });
}

function getBankerStatementForValue(value, offer, values, claimedHigher) {
  // LOWER includes amounts equal to the offer. HIGHER is strictly above it.
  const sideValues = values.filter(v => claimedHigher ? v > offer : v <= offer);
  const unique = [...new Set(sideValues)].sort((a, b) => a - b);

  if (!sideValues.length) return `contains ${formatMoney(value)}`;

  const allBlue = sideValues.every(v => v < 1000);
  const allRed = sideValues.every(v => v >= 1000);

  if (allBlue) return "is a blue";
  if (allRed) return "is a red";
  if (unique.length === 1) return `contains ${formatMoney(unique[0])}`;

  return claimedHigher
    ? `contains at least ${formatMoney(Math.min(...sideValues))}`
    : `contains at most ${formatMoney(Math.max(...sideValues))}`;
}

function bankerClaimIsPossible(value, offer, values, claimHigher) {
  const possible = claimHigher
    ? values.some(v => v > offer)
    : values.some(v => v <= offer);
  return possible;
}

function bankerClaimGenerationPath(value, offer, values, claim) {
  const actualHigher = value > offer;
  const lower = values.filter(v => v <= offer);
  const higher = values.filter(v => v > offer);
  const redsLower = lower.filter(v => v >= 1000);
  const blues = values.filter(v => v < 1000);
  const isLie = !!claim?.lying;

  // These labels mirror the branch ordering inside getBankerClaimForValue().
  if (!isLie) {
    if (value < 1000 && redsLower.length >= 1) {
      return claim?.rule?.type === "max"
        ? "TRUTH -> special blue + red-in-LOWER -> 50% max"
        : "TRUTH -> special blue + red-in-LOWER -> blue";
    }
    if (value >= 1000 && value <= offer && blues.length >= 2) {
      return claim?.rule?.type === "max"
        ? "TRUTH -> special red-in-LOWER + >=2 blues -> 50% max"
        : "TRUTH -> special red-in-LOWER + >=2 blues -> red";
    }
    if (value > offer && value >= 1000 && blues.length >= 2) {
      return higher.length === 1
        ? "TRUTH -> special HIGHER red + >=2 blues -> exact only HIGHER"
        : "TRUTH -> special HIGHER red + >=2 blues -> minimum HIGHER";
    }
    if (!actualHigher) {
      if (lower.length === 1) return "TRUTH -> LOWER fallback -> exact only LOWER";
      if (higher.length && lower.length &&
          Math.min(...higher) >= 1000 && Math.max(...lower) < 1000) {
        return "TRUTH -> LOWER fallback -> blue colour split";
      }
      return "TRUTH -> LOWER fallback -> maximum LOWER";
    }
    if (higher.length === 1) return "TRUTH -> HIGHER fallback -> exact only HIGHER";
    if (higher.length && lower.length &&
        Math.min(...higher) >= 1000 && Math.max(...lower) < 1000) {
      return "TRUTH -> HIGHER fallback -> red colour split";
    }
    return "TRUTH -> HIGHER fallback -> minimum HIGHER";
  }

  if (value < 1000 && redsLower.length >= 1) {
    return higher.length && claim?.rule?.type === "min"
      ? "LIE -> special blue + red-in-LOWER -> minimum HIGHER"
      : "LIE -> special blue + red-in-LOWER -> red";
  }
  if (value >= 1000 && value <= offer && blues.length >= 2) {
    return higher.length && claim?.rule?.type === "min"
      ? "LIE -> special red-in-LOWER + >=2 blues -> minimum HIGHER"
      : "LIE -> special red-in-LOWER + >=2 blues -> blue";
  }
  if (value > offer && value >= 1000 && blues.length >= 2) {
    return "LIE -> special HIGHER red + >=2 blues -> blue";
  }
  if (!actualHigher) {
    if (higher.length === 1) return "LIE -> LOWER fallback -> exact only HIGHER";
    if (higher.length && lower.length &&
        Math.min(...higher) >= 1000 && Math.max(...lower) < 1000) {
      return "LIE -> LOWER fallback -> red colour split";
    }
    return "LIE -> LOWER fallback -> minimum HIGHER";
  }
  if (lower.length === 1) return "LIE -> HIGHER fallback -> exact only LOWER";
  if (higher.length && lower.length &&
      Math.min(...higher) >= 1000 && Math.max(...lower) < 1000) {
    return "LIE -> HIGHER fallback -> blue colour split";
  }
  return "LIE -> HIGHER fallback -> maximum LOWER";
}

function getBankerClaimForValue(value, offer, values, lyingChance, forceLie = null) {
  const actualHigher = value > offer;
  const chance = constrain(Number(lyingChance ?? app.game?.bankerLyingChance ?? 0.60), 0, 1);
  const shouldLie = forceLie === null ? (random() < chance) : !!forceLie;
  const opposite = !actualHigher;
  const oppositePossible = bankerClaimIsPossible(value, offer, values, opposite);

  if (!shouldLie || !oppositePossible) {
    const lower = values.filter(v => v <= offer);
    const higher = values.filter(v => v > offer);
    const redsLower = lower.filter(v => v >= 1000);
    const blues = values.filter(v => v < 1000);

    bankerDebug("truth-rule counts", {
      value,
      offer,
      lowerCount: lower.length,
      higherCount: higher.length,
      bluesCount: blues.length,
      redsLowerCount: redsLower.length,
      highestLower: lower.length ? Math.max(...lower) : null,
      lowestHigher: higher.length ? Math.min(...higher) : null
    });

    // Special truth-telling logic. These cases deliberately take priority
    // over the generic colour shortcuts in getBankerStatementForValue().
    if (value < 1000 && redsLower.length >= 1) {
      if (random() < 0.5 && lower.length) {
        const threshold = Math.max(...lower);
        return {
          claimHigher: false,
          statement: `contains at most ${formatMoney(threshold)}`,
          rule: { type: "max", value: threshold },
          lying: false,
        };
      }
      return {
        claimHigher: false,
        statement: "is a blue",
        rule: { type: "blue" },
        lying: false,
      };
    }

    if (value >= 1000 && value <= offer && blues.length >= 2) {
      if (random() < 0.5 && lower.length) {
        const threshold = Math.max(...lower);
        return {
          claimHigher: false,
          statement: `contains at most ${formatMoney(threshold)}`,
          rule: { type: "max", value: threshold },
          lying: false,
        };
      }
      return {
        claimHigher: false,
        statement: "is a red",
        rule: { type: "red" },
        lying: false,
      };
    }

    if (value > offer && value >= 1000 && blues.length >= 2) {
      const threshold = Math.min(...higher);
      if (higher.length === 1) {
        return {
          claimHigher: true,
          statement: `contains ${formatMoney(threshold)}`,
          rule: { type: "exact", value: threshold },
          lying: false,
        };
      }
      return {
        claimHigher: true,
        statement: `contains at least ${formatMoney(threshold)}`,
        rule: { type: "min", value: threshold },
        lying: false,
      };
    }

    // Truthful fallback follows the requested LOWER/HIGHER rules directly.
    if (!actualHigher) {
      if (lower.length === 1) {
        const amount = lower[0];
        return {
          claimHigher: false,
          statement: `contains ${formatMoney(amount)}`,
          rule: { type: "exact", value: amount },
          lying: false,
        };
      } else if (
        higher.length &&
        lower.length &&
        Math.min(...higher) >= 1000 &&
        Math.max(...lower) < 1000
      ) {
        return {
          claimHigher: false,
          statement: "is a blue",
          rule: { type: "blue" },
          lying: false,
        };
      } else {
        const threshold = Math.max(...lower);
        return {
          claimHigher: false,
          statement: `contains at most ${formatMoney(threshold)}`,
          rule: { type: "max", value: threshold },
          lying: false,
        };
      }
    }

    if (higher.length === 1) {
      const amount = higher[0];
      return {
        claimHigher: true,
        statement: `contains ${formatMoney(amount)}`,
        rule: { type: "exact", value: amount },
        lying: false,
      };
    } else if (
      higher.length &&
      lower.length &&
      Math.min(...higher) >= 1000 &&
      Math.max(...lower) < 1000
    ) {
      return {
        claimHigher: true,
        statement: "is a red",
        rule: { type: "red" },
        lying: false,
      };
    } else {
      const threshold = Math.min(...higher);
      return {
        claimHigher: true,
        statement: `contains at least ${formatMoney(threshold)}`,
        rule: { type: "min", value: threshold },
        lying: false,
      };
    }
  }

  const lower = values.filter(v => v <= offer);
  const higher = values.filter(v => v > offer);
  const redsLower = lower.filter(v => v >= 1000);
  const blues = values.filter(v => v < 1000);

  // Special lying logic.
  if (value < 1000 && redsLower.length >= 1) {
    if (higher.length && random() < 0.5) {
      const threshold = Math.min(...higher);
      if (higher.length === 1) {
        return {
          claimHigher: true,
          statement: `contains ${formatMoney(threshold)}`,
          rule: { type: "exact", value: threshold },
          lying: true,
        };
      }
      return {
        claimHigher: true,
        statement: `contains at least ${formatMoney(threshold)}`,
        rule: { type: "min", value: threshold },
        lying: true,
      };
    }
    return {
      claimHigher: true,
      statement: "is a red",
      rule: { type: "red" },
      lying: true,
    };
  }

  if (value >= 1000 && value <= offer && blues.length >= 2) {
    if (higher.length && random() < 0.5) {
      const threshold = Math.min(...higher);
      if (higher.length === 1) {
        return {
          claimHigher: true,
          statement: `contains ${formatMoney(threshold)}`,
          rule: { type: "exact", value: threshold },
          lying: true,
        };
      }
      return {
        claimHigher: true,
        statement: `contains at least ${formatMoney(threshold)}`,
        rule: { type: "min", value: threshold },
        lying: true,
      };
    }
    return {
      claimHigher: false,
      statement: "is a blue",
      rule: { type: "blue" },
      lying: true,
    };
  }

  if (value > offer && value >= 1000 && blues.length >= 2) {
    return {
      claimHigher: false,
      statement: "is a blue",
      rule: { type: "blue" },
      lying: true,
    };
  }

  // Fallback lying logic exactly follows LOWER/HIGHER definitions.
  if (!actualHigher) {
    if (higher.length === 1) {
      const amount = higher[0];
      return {
        claimHigher: true,
        statement: `contains ${formatMoney(amount)}`,
        rule: { type: "exact", value: amount },
        lying: true,
      };
    } else if (
      higher.length &&
      lower.length &&
      Math.min(...higher) >= 1000 &&
      Math.max(...lower) < 1000
    ) {
      return {
        claimHigher: true,
        statement: "is a red",
        rule: { type: "red" },
        lying: true,
      };
    } else {
      const threshold = Math.min(...higher);
      return {
        claimHigher: true,
        statement: `contains at least ${formatMoney(threshold)}`,
        rule: { type: "min", value: threshold },
        lying: true,
      };
    }
  }

  if (lower.length === 1) {
    const amount = lower[0];
    return {
      claimHigher: false,
      statement: `contains ${formatMoney(amount)}`,
      rule: { type: "exact", value: amount },
      lying: true,
    };
  } else if (
    higher.length &&
    lower.length &&
    Math.min(...higher) >= 1000 &&
    Math.max(...lower) < 1000
  ) {
    return {
      claimHigher: false,
      statement: "is a blue",
      rule: { type: "blue" },
      lying: true,
    };
  } else {
    const threshold = Math.max(...lower);
    return {
      claimHigher: false,
      statement: `contains at most ${formatMoney(threshold)}`,
      rule: { type: "max", value: threshold },
      lying: true,
    };
  }
}

function bankerClaimsCompatible(claims, ids, values) {
  const rules = ids.map(id => claims.get(id)?.rule).filter(Boolean);
  if (!rules.length) return true;
  // Check whether the statements could all simultaneously be true for
  // distinct boxes using the values currently on the live board. This stops
  // the intended lie count from producing mutually contradictory lies (for
  // example, two different boxes both claiming the only £500,000 box).
  const candidates = rules.map(rule => values.filter(v => bankerRuleHolds(rule, v)));
  if (candidates.some(a => !a.length)) return false;
  const order = candidates.map((a, i) => i).sort((a, b) => candidates[a].length - candidates[b].length);
  const used = new Set();
  function dfs(pos) {
    if (pos >= order.length) return true;
    const idx = order[pos];
    for (const value of candidates[idx]) {
      const key = `${idx}:${value}`;
      // A money amount can only occupy one inspected box when it occurs once.
      // For duplicate amounts, allow as many copies as exist on the board.
      const usedCount = [...used].filter(k => k.endsWith(`:${value}`)).length;
      const availableCount = values.filter(v => v === value).length;
      if (usedCount >= availableCount) continue;
      used.add(key);
      if (dfs(pos + 1)) return true;
      used.delete(key);
    }
    return false;
  }
  return dfs(0);
}

function chooseBankerClaims(ids, valuesById, offer, lyingChance) {
  const n = ids.length;
  const values = [...valuesById.values()];
  const claims = new Map();
  if (!n) return claims;

  const chance = constrain(Number(lyingChance ?? app.game?.bankerLyingChance ?? 0.60), 0, 1);
  const intendedLieIds = shuffle(ids.filter(() => random() < chance));
  const lieIdSet = new Set(intendedLieIds);
  const lieIds = [];

  // Start with truthful claims so there is always a coherent fallback.
  ids.forEach(id => {
    const value = valuesById.get(id);
    claims.set(id, getBankerClaimForValue(value, offer, values, chance, false));
  });

  // Try to honour the intended lie count, but reduce it whenever the proposed
  // lies would make the set of statements logically impossible together.
  for (const id of intendedLieIds) {
    const value = valuesById.get(id);
    const candidate = getBankerClaimForValue(value, offer, values, chance, true);
    const previous = claims.get(id);
    claims.set(id, candidate);
    if (candidate.lying && bankerClaimsCompatible(claims, ids, values)) {
      lieIds.push(id);
    } else {
      claims.set(id, previous);
    }
  }

  bankerDebug('claims resolved', {
    knownCount: n,
    lyingChance: chance,
    intendedLieCount: intendedLieIds.length,
    lieCount: lieIds.length,
    lieIds: lieIds.map(id => id + 1)
  });
  return claims;
}
function resolveBankerClaimsForCurrentOffer(g, force = false, onlyIds = null) {
  if (!g?.specialGame || !g.offer) return;
  const valuesById = new Map(g.unopenedNon23().map(b => [b.id, b.value]));
  const allIds = [...(g.bankerKnownBoxIds || new Set())].filter(id => valuesById.has(id));
  if (g.bankerLookedAtPlayer && g.playerBox && !allIds.includes(g.playerBox.id)) allIds.push(g.playerBox.id);
  const ids = onlyIds ? allIds.filter(id => onlyIds.has(id)) : allIds;
  if (!ids.length) return;

  const idsToGenerate = ids.filter(id => {
    const hasClaim = g.bankerLookedAtPlayer && g.playerBox?.id === id
      ? g.bankerPlayerClaim !== null && g.bankerPlayerClaim !== undefined
      : g.bankerClaimByBoxId.has(id);
    return force || !hasClaim;
  });
  if (!idsToGenerate.length) return;

  const claims = chooseBankerClaims(idsToGenerate, valuesById, g.offer, g.bankerLyingChance);
  idsToGenerate.forEach(id => {
    const claim = claims.get(id);
    if (!claim) return;
    if (g.bankerLookedAtPlayer && g.playerBox?.id === id) {
      g.bankerPlayerClaimHigher = claim.claimHigher;
      g.bankerPlayerClaim = claim;
    } else {
      g.bankerClaimHigherByBoxId.set(id, claim.claimHigher);
      g.bankerClaimByBoxId.set(id, claim);
    }
  });
}

function getBankerStatementRule(value, offer, values, claimedHigher) {
  const sideValues = values.filter(v => claimedHigher ? v > offer : v <= offer);
  const unique = [...new Set(sideValues)].sort((a, b) => a - b);

  if (!sideValues.length) return { type: "exact", value };

  const allBlue = sideValues.every(v => v < 1000);
  const allRed = sideValues.every(v => v >= 1000);
  if (allBlue) return { type: "blue" };
  if (allRed) return { type: "red" };
  if (unique.length === 1) return { type: "exact", value: unique[0] };

  return claimedHigher
    ? { type: "min", value: Math.min(...sideValues) }
    : { type: "max", value: Math.max(...sideValues) };
}

function bankerRuleHolds(rule, value) {
  if (!rule) return true;
  if (rule.type === "exact") return value === rule.value;
  if (rule.type === "min") return value >= rule.value;
  if (rule.type === "max") return value <= rule.value;
  if (rule.type === "red") return value >= 1000;
  if (rule.type === "blue") return value < 1000;
  return true;
}

function bankerStatementProofStatus(snapshot, targetId, openedBox) {
  if (!snapshot) return "none";
  const rule = snapshot.rule;

  // If the inspected box itself is revealed, the statement is directly
  // proven true or false by its actual value.
  if (openedBox && targetId === openedBox.id) {
    return bankerRuleHolds(rule, openedBox.value) ? "right" : "wrong";
  }

  // Otherwise, use the remaining board. A statement is proven wrong when no
  // remaining value can satisfy it, and proven right when every remaining
  // value satisfies it.
  const liveValues = app.game.unopenedNon23().map(b => b.value);
  if (!liveValues.length) return "none";
  const possible = liveValues.some(v => bankerRuleHolds(rule, v));
  const guaranteed = liveValues.every(v => bankerRuleHolds(rule, v));
  if (!possible) return "wrong";
  if (guaranteed) return "right";
  return "none";
}

function bankerLookedAtText() {
  const g = app.game;
  if (!g?.specialGame || (!g.bankerKnownBoxIds?.size && !g.bankerLookedAtPlayer)) return [];

  const live = g.unopenedNon23();
  const values = live.map(b => b.value);
  const lines = [];
  const boxWord = isUS() ? "case" : "box";
  const knownIds = [...(g.bankerKnownBoxIds || new Set())]
    .filter(id => live.some(b => b.id === id))
    .sort((a,b) => a-b);

  resolveBankerClaimsForCurrentOffer(g);

  const renderClaim = (id, value, isPlayer = false) => {
    const claimHigher = isPlayer ? g.bankerPlayerClaimHigher : g.bankerClaimHigherByBoxId.get(id);
    const claim = isPlayer ? g.bankerPlayerClaim : g.bankerClaimByBoxId.get(id);
    const actualHigher = value > g.offer;
        bankerDebug('specific Banker statement', {
      box: id + 1,
      playerBox: isPlayer,
      value,
      offer: g.offer,
      actual: actualHigher ? 'HIGHER' : 'LOWER',
      claim: claimHigher === null ? 'LOWER' : (claimHigher ? 'HIGHER' : 'LOWER'),
      lying: actualHigher !== claimHigher,
      knownCount: g.bankerKnownBoxIds.size + (g.bankerLookedAtPlayer ? 1 : 0)
    });

    // Once the Banker has said what he saw, he keeps that exact statement.
    // A changed offer does NOT make him change his story; only proof that he
    // was wrong is allowed to invalidate the snapshot and cause a new claim.
    const previous = isPlayer ? g.bankerPlayerClaimSnapshot : g.bankerClaimSnapshotByBoxId.get(id);

    // Explicitly identify which route produced the text. This is especially
    // useful when the current offer has changed since the Banker looked:
    // the statement may be a cached snapshot based on an earlier offer.
    const statementPath = previous
      ? "CACHED SNAPSHOT -> previous.statement"
      : claim?.statement
        ? "NEW CLAIM -> claim.statement"
        : "FALLBACK -> getBankerStatementForValue()";

    const statementOffer = previous?.offer ?? claim?.offer ?? g.offer;
    const statementValues = previous?.values ?? claim?.values ?? values;
    const statementClaimHigher = previous?.claimHigher ?? claim?.claimHigher ?? claimHigher;

    const statement = previous?.statement ?? claim?.statement ?? getBankerStatementForValue(value, g.offer, values, claimHigher);
    const effectiveClaimHigher = previous ? previous.claimHigher : (claim?.claimHigher ?? claimHigher);
    const effectiveRule = previous?.rule ?? claim?.rule ?? getBankerStatementRule(value, g.offer, values, effectiveClaimHigher);
    bankerDebug("Banker statement rendered", {
      box: id + 1,
      value,
      offer: g.offer,
      actualHigher,
      claimHigher: effectiveClaimHigher,
      actual: actualHigher ? "HIGHER" : "LOWER",
      claim: effectiveClaimHigher === null ? "LOWER" : (effectiveClaimHigher ? "HIGHER" : "LOWER"),
      lying: actualHigher !== effectiveClaimHigher,
      statementPath,
      statementOffer,
      statementActual: value > statementOffer ? "HIGHER" : "LOWER",
      statementClaim: statementClaimHigher ? "HIGHER" : "LOWER",
      currentOfferDiffersFromStatementOffer: g.offer !== statementOffer,
      generationPath: previous?.generationPath ?? bankerClaimGenerationPath(value, statementOffer, statementValues, claim),
      statement
    });
    const snapMap = isPlayer ? null : g.bankerClaimSnapshotByBoxId;
    const isNewStatement = g.bankerNewStatementBoxIds?.has(id);
    const everSpoken = isPlayer ? !!g.bankerEverSpokenPlayer : !!g.bankerEverSpokenBoxIds?.has(id);
    // A genuinely first-time statement says "He says". A replacement after
    // the Banker has already spoken about that box says "He now says".
    // Otherwise the cached statement is introduced with "Previously, he said".
    const prefix = isNewStatement
      ? (everSpoken ? "He now says" : "He says")
      : (everSpoken ? "Previously, he said" : "He says");
    const subject = isPlayer ? "your box" : `${boxWord} ${id + 1}`;

    // Always retain the actual value that was inspected. The previous
    // implementation used previous?.value here, which meant the first
    // statement for a newly inspected box stored null and could never be
    // recognised later when that box was opened as proof of a lie.
    if (!previous) {
      const snapshot = {
        value,
        claimHigher: effectiveClaimHigher,
        offer: g.offer,
        statement,
        rule: effectiveRule,
        proofStatus: "none",
        generationPath: bankerClaimGenerationPath(value, g.offer, values, claim)
      };
      if (isPlayer) {
        g.bankerPlayerClaimSnapshot = snapshot;
        g.bankerEverSpokenPlayer = true;
      } else {
        snapMap.set(id, snapshot);
        g.bankerEverSpokenBoxIds.add(id);
      }
    }

    return `${prefix} ${subject} ${statement}`;
  };

  const allKnown = knownIds.map(id => `${boxWord} ${id + 1}`);
  if (g.bankerLookedAtPlayer && g.playerBox) allKnown.push("your box");
  // The introductory line is shown only once for the Clown/Banker look.
  // If a statement is later proved wrong, the statements are rerolled, but
  // the Banker has not performed another physical look, so do not repeat this.
  if (allKnown.length && !g.bankerLookedAtShown) {
    lines.push(`The Banker looked at ${allKnown.join(", ")}.`);
    g.bankerLookedAtShown = true;
  }

  knownIds.forEach(id => {
    const box = live.find(b => b.id === id);
    if (box) lines.push(renderClaim(id, box.value));
  });

  if (g.bankerLookedAtPlayer && g.playerBox) {
    lines.push(renderClaim(g.playerBox.id, g.playerBox.value, true));
  }

  g.bankerLookJustChanged = false;
  g.bankerLookRevealPending = false;
  g.bankerNewStatementBoxIds = new Set();
  return lines;
}

function parseFormattedMoneyValue(text) {
  const s = String(text).trim();
  if (/^\d+p$/.test(s)) return Number(s.slice(0, -1)) / 100;
  const m = s.match(/^[£$]([\d,]+(?:\.\d+)?)$/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

function bankerStatementWasProvenWrong(snapshot, openedValue) {
  if (!snapshot) return false;

  // The snapshot contains the offer and the actual claim direction that was
  // made when the Banker looked. Test the claim against the value revealed
  // later, not against the value originally inspected.
  if (snapshot.claimHigher === null || snapshot.claimHigher === undefined) {
    return openedValue !== snapshot.value;
  }

  const actualHigher = openedValue > snapshot.offer;
  return actualHigher !== snapshot.claimHigher;
}

function maybeRecalculateBankerLyingChanceAfterProof(openedBox) {
  const g = app.game;
  if (!g || !g.specialGame || !openedBox) return;

  // Opening a box can make a statement about a different inspected box
  // impossible or guaranteed. Evaluate each statement independently, but
  // only regenerate the statement(s) that have themselves just become
  // proven. A proof about Box 5 must never regenerate Box 8's statement.
  const snapshots = [];
  for (const [id, snapshot] of g.bankerClaimSnapshotByBoxId.entries()) {
    snapshots.push({ id, snapshot, isPlayer: false });
  }
  if (g.bankerPlayerClaimSnapshot && g.playerBox) {
    snapshots.push({ id: g.playerBox.id, snapshot: g.bankerPlayerClaimSnapshot, isPlayer: true });
  }
  if (!snapshots.length) return;

  const newlyProven = [];
  for (const item of snapshots) {
    const status = bankerStatementProofStatus(item.snapshot, item.id, openedBox);
    if ((status === "wrong" || status === "right") && item.snapshot.proofStatus !== status) {
      newlyProven.push({ ...item, status });
    }
    // Record the current proof state so the same statement is not reevaluated
    // and rerolled on every later box opening.
    item.snapshot.proofStatus = status;
  }

  if (!newlyProven.length) return;

  bankerDebug("Banker statements proven - rerolling specific statements", {
    mode: g.specialLookMode,
    boxes: newlyProven.map(x => ({ box: x.id + 1, playerBox: x.isPlayer, status: x.status }))
  });

  // A proof changes the Banker's honesty roll. All unaffected statements keep
  // their existing cached wording and claim.
  g.bankerLyingChance = g.rollBankerLyingChance();
  if (!g.bankerNewStatementBoxIds) g.bankerNewStatementBoxIds = new Set();

  for (const { id, isPlayer, snapshot, status } of newlyProven) {
    g.bankerNewStatementBoxIds.add(id);

    if (isPlayer) {
      g.bankerPlayerClaimHigher = null;
      g.bankerPlayerClaim = null;
      g.bankerPlayerClaimSnapshot = null;
    } else {
      g.bankerClaimHigherByBoxId.delete(id);
      g.bankerClaimByBoxId.delete(id);
      g.bankerClaimSnapshotByBoxId.delete(id);
    }

    bankerDebug(`Banker statement proved ${status} - specific claim rerolled`, {
      box: id + 1,
      openedBox: openedBox.id + 1,
      openedValue: openedBox.value,
      statement: snapshot.statement,
      lyingChance: g.bankerLyingChance,
      knownCount: g.bankerKnownBoxIds.size + (g.bankerLookedAtPlayer ? 1 : 0)
    });
  }

  g.bankerLookJustChanged = true;
  g.bankerLookRevealPending = true;
  g.bankerLookPresentationNew = true;

  // Regenerate only the statements which were just proven. Every other
  // statement remains cached and unchanged.
  resolveBankerClaimsForCurrentOffer(g, true, new Set(newlyProven.map(x => x.id)));
}

function getCounterOfferChance(counter, offer, fair, mean) {
  if (counter > mean) return 0;
  const base = Math.max(offer, fair);
  if (counter <= base) return 1;
  return constrain(1 - (counter - base) / (base * 0.5), 0, 1);
}


function getBoardSafetyDetails(remaining) {
  if (!remaining || remaining.length < 2) {
    return {
      remainingCount: remaining?.length ?? 0,
      remainingValues: remaining ? [...remaining] : [],
      logSD: 0,
      spreadRisk: 0,
      total: remaining?.reduce((a, b) => a + b, 0) ?? 0,
      maxVal: remaining?.length ? Math.max(...remaining) : 0,
      maxShare: 0,
      equalShare: 0,
      concentrationRatio: 0,
      concentrationRisk: 0,
      valueProgress: 0,
      valueRisk: 0,
      spreadContribution: 0,
      concentrationContribution: 0,
      valueContribution: 0,
      risk: 0,
      baseSafety: 1,
      extremeRisk: 0,
      extremePenalty: 0,
      safetyBeforeConstraint: 1,
      safety: 1
    };
  }

  const n = remaining.length;

  // 1. Overall logarithmic spread
  const logs = remaining.map(v =>
    Math.log10(Math.max(v, 0.01))
  );

  const logMean =
    logs.reduce((a, b) => a + b, 0) / n;

  const logVariance =
    logs.reduce((sum, v) => sum + (v - logMean) ** 2, 0) / n;

  const logSD = Math.sqrt(logVariance);

  const spreadRisk =
    constrain(logSD / 4, 0, 1);

  // 2. Largest-box concentration
  const total =
    remaining.reduce((a, b) => a + b, 0);

  const maxVal = Math.max(...remaining);

  const maxShare = total > 0 ? maxVal / total : 0;
  const equalShare = 1 / n;

  const concentrationRatio =
    equalShare > 0 ? maxShare / equalShare : 0;

  const concentrationRisk =
    concentrationRatio > 0
      ? constrain(
          Math.log10(concentrationRatio) / Math.log10(n),
          0,
          1
        )
      : 0;

  // 3. Expected-utility / jackpot effect
  const valueProgress =
    Math.log10(Math.max(maxVal, 1000) / 1000) / 6;

  const valueRisk =
    constrain(valueProgress ** 2, 0, 1);

  // 4. Weighted overall risk
  const spreadContribution = 0.70 * spreadRisk;
  const concentrationContribution = 0.20 * concentrationRisk;
  const valueContribution = 0.10 * valueRisk;

  const risk =
    spreadContribution +
    concentrationContribution +
    valueContribution;

  // 5. Convert risk into safety
  const baseSafety = 1 - 0.60 * risk;

  const extremeRisk =
    Math.max(0, risk - 0.85) / 0.15;

  const extremePenalty =
    0.10 * Math.pow(extremeRisk, 3);

  const safetyBeforeConstraint =
    baseSafety - extremePenalty;

  const safety =
    constrain(safetyBeforeConstraint, 0, 1);

  return {
    remainingCount: n,
    remainingValues: [...remaining],
    logMean,
    logSD,
    logVariance,
    spreadRisk,
    total,
    maxVal,
    maxShare,
    equalShare,
    concentrationRatio,
    concentrationRisk,
    valueProgress,
    valueRisk,
    spreadContribution,
    concentrationContribution,
    valueContribution,
    risk,
    baseSafety,
    extremeRisk,
    extremePenalty,
    safetyBeforeConstraint,
    safety
  };
}

// Preserve the existing interface for all other parts of the game.
function getBoardSafety(remaining) {
  return getBoardSafetyDetails(remaining).safety;
}


function getRounds() {
  // Start every game on the normal round structure. If the player actually
  // reaches the live-play Clown Game, switch to the shortened post-Clown
  // structure from that point onward. A player who has already dealt does
  // not get the shortened Clown structure for any subsequent/hypothetical
  // flow. The shortened structure remains active after a Clown Game even if
  // the player subsequently deals; dealing must not restore the old round
  // schedule.
  if (app.game?.specialGame &&
      app.game.specialLookMode === "CLOWN" &&
      app.game.clownGameRoundsActive) {
    if (isUS()) return CFG.baseRoundsUS;
    return [5, 3, 3, 3, 3, 1, 1, 1];
  }

  if (isUS()) return CFG.baseRoundsUS;
  return app.settings.useITVRounds ? CFG.baseRoundsITV : CFG.baseRoundsC4;
}

function getMoneyCount() {
  // money cases on the board (not counting Golden/Box23)
  return isUS() ? 26 : 22;
}

function getJackpotCountLimit(boxSet = getActiveBoxSet()) {
  return boxSet === "US" ? 13 : 11;
}

function getJackpotCount(boxSet = getActiveBoxSet()) {
  const limit = getJackpotCountLimit(boxSet);
  const saved = Number(app.settings.jackpotChaseNext?.[boxSet]);
  return constrain(Number.isFinite(saved) ? Math.floor(saved) : 1, 1, limit);
}

function getBoardAmountsForGame(boxSet = getActiveBoxSet()) {
  const amounts = boxSet === "C4"
    ? [...CFG.amountsC4]
    : boxSet === "US"
      ? [...CFG.amountsUS]
      : [...CFG.amountsITV];

  if (!app.settings.jackpotChase) return amounts;

  const jackpotCount = getJackpotCount(boxSet);
  if (jackpotCount <= 1) return amounts;

  const sorted = [...amounts].sort((a, b) => b - a);
  const jackpot = sorted[0];
  const replace = new Set(sorted.slice(1, jackpotCount));

  return amounts.map(value => replace.has(value) ? jackpot : value);
}

function getGoldenEffects() {
  if (isUS()) return CFG.goldenEffectsUS;
  if (isC4()) return CFG.goldenEffectsC4;
  return CFG.goldenEffectsITV;
}

//
// =======================
// 6) GAME MODEL
// =======================
//
class GameModel {
  constructor() {
    this.history = [];
    this.moodHistory = [];
    this.resetRuntime();

    this.scrollOffset ??= 0;
    this.statsHeight ??= 0;
  }

  resetRuntime() {
    this.boxes = [];
    this.playerBox = null;

    this.jackpotChaseActive = false;
    this.jackpotCount = 1;
    this.startLogMean = null;

    this.boxSetAtStart = null;

    this.moneyCount = getMoneyCount(); // 22 or 26
    this.goldenIndex = this.moneyCount; // last box is Golden/Box23

    this.roundIndex = 0;
    this.boxesToOpen = 0;
    this.roundBoxesToOpen = 0;
    this.currentRoundOpened = [];
    this.lastRoundOpened = [];

    this.redRun = 0;
    this.blueRun = 0;
    this.power5Run = 0;
    this.bankersPower5Run = 0;
    this.jackpotRun = 0;

    this.roundLargeClaps = 0;
    this.roundGroans = 0;    

    this.offer = 0;
    this.highestOffer = 0;
    this.lowestOffer = Infinity;

    this.bankerMood = this.getStartingMood();

    this.offerHistory = [];
    this.topOfGameLastShownOfferIndex = -1;
    this.offerIsTopOfGame = false;
    this.nextOfferHistoryType = null;
    this.midRoundOfferCount = 0;
    this.counterOfferCount = 0;

    this.dealAccepted = null;
    this.box23Accepted = null;

    this.initialTakenHome = null;
    this.finalTakeHome = null;

    this.result = null;

    this.buttonGameLower = null;
    this.buttonGameUpper = null;

    this.buttonGameSuccess = null;
    this.buttonGameOfferHidden = false;
    this.guessInput = "";
    this.midRoundOfferUsed = false;
    this.randomMidOfferUsed = false;
    this.offerDecisionPending = false;
    this.offerDecisionToken = 0;
    this.midOfferPending = false;
    this.midOfferFromRandom = false;
    this.randomMidOfferTriggered = false;
    this.midRoundMultiplier = 1;
    this.midOfferPenalty = 1;
    this.midOfferFromButtonGame = false;
    this.midOfferReason = null;
    this.canShowMidOffer = false;
    this.counterOfferUsed = false;
    this.counterOfferExtraUsed = false;
    this.counterOfferInput = "";
    this.counterOfferBase = 0;
    this.counterOfferMean = 0;
    this.counterOfferRejected = false;
    this.counterOfferResult = null;
    this.counterOfferAccepted = false;
    this.secondButtonGameAttempted = false;
    this.secondButtonGameSuccess = null;
    this.secondButtonGameResultHandled = false;
    this.secondButtonGameOriginalOffer = null;
    this.secondButtonGameOfferChanged = null;
    this.bankerLookedAtShown = false;
    this.bankerLookJustChanged = false;
    this.bankerLookRevealPending = false;
    this.bankerLookPresentationNew = false;
    this.bankerLookPresentationLines = [];
    this.bankerNewStatementBoxIds = new Set();
    this.clownBankerStatements = [];
    this.clownStatementOffer = null;
    this.offerRevealingAfterDeal = false;
    this.offerRibbonVisible = false;
    this.clownOfferTransitionPending = false;
    this.bankerClaimHigherByBoxId = new Map();
    this.bankerClaimByBoxId = new Map();
    this.bankerPlayerClaimHigher = null;
    this.bankerPlayerClaim = null;
    this.bankerClaimSnapshotByBoxId = new Map();
    this.bankerEverSpokenBoxIds = new Set();
    this.bankerEverSpokenPlayer = false;
    this.bankerPlayerClaimSnapshot = null;
    this.clownOfferCalculated = false;
    this.clownGameRoundsActive = false;
    this.secondButtonGameOfferTextShown = false;
    this.secondButtonGameOfferText = null;
    this.secondButtonGameOfferPendingCommit = false;

    this.scrollOffset = 0;
    this.gameLogged = false;

    this.roundResolving = false;
    this.lastOpenMs = 0;
    this.pendingOffer = null;
    this.crowdReactionId = 0;
    // Special Game is selected independently for every new game.
    this.specialGame = !!app.settings.enableSpecialGame && random() < 1;
    this.specialAmounts = false;
    this.specialBox23Effects = null;
    this.specialLookMode = null;
    this.specialSecondChanceUsed = false;
    this.clownResults = [];
    this.clownPicked = 0;
    this.clownGameCompleted = false;
    this.bankerLyingChance = 0.60;
    this.bankerWantsDeal = null;
    this.bankerKnownBoxIds = new Set();
    this.bankerLookedAtPlayer = false;
    this.bankerNarrative = null;
    this.bankerLookResolved = false;
  }

  reset(cfg, layout) {
    this.resetRuntime();
    this.boxSetAtStart = app.settings.boxSet;

    const specialAmounts = this.specialGame && !app.settings.jackpotChase && random() < 0.20;
    this.specialAmounts = specialAmounts;
    this.specialLookMode = this.specialGame
      ? (app.settings.enableButtonGame
          ? (random() < 0.5 ? "SECOND_CHANCE" : "CLOWN")
          : "CLOWN")
      : null;
    this.bankerLyingChance = this.specialGame ? this.rollBankerLyingChance() : 0;
    bankerDebug("game lying chance decided", {
      lyingChance: this.bankerLyingChance,
      mood: this.getStartingMood(),
      specialGame: this.specialGame,
      specialLookMode: this.specialLookMode
    });

    let boardAmounts = this.specialGame && specialAmounts
      ? getSpecialAmounts()
      : getBoardAmountsForGame();

    const amounts = shuffle(boardAmounts); // p5 shuffle
    const moneyCount = getMoneyCount();

    this.jackpotChaseActive = !!app.settings.jackpotChase;
    this.jackpotCount = this.jackpotChaseActive ? getJackpotCount() : 0;
    this.startLogMean =
      boardAmounts.reduce((sum, value) => sum + Math.log10(value), 0) /
      boardAmounts.length;
    this.moneyCount = moneyCount;
    this.goldenIndex = moneyCount;

    const cols = CFG.columns;
    const boxSpacingX = windowWidth * 0.015;
    const boxSpacingY = windowWidth * 0.015;
    const margin = windowWidth * 0.015;
    const xStart = margin;
    const yStart = windowHeight * 0.08;

    // money boxes/cases
    for (let i = 0; i < moneyCount; i++) {
      const r = floor(i / cols);
      const c = i % cols;
      const x = xStart + c * (layout.boxW + boxSpacingX);
      const y = yStart + r * (layout.boxH + boxSpacingY);
      this.boxes.push({
        id: i,
        x,
        y,
        opened: false,
        value: amounts[i],
        removed: false,
        openedAt: null,
      });
    }

    // Golden/Box23 placeholder
    this.specialBox23Effects = this.specialGame ? getSpecialBox23Effects() : null;
    const golden = this.specialGame ? random(this.specialBox23Effects) : random(getGoldenEffects());
    // The special game's Clown Game uses the same four-item pick mechanic as the
    // old Clown Game, but displays the opposite box design.
    const clownCount = isUS() ? 5 : 4;
    this.clownResults = shuffle([true, ...Array(clownCount - 1).fill(false)]).map((funny, i) => ({
      id: i, funny, picked: false, opened: false
    }));
    this.clownPicked = 0;
    this.boxes.push({
      id: this.goldenIndex,
      x: windowWidth * (3 / 8),
      y: windowHeight / 2,
      opened: false,
      value: golden,
      removed: false,
      openedAt: null,
    });
  }

  relayout(layout) {
    const cols = CFG.columns;
    const boxSpacingX = windowWidth * 0.015;
    const boxSpacingY = windowWidth * 0.015;
    const margin = windowWidth * 0.015;
    const xStart = margin;
    const yStart = windowHeight * 0.08;

    for (let i = 0; i < this.moneyCount; i++) {
      const r = floor(i / cols);
      const c = i % cols;
      this.boxes[i].x = xStart + c * (layout.boxW + boxSpacingX);
      this.boxes[i].y = yStart + r * (layout.boxH + boxSpacingY);
    }

    this.boxes[this.goldenIndex].x = windowWidth * (3 / 8);
    this.boxes[this.goldenIndex].y = windowHeight / 2;
  }

  saveHistory() {
    localStorage.setItem(
      "pastGames",
      JSON.stringify({
        history: this.history,
        moodHistory: this.moodHistory,
      })
    );
  }

  loadHistory() {
    const raw = localStorage.getItem("pastGames");

    if (!raw) {
      this.history = [];
      this.moodHistory = [];
      return;
    }

    const data = JSON.parse(raw);

    this.history = data.history ?? [];
    this.moodHistory = data.moodHistory ?? [0, 0, 0, 0, 0];
  }

  getStartingMood() {
    const weights = [0.4, 0.27, 0.17, 0.1, 0.06];

    let moodOffset = 0;

    for (let i = 0; i < Math.min(this.moodHistory.length, 5); i++) {
      moodOffset +=
        this.moodHistory[this.moodHistory.length - 1 - i] * weights[i];
    }

    return constrain(1 + moodOffset, 0.875, 1.125);
  }

  rollBankerLyingChance() {
    const mood = this.getStartingMood();
    const moodPosition = constrain((mood - 1) / 0.125, -1, 1);
    // Base chance of lying is 60%. Banker mood can move that probability by
    // up to 10 percentage points in either direction.
    const lyingChance = constrain(0.60 - moodPosition * 0.10, 0.50, 0.70);
    bankerDebug("lying chance roll", { mood, moodPosition, lyingChance });
    return lyingChance;
  }

  advanceRoundAfterDecision() {
    const rounds = getRounds();
    const nextRoundIndex = this.roundIndex + 1;
  
    if (nextRoundIndex >= rounds.length) return;
  
    const remaining = app.game.unopenedNon23().length;
  
    const expectedRemaining =
      rounds.slice(nextRoundIndex).reduce((sum, n) => sum + n, 0) + 2;
  
    if (remaining !== expectedRemaining) return;
  
    this.roundIndex = nextRoundIndex;
    this.boxesToOpen = rounds[this.roundIndex] || 0;
    this.roundBoxesToOpen = this.boxesToOpen;
  }

  unopenedNon23() {
    return this.boxes.slice(0, this.moneyCount).filter((b) => !b.opened);
  }

  unopenedNon23ExceptPlayer() {
    return this.boxes
      .slice(0, this.moneyCount)
      .filter((b) => !b.opened && b !== this.playerBox);
  }

  // Estimate how the Banker's private information changes his view of the
  // remaining board. 
  getBankerInformationEstimate() {
    const remaining = this.unopenedNon23();
    const n = remaining.length;
  
    if (!n) {
      return {
        estimateMean: 0,
        informationDifference: 0,
        knownCount: 0,
        knownFraction: 0,
        informationStrength: 0,
        overallMean: 0,
        unknownMean: 0
      };
    }
  
    const overallMean =
      remaining.reduce((sum, b) => sum + b.value, 0) / n;
  
    const knownIds = new Set(this.bankerKnownBoxIds || []);
    if (this.bankerLookedAtPlayer && this.playerBox) {
      knownIds.add(this.playerBox.id);
    }
  
    const known = remaining.filter(b => knownIds.has(b.id));
    const unknown = remaining.filter(b => !knownIds.has(b.id));
  
    const knownCount = known.length;
    const unknownCount = unknown.length;
  
    const unknownSum = unknown.reduce((sum, b) => sum + b.value, 0);
  
    // The Banker knows all possible remaining values, so he can calculate
    // the exact mean of the boxes whose individual values he does not know.
    const unknownMean = unknownCount > 0
      ? unknownSum / unknownCount
      : 0;
  
    const informationDifference = overallMean > 0
      ? (unknownMean - overallMean) / overallMean
      : 0;
  
    const knownFraction = knownCount / n;
    const informationStrength = Math.sqrt(constrain(knownFraction, 0, 1));
  
    return {
      estimateMean: unknownMean,
      informationDifference,
      knownCount,
      knownFraction,
      informationStrength,
      overallMean,
      unknownMean
    };
  }

  resolveSpecialBankerIntent(fair) {
    if (!this.specialGame || this.bankerLookResolved) return;

    const info = this.getBankerInformationEstimate();
    // This narrative is descriptive only.  It no longer determines the
    // direction of the offer multiplier.
    this.bankerWantsDeal = info.estimateMean > fair;
    this.bankerLookResolved = true;

    bankerDebug("Banker knowledge intent", {
      fair,
      bankerEstimate: info.estimateMean,
      informationDifference: info.informationDifference,
      wantsDeal: this.bankerWantsDeal,
      knownCount: info.knownCount,
      knownFraction: info.knownFraction,
      informationStrength: info.informationStrength,
      knownBoxIds: [...(this.bankerKnownBoxIds || [])],
      playerBoxKnown: this.bankerLookedAtPlayer
    });
  }

  applySpecialBankerOffer(fair, current) {
    if (!this.specialGame || !this.bankerLookResolved) return current;

    // Clown Game and Second Chance are deliberately separate mechanics.
    // For Second Chance, the Banker does NOT use the actual player-box value
    // when recalculating the offer. He uses only the claim he made about it.
    // The claim defines a set of possible remaining values; the mean of that
    // set becomes the Banker's informed estimate. This means the offer reacts
    // to what the Banker SAYS he saw, rather than secretly using the truth.
    if (this.specialLookMode === "SECOND_CHANCE" && this.bankerLookedAtPlayer && this.playerBox) {
      const offerReference = Math.max(1, Number(current) || 0);
      const claim = this.bankerPlayerClaim;
      const rule = claim?.rule;
      const remainingValues = this.unopenedNon23().map(b => Number(b.value)).filter(Number.isFinite);

      // Only the claim is allowed to influence the recalculation. Normally
      // every claim has a rule; keep a directional fallback for malformed or
      // legacy claim objects so the game cannot produce NaN.
      let fittingValues = rule
        ? remainingValues.filter(v => bankerRuleHolds(rule, v))
        : remainingValues.filter(v => this.bankerPlayerClaimHigher ? v > offerReference : v <= offerReference);

      if (!fittingValues.length) {
        // A claim should always describe at least one possible value. If an
        // already-rendered/legacy claim does not, fall back to its direction
        // rather than using the actual player-box value.
        fittingValues = this.bankerPlayerClaimHigher
          ? remainingValues.filter(v => v > offerReference)
          : remainingValues.filter(v => v <= offerReference);
      }

      const claimMean = fittingValues.length
        ? fittingValues.reduce((sum, v) => sum + v, 0) / fittingValues.length
        : offerReference;

      const actualDifference = (claimMean - offerReference) / offerReference;
      const playerOfferRatio = claimMean / offerReference;

      const remainingCount = this.unopenedNon23().length;
      const baseProgress = constrain((remainingCount - 2) / 9, 0, 1);
      const progressStrength = Math.sqrt(baseProgress);

      // The full +/-25% effect is reached when the claimed mean is 5x above
      // or 1/100x below the normal offer. The same progress scaling used by the
      // previous Second Chance system is retained.
      const knowledgeEffectStrength = 5;
      const multiplierCap = 0.25;
      const multiplierFloor = 1 - multiplierCap;
      const ratioDifference = playerOfferRatio >= 1
        ? (playerOfferRatio - 1) / 4
        : (playerOfferRatio - 1) / 0.99;
      const rawMultiplier =
        1 + ratioDifference * multiplierCap * progressStrength;
      const multiplier = constrain(
        rawMultiplier,
        multiplierFloor,
        1 + multiplierCap
      );

      bankerDebug("Second Chance claim-based offer effect", {
        path: "SECOND_CHANCE -> CLAIM MEAN",
        playerBoxValue: Number(this.playerBox.value) || 0,
        claimStatement: claim?.statement ?? null,
        claimHigher: this.bankerPlayerClaimHigher,
        claimRule: rule ?? null,
        fittingValues,
        claimMean,
        currentBeforeKnowledge: current,
        actualDifference,
        playerOfferRatio,
        ratioDifference,
        remainingCount,
        progressStrength,
        knowledgeEffectStrength,
        multiplierCap,
        multiplierFloor,
        rawMultiplier,
        multiplier,
        offerAfterKnowledge: Math.max(0, current * multiplier)
      });

      return Math.max(0, current * multiplier);
    }

    // Clown Game retains the estimate-based system. It is intentionally not
    // used for the Second Chance Button Game.
    const info = this.getBankerInformationEstimate();
    const remainingCount = info.knownCount >= 0 ? this.unopenedNon23().length : 0;
    let informationDifference = constrain(info.informationDifference, -1, 1);

    const baseProgress = constrain((remainingCount - 2) / 9, 0, 1);
    const progressStrength = Math.sqrt(baseProgress);
    const knowledgeEffectStrength = 1;

    const rawMultiplier =
      1 +
      informationDifference *
      info.informationStrength *
      progressStrength *
      knowledgeEffectStrength;

    const multiplierCap = 0.10;
    const multiplierFloor = 1 - multiplierCap;
    const multiplier = constrain(
      rawMultiplier,
      multiplierFloor,
      1 + multiplierCap
    );

    bankerDebug("Banker knowledge offer effect", {
      path: "CLOWN -> BOARD ESTIMATE",
      fair,
      currentBeforeKnowledge: current,
      bankerEstimate: info.estimateMean,
      informationDifference: info.informationDifference,
      appliedInformationDifference: informationDifference,
      bankerWantsDeal: this.bankerWantsDeal,
      narrativeWantsDeal: this.bankerWantsDeal,
      playerClaimIsLie: false,
      knownCount: info.knownCount,
      knownFraction: info.knownFraction,
      informationStrength: info.informationStrength,
      remainingCount,
      progressStrength,
      rawMultiplier,
      knowledgeEffectStrength,
      multiplierCap,
      multiplierFloor,
      multiplier,
      capped: rawMultiplier !== multiplier,
      offerAfterKnowledge: Math.max(0, current * multiplier)
    });

    return Math.max(0, current * multiplier);
  }

  recordCurrentOfferHistory() {
    const historyType = this.nextOfferHistoryType;
    this.nextOfferHistoryType = null;

    const historyEntry = {
      round: displayRound(this.roundIndex),
      amount: this.offer,
    };

    if (historyType === "MR") {
      historyEntry.midRound = true;
      historyEntry.midRoundNumber = displayRound(this.roundIndex);
    } else if (historyType === "CR") {
      historyEntry.counter = true;
      historyEntry.counterNumber = displayRound(this.roundIndex);
    }

    this.offerHistory.push(historyEntry);
  }

  commitOfferStatsAndHistory() {
    // Commit an offer only when it has actually become a player-facing offer.
    // This is important for the Round 3 Second Chance path: its provisional
    // offer must not affect Highest/Lowest/Top-of-the-Game/history until the
    // Second Chance outcome has been resolved.
    this.highestOffer = Math.max(this.highestOffer, this.offer);
    this.lowestOffer = Math.min(this.lowestOffer, this.offer);

    const offerIndex = this.offerHistory.length;
    const previousOffers = this.offerHistory.map(o => o.amount);
    const hasBreakSinceStart = previousOffers.some(
      (amount, i) => i > 0 && amount < previousOffers[i - 1]
    );
    const startIndex = this.topOfGameLastShownOfferIndex + 1;
    const offersSinceLastTop = previousOffers.slice(startIndex);
    const hasBreakSinceLastTop = offersSinceLastTop.some(
      (amount, i) => i > 0 && amount < offersSinceLastTop[i - 1]
    );
    const previousHighestOffer = previousOffers.length
      ? Math.max(...previousOffers)
      : -Infinity;

    this.offerIsTopOfGame =
      offerIndex >= 2 &&
      this.offer > previousHighestOffer &&
      hasBreakSinceStart &&
      hasBreakSinceLastTop;

    if (this.offerIsTopOfGame) {
      this.topOfGameLastShownOfferIndex = offerIndex;
    }

    this.recordCurrentOfferHistory();
  }

  evaluateMidRoundOpportunity(beforeValues, afterValues) {
    bankerDebug("Mid-round evaluation started", {
      round: displayRound(this.roundIndex), boxesToOpen: this.boxesToOpen,
      beforeCount: beforeValues.length, afterCount: afterValues.length,
      randomEnabled: app.settings.enableMidRoundOffer
    });
    if (this.dealAccepted !== null || this.randomMidOfferUsed || this.midOfferPending || this.boxesToOpen <= 0) return;
    // This function is exclusively for RANDOM mid-round offers. A successful
    // Button Game grants a separate, player-requested mid-round offer and
    // must not bypass the Random Mid-Round Offers setting.
    if (!app.settings.enableMidRoundOffer) return;
    const allowed = isUS() ? (this.roundIndex === 3 || this.roundIndex === 4) : (this.roundIndex === 3 || this.roundIndex === 4 || this.roundIndex === 5);
    // A random mid-round offer may only occur between normal round offers.
    // If this opening is the final box of the round, the normal end-of-round
    // offer (or Clown Game / Second Chance transition) always has priority.
    // boxesToOpen is checked before the opening is decremented below.
    if (this.boxesToOpen <= 1) {
      bankerDebug("Mid-round evaluation skipped: normal end-of-round offer has priority", {
        round: displayRound(this.roundIndex),
        boxesToOpen: this.boxesToOpen
      });
      return;
    }
    if (!allowed || !beforeValues.length || !afterValues.length) return;

    // Completing Round 5 in a Special Game Clown Game must enter the Clown Game
    // before the normal Round 5 offer. A random mid-round trigger on the final
    // Round 5 box must therefore not steal that transition.
    if (this.specialGame && this.specialLookMode === "CLOWN" &&
        this.roundIndex === 4 && this.boxesToOpen === 1 &&
        this.clownResults?.length && this.clownResults.some(c => !c.picked)) {
      bankerDebug("Mid-round evaluation skipped: Clown Game takes priority", {
        round: displayRound(this.roundIndex),
        boxesToOpen: this.boxesToOpen
      });
      return;
    }
    const beforeMean = beforeValues.reduce((a,b)=>a+b,0)/beforeValues.length;
    const afterMean = afterValues.reduce((a,b)=>a+b,0)/afterValues.length;
    const beforeSafety = getBoardSafety(beforeValues);
    const afterSafety = getBoardSafety(afterValues);

    const beforeRiskDetails = getBoardSafetyDetails(beforeValues);
    const afterRiskDetails = getBoardSafetyDetails(afterValues);
    
    bankerDebug("MID-ROUND RISK AND SAFETY COMPARISON", {
      round: displayRound(this.roundIndex),
    
      beforeValues,
      afterValues,
    
      beforeMean,
      afterMean,
      meanChange: afterMean - beforeMean,
      meanDownPercent: beforeMean > 0
        ? ((beforeMean - afterMean) / beforeMean) * 100
        : 0,
    
      beforeRisk: beforeRiskDetails.risk,
      afterRisk: afterRiskDetails.risk,
      riskChange: afterRiskDetails.risk - beforeRiskDetails.risk,
    
      beforeSafety,
      afterSafety,
      safetyChange: afterSafety - beforeSafety,
    
      safetyUpPercent: beforeSafety > 0
        ? ((afterSafety - beforeSafety) / beforeSafety) * 100
        : 0,
    
      safetyDownPercent: beforeSafety > 0
        ? ((beforeSafety - afterSafety) / beforeSafety) * 100
        : 0,
    
      beforeSpreadRisk: beforeRiskDetails.spreadRisk,
      afterSpreadRisk: afterRiskDetails.spreadRisk,
    
      beforeConcentrationRisk: beforeRiskDetails.concentrationRisk,
      afterConcentrationRisk: afterRiskDetails.concentrationRisk,
    
      beforeValueRisk: beforeRiskDetails.valueRisk,
      afterValueRisk: afterRiskDetails.valueRisk
    });
    
    const safetyUp = beforeSafety > 0 ? (afterSafety-beforeSafety)/beforeSafety : 0;
    const safetyDown = beforeSafety > 0 ? (beforeSafety-afterSafety)/beforeSafety : 0;
    const meanDown = beforeMean > 0 ? (beforeMean-afterMean)/beforeMean : 0;
    let multiplier = null, magnitude = 0;
    this.midOfferReason = null;
    // Only one penalty can apply. Mean swing has priority over safety swing.
    if (meanDown >= 0.5) { multiplier = 0.25; magnitude = meanDown; this.midOfferReason = "meanDecrease"; }
    else if (safetyUp >= 0.10) { multiplier = 0.9; magnitude = safetyUp; this.midOfferReason = "safetyIncrease"; }
    else if (safetyDown >= 0.10) { multiplier = 0.75; magnitude = safetyDown; this.midOfferReason = "safetyDecrease"; }
    if (multiplier === null) {
      bankerDebug("Mid-round evaluation: no trigger", { meanDown, safetyUp, safetyDown, randomEnabled: app.settings.enableMidRoundOffer });
      return;
    }
    const chance = 0.25 + 0.25 * constrain((magnitude - 0.10) / 0.90, 0, 1);
    const roll = random();
    bankerDebug("Mid-round random trigger", { multiplier, magnitude, meanDown, safetyUp, safetyDown, chance, roll, triggered: roll < chance });
    if (roll >= chance) return;
    this.midRoundMultiplier = multiplier;
    this.midOfferPenalty = multiplier;
    this.midOfferPending = true;
    this.midOfferFromRandom = true;
    // This is a random mid-round offer, not a Button Game offer.
    // Explicitly clear the Button Game flag so a previous Button Game
    // cannot suppress the random-offer penalty.
    this.midOfferFromButtonGame = false;
    this.randomMidOfferTriggered = true;
    this.randomMidOfferUsed = true;
    this.nextOfferHistoryType = "MR";
    // A random mid-round offer is forced immediately. It must NEVER create
    // the player-facing "Get Offer Now" button.
    this.canShowMidOffer = false;
    bankerDebug("Random mid-round offer triggered — forced transition", {
      penalty: multiplier,
      round: displayRound(this.roundIndex),
      forced: true
    });
  }

  calculateOffer(recordHistory = true) {
    // The Clown Game produces exactly one normal offer after its reveal.
    // Ignore any accidental second calculation in the same round so it cannot
    // create a second R5/R6/R7 history entry or overwrite the displayed offer.
    if (this.specialGame && this.specialLookMode === "CLOWN" &&
        this.clownGameCompleted && this.clownOfferCalculated &&
        this.roundIndex === 4 && !this.midOfferPending &&
        this.nextOfferHistoryType !== "MR" && this.nextOfferHistoryType !== "CR") {
      return;
    }

    this.isSticking = false;
    this.isGovernorOffer = false;

    const remaining = this.unopenedNon23().map((b) => b.value);
  
    const mean = remaining.reduce((a, b) => a + b, 0) / remaining.length;
    const minVal = Math.min(...remaining);
    const maxVal = Math.max(...remaining);

    const n = remaining.length;
    const logs = remaining.map(v => Math.log10(Math.max(v, 0.01)));
    const logMean = logs.reduce((a, b) => a + b, 0) / n;

    const safetyDetails = getBoardSafetyDetails(remaining);
    const safety = safetyDetails.safety;
    
    bankerDebug("RISK AND SAFETY CALCULATION", {
      round: displayRound(this.roundIndex),
      remainingCount: safetyDetails.remainingCount,
      remainingValues: safetyDetails.remainingValues,
    
      // Spread risk
      logMean: safetyDetails.logMean,
      logVariance: safetyDetails.logVariance,
      logSD: safetyDetails.logSD,
      spreadRisk: safetyDetails.spreadRisk,
      spreadWeight: 0.70,
      spreadContribution: safetyDetails.spreadContribution,
    
      // Largest-box concentration risk
      totalRemainingValue: safetyDetails.total,
      largestBoxValue: safetyDetails.maxVal,
      largestBoxShare: safetyDetails.maxShare,
      equalShare: safetyDetails.equalShare,
      concentrationRatio: safetyDetails.concentrationRatio,
      concentrationRisk: safetyDetails.concentrationRisk,
      concentrationWeight: 0.20,
      concentrationContribution: safetyDetails.concentrationContribution,
    
      // Jackpot/value risk
      valueProgress: safetyDetails.valueProgress,
      valueRisk: safetyDetails.valueRisk,
      valueWeight: 0.10,
      valueContribution: safetyDetails.valueContribution,
    
      // Overall risk and safety
      overallRisk: safetyDetails.risk,
      baseSafety: safetyDetails.baseSafety,
      extremeRisk: safetyDetails.extremeRisk,
      extremeRiskPenalty: safetyDetails.extremePenalty,
      safetyBeforeConstraint: safetyDetails.safetyBeforeConstraint,
      finalSafety: safetyDetails.safety,
      safetyUsedByOffer: safety
    });

    let r5 = 1;
    if ( getRounds(this.boxSetAtStart).length === 6 && !this.canShowMidOffer && remaining.length === 5 ) { 
      r5 = 0.6 + 0.4 * safety; 
      //console.log(safety, r5) 
    }
  
    let early = 1;
    const q = max(1/2 * remaining.length - 11/2, 0);
  
    // Compare the current board against the log mean of the board
    // at the start of this game, before any boxes were opened.
    const startingLogMean = this.startLogMean ?? logMean;
    const change = (logMean - startingLogMean) / startingLogMean;
    early = 1 + q * change;
    early = max(0.05, early);
    
    // -------------------------
  
    let m = 163/150 - (13 * remaining.length)/300;
  
    const randomness = constrain(randomGaussian(1, 0.03), 0.9, 1.1);
    //console.log(randomness);
  
    // console.log(mean, m, safety, early, r5);
    const fair =
      mean *
      m *
      safety *
      early *
      r5;
    //console.log(fair, safety);

    bankerDebug("FAIR OFFER FORMULA BREAKDOWN", {
      round: displayRound(this.roundIndex),
      remainingCount: remaining.length,
    
      mean,
      m,
      safety,
      early,
      r5,
    
      // Show the calculation step by step
      meanTimesM: mean * m,
      afterSafety: mean * m * safety,
      afterEarly: mean * m * safety * early,
      afterR5: mean * m * safety * early * r5,
    
      fair,
      fairRestrictedBeforeFloor: Math.min(fair, mean),
    
      // How much each multiplier changes the offer
      safetyEffectPercent: (safety - 1) * 100,
      earlyEffectPercent: (early - 1) * 100,
      r5EffectPercent: (r5 - 1) * 100
    });

    this.isSticking = false;
    this.isGovernorOffer = false;
  
    let fairRestricted = Math.min(fair, mean);

    bankerDebug("offer calculation before Banker knowledge", {
      round: displayRound(this.roundIndex),
      remaining: remaining.length, mean, safety, early,
      r5, m, fair, fairRestricted, randomness, bankerMood: this.bankerMood,
      specialGame: this.specialGame, knownCount: this.bankerKnownBoxIds.size + (this.bankerLookedAtPlayer ? 1 : 0)
    });
  
    if (remaining.length <= 6) {
      fairRestricted = Math.max(fairRestricted, 0.75 * minVal + (m / 4) * mean);
    }
  
    // Special Game banker knowledge is resolved only after the fair offer is known.
    if (this.specialGame && !this.bankerLookResolved &&
        (this.bankerLookedAtPlayer || this.bankerKnownBoxIds.size > 0)) {
      this.resolveSpecialBankerIntent(fairRestricted);
    }

    this.fairOfferBeforeRandomness = fairRestricted;
    let final = fairRestricted * randomness * this.bankerMood;
    final = this.applySpecialBankerOffer(fairRestricted, final);

    // Evaluate the mid-round adjustment separately so Banker Debug shows
    // exactly whether a penalty was applied and what it changed.
    const midOfferBaseBeforePenalty = final;
    const midOfferIsPending = !!this.midOfferPending;
    const midOfferIsRandom = !!this.midOfferFromRandom;
    const midOfferIsButtonGame = !!this.midOfferFromButtonGame;
    const midOfferConfiguredPenalty = Number.isFinite(Number(this.midOfferPenalty))
      ? Number(this.midOfferPenalty)
      : 1;
    const midOfferAppliedPenalty =
      !midOfferIsPending
        ? 1
        : (midOfferIsButtonGame ? 1 : midOfferConfiguredPenalty);
    const midOfferPenaltyApplied =
      midOfferIsPending && midOfferAppliedPenalty !== 1;

    if (midOfferIsPending) {
      final *= midOfferAppliedPenalty;
    }

    bankerDebug("mid-round offer evaluation", {
      pending: midOfferIsPending,
      source: midOfferIsRandom ? "RANDOM" : (midOfferIsButtonGame ? "BUTTON_GAME" : "OTHER"),
      randomMidOfferUsed: this.randomMidOfferUsed,
      playerMidOfferUsed: this.midRoundOfferUsed,
      reason: this.midOfferReason,
      configuredPenalty: midOfferConfiguredPenalty,
      buttonGameOverride: midOfferIsButtonGame,
      appliedPenalty: midOfferAppliedPenalty,
      penaltyApplied: midOfferPenaltyApplied,
      baseOfferBeforePenalty: midOfferBaseBeforePenalty,
      offerAfterPenalty: final,
      reductionAmount: midOfferBaseBeforePenalty - final,
      reductionPercent: midOfferBaseBeforePenalty > 0
        ? (1 - final / midOfferBaseBeforePenalty) * 100
        : 0
    });
    //console.log(fairRestricted, final);

    // A recalculation after Second Chance must be compared with the original
    // offer, not the previous offer in history (the original Round 3 offer is
    // intentionally not committed yet). If the recalculated result is close
    // enough, keep the exact original offer so the wording and displayed value
    // can never disagree.
    const secondChanceRecalculation =
      this.secondButtonGameAttempted &&
      this.secondButtonGameSuccess === false &&
      this.secondButtonGameOriginalOffer != null &&
      this.roundIndex === 2;
    const stickingReference =
      secondChanceRecalculation
        ? Number(this.secondButtonGameOriginalOffer)
        : Number(app.game.offerHistory[app.game.offerHistory.length - 1]?.amount);
    const stickingThreshold = 0.05;
    const hasStickingReference = Number.isFinite(stickingReference) && stickingReference > 0;

    if (hasStickingReference &&
        final >= (1 - stickingThreshold) * stickingReference &&
        final <= (1 + stickingThreshold) * stickingReference) {
      final = stickingReference;
      this.isSticking = true;
    } else if (final >= 23400 && final <= 28600) {
      final = 26000;
      this.isGovernorOffer = true;
    }
  
    bankerDebug("final offer calculation", {
      fairRestricted, randomisedAndMoodOffer: fairRestricted * randomness * this.bankerMood,
      finalBeforeRounding: final, bankerKnowledgeApplied: this.specialGame && this.bankerLookResolved,
      midOfferPending: this.midOfferPending, midOfferPenalty: this.midOfferPenalty
    });
    this.offer = roundOffer(final);
    bankerDebug("offer set", { offer: this.offer, round: displayRound(this.roundIndex) });
    //console.log(this.offer);
  
    if (recordHistory) {
      this.commitOfferStatsAndHistory();
    } else {
      this.secondButtonGameOfferPendingCommit = true;
      this.offerIsTopOfGame = false;
    }
  }
}

//
// =======================
// 7) STATE REGISTRATION
// =======================
//
function registerStates() {
  app.fsm.register(STATE.START, {
    render: renderStart,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.PICK_PLAYER_BOX, {
    render: renderMain,
    onClick: onPickPlayerClick,
  });

  app.fsm.register(STATE.OPENING, {
    render: renderMain,
    onClick: onOpenBoxClick,
  });

  app.fsm.register(STATE.BUTTON_GAME, {
    render: renderMain,
    onKey: onButtonGameKey,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.BUTTON_GAME_RESULT, {
    render: renderMain,
    onKey: onButtonGameResultKey,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.SPECIAL_SECOND_CHANCE, {
    render: renderMain,
    onKey: onSpecialSecondChanceKey,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.CLOWN_GAME, {
    render: renderClownGame,
    onClick: onClownGameClick,
  });

  app.fsm.register(STATE.COUNTER_OFFER, { render: renderMain, onKey: onCounterOfferKey, onClick: () => app.ui.handleClick(pointerX, pointerY) });
  app.fsm.register(STATE.COUNTER_OFFER_RESULT, { render: renderMain, onKey: onCounterOfferResultKey, onClick: () => app.ui.handleClick(pointerX, pointerY) });
  app.fsm.register(STATE.OFFER, {
    onEnter: () => {
      if (app.game) {
        // Capture whether this OFFER screen is the first presentation of a
        // newly acquired Banker look. Do not decide this inside render:
        // render() runs every frame, so doing so caused the first frame to say
        // "New" and the next frame to immediately flip to "Previously".
        app.game.bankerLookPresentationNew =
          app.game.bankerLookJustChanged || app.game.bankerLookRevealPending;
        // Do not reset bankerLookedAtShown here: the introductory look line
        // is shown only once for the physical Banker look.
        app.game.clownOfferTransitionPending = false;
        // Build the Banker-look narrative only when a new look has actually
        // happened. Once generated, retain the exact statements across all
        // later offers. A new set is generated only after a statement is
        // actually proved wrong.
        const newLook = app.game.bankerLookPresentationNew;
        // Claims are cached; the narrative is regenerated so an unchanged
        // claim is presented as "He says" only on a new/proven statement and
        // as "Previously, he said" on later offers.
        app.game.bankerLookPresentationLines = bankerLookedAtText();
        app.game.bankerLookJustChanged = false;
        app.game.bankerLookRevealPending = false;
        if (app.game.secondButtonGameOfferPendingCommit) {
          app.game.commitOfferStatsAndHistory();
          app.game.secondButtonGameOfferPendingCommit = false;
          bankerDebug("Second Chance offer committed on OFFER entry", {
            offer: app.game.offer,
            highestOffer: app.game.highestOffer,
            lowestOffer: app.game.lowestOffer,
            historyLength: app.game.offerHistory.length,
            isGovernorOffer: app.game.isGovernorOffer
          });
        }
        app.game.offerRibbonVisible = true;
      }
    },
    render: renderMain,
    onKey: onOfferKey,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.SWAP, {
    render: renderMain,
    onKey: onSwapKey,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.GAMBLE, {
    render: renderMain,
    onKey: onGambleKey,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.END_REVEAL, {
    render: renderMain,
    onKey: onEndRevealKey,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.BOX23, {
    render: renderMain,
    onKey: onBox23Key,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.FINISHED, {
    render: renderMain,
    onKey: onFinishedKey,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.STATS, {
    render: renderStats,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
    onWheel: (evt) => onStatsWheel(evt),
  });

  app.fsm.register(STATE.MENU, {
    render: renderMenuOverlay,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.INFO, {
    render: renderInfoOverlay,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.SETTINGS, {
    render: renderSettingsOverlay,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });

  app.fsm.register(STATE.SOUND, {
    render: renderSoundOverlay,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
    onDrag: () => app.ui.handleDrag(pointerX, pointerY),
  });

  app.fsm.register(STATE.PRESETS, {
    render: renderPresetsOverlay,
    onClick: () => app.ui.handleClick(pointerX, pointerY),
  });
}

//
// =======================
// 8) p5 LOOP + INPUT
// =======================
//
function draw() {

  app.ui.beginFrame();
  app.fsm.update();
  app.fsm.render();
}

function mousePressed() {
  updatePointerFromMouse();
  app.fsm.mousePressed();
}
function mouseDragged() {
  updatePointerFromMouse();
  app.fsm.mouseDragged();
}
function touchMoved() {
  updatePointerFromTouch();
  app.fsm.mouseDragged();
  return false;
}
function keyPressed() {
  app.fsm.keyPressed();
}
function mouseWheel(evt) {
  app.fsm.mouseWheel(evt);
}

//
// =======================
// 9) RENDERERS
// =======================
//
function renderStart() {
  image(app.assets.images.start, 0, 0, windowWidth, windowHeight);

  app.ui.button(
    "play",
    "Play",
    windowWidth * 0.65,
    windowHeight * 0.8,
    windowWidth / 5,
    windowWidth / 20,
    () => {
      app.assets.audio.startMusic.stop();
      app.game.reset(CFG, app.layout);
      app.fsm.transitionTo(STATE.PICK_PLAYER_BOX);
    }
  );

  // REPLACED: View Stats -> Menu
  app.ui.button(
    "menuFromStart",
    "Menu",
    windowWidth * 0.35,
    windowHeight * 0.8,
    windowWidth / 5,
    windowWidth / 20,
    () => {
      app.fsm.transitionTo(STATE.MENU);
    }
  );
}

function renderStats() {
  background(60);
  drawStatsScreen();

  app.ui.button(
    "backStats",
    "Back",
    windowWidth / 2,
    windowHeight * 0.92,
    windowWidth / 5,
    windowWidth / 20,
    () => {
      app.fsm.transitionTo(STATE.MENU);
    }
  );
}

function renderMain() {
  image(
    app.assets.images.background,
    0,
    0,
    windowWidth * CFG.boardWidthFrac,
    windowHeight
  );

  const s = app.fsm.state;

  if (s === STATE.BOX23) {
    drawBox23Screen(); // NEW (function below)
  } else if (s === STATE.FINISHED) {
    drawFinishedPanel(); // you already have this function
  } else {
    // normal play screens
    drawBoxesFromModel();
    drawBoardFromModel();
    drawBox23Mini();
  }

  drawRibbonFromModel();
  drawHeader();
  drawPrompts();
  drawMenuButton();
}

function renderMenuOverlay() {
  push();
  // Menu geometry is based on the playable game board, not the right-hand
  // Game Info panel. This keeps the menu centred correctly on Box 23 and
  // Finished screens, where the game itself only occupies CFG.boardWidthFrac.
  rectMode(CORNER);
  // Draw the screen underneath the menu.
  if (app.fsm.returnState === STATE.START) {
    image(app.assets.images.start, 0, 0, windowWidth, windowHeight);
  } else if (app.fsm.returnState === STATE.BOX23) {
    drawBox23Screen();
    drawRibbonFromModel();
    drawHeader();
  } else if (app.fsm.returnState === STATE.FINISHED) {
    drawFinishedPanel();
  } else if (app.fsm.returnState === STATE.MENU) {
    background(60);
  } else {
    renderMain();
  }

  fill(0, 150);
  noStroke();
  rect(0, 0, windowWidth, windowHeight);

  const ts = Math.min(windowHeight * 0.035, windowWidth * 0.022);
  const gapX = windowWidth * 0.012;
  const boardW = windowWidth * CFG.boardWidthFrac;
  const menuW = Math.min(boardW * 0.56, windowHeight * 0.78);
  const btnH = Math.min(windowWidth * 0.035, windowHeight * 0.067);
  const rowGap = btnH * 0.35;
  const colW = (menuW - gapX * 3) / 2;
  const menuX = (windowWidth - menuW) / 2;

  // Three rows of two controls, followed by a centred Back button.
  // The panel hugs the controls with no unnecessary bottom space.
  const titleH = ts * 1.35;
  const contentTop = titleH + btnH * 0.85;
  const pair1Y = contentTop;
  const pair2Y = pair1Y + btnH + rowGap;
  const pair3Y = pair2Y + btnH + rowGap;
  const backYActual = pair3Y + btnH + rowGap;
  const menuH = (backYActual - (ts * 0.45)) + btnH + ts * 0.45;
  const menuY = (windowHeight - menuH) / 2;

  const titleCenterY = menuY + ts * 0.65;
  const firstY = menuY + pair1Y;
  const secondY = menuY + pair2Y;
  const thirdY = menuY + pair3Y;
  const backCenterY = menuY + backYActual;

  fill(255);
  rect(menuX, menuY, menuW, menuH, menuH * 0.07);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(ts * 1.15);
  textStyle(BOLD);
  text("Game Menu", windowWidth / 2, titleCenterY);
  textStyle(NORMAL);

  const leftX = menuX + gapX + colW / 2;
  const rightX = menuX + gapX * 2 + colW * 1.5;

  app.ui.button("menuInfo", "Game Help", leftX, firstY, colW, btnH, () => {
    app.game.scrollOffset = 0;
    app.game.infoHeight = 0;
    app.game.infoBackground = get();
    app.fsm.transitionTo(STATE.INFO);
  });

  app.ui.button("menuStats", "Game Stats", rightX, firstY, colW, btnH, () => {
    app.game.scrollOffset = 0;
    app.game.statsHeight = 0;
    app.fsm.transitionTo(STATE.STATS);
  });

  app.ui.button("menuSound", "Sound", leftX, secondY, colW, btnH, () => {
    app.fsm.transitionTo(STATE.SOUND);
  });

  app.ui.button("menuSettings", "Settings", rightX, secondY, colW, btnH, () => {
    app.fsm.transitionTo(STATE.SETTINGS);
  });

  app.ui.button("menuRestart", "Restart Game", leftX, thirdY, colW, btnH, () => {
    app.game.reset(CFG, app.layout);
    app.fsm.returnState = null;
    app.fsm.transitionTo(STATE.START);
  });

  if (app._confirmDeleteHistory === undefined) app._confirmDeleteHistory = false;
  app.ui.button(
    "menuDeleteHistory",
    app._confirmDeleteHistory ? "Confirm Delete History" : "Delete Game History",
    rightX,
    thirdY,
    colW,
    btnH,
    () => {
      if (!app._confirmDeleteHistory) {
        app._confirmDeleteHistory = true;
        setTimeout(() => { app._confirmDeleteHistory = false; }, 2500);
        return;
      }

      app._confirmDeleteHistory = false;
      app.game.history = [];
      app.game.moodHistory = [];
      app.game.saveHistory();
      localStorage.removeItem("pastGames");
    }
  );

  app.ui.button(
    "menuBack",
    "Back",
    windowWidth / 2,
    backCenterY,
    colW,
    btnH,
    () => {
      const destination = app.fsm.returnState ?? STATE.START;
      app.fsm.transitionTo(destination);
    }
  );

  pop();
}

function renderInfoOverlay() {
  if (app.game.infoBackground) {
    image(app.game.infoBackground, 0, 0, windowWidth, windowHeight);
  }

  fill(0, 220);
  noStroke();
  rect(0, 0, windowWidth, windowHeight);

  push();
  translate(0, -app.game.scrollOffset);

  fill(255);
  textAlign(LEFT, TOP);
  textSize(windowWidth * 0.015);

  const info = [
    "GAME HELP",
    "",
    "Basic Rules: On the board, there are 22 sums of money from a penny, all the way up to the Jackpot. Each of these sums are hidden in the 22 boxes. If you pick the right box, you might go home with a fortune. There is one person who doesn't want that to happen and that is the Banker. He will try every trick to get you to sell your box for the lowest amount of money. Don't let him tempt you. Let's hope you walk away with a lovely amount of money.",
    "",
    "The Game: You start by choosing your own box. This box stays with you until the end of the game unless you accept a swap. During each round you must open a set number of boxes. After certain rounds, the Banker will make you an offer to buy your box. You can either DEAL and take the money, or say NO DEAL and continue playing.",
    "",
    "Rounds: The number of boxes you must open changes throughout the game. Early rounds usually require more boxes to be opened, while later rounds become more tense as fewer boxes remain. After the final boxes are opened, your box value is revealed and your result is calculated.",
    "",
    "Box Sets: The ITV, Channel 4 and US versions use different prize boards. The Channel 4 version has a larger jackpot (£250,000) and bigger red values compared to ITV (£100,000). The US version uses a $1,000,000 jackpot. Choose your preferred version before playing.",
    "",
    "Banker Mood: The Banker's mood affects how generous he is. A happy Banker may make higher offers, while an angry Banker may offer less. Your previous 5 games affect his mood, with more recent games having more of an effect.",
    "",
    "Button Game: After Round 1 is complete, you can try to predict the Banker's next offer. Your guess must be within 10% of the actual offer to succeed. If successful, you can request a mid-round offer later in the game. Fun Fact: This was added in 2014 in C4 games.",
    "",
    "Banker's Offers: The Banker calculates offers based on the remaining prizes, the quality of your board, the current round and the Banker's mood. Offers are not always equal to the average value left on the board. A strong board will usually receive higher offers, while a dangerous board may receive lower offers.",
    "",
    "3 Box Offer: In the Channel 4 version, after the 5-box opening round the player normally has to open 3 more boxes before the next offer. The ITV version uses a shorter 2-box opening round after the 5-box offer. This option allows different combinations of rules and box sets.",
    "",
    "Mid-Round Offer: This can be forced by the player after winning the Button Game, but can only be used once. Random mid-round offers may also be triggered by the Banker in rare circumstances.",
    "",
    "Swap: When two boxes remain, the Banker may offer you a swap. You can exchange your original box for the other remaining box. The choice is yours, but remember that your original box may contain the larger prize.",
    "",
    "Banker's Gamble: If you have already dealt and two boxes remain, the Banker may offer you the chance to return to live play. You must give back the amount you dealt for the chance to continue. This is risky because you could end up with less money than your original deal.",
    "",
    "Box 23 / Golden Case: After the game ends, you may be offered a chance to play Box 23 using the money you won from normal play. Box 23 can contain DOUBLE, HALF, NOTHING, MONEY BACK or a fixed bonus amount. The possible values depend on the version selected. Fun Fact: This was added in 2014 in C4 games.",
    "",
    "Counter Offer: You may counter the Banker's offer once per game. If the Banker rejects your counter, the original offer can no longer be accepted and you must continue playing. In a US Special Game with the Clown Game, a second Counter Offer is available in exchange for the Banker having the chance to look in boxes. Fun Fact: This was introduced in the 2018 revival of the US version.",
    "",
    "Jackpot Chase: When enabled, if the jackpot is not won in a game, the second-highest prize on the next game is replaced by another jackpot. If the jackpot is still not won, another jackpot is added again, and so on. This means the board can contain multiple jackpots, making the chase increasingly valuable until someone wins one. At most half the board can be Jackpots. Fun Fact: This was called the Million Dollar Mission and only seen in the US version in real life.",
    "",
    "Statistics: The game records your offers, highest offer, money taken home and final result. Use these statistics to see whether you outplayed the Banker or left money behind.",
    "",
    "Outcomes:",
    "- Spanked: You achieved the best possible result by taking the maximum available money from the Banker.",
    "- Beat: You finished ahead of the Banker by taking more money home than your box value or by beating the final offer.",
    "- Drew: You dealt at exactly the value of your box. This is very rare.",
    "- Lost: You took home less money than your box was worth or finished with less than the final offer.",
    "- Humbled: You achieved the worst possible result by taking the minimum amount available from the Banker.",
    "",
    "",
    "",
    "Special Game:",
    "",
    "  Occasionally a game will be a Special Game with extra mechanics. The Special Game can include Boosted Boxes, a Clown Game or a Second Chance Button Game, and a special Box 23/Golden Case. The active special mechanics are shown at the start of the game.",
    "",
    "  Boosted Boxes: The normal prize board is replaced by a boosted prize board, giving the game larger amounts than the standard board for that version. Fun Fact: This was only ever seen in two games on C4.",
    "",
    "  Clown Game: After Round 5 has been completed, before the Round 5 Banker offer, you must pick clowns until you find the funny clown. ITV and Channel 4 use 4 clowns (1 funny and 3 phoney); the US version uses 5 (1 funny and 4 phoney). Your goal is to open the funny clown to stop the Banker looking at non-player boxes. The Banker will look at as many boxes as there are phoney clowns opened. The game tells you which boxes/cases the Banker looked at before play continues. In exchange for this, the Banker allows you to open one box at a time after 5 boxes. Fun Fact: This was used for one week only during the Banker's Birthday week in 2009 on C4.",
    "",
    "  Second Chance Button Game: If the Special Game gives you this feature and you fail the normal Button Game, you get a second chance to play it. Succeeding will grant you the button, while failing will allow the Banker to look in your box. But don't despair, as the swap is guaranteed here.",
    "",
    "  Banker Looking in Boxes: The Banker may be granted the chance to look at some of the unopened boxes but don't despair: if he knows one of the last two boxes, the swap is always guaranteed. The Banker is a fiendish liar so watch out for his deception.",
    "",
    "  Special Box 23 / Golden Case: The Special version can contain either DOUBLE, [doubled bonus],  HALF, QUARTER, NOTHING, or DOUBLE, [bonus], [bonus], QUARTER, NOTHING. Fun Fact: On C4, the doubled bonus was used in the Christmas week games, while the two regular bonuses were used in Halloween games.",
  ].join("\n");

  const margin = windowWidth * 0.025;
  const textW = windowWidth * 0.95;

  const infoY = margin;

  text(info, margin, infoY, textW);

  // approximate content height
  app.game.infoHeight = infoY + info.length * windowWidth * 0.000275;

  pop();

  app.ui.button(
    "infoBack",
    "Back",
    windowWidth / 2,
    windowHeight * 0.95,
    windowWidth / 5,
    windowWidth / 20,
    () => {
      app.game.scrollOffset = 0;
      app.fsm.transitionTo(STATE.MENU);
    }
  );
}

function renderSoundOverlay() {
  const returnState = app.fsm.returnState;
  if (returnState === STATE.START) image(app.assets.images.start, 0, 0, windowWidth, windowHeight);
  else renderMain();

  fill(0, 180); noStroke(); rect(0, 0, windowWidth, windowHeight);
  const panelW = Math.min(windowWidth * 0.34, windowHeight * 0.75);
  const panelH = Math.min(windowHeight * 0.55, windowWidth * 0.9);
  const panelX = (windowWidth - panelW) / 2;
  const panelY = (windowHeight - panelH) / 2;
  fill(255); rect(panelX, panelY, panelW, panelH, panelH * 0.12);
  fill(0); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(windowWidth * 0.026);
  text("Sound", windowWidth / 2, panelY + panelH * 0.12); textStyle(NORMAL);

  const sx = windowWidth / 2;
  const sw = panelW * 0.72;
  const gap = panelH * 0.19;
  let y = panelY + panelH * 0.32;
  app.ui.slider("masterVolume", "Master", sx, y, sw, app.settings.audio.master, v => { app.settings.audio.master = v; app.audio.applyVolumes(); saveSettings(); });
  y += gap;
  app.ui.slider("musicVolume", "Music", sx, y, sw, app.settings.audio.music, v => { app.settings.audio.music = v; app.audio.applyVolumes(); saveSettings(); });
  y += gap;
  app.ui.slider("sfxVolume", "Sound effects", sx, y, sw, app.settings.audio.sfx, v => { app.settings.audio.sfx = v; app.audio.applyVolumes(); saveSettings(); });

  app.ui.button("soundBack", "Back", sx, panelY + panelH * 0.88, panelW * 0.55, panelH * 0.1, () => app.fsm.transitionTo(STATE.MENU));
}

function renderPresetsOverlay() {
  const returnState = app.fsm.returnState;
  if (returnState === STATE.START) image(app.assets.images.start, 0, 0, windowWidth, windowHeight);
  else renderMain();

  fill(0, 180); noStroke(); rect(0, 0, windowWidth, windowHeight);

  const panelW = Math.min(windowWidth * 0.82, windowHeight * 1.18);
  const panelH = Math.min(windowHeight * 0.88, windowWidth * 0.95);
  const panelX = (windowWidth - panelW) / 2;
  const panelY = (windowHeight - panelH) / 2;

  const gapX = panelW * 0.025;
  const colW = (panelW - gapX * 5) / 4;
  const colXs = [0, 1, 2, 3].map(i => panelX + gapX + colW / 2 + i * (colW + gapX));

  const rowH = Math.min(windowWidth * 0.033, windowHeight * 0.055);
  const rowGap = rowH * 0.28;
  const presetTextSize = Math.min(windowWidth * 0.014, rowH * 0.42);
  const titleSize = Math.min(windowWidth * 0.026, panelH * 0.042);

  fill(255); rect(panelX, panelY, panelW, panelH, panelH * 0.06);
  fill(0); textAlign(CENTER, CENTER); textStyle(BOLD);
  textSize(titleSize);
  text("Presets", windowWidth / 2, panelY + panelH * 0.065);
  textStyle(NORMAL);

  const presets = builtInPresets();
  const labelY = panelY + panelH * 0.145;
  const loadY = labelY + rowH * 0.95;
  const builtInRowGap = rowH * 2.05;

  // Four preset columns. Each preset has its name centred above its Load button.
  for (let i = 0; i < presets.length; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = colXs[col];
    const y = labelY + row * builtInRowGap;
    const [name, cfg] = presets[i];

    fill(0);
    textAlign(CENTER, CENTER);
    textSize(presetTextSize);
    text(name, x, y);

    app.ui.button(
      "loadBuiltin" + i,
      "Load",
      x,
      loadY + row * builtInRowGap,
      colW * 0.82,
      rowH,
      () => applyPresetConfig(cfg)
    );
  }

  // Custom presets occupy the next row. Load is above Save in each column.
  const customLabelY = labelY + 2 * builtInRowGap + rowH * 0.55;
  const customLoadY = customLabelY + rowH * 0.95;
  const customSaveY = customLoadY + rowH + rowGap;

  for (let i = 0; i < 3; i++) {
    const x = colXs[i];
    const slot = getValidCustomPreset(i);
    const label = slot ? `Custom ${i + 1}: ${slot.name}` : `Custom ${i + 1}: Empty`;

    fill(0);
    textAlign(CENTER, CENTER);
    textSize(presetTextSize);
    text(label, x, customLabelY);

    app.ui.button(
      "loadCustom" + i,
      "Load",
      x,
      customLoadY,
      colW * 0.82,
      rowH,
      () => {
        const current = getValidCustomPreset(i);
        if (current) applyPresetConfig(current.config);
      }
    );

    app.ui.button(
      "saveCustom" + i,
      "Save",
      x,
      customSaveY,
      colW * 0.82,
      rowH,
      () => {
        const current = getValidCustomPreset(i);
        const nameInput = prompt(
          `Name for Custom Preset ${i + 1}:`,
          current?.name || `Custom ${i + 1}`
        );
        if (nameInput === null) return;

        app.settings.customPresets[i] = {
          name: nameInput.trim() || `Custom ${i + 1}`,
          config: getPresetSettingsSnapshot()
        };
        saveSettings();
      }
    );
  }

  app.ui.button(
    "presetsBack",
    "Back",
    windowWidth / 2,
    panelY + panelH * 0.94,
    colW * 1.55,
    rowH,
    () => app.fsm.transitionTo(STATE.SETTINGS)
  );
}

function renderSettingsOverlay() {
  const returnState = app.fsm.returnState;

  if (returnState === STATE.START) {
    image(app.assets.images.start, 0, 0, windowWidth, windowHeight);
  } else if (returnState === STATE.BOX23) {
    drawBox23Screen();
  } else if (returnState === STATE.FINISHED) {
    drawFinishedPanel();
  } else {
    renderMain();
  }

  fill(0, 180);
  noStroke();
  rect(0, 0, windowWidth, windowHeight);

  // Two-column settings layout keeps the full settings list visible without
  // making the panel excessively tall.
  const panelW = Math.min(windowWidth * 0.62, windowHeight * 0.95);
  const panelH = Math.min(windowHeight * 0.91, windowWidth * 0.92);
  const panelX = (windowWidth - panelW) / 2;
  const panelY = (windowHeight - panelH) / 2;

  const gapX = panelW * 0.035;
  const colW = (panelW - gapX * 3) / 2;
  const leftX = panelX + gapX + colW / 2;
  const rightX = panelX + gapX * 2 + colW * 1.5;
  const btnH = Math.min(windowWidth * 0.035, windowHeight * 0.067);
  const gapY = panelH * 0.105;
  const topY = panelY + panelH * 0.30;
  const presetsY = panelY + panelH * 0.17;

  fill(255);
  rect(panelX, panelY, panelW, panelH, panelH * 0.07);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(Math.min(windowWidth * 0.026, panelH * 0.045));
  textStyle(BOLD);
  text("Settings", windowWidth / 2, panelY + panelH * 0.065);
  textStyle(NORMAL);

  // Presets sits on its own, centred at the top of Settings.
  app.ui.button(
    "settingsPresets",
    "Presets",
    windowWidth / 2,
    presetsY,
    colW,
    btnH,
    () => app.fsm.transitionTo(STATE.PRESETS)
  );

  const settingButton = (id, label, x, y, callback) => {
    app.ui.button(id, label, x, y, colW, btnH, callback);
  };

  const rows = [
    ["boxSet", "Box Set: " + (
      app.settings.boxSet === "ITV" ? "ITV" :
      app.settings.boxSet === "C4" ? "Channel 4" : "US"
    ), () => {
      if (app.settings.boxSet === "ITV") app.settings.boxSet = "C4";
      else if (app.settings.boxSet === "C4") app.settings.boxSet = "US";
      else app.settings.boxSet = "ITV";
      saveSettings();
    }],
    ["togSpecialGame", "Special Game: " + (app.settings.enableSpecialGame ? "On" : "Off"), () => {
      app.settings.enableSpecialGame = !app.settings.enableSpecialGame; saveSettings();
    }],
    ["togButtonGame", "Button Game: " + (app.settings.enableButtonGame ? "On" : "Off"), () => {
      app.settings.enableButtonGame = !app.settings.enableButtonGame; saveSettings();
    }],
    ["togCounterOffer", "Counter Offer: " + (app.settings.enableCounterOffer ? "On" : "Off"), () => {
      app.settings.enableCounterOffer = !app.settings.enableCounterOffer; saveSettings();
    }],
    ["togMidRoundOffer", "Random Mid-Round Offers: " + (app.settings.enableMidRoundOffer ? "On" : "Off"), () => {
      app.settings.enableMidRoundOffer = !app.settings.enableMidRoundOffer; saveSettings();
    }],
    ["togSwap", "Swap: " + (app.settings.enableSwap ? "On" : "Off"), () => {
      app.settings.enableSwap = !app.settings.enableSwap; saveSettings();
    }],
    ["togGamble", "Gamble: " + (app.settings.enableGamble ? "On" : "Off"), () => {
      app.settings.enableGamble = !app.settings.enableGamble; saveSettings();
    }],
    ["togBox23", "Box 23/Golden case: " + (app.settings.enableBox23 ? "On" : "Off"), () => {
      app.settings.enableBox23 = !app.settings.enableBox23; saveSettings();
    }],
    ["togJackpotChase", "Jackpot Chase: " + (app.settings.jackpotChase ? "On" : "Off"), () => {
      app.settings.jackpotChase = !app.settings.jackpotChase; saveSettings();
    }],
    ["togRounds", isUS() ? "US Rounds (fixed)" : (
      app.settings.useITVRounds ? "ITV Rounds" : "Channel 4 Rounds"
    ), () => {
      if (!isUS()) {
        app.settings.useITVRounds = !app.settings.useITVRounds;
        saveSettings();
      }
    }]
  ];

  for (let i = 0; i < rows.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? leftX : rightX;
    const y = topY + row * gapY;
    settingButton(rows[i][0], rows[i][1], x, y, rows[i][2]);
  }


  fill(0);
  textSize(Math.min(windowWidth * 0.014, panelH * 0.028));
  text(
    "Changes apply next game (press Restart).",
    windowWidth / 2,
    panelY + panelH * 0.84
  );

  app.ui.button(
    "settingsBack",
    "Back",
    windowWidth / 2,
    panelY + panelH * 0.93,
    colW * 0.55,
    btnH,
    () => app.fsm.transitionTo(STATE.MENU)
  );
}

//
// =======================
// 10) DRAW HELPERS
// =======================
//
function drawHeader() {
  fill(255);
  textSize(windowWidth * 0.022);
  textAlign(CENTER, CENTER);
  text(app.game?.specialGame ? "Deal or No Deal Special!" : "Deal or No Deal", windowWidth * (3 / 8), windowHeight * 0.025);
}

function drawMenuButton() {
  if (
    [STATE.START, STATE.STATS, STATE.MENU, STATE.INFO, STATE.SETTINGS].includes(
      app.fsm.state
    )
  )
    return;

  const x = windowWidth * 0.035;
  const y = windowWidth * 0.02;
  const w = windowWidth * 0.05;
  const h = windowWidth * 0.02;

  app.ui.button("menuBtn", "Menu", x, y, w, h, () => {
    app.fsm.transitionTo(STATE.MENU);
  });
}

function drawRoundedImage(img, x, y, w, h, radius) {
  if (!img) return;
  const ctx = drawingContext;
  ctx.save();
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.clip();
  image(img, x, y, w, h);
  ctx.restore();
}

function drawBoxesFromModel() {
  const g = app.game;
  const { boxW, boxH } = app.layout;

  for (let i = 0; i < g.moneyCount; i++) {
    const b = g.boxes[i];

    if (b.removed) continue;

    stroke(0);
    strokeWeight(1);

    if (!b.opened) {
      const img = isUS()
        ? app.assets.images.usCases[b.id] // Case n.jpg
        : app.assets.images.boxImages[b.id]; // Box n.jpg

      if (isUS()) {
        fill(255);
        rect(b.x, b.y, boxW, boxH, boxH * 0.16);
        drawRoundedImage(img, b.x, b.y, boxW, boxH, boxH * 0.16);
      } else {
        rect(b.x, b.y, boxW, boxH);
        if (img) image(img, b.x, b.y, boxW, boxH);
      }
    } else {
      fill(255);
      rect(b.x, b.y, boxW, boxH, isUS() ? boxH * 0.16 : 0);

      const valColor = b.value < 1000 ? color(0, 100, 255) : color(255, 0, 0);
      fill(valColor);
      rect(b.x + boxW / 20, b.y + boxH / 4, boxW * 0.9, boxH / 2, boxH * 0.08);

      noStroke();
      fill(255);
      textSize(boxW / 6);
      textAlign(CENTER, CENTER);
      text(formatMoney(b.value), b.x + boxW / 2, b.y + boxH / 2);
    }
  }
}

function drawBoardFromModel() {
  const g = app.game;

  const sorted = g.boxes
    .slice(0, g.moneyCount)
    .slice()
    .sort((a, b) => a.value - b.value);

  const yStart = windowHeight * 0.08;

  const rectW = windowWidth * 0.165;
  const rectH = rectW * 0.15;
  const padX = windowWidth * 0.015;
  const padY = rectH / 5;

  // Split board into two halves
  const half = Math.ceil(g.moneyCount / 2);

  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];

    if (c.opened) continue;

    const isLeft = i < half;

    const colX = isLeft
      ? windowWidth * (3 / 8) + padX
      : windowWidth * (9 / 16) + padX / 2;

    const indexInColumn = isLeft ? i : i - half;

    const rowY = yStart + indexInColumn * (rectH + padY);

    strokeWeight(windowHeight / 500);

    stroke(c.value < 1000 ? color(0, 100, 255) : color(255, 0, 0));

    fill(0);
    rect(colX, rowY, rectW, rectH, rectH * 0.16);

    noStroke();
    fill(255);
    textSize(rectH * 0.4);
    textAlign(CENTER, CENTER);

    text(formatMoney(c.value), colX + rectW / 2, rowY + rectH / 2);
  }
}

function drawBox23Mini() {
  if (
    app.fsm.state === STATE.START ||
    app.fsm.state === STATE.MENU ||
    app.fsm.state === STATE.STATS ||
    app.fsm.state === STATE.INFO ||
    app.fsm.state === STATE.SETTINGS ||
    app.fsm.state === STATE.FINISHED ||
    !app.settings.enableBox23
  ) {
    return;
  }

  const img = isUS()
    ? app.assets.images.goldenCase
    : app.assets.images.boxImages[22];

  if (!img) return;

  const rectW = windowWidth * 0.065;

  // Keep Box 23 image proportions
  const rectH = rectW * (55 / 84);

  const edgeGap = windowWidth * 0.015;

  const x = edgeGap + rectW / 2;
  const y = windowHeight - edgeGap - rectH / 2;

  imageMode(CORNER);
  if (isUS()) drawRoundedImage(img, x - rectW / 2, y - rectH / 2, rectW, rectH, rectH * 0.16);
  else image(img, x - rectW / 2, y - rectH / 2, rectW, rectH);

  imageMode(CORNER);
}

function removeOpenedBoxesExcept(exceptBox = null) {
  const g = app.game;

  for (const b of g.boxes.slice(0, g.moneyCount)) {
    if (b.opened && b !== exceptBox) {
      b.removed = true;
    }
  }
}

function drawBox23Screen() {
  const g = app.game;
  const cx = windowWidth * (3 / 8);

  image(
    app.assets.images.background,
    0,
    0,
    windowWidth * CFG.boardWidthFrac,
    windowHeight
  );

  // ---- Box 23 / Golden Case image (LEFT) ----
  const img = isUS()
    ? app.assets.images.goldenCase
    : app.assets.images.boxImages[22];

  if (img) {
    imageMode(CORNER);

    const w = windowWidth * 0.22;
    const h = w * (55 / 84);
    const x = windowWidth * 0.25 - w / 2;
    const y = windowHeight * 0.45 - h / 2;

    if (isUS()) drawRoundedImage(img, x, y, w, h, h * 0.16);
    else image(img, x, y, w, h);
  }

  // ---- Possible winnings (RIGHT) ----

  const initial = g.initialTakenHome;

  const effects = g.specialGame && Array.isArray(g.specialBox23Effects)
    ? [...g.specialBox23Effects]
    : [
        "DOUBLE",
        isUS() ? "+$25,000" : isC4() ? "+£10,000" : "+£5,000",
        "MONEY BACK",
        "HALF",
        "NOTHING",
      ];

  const outcomes = effects.map((effect) => ({
    effect,
    value: resolveBox23(initial, effect, true),
  }));

  // Highest first
  outcomes.sort((a, b) => b.value - a.value);

  const rectW = windowWidth * 0.18;
  const rectH = windowHeight * 0.06;

  const colCenter = windowWidth * 0.5;
  const colX = colCenter - rectW / 2;
  const gap = windowHeight * 0.015;
  const startY = windowHeight * 0.45 - 2 * (rectH + gap) - rectH / 2;

  outcomes.forEach((o, i) => {
    const rowY = startY + i * (rectH + gap);

    const negativeEffect = ["HALF", "QUARTER", "NOTHING"].includes(o.effect);
    fill(negativeEffect ? color(0, 100, 255) : color(255, 0, 0));

    stroke(255);
    strokeWeight(2);

    rect(colX, rowY, rectW, rectH, rectH * 0.16);

    fill(255);
    noStroke();

    textAlign(CENTER, CENTER);
    textSize(rectH * 0.4);

    text(
      o.effect === "NOTHING" ? "NOTHING" : formatMoney(o.value),
      colX + rectW / 2,
      rowY + rectH / 2
    );
  });
  imageMode(CORNER);
}

function drawRibbonFromModel() {
  const g = app.game;
  
  rectMode(CORNER);

  const ribbonW = windowWidth * CFG.ribbonWidthFrac;
  const x = windowWidth - ribbonW;

  fill(50);
  noStroke();
  rect(x, 0, ribbonW, windowHeight);

  fill(255);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);

  const padding = windowWidth * 0.025;
  const labelX = x + padding;
  const valueX = x + ribbonW * 0.7;

  let lineY = padding;

  textSize(windowWidth * 0.02);
  text("Game Info", labelX, lineY);
  lineY += windowWidth * 0.031;

  textSize(windowWidth * 0.012);
  if (g.specialGame) {
    text("Special Game:", labelX, lineY);
    lineY += windowWidth * 0.016;
    if (g.specialAmounts) { text("   Boosted Boxes", labelX, lineY); lineY += windowWidth * 0.016; }
    if (g.specialLookMode === "CLOWN") { text("   Clown Game", labelX, lineY); lineY += windowWidth * 0.016; }
    else if (g.specialLookMode === "SECOND_CHANCE") { text("   Second Chance Button", labelX, lineY); lineY += windowWidth * 0.016; }
    text((isUS() ? "   Golden Case: " : "   Box 23: ") + getSpecialBox23Type(g.specialBox23Effects), labelX, lineY);
    lineY += windowWidth * 0.016;
  }


  // Banker Mood
  text("Banker Mood:", labelX, lineY);

  const mood = app.game.getStartingMood();

  let moodText;
  if (mood >= 1.06) {
    moodText = "Elated";
  } else if (mood >= 1.02) {
    moodText = "Gleeful";
  } else if (mood >= 0.98) {
    moodText = "Indifferent";
  } else if (mood >= 0.94) {
    moodText = "Frustrated";
  } else {
    moodText = "Furious";
  }

  text(moodText, valueX, lineY);
  lineY += windowWidth * 0.016;

  // Offer (show "-" during Button Game instead of disappearing)
  text("Banker's Offer:", labelX, lineY);
  const offerText =
    (app.fsm.state === STATE.BUTTON_GAME || app.fsm.state === STATE.SPECIAL_SECOND_CHANCE) || !g.offerRibbonVisible
      ? "-"
      : g.offer > 0
      ? formatMoney(g.offer)
      : "-";
  text(offerText, valueX, lineY);
  lineY += windowWidth * 0.016;

  // Highest (show "-" during Button Game instead of disappearing)
  text("Highest Offer:", labelX, lineY);
  const highText =
    app.fsm.state === STATE.BUTTON_GAME
      ? "-"
      : g.highestOffer > 0
      ? formatMoney(g.highestOffer)
      : "-";
  text(highText, valueX, lineY);
  lineY += windowWidth * 0.016;

  // Round information
  const totalRounds = getRounds(app.settings.boxSet).length;
  const currentRound = Math.min(displayRound(g.roundIndex), totalRounds);

  text("Round:", labelX, lineY);
  text(`${currentRound} of ${totalRounds}`, valueX, lineY);
  lineY += windowWidth * 0.016;

  text("Boxes to open:", labelX, lineY);
  if (app.fsm.state === STATE.OPENING)
    text(String(g.boxesToOpen ?? 0), valueX, lineY);
  else text("-", valueX, lineY);
  lineY += windowWidth * 0.016;

  // Next round boxes
  text("Boxes next round:", labelX, lineY);

  const rounds = getRounds();
  if (g.roundIndex != rounds.length - 1) {

    let nextRoundIndex = g.roundIndex + 1;

    const nextBoxes = rounds[nextRoundIndex];
    text(`${nextBoxes}`, valueX, lineY);
  } else {
    text("-", valueX, lineY);
  }

  lineY += windowWidth * 0.016;

  // Condensed Offer History (2 columns)
  if (g.offerHistory.length > 0) {
    text("Offers:", labelX, lineY);
    lineY += windowWidth * 0.016;

    const colWidth = ribbonW * 0.42;
    const historyY = lineY;

    const visibleHistory = g.offerHistory.filter((offer) => !(offer.buttonGame && g.buttonGameOfferHidden));
    visibleHistory.forEach((offer, i) => {
      const col = Math.floor(i / 5);
      const row = i % 5;

      const hx = labelX + col * colWidth;
      const hy = historyY + row * windowWidth * 0.016;

      const historyLabel = offer.counter
        ? `CR${offer.round}`
        : offer.midRound
        ? `MR${offer.round}`
        : `R${offer.round}`;
      text(historyLabel, hx, hy);

      text(formatMoney(offer.amount), hx + colWidth * 0.35, hy);
    });

    const rows = Math.min(visibleHistory.length, 5);
    lineY += rows * windowWidth * 0.016;
    lineY += windowWidth * 0.01;
  }

  // Button game status
  if (g.buttonGameSuccess !== null && app.fsm.state !== STATE.BUTTON_GAME) {
    text("Button Game:", labelX, lineY);
    text(g.buttonGameSuccess ? "Success" : "Failure", valueX, lineY);
    lineY += windowWidth * 0.016;
  }
  if (g.secondButtonGameAttempted && g.secondButtonGameResultHandled) {
    text("2nd Button Game:", labelX, lineY);
    text(g.secondButtonGameSuccess ? "Success" : "Failure", valueX, lineY);
    lineY += windowWidth * 0.016;
  }

  // Deal accepted
  if (g.dealAccepted != null && !g.counterOfferAccepted) {
    text("You Dealt At:", labelX, lineY);
    text(formatMoney(g.dealAccepted), valueX, lineY);
    lineY += windowWidth * 0.02;
  }

  // Money in box
  if (g.playerBox?.opened) {
    text("Money in Box:", labelX, lineY);
    text(formatMoney(g.playerBox.value), valueX, lineY);
    lineY += windowWidth * 0.02;
  }

  // Final
  if (app.fsm.state === STATE.FINISHED && g.finalTakeHome != null) {
    text("Money Taken Home:", labelX, lineY);
    text(formatMoney(g.finalTakeHome), valueX, lineY);
    lineY += windowWidth * 0.02;
  }

  // ----- Player Box -----
  if (g.playerBox) {
    const boxW = ribbonW * 0.62;
    const boxH = boxW * (55 / 84);

    const boxX = x + ribbonW / 2;
    const boxY = windowHeight * 0.84;

    fill(255);

    // Still unopened
    if (!g.playerBox.opened) {
      const img = isUS()
        ? app.assets.images.usCases[g.playerBox.id]
        : app.assets.images.boxImages[g.playerBox.id];

      imageMode(CORNER);
      if (isUS()) {
        drawRoundedImage(img, boxX - boxW / 2, boxY - boxH / 2, boxW, boxH, boxH * 0.16);
      } else if (img) {
        image(img, boxX - boxW / 2, boxY - boxH / 2, boxW, boxH);
      }
      imageMode(CORNER);
    }

    // Opened player box
    else {
      fill(255);
      rectMode(CENTER);
      rect(boxX, boxY, boxW, boxH, isUS() ? boxH * 0.16 : 0);

      const valColor =
        g.playerBox.value < 1000 ? color(0, 100, 255) : color(255, 0, 0);

      fill(valColor);
      rect(boxX, boxY, boxW * 0.9, boxH * 0.5, boxH * 0.08);

      noStroke();
      fill(255);
      textSize(boxW / 6);
      textAlign(CENTER, CENTER);
      text(formatMoney(g.playerBox.value), boxX, boxY);
    }
  }

  // Mid-offer button (one time)
  // The button is only visible when an offer has actually been earned:
  // either a random mid-round offer was triggered, or the player won the
  // Button Game. Merely enabling Random Mid-Round Offers must not display it.
  const canShowMidOffer =
    g.canShowMidOffer === true &&
    g.buttonGameSuccess === true &&
    !g.midRoundOfferUsed &&
    !g.midOfferPending &&
    g.dealAccepted === null &&
    app.fsm.state === STATE.OPENING &&
    g.roundBoxesToOpen > 1;

  if (canShowMidOffer) {
    const btnW = ribbonW * 0.86;
    const btnH = windowWidth * 0.032;
    const btnX = x + ribbonW / 2;
    const btnY = Math.min(windowHeight * 0.7, lineY + windowWidth * 0.04);

    app.ui.button(
      "midOffer",
      "Get Offer Now (one time use)",
      btnX,
      btnY,
      btnW,
      btnH,
      () => {
        app.audio.stopLoops();
        app.audio.activeCategory = null;
        app.audio.oneShot("phone");

        waitForPhone(() => {
          g.midRoundOfferUsed = true;
          g.offerDecisionPending = false;
          g.nextOfferHistoryType = "MR";
          g.midOfferFromButtonGame = g.buttonGameSuccess === true;
          if (g.midOfferFromButtonGame) g.midOfferPenalty = 1;
          g.calculateOffer();
          g.midOfferPending = false;
          g.canShowMidOffer = false;
          app.fsm.transitionTo(STATE.OFFER);
        });
      }
    );
  }
}

function clownImage(id) {
  // Deliberately use the opposite set of assets: US -> Boxes, UK/C4 -> Cases.
  return isUS() ? app.assets.images.boxImages[id] : app.assets.images.usCases[id];
}

function renderClownGame() {
  const g = app.game;
  const cx = windowWidth * (3 / 8);
  const count = g.clownResults.length;
  const boxW = Math.min(windowWidth * 0.12, windowHeight * 0.25);
  const boxH = boxW * (app.layout.boxH / app.layout.boxW);
  const gap = windowWidth * 0.018;
  const totalW = count * boxW + (count - 1) * gap;
  const startX = cx - totalW / 2;
  const y = windowHeight * 0.32;

  imageMode(CORNER);
  image(app.assets.images.background, 0, 0, windowWidth * CFG.boardWidthFrac, windowHeight);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(windowWidth * 0.026);
  text("CLOWN GAME", cx, windowHeight * 0.16);
  textSize(windowWidth * 0.016);
  text("Pick a clown", cx, windowHeight * 0.22);

  g.clownResults.forEach((c, i) => {
    const x = startX + i * (boxW + gap);
    if (c.picked) {
      fill(255);
      rect(x, y, boxW, boxH);
      fill(c.funny ? 255 : 0, c.funny ? 0 : 100, c.funny ? 0 : 255);
      textSize(windowWidth * 0.015);
      text(c.funny ? "FUNNY" : "PHONEY", x + boxW / 2, y + boxH / 2);
    } else {
      const img = clownImage(i);
      if (isUS()) drawRoundedImage(img, x, y, boxW, boxH, boxH * 0.16);
      else image(img, x, y, boxW, boxH);
    }
  });

  drawRibbonFromModel();
  drawHeader();
  drawMenuButton();
}

function drawPrompts() {
  const s = app.fsm.state;
  const g = app.game;
  const cx = windowWidth * (3 / 8);

  fill(255);
  textStyle(NORMAL);

  const btnW = windowWidth * 0.18;
  const btnH = windowWidth * 0.05;
  const buttonGap = windowWidth * 0.02;

  const bottomPadding = windowHeight * 0.025;
  const gapToButton = windowHeight * 0.02;

  const lines = [];
  let buttons = [];

  const addLine = (text, size = 0.02) => lines.push({ text, size });
  const setButtons = (arr) => {
    buttons = arr || [];
  };

  if (s === STATE.PICK_PLAYER_BOX) {
    if (g.specialGame) {
      specialMechanicsText().forEach(line => addLine(line));
    }
    addLine("Pick your box.");
  } else if (s === STATE.SPECIAL_SECOND_CHANCE) {
    g.offerRibbonVisible = false;

    // For the special Round 3 Second Chance, show the round's additional
    // commentary here, above the choice to accept or reject the second
    // Button Game. It should not be shown during the Button Game itself or
    // on the resulting offer screen.
    if (g.roundIndex === 2) {
      const additionalText = getRoundAdditionalText();
      if (additionalText) {
        if (additionalText.primary) addLine(additionalText.primary);
        if (additionalText.secondary) addLine(additionalText.secondary);
        if (additionalText.tertiary) addLine(additionalText.tertiary);
      }
    }

    addLine("SECOND CHANCE");
    addLine("The Banker is offering you a second chance at the Button Game.");
    addLine("Deal or No Deal?");
    setButtons([
      { id: "specialSecondChanceYes", label: "Deal", onClick: () => {
        g.specialSecondChanceUsed = true;
        g.secondButtonGameAttempted = true;
        g.secondButtonGameOriginalOffer = g.offer;
        g.secondButtonGameOfferChanged = null;
        g.secondButtonGameOfferText = null;
        g.secondButtonGameOfferTextShown = false;
        g.guessInput = "";
        g.pendingOffer = null;
        app.audio.oneShot("largeClap");
        setTimeout(() => {
          // The second Button Game guesses the original offer. A failed guess
          // alone gives the Banker new information and triggers a separate
          // recalculation afterwards.
          app.fsm.transitionTo(STATE.BUTTON_GAME);
        }, 500);
      } },
      { id: "specialSecondChanceNo", label: "No Deal", onClick: () => {
        g.specialSecondChanceUsed = true;
        app.audio.oneShot("largeClap");
        setTimeout(() => {
          // The Round 3 offer only enters history once the player declines the
          // Second Chance Button Game.
          g.pendingOffer = null;
          g.offerRibbonVisible = false;
          g.recordCurrentOfferHistory();
          app.fsm.transitionTo(STATE.OFFER);
        }, 500);
      } },
    ]);
  } else if (s === STATE.CLOWN_GAME) {
    addLine("CLOWN GAME");
    addLine(`${g.clownResults.length - 1} clowns are phoney. One clown is funny.`);
    addLine("Keep picking until you get the funny clown.");

    // In live play, Round 5's additional-round text is shown on the Clown
    // Game screen because the Clown Game replaces the normal Round 5 offer.
    if (g.dealAccepted == null && g.roundIndex === 4) {
      const additionalText = getRoundAdditionalText();
      if (additionalText) {
        if (additionalText.primary) addLine(additionalText.primary);
        if (additionalText.secondary) addLine(additionalText.secondary);
        if (additionalText.tertiary) addLine(additionalText.tertiary);
      }
    }
  } else if (s === STATE.BUTTON_GAME) {
    addLine("BUTTON GAME");
    addLine("Guess what the offer will be.");
    addLine("Type a number and press ENTER.");
    addLine("Your guess: " + (g.guessInput.length ? "£" + g.guessInput : "_"));

    setButtons([
      {
        id: "bgPrompt",
        label: "Enter Guess",
        onClick: () => {
          const v = prompt(
            "Enter your guess (numbers only):",
            g.guessInput || ""
          );
          if (v === null) return;
          const cleaned = String(v).replace(/[^\d]/g, "");
          if (!cleaned.length) return;
          g.guessInput = cleaned;
          submitButtonGameGuess();
        },
      },
    ]);
  } else if (s === STATE.BUTTON_GAME_RESULT) {
    const lower = g.buttonGameLower;
    const upper = g.buttonGameUpper;

    addLine("BUTTON GAME RESULT");
    addLine("Banker's offer: " + formatMoney(g.offer));
    addLine(
      "Acceptance Range: " + formatMoney(lower) + " - " + formatMoney(upper)
    );

    addLine(g.buttonGameSuccess ? "Button Game Won!" : "Button Game Lost!");

    setButtons([
      {
        id: "continueButtonGame",
        label: "Continue",
        onClick: () => onButtonGameResultKey_simulate(" "),
      },
    ]);
  } else if (s === STATE.COUNTER_OFFER) {
    addLine("COUNTER OFFER");
    addLine("Enter your counter offer");
    addLine("Counter: " + (g.counterOfferInput || "_"));
    setButtons([{id:"submitCounter",label:"Submit Counter Offer",onClick:submitCounterOffer},{id:"cancelCounter",label:"Cancel",onClick:()=>app.fsm.transitionTo(STATE.OFFER)}]);
  } else if (s === STATE.COUNTER_OFFER_RESULT) {
    addLine(g.counterOfferResult === "accepted" ? "Counter offer accepted!" : "Counter offer rejected!");
    setButtons([{
      id: "counterResultContinue",
      label: "Continue",
      onClick: continueAfterCounterOfferResult
    }]);
  } else if (s === STATE.OFFER) {
    if ((!app.settings.enableButtonGame || g.roundIndex !== 0) && !g.offerRevealingAfterDeal && !(g.roundIndex === 2 && g.secondButtonGameAttempted)) {
      const additionalText = getRoundAdditionalText();
    
      if (additionalText) {
        if (additionalText.primary) {
          addLine(additionalText.primary);
        }
      
        if (additionalText.secondary) {
          addLine(additionalText.secondary);
        }
      
        if (additionalText.tertiary) {
          addLine(additionalText.tertiary);
        }
      }      
    }

    if (g.dealAccepted == null) {
      if (g.unexpectedMidOffer) {
        addLine("The Banker is making an unexpected offer!");
        if (g.midOfferReason === "meanDecrease") addLine("He is laughing");
        else if (g.midOfferReason === "safetyDecrease") addLine("He says, don't risk another box");
      }

      if (g.specialGame && (g.bankerKnownBoxIds?.size || g.bankerLookedAtPlayer)) {
        (g.bankerLookPresentationLines || []).forEach(line => addLine(line));
      }
      // Second Chance Button Game offer text has deliberately different
      // wording in Round 3 versus later rounds. Round 3 is the first
      // presentation of the information and therefore includes the
      // recalculated/sticking explanation. Later rounds use the normal
      // offer wording and never mention a recalculation.
      if (g.secondButtonGameOfferText || g.secondButtonGameOfferChanged !== null) {
        const round = displayRound(g.roundIndex);
        const livePlay = g.dealAccepted == null;
        const sufficientlyDifferent = !!g.secondButtonGameOfferChanged;

        if (round === 3) {
          if (g.isGovernorOffer && sufficientlyDifferent) {
            addLine(`The Banker's recalculated offer is the Governor, ${formatMoney(g.offer)}. Deal or No Deal?`);
          } else {
            addLine(
              sufficientlyDifferent
                ? `The Banker's recalculated offer is ${formatMoney(g.offer)}. Deal or No Deal?`
                : `The Banker is sticking at ${formatMoney(g.offer)}. Deal or No Deal?`
            );
          }
        } else if (livePlay) {
          addLine(
            g.isSticking
              ? `The Banker is sticking at ${formatMoney(g.offer)}. Deal or No Deal?`
              : `The Banker has offered you ${formatMoney(g.offer)}. Deal or No Deal?`
          );
        } else {
          addLine(
            g.isSticking
              ? `The Banker would have stuck at ${formatMoney(g.offer)}.`
              : `The Banker would have offered you ${formatMoney(g.offer)}.`
          );
        }
      }
      if (g.secondButtonGameOfferChanged === null && g.isSticking) {
        addLine(
          "The Banker is sticking at " + formatMoney(g.offer)
        );
      } else if (g.secondButtonGameOfferChanged !== null) {
        // The recalculated/sticking text above already contains the full offer prompt.
      } else if (g.isGovernorOffer) {
        addLine(
          "The Banker has offered you the Governor, " + formatMoney(g.offer)
        );
      } else {
        addLine(
          "The Banker has offered you " +
            (g.offer > 0 ? formatMoney(g.offer) : "-") +
            ". Deal or No Deal?"
        );
      }

      if (g.offerIsTopOfGame) {
        addLine("Top of the Game");
      }

      addLine("Choose an option below.");

      setButtons([
        {
          id: "dealBtn",
          label: "Deal",
          onClick: () => onOfferKey_simulate("Y"),
        },
        {
          id: "noDealBtn",
          label: "No Deal",
          onClick: () => onOfferKey_simulate("N"),
        },
        ...(app.settings.enableCounterOffer && (!g.counterOfferUsed || (isUS() && g.specialGame && g.specialLookMode === "CLOWN" && g.clownGameCompleted && !g.counterOfferExtraUsed)) ? [{
          id: "counterBtn", label: "Counter Offer",
          onClick: () => {
            g.counterOfferBase = Math.max(g.offer, g.fairOfferBeforeRandomness ?? g.offer);
            g.counterOfferMean = g.unopenedNon23().reduce((a,b)=>a+b.value,0) / Math.max(1,g.unopenedNon23().length);
            g.counterOfferInput = "";
            app.fsm.transitionTo(STATE.COUNTER_OFFER);
          }
        }] : []),
      ]);
    } else if (!g.offerRevealingAfterDeal) {
      if (g.isSticking) {
        addLine(
          "The Banker would have stuck at " + formatMoney(g.offer)
        );
      } else if (g.isGovernorOffer) {
        addLine(
          "The Banker would have offered you the Governor, " +
            formatMoney(g.offer)
        );
      } else {
        addLine("The Banker would have offered you " + formatMoney(g.offer));
      }

      if (g.offerIsTopOfGame) {
        addLine("Top of the Game");
      }

      addLine("Continue to reveal.");

      setButtons([
        {
          id: "contBtn",
          label: "Continue",
          onClick: () => onOfferKey_simulate(" "),
        },
      ]);
    }
  } else if (s === STATE.SWAP) {
    if (g.dealAccepted == null) {
      addLine("The Banker has offered the Swap.");
    } else {
      addLine("The Banker would have offered you the Swap.");
    }

    addLine("Swap or No Swap?");

    setButtons([
      { id: "swapYes", label: "Swap", onClick: () => onSwapKey_simulate("Y") },
      {
        id: "swapNo",
        label: "No Swap",
        onClick: () => onSwapKey_simulate("N"),
      },
    ]);
  } else if (s === STATE.GAMBLE) {
    addLine("The Banker has offered the Gamble.");
    addLine("Exchange " + formatMoney(g.initialTakenHome) + "?");

    setButtons([
      { id: "gYes", label: "Deal", onClick: () => onGambleKey_simulate("Y") },
      { id: "gNo", label: "No Deal", onClick: () => onGambleKey_simulate("N") },
    ]);
  } else if (s === STATE.END_REVEAL) {
    if (!g.gameLogged) {
      addLine("Reveal your box.");

      setButtons([
        {
          id: "revealBtn",
          label: "Reveal",
          onClick: () => onEndRevealKey_simulate(" "),
        },
      ]);
    } else {
      setButtons([
        {
          id: "restart",
          label: "Restart",
          onClick: () => {
            app.game.reset(CFG, app.layout);
            app.fsm.returnState = null;
            app.fsm.transitionTo(STATE.START);
          },
        },
      ]);
    }
  } else if (s === STATE.BOX23) {
    const gcName = isUS() ? "Golden Case" : "Box 23";

    if (g.box23Accepted == null) {
      addLine(
        "Buy " + gcName + " for " + formatMoney(g.initialTakenHome) + "?"
      );

      setButtons([
        {
          id: "b23Yes",
          label: "Deal",
          onClick: () => onBox23Key_simulate("Y"),
        },
        {
          id: "b23No",
          label: "No Deal",
          onClick: () => onBox23Key_simulate("N"),
        },
      ]);
    } else {
      addLine("Reveal " + gcName + ".");

      setButtons([
        {
          id: "b23Reveal",
          label: "Reveal",
          onClick: () => onBox23Key_simulate(" "),
        },
      ]);
    }
  } else if (s === STATE.FINISHED) {
    setButtons([
      {
        id: "restart",
        label: "Restart",
        onClick: () => {
          app.game.reset(CFG, app.layout);
          app.fsm.returnState = null;
          app.fsm.transitionTo(STATE.START);
        },
      },
    ]);
  } else return;

  // ---- Layout calculation ----

  const hasButtons = buttons.length > 0;

  const btnY = hasButtons ? windowHeight - bottomPadding - btnH / 2 : null;

  const buttonTop = hasButtons ? btnY - btnH / 2 : windowHeight;

  const lineHeights = lines.map((l) => windowWidth * l.size * 1.3);
  const textBlockH = lineHeights.reduce((a, b) => a + b, 0);

  const startY = buttonTop - gapToButton - textBlockH;

  textAlign(CENTER, TOP);

  let y = startY;

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    textSize(windowWidth * ln.size);
    text(ln.text, cx, y);

    y += lineHeights[i];
  }

  if (hasButtons) {
    const totalWidth = buttons.length * btnW + (buttons.length - 1) * buttonGap;
    const startX = cx - totalWidth / 2 + btnW / 2;

    buttons.forEach((b, i) => {
      app.ui.button(
        b.id,
        b.label,
        startX + i * (btnW + buttonGap),
        btnY,
        btnW,
        btnH,
        b.onClick
      );
    });
  }

  textAlign(CENTER, CENTER);

}

// ---- small simulators (so buttons can reuse your key handlers without rewriting logic)
function onOfferKey_simulate(k) {
  const prev = key;
  key = k;
  onOfferKey();
  key = prev;
}
function onSwapKey_simulate(k) {
  const prev = key;
  key = k;
  onSwapKey();
  key = prev;
}
function onGambleKey_simulate(k) {
  const prev = key;
  key = k;
  onGambleKey();
  key = prev;
}
function onEndRevealKey_simulate(k) {
  const prev = key;
  key = k;
  onEndRevealKey();
  key = prev;
}
function onBox23Key_simulate(k) {
  const prev = key;
  key = k;
  onBox23Key();
  key = prev;
}

function drawFinishedPanel() {
  const g = app.game;

  const cx = windowWidth * (3 / 8);

  imageMode(CORNER);
  image(
    app.assets.images.background,
    0,
    0,
    windowWidth * CFG.boardWidthFrac,
    windowHeight
  );

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(windowWidth * 0.02);
  text("Box 23 Offer", cx, windowHeight * 0.1);

  // ==========================
  // Opened Box 23 (LEFT)
  // ==========================

  rectMode(CENTER);

  const boxW = windowWidth * 0.22;
  const boxH = boxW * (55 / 84);

  const boxX = windowWidth * 0.25;
  const boxY = windowHeight * 0.45;

  // White box background
  fill(255);
  rect(boxX, boxY, boxW, boxH);

  const special = g.boxes[g.goldenIndex].value;
  const isSpecial = typeof special === "string";
  const displaySpecial = isSpecial ? special : formatMoney(special);

  let valColor;
  
  if (isSpecial) {
    if (special === "DOUBLE" || special === "MONEY BACK" || special.startsWith("+")) {
      valColor = color(255, 0, 0);
    } else if (["HALF", "QUARTER", "NOTHING"].includes(special)) {
      valColor = color(0, 100, 255);
    }
  } else {
    valColor = special < 1000 ? color(0, 100, 255) : color(255, 0, 0);
  }
  
  fill(valColor);
  rect(boxX, boxY, boxW * 0.9, boxH * 0.5, boxH * 0.08);

  noStroke();
  fill(255);
  textSize(boxH * 0.2);

  text(isSpecial ? displaySpecial : formatMoney(special), boxX, boxY);

  // ==========================
  // Possible winnings (RIGHT)
  // ==========================

  rectMode(CORNER);

  const initial = g.initialTakenHome;

  const effects = g.specialGame && Array.isArray(g.specialBox23Effects)
    ? [...g.specialBox23Effects]
    : [
        "DOUBLE",
        isUS() ? "+$25,000" : isC4() ? "+£10,000" : "+£5,000",
        "MONEY BACK",
        "HALF",
        "NOTHING",
      ];

  const outcomes = effects.map((effect) => ({
    effect,
    value: resolveBox23(initial, effect, true),
  }));

  outcomes.sort((a, b) => b.value - a.value);

  const rectW = windowWidth * 0.18;
  const rectH = windowHeight * 0.06;

  const colCenter = windowWidth * 0.5;
  const colX = colCenter - rectW / 2;

  const gap = windowHeight * 0.015;

  // MONEY BACK aligns with Box 23 centre
  const startY = boxY - 2 * (rectH + gap) - rectH / 2;

  outcomes.forEach((o, i) => {
    const rowY = startY + i * (rectH + gap);

    const negativeEffect = ["HALF", "QUARTER", "NOTHING"].includes(o.effect);
    fill(negativeEffect ? color(0, 100, 255) : color(255, 0, 0));

    stroke(255);
    strokeWeight(2);

    rect(colX, rowY, rectW, rectH, rectH * 0.16);

    noStroke();
    fill(255);

    textAlign(CENTER, CENTER);
    textSize(rectH * 0.4);

    text(
      o.effect === "NOTHING" ? "NOTHING" : formatMoney(o.value),
      colX + rectW / 2,
      rowY + rectH / 2
    );
  });

  // ==========================
  // Result
  // ==========================

  fill(255);
  textSize(windowWidth * 0.02);

  let resultText = "";

  if (g.result === "Spanked") resultText = "You Spanked the Banker";
  else if (g.result === "Beat") resultText = "You Beat The Banker!";
  else if (g.result === "Drew") resultText = "You Drew with The Banker";
  else if (g.result === "Lost") resultText = "The Banker Beat You";
  else if (g.result === "Humbled") resultText = "You Got Humbled";

  text(resultText, cx, windowHeight * 0.85);
  rectMode(CENTER);
}

function displayRound(roundIndex) {
  return roundIndex + 1;
}

//
// =======================
// 11) STATS
// =======================
//
function drawStatsScreen() {
  const g = app.game;

  const W = windowWidth;
  const rowH = W * 0.016;

  push();

  translate(0, -g.scrollOffset);

  fill(255);
  textAlign(CENTER, CENTER);

  textSize(W * 0.026);
  textStyle(BOLD);
  text("Game Statistics", W / 2, W * 0.04);

  textStyle(NORMAL);

  let y = W * 0.075;

  // ----------------------------
  // Summary calculations
  // ----------------------------

  let spanked = 0;
  let beat = 0;
  let drew = 0;
  let lost = 0;
  let humbled = 0;

  const totals = {
    ITV: {
      games: 0,
      spanked: 0,
      beat: 0,
      drew: 0,
      lost: 0,
      humbled: 0,
      taken: 0,
      highest: 0,
      box: 0
    },

    C4: {
      games: 0,
      spanked: 0,
      beat: 0,
      drew: 0,
      lost: 0,
      humbled: 0,
      taken: 0,
      highest: 0,
      box: 0
    },

    US: {
      games: 0,
      spanked: 0,
      beat: 0,
      drew: 0,
      lost: 0,
      humbled: 0,
      taken: 0,
      highest: 0,
      box: 0
    }
  };

  for (const row of g.history) {
    // Overall record
    if (row.result === "Spanked") spanked++;
    else if (row.result === "Beat") beat++;
    else if (row.result === "Drew") drew++;
    else if (row.result === "Lost") lost++;
    else if (row.result === "Humbled") humbled++;

    // Per-set statistics
    const set = row.boxSet || "ITV";

    if (!totals[set]) continue;

    const t = totals[set];

    t.games++;

    if (row.result === "Spanked") t.spanked++;
    else if (row.result === "Beat") t.beat++;
    else if (row.result === "Drew") t.drew++;
    else if (row.result === "Lost") t.lost++;
    else if (row.result === "Humbled") t.humbled++;

    t.taken += Number(row.taken) || 0;
    t.highest += Number(row.highest) || 0;
    t.box += Number(row.boxValue) || 0;
  }

  // ----------------------------
  // Overall summary panel
  // ----------------------------

  textAlign(LEFT, CENTER);

  fill(255, 30);
  noStroke();

  rect(
    W * 0.05,
    y - W * 0.015,
    W * 0.9,
    W * 0.045,
    8
  );

  fill(255);

  textSize(W * 0.014);

  text(`Games: ${g.history.length}`, W * 0.08, y);

  text(
    `Record: ${spanked + beat}W  ${drew}D  ${lost + humbled}L`,
    W * 0.38,
    y
  );

  text(
    `S:B:D:L:H  ${spanked}:${beat}:${drew}:${lost}:${humbled}`,
    W * 0.72,
    y
  );

  y += W * 0.055;

  // ============================================================
  // HISTORY TABLE
  // ============================================================

  textAlign(CENTER, CENTER);

  textStyle(BOLD);
  textSize(W * 0.013);

  const xGame = W * 0.06;
  const xSet = W * 0.17;
  const xJackpot = W * 0.28;
  const xTaken = W * 0.41;
  const xHighest = W * 0.56;
  const xBox = W * 0.70;
  const xResult = W * 0.87;

  text("Game", xGame, y);
  text("Box Set", xSet, y);
  text("Chase", xJackpot, y);
  text("Taken", xTaken, y);
  text("Highest", xHighest, y);
  text("Box", xBox, y);
  text("Result", xResult, y);

  stroke(255, 80);
  line(
    W * 0.05,
    y + rowH / 2,
    W * 0.95,
    y + rowH / 2
  );
  noStroke();

  y += rowH * 1.5;

  textStyle(NORMAL);

  for (let i = 0; i < g.history.length; i++) {
    const row = g.history[i];

    // Alternating background
    if (i % 2 === 0) {
      fill(255, 18);
      rect(
        W * 0.04,
        y - rowH / 2,
        W * 0.92,
        rowH,
        5
      );
    }

    fill(255);

    text(`#${i + 1}`, xGame, y);
    text(row.boxSet || "ITV", xSet, y);
    text(row.jackpotChase ? "On" : "Off", xJackpot, y);

    textAlign(RIGHT, CENTER);

    text(
      formatMoney(row.taken, row.boxSet),
      xTaken,
      y
    );

    text(
      formatMoney(row.highest, row.boxSet),
      xHighest,
      y
    );

    text(
      formatMoney(row.boxValue, row.boxSet),
      xBox,
      y
    );

    textAlign(CENTER, CENTER);

    switch (row.result) {
      case "Spanked":
        fill(80, 255, 80);
        break;

      case "Beat":
        fill(150, 255, 150);
        break;

      case "Lost":
        fill(255, 180, 80);
        break;

      case "Humbled":
        fill(255, 80, 80);
        break;

      default:
        fill(255);
    }

    text(row.result, xResult, y);

    fill(255);

    y += rowH;
  }

  // ============================================================
  // PER-SET STATISTICS
  // ============================================================

  y += W * 0.025;

  const sets = ["ITV", "C4", "US"];

  for (const set of sets) {
    const t = totals[set];

    // ----------------------------
    // Set heading
    // ----------------------------

    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(W * 0.019);

    fill(255);

    text(set, W / 2, y);

    y += W * 0.035;

    // ----------------------------
    // Set panel
    // ----------------------------

    fill(255, 30);
    noStroke();

    const panelTop = y - W * 0.015;
    const panelHeight = W * 0.175;

    rect(
      W * 0.05,
      panelTop,
      W * 0.9,
      panelHeight,
      8
    );

    fill(255);

    // ----------------------------
    // Games / record
    // ----------------------------

    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(W * 0.013);

    text("Games", W * 0.08, y);
    text("Record", W * 0.38, y);
    text("S:B:D:L:H", W * 0.70, y);

    textStyle(NORMAL);

    text(t.games, W * 0.08, y + rowH);

    text(
      `${t.spanked + t.beat}W  ${t.drew}D  ${t.lost + t.humbled}L`,
      W * 0.38,
      y + rowH
    );

    text(
      `${t.spanked}:${t.beat}:${t.drew}:${t.lost}:${t.humbled}`,
      W * 0.70,
      y + rowH
    );

    // ----------------------------
    // Money totals
    // ----------------------------

    y += W * 0.045;

    textStyle(BOLD);

    text("Taken", W * 0.18, y);
    text("Highest", W * 0.50, y);
    text("Box", W * 0.82, y);

    y += rowH;

    textStyle(NORMAL);

    textAlign(RIGHT, CENTER);

    text(formatMoney(t.taken, set), W * 0.27, y);
    text(formatMoney(t.highest, set), W * 0.59, y);
    text(formatMoney(t.box, set), W * 0.91, y);

    // ----------------------------
    // Performance
    // ----------------------------

    y += W * 0.04;

    textAlign(LEFT, CENTER);
    textStyle(BOLD);

    text("Taken vs Box Value", W * 0.08, y);
    text("Taken vs Highest", W * 0.58, y);

    textStyle(NORMAL);

    // Percentage difference:
    // (Taken - comparison) / comparison * 100

    const boxDiff =
      t.box === 0
        ? 0
        : ((t.taken - t.box) / t.box) * 100;

    const highestDiff =
      t.highest === 0
        ? 0
        : ((t.taken - t.highest) / t.highest) * 100;

    // Taken vs box
    if (boxDiff > 0) fill(80, 255, 80);
    else if (boxDiff < 0) fill(255, 100, 100);
    else fill(255);

    text(
      `${boxDiff > 0 ? "+" : ""}${Math.round(boxDiff)}%`,
      W * 0.38,
      y
    );

    // Taken vs highest
    if (highestDiff > 0) fill(80, 255, 80);
    else if (highestDiff < 0) fill(255, 100, 100);
    else fill(255);

    text(
      `${highestDiff > 0 ? "+" : ""}${Math.round(highestDiff)}%`,
      W * 0.88,
      y
    );

    fill(255);

    // ----------------------------
    // Move below panel
    // ----------------------------

    y = panelTop + panelHeight + W * 0.035;
  }

  textStyle(NORMAL);

  g.statsHeight = y + W * 0.15;

  pop();
}

function onStatsWheel(evt) {
  const g = app.game;

  const rowH = windowWidth * 0.016;
  const headerSpace = windowWidth * 0.12;
  const visibleH = windowHeight * 0.75;

  const totalH = headerSpace + g.history.length * rowH;
  const maxScroll = Math.max(0, totalH - visibleH);

  g.scrollOffset = constrain(g.scrollOffset - evt.delta, 0, maxScroll);
}

//
// =======================
// 12) INPUT HANDLERS
// =======================
//
function hitBox(b) {
  const { boxW, boxH } = app.layout;
  return (
    pointerX >= b.x &&
    pointerX <= b.x + boxW &&
    pointerY >= b.y &&
    pointerY <= b.y + boxH
  );
}

function onPickPlayerClick() {
  if (app.ui.handleClick(mouseX, mouseY)) return;

  const g = app.game;

  for (const b of g.boxes.slice(0, g.moneyCount)) {
    if (hitBox(b)) {
      g.playerBox = b;

      // Remove from main board permanently
      b.removed = true;

      g.boxesToOpen = getRounds()[g.roundIndex] || 0;
      g.roundBoxesToOpen = g.boxesToOpen;

      setTimeout(() => {
        app.audio.oneShot("largeClap");
      }, 250);

      app.fsm.transitionTo(STATE.OPENING);
      return;
    }
  }
}

function onOpenBoxClick() {
  if (app.ui.handleClick(mouseX, mouseY)) return;
  const g = app.game;

  if (g.roundResolving || g.midOfferPending) return;
  if (millis() - g.lastOpenMs < 120) return;
  g.lastOpenMs = millis();

  for (const b of g.boxes.slice(0, g.moneyCount)) {
    if (b === g.playerBox || b.opened) continue;
    if (!hitBox(b)) continue;

    const beforeValues = g.unopenedNon23().map(x => x.value);
    updateBoxRuns(b.value);

    stopCrowdReaction();

    b.opened = true;
    g.currentRoundOpened.push(b);
    maybeRecalculateBankerLyingChanceAfterProof(b);

    // Once a Banker-viewed box is opened, the Banker no longer has special
    // knowledge of it. Recalculate the special-game offer logic immediately.
    if (g.bankerKnownBoxIds?.delete(b.id)) {
      g.bankerLookResolved = false;
      g.bankerClaimHigherByBoxId.delete(b.id);
      if (g.bankerKnownBoxIds.size === 0 && !g.bankerLookedAtPlayer) {
        g.bankerWantsDeal = null;
      }
    }

    const afterValues = g.unopenedNon23().map(x => x.value);
    g.evaluateMidRoundOpportunity(beforeValues, afterValues);
    b.openedAt = millis();

    removeOpenedBoxesExcept(b);

    decayBankerMood();

    app.audio.oneShot("boxOpen");

    // Jackpot sound depends on box set
    const jackpotValue = Math.max(...getAmounts());

    if (b.value === jackpotValue) {
      setTimeout(() => {
        if (g.dealAccepted != null) {
          app.audio.oneShot("open1p", true);
        } else {
          app.audio.oneShot("open100k", true);
        }
      }, 850);
    } else if (b.value === 0.01 && g.dealAccepted == null) {
      setTimeout(() => {
        app.audio.oneShot("open1p", true);
      }, 850);
    }

    playCrowdReaction(b.value);

    g.boxesToOpen--;

    // Random mid-round offers are forced: unlike a successful Button Game,
    // they do not wait for the player to press "Get Offer Now".
    if (g.randomMidOfferTriggered && g.midOfferPending && g.midOfferFromRandom) {
      const previousOffer = g.offer;
      g.unexpectedMidOffer = true;
      g.roundResolving = true;
      g.offerRibbonVisible = false;
      g.canShowMidOffer = false;
      g.offerDecisionPending = false;
      // Keep the opened box visible briefly during the offer transition, then
      // remove it reliably. This avoids both an abrupt disappearance and the
      // old bug where a box could remain stuck in its opened state forever.
      setTimeout(() => {
        if (b.opened) b.removed = true;
      }, 3000);

      waitForCrowdReaction(() => {
        app.audio.stopLoops();
        app.audio.activeCategory = null;
        app.audio.oneShot("phone");

        waitForPhone(() => {
          g.calculateOffer();
          g.midOfferPending = false;
          g.midOfferFromRandom = false;
          g.randomMidOfferTriggered = false;
          g.roundResolving = false;
          g.lastRoundOpened = [...g.currentRoundOpened];
          g.currentRoundOpened = [];

          app.fsm.transitionTo(STATE.OFFER);

          setTimeout(() => {
            playOfferReaction(previousOffer, g.offer);
          }, 400);
        });
      });
      return;
    }

    // remove after 3 seconds unless another box opens first
    setTimeout(() => {
      if (b.opened && !b.removed) {
        b.removed = true;
      }
    }, 3000);

    if (g.boxesToOpen <= 0) {
      g.roundResolving = true;

      app.audio.stopOneShot("open1p");

      // Determine remaining boxes (before doing any offer logic)
      const other = g.unopenedNon23ExceptPlayer(); // excludes player

      const previousOffer = g.offer;

      // LIVE PLAY
      if (g.dealAccepted == null) {
        if (
          g.specialGame &&
          g.specialLookMode === "CLOWN" &&
          g.roundIndex === 4 &&
          g.clownResults.length === (isUS() ? 5 : 4) &&
          g.clownResults.some(c => !c.picked)
        ) {
          waitForCrowdReaction(() => {
            g.offerRibbonVisible = false;
            g.bankerLookJustChanged = false;
            g.roundResolving = false;
            g.offerDecisionPending = false;
            g.lastRoundOpened = [...g.currentRoundOpened];
            g.currentRoundOpened = [];
            // Only live play activates the shortened post-Clown round
            // structure. Normal rounds are used up to this point.
            g.clownGameRoundsActive = (g.dealAccepted == null);
            // Keep the opening loop alive through the Clown Game.
            app.fsm.transitionTo(STATE.CLOWN_GAME);
          });
          return;
        }

        if (
          g.specialGame &&
          g.specialLookMode === "SECOND_CHANCE" &&
          g.buttonGameSuccess === false &&
          !g.specialSecondChanceUsed &&
          g.dealAccepted == null &&
          g.roundIndex === 2
        ) {
          waitForCrowdReaction(() => {
            // Lock the opening loop as soon as the phone starts ringing.
            g.roundResolving = true;
            app.audio.oneShot("phone");
            waitForPhone(() => {
              // This is the Round 3 offer. Calculate it now, but do NOT put it
              // into offer history yet. The Round 3 offer is provisional until
              // the Second Chance decision is resolved.
              g.calculateOffer(false);
              g.offerRibbonVisible = false;
              g.roundResolving = false;
              g.lastRoundOpened = [...g.currentRoundOpened];
              g.currentRoundOpened = [];
              app.fsm.transitionTo(STATE.SPECIAL_SECOND_CHANCE);
            });
          });
          return;
        }

        if (
          app.settings.enableButtonGame &&
          g.roundIndex === 0 &&
          g.buttonGameSuccess === null
        ) {
          // Show all red/blue and crowd reaction before phone
          waitForCrowdReaction(() => {
            app.audio.stopLoops();
            app.audio.activeCategory = null;

            app.audio.oneShot("phone");

            waitForPhone(() => {
              // The first Button Game offer is deliberately hidden from offer
              // history while the player is trying to guess it.
              g.calculateOffer(false);

              g.pendingOffer = g.offer;
              g.buttonGameOfferHidden = true;
              g.offer = 0;
              g.guessInput = "";

              g.roundResolving = false;
              g.lastRoundOpened = [...g.currentRoundOpened];
              g.currentRoundOpened = [];

              app.fsm.transitionTo(STATE.BUTTON_GAME);
            });
          });

          g.guessInput = "";

          return;
        }

        g.pendingOffer = null;
        g.canShowMidOffer = false;

        // Crowd reaction finishes first
        waitForCrowdReaction(() => {
          app.audio.stopLoops();
          app.audio.activeCategory = null;

          app.audio.oneShot("phone");

          waitForPhone(() => {
            g.calculateOffer();
            g.midOfferPending = false;

            // Only reveal offer after phone finishes
            g.roundResolving = false;

            g.lastRoundOpened = [...g.currentRoundOpened];
            g.currentRoundOpened = [];

            app.fsm.transitionTo(STATE.OFFER);

            setTimeout(() => {
              playOfferReaction(previousOffer, g.offer);
            }, 400);
          });
        });

        return;
      }

      // NOT LIVE PLAY
      
      if (other.length === 1) {
        waitForCrowdReaction(() => {
          app.audio.stopLoops();
          app.audio.activeCategory = null;
      
          app.audio.oneShot("phone");
      
          waitForPhone(() => {
            // Calculate the actual Banker offer first
            g.calculateOffer();
      
            // Now decide whether to offer the gamble
            if (app.settings.enableGamble) {
              const offerGamble = shouldOfferGamble(
                g.playerBox.value,
                other[0].value,
                g.initialTakenHome
              );
      
              if (offerGamble) {
                g.roundResolving = false;
                app.fsm.transitionTo(STATE.GAMBLE);
                return;
              }
            }
      
            // No gamble — proceed to normal offer
            g.roundResolving = false;
            g.lastRoundOpened = [...g.currentRoundOpened];
            g.currentRoundOpened = [];
      
            app.fsm.transitionTo(STATE.OFFER);
          });
        });
      
        return;
      }
      
      waitForCrowdReaction(() => {
        app.audio.stopLoops();
        app.audio.activeCategory = null;
      
        app.audio.oneShot("phone");
      
        waitForPhone(() => {
          g.calculateOffer();
      
          g.roundResolving = false;
          g.lastRoundOpened = [...g.currentRoundOpened];
          g.currentRoundOpened = [];
      
          app.fsm.transitionTo(STATE.OFFER);
        });
      });
      
      return;
    }
  }
}

function onSpecialSecondChanceKey() {
  const g = app.game;
  if (g.offerDecisionPending) return;

  if (key === "Y" || key === "y") {
    g.specialSecondChanceUsed = true;
    g.secondButtonGameAttempted = true;
    g.secondButtonGameOriginalOffer = g.offer;
    g.secondButtonGameOfferChanged = null;
    g.guessInput = "";
    g.pendingOffer = null;
    app.audio.oneShot("largeClap");
    setTimeout(() => app.fsm.transitionTo(STATE.BUTTON_GAME), 500);
    return;
  }

  if (key === "N" || key === "n") {
    g.specialSecondChanceUsed = true;
    app.audio.oneShot("largeClap");
    setTimeout(() => {
      g.pendingOffer = null;
      g.offerRibbonVisible = false;
      app.fsm.transitionTo(STATE.OFFER);
    }, 500);
  }
}

function onClownGameClick() {
  const g = app.game;
  const cx = windowWidth * 3 / 8;
  const count = g.clownResults.length;
  const boxW = Math.min(windowWidth * .12, windowHeight * .25);
  const boxH = boxW * (app.layout.boxH / app.layout.boxW);
  const gap = windowWidth * .018;
  const totalW = count * boxW + (count - 1) * gap;
  const startX = cx - totalW / 2;
  const y = windowHeight * .32;

  if (g.roundResolving) return;

  for (let i = 0; i < count; i++) {
    const c = g.clownResults[i];
    const x = startX + i * (boxW + gap);
    if (c.picked || mouseX < x || mouseX > x + boxW || mouseY < y || mouseY > y + boxH) continue;

    c.picked = c.opened = true;
    g.clownPicked++;
    bankerDebug("clown picked", { pickedIndex: i, funny: c.funny, clownPicked: g.clownPicked, knownBefore: [...g.bankerKnownBoxIds], offer: g.offer });
    app.audio.oneShot("boxOpen");

    if (c.funny) {
      // The Banker knows exactly one new, distinct unopened box for every
      // phoney clown opened. The player box is never eligible.
      const seen = shuffle(
        g.unopenedNon23ExceptPlayer().filter(b => !g.bankerKnownBoxIds.has(b.id))
      ).slice(0, g.clownPicked - 1);
      seen.forEach(b => g.bankerKnownBoxIds.add(b.id));
      bankerDebug("Clown Game Banker look assigned", {
        phoneyClownsOpened: g.clownPicked - 1,
        newlyKnownBoxes: seen.map(b => ({ box: b.id + 1, value: b.value })),
        knownCount: g.bankerKnownBoxIds.size,
        knownBoxes: [...g.bankerKnownBoxIds].map(id => { const b = g.boxes.find(x => x.id === id); return { box: id + 1, value: b?.value }; }),
        bankerLyingChance: g.bankerLyingChance
      });
      g.clownStatementOffer = g.offer;
      g.clownBankerStatements = [];
      g.bankerClaimHigherByBoxId = new Map();
      g.bankerClaimByBoxId = new Map();
      g.bankerPlayerClaimHigher = null;
      g.bankerPlayerClaim = null;
      g.bankerClaimSnapshotByBoxId = new Map();
      g.bankerPlayerClaimSnapshot = null;
      g.bankerNewStatementBoxIds = new Set();
      g.bankerLookResolved = false;
      g.bankerLookJustChanged = true;
      g.bankerLookRevealPending = true;
      g.bankerLookedAtShown = false;
      // The Banker decides what he says he saw at the moment he looks. His
      // statements are now snapshotted against the current offer and remain
      // unchanged even when the Clown Game later changes the offer. They are
      // only invalidated if one of the inspected boxes is actually revealed
      // and proves the Banker wrong.
      resolveBankerClaimsForCurrentOffer(g, true);
      bankerDebug("Clown Game initial Banker claims resolved", { offer: g.offer });
      app.audio.oneShot("largeClap");

      // Reveal the remaining UNOPENED CLOWN GAME boxes immediately after a
      // fixed 2000ms pause. Do not wait for crowd audio. Open each remaining
      // clown 500ms apart, then wait another 2000ms before entering the offer.
      g.roundResolving = true;
      g.offerRibbonVisible = false;
      const revealable = g.clownResults.filter(clown => !clown.picked);
      let ri = 0;
      const revealNext = () => {
        if (ri >= revealable.length) {
          g.clownGameCompleted = true;
          g.clownOfferTransitionPending = true;
          g.offerRibbonVisible = false;
          bankerDebugSummary(g, "Clown Game completed before offer calculation");
      
          g.offerDecisionPending = false;
          g.lastRoundOpened = [...g.currentRoundOpened];
          g.currentRoundOpened = [];
      
          setTimeout(() => {
            // Calculate the offer immediately before transitioning to the offer state.
            if (!g.clownOfferCalculated) {
              g.calculateOffer();
              g.clownOfferCalculated = true;
            }
      
            // Do NOT re-roll the Banker's statements merely because the offer changed.
            // His original claims remain his story unless a revealed box has proved
            // one of them wrong.
            resolveBankerClaimsForCurrentOffer(g);
            bankerDebug("Clown Game Banker claims retained after offer change", {
              offer: g.offer
            });
      
            g.offerRibbonVisible = false;
            app.fsm.transitionTo(STATE.OFFER);
          }, 2000);
      
          return;
        }
      
        const clown = revealable[ri++];
        clown.picked = true;
        clown.opened = true;
      
        // If a clown reveal exposes a box the Banker previously inspected,
        // this is proof of whether his statement was false. Only then may
        // his honesty/claims be re-rolled.
        const revealedBox = g.boxes.find(b => b.id === clown.boxId);
        if (revealedBox) maybeRecalculateBankerLyingChanceAfterProof(revealedBox);
      
        app.audio.oneShot("boxOpen");
        setTimeout(revealNext, 500);
      };
      setTimeout(revealNext, 2000);
    } else {
      app.audio.oneShot("groan");
      waitForCrowdReaction(() => {});
    }
    return;
  }
}

function onButtonGameKey() {
  const g = app.game;

  // backspace edits the input
  if (keyCode === BACKSPACE) {
    g.guessInput = g.guessInput.slice(0, -1);
    return;
  }

  // enter submits
  if (keyCode === ENTER || keyCode === RETURN) {
    submitButtonGameGuess();
    return;
  }

  // digits append
  if (key >= "0" && key <= "9") {
    if (g.guessInput.length < 9) g.guessInput += key;
  }
}

function onButtonGameResultKey_simulate(k) {
  const prev = key;
  key = k;
  onButtonGameResultKey();
  key = prev;
}

function onButtonGameResultKey() {
  if (key === " ") {
    const g = app.game;

    if (g.specialGame && g.specialLookMode === "SECOND_CHANCE" &&
        g.secondButtonGameAttempted && !g.secondButtonGameResultHandled) {
      g.secondButtonGameResultHandled = true;

      bankerDebug("Second Chance Button Game result", {
        success: g.secondButtonGameSuccess, originalOffer: g.secondButtonGameOriginalOffer,
        currentOffer: g.offer, bankerLyingChance: g.bankerLyingChance
      });

      if (g.secondButtonGameSuccess) {
        // Success keeps the original Round 3 offer. The first Button Game
        // result must remain unchanged: winning the Second Chance does not
        // retroactively turn the first Button Game into a success.
        g.offer = g.secondButtonGameOriginalOffer;
        g.canShowMidOffer = true;
        g.midOfferFromButtonGame = true;
        g.midOfferPending = false;
        g.midOfferPenalty = 1;
        g.secondButtonGameOfferChanged = null;
        g.secondButtonGameOfferPendingCommit = false;
        g.commitOfferStatsAndHistory();
        g.offerRibbonVisible = true;
        g.secondButtonGameOfferText = false;
        g.secondButtonGameOfferTextShown = false;
        // The Round 3 offer must still be dealt with before the game advances
        // to Round 4. Transitioning directly to OPENING here skipped that
        // decision and left roundIndex out of sync.
        setTimeout(() => {
          app.fsm.transitionTo(STATE.OFFER);
        }, 1000);
      } else {
        // Only failure causes a new offer calculation, because only then has
        // the Banker gained new information: the contents of the player box.
        g.bankerLookedAtPlayer = true;
        // This is a new physical look at the player's box, but it is not a
        // new look at the boxes the Banker already inspected. Keep all of
        // those statements exactly as they were.
        g.bankerLookJustChanged = true;
        g.bankerLookRevealPending = true;
        g.bankerLookPresentationNew = true;
        // The Banker must first see the player box, then make his claim using
        // the NORMAL offer that would have been calculated without this new
        // information. The old Round 3 offer (e.g. £2,250) must never be used
        // as the claim threshold.
        g.bankerPlayerClaimHigher = null;
        g.bankerPlayerClaim = null;
        g.bankerPlayerClaimSnapshot = null;
        if (!g.bankerNewStatementBoxIds) g.bankerNewStatementBoxIds = new Set();
        g.bankerNewStatementBoxIds.add(g.playerBox.id);

        // Temporarily mark the knowledge as already resolved so calculateOffer
        // produces a completely normal offer and does not generate/apply a
        // claim against the stale previous offer.
        g.bankerLookResolved = true;
        g.pendingOffer = null;
        g.offerRibbonVisible = false;
        g.calculateOffer(false);
        const normalOfferAfterLook = g.offer;

        // Now roll honesty and generate the claim against that freshly
        // calculated normal offer. Only after the claim exists do we perform
        // the knowledge-based recalculation.
        g.bankerLyingChance = g.rollBankerLyingChance();
        g.bankerLookResolved = false;
        resolveBankerClaimsForCurrentOffer(g, true, new Set([g.playerBox.id]));
        bankerDebug("Second Chance failed: Banker looks in player box", {
          playerBox: g.playerBox ? { box: g.playerBox.id + 1, value: g.playerBox.value } : null,
          originalOffer: g.secondButtonGameOriginalOffer,
          normalOffer: normalOfferAfterLook,
          bankerLyingChance: g.bankerLyingChance
        });
        g.pendingOffer = null;
        g.offerRibbonVisible = false;
        g.calculateOffer(false);
        // Treat a change within the normal 5% sticking band as "sticking".
        // Only a materially different recalculation gets the Round 3
        // recalculated-offer wording.
        const originalOffer = g.secondButtonGameOriginalOffer || 0;
        const materiallyDifferent = originalOffer > 0
          ? Math.abs(g.offer - originalOffer) / originalOffer > 0.05
          : g.offer !== originalOffer;
        // calculateOffer() snaps sufficiently-close results to the original
        // offer, so this flag now agrees with the actual displayed amount.
        g.secondButtonGameOfferChanged = materiallyDifferent;
        // Keep the special Round 3 offer wording active so the OFFER state
        // explicitly displays the recalculated/sticking offer after a failed
        // Second Chance Button Game.
        g.secondButtonGameOfferTextShown = false;
        g.secondButtonGameOfferText = true;
        // The original Round 3 offer was deliberately never recorded. The
        // recalculated offer remains pending until OFFER is entered, at which
        // point Highest/Lowest/Top-of-the-Game/history are updated together.
        // Transition immediately so there is no intermediate frame showing
        // the old Round 3 offer.
        app.fsm.transitionTo(STATE.OFFER);
      }
      return;
    }
    app.fsm.transitionTo(STATE.OFFER);
  }
}

function submitCounterOffer() {
  const g = app.game;
  const counter = Number(g.counterOfferInput);
  if (!Number.isFinite(counter) || counter <= 0) return;

  const chance = getCounterOfferChance(
    counter,
    g.offer,
    g.fairOfferBeforeRandomness ?? g.offer,
    g.counterOfferMean
  );
  const accepted = random() < chance;
  const extra = isUS() && g.specialGame && g.specialLookMode === "CLOWN" &&
    g.clownGameCompleted && !g.counterOfferExtraUsed && g.counterOfferUsed;

  if (extra) g.counterOfferExtraUsed = true;
  else g.counterOfferUsed = true;

  g.counterOfferResult = accepted ? "accepted" : "rejected";
  g.counterOfferRejected = !accepted;
  g.offerDecisionPending = false;

  if (accepted) {
    g.offer = roundOffer(counter);
    g.highestOffer = Math.max(g.highestOffer, g.offer);
    g.dealAccepted = g.offer;
    g.counterOfferAccepted = true;
    // The counter is itself the accepted offer, so add its history entry here.
    g.counterOfferCount++;
    g.offerHistory.push({
      round: displayRound(g.roundIndex),
      amount: g.offer,
      counter: true,
      counterNumber: g.counterOfferCount,
    });
    g.initialTakenHome = g.offer;
    g.offerRevealingAfterDeal = true;
    app.audio.oneShot("largeClap");
  } else {
    // A rejected counter is not an offer. Keep the original Banker offer for
    // the state/history and continue exactly as if the original offer was
    // rejected.
    app.audio.oneShot("groan");
  }

  app.fsm.transitionTo(STATE.COUNTER_OFFER_RESULT);
}

function onCounterOfferKey() {
  const g = app.game;
  if (keyCode === ENTER || keyCode === RETURN || key === "Enter" || key === "ENTER") {
    submitCounterOffer();
    return;
  }
  if (key === "b" || key === "B" || key === "c" || key === "C") {
    if (key === "c" || key === "C") {
      // C is accepted as the keyboard shortcut for Counter Offer.
      // It only applies while the Counter Offer input screen is active.
      return;
    }
    app.fsm.transitionTo(STATE.OFFER);
    return;
  }
  if (keyCode === BACKSPACE || key === "Backspace") {
    g.counterOfferInput = g.counterOfferInput.slice(0, -1);
    return;
  }
  if (/^[0-9.]$/.test(key) && g.counterOfferInput.length < 12) {
    g.counterOfferInput += key;
  }
}

function onCounterOfferResultKey() {
  if (key === " " || keyCode === ENTER || keyCode === RETURN || key === "Enter") {
    continueAfterCounterOfferResult();
  }
}

function continueAfterCounterOfferResult() {
  const g = app.game;
  g.offerDecisionPending = false;

  if (g.counterOfferResult === "accepted") {
    g.offerRevealingAfterDeal = false;
    const other = g.unopenedNon23ExceptPlayer();
    if (other.length === 1) {
      app.assets.audio.openingPlayerBox.play();
      app.fsm.transitionTo(STATE.END_REVEAL);
    } else {
      g.advanceRoundAfterDecision();
      g.roundLargeClaps = 0;
      g.roundGroans = 0;
      app.fsm.transitionTo(STATE.OPENING);
    }
  } else {
    g.advanceRoundAfterDecision();
    g.roundLargeClaps = 0;
    g.roundGroans = 0;
    app.fsm.transitionTo(STATE.OPENING);
  }
}

function onOfferKey() {
  const g = app.game;

  if (g.offerDecisionPending) return;

  // C opens Counter Offer when the option is available.
  if ((key === "c" || key === "C") &&
      g.dealAccepted == null &&
      app.settings.enableCounterOffer &&
      (!g.counterOfferUsed || (isUS() && g.specialGame && g.specialLookMode === "CLOWN" && g.clownGameCompleted && !g.counterOfferExtraUsed))) {
    g.counterOfferBase = Math.max(g.offer, g.fairOfferBeforeRandomness ?? g.offer);
    g.counterOfferMean = g.unopenedNon23().reduce((a,b)=>a+b.value,0) / Math.max(1,g.unopenedNon23().length);
    g.counterOfferInput = "";
    app.fsm.transitionTo(STATE.COUNTER_OFFER);
    return;
  }

  // Ignore invalid keys before changing any state.
  const validLive = key === "Y" || key === "y" || key === "N" || key === "n";
  const validPostDeal = key === " ";
  if (g.dealAccepted == null && !validLive) return;
  if (g.dealAccepted != null && !validPostDeal) return;

  g.offerDecisionPending = true;
  g.unexpectedMidOffer = false;

  // Offer pending (live)
  if (g.dealAccepted == null) {
    if (key === "Y" || key === "y") {
      app.audio.stopOneShot("phone"); // stop phone ring
      app.audio.stopLoops(); // stop offer loop immediately

      setTimeout(() => {
        app.audio.stopOneShot("largeClap");
        app.audio.oneShot("largeClap");
        setTimeout(() => {
          app.audio.oneShot("open1p");
        }, 250);
      }, 400);

      g.dealAccepted = g.offer;
      g.initialTakenHome = g.offer;
      g.offerRevealingAfterDeal = true;
      waitForCrowdReaction(() => {
        const other = g.unopenedNon23ExceptPlayer();
        if (other.length === 1) {
          app.assets.audio.openingPlayerBox.play();
          app.fsm.transitionTo(STATE.END_REVEAL);
        } else {
          g.advanceRoundAfterDecision();
          app.audio.activeCategory = null;
          g.roundLargeClaps = 0;
          g.roundGroans = 0;          
          app.fsm.transitionTo(STATE.OPENING);
        }
        g.offerRevealingAfterDeal = false;
        g.offerDecisionToken++;
        g.offerDecisionPending = false;
      });
      return;
    }

    if (key === "N" || key === "n") {
      g.offerDecisionPending = true;
      app.audio.stopOneShot("phone"); // stop phone ring
      app.audio.stopLoops(); // stop offer loop immediately

      const clapToken = ++g.offerDecisionToken;

      // Rejecting a deal always gets the audience's large clap. The
      // small-clap/groan reaction is reserved for the new offer itself.
      setTimeout(() => {
        app.audio.stopOneShot("largeClap");
        if (g.offerDecisionToken !== clapToken) return;
        app.audio.oneShot("largeClap");
      }, 400);

      waitForCrowdReaction(() => {
        const other = g.unopenedNon23ExceptPlayer();

        if (other.length === 1) {
          if (
            (app.settings.enableSwap || bankerKnowsOneOfFinalTwo()) &&
            (shouldOfferSwap(g.playerBox.value, other[0].value) || bankerKnowsOneOfFinalTwo())
          ) {
            app.audio.stopLoops();
            app.audio.activeCategory = null;

            app.audio.oneShot("phone"); // ring again for swap screen
            waitForPhone(() => {
              g.offerDecisionToken++;
              g.offerDecisionPending = false;
              app.fsm.transitionTo(STATE.SWAP);
            });
          } else {
            g.initialTakenHome = g.playerBox.value;
            app.assets.audio.openingPlayerBox.play();

            g.offerDecisionPending = false;
            g.offerDecisionToken++;
            app.fsm.transitionTo(STATE.END_REVEAL);
          }
        } else {
          g.advanceRoundAfterDecision();
          app.audio.activeCategory = null;

          // Explicitly unlock the opening state before transitioning. This
          // prevents a stale roundResolving/mid-offer lock from surviving a
          // rejected Round 5 offer and making the boxes appear unclickable.
          g.roundResolving = false;
          g.midOfferPending = false;
          g.canShowMidOffer = g.buttonGameSuccess === true && !g.midRoundOfferUsed;
          g.offerDecisionToken++;
          g.offerDecisionPending = false;
          g.roundLargeClaps = 0;
          g.roundGroans = 0;
          bankerDebug("Offer rejected -> opening unlocked", {
            round: displayRound(g.roundIndex),
            boxesToOpen: g.boxesToOpen,
            roundResolving: g.roundResolving,
            midOfferPending: g.midOfferPending
          });
          app.fsm.transitionTo(STATE.OPENING);
        }
      });
    }

    // SPACE DOES NOTHING HERE
    return;
  }

  // After Deal ("would've offered" screen): Space continues
  if (key === " ") {
    app.audio.stopOneShot("phone");
    app.audio.stopLoops();

    const other = g.unopenedNon23ExceptPlayer();

    if (other.length === 1) {
      if (
        (app.settings.enableSwap || bankerKnowsOneOfFinalTwo()) &&
        (shouldOfferSwap(g.playerBox.value, other[0].value) || bankerKnowsOneOfFinalTwo())
      ) {
        app.audio.activeCategory = null;

        app.audio.oneShot("phone");
        waitForPhone(() => {
          app.fsm.transitionTo(STATE.SWAP);
        });
      } else {
        app.assets.audio.openingPlayerBox.play();
        app.fsm.transitionTo(STATE.END_REVEAL);
      }
    } else {
      g.advanceRoundAfterDecision();
      app.audio.activeCategory = null;
      g.roundLargeClaps = 0;
      g.roundGroans = 0;
      app.fsm.transitionTo(STATE.OPENING);
    }
    g.offerDecisionToken++;
    g.offerDecisionPending = false;
  }
}

function onSwapKey() {
  const g = app.game;
  const other = g.unopenedNon23ExceptPlayer();
  if (other.length !== 1) {
    app.audio.stopOneShot("phone");
    app.audio.stopLoops();
    app.fsm.transitionTo(STATE.END_REVEAL);
    return;
  }

  if (key === "Y" || key === "y") {
    app.audio.stopOneShot("phone");
    app.audio.stopLoops();

    // Swap the player's box with the final unopened box
    const oldPlayerBox = g.playerBox;
    const newPlayerBox = other[0];

    // Put old player box back onto the board
    oldPlayerBox.removed = false;

    // Remove the new player box from the board
    newPlayerBox.removed = true;

    oldPlayerBox.opened = false;
    newPlayerBox.opened = false;

    g.playerBox = newPlayerBox;

    setTimeout(() => {
      app.audio.oneShot("largeClap");
    }, 400);

    waitForCrowdReaction(() => {
      if (g.dealAccepted == null) {
        g.initialTakenHome = g.playerBox.value;
      }

      app.assets.audio.openingPlayerBox.play();
      app.fsm.transitionTo(STATE.END_REVEAL);
      return;
    });
  }

  if (key === "N" || key === "n") {
    app.audio.stopOneShot("phone");
    app.audio.stopLoops();

    if (g.dealAccepted == null) {
      g.initialTakenHome = g.playerBox.value;
    }

    setTimeout(() => {
      app.audio.oneShot("largeClap");
    }, 400);

    waitForCrowdReaction(() => {
      app.assets.audio.openingPlayerBox.play();
      app.fsm.transitionTo(STATE.END_REVEAL);
    });
  }
}

function onGambleKey() {
  const g = app.game;

  if (key === "Y" || key === "y") {
    app.audio.stopOneShot("phone");
    app.audio.stopLoops();

    // buy back into play: remove deal
    g.dealAccepted = null;
    g.initialTakenHome = null;

    setTimeout(() => {
      app.audio.oneShot("largeClap");
    }, 400);

    waitForCrowdReaction(() => {
      if (app.settings.enableSwap) {
        app.audio.oneShot("phone");
        waitForPhone(() => {
          app.audio.activeCategory = null;
          app.fsm.transitionTo(STATE.SWAP);
        });
      } else {
        app.assets.audio.openingPlayerBox.play();
        app.fsm.transitionTo(STATE.END_REVEAL);
      }
      return;
    });
  }

  if (key === "N" || key === "n") {
    app.audio.stopOneShot("phone");
    app.audio.stopLoops();

    setTimeout(() => {
      app.audio.oneShot("largeClap");
    }, 400);

    waitForCrowdReaction(() => {
      app.assets.audio.openingPlayerBox.play();
      app.fsm.transitionTo(STATE.END_REVEAL);
    });
  }
}

function onEndRevealKey() {
  if (key !== " ") return;

  const g = app.game;
  const cx = windowWidth * (3 / 8);

  // Game has finished without Box 23:
  // Space restarts instead of revealing again.
  if (g.gameLogged) {
    app.game.reset(CFG, app.layout);
    app.fsm.returnState = null;
    app.fsm.transitionTo(STATE.START);
    return;
  }

  // stop the "opening player box" music right as the box is opened
  if (app.assets.audio.openingPlayerBox?.isPlaying()) {
    app.assets.audio.openingPlayerBox.stop();
  }

  stopCrowdReaction();
  app.audio.oneShot("boxOpen");
  g.playerBox.opened = true;

  g.initialTakenHome = g.initialTakenHome ?? g.playerBox.value;

  playPlayerBoxReaction();

  setTimeout(() => {
    const remaining = g.unopenedNon23ExceptPlayer();
    if (remaining.length === 1) {
      app.audio.oneShot("boxOpen");
      remaining[0].opened = true;
    }
  }, 4000);

  setTimeout(() => {
    if (!app.settings.enableBox23) {
      // Final opening/result sounds begin here so the no-Box-23 path keeps
      // the reveal timing in one place.
      const jackpotValue = Math.max(...getAmounts());
      if (g.playerBox.value === jackpotValue) {
        app.audio.oneShot("open100k", true);
      } else if (g.playerBox.value === 0.01) {
        app.audio.oneShot("open1p", true);
      }

      g.box23Accepted = false;
      g.finalTakeHome = round2(g.initialTakenHome);
      g.result = computeResultNextLevel(g);

      if (!g.gameLogged) {
        logGame();
      }

      fill(255);
      textSize(windowWidth * 0.02);

      let resultText = "";

      if (g.result === "Spanked") resultText = "You Spanked the Banker";
      else if (g.result === "Beat") resultText = "You Beat The Banker!";
      else if (g.result === "Drew") resultText = "You Drew with The Banker";
      else if (g.result === "Lost") resultText = "The Banker Beat You";
      else if (g.result === "Humbled") resultText = "You Got Humbled";

      text(resultText, cx, windowHeight * 0.85);
      return;
    }

    app.fsm.transitionTo(STATE.BOX23);
  }, 7000);
}

function onBox23Key() {
  
  const g = app.game;

  // Accept / Reject Box 23 purchase
  if (g.box23Accepted === null) {
    if (key === "Y" || key === "y") {
      // stop offer audio immediately
      app.audio.stopLoops();
      app.audio.activeCategory = null;

      app.audio.stopOneShot("phone");

      setTimeout(() => {
        app.audio.oneShot("largeClap");
      }, 400);

      waitForCrowdReaction(() => {
        g.box23Accepted = true;
        // play heartbeat / reveal track
        app.assets.audio.openingPlayerBox.play();
      });
    } else if (key === "N" || key === "n") {
      app.audio.stopLoops();
      app.audio.activeCategory = null;
      app.audio.stopOneShot("phone");

      setTimeout(() => {
        app.audio.oneShot("largeClap");
      }, 400);

      waitForCrowdReaction(() => {
        g.box23Accepted = false;
        app.assets.audio.openingPlayerBox.play();
      });
    }
    return;
  }

  if (key !== " ") return;

  // stop heartbeat as soon as box is opened
  if (app.assets.audio.openingPlayerBox?.isPlaying())
    app.assets.audio.openingPlayerBox.stop();

  stopCrowdReaction();
  app.audio.oneShot("boxOpen");
  const box23 = g.boxes[g.goldenIndex];
  box23.opened = true;

  g.finalTakeHome = resolveBox23(
    g.initialTakenHome,
    box23.value,
    g.box23Accepted
  );

  playBox23Reaction(box23.value, g.box23Accepted);

  g.result = computeResultNextLevel(g);

  if (!g.gameLogged) {
    logGame();
  }

  app.fsm.transitionTo(STATE.FINISHED);
}

function onFinishedKey() {
  if (key !== " ") return;

  app.game.reset(CFG, app.layout);
  app.fsm.returnState = null;
  app.fsm.transitionTo(STATE.START);
}

function submitButtonGameGuess() {
  const g = app.game;

  const guess = parseFloat(String(g.guessInput || "").replace(/,/g, ""));
  if (!isFinite(guess) || guess <= 0) return;

  // reveal hidden offer only after guess is submitted
  if (g.pendingOffer != null) {
    g.offer = g.pendingOffer;
    g.pendingOffer = null;
    // The first Button Game offer is still provisional here. It is committed
    // exactly once when the subsequent OFFER state is entered. Pushing it
    // here as well caused the Round 1 offer to appear twice in the ribbon.
    g.buttonGameOfferHidden = false;
  }

  const lower = g.offer * 0.9;
  const upper = g.offer * 1.1;

  g.buttonGameLower = lower;
  g.buttonGameUpper = upper;

  g.buttonGameSuccess = guess >= lower && guess <= upper;
  bankerDebug("Button Game evaluated", {
    guess, offer: g.offer, lower, upper, success: g.buttonGameSuccess,
    secondChance: g.secondButtonGameAttempted, originalOffer: g.secondButtonGameOriginalOffer
  });
  if (g.buttonGameSuccess) g.midOfferFromButtonGame = true;
  if (g.specialGame && g.specialLookMode === "SECOND_CHANCE" && g.secondButtonGameAttempted) {
    g.secondButtonGameSuccess = g.buttonGameSuccess;
  }

  playButtonGameReaction(g.buttonGameSuccess);

  app.fsm.transitionTo(STATE.BUTTON_GAME_RESULT);
}

//
// =======================
// 13) MONEY / RESULT HELPERS
// =======================
//
function roundOffer(val) {
  if (val < 1) return Math.round(val / 0.01) * 0.01;
  if (val < 5) return Math.round(val / 0.05) * 0.05;
  if (val < 10) return Math.round(val / 0.1) * 0.1;
  if (val < 50) return Math.round(val / 0.5) * 0.5;
  if (val < 100) return Math.round(val);
  if (val < 500) return Math.round(val / 5) * 5;
  if (val < 1000) return Math.round(val / 10) * 10;
  if (val < 5000) return Math.round(val / 50) * 50;
  if (val < 10000) return Math.round(val / 100) * 100;
  if (val < 50000) return Math.round(val / 500) * 500;
  if (val < 100000) return Math.round(val / 1000) * 1000;
  if (val < 500000) return Math.round(val / 5000) * 5000;
  return Math.round(val / 10000) * 10000;
}

function formatMoney(amount, boxSet = null) {
  amount = round2(amount);
  const us = boxSet === "US" || (boxSet === null && isUS());

  if (us) {
    if (amount < 1) return Math.round(amount * 100) + "¢";

    return (
      "$" +
      Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
      })
    );
  }

  // UK formatting (ITV and C4)
  if (amount < 1) return Math.round(amount * 100) + "p";

  return (
    "£" +
    Number(amount).toLocaleString("en-GB", {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

function decayBankerMood() {
  if (app.settings.boxSet === "US") {
    app.game.bankerMood = 1 + (app.game.bankerMood - 1) * 0.958;
  } else {
    app.game.bankerMood = 1 + (app.game.bankerMood - 1) * 0.95;
  }
}

function updateBoxRuns(value) {
  const g = app.game;

  const amounts = getAmounts(app.settings.boxSet);
  const sorted = [...amounts].sort((a, b) => b - a);

  const top5 = new Set(sorted.slice(0, 5));
  const bottom5 = new Set(sorted.slice(-5));

  // Red / Blue
  if (value >= 1000) {
    g.redRun++;
    g.blueRun = 0;
  } else {
    g.blueRun++;
    g.redRun = 0;
  }

  // Power 5
  if (top5.has(value)) {
    g.power5Run++;
  } else {
    g.power5Run = 0;
  }

  // Banker's Power 5
  if (bottom5.has(value)) {
    g.bankersPower5Run++;
  } else {
    g.bankersPower5Run = 0;
  }

  // Jackpot Chase: each jackpot box counts individually, including
  // duplicate jackpot values on the same board.
  const jackpotValue = Math.max(...getAmounts(app.settings.boxSet));
  if (g.jackpotChaseActive && value === jackpotValue) {
    g.jackpotRun++;
  } else {
    g.jackpotRun = 0;
  }
}

function getRoundAdditionalText() {
  const g = app.game;

  const openedThisRound = g.lastRoundOpened || [];

  if (openedThisRound.length < 2) {
    return null;
  }

  const boxSet = app.settings.boxSet;
  const amounts = getAmounts(boxSet);

  const openedValues = openedThisRound.map(b => b.value);
  const openedSet = new Set(openedValues);

  // g.boxes contains the boxes remaining AFTER the round.
  // Add the boxes opened this round to reconstruct
  // the boxes that were remaining BEFORE the round.
  const remainingBeforeRound = [
    ...g.boxes.filter(b => !b.opened),
    ...openedThisRound
  ]
    .map(b => b.value)
    .filter(v => amounts.includes(v));

  const meanBeforeRound = remainingBeforeRound.length
    ? remainingBeforeRound.reduce((a, b) => a + b, 0) / remainingBeforeRound.length
    : 0;
  const remainingAfterRound = remainingBeforeRound.filter((_, i) => true);
  const openedCountsForMean = new Map();
  for (const v of openedValues) openedCountsForMean.set(v, (openedCountsForMean.get(v) || 0) + 1);
  const afterValuesForMean = remainingBeforeRound.slice();
  for (const [v, count] of openedCountsForMean) {
    for (let i = 0; i < count; i++) {
      const idx = afterValuesForMean.indexOf(v);
      if (idx >= 0) afterValuesForMean.splice(idx, 1);
    }
  }
  const meanAfterRound = afterValuesForMean.length
    ? afterValuesForMean.reduce((a, b) => a + b, 0) / afterValuesForMean.length
    : 0;
  const meanFell = meanAfterRound < meanBeforeRound;
  const meanRose = meanAfterRound > meanBeforeRound;

  const sorted = amounts.slice().sort((a, b) => b - a);
  
  const top5 = sorted.slice(0, 5);
  const top3 = sorted.slice(0, 3);
  const bottom5 = sorted.slice(-5);
  const bottom3 = sorted.slice(-3);

  const countOpened = values =>
    values.filter(v => openedSet.has(v)).length;

  const top5Opened = countOpened(top5);
  const top5Remaining = g.boxes.some(b => top5.includes(b.value));
  const top3Opened = countOpened(top3);
  const bottom5Opened = countOpened(bottom5);
  const bottom5Remaining = g.boxes.some(b => bottom5.includes(b.value));
  const bottom3Opened = countOpened(bottom3);

  // Highest / lowest 3 values that were on the board
  // at the START of this round.
  const highest3Left = [...remainingBeforeRound]
    .sort((a, b) => b - a)
    .slice(0, 3);

  const lowest3Left = [...remainingBeforeRound]
    .sort((a, b) => a - b)
    .slice(0, 3);

  // Existing red / blue logic
  const allRed = openedValues.every(v => v >= 1000);
  const allBlue = openedValues.every(v => v < 1000);

  const rounds = getRounds();
  const roundSize = openedThisRound.length;
  
  const expectedRoundSize = rounds[g.roundIndex] || roundSize;
  const isMidRound = roundSize < expectedRoundSize; 

// --------------------------------
// Primary message
// --------------------------------

  const highestLeft = [...remainingBeforeRound]
    .sort((a, b) => b - a)
    .slice(0, roundSize);

  const lowestLeft = [...remainingBeforeRound]
    .sort((a, b) => a - b)
    .slice(0, roundSize);

  // Value sets are not enough for Jackpot Chase because several boxes can
  // contain the same jackpot. Compare counts so each jackpot is counted
  // as a separate box.
  const countValues = values => {
    const counts = new Map();
    for (const v of values) {
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    return counts;
  };

  const openedCounts = countValues(openedValues);
  const containsAllIndividually = values => {
    const needed = countValues(values);
    for (const [value, count] of needed) {
      if ((openedCounts.get(value) || 0) < count) return false;
    }
    return true;
  };
  
  let primary = null;

  if (!isMidRound) {
  
    if (!g.dealAccepted) {
  
      // -------------------------
      // PLAYER HAS NOT DEALT
      // -------------------------
  
      if (top5Opened === 5) {
        primary = "Jean's Round!!!";
  
      } else if (top3Opened === 3) {
        primary = "Round from Hell!!";
  
      } else if (
        highestLeft.length === roundSize &&
        containsAllIndividually(highestLeft)
      ) {
        primary = "Worst Possible Round!";
  
      } else if (g.roundGroans >= 0.75 * roundSize && meanFell) {
        primary = "Nightmare round!";
  
      } else if (allRed) {
        primary = "All Red Round";
  
      } else if (g.roundGroans >= 0.5 * roundSize && meanFell) {
        primary = "Bad round";
  
      } else if (bottom5Opened === 5) {
        primary = "That's Never Been Done in the History of Deal!!!";
  
      } else if (bottom3Opened === 3) {
        primary = "Round from Heaven!!";
  
      } else if (
        lowestLeft.length === roundSize &&
        containsAllIndividually(lowestLeft)
      ) {
        primary = "Perfect Round!";
  
      } else if (allBlue) {
        primary = "All Blue Round";
  
      } else if (g.roundLargeClaps >= 0.75 * roundSize) {
        primary = "Good round";
      }
  
    } else {
  
      // -------------------------
      // PLAYER HAS DEALT
      // -------------------------
  
      if (top5Opened === 5) {
        primary = "Jean's Round!!!";
  
      } else if (bottom3Opened === 3) {
        primary = "Round from Hell!!";
  
      } else if (
        lowestLeft.length === roundSize &&
        containsAllIndividually(lowestLeft)
      ) {
        primary = "Worst Possible Round!";
  
      } else if (allRed) {
        primary = "All Red Round";
  
      } else if (g.roundGroans >= 0.75 * roundSize && meanFell) {
        primary = "Bad round";
  
      } else if (bottom5Opened === 5) {
        primary = "That's Never Been Done in the History of Deal!!!";
  
      } else if (top3Opened === 3) {
        primary = "Round from Heaven!!";
  
      } else if (
        highestLeft.length === roundSize &&
        containsAllIndividually(highestLeft)
      ) {
        primary = "Perfect Round!";
  
      } else if (g.roundLargeClaps >= 0.75 * roundSize && meanRose) {
        primary = "Great Round!";
  
      } else if (allBlue) {
        primary = "All Blue Round";
  
      } else if (g.roundLargeClaps >= 0.5 * roundSize && meanRose) {
        primary = "Good round";
      }
    }
  }

  // --------------------------------
  // Secondary message
  // --------------------------------

  let secondary = null;
  
  if (top5Opened >= 2 && !top5Remaining) {
    secondary = "Power 5 gone!";
  } else if (bottom5Opened >= 2 && !bottom5Remaining) {
    secondary = "Banker's Power 5 gone!";
  }

  // --------------------------------
  // Tertiary message
  // --------------------------------

  let tertiary = null;

  if (g.jackpotRun >= 3) {
    tertiary = `${g.jackpotRun} Jackpots in a row!!`;
    
  } else if (g.power5Run >= 3) {
    tertiary = `${g.power5Run} of the Power 5 in a Row!!`;
  
  } else if (g.redRun >= 5) {
    tertiary = `${g.redRun} Reds in a Row!`;
  
  } else if (g.bankersPower5Run >= 3) {
    tertiary = `${g.bankersPower5Run} of the Banker's Power 5 in a Row!!`;
  
  } else if (g.blueRun >= 5) {
    tertiary = `${g.blueRun} Blues in a Row!`;
  }

  if (!primary && !secondary && !tertiary) {
    return null;
  }
  
  return {
    primary: isMidRound ? null : primary,
    secondary,
    tertiary
  };
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

function gSpecialPlusAmount(boxSet) {
  if (boxSet === "US") return 50000;
  if (boxSet === "C4") return 20000;
  return 10000;
}

function resolveBox23(initial, effect, accepted) {
  if (!accepted) return round2(initial);

  if (effect === "DOUBLE") return round2(initial * 2);
  if (effect === "MONEY BACK") return round2(initial);
  if (effect === "HALF") return round2(initial / 2);
  if (effect === "QUARTER") return round2(initial / 4);
  if (effect === "NOTHING") return 0;

  // Parse the actual special-game bonus shown on the card rather than using
  // a box-set-wide fallback. This fixes C4/ITV/US bonus mismatches.
  const bonus = effect.match(/^\+([£$])([\d,]+)$/);
  if (bonus) {
    const amount = Number(bonus[2].replace(/,/g, ""));
    return round2(initial + amount);
  }

  return round2(initial);
}

function computeResultNextLevel(g) {
  const ft = g.finalTakeHome;
  const hb = g.highestOffer;
  const lb = g.lowestOffer;
  const pv = g.playerBox.value;
  const lastOffer = g.offer;

  const box23Enabled = app.settings.enableBox23;
  const effect = box23Enabled ? g.boxes[g.goldenIndex].value : null;

  // Best and worst outcomes WITHOUT Box 23
  const best = Math.max(hb, pv);
  const worst = Math.min(lb, pv);

  // Hypothetical Box 23 outcomes:
  // Player could have:
  // - taken the offer
  // - kept their box
  // - bought Box 23
  //
  // Therefore include both normal and Box 23-adjusted values.

  const bestPossible = box23Enabled
    ? Math.max(
        hb,
        pv,
        resolveBox23(hb, effect, true),
        resolveBox23(pv, effect, true)
      )
    : best;

  const worstPossible = box23Enabled
    ? Math.min(
        lb,
        pv,
        resolveBox23(lb, effect, true),
        resolveBox23(pv, effect, true)
      )
    : worst;

  if (ft > pv) {
    if (Math.abs(ft - bestPossible) < 0.01) {
      return "Spanked";
    } else {
      return "Beat";
    }
  } else if (ft < pv) {
    if (Math.abs(ft - worstPossible) < 0.01) {
      return "Humbled";
    } else {
      return "Lost";
    }
  } else {
    if (g.dealAccepted != null) {
      return "Drew";
    } else {
      if (pv >= lastOffer) {
        return "Beat";
      } else {
        return "Lost";
      }
    }
  }
}

function logGame() {
  const g = app.game;
  
  g.history.push({
    boxValue: g.playerBox.value,
    highest: g.highestOffer,
    taken: g.finalTakeHome,
    result: g.result,
    boxSet: app.settings.boxSet,
    jackpotChase: g.jackpotChaseActive,
    jackpotCount: g.jackpotChaseActive ? g.jackpotCount : 0,
  });

  // How badly the banker was beaten relative to their best offer
  const benchmark =
    g.finalTakeHome === g.playerBox.value
      ? g.highestOffer
      : Math.max(g.highestOffer, g.playerBox.value);

  const ratio = benchmark > 0 ? g.finalTakeHome / benchmark : 1;

  // 0 = banker had a terrible game
  // 1 = banker had an excellent game
  const bankerScore = constrain(1 - (ratio - 0.05) / 1.45, 0, 1);

  let moodChange = 0;

  switch (g.result) {
    case "Humbled":
      // Common positive result, slightly weaker effect
      moodChange = 0.085 + 0.025 * bankerScore;
      break;

    case "Lost":
      // Banker win, moderate positive effect
      moodChange = 0.045 + 0.035 * bankerScore;
      break;

    case "Beat":
      // Player win, stronger negative effect
      moodChange = -(0.055 + 0.045 * (1 - bankerScore));
      break;

    case "Spanked":
      // Rare but damaging
      moodChange = -(0.105 + 0.035 * (1 - bankerScore));
      break;
  }

  //console.log(bankerScore, moodChange);

  g.moodHistory ??= [0, 0, 0, 0, 0];
  g.moodHistory.push(moodChange);

  while (g.moodHistory.length > 5) {
    g.moodHistory.shift();
  }

  // Jackpot Chase progression. Turning the setting off does not reset the
  // stored count; it only prevents the current game from advancing it.
  if (g.jackpotChaseActive) {
    const boxSet = app.settings.boxSet;
    const jackpot = Math.max(...getAmounts(boxSet));
    const limit = getJackpotCountLimit(boxSet);
    const won = Number(g.finalTakeHome) >= jackpot;

    app.settings.jackpotChaseNext[boxSet] = won
      ? 1
      : Math.min(g.jackpotCount + 1, limit);

    saveSettings();
  }

  g.saveHistory();
  g.gameLogged = true;
}

// ---- Swap/Gamble chance logic (ported) ----
function bankerKnowsOneOfFinalTwo() {
  const g = app.game;
  if (!g) return false;
  const other = g.unopenedNon23ExceptPlayer();
  if (other.length !== 1) return false;
  // A failed Second Chance Button Game gives the Banker knowledge of the
  // player's box. If only one other box remains, that knowledge guarantees
  // the swap regardless of whether the player has dealt or is still live.
  if (g.specialLookMode === "SECOND_CHANCE" && g.bankerLookedAtPlayer) return true;
  return !!g.bankerLookedAtPlayer || !!g.bankerKnownBoxIds?.has(other[0].id);
}

function shouldOfferSwap(val1, val2) {
  const minVal = Math.min(val1, val2);
  const maxVal = Math.max(val1, val2);
  const range = maxVal - minVal;

  let reason = "no_match";
  let probability = 0;
  let roll = null;
  let result = false;

  if (maxVal >= 25000) {
    reason = "maxValue>=25000";
    probability = 1;
    result = true;
  } else if (minVal <= 10) {
    if (maxVal >= 1000) {
      reason = "min<=10_and_max>=1000";
      probability = 1;
      result = true;
    } else if (maxVal >= 500) {
      reason = "min<=10_and_max>=500";
      probability = 0.5 + (range - 490) / 1019.98;
    }
  } else if (minVal <= 100) {
    if (maxVal >= 2000) {
      reason = "min<=100_and_max>=2000";
      probability = 1;
      result = true;
    } else if (maxVal >= 1000) {
      reason = "min<=100_and_max>=1000";
      probability = 0.5 + (range - 900) / 2180;
    }
  } else if (minVal <= 1000) {
    if (maxVal >= 7500) {
      reason = "min<=1000_and_max>=7500";
      probability = 1;
      result = true;
    } else if (maxVal >= 4000) {
      reason = "min<=1000_and_max>=4000";
      probability = 0.5 + (range - 3000) / 3800;
    }
  } else if (minVal <= 5000 && maxVal >= 10000) {
    reason = "min<=5000_and_max>=10000";
    probability = 0.5 + (range - 5000) / 8000;
  }

  probability = Math.max(0, Math.min(1, probability));
  if (!result && probability > 0) {
    roll = Math.random();
    result = roll < probability;
  }

  bankerDebug("Swap evaluation", {
    playerBox: val1,
    otherBox: val2,
    minValue: minVal,
    maxValue: maxVal,
    range,
    reason,
    probability,
    roll,
    offered: result
  });

  return result;
}

function shouldOfferGamble(box1, box2, dealtAt) {
  const g = app.game;
  const minVal = Math.min(box1, box2);
  const maxVal = Math.max(box1, box2);
  const mean = (box1 + box2) / 2;
  const offer = g?.offer ?? 0;

  const evaluation = {
    dealtAt,
    bankerOffer: offer,
    box1,
    box2,
    minValue: minVal,
    maxValue: maxVal,
    mean,
    eligible: false,
    reason: null,
    lowerBound: null,
    upperBound: null,
    windowRange: null,
    probability: 0,
    roll: null,
    offered: false
  };

  if (maxVal < 20000) {
    evaluation.reason = "maxValue<20000";
    bankerDebug("Gamble evaluation", evaluation);
    return false;
  }

  const lowerBound = Math.max(0.65 * offer, maxVal / 6, 3 * minVal);
  const upperBound = Math.min(1.35 * offer, maxVal / 3.5);
  evaluation.lowerBound = lowerBound;
  evaluation.upperBound = upperBound;
  evaluation.windowRange = upperBound - lowerBound;

  if (lowerBound > upperBound) {
    evaluation.reason = "invalid_window_lower>upper";
    bankerDebug("Gamble evaluation", evaluation);
    return false;
  }
  if (dealtAt < lowerBound || dealtAt > upperBound) {
    evaluation.reason = "deal_outside_window";
    bankerDebug("Gamble evaluation", evaluation);
    return false;
  }

  evaluation.eligible = true;
  evaluation.reason = "eligible";

  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const windowRange = upperBound - lowerBound;

  const absT = clamp01((windowRange - 500) / (20000 - 500));
  const relT = clamp01(windowRange / Math.max(1, maxVal));
  const t = 0.6 * absT + 0.4 * relT;
  const smooth = t * t * (3 - 2 * t);

  let chance = 0.1 + (0.6 - 0.1) * smooth;
  const baseChance = chance;

  const minFloor = 0.01;
  const boostLimit = 1000;
  const boostCap = 0.4;
  let scaledBoost = 0;

  if (minVal <= boostLimit) {
    const logMin = Math.log10(Math.max(minVal, minFloor));
    const logMax = Math.log10(boostLimit);
    const logFloor = Math.log10(minFloor);

    let closeness = (logMax - logMin) / (logMax - logFloor);
    closeness = clamp01(closeness);

    const eased = Math.pow(closeness, 1.8);
    const maxFactor = clamp01((maxVal - 25000) / (100000 - 25000));
    scaledBoost = boostCap * eased * (0.4 + 0.6 * maxFactor);

    chance += scaledBoost;
  }

  chance = Math.max(0, Math.min(0.95, chance));
  const roll = Math.random();
  const offered = roll < chance;

  Object.assign(evaluation, {
    baseChance,
    scaledBoost,
    absT,
    relT,
    blendT: t,
    smooth,
    probability: chance,
    roll,
    offered
  });

  bankerDebug("Gamble evaluation", evaluation);
  return offered;
}

// Mobile touch handlers

function touchStarted() {
  updatePointerFromTouch();
  return false;
}

function touchEnded() {
  updatePointerFromTouch();
  app.fsm.mousePressed();
  return false;
}