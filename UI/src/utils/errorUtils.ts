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

export function formatValidationErrors(errors: unknown): string {
    if (!errors) return "An unknown error occurred.";

    // Plain string
    if (typeof errors === "string") {
        return errors;
    }

    // Array of messages
    if (Array.isArray(errors)) {
        return errors.join("\n");
    }

    // Common API message fields
    if (isErrorRecord(errors)) {
        if (errors.detail) return String(errors.detail);
        if (errors.message) return String(errors.message);
        if (errors.error) return String(errors.error);
    }

    const messages: string[] = [];

    const extract = (obj: Record<string, ValidationErrorValue>, parent = "") => {
        Object.entries(obj).forEach(([key, value]) => {
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

            if (Array.isArray(value)) {
                messages.push(
                    label
                        ? `${label}: ${value.join(", ")}`
                        : value.join(", ")
                );
            } else if (typeof value === "object" && value !== null) {
                extract(value, field);
            } else {
                messages.push(
                    label ? `${label}: ${value}` : String(value)
                );
            }
        });
    };

    if (isErrorRecord(errors)) {
        extract(errors);
    }

    return messages.length
        ? messages.join("\n")
        : "An unknown error occurred.";
}
