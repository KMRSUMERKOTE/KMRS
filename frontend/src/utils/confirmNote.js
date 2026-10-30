let opener = null;

// Called by <ConfirmHost /> when it mounts.
export const registerConfirm = (fn) => {
  opener = fn;
  return () => {
    if (opener === fn) opener = null;
  };
};

/**
 * Shows the sticky-note popup and resolves to true (Yes) or false (No).
 * Usage: if (!(await confirmNote({ title, message }))) return;
 * Falls back to the browser confirm if the host is not mounted.
 */
export const confirmNote = (options = {}) =>
  opener ? opener(options) : Promise.resolve(window.confirm(options.message || options.title || 'Are you sure?'));