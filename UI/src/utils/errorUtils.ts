type ValidationErrorValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | ValidationErrorValue[]
    | { [key: string]: ValidationErrorValue };

function isErrorRecord(value: unknown): value is Record<string, ValidationErrorValue> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

const defaultErrorMessage = "We couldn't complete that. Please try again.";

const friendlyMessageRules: Array<[RegExp, string]> = [
    [/budget owner is required/i, "Choose a budget owner for every task before submitting your timesheet."],
    [/(already exists|already in use|unique constraint|duplicate)/i, "This value is already in use. Please choose a different one."],
    [/(not found|does not exist|no longer exists)/i, "This item is no longer available. Refresh the page and try again."],
    [/(permission denied|not permitted|forbidden|not authorized)/i, "You do not have permission to do this."],
    [/(invalid|expired).*(token|link)|(token|link).*(invalid|expired)/i, "This link is invalid or has expired. Please request a new one."],
    [/(is|required).*(required|missing)|this field may not be blank/i, "Please complete the required fields."],
    [/(already submitted|timesheet.*locked|locked.*timesheet)/i, "This timesheet can no longer be changed."],
    [/(cannot|can't).*(remove|delete).*(entry|entries|time)/i, "This item cannot be removed because it has time recorded against it."],
];

/**
 * API errors are not trusted as UI copy. In particular, do not expose record
 * identifiers, UUIDs, or implementation details to end users.
 */
export function sanitizeUserMessage(value: unknown, fallback = defaultErrorMessage): string {
    if (typeof value !== "string") return fallback;

    for (const [pattern, message] of friendlyMessageRules) {
        if (pattern.test(value)) return message;
    }

    const message = value
        // "User ID: 42", "id=42", and similar values.
        .replace(/\b[\w -]*\bid\s*(?:is|:|=|#|-)?\s*(?:\d+|[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})\b/gi, "this item")
        // A backend may use a record type plus its numeric key without the
        // word "ID" (for example, "assigned task 125").
        .replace(/\b(assigned task|task|project|ticket|user|role|group|entry|record|phase|milestone)\s*(?:#|:)?\s*\d+\b/gi, "this item")
        // Bare UUIDs can also identify records.
        .replace(/\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/gi, "this item")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([,.;:])/g, "$1")
        .trim();

    if (!message || /\b(traceback|exception|sql|constraint)\b/i.test(message)) {
        return fallback;
    }

    return message;
}

export function getErrorStatus(error: unknown): number | undefined {
    if (typeof error !== "object" || error === null || !("response" in error)) {
        return undefined;
    }

    const response = error.response;
    if (typeof response !== "object" || response === null || !("status" in response)) {
        return undefined;
    }

    return typeof response.status === "number" ? response.status : undefined;
}

export function formatValidationErrors(errors: unknown): string {
    if (!errors) return defaultErrorMessage;

    // Plain string
    if (typeof errors === "string") {
        return sanitizeUserMessage(errors);
    }

    // Array of messages
    if (Array.isArray(errors)) {
        return sanitizeUserMessage(errors.join("\n"));
    }

    // Common API message fields
    if (isErrorRecord(errors)) {
        // Prefer user-facing API fields. Developer-only fields are deliberately
        // not shown in the product UI.
        if (errors.detail) return sanitizeUserMessage(errors.detail);
        if (errors.message) return sanitizeUserMessage(errors.message);
        if (errors.error) return sanitizeUserMessage(errors.error);
    }

    const messages: string[] = [];

    const extract = (obj: Record<string, ValidationErrorValue>, parent = "") => {
        Object.entries(obj).forEach(([key, value]) => {
            if (/(^|_)(id|ids)(_|$)/i.test(key) || /^(developer_?message|code|status)$/i.test(key)) return;
            const field =
                key === "non_field_errors"
                    ? ""
                    : (parent ? `${parent}.` : "") + key;

            const label = field
                ? field
                      .split(".")
                      .map(
                          p =>
                              p.charAt(0).toUpperCase() +
                              p.slice(1).replace(/_/g, " ")
                      )
                      .join(" → ")
                : "";

            const showLabel = label && !/^(entries|errors?|non field errors?)$/i.test(label);

            if (Array.isArray(value)) {
                const message = value.join(", ");
                messages.push(
                    showLabel && !/budget owner is required/i.test(message)
                        ? `${label}: ${sanitizeUserMessage(message)}`
                        : sanitizeUserMessage(message)
                );
            } else if (typeof value === "object" && value !== null) {
                extract(value, field);
            } else {
                const message = String(value);
                messages.push(
                    showLabel && !/budget owner is required/i.test(message)
                        ? `${label}: ${sanitizeUserMessage(message)}`
                        : sanitizeUserMessage(message)
                );
            }
        });
    };

    if (isErrorRecord(errors)) {
        extract(errors);
    }

    return messages.length
        ? messages.join("\n")
        : defaultErrorMessage;
}
