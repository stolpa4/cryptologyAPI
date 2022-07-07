export interface RequesterOptions {
  readonly baseURL?: string;
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

export enum ResponseStatus {
  Ok = "OK",
  Error = "ERROR",
}

export enum ResponseErrorCode {
  InsufficientFund = "INSUFFICIENT_FUND",
  InvalidRequest = "INVALID_REQUEST",
  InvalidKey = "INVALID_KEY",
  InvalidTimestamp = "INVALID_TIMESTAMP",
  PermissionDenied = "PERMISSION_DENIED",
  TooManyRequests = "TOO_MANY_REQUESTS",
  DuplicateClientOrderID = "DUPLICATE_CLIENT_ORDER_ID",
  UnknownError = "UNKNOWN_ERROR",
}

export interface ExchangeResponse<ResponseType> {
  status?: ResponseStatus;
  error: { code: ResponseErrorCode; message: string | null } | null;
  data: ResponseType | null;
}
