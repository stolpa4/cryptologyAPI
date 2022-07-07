export interface RequesterOptions {
  readonly baseURL: string;
  readonly authInfo?: AuthInfo;
  readonly requestParameters?: RequestParametersArg;
}

export interface AuthInfo {
  readonly apiKey: string;
  readonly apiSecret: string;
}

export interface RequestParametersArg {
  readonly requestTries?: number;
  readonly requestErrorDelayMs?: number;
  readonly throttleMs?: number;
  readonly useTimestampNonce?: boolean;
}

export interface RequestParameters {
  readonly requestTries: number;
  readonly requestErrorDelayMs: number;
  readonly throttleMs: number;
  readonly useTimestampNonce: boolean;
}

export type NonceGetter = () => number;

export interface Request {
  readonly path: string;
  readonly method: string;
  readonly data?: Record<string, unknown>;
  readonly isPrivate?: boolean;
}
