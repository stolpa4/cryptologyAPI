import { log } from "../deps.ts";
import { API_NAME } from "./constants.ts";

export function getLogger(name: string | undefined = undefined) {
  return log.getLogger(name ? `${API_NAME}.${name}` : API_NAME);
}
