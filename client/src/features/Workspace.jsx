import {
  PrivateFiles,
  ContentImport,
  ContentReview,
  Institutions,
  DataControls,
  Readiness,
  InstitutionSelect,
} from "./Management";
const RoomCall = lazy(() => import("./RoomCall"));

import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
const box =
  "bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4";
const input =
  "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white";
const button =
  "px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50";
const list = (data) => (Array.isArray(data) ? data : []);
function ErrorNotice({ message }) {
  return message ? (
    <p
      role="alert"
      className="rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3"
    >
      {message}
    </p>
  ) : null;
}
function Field({ label, ...props }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-bold">{label}</span>
      <input className={input} {...props} />
    </label>
  );
}
function Empty({ children = "No records yet." }) {
  return <p className="text-slate-500 py-4">{children}</p>;
}
export function useResource(path, initial = null) {
  const [data, setData] = useState(initial),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(!!path);
  const sequence = useRef(0),
    empty = useRef(initial);
  const load = useCallback(async () => {
    const current = ++sequence.current;
    if (!path) {
      setData(empty.current);
      setLoading(false);
      setError("");
      return;
    }
    setLoading(true);
    try {
      const r = await api.get(path);
      if (current !== sequence.current) return;
      setData(r.data);
      setError("");
    } catch (e) {
      if (current === sequence.current) setError(e.message);
    } finally {
      if (current === sequence.current) setLoading(false);
    }
  }, [path]);
  const invalidate = useCallback(() => {
    sequence.current++;
  }, []);
  useEffect(() => {
    load();
    return invalidate;
  }, [load, invalidate]);
  return { data, setData, error, loading, reload: load };
}
function useAction() {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const act = async (fn, after) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await fn();
      if (after) await after();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  return { busy, message, act };
}
export default function Workspace({ section = "courses", embedded = false }) {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const titles = {
    courses: "My Learning",
    assessments: "Diagnostic Tests",
    assignments: "Assignments",
    attendance: "Attendance",
    rooms: "Study Rooms",
    parent: "Parent Connect",
    analytics: "Learning Progress",
    settings: "Account Settings",
    admin: "Administration",
    plans: "Study Plan",
    materials: "Study Materials",
    discussions: "Discussions",
    classes: "Live Classes",
  };
  const content =
    section === "courses" ? (
      <Courses />
    ) : section === "assessments" ? (
      <Assessments />
    ) : section === "assignments" ? (
      <CourseWork mode="assignments" />
    ) : section === "attendance" ? (
      <CourseWork mode="attendance" />
    ) : section === "materials" ? (
      <CourseWork mode="materials" />
    ) : section === "rooms" ||
      section === "discussions" ||
      section === "classes" ? (
      <Rooms />
    ) : section === "parent" ? (
      <ParentConnect />
    ) : section === "analytics" ? (
      <Analytics />
    ) : section === "settings" ? (
      <Account />
    ) : section === "admin" ? (
      <Administration />
    ) : (
      <Plans />
    );
  return (
    <section
      className={`${embedded ? "" : "min-h-screen p-4 sm:p-8"} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">{titles[section]}</h1>
            <p className="text-slate-500">
              {user?.track || "Your ADHAYAN workspace"}
            </p>
          </div>
          <Link className={button} to="/dashboard">
            Dashboard
          </Link>
        </header>
        <nav className="flex flex-wrap gap-2" aria-label="Learning workspace">
          {[
            ["/learn", "Learn"],
            ["/diagnostic-test", "Tests"],
            ["/study-materials", "Materials"],
            ["/assignments", "Assignments"],
            ["/attendance", "Attendance"],
            ["/global-study-hall", "Rooms"],
            ["/analytics", "Progress"],
            ["/parent-connect", "Parent Connect"],
            ["/study-plan", "Study Plan"],
            ["/settings", "Settings"],
            ...(role === "admin" ? [["/admin/users", "Admin"]] : []),
          ].map(([to, label]) => (
            <Link
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-sm"
              key={to}
              to={to}
            >
              {label}
            </Link>
          ))}
        </nav>
        {user?.isDemo ? (
          <p className={box}>
            This is a demonstration account. Sign in with a real account to save
            learning progress or manage records.
          </p>
        ) : (
          content
        )}
      </div>
    </section>
  );
}
function Courses() {
  const { user, restoreSession } = useAuth();
  const teacher = ["Teacher", "Admin"].includes(user.role);
  const courses = useResource("/courses", []);
  const { busy, message, act } = useAction();
  const [track, setTrack] = useState("");
  const create = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await act(
      () =>
        api.post("/courses", {
          title: f.get("title"),
          description: f.get("description"),
          track: f.get("track"),
          published: f.get("published") === "on",
          ...(f.get("institutionId")
            ? { institutionId: f.get("institutionId") }
            : {}),
        }),
      courses.reload,
    );
  };
  return (
    <>
      <ErrorNotice message={message || courses.error} />
      {user.role === "Student" && !user.track && (
        <form
          className={box}
          onSubmit={(e) => {
            e.preventDefault();
            act(
              () => api.put("/users/track", { track }),
              async () => {
                await restoreSession();
                courses.reload();
              },
            );
          }}
        >
          <h2 className="text-xl font-bold">
            Choose one active learning track
          </h2>
          <Field
            label="Class or preparation track"
            placeholder="Example: Class 11 · JEE"
            required
            maxLength={150}
            value={track}
            onChange={(e) => setTrack(e.target.value)}
          />
          <button disabled={busy} className={button}>
            Save track
          </button>
        </form>
      )}
      {teacher && (
        <details className={box}>
          <summary className="font-bold cursor-pointer">Create course</summary>
          <form className="space-y-3" onSubmit={create}>
            <Field label="Title" name="title" required maxLength={200} />
            <Field label="Track" name="track" required maxLength={150} />
            <Field label="Description" name="description" maxLength={5000} />
            <InstitutionSelect />
            <label>
              <input type="checkbox" name="published" /> Publish for students
            </label>
            <div>
              <button className={button} disabled={busy}>
                Create course
              </button>
            </div>
          </form>
        </details>
      )}
      {teacher && <ContentImport onImported={courses.reload} />}
      <div className="space-y-4">
        {courses.loading ? (
          <Empty>Loading courses…</Empty>
        ) : !list(courses.data).length ? (
          <Empty>
            No courses are available for this track yet. A teacher can publish
            the first course.
          </Empty>
        ) : (
          courses.data.map((c) => (
            <article key={c.id} className={box}>
              <h2 className="text-xl font-bold">{c.title}</h2>
              <p>{c.description}</p>
              <p className="text-sm text-slate-500">
                {c.track} · {c.published ? "Published" : "Draft"}
              </p>
              {teacher || c.enrolled ? (
                <Link className={button} to={`/learn/${c.id}`}>
                  Open course
                </Link>
              ) : (
                <button
                  className={button}
                  disabled={busy}
                  onClick={() =>
                    act(
                      () => api.post(`/courses/${c.id}/enroll`, {}),
                      courses.reload,
                    )
                  }
                >
                  Enrol
                </button>
              )}
              {teacher && (
                <button
                  className="ml-3 underline"
                  disabled={busy}
                  onClick={() =>
                    act(
                      () =>
                        api.patch(`/courses/${c.id}`, {
                          published: !c.published,
                        }),
                      courses.reload,
                    )
                  }
                >
                  {c.published ? "Unpublish" : "Publish"}
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </>
  );
}
export function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const teacher = ["Teacher", "Admin"].includes(user.role);
  const lessons = useResource(`/courses/${id}/lessons`, []);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const { busy, message, act } = useAction();
  const lesson = list(lessons.data).find((l) => l.id === selected);
  const create = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    act(
      () =>
        api.post(`/courses/${id}/lessons`, {
          title: f.get("title"),
          chapter: f.get("chapter"),
          subject: f.get("subject"),
          content: f.get("content"),
          videoUrl: f.get("videoUrl") || "",
          order: Number(f.get("order")),
          workedExample: f.get("workedExample") || "",
          revisionNotes: f.get("revisionNotes") || "",
          sourceUrl: f.get("sourceUrl") || "",
        }),
      lessons.reload,
    );
  };
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to="/learn" className="underline">
          Back to learning
        </Link>
        <h1 className="text-3xl font-black">Course lessons</h1>
        <ErrorNotice message={message || lessons.error} />
        {teacher && (
          <details className={box}>
            <summary className="font-bold">Add lesson</summary>
            <form onSubmit={create} className="space-y-3">
              <Field label="Title" name="title" required />
              <Field label="Subject" name="subject" required />
              <Field label="Chapter" name="chapter" required />
              <Field
                label="Order"
                name="order"
                type="number"
                min="0"
                max="10000"
                defaultValue="0"
              />
              <Field
                label="Video URL (HTTPS, optional)"
                name="videoUrl"
                type="url"
              />
              <label className="block">
                Lesson content
                <textarea
                  className={input}
                  name="content"
                  required
                  maxLength={50000}
                  rows={8}
                />
              </label>
              {["workedExample", "revisionNotes"].map((name) => (
                <label key={name} className="block">
                  {name === "workedExample"
                    ? "Worked example"
                    : "Revision notes"}
                  <textarea
                    className={input}
                    name={name}
                    rows={4}
                    maxLength={10000}
                  />
                </label>
              ))}
              <Field label="Source URL (HTTPS)" name="sourceUrl" type="url" />
              <button disabled={busy} className={button}>
                Save lesson
              </button>
            </form>
          </details>
        )}
        {teacher && (
          <ContentReview courseId={id} reloadLessons={lessons.reload} />
        )}
        <PrivateFiles courseId={id} teacher={teacher} />
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className={box}>
            {!list(lessons.data).length ? (
              <Empty>No lessons published yet.</Empty>
            ) : (
              lessons.data.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setSelected(l.id);
                    setNotes(l.progress?.notes || "");
                  }}
                  className="block w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <strong>{l.title}</strong>
                  <span className="block text-xs text-slate-500">
                    {l.subject} · {l.chapter}
                    {l.progress?.completed ? " · Completed" : ""}
                  </span>
                </button>
              ))
            )}
          </aside>
          <article className={box}>
            {lesson ? (
              <>
                <h2 className="text-2xl font-black">{lesson.title}</h2>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {lesson.content}
                </p>
                {lesson.workedExample && (
                  <section>
                    <h3 className="font-bold">Worked example</h3>
                    <p className="whitespace-pre-wrap">
                      {lesson.workedExample}
                    </p>
                  </section>
                )}
                {lesson.revisionNotes && (
                  <section>
                    <h3 className="font-bold">Revision notes</h3>
                    <p className="whitespace-pre-wrap">
                      {lesson.revisionNotes}
                    </p>
                  </section>
                )}
                {lesson.sourceUrl && (
                  <a
                    className="block underline"
                    href={lesson.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lesson reference
                  </a>
                )}
                {lesson.videoUrl && (
                  <a
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={lesson.videoUrl}
                  >
                    Open lecture video
                  </a>
                )}
                {!teacher && (
                  <>
                    <label className="block">
                      My notes
                      <textarea
                        className={input}
                        rows={6}
                        value={notes}
                        maxLength={20000}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </label>
                    <button
                      className={button}
                      disabled={busy}
                      onClick={() =>
                        act(
                          () =>
                            api.put(`/lessons/${lesson.id}/progress`, {
                              completed: !!lesson.progress?.completed,
                              notes,
                            }),
                          lessons.reload,
                        )
                      }
                    >
                      Save notes
                    </button>
                    <button
                      className="ml-3 underline"
                      disabled={busy}
                      onClick={() =>
                        act(
                          () =>
                            api.put(`/lessons/${lesson.id}/progress`, {
                              completed: !lesson.progress?.completed,
                              notes,
                            }),
                          lessons.reload,
                        )
                      }
                    >
                      {lesson.progress?.completed
                        ? "Mark incomplete"
                        : "Mark complete"}
                    </button>
                  </>
                )}
              </>
            ) : (
              <Empty>Select a lesson to begin.</Empty>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}
function Assessments() {
  const { user } = useAuth();
  const teacher = ["Teacher", "Admin"].includes(user.role);
  const tests = useResource("/tests", []);
  const courses = useResource(teacher ? "/courses" : null, []);
  const [attempt, setAttempt] = useState(null),
    [answers, setAnswers] = useState({}),
    [result, setResult] = useState(null),
    [remaining, setRemaining] = useState(0);
  const { busy, message, act } = useAction();
  const submitting = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const finish = useCallback(async (a) => {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const r = await api.post(`/tests/${a.testId}/submit`, {
        answers: answersRef.current,
      });
      setResult(r.data);
      setAttempt(null);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      submitting.current = false;
    }
  }, []);
  useEffect(() => {
    if (!attempt) return;
    const deadline =
      Date.now() + (new Date(attempt.deadline) - new Date(attempt.serverTime));
    const tick = () => {
      const n = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(n);
      if (n === 0) finish(attempt);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [attempt, finish]);
  useEffect(() => {
    if (!attempt?.section || attempt.section.name === "Finished") return;
    const delay = Math.max(
      0,
      new Date(attempt.section.deadline) - new Date(attempt.serverTime),
    );
    const timer = setTimeout(() => {
      api
        .post(`/tests/${attempt.testId}/start`, {})
        .then((r) => {
          setAnswers(r.data.answers || {});
          setAttempt(r.data);
        })
        .catch((e) => setResult({ error: e.message }));
    }, delay + 150);
    return () => clearTimeout(timer);
  }, [attempt]);
  const [saveError, setSaveError] = useState("");
  useEffect(() => {
    if (!attempt) return;
    const t = setTimeout(() => {
      api
        .put(`/tests/${attempt.testId}/answers`, { answers })
        .then(() => setSaveError(""))
        .catch((e) => setSaveError(e.message));
    }, 500);
    return () => clearTimeout(t);
  }, [attempt, answers]);
  const create = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    act(async () => {
      let questions;
      try {
        questions = JSON.parse(f.get("questions"));
      } catch {
        throw Error("Questions must be a valid JSON array.");
      }
      await api.post("/tests", {
        courseId: f.get("courseId"),
        title: f.get("title"),
        durationMinutes: Number(f.get("durationMinutes")),
        published: true,
        questions,
        sections: JSON.parse(f.get("sections") || "[]"),
      });
    }, tests.reload);
  };
  return (
    <>
      <ErrorNotice message={message || tests.error} />
      {teacher && (
        <details className={box}>
          <summary className="font-bold">Create reviewed assessment</summary>
          <form onSubmit={create} className="space-y-3">
            <CourseSelect courses={courses.data} />
            <Field label="Title" name="title" required />
            <Field
              label="Duration in minutes"
              name="durationMinutes"
              type="number"
              min="1"
              max="300"
              defaultValue="30"
            />
            <label className="block">
              Questions JSON
              <textarea
                className={input}
                name="questions"
                required
                rows={8}
                placeholder={
                  '[{"prompt":"Question","options":["A","B"],"correctIndex":0,"explanation":"Reason","topic":"Topic","marks":1,"negativeMarks":0}]'
                }
              />
            </label>
            <label className="block">
              Timed sections JSON (optional)
              <textarea
                className={input}
                name="sections"
                rows={3}
                defaultValue="[]"
                placeholder='[ {"name":"Section 1","durationMinutes":15,"questionCount":10} ]'
              />
            </label>
            <p className="text-sm text-slate-500">
              Review every question and explanation before publishing. Correct
              answer indexes begin at zero.
            </p>
            <button className={button} disabled={busy}>
              Publish test
            </button>
          </form>
        </details>
      )}
      {attempt ? (
        <section className={box}>
          <h2 className="text-xl font-bold">{attempt.title}</h2>
          <ErrorNotice message={saveError} />
          {attempt.section && (
            <p className="font-bold">
              {attempt.section.name} · section closes at{" "}
              {new Date(attempt.section.deadline).toLocaleTimeString()}. Earlier
              sections are locked.
            </p>
          )}
          <p role="timer">
            Time remaining: {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}
          </p>
          {attempt.questions.map((q, index) => (
            <fieldset
              key={q.id}
              className="border border-slate-200 dark:border-slate-700 rounded-xl p-4"
            >
              <legend className="font-bold">
                {index + 1}. {q.prompt}
              </legend>
              {q.options.map((o, i) => (
                <label key={i} className="block py-2">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === i}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                  />{" "}
                  {o}
                </label>
              ))}
              <button
                type="button"
                className="underline"
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: null }))}
              >
                Clear answer
              </button>
            </fieldset>
          ))}
          <button
            className={button}
            disabled={busy}
            onClick={() => act(() => finish(attempt))}
          >
            Submit test
          </button>
        </section>
      ) : (
        <div className="space-y-4">
          {!list(tests.data).length ? (
            <Empty>No assessments published yet.</Empty>
          ) : (
            tests.data.map((t) => (
              <article className={box} key={t.id}>
                <h2 className="text-xl font-bold">{t.title}</h2>
                <p>{t.durationMinutes} minutes</p>
                {!teacher && (
                  <div className="flex gap-3">
                    <button
                      className={button}
                      disabled={busy}
                      onClick={() =>
                        act(async () => {
                          const r = await api.post(`/tests/${t.id}/start`, {});
                          setAnswers(r.data.answers || {});
                          setResult(null);
                          setAttempt(r.data);
                        })
                      }
                    >
                      Start / resume
                    </button>
                    <button
                      className="underline"
                      disabled={busy}
                      onClick={() =>
                        act(async () =>
                          setResult(
                            (await api.get(`/tests/${t.id}/results`)).data,
                          ),
                        )
                      }
                    >
                      View result
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      )}
      {result && (
        <article className={box}>
          <ErrorNotice message={result.error} />
          {!result.error && (
            <>
              <h2 className="text-xl font-black">
                Result: {result.score} / {result.maximum}
              </h2>
              {result.expired && (
                <p>Time expired. Late answers were not accepted.</p>
              )}
              <p>
                {Math.round(result.percentage)}% · {result.correct} correct out
                of {result.total}
              </p>
              {result.topics?.map((t) => (
                <p key={t.topic}>
                  {t.topic}: {t.accuracy}% accuracy
                </p>
              ))}
              {result.review?.map((q) => (
                <details key={q.id}>
                  <summary className="font-bold">
                    {q.prompt} · {q.marks} marks
                  </summary>
                  <p>
                    Your answer:{" "}
                    {q.selected === null ? "Skipped" : q.options[q.selected]}
                  </p>
                  <p>Correct answer: {q.options[q.correctIndex]}</p>
                  <p>{q.explanation}</p>
                </details>
              ))}
            </>
          )}
        </article>
      )}
    </>
  );
}
function CourseSelect({ courses, onChange, value }) {
  return (
    <label className="block">
      Course
      <select
        className={input}
        name="courseId"
        value={value}
        onChange={onChange}
        required
      >
        <option value="">Choose course</option>
        {list(courses).map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </label>
  );
}
function CourseWork({ mode }) {
  const { user } = useAuth();
  const teacher = ["Teacher", "Admin"].includes(user.role);
  const courses = useResource("/courses", []);
  const [courseId, setCourseId] = useState("");
  const records = useResource(
    courseId ? `/${mode}?courseId=${courseId}` : null,
    [],
  );
  const students = useResource(
    teacher && courseId ? `/courses/${courseId}/students` : null,
    [],
  );
  const [submissions, setSubmissions] = useState([]);
  const { busy, message, act } = useAction();
  const create = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    let data = { courseId };
    if (mode === "materials")
      data = {
        ...data,
        title: f.get("title"),
        type: f.get("type"),
        url: f.get("url"),
      };
    else if (mode === "assignments")
      data = {
        ...data,
        title: f.get("title"),
        description: f.get("description"),
        dueAt: new Date(f.get("dueAt")).toISOString(),
      };
    else
      data = {
        ...data,
        studentId: f.get("studentId"),
        date: f.get("date"),
        status: f.get("status"),
      };
    act(() => api.post(`/${mode}`, data), records.reload);
  };
  return (
    <>
      <ErrorNotice message={message || courses.error || records.error} />
      <CourseSelect
        courses={list(courses.data).filter((c) => teacher || c.enrolled)}
        value={courseId}
        onChange={(e) => {
          setCourseId(e.target.value);
          records.setData([]);
          setSubmissions([]);
        }}
      />
      {teacher && courseId && (
        <details className={box}>
          <summary className="font-bold">
            {mode === "attendance" ? "Mark attendance" : "Add " + mode}
          </summary>
          <form onSubmit={create} className="space-y-3">
            {mode === "attendance" ? (
              <>
                <label>
                  Student
                  <select name="studentId" className={input} required>
                    {list(students.data).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Field label="Date" name="date" type="date" required />
                <label>
                  Status
                  <select className={input} name="status">
                    {["Present", "Absent", "Late"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <Field label="Title" name="title" required />
                {mode === "materials" ? (
                  <>
                    <label>
                      Type
                      <select className={input} name="type">
                        {["PDF", "Video", "Link"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="HTTPS resource URL"
                      name="url"
                      type="url"
                      required
                    />
                    <p className="text-sm text-slate-500">
                      Resources are linked. Direct file uploads are not enabled.
                    </p>
                  </>
                ) : (
                  <>
                    <label>
                      Description
                      <textarea
                        className={input}
                        name="description"
                        required
                        rows={5}
                      />
                    </label>
                    <Field
                      label="Deadline"
                      name="dueAt"
                      type="datetime-local"
                      required
                    />
                  </>
                )}
              </>
            )}
            <button disabled={busy} className={button}>
              Save
            </button>
          </form>
        </details>
      )}
      {!courseId ? (
        <Empty>Select an enrolled course.</Empty>
      ) : !list(records.data).length ? (
        <Empty />
      ) : (
        records.data.map((item) => (
          <article key={item.id} className={box}>
            <h2 className="text-xl font-bold">
              {item.title || `${item.date}: ${item.status}`}
            </h2>
            {item.description && (
              <p className="whitespace-pre-wrap">{item.description}</p>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Open {item.type}
              </a>
            )}
            {item.dueAt && <p>Due: {new Date(item.dueAt).toLocaleString()}</p>}
            {mode === "assignments" &&
              (teacher ? (
                <button
                  className={button}
                  onClick={() =>
                    act(async () =>
                      setSubmissions(
                        (await api.get(`/assignments/${item.id}/submissions`))
                          .data,
                      ),
                    )
                  }
                >
                  Review submissions
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const content = new FormData(e.currentTarget).get(
                      "content",
                    );
                    act(() =>
                      api.post(`/assignments/${item.id}/submit`, { content }),
                    );
                  }}
                >
                  <label>
                    My submission
                    <textarea
                      name="content"
                      className={input}
                      rows={5}
                      required
                      maxLength={20000}
                    />
                  </label>
                  <button className={button} disabled={busy}>
                    Submit assignment
                  </button>
                </form>
              ))}
          </article>
        ))
      )}
      {submissions.map((s) => (
        <form
          key={s.id}
          className={box}
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            act(() =>
              api.patch(`/submissions/${s.id}`, {
                grade: Number(f.get("grade")),
                feedback: f.get("feedback"),
              }),
            );
          }}
        >
          <p>Student: {s.studentId}</p>
          <p className="whitespace-pre-wrap">{s.content}</p>
          <Field
            label="Grade (0–100)"
            name="grade"
            type="number"
            min="0"
            max="100"
            defaultValue={s.grade}
          />
          <Field label="Feedback" name="feedback" defaultValue={s.feedback} />
          <button disabled={busy} className={button}>
            Save review
          </button>
        </form>
      ))}
    </>
  );
}
function ParentConnect() {
  const { user } = useAuth();
  const links = useResource("/parent-links", []);
  const [invite, setInvite] = useState("");
  const [teachers, setTeachers] = useState([]),
    [selectedChild, setSelectedChild] = useState(null);
  const [report, setReport] = useState(null);
  const { busy, message, act } = useAction();
  return (
    <>
      <ErrorNotice message={message || links.error} />
      {user.role === "Student" ? (
        <article className={box}>
          <h2 className="text-xl font-bold">Invite your parent</h2>
          <p>
            Share the single-use code privately with your parent. It expires in
            15 minutes.
          </p>
          <button
            disabled={busy}
            className={button}
            onClick={() =>
              act(async () =>
                setInvite(
                  (await api.post("/parent-links/invite", {})).data.code,
                ),
              )
            }
          >
            Generate invitation
          </button>
          {invite && <p className="break-all select-all">{invite}</p>}
        </article>
      ) : user.role === "Parent" ? (
        <form
          className={box}
          onSubmit={(e) => {
            e.preventDefault();
            const code = new FormData(e.currentTarget).get("code");
            act(() => api.post("/parent-links/accept", { code }), links.reload);
          }}
        >
          <Field label="Student invitation code" name="code" required />
          <button disabled={busy} className={button}>
            Link student
          </button>
        </form>
      ) : (
        <Empty>Students and parents manage their links here.</Empty>
      )}
      {list(links.data).map((l) => (
        <article key={l.id} className={box}>
          <h2 className="font-bold">{l.name}</h2>
          {user.role === "Parent" && (
            <button
              className={button}
              disabled={busy}
              onClick={() =>
                act(async () =>
                  setReport((await api.get(`/analytics/student/${l.id}`)).data),
                )
              }
            >
              View report
            </button>
          )}
          {user.role === "Parent" && (
            <button
              className="ml-3 underline"
              disabled={busy}
              onClick={() =>
                act(async () => {
                  setSelectedChild(l.id);
                  setTeachers(
                    (await api.get(`/parent-links/${l.id}/teachers`)).data,
                  );
                })
              }
            >
              Contact teachers
            </button>
          )}
          <button
            disabled={busy}
            className="ml-3 underline"
            onClick={() =>
              act(() => api.delete(`/parent-links/${l.id}`), links.reload)
            }
          >
            Remove access
          </button>
        </article>
      ))}
      {selectedChild && (
        <article className={box}>
          <h2 className="font-bold">Linked student’s teachers</h2>
          {teachers.length ? (
            teachers.map((t) => (
              <button
                className="block underline py-2"
                key={t.id}
                disabled={busy}
                onClick={() =>
                  act(async () => {
                    await api.post(
                      `/parent-links/${selectedChild}/conversations`,
                      { teacherId: t.id },
                    );
                    window.location.assign("/discussions");
                  })
                }
              >
                Open conversation with {t.name}
              </button>
            ))
          ) : (
            <Empty>No teachers are linked through enrolled courses yet.</Empty>
          )}
        </article>
      )}
      {report && <Report data={report} />}
    </>
  );
}
function Report({ data }) {
  return (
    <article className={box}>
      <h2 className="text-xl font-bold">Learning report</h2>
      <p>
        Tests completed: {data.testsCompleted} · Lessons completed:{" "}
        {data.completedLessons}
      </p>
      <p>
        Average score: {data.averageScore ?? "No tests"}
        {data.averageScore !== null ? "%" : ""} · Attendance:{" "}
        {data.attendance ?? "No records"}
        {data.attendance !== null ? "%" : ""}
      </p>
      {data.topics.map((t) => (
        <p key={t.topic}>
          {t.topic}: {t.accuracy}% accuracy ({t.total} questions)
        </p>
      ))}
      <h3 className="font-bold">Topics to revise</h3>
      {data.weakTopics.length ? (
        <ul>
          {data.weakTopics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : (
        <p>No weak topics identified from available results.</p>
      )}
    </article>
  );
}
function Analytics() {
  const { user } = useAuth();
  const r = useResource(
    user.role === "Student" ? `/analytics/student/${user.id}` : null,
  );
  return (
    <>
      <ErrorNotice message={r.error} />
      {r.data ? (
        <Report data={r.data} />
      ) : (
        <Empty>
          {user.role === "Parent"
            ? "Open Parent Connect to view a linked student report."
            : "Student reports appear after assessments are submitted."}
        </Empty>
      )}
    </>
  );
}
function Plans() {
  const { user } = useAuth();
  const r = useResource(user.role === "Student" ? "/plans" : null);
  const { busy, message, act } = useAction();
  return (
    <>
      <ErrorNotice message={message || r.error} />
      {user.role === "Student" ? (
        <>
          <button
            className={button}
            disabled={busy}
            onClick={() => act(() => api.post("/plans", {}), r.reload)}
          >
            Generate / replace study plan
          </button>
          <p className="text-sm text-slate-500">
            This plan uses your recorded weak topics. It is a rule-based
            schedule.
          </p>
          {r.data?.items.map((item) => (
            <label key={item._id} className={`block ${box}`}>
              <input
                type="checkbox"
                checked={item.completed}
                disabled={busy}
                onChange={(e) =>
                  act(
                    () =>
                      api.patch(`/plans/${item._id}`, {
                        completed: e.target.checked,
                      }),
                    r.reload,
                  )
                }
              />{" "}
              {item.topic} · {item.minutes} minutes
            </label>
          ))}
        </>
      ) : (
        <Empty>Study plans are available for student accounts.</Empty>
      )}
    </>
  );
}
function Rooms() {
  const { user } = useAuth();
  const rooms = useResource("/rooms/active", []);
  const [room, setRoom] = useState(null),
    [messages, setMessages] = useState([]);
  const { busy, message, act } = useAction();
  const load = useCallback(async () => {
    if (room) setMessages((await api.get(`/rooms/${room.id}/messages`)).data);
  }, [room]);
  useEffect(() => {
    if (!room) return;
    let stopped = false;
    const poll = async () => {
      try {
        const r = await api.get(`/rooms/${room.id}/messages`);
        if (!stopped) setMessages(r.data);
      } catch (e) {
        if (!stopped) {
          setRoom(null);
          setMessages([]);
        }
      }
    };
    poll();
    const t = setInterval(poll, 5000);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [room]);
  return (
    <>
      <ErrorNotice message={message || rooms.error} />
      {user.role !== "Parent" && (
        <details className={box}>
          <summary className="font-bold">Create study room</summary>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              act(
                () =>
                  api.post("/rooms", {
                    name: f.get("name"),
                    description: f.get("description"),
                  }),
                rooms.reload,
              );
            }}
          >
            <Field label="Room name" name="name" required />
            <Field label="Description" name="description" />
            <button disabled={busy} className={button}>
              Create room
            </button>
          </form>
        </details>
      )}
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className={box}>
          {!list(rooms.data).length ? (
            <Empty>No active rooms.</Empty>
          ) : (
            rooms.data.map((r) => (
              <div key={r.id}>
                <h2 className="font-bold">{r.name}</h2>
                <p>{r.users} members</p>
                <button
                  className="underline"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      await api.post(`/rooms/${r.id}/join`, {});
                      setRoom(r);
                    }, rooms.reload)
                  }
                >
                  Join discussion
                </button>
                {(String(r.ownerId) === user.id || user.role === "Admin") && (
                  <button
                    className="block underline"
                    disabled={busy}
                    onClick={() =>
                      act(async () => {
                        await api.delete(`/rooms/${r.id}`);
                        if (room?.id === r.id) {
                          setRoom(null);
                          setMessages([]);
                        }
                      }, rooms.reload)
                    }
                  >
                    Close room
                  </button>
                )}
              </div>
            ))
          )}
        </aside>
        <section className={box}>
          {room ? (
            <>
              <h2 className="text-xl font-bold">{room.name}</h2>
              <div
                role="log"
                aria-live="polite"
                className="max-h-96 overflow-auto space-y-3"
              >
                {messages.map((m) => (
                  <p key={m.id} className="whitespace-pre-wrap break-words">
                    <strong>{m.name}: </strong>
                    {m.content}
                  </p>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const content = new FormData(form).get("content");
                  act(async () => {
                    await api.post(`/rooms/${room.id}/messages`, { content });
                    form.reset();
                  }, load);
                }}
              >
                <Field
                  label="Message"
                  name="content"
                  required
                  maxLength={4000}
                />
                <button className={button} disabled={busy}>
                  Send
                </button>
              </form>
              <button
                className="underline"
                onClick={() =>
                  act(async () => {
                    await api.post(`/rooms/${room.id}/leave`, {});
                    setRoom(null);
                    setMessages([]);
                  }, rooms.reload)
                }
              >
                Leave room
              </button>
              <p className="text-sm text-slate-500">
                Room messages are shared with members.
              </p>
              <Suspense fallback={<p>Loading collaboration tools…</p>}>
                <RoomCall roomId={room.id} key={room.id} />
              </Suspense>
            </>
          ) : (
            <Empty>Join a study room to chat.</Empty>
          )}
        </section>
      </div>
    </>
  );
}
function Account() {
  const { user, updateProfile, logout } = useAuth();
  const sessions = useResource("/auth/sessions", []);
  const { busy, message, act } = useAction();
  const [notice, setNotice] = useState("");
  return (
    <>
      <ErrorNotice message={message || sessions.error} />
      <DataControls />
      {notice && <p role="status">{notice}</p>}
      <form
        className={box}
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          act(async () => {
            const r = await updateProfile({
              name: f.get("name"),
              bio: f.get("bio"),
              theme: f.get("theme"),
            });
            if (!r.success) throw Error(r.message);
            setNotice("Profile saved.");
          });
        }}
      >
        <h2 className="text-xl font-bold">Profile</h2>
        <Field
          label="Name"
          name="name"
          defaultValue={user.name}
          required
          maxLength={100}
        />
        <Field
          label="Bio"
          name="bio"
          defaultValue={user.bio}
          maxLength={1000}
        />
        <label>
          Theme
          <select
            className={input}
            name="theme"
            defaultValue={user.theme || "system"}
          >
            {["system", "light", "dark"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <button className={button} disabled={busy}>
          Save profile
        </button>
      </form>
      <article className={box}>
        <h2 className="text-xl font-bold">Email verification</h2>
        <p>{user.emailVerified ? "Verified" : "Not verified"}</p>
        {!user.emailVerified && (
          <button
            className={button}
            disabled={busy}
            onClick={() =>
              act(async () => {
                await api.post("/auth/resend-verification", {});
                setNotice("Verification email sent.");
              })
            }
          >
            Send verification email
          </button>
        )}
      </article>
      <form
        className={box}
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          act(async () => {
            await api.post("/auth/change-password", {
              currentPassword: f.get("currentPassword"),
              newPassword: f.get("newPassword"),
            });
            await logout();
          });
        }}
      >
        <h2 className="text-xl font-bold">Change password</h2>
        <Field
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <Field
          label="New password, 12+ characters with uppercase, lowercase, number and symbol"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          required
        />
        <button className={button} disabled={busy}>
          Change password and sign out
        </button>
      </form>
      <article className={box}>
        <h2 className="text-xl font-bold">Active sessions</h2>
        {list(sessions.data).map((s) => (
          <div key={s.id}>
            <p>
              {new Date(s.createdAt).toLocaleString()}{" "}
              {s.current ? "(this session)" : ""}
            </p>
            <button
              className="underline"
              disabled={busy}
              onClick={() =>
                act(async () => {
                  await api.delete(`/auth/sessions/${s.id}`);
                  if (s.current) await logout();
                }, sessions.reload)
              }
            >
              Revoke session
            </button>
          </div>
        ))}
        <button
          className={button}
          disabled={busy}
          onClick={() =>
            act(async () => {
              await api.post("/auth/logout-all", {});
              await logout();
            })
          }
        >
          Sign out all devices
        </button>
      </article>
    </>
  );
}
function Administration() {
  const users = useResource("/admin/users", []),
    audit = useResource("/admin/audit", []);
  const { busy, message, act } = useAction();
  return (
    <>
      <ErrorNotice message={message || users.error || audit.error} />
      <Readiness />
      <Institutions />
      <form
        className={box}
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget,
            f = new FormData(form);
          act(async () => {
            await api.post("/admin/announcements", {
              title: f.get("title"),
              message: f.get("message"),
              audience: f.get("audience"),
            });
            form.reset();
          });
        }}
      >
        <h2 className="text-xl font-bold">Publish announcement</h2>
        <Field label="Title" name="title" maxLength={200} required />
        <label className="block">
          Message
          <textarea
            className={input}
            name="message"
            maxLength={3000}
            required
            rows={4}
          />
        </label>
        <label>
          Audience
          <select className={input} name="audience">
            {["all", "student", "teacher", "parent"].map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <button className={button} disabled={busy}>
          Publish announcement
        </button>
      </form>
      <article className={box}>
        <h2 className="text-xl font-bold">Users and permissions</h2>
        {list(users.data).map((u) => (
          <div
            className="border-b border-slate-200 dark:border-slate-800 py-3"
            key={u.id}
          >
            <p>
              {u.name} · {u.email} · {u.role}
            </p>
            {u.role !== "admin" && (
              <form
                className="flex gap-2 py-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const track = new FormData(e.currentTarget).get("track");
                  act(
                    () => api.patch(`/admin/users/${u.id}`, { track }),
                    users.reload,
                  );
                }}
              >
                <label className="flex-1">
                  Active learning track
                  <input
                    className={input}
                    name="track"
                    defaultValue={u.track || ""}
                    maxLength={150}
                    required
                  />
                </label>
                <button className={button} disabled={busy}>
                  Update track
                </button>
              </form>
            )}
            {u.role !== "admin" && (
              <>
                <select
                  className={input}
                  value={u.role}
                  disabled={busy}
                  aria-label={`Role for ${u.name}`}
                  onChange={(e) =>
                    act(
                      () =>
                        api.patch(`/admin/users/${u.id}`, {
                          role: e.target.value,
                        }),
                      users.reload,
                    )
                  }
                >
                  {["student", "teacher", "parent"].map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
                <button
                  className="underline"
                  disabled={busy}
                  onClick={() =>
                    act(
                      () =>
                        api.patch(`/admin/users/${u.id}`, {
                          isActive: !u.isActive,
                        }),
                      users.reload,
                    )
                  }
                >
                  {u.isActive ? "Disable account" : "Enable account"}
                </button>
              </>
            )}
          </div>
        ))}
      </article>
      <article className={box}>
        <h2 className="text-xl font-bold">Security audit</h2>
        {list(audit.data).map((a) => (
          <p key={a.id}>
            {new Date(a.createdAt).toLocaleString()} · {a.action}
          </p>
        ))}
      </article>
    </>
  );
}
export function Recovery({ mode }) {
  const [notice, setNotice] = useState(""),
    [raw, setRaw] = useState(() => window.location.hash.slice(1));
  const { busy, message, act } = useAction();
  useEffect(() => {
    if (raw) window.history.replaceState(null, "", window.location.pathname);
  }, [raw]);
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 text-slate-900 dark:text-white">
      <form
        className={`${box} max-w-lg mx-auto`}
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          act(async () => {
            await api.post(
              `/auth/${mode}`,
              mode === "forgot-password"
                ? { email: f.get("email") }
                : mode === "verify-email"
                  ? { token: raw }
                  : { token: raw, password: f.get("password") },
            );
            setRaw("");
            setNotice(
              mode === "forgot-password"
                ? "If your account exists, check your email."
                : "Done. You can sign in.",
            );
          });
        }}
      >
        <h1 className="text-2xl font-black">
          {mode === "forgot-password"
            ? "Recover account"
            : mode === "verify-email"
              ? "Verify email"
              : "Reset password"}
        </h1>
        <ErrorNotice message={message} />
        {notice ? (
          <p role="status">{notice}</p>
        ) : (
          <>
            {mode === "forgot-password" ? (
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            ) : mode === "reset-password" ? (
              <Field
                label="New password, 12+ characters with uppercase, lowercase, number and symbol"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
              />
            ) : (
              <p>Confirm your email verification.</p>
            )}
            <button className={button} disabled={busy}>
              Continue
            </button>
          </>
        )}
        <Link to="/login" className="underline">
          Back to sign in
        </Link>
      </form>
    </main>
  );
}
