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
  private mountedNodes: ChildNode[] = [];

  constructor(opts: { dropinOptions: DropinOptions }) {
    this.dropinOptions = opts.dropinOptions;
  }

  init(): void {
    this.dropinOptions.onDropinReady?.();
  }

  async remove(): Promise<void> {
    this.mountedNodes.forEach((node) => node.remove());
    this.mountedNodes = [];
  }

  async mount(selector: string) {
    const text = document.createTextNode("Dropin Embedded");
    document.querySelector(selector).prepend(text);
    this.mountedNodes = [text];
  }

  async submit(): Promise<void> {
    throw new Error("Implementation not provided");
  }
}
