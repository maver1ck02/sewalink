# SewaLink API notes

All JSON responses use `{ success, message, data? }`.

Protected routes read the `accessToken` HTTP-only cookie (or `Authorization: Bearer`).

Socket.IO authenticates the same access cookie and joins `user:{id}` rooms. Clients emit `conversation:join` and `message:send`.
