# ADHAYAN LMS

A learning workspace for students, teachers, parents and one platform operator. React/Vite provides the interface; Express, MongoDB and Socket.IO provide authenticated learning records and collaboration.

The original visual assets and page layouts are retained. Demonstration screens are labelled and isolated from live records. This repository contains the application, a small sourced algebra starter package, and automated checks. It does **not** contain a complete reviewed curriculum for every exam.

## Run on Windows

Use Node.js 24 and a current npm version. Run commands from the repository root, not from `client` or `server`.

```powershell
git clone https://github.com/i-akb25/Adhayan-LMS.git E:\adhayan-fresh
Set-Location E:\adhayan-fresh
npm ci
npm run setup
notepad .\server\.env
```

For an existing fresh clone, stop Vite with **Ctrl+C**, then:

```powershell
Set-Location E:\adhayan-fresh
git pull --ff-only origin main
npm ci
```

`npm run setup` creates `server/.env` only if it does not exist. It generates four independent random keys and an administrator TOTP secret. It never overwrites credentials or prints them. Add your **new** database URI and operator settings locally. Do not reuse previously exposed credentials or commit `.env`.

Start the API in one terminal:

```powershell
npm run dev
```

Start the frontend in another terminal:

```powershell
npm run dev:web
```

Open <http://localhost:5173>. Vite proxies `/api` and `/socket.io` to the API on port 5000. You can inspect public/demo screens before configuring MongoDB; real accounts and saved workflows require the API and database.

The lockfile includes Windows native packages and `.npmrc` includes optional dependencies. A normal `npm ci` should work without manually installing a Rolldown binding. CI checks the Windows install and build. An npm warning about a blocked `mongodb-memory-server` postinstall concerns the test database, not frontend startup; tests can download their temporary database binary when run.

## Configuration

Use `server/.env.example` as the reference. Secrets belong in local environment files or the hosting provider’s secret settings, never in frontend `VITE_*` variables.

| Settings                                                                             | Purpose                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGO_URI`                                                                          | Fresh MongoDB connection string. Use a dedicated database user with access only to this application database.                                                                                  |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`                                            | Independent server keys, at least 32 characters each. The legacy variable names remain; authentication uses opaque cookie sessions and stored hashes.                                          |
| `CLIENT_URL`                                                                         | Exact trusted frontend origin; comma-separated origins are supported. Production requires HTTPS. Cookies require a same-site frontend/API deployment.                                          |
| `API_RATE_LIMIT`                                                                     | Overall requests per IP per 15 minutes, default 300; valid range 30–10000. Tune deliberately for shared school networks. Credential and upload limits remain separate.                         |
| `PORT`, `NODE_ENV`, `TRUST_PROXY`                                                    | API port, runtime mode and exact number of trusted proxy hops. Use `0` when directly exposed without a proxy.                                                                                  |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_TOTP_SECRET`                                 | Initial administrator bootstrap and administrator MFA. The password needs 12–72 characters, uppercase, lowercase, a number and a symbol. TOTP needs a base32 secret of at least 32 characters. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM_EMAIL` | SMTP for verification and password recovery. `MAIL_SECURE=true` means TLS from connection establishment, commonly on port 465. Use the provider’s exact settings.                              |
| `GEMINI_API_KEY`, `GEMINI_MODEL`                                                     | Optional AI mentor. Requests go to the fixed Google Gemini endpoint from the backend. Users explicitly accept the provider notice before sending a question.                                   |
| `TURN_URL`, `TURN_SHARED_SECRET`                                                     | Optional TURN service using time-limited credentials minted by the backend. Required for reliable calls across different networks.                                                             |
| `FILE_STORAGE_KEY`                                                                   | Independent 64-character hexadecimal AES key for private attachments. Preserve it separately from database backups. Losing it makes stored files unreadable.                                   |
| `BACKUP_KEY`                                                                         | A different 64-character hexadecimal AES key for encrypted database exports.                                                                                                                   |
| `BACKUP_WRITES_PAUSED`                                                               | Explicit maintenance-window flag for consistent exports. Stop or pause every writer before exporting.                                                                                          |
| `BACKUP_DIRECTORY`, `BACKUP_RETENTION_DAYS`                                          | Dedicated backup directory, relative to `server`, and retention period of 1–365 days; defaults are `./backups` and 30 days.                                                                    |
| `RESTORE_DATABASE`                                                                   | Empty isolated restore target named `adhayan_restore_<name>`. Restoration never drops an existing database.                                                                                    |
| `OPERATOR_NAME`, `SUPPORT_EMAIL`                                                     | Public operator identity and support contact shown in notices. Set these before public launch.                                                                                                 |

