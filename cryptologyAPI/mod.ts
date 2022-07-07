import { Requester } from "./requester/requester.ts";
import { log } from "./deps.ts";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
    cryptologyAPI: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});

const req = new Requester();

let p = [];

for (let i = 0; i < 10; ++i) {
  p.push(req.request({
    path: "/v1/public/get-order-book",
    method: "get",
    data: { trade_pair: "ETH_USDT" },
  }));
}

console.log(await Promise.all(p));
