import { schema } from "../db/client.js";

const STATUS_MESSAGES = {
  SUBMITTED: (ref) => ({
    title: "Grievance submitted",
    message: `Your grievance ${ref} has been submitted successfully. You will be notified when it is reviewed.`,
  }),
  UNDER_REVIEW: (ref) => ({
    title: "Grievance under review",
    message: `Your grievance ${ref} is now under review.`,
  }),
  ASSIGNED: (ref) => ({
    title: "Grievance assigned",
    message: `Your grievance ${ref} has been assigned to the concerned department.`,
  }),
  IN_PROGRESS: (ref) => ({
    title: "Grievance in progress",
    message: `Your grievance ${ref} status has been updated to In Progress.`,
  }),
  RESOLVED: (ref) => ({
    title: "Grievance resolved",
    message: `Your grievance ${ref} has been resolved. Please share your feedback.`,
  }),
  REJECTED: (ref) => ({
    title: "Grievance rejected",
    message: `Your grievance ${ref} could not be processed. See the remark for the reason.`,
  }),
};

/** Insert a status notification inside an existing transaction. */
export async function notifyStatus(tx, { userId, grievanceId, referenceId, status }) {
  const build = STATUS_MESSAGES[status];
  if (!build) return;
  const { title, message } = build(referenceId);
  await tx.insert(schema.notifications).values({ userId, grievanceId, title, message });
}

export async function notifyCustom(tx, { userId, grievanceId, title, message }) {
  await tx.insert(schema.notifications).values({ userId, grievanceId, title, message });
}
