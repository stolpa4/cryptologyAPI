import { RequestParameters } from "./types.ts";
import { API_NAME, API_VERSION } from "../common/constants.ts";

export const DEFAULT_REQUEST_PARAMS: RequestParameters = Object.freeze({
  requestTries: 5,
  requestErrorDelayMs: 400,
  throttleMs: 1000,
  useTimestampNonce: false,
});

export const PUBLIC_HEADERS: HeadersInit = Object.freeze({
  "Content-Type": "application/json",
  "User-Agent": `${API_NAME}/${API_VERSION}`,
});

export const DEFAULT_API_URL = "https://api.cryptology.com";
