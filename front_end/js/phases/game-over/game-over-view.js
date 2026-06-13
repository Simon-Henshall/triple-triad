/**
 * GameOverView
 * Handles display of game outcome messages via a stylised animated overlay
 * rendered on the CreateJS stage, inspired by the Final Fantasy VIII
 * "You Win" screen.
 */
export default class GameOverView {
  /**
   * Creates a GameOverView instance.
   * @param {Object} stage - the CreateJS stage
   */
  constructor(stage) {
    this.stage = stage;
    this.container = undefined;
    this.overlay = undefined;
    this.animationHandle = undefined;
  }

  /**
   * Display the game outcome with a stylised animated overlay.
   * @param {string} outcome - "win", "lose", or "draw"
   * @param {Object} counts - { aiCards, playerCards } card counts
   * @param {Function} [onDismiss] - optional callback invoked after the overlay is dismissed
   */
  displayOutcome(outcome, counts, onDismiss) {
    try {
      this._onDismissCallback = onDismiss;
      this._buildOverlay(outcome, counts);
    } catch (error) {
      console.error(["[Game Over View] Failed to display outcome"], error);
    }
  }

  /**
   * Build and animate the game over overlay.
   * @param {string} outcome
   * @param {Object} counts
   */
  _buildOverlay(outcome, counts) {
    const stage = this.stage;
    const cw = stage.canvas.width;
    const ch = stage.canvas.height;

    // ----- Create container -----
    this.container = new createjs.Container();
    this.container.alpha = 0;
    stage.addChild(this.container);

    // ----- Dark overlay shape -----
    this.overlay = new createjs.Shape();
    this.overlay.graphics.beginFill("rgba(0,0,0,0.75)").drawRect(0, 0, cw, ch);
    this.container.addChild(this.overlay);

    // ----- Choose label and colour based on outcome -----
    const labelMap = {
      win: { text: "YOU WIN!", color: "#FFD700" },
      lose: { text: "YOU LOSE!", color: "#DC143C" },
      draw: { text: "DRAW!", color: "#B0C4DE" },
    };
    const { text: label, color } = labelMap[outcome] || labelMap.draw;

    // ----- Main result text (big, bold, golden) -----
    const resultText = new createjs.Text(
      label,
      "bold 72px Impact, Arial Black, sans-serif",
      color,
    );
    resultText.textAlign = "center";
    resultText.textBaseline = "middle";
    resultText.x = cw / 2;
    resultText.y = ch / 2 - 40;
    resultText.outline = 3;
    resultText.alpha = 0;
    this.container.addChild(resultText);

    // ----- Score sub-text -----
    const scoreLabel = `Player ${counts.playerCards}  –  AI ${counts.aiCards}`;
    const scoreText = new createjs.Text(
      scoreLabel,
      "28px Arial, sans-serif",
      "#e0e0e0",
    );
    scoreText.textAlign = "center";
    scoreText.textBaseline = "middle";
    scoreText.x = cw / 2;
    scoreText.y = ch / 2 + 40;
    scoreText.alpha = 0;
    this.container.addChild(scoreText);

    // ----- Footer hint -----
    const hintText = new createjs.Text(
      "Press any key to continue",
      "16px Arial, sans-serif",
      "#aaaaaa",
    );
    hintText.textAlign = "center";
    hintText.textBaseline = "middle";
    hintText.x = cw / 2;
    hintText.y = ch - 40;
    hintText.alpha = 0;
    this.container.addChild(hintText);

    // ----- Animate in -----
    // Fade in the container
    createjs.Tween.get(this.container).to(
      { alpha: 1 },
      600,
      createjs.Ease.quartOut,
    );

    // Scale + fade in the result text with a slight bounce
    resultText.scaleX = 0.3;
    resultText.scaleY = 0.3;
    createjs.Tween.get(resultText)
      .wait(150)
      .to({ scaleX: 1.15, scaleY: 1.15, alpha: 1 }, 500, createjs.Ease.backOut)
      .to({ scaleX: 1, scaleY: 1 }, 200, createjs.Ease.sineOut);

    // Fade in score text
    createjs.Tween.get(scoreText)
      .wait(500)
      .to({ alpha: 1 }, 400, createjs.Ease.sineInOut);

    // Pulsing hint text (fade in, then blink)
    createjs.Tween.get(hintText)
      .wait(800)
      .to({ alpha: 0.8 }, 400, createjs.Ease.sineInOut)
      .call(() => {
        // Start blinking after appearing
        this._startBlinking(hintText);
      });

    // ----- Glow effect via a second identical text behind (outline-only) -----
    const glowText = new createjs.Text(
      label,
      "bold 72px Impact, Arial Black, sans-serif",
      color,
    );
    glowText.textAlign = "center";
    glowText.textBaseline = "middle";
    glowText.x = cw / 2;
    glowText.y = ch / 2 - 40;
    glowText.outline = 6;
    glowText.alpha = 0;
    glowText.scaleX = 0.3;
    glowText.scaleY = 0.3;
    this.container.addChildAt(glowText, 2); // behind the main text

    // Animate glow with slightly slower scale to create a trailing effect
    createjs.Tween.get(glowText)
      .wait(150)
      .to(
        { scaleX: 1.15, scaleY: 1.15, alpha: 0.4 },
        500,
        createjs.Ease.backOut,
      )
      .to({ scaleX: 1, scaleY: 1 }, 200, createjs.Ease.sineOut)
      .to({ alpha: 0 }, 600);

    // ----- Add subtle card particles (tiny floating elements) -----
    this._addParticles(cw, ch);

    // ----- Attach one-shot key listener to dismiss -----
    this._attachDismissHandler();
  }

