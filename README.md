# Cryptology API

[The Cryptology Exchange](https://cryptology.com) API wrapper for Deno.

# TODO

- [ ] **General**
  - [x] Configure code formatter
  - [x] Add git ignore
  - [x] Script run/format/build/etc. commands
  - [x] Provide test and fmt git hooks
  - [ ] Move to nodejs
  - [ ] First stable release
  - [ ] Move to git-flow scheme

- [x] **Utils**
  - [x] Test logging name compounding
  - [x] Test random int generation

- [ ] **Requester**
  - [x] Logger support
  - [x] Requester constructor and base types
  - [x] Baseline requester types
  - [x] A simple fetch request logic
  - [x] Request api (via fetch)
  - [x] Request-retry logic
  - [x] Rate limiting logic
  - [x] Check
  - [x] Test
  - [x] Refactor
  - [x] Test default properties
  - [x] Test default request params
  - [x] Move to using assertEquals for objects
  - [x] Test default nonce getter
  - [x] Test default rate limiter
  - [x] Test craftHeaders
  - [x] Test checkAuthorized
  - [x] Refactor makeRequest - factor out all fetch args creation
  - [x] Test compoundURL
  - [x] Test compoundRequestOptions
  - [x] Mock makeRequest
  - [x] Test request with makeRequest and rateLimiter mocks
  - [x] Refactor the tests
  - [x] 100% tests coverage (almost)
  - [ ] 100% Doc-comments for functions, classes and modules
