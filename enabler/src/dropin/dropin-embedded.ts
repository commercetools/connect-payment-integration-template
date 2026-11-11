import {
  DropinComponent,
  DropinOptions,
  PaymentDropinBuilder,
} from "../payment-enabler/payment-enabler";
import { BaseOptions } from "../payment-enabler/payment-enabler-mock";

export class DropinEmbeddedBuilder implements PaymentDropinBuilder {
  public dropinHasSubmit = false;

  constructor(_baseOptions: BaseOptions) {}

  build(config: DropinOptions): DropinComponent {
    const dropin = new DropinComponents({
      dropinOptions: config,
    });

    dropin.init();
    return dropin;
  }
}

export class DropinComponents implements DropinComponent {
  private dropinOptions: DropinOptions;
  private rootElement?: HTMLElement;

  constructor(opts: { dropinOptions: DropinOptions }) {
    this.dropinOptions = opts.dropinOptions;
  }

  init(): void {
    this.dropinOptions.onDropinReady?.();
  }

  async remove(): Promise<void> {
    this.rootElement?.remove();
    this.rootElement = undefined;
  }

  async mount(selector: string) {
    const root = document.createElement("div");
    root.textContent = "Dropin Embedded";
    document.querySelector(selector).prepend(root);
    this.rootElement = root;
  }

  async submit(): Promise<void> {
    throw new Error("Implementation not provided");
  }
}
