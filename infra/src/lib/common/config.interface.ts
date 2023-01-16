import { Url } from "url";

export interface BuildConfig {
  readonly account: string;
  readonly region: string;
  readonly environment: string;
  readonly project: string;
  readonly version: string;
  readonly build: string;
  readonly stacks: BuildStaks;
}

interface BuildStaks {
  api: APIStack;
}

interface APIStack {
  key: string;
}
