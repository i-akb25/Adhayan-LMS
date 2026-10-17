import { Link } from "react-router-dom";
export default function Notice({ kind }) {
  const content = {
    about: [
      "About ADHAYAN",
      "ADHAYAN connects structured lessons, assessments, progress reports and collaborative study.",
    ],
    contact: [
      "Contact",
      "For questions about your course or account, contact the administrator who provided your access.",
    ],
    privacy: [
      "Privacy notice",
      "ADHAYAN stores account details, enrolments, learning progress, submitted work, test results and study-room messages in its configured database. Verified parent links permit access to learning reports and can be removed. Session identifiers use HttpOnly cookies. Authentication credentials are not stored in browser local storage. AI questions leave this service only when you explicitly send them after accepting the provider notice. Room messages are shared with other room members. Security audit records expire after 30 days. This deployment needs an operator contact, retention policy for learning records and an account deletion process before a public launch.",
    ],
    terms: [
      "Terms of use",
      "Use ADHAYAN for lawful educational purposes. Do not upload private information about other people or misuse study rooms. Teachers are responsible for reviewing published lessons, questions and explanations. AI answers may be inaccurate. Service availability depends on the configured hosting and providers. These are preliminary service terms; the operator must add their identity, support contact and applicable policies before public launch.",
    ],
  };
  const [title, text] = content[kind] || content.about;
  return (
    <article className="max-w-3xl mx-auto p-8 space-y-5 text-slate-900 dark:text-white">
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="leading-relaxed">{text}</p>
      <Link className="underline" to="/">
        Home
      </Link>
    </article>
  );
}
