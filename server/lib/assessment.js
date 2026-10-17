const { z } = require("zod");
const { text, fail } = require("./security");
const sections = z
  .array(
    z
      .object({
        name: text(100),
        durationMinutes: z.number().int().min(1).max(180),
        questionCount: z.number().int().min(1).max(200),
      })
      .strict(),
  )
  .max(10)
  .default([]);
function validateSections(data) {
  if (!data.sections?.length) return;
  if (
    data.sections.reduce((n, s) => n + s.durationMinutes, 0) !==
      data.durationMinutes ||
    data.sections.reduce((n, s) => n + s.questionCount, 0) !==
      data.questions.length
  )
    fail(
      400,
      "Section durations and question counts must match the whole assessment.",
    );
}
function activeSection(attempt, now = Date.now()) {
  if (!attempt.sections?.length) return null;
  let start = attempt.startedAt.getTime(),
    offset = 0;
  for (let i = 0; i < attempt.sections.length; i++) {
    const section = attempt.sections[i],
      end = start + section.durationMinutes * 60000;
    if (now < end)
      return {
        index: i,
        name: section.name,
        deadline: new Date(end),
        ids: attempt.questions
          .slice(offset, offset + section.questionCount)
          .map((q) => q.id),
      };
    start = end;
    offset += section.questionCount;
  }
  return {
    index: attempt.sections.length,
    name: "Finished",
    deadline: attempt.deadline,
    ids: [],
  };
}
function mergeAnswers(attempt, incoming, now = Date.now()) {
  const section = activeSection(attempt, now);
  const allowed = new Set(
    section ? section.ids : attempt.questions.map((q) => q.id),
  );
  const current = attempt.savedAnswers || {};
  for (const [key, value] of Object.entries(incoming)) {
    const question = attempt.questions.find((q) => q.id === key);
    if (!question || (value !== null && value >= question.options.length))
      fail(400, "Invalid assessment answer.");
    if (!allowed.has(key) && current[key] !== value)
      fail(409, "Only the active section can be changed.");
  }
  if (!section) return incoming;
  const answers = { ...current };
  for (const key of allowed)
    if (Object.hasOwn(incoming, key)) answers[key] = incoming[key];
  return answers;
}
module.exports = { sections, validateSections, activeSection, mergeAnswers };
