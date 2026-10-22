# Work Grove Firebase Security Specification

## Data Invariants
1. Users may only read and edit their own private profile and wallet records (`/users/{userId}`).
2. Jobs can be read by any authenticated user. Creating a job requires valid authentication with non-negative reward and worker counts.
3. Submissions can be created by authenticated workers (`workerId == request.auth.uid`). A worker can read their own submissions.
4. Transactions can only be read and created by the authenticated owner (`userId == request.auth.uid`).
5. Messages are either addressed to the user or are global announcements (`userId == request.auth.uid` or `userId == 'all'`).
