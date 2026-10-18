import { useCallback, useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
const box =
  "bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4";
const input =
  "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3";
const button =
  "px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50";
export function useRecords(path) {
  const [data, setData] = useState([]),
    [error, setError] = useState("");
  const sequence = useRef(0);
  const reload = useCallback(async () => {
    const current = ++sequence.current;
    if (!path) {
      setData([]);
      setError("");
      return;
    }
    try {
      const result = await api.get(path);
      if (current === sequence.current) {
        setData(result.data);
        setError("");
      }
    } catch (e) {
      if (current === sequence.current) setError(e.message);
    }
  }, [path]);
  const invalidate = useCallback(() => {
    sequence.current++;
  }, []);
  useEffect(() => {
    setData([]);
    reload();
    return invalidate;
  }, [reload, invalidate]);
  return { data, error, reload };
}
export function useTask() {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  return { busy, message, setMessage, run };
}
function Message({ children }) {
  return children ? (
    <p role="status" className="p-3 rounded-xl bg-amber-50 text-amber-900">
      {children}
    </p>
  ) : null;
}
export function download(data, name, type = "application/json") {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function PrivateFiles({ courseId, teacher }) {
  const files = useRecords(`/courses/${courseId}/files`),
    task = useTask();
  return (
    <section className={box}>
      <h2 className="text-xl font-bold">Private course files</h2>
      <Message>{task.message || files.error}</Message>
      {teacher && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget,
              f = new FormData(form);
            task.run(async () => {
              const file = f.get("file");
              if (!file?.size || file.size > 5 * 1024 * 1024)
                throw Error("Choose a PDF, PNG or JPEG up to 5 MiB.");
              await api.post(`/courses/${courseId}/files`, file, {
                headers: { "Content-Type": "application/octet-stream" },
                params: { title: f.get("title"), name: file.name },
              });
              form.reset();
              await files.reload();
            });
          }}
        >
          <label className="block">
            File title
            <input className={input} name="title" required maxLength={200} />
          </label>
          <label className="block">
            PDF, PNG or JPEG, maximum 5 MiB
            <input
              className={input}
              type="file"
              name="file"
              accept=".pdf,.png,.jpg,.jpeg"
              required
            />
          </label>
          <p className="text-sm text-slate-500">
            Only upload material you have permission to share. Files download as
            attachments. Only course members can download them.
          </p>
          <button className={button} disabled={task.busy}>
            Upload private file
          </button>
        </form>
      )}
      {files.data.map((f) => (
        <article key={f.id} className="border-t py-3">
          <p>
            {f.title} · {Math.ceil(f.size / 1024)} KiB
          </p>
          <button
            className="underline"
            disabled={task.busy}
            onClick={() =>
              task.run(async () => {
                const blob = await api.get(`/files/${f.id}/download`, {
                  responseType: "blob",
                });
                download(blob, f.name, f.mime);
              })
            }
          >
            Download {f.name}
          </button>
          {teacher && (
            <button
              className="ml-4 underline"
              disabled={task.busy}
              onClick={() =>
                task.run(async () => {
                  await api.delete(`/files/${f.id}`);
                  await files.reload();
                })
              }
            >
              Delete file
            </button>
          )}
        </article>
      ))}
      {!files.data.length && <p>No private files yet.</p>}
    </section>
  );
}
export function ContentImport({ onImported }) {
  const task = useTask();
  return (
    <details className={box}>
      <summary className="font-bold">Import a sourced curriculum</summary>
      <Message>{task.message}</Message>
      <p>
        Import lessons, worked examples, revision notes, sources and question
        sets together. Imported material stays in draft until you inspect and
        approve it.
      </p>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const file = new FormData(form).get("package");
          task.run(async () => {
            if (!file?.size || file.size > 240000)
              throw Error("Choose a JSON curriculum package below 240 KB.");
            let data;
            try {
              data = JSON.parse(await file.text());
            } catch {
              throw Error("The package is not valid JSON.");
            }
            const r = await api.post("/curriculum/import", data);
            form.reset();
            task.setMessage(
              "Draft imported. Open its course review before publishing.",
            );
            await onImported();
            window.location.assign(`/learn/${r.data.id}`);
          });
        }}
      >
        <label className="block">
          Curriculum package
          <input
            type="file"
            accept=".json,application/json"
            name="package"
            className={input}
            required
          />
        </label>
        <button disabled={task.busy} className={button}>
          Import as draft
        </button>
      </form>
      <a
        className="underline"
        href="/content/algebra-foundations.json"
        download
      >
        Download the sourced algebra starter package
      </a>
      <p className="text-sm text-slate-500">
        This short original starter is not a complete exam syllabus. Teachers
        must check its content and references before publishing.
      </p>
    </details>
  );
}
export function ContentReview({ courseId, reloadLessons }) {
  const records = useRecords(`/courses/${courseId}/review`),
    task = useTask(),
    [editing, setEditing] = useState(null);
  const data = records.data?.course ? records.data : null;
  return (
    <details className={box}>
      <summary className="font-bold">Review and edit course content</summary>
      <Message>{task.message || records.error}</Message>
      {data && (
        <>
          <h2 className="font-bold">
            {data.course.title} ·{" "}
            {data.course.reviewRequired
              ? "Review required"
              : "Reviewed / manually authored"}
          </h2>
          <p className="whitespace-pre-wrap">{data.course.syllabus}</p>
          <ul>
            {data.course.sources?.map((url) => (
              <li key={url}>
                <a
                  className="underline"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
          <p>
            Inspect each lesson and every assessment answer and explanation.
            Changes to sourced course content return the course to draft.
          </p>
          {data.lessons.map((l) => (
            <button
              key={l.id}
              className="block underline"
              onClick={() => setEditing(l)}
            >
              Edit {l.title}
            </button>
          ))}
          {editing && (
            <form
              key={editing.id}
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                task.run(async () => {
                  const update = Object.fromEntries(f);
                  update.order = Number(update.order);
                  await api.patch(`/lessons/${editing.id}`, update);
                  setEditing(null);
                  await records.reload();
                  await reloadLessons();
                });
              }}
            >
              {[
                "title",
                "subject",
                "chapter",
                "sourceUrl",
                "videoUrl",
                "order",
              ].map((k) => (
                <label key={k} className="block">
                  {k}
                  <input
                    className={input}
                    name={k}
                    defaultValue={editing[k] || (k === "order" ? 0 : "")}
                    required={!["videoUrl", "sourceUrl"].includes(k)}
                    type={k === "order" ? "number" : "text"}
                  />
                </label>
              ))}
              {["content", "workedExample", "revisionNotes"].map((k) => (
                <label key={k} className="block">
                  {k}
                  <textarea
                    className={input}
                    name={k}
                    defaultValue={editing[k] || ""}
                    rows={6}
                    required
                  />
                </label>
              ))}
              <button className={button} disabled={task.busy}>
                Save lesson changes
              </button>
              <button
                type="button"
                className="ml-3 underline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            </form>
          )}
          {data.tests.map((t) => (
            <details key={t.id}>
              <summary>
                {t.title} · {t.published ? "Published" : "Draft"}
              </summary>
              {t.questions.map((q) => (
                <article key={q.id} className="py-3">
                  <p className="font-bold">{q.prompt}</p>
                  {q.options.map((o, i) => (
                    <p key={i}>
                      {i + 1}. {o}
                      {i === q.correctIndex ? " (correct)" : ""}
                    </p>
                  ))}
                  <p>{q.explanation}</p>
                  <p>
                    {q.marks} marks · penalty {q.negativeMarks}
                  </p>
                </article>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  task.run(async () => {
                    await api.patch(`/tests/${t.id}`, {
                      questions: JSON.parse(f.get("questions")),
                    });
                    await records.reload();
                  });
                }}
              >
                <label>
                  Questions and explanations
                  <textarea
                    className={input}
                    name="questions"
                    rows={8}
                    defaultValue={JSON.stringify(
                      t.questions.map(({ id: _id, ...q }) => q),
                      null,
                      2,
                    )}
                  />
                </label>
                <button className={button} disabled={task.busy}>
                  Save assessment changes as draft
                </button>
              </form>
              <button
                className="underline"
                disabled={task.busy || data.course.reviewRequired}
                onClick={() =>
                  task.run(async () => {
                    await api.patch(`/tests/${t.id}`, {
                      published: !t.published,
                    });
                    await records.reload();
                  })
                }
              >
                {t.published ? "Unpublish assessment" : "Publish assessment"}
              </button>
            </details>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              task.run(async () => {
                await api.post(`/courses/${courseId}/review`, {
                  confirmed: true,
                });
                await records.reload();
                task.setMessage(
                  "Review recorded. You can now publish the course and its assessments.",
                );
              });
            }}
          >
            <label className="block py-3">
              <input type="checkbox" required /> I checked the lesson content,
              sources, worked examples, questions and explanations.
            </label>
            <button className={button} disabled={task.busy}>
              Approve content review
            </button>
          </form>
        </>
      )}
    </details>
  );
}
export function Institutions() {
  const records = useRecords("/institutions"),
    task = useTask(),
    [selected, setSelected] = useState("");
  const members = useRecords(
    selected ? `/admin/institutions/${selected}/members` : null,
  );
  return (
    <section className={box}>
      <h2 className="text-xl font-bold">Institutions</h2>
      <Message>{task.message || records.error || members.error}</Message>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget,
            f = new FormData(form);
          task.run(async () => {
            await api.post("/admin/institutions", Object.fromEntries(f));
            form.reset();
            await records.reload();
          });
        }}
      >
        <label className="block">
          Institution name
          <input className={input} name="name" required maxLength={200} />
        </label>
        <label className="block">
          Description
          <input className={input} name="description" maxLength={2000} />
        </label>
        <button className={button} disabled={task.busy}>
          Create institution
        </button>
      </form>
      {records.data.map((i) => (
        <div key={i.id} className="border-t py-3">
          <button className="underline" onClick={() => setSelected(i.id)}>
            {i.name}
          </button>
          <span> · {i.active ? "Active" : "Disabled"}</span>
          <button
            className="ml-3 underline"
            disabled={task.busy}
            onClick={() =>
              task.run(async () => {
                await api.patch(`/admin/institutions/${i.id}`, {
                  active: !i.active,
                });
                await records.reload();
              })
            }
          >
            {i.active ? "Disable institution" : "Enable institution"}
          </button>
        </div>
      ))}
      {selected && (
        <>
          <h3 className="font-bold">Institution members</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              task.run(async () => {
                await api.put(`/admin/institutions/${selected}/members`, {
                  email: new FormData(form).get("email"),
                });
                form.reset();
                await members.reload();
              });
            }}
          >
            <label>
              Existing account email
              <input className={input} name="email" type="email" required />
            </label>
            <button className={button} disabled={task.busy}>
              Add member
            </button>
          </form>
          {members.data.map((m) => (
            <p key={m.id}>
              {m.name} · {m.role}
              <button
                className="ml-3 underline"
                disabled={task.busy}
                onClick={() =>
                  task.run(async () => {
                    await api.delete(
                      `/admin/institutions/${selected}/members/${m.id}`,
                    );
                    await members.reload();
                  })
                }
              >
                Remove membership
              </button>
            </p>
          ))}
        </>
      )}
      <p className="text-sm text-slate-500">
        Institution courses require current membership. This is one
        operator-managed platform; administrators can manage all institutions.
      </p>
    </section>
  );
}
export function DataControls() {
  const task = useTask(),
    { user, logout } = useAuth();
  return (
    <section className={box}>
      <h2 className="text-xl font-bold">Your data</h2>
      <Message>{task.message}</Message>
      <button
        className={button}
        disabled={task.busy}
        onClick={() =>
          task.run(async () => {
            const data = await api.get("/account/export");
            download(JSON.stringify(data, null, 2), "adhayan-account.json");
          })
        }
      >
        Download my account data
      </button>
      {user.role !== "Admin" && (
        <details>
          <summary className="font-bold text-red-700">
            Delete my account
          </summary>
          <p>
            This permanently removes your profile details, enrolments, notes,
            attempts, submissions, attendance, parent links, memberships,
            uploaded files and messages. Published teaching content is retained
            without your profile. Encrypted backups expire separately under the
            operator’s backup policy.
          </p>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              task.run(async () => {
                await api.delete("/account", { data: Object.fromEntries(f) });
                await logout();
                window.location.assign("/");
              });
            }}
          >
            <label className="block">
              Current password
              <input
                className={input}
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <label className="block">
              Type DELETE MY ACCOUNT
              <input
                className={input}
                name="confirmation"
                pattern="DELETE MY ACCOUNT"
                required
              />
            </label>
            <button
              className="px-4 py-2 rounded-xl bg-red-700 text-white"
              disabled={task.busy}
            >
              Permanently delete account
            </button>
          </form>
        </details>
      )}
    </section>
  );
}
export function Readiness() {
  const r = useRecords("/admin/readiness");
  return (
    <section className={box}>
      <h2 className="text-xl font-bold">Service configuration</h2>
      <Message>{r.error}</Message>
      {Object.entries(r.data)
        .filter(([, v]) => typeof v === "boolean")
        .map(([k, v]) => (
          <p key={k}>
            {k}: {v ? "Configured" : "Needs configuration"}
          </p>
        ))}
      <p className="text-sm text-slate-500">{r.data.notice}</p>
    </section>
  );
}
export function InstitutionSelect() {
  const r = useRecords("/institutions");
  return (
    <label className="block">
      Institution
      <select name="institutionId" className={input}>
        <option value="">Independent course</option>
        {r.data
          .filter((i) => i.active)
          .map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
      </select>
    </label>
  );
}
