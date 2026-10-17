import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function Notice({ kind }) {
  const [operator, setOperator] = useState(null);
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/public/config", { signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => setOperator(r?.data || null))
      .catch(() => {});
    return () => c.abort();
  }, []);
  const content = {
    about: [
      "About ADHAYAN",
      "ADHAYAN connects structured lessons, assessments, progress reports and collaborative study. Teachers author and review learning material. Results and study plans use recorded answers and progress; they do not predict exam outcomes.",
    ],
    contact: [
      "Contact",
      "Contact the platform operator for account support, corrections, accessibility requests or questions about your data. For course questions, contact your teacher through your learning workspace.",
    ],
    privacy: [
      "Privacy notice",
      "We store your account profile, password hash, enrolments, learning records, work submissions, test results and room messages to provide the service. Browser authentication uses HttpOnly cookies and a separate request-verification cookie. Theme and demonstration preferences stay in your browser. We do not include advertising trackers. Verified parent links grant learning-report access; students and parents can revoke those links.",
      "AI messages are sent to the configured Google Gemini service only after you accept the notice and send a question. Avoid including sensitive personal information. Voice/video calls share media with participants and may relay traffic through the configured TURN provider. Room messages are visible to room members. Calls and whiteboard strokes are not recorded by this application.",
      "Private course files are encrypted in the database and downloaded only after access checks. Files are not malware-scanned; only open content from teachers you trust. Teachers must have permission to share their materials. The operator controls hosting, database, email, TURN and AI provider accounts.",
      "Account settings let you export your personal learning records and delete your account after confirming your password. Deletion removes personal learning data, messages, uploaded files and parent links. Teaching content may remain without your profile, and other users may retain copies they downloaded. Administrators must arrange an administration transfer before deletion. Security audit records expire after 30 days. Encrypted backups have a separate retention schedule and must be kept access restricted. The operator must run the backup retention job and reapply account deletions before bringing a restored database online.",
    ],
    terms: [
      "Terms of use",
      "Use ADHAYAN for lawful learning and collaboration. Do not harass others, share another person’s private data, bypass access controls, or upload material you do not have permission to distribute. Teachers are responsible for checking their course material, sources, assessment answers and exam specifications before publishing.",
      "AI output can contain errors. Check explanations against reliable sources and ask a teacher when uncertain. Practice scores are learning feedback and do not guarantee examination results. Source links may lead to external services with their own terms and privacy practices.",
      "This application has no payment or subscription collection flow. The operator may suspend accounts that misuse the service. Availability depends on hosting and configured providers. Contact the operator for support, corrections, or account/data requests. The operator must confirm that this notice and the service meet the requirements applicable to their deployment before public launch.",
    ],
  };
  const [title, ...paragraphs] = content[kind] || content.about;
  return (
    <article className="max-w-3xl mx-auto p-8 space-y-5 text-slate-900 dark:text-white">
      <h1 className="text-3xl font-black">{title}</h1>
      {paragraphs.map((p) => (
        <p className="leading-relaxed" key={p}>
          {p}
        </p>
      ))}
      {operator?.supportEmail ? (
        <p>
          Operator: {operator.operator}
          <br />
          Support:{" "}
          <a className="underline" href={`mailto:${operator.supportEmail}`}>
            {operator.supportEmail}
          </a>
          {kind === "privacy" && (
            <>
              <br />
              Configured encrypted-backup retention:{" "}
              {operator.backupRetentionDays} days.
            </>
          )}
        </p>
      ) : (
        <p className="text-sm text-slate-500">
          Support contact has not been configured for this deployment. Contact
          the administrator who provided your access.
        </p>
      )}
      <Link className="underline" to="/">
        Home
      </Link>
    </article>
  );
}
