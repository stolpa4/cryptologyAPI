import { log } from './deps.ts';
await log.setup({
    handlers: {
        console: new log.handlers.ConsoleHandler('DEBUG', {
            formatter: '{datetime}: [{levelName}]: {msg}',
        }),
    },
    loggers: {
        default: {
            level: 'DEBUG',
            handlers: ['console'],
        },
        'CryptologyAPI.requester': {
            level: 'DEBUG',
            handlers: ['console'],
        },
    },
});

import { Requester } from './requester/requester.ts';

const req = new Requester();

let resp = await req.request({
    path: '/v1/public/get-order-book?trade_pair=ETH_USDT',
});

console.log(resp, typeof resp);

// let p = [];
//
// for (let i = 0; i < 10; ++i) {
//   p.push(req.request({
//     path: "/v1/public/get-order-book?trade_pair=ETH_USDT",
//     method: "get",
//   }));
// }
//
// console.log(await Promise.all(p));
