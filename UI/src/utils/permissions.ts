/** Permissions saved from the login response for UI access checks. */
export const getStoredPermissions = () => {
  try {
    const permissions = JSON.parse(localStorage.getItem("permissions") ?? "[]");
    return new Set(
      Array.isArray(permissions)
        ? permissions.filter(
            (permission): permission is string =>
              typeof permission === "string",
          )
        : [],
    );
  } catch {
    return new Set<string>();
  }
};
