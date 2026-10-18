const M = require("../models");
async function notify(userId, title, message, category = "Learning") {
  await M.Notification.create({ userId, title, message, category });
}
async function notifyCourse(courseId, title, message) {
  const course = await M.Course.findById(courseId);
  if (!course?.published) return;
  let members = null;
  if (course.institutionId) {
    if (
      !(await M.Institution.exists({ _id: course.institutionId, active: true }))
    )
      return;
    members = (
      await M.Membership.find({ institutionId: course.institutionId }).select(
        "userId",
      )
    ).map((m) => String(m.userId));
  }
  let batch = [];
  for await (const e of M.Enrollment.find({ courseId })
    .select("studentId")
    .cursor()) {
    if (members && !members.includes(String(e.studentId))) continue;
    batch.push(e.studentId);
    if (batch.length === 200) {
      await deliver(batch);
      batch = [];
    }
  }
  if (batch.length) await deliver(batch);
  async function deliver(ids) {
    const users = await M.User.find({
      _id: { $in: ids },
      isActive: true,
      isDeleted: { $ne: true },
      track: course.track,
    }).select("_id");
    if (users.length)
      await M.Notification.insertMany(
        users.map((u) => ({
          userId: u._id,
          title,
          message,
          category: "Learning",
        })),
      );
  }
}
module.exports = { notify, notifyCourse };
