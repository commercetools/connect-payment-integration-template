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
  private mountSelector?: string;

  constructor(opts: { dropinOptions: DropinOptions }) {
    this.dropinOptions = opts.dropinOptions;
  }

  init(): void {
    this.dropinOptions.onDropinReady?.();
  }

  async remove(): Promise<void> {
    if (!this.mountSelector) {
      return;
    }

    document.querySelector(this.mountSelector)?.replaceChildren();
    this.mountSelector = undefined;
  }

  async mount(selector: string) {
    this.mountSelector = selector;
    document
      .querySelector(selector)
      .insertAdjacentHTML("afterbegin", "Dropin Embedded");
  }

  async submit(): Promise<void> {
    throw new Error("Implementation not provided");
  }
}