The four authentication/encryption keys must be different. Keep the TOTP secret in an authenticator configured for time-based six-digit codes. Configure the administrator before opening public registration; bootstrap does not overwrite or promote an existing account with the same email.

```powershell
npm run doctor
npm run doctor -- --providers
```

The first command checks configuration without contacting providers. `--providers` additionally checks database connectivity and SMTP connection/authentication without sending email. Neither command proves email delivery, AI quality, TURN reachability or scheduled backup execution. The administrator dashboard also shows configuration-presence flags.

## Working flows

- **Students:** choose one active learning track, enrol in published matching courses, study lessons, save private notes and completion, take assessments, see explanations and weak-topic reports, generate a rule-based revision plan, submit assignments with optional private attachments, revisit grades/feedback, join scheduled classes and study rooms, and export or delete their account.
- **Teachers:** an administrator grants this role. Teachers create their own courses, lessons, links, private files, assessments and assignments; review submissions; mark attendance; schedule/reschedule/cancel classes; and communicate with linked parents. Ownership and institution membership are checked server-side.
- **Parents:** accept a short-lived single-use invitation shared by a student. Linked parents can view learning reports and privately contact teachers associated with that student’s courses. Either side can remove the link.
- **Administrators:** manage user roles, activation and learning tracks; search/paginate users; manage institutions and members; publish announcements; inspect audit records; and review reported room messages. Institution membership restricts institution courses; this remains one operator-managed platform, not isolated customer installations.

Existing student progress is retained when an administrator changes a learning track, but access to courses outside the new track is denied. Public registration cannot assign teacher or administrator roles.

### Content authoring and review

Download `client/public/content/algebra-foundations.json` through the teacher’s curriculum-import panel. It contains original short explanations, worked examples, revision notes, ten practice questions and a textbook reference. It imports as a private draft, never as automatically reviewed content. Adjust its track to match the intended students if needed.

A curriculum package contains `title`, `description`, `track`, `syllabus`, `sources`, `lessons` and `tests`; `exam`, `stage` and `syllabusYear` are optional metadata. Each lesson includes a subject, chapter, content, worked example, revision notes and source URL. Only HTTPS resource/source links are accepted. Inspect each lesson and question in the course review panel, confirm review, then publish the course and assessments separately. Editing sourced content invalidates approval and returns it to draft.

Assessments support **single-correct multiple-choice** questions, 2–8 options, positive/negative marking, up to 200 questions, server deadlines, saved answers and immutable submitted results. Optional sequential timed sections must have durations and question counts matching the whole test. Only active-section questions are returned; earlier sections lock when time expires. In-progress attempts retain question snapshots. Numeric-entry, multi-correct questions, essay grading and proctoring are not implemented. Verify official exam specifications before claiming an assessment matches an exam.

### Files and assignments

Private PDF, PNG and JPEG attachments are encrypted in MongoDB and always downloaded as attachments after authorization. Limits are 5 MiB per file, 100 MiB per account and ten uploads per hour. Files are not publicly served or malware-scanned. Only open material from people you trust.

Course files are available to authorized course members. Assignment drafts belong to their uploader. After submission, only that student and the reviewing course teacher/administrator can download the attached files; classmates and linked parents cannot. A submission accepts up to three uploaded files and becomes final. Unsubmitted files can be removed; submitted attachments cannot be changed independently of the submission. Late submissions are rejected.

### Classes and collaboration

Teachers schedule a class for an authorized course, with a start/end time and a room. Maximum duration is four hours, scheduled no more than one year ahead. Students may join ten minutes before the start through fifteen minutes after the end. Teachers can prepare the room earlier. Cancellation closes room access. The calendar download is an `.ics` event; it does not synchronize changes automatically with external calendars.

