import * as Yup from "yup";

export const settingsSchema = Yup.object().shape({
  dailyAvailabilityHours: Yup.number()
    .typeError("Enter a number of hours")
    .min(0, "Availability cannot be negative")
    .max(24, "Availability cannot exceed 24 hours")
    .required("Daily availability is required"),
  startDate: Yup.string().required("Plan start date is required"),
});

export const subjectSchema = Yup.object().shape({
  title: Yup.string().trim().min(1, "Title is required").max(80, "Keep titles under 80 characters").required("Title is required"),
  priority: Yup.number()
    .typeError("Priority must be a number")
    .min(1, "Priority starts at 1")
    .max(5, "Priority tops out at 5")
    .required("Priority is required"),
  deadline: Yup.string().required("Deadline is required"),
  totalHours: Yup.number()
    .typeError("Total hours must be a number")
    .min(0.5, "Add at least 30 minutes")
    .max(500, "Use a smaller planning chunk")
    .required("Total hours are required"),
});

export const subjectEditorSchema = subjectSchema.shape({
  completedHours: Yup.number()
    .typeError("Completed hours must be a number")
    .min(0, "Completed hours cannot be negative")
    .max(Yup.ref("totalHours"), "Completed hours cannot exceed total hours")
    .required("Completed hours are required"),
});