  /**
   * Start a blinking tween loop on the given text.
   * @param {createjs.Text} text
   */
  _startBlinking(text) {
    if (this._blinkTween) {
      this._blinkTween.setPaused(true);
    }
    this._blinkTween = createjs.Tween.get(text, { loop: true })
      .to({ alpha: 0.3 }, 700, createjs.Ease.sineInOut)
      .to({ alpha: 0.8 }, 700, createjs.Ease.sineInOut);
  }

  /**
   * Add floating decorative particles.
   * @param {number} cw - canvas width
   * @param {number} ch - canvas height
   */
  _addParticles(cw, ch) {
    const colors = ["#FFD700", "#FFA500", "#FF6347", "#ffffff"];
    for (let index = 0; index < 20; index++) {
      const size = 2 + Math.random() * 4;
      const particle = new createjs.Shape();
      particle.graphics
        .beginFill(colors[Math.floor(Math.random() * colors.length)])
        .drawCircle(0, 0, size);
      particle.x = Math.random() * cw;
      particle.y = ch + 20 + Math.random() * 30;
      particle.alpha = 0.6 + Math.random() * 0.4;
      this.container.addChild(particle);

      // Float upward with slight horizontal drift
      const targetX = particle.x + (Math.random() - 0.5) * 120;
      const targetY = -20 - Math.random() * 50;
      const duration = 2500 + Math.random() * 2000;
      createjs.Tween.get(particle)
        .to(
          { x: targetX, y: targetY, alpha: 0 },
          duration,
          createjs.Ease.sineInOut,
        )
        .call(() => {
          if (this.container && this.container.parent) {
            this.container.removeChild(particle);
          }
        });
    }
  }

  /**
   * Attach a one-shot keydown handler to dismiss the overlay.
   */
  _attachDismissHandler() {
    if (this._dismissHandler) {
      return;
    }

    /**
     *
     */
    this._dismissHandler = (event) => {
      // Ignore if the overlay is already gone
      if (!this.container || !this.container.parent) {
        return;
      }

      // Remove the listener immediately to prevent double-fire
      document.removeEventListener("keydown", this._dismissHandler);
      this._dismissHandler = undefined;

      // Invoke the callback synchronously before tween cleanup,
      // so the state machine's phase context is still valid.
      const callback = this._onDismissCallback;
      this._onDismissCallback = undefined;
      if (callback) {
        callback();
      }

      // Speed up dismissal rather than instant kill
      this._dismiss();
    };

    document.addEventListener("keydown", this._dismissHandler);
  }

  /**
   * Animate the overlay out and clean up.
   */
  _dismiss() {
    if (this._blinkTween) {
      this._blinkTween.setPaused(true);
      this._blinkTween = undefined;
    }

    // Fade out all children quickly
    if (this.container) {
      createjs.Tween.get(this.container)
        .to({ alpha: 0 }, 300, createjs.Ease.quartIn)
        .call(() => {
          this.cleanup();
          if (this._onDismissCallback) {
            this._onDismissCallback();
            this._onDismissCallback = undefined;
          }
        });
    }
  }

  /**
   * Clear the overlay and remove from stage.
   */
  cleanup() {
    if (this._dismissHandler) {
      document.removeEventListener("keydown", this._dismissHandler);
      this._dismissHandler = undefined;
    }
    if (this._blinkTween) {
      this._blinkTween.setPaused(true);
      this._blinkTween = undefined;
    }

    if (this.container && this.stage) {
      try {
        this.stage.removeChild(this.container);
      } catch (error) {
        console.error(["[Game Over View] Failed to cleanup container"], error);
      }
    }
    this.container = undefined;
    this.overlay = undefined;
  }
}
