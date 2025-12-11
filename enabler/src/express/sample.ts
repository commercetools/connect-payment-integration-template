import {
  ExpressComponent,
  ExpressOptions,
  PaymentExpressBuilder,
} from "../payment-enabler/payment-enabler";
import { BaseOptions } from "../payment-enabler/payment-enabler-mock";

export class SampleExpressBuilder implements PaymentExpressBuilder {
  constructor(_baseOptions: BaseOptions) {}

  build(config: ExpressOptions): SampleExpressComponent {
    const express = new SampleExpressComponent({
      expressOptions: config,
    });

    express.init();
    return express;
  }
}

export class SampleExpressComponent implements ExpressComponent {
  private expressOptions: ExpressOptions;
  private sessionId: string;

  constructor(opts: { expressOptions: ExpressOptions }) {
    this.expressOptions = opts.expressOptions;
  }

  async init(): Promise<void> {
    const res = await this.expressOptions.onPayButtonClick();
    this.sessionId = res.sessionId;
  }

  async mount(selector: string) {
    document
      .querySelector(selector)
      .insertAdjacentHTML("afterbegin", `Sample express component + ${this.sessionId}`);
  }
}
