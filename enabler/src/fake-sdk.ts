export class FakeSdk {
  private environment: string;
  constructor({ environment }) {
    this.environment = environment;
    console.log('FakeSdk constructor', this.environment);
  }
  init(opts: any) {
    console.log('FakeSdk init', opts);
  }
}