Class scheduling, changes, cancellations and assignment reviews create in-app notifications. These are separate from SMTP account verification/recovery emails. Chat, calls, screen sharing and an ephemeral whiteboard use authenticated room membership. Calls have a six-participant limit; rooms have a 50-member limit. Camera/microphone capture starts only after a user action. This application does not record calls.

Members can report a room message to the operator. The administrator can inspect the reported message, dismiss the report, remove the message, remove/block its author from that room, or close the room. Message authors and room owners can also remove messages through the room interface. Other users’ private conversations are not exposed as a general browsing feature.

## Checks

```powershell
npm ci
npm run check
npm run check:repo
npm audit --audit-level=moderate
npx playwright install chromium firefox
npm run test:e2e
```

Backend tests use a temporary MongoDB instance, never the configured production database. Browser tests provision an isolated test database and fixture accounts. Their first run can download MongoDB/browser binaries. CI runs backend tests, lint, a production build, dependency audit, repository hygiene and Chromium/Firefox/mobile-viewport browser flows. A separate Windows job verifies installation and build. Test credentials in fixtures are not deployment credentials.

No automated check guarantees that all security issues are absent. Live SMTP delivery, Gemini responses, real cross-network calls, production accessibility/performance and recovery procedures need deployment checks.

## Production and recovery

Build and run the same-origin server, or build the supplied non-root Docker image:

```powershell
npm run build
npm start
# Alternative:
docker build -t adhayan-lms .
```

`npm start` loads `server/.env` through the server workspace. Docker requires runtime environment variables; it does not copy local `.env` files. Terminate HTTPS at a trusted proxy, configure `CLIENT_URL` and `TRUST_PROXY`, and route HTTP/WebSocket traffic to the same API. Health endpoints are `/health/live` and `/health/ready`; the latter requires database connectivity. The Docker configuration is supplied but is not part of the hosted browser CI checks.

Before launch, rotate all credentials previously exposed, configure and test providers, review published learning content, confirm the operator’s notices, set up monitoring, and configure a backup schedule on the hosting platform. Account deletion and backup retention are operational responsibilities as well as application features.

For an encrypted export, stop all application instances and other database writers, set `BACKUP_WRITES_PAUSED=true` locally, then run:

```powershell
npm run backup
```

Without a filename, this creates `adhayan-<timestamp>.adhb` in the configured dedicated directory. Exports are bounded to 64 MiB; use managed database snapshots for larger databases. Keep backup files and both encryption keys access restricted and separate. Resume writers after the export and return the flag to `false`.

Restore only to a new empty database selected by `RESTORE_DATABASE`:

```powershell
$backup = Get-ChildItem .\server\backups\adhayan-*.adhb |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
if (!$backup) { throw "No encrypted backup found in the default directory." }
npm run restore -- $backup.FullName
```

The restore authenticates the encrypted file, verifies document counts and increments restored user session versions. Sessions, action tokens and rate counters are excluded. Review the restored database and reapply account deletions made after the snapshot before putting it online. Private attachments need their original `FILE_STORAGE_KEY`.

```powershell
npm run maintenance
npm run maintenance -- --apply
```

Maintenance defaults to a dry run. `--apply` retries interrupted account deletions and removes expired encrypted backup files matching the dedicated filename/header convention in the configured directory. It does not recursively delete directories or delete arbitrary files. Schedule this command with your host’s job scheduler and monitor its exit status. No hosting account, cron schedule or external monitoring service is provisioned by this repository.

## Repository

```text
client/src/pages/        Existing public and role dashboard layouts
client/src/features/     Live learning, management, assignments, classes and calls
client/src/demo/         Explicitly labelled demonstration experiences
client/public/content/   Sourced draft curriculum starter
server/modules/          Authentication, learning, files, classes, moderation and realtime
server/lib/              Validation, assessment timing, configuration, backups and rate storage
server/models/           Explicit MongoDB schemas and indexes
server/tests/            Backend workflow and security checks
scripts/                 Local setup, diagnostics, backups, maintenance and test fixtures
tests/e2e/               Browser workflows
.github/workflows/       Linux checks and Windows installation/build
```

Build reports, internal implementation instructions, generated bundles, test output, real environment files and credentials do not belong in the repository. Google/GitHub login and newsletter collection remain disabled; they are not represented as working integrations. The AI mentor, email and TURN services fail clearly when they have not been configured.
