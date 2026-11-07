import Commons from "./classes/Commons";
import * as THREE from "three";
import WebGLText from "./classes/WebGLText";
import PostProcessing from "./classes/PostProcessing";

/**
 * Main entry-point.
 * Creates Commons instance, Postprocessing, Scene & WebGLTexts
 */
class App {
  private commons!: Commons;
  private postProcessing!: PostProcessing;

  private scene!: THREE.Scene;

  private texts!: Array<WebGLText>;

  constructor() {
    document.addEventListener("DOMContentLoaded", async () => {
      await document.fonts.ready; // Important to wait for fonts to load when animating any texts.
      document.body.classList.remove("loading");

      this.commons = Commons.getInstance();
      this.commons.init();

      this.createScene();
      this.createWebGLTexts();
      this.createPostProcessing();
      this.addEventListeners();
      this.setupMobileMenu();

      this.update();
    });
  }

  private createScene() {
    this.scene = new THREE.Scene();
  }

  private createWebGLTexts() {
    const texts = document.querySelectorAll('[data-animation="webgl-text"]');

    if (texts) {
      this.texts = Array.from(texts).map(
        (el) =>
          new WebGLText({
            element: el as HTMLElement,
            scene: this.scene,
          })
      );
    }
  }

  private createPostProcessing() {
    this.postProcessing = new PostProcessing({ scene: this.scene });
  }

  /**
   * The main raf loop handler of the App
   * The update function to be called on each frame of the browser.
   * Calls update() on Commons, WebGLTexts and Postprocessing
   */
  private update() {
    this.commons.update();

    if (this.texts) {
      this.texts.forEach((el) => el.update());
    }

    // Don't need line below as we're rendering everything using EffectComposer.
    // this.commons.renderer.render(this.scene, this.commons.camera);

    this.postProcessing.update();

    window.requestAnimationFrame(this.update.bind(this));
  }

  private onResize() {
    this.commons.onResize();

    if (this.texts) {
      this.texts.forEach((el) => el.onResize());
    }

    this.postProcessing.onResize();
  }

  private addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
  }

  private setupMobileMenu() {
    const frame = document.querySelector<HTMLElement>(".frame");
    const toggle = document.querySelector<HTMLButtonElement>(".frame__menu-toggle");
    const links = document.querySelector<HTMLElement>(".frame__links");
    if (!frame || !toggle || !links) return;

    const isOpen = () => frame.classList.contains("frame--menu-open");

    const setOpen = (open: boolean) => {
      frame.classList.toggle("frame--menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) {
        this.commons.lenis.stop();
      } else {
        this.commons.lenis.start();
      }
    };

    toggle.addEventListener("click", () => setOpen(!isOpen()));

    links.addEventListener("click", (event) => {
      if ((event.target as HTMLElement).closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia("(min-width: 53em)").addEventListener("change", (event) => {
      if (event.matches && isOpen()) setOpen(false);
    });
  }
}

export default new App();
