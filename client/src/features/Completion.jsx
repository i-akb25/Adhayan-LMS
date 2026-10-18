import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useRecords, useTask, download } from "./Management";
const box =
  "bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4";
const input =
  "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3";
const button =
  "px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50";
function Status({ children }) {
  return children ? (
    <p role="status" className="p-3 bg-amber-50 text-amber-900 rounded-xl">
      {children}
    </p>
  ) : null;
}
function Field({ label, ...props }) {
  return (
    <label className="block">
      {label}
      <input className={input} {...props} />
    </label>
  );
}
function Courses({ records, value, onChange }) {
  const { user } = useAuth();
  return (
    <label className="block">
      Course
      <select
        className={input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Choose course</option>
        {records
          .filter((c) => ["Teacher", "Admin"].includes(user.role) || c.enrolled)
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
      </select>
    </label>
  );
}
function Attachment({ id, label }) {
  const task = useTask();
  return (
    <span className="block">
      <button
        className="underline"
        disabled={task.busy}
        onClick={() =>
          task.run(async () => {
            const f = (await api.get(`/files/${id}/meta`)).data;
            const blob = await api.get(`/files/${id}/download`, {
              responseType: "blob",
            });
            download(blob, f.name, f.mime);
          })
        }
      >
        {label || "Download attachment"}
      </button>
      <Status>{task.message}</Status>
    </span>
  );
}
export function Assignments() {
  const { user } = useAuth(),
    teacher = ["Teacher", "Admin"].includes(user.role),
    courses = useRecords("/courses"),
    [courseId, setCourseId] = useState("");
  const records = useRecords(
      courseId ? `/assignments?courseId=${courseId}` : null,
    ),
    task = useTask();
  return (
    <>
      <Status>{task.message || courses.error || records.error}</Status>
      <Courses records={courses.data} value={courseId} onChange={setCourseId} />
      {teacher && courseId && (
        <details className={box}>
          <summary>Create assignment</summary>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget,
                f = new FormData(form);
              task.run(async () => {
                await api.post("/assignments", {
                  courseId,
                  title: f.get("title"),
                  description: f.get("description"),
                  dueAt: new Date(f.get("dueAt")).toISOString(),
                });
                form.reset();
                await records.reload();
              });
            }}
          >
            <Field
              label="Assignment title"
              name="title"
              required
              maxLength={200}
            />
            <label className="block">
              Instructions
              <textarea
                className={input}
                name="description"
                rows={5}
                required
                maxLength={10000}
              />
            </label>
            <Field
              label="Deadline (your local time)"
              name="dueAt"
              type="datetime-local"
              required
            />
            <button className={button} disabled={task.busy}>
              Create assignment
            </button>
          </form>
        </details>
      )}
      {!records.data.length && (
        <p>{courseId ? "No assignments yet." : "Select an enrolled course."}</p>
      )}
      {records.data.map((a) => (
        <article className={box} key={a.id}>
          <h2 className="text-xl font-bold">{a.title}</h2>
          <p className="whitespace-pre-wrap">{a.description}</p>
          <p>Due: {new Date(a.dueAt).toLocaleString()}</p>
          {teacher ? (
            <Reviews assignmentId={a.id} />
          ) : (
            <Submission assignment={a} reload={records.reload} />
          )}
        </article>
      ))}
    </>
  );
}
function Submission({ assignment, reload }) {
  const files = useRecords(`/assignments/${assignment.id}/files`),
    task = useTask(),
    [selected, setSelected] = useState([]);
  const submitted = assignment.mySubmission;
  return (
    <>
      <Status>{task.message || files.error}</Status>
      {submitted ? (
        <section>
          <h3 className="font-bold">Your submitted work</h3>
          <p className="whitespace-pre-wrap">{submitted.content}</p>
          <p>
            {submitted.grade === undefined
              ? "Awaiting review"
              : `Grade: ${submitted.grade}/100`}
          </p>
          <p className="whitespace-pre-wrap">{submitted.feedback}</p>
          {submitted.fileIds?.map((id) => (
            <Attachment
              key={id}
              id={id}
              label="Download submitted attachment"
            />
          ))}
        </section>
      ) : (
        <>
          <details>
            <summary>Attach private files (optional)</summary>
            <p className="text-sm text-slate-500">
              Only you and the reviewing course teacher or administrator can
              download submitted files. Select up to three files. PDF, PNG and
              JPEG only, 5 MiB per file.
            </p>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget,
                  f = new FormData(form);
                task.run(async () => {
                  const file = f.get("file");
                  if (!file?.size || file.size > 5 * 1024 * 1024)
                    throw Error("Choose a file up to 5 MiB.");
                  await api.post(`/assignments/${assignment.id}/files`, file, {
                    headers: { "Content-Type": "application/octet-stream" },
                    params: { title: file.name, name: file.name },
                  });
                  form.reset();
                  await files.reload();
                });
              }}
            >
              <Field
                label="Assignment attachment"
                type="file"
                name="file"
                accept=".pdf,.png,.jpg,.jpeg"
                required
              />
              <button className={button} disabled={task.busy}>
                Upload assignment attachment
              </button>
            </form>
          </details>
          {files.data.map((f) => (
            <div key={f.id} className="border-t pt-3">
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(f.id)}
                  onChange={(e) =>
                    setSelected((ids) =>
                      e.target.checked
                        ? [...ids, f.id]
                        : ids.filter((id) => id !== f.id),
                    )
                  }
                />{" "}
                Include {f.name}
              </label>
              <Attachment id={f.id} label={`Download ${f.name}`} />
              <button
                className="underline"
                disabled={task.busy}
                onClick={() =>
                  task.run(async () => {
                    await api.delete(`/files/${f.id}`);
                    setSelected((ids) => ids.filter((id) => id !== f.id));
                    await files.reload();
                  })
                }
              >
                Remove unsubmitted file
              </button>
            </div>
          ))}
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              task.run(async () => {
                if (selected.length > 3)
                  throw Error("Select at most three attachments.");
                await api.post(`/assignments/${assignment.id}/submit`, {
                  content: f.get("content"),
                  fileIds: selected,
                });
                await reload();
              });
            }}
          >
            <label className="block">
              My submission
              <textarea
                className={input}
                name="content"
                rows={5}
                required
                maxLength={20000}
              />
            </label>
            <p>
              Submitting is final. Check your text and selected attachments
              first.
            </p>
            <button className={button} disabled={task.busy}>
              Submit assignment
            </button>
          </form>
        </>
      )}
    </>
  );
}
function Reviews({ assignmentId }) {
  const [open, setOpen] = useState(false),
    r = useRecords(open ? `/assignments/${assignmentId}/submissions` : null),
    task = useTask();
  return (
    <>
      <button className={button} onClick={() => setOpen((v) => !v)}>
        {open ? "Hide submissions" : "Review submissions"}
      </button>
      <Status>{task.message || r.error}</Status>
      {open &&
        (!r.data.length ? (
          <p>No submissions yet.</p>
        ) : (
          r.data.map((s) => (
            <form
              key={s.id}
              className="border-t pt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                task.run(async () => {
                  await api.patch(`/submissions/${s.id}`, {
                    grade: Number(f.get("grade")),
                    feedback: f.get("feedback"),
                  });
                  await r.reload();
                  task.setMessage("Review saved.");
                });
              }}
            >
              <h3 className="font-bold">{s.studentName || s.studentId}</h3>
              <p className="whitespace-pre-wrap">{s.content}</p>
              {s.fileIds?.map((id) => (
                <Attachment
                  key={id}
                  id={id}
                  label="Download student attachment"
                />
              ))}
              <Field
                label="Grade (0–100)"
                name="grade"
                type="number"
                min={0}
                max={100}
                defaultValue={s.grade}
                required
              />
              <label className="block">
                Feedback
                <textarea
                  name="feedback"
                  className={input}
                  rows={3}
                  maxLength={5000}
                  defaultValue={s.feedback || ""}
                />
              </label>
              <button className={button} disabled={task.busy}>
                Save review
              </button>
            </form>
          ))
        ))}
    </>
  );
}
export function ScheduledClasses() {
  const { user } = useAuth(),
    teacher = ["Teacher", "Admin"].includes(user.role),
    courses = useRecords("/courses"),
    [courseId, setCourseId] = useState(""),
    r = useRecords(courseId ? `/classes?courseId=${courseId}` : null),
    task = useTask(),
    [edit, setEdit] = useState(null);
  const save = (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      f = new FormData(form);
    task.run(async () => {
      const data = {
        title: f.get("title"),
        startsAt: new Date(f.get("startsAt")).toISOString(),
        endsAt: new Date(f.get("endsAt")).toISOString(),
      };
      if (edit) await api.patch(`/classes/${edit.id}`, data);
      else await api.post("/classes", { ...data, courseId });
      form.reset();
      setEdit(null);
      await r.reload();
    });
  };
  const localDate = (value) => {
    const d = new Date(value);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  return (
    <>
      <Status>{task.message || courses.error || r.error}</Status>
      <Courses
        records={courses.data}
        value={courseId}
        onChange={(id) => {
          setCourseId(id);
          setEdit(null);
        }}
      />
      {teacher && courseId && (
        <details className={box} open={!!edit || undefined}>
          <summary>{edit ? "Reschedule class" : "Schedule class"}</summary>
          <form
            className="space-y-3"
            key={edit?.id || courseId}
            onSubmit={save}
          >
            <Field
              label="Class title"
              name="title"
              required
              maxLength={200}
              defaultValue={edit?.title || ""}
            />
            <Field
              label="Starts (your local time)"
              name="startsAt"
              type="datetime-local"
              required
              defaultValue={edit ? localDate(edit.startsAt) : ""}
            />
            <Field
              label="Ends (your local time)"
              name="endsAt"
              type="datetime-local"
              required
              defaultValue={edit ? localDate(edit.endsAt) : ""}
            />
            <button className={button} disabled={task.busy}>
              {edit ? "Save class changes" : "Schedule class"}
            </button>
            {edit && (
              <button
                type="button"
                className="ml-3 underline"
                onClick={() => setEdit(null)}
              >
                Cancel edit
              </button>
            )}
          </form>
        </details>
      )}
      <p>
        Class times are shown in your device’s time zone. Student rooms open 10
        minutes before class and close 15 minutes after the end. Calls require a
        configured TURN service for reliable cross-network connections.
      </p>
      {!r.data.length && (
        <p>
          {courseId ? "No classes scheduled." : "Select an enrolled course."}
        </p>
      )}
      {r.data.map((c) => (
        <article className={box} key={c.id}>
          <h2 className="text-xl font-bold">{c.title}</h2>
          <p>
            {new Date(c.startsAt).toLocaleString()} –{" "}
            {new Date(c.endsAt).toLocaleString()}
          </p>
          <p>{c.cancelled ? "Cancelled" : "Scheduled"}</p>
          {!c.cancelled && (
            <Link className={button} to={`/study-room/${c.roomId}`}>
              Open class room
            </Link>
          )}
          <button
            className="ml-3 underline"
            disabled={task.busy}
            onClick={() =>
              task.run(async () => {
                const blob = await api.get(`/classes/${c.id}/calendar`, {
                  responseType: "blob",
                });
                download(blob, "adhayan-class.ics", "text/calendar");
              })
            }
          >
            Download calendar event
          </button>
          {teacher && !c.cancelled && (
            <div>
              <button className="underline" onClick={() => setEdit(c)}>
                Reschedule
              </button>
              <button
                className="ml-3 underline"
                disabled={task.busy}
                onClick={() =>
                  task.run(async () => {
                    await api.patch(`/classes/${c.id}`, { cancelled: true });
                    await r.reload();
                  })
                }
              >
                Cancel class
              </button>
            </div>
          )}
        </article>
      ))}
    </>
  );
}
export function Moderation() {
  const [status, setStatus] = useState("open"),
    [page, setPage] = useState(1),
    r = useRecords(`/admin/reports?status=${status}&page=${page}`),
    task = useTask();
  return (
    <section className={box}>
      <h2 className="text-xl font-bold">Room reports</h2>
      <Status>{task.message || r.error}</Status>
      <label>
        Status
        <select
          className={input}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {["open", "resolved", "dismissed"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      {r.data.map((report) => (
        <article className="border-t py-3" key={report.id}>
          <p>Reported: {new Date(report.createdAt).toLocaleString()}</p>
          <p className="whitespace-pre-wrap">Reason: {report.reason}</p>
          <p className="whitespace-pre-wrap">
            Message: {report.message?.content || "Message already removed"}
          </p>
          {status === "open" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const action = new FormData(e.currentTarget).get("action");
                task.run(async () => {
                  await api.patch(`/admin/reports/${report.id}`, { action });
                  await r.reload();
                });
              }}
            >
              <label>
                Resolution
                <select className={input} name="action">
                  {[
                    "dismiss",
                    "remove-message",
                    "remove-member",
                    "close-room",
                  ].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
              <button className={button} disabled={task.busy}>
                Apply moderation action
              </button>
            </form>
          )}
        </article>
      ))}
      {!r.data.length && <p>No reports on this page.</p>}
      <div className="flex gap-3">
        <button
          className="underline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous reports
        </button>
        <span>Page {page}</span>
        <button
          className="underline"
          disabled={r.data.length < 25}
          onClick={() => setPage((p) => p + 1)}
        >
          Next reports
        </button>
      </div>
    </section>
  );
}
