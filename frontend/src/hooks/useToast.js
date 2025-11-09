import * as React from "react";

// Constants
const TOAST_LIMIT = 5; // Increased limit for better UX
const TOAST_REMOVE_DELAY = 5000; // 5 seconds for auto-dismiss

// ID Generation
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${count}`;
}

// Timeout Management
const toastTimeouts = new Map();

const addToRemoveQueue = (toastId, duration = TOAST_REMOVE_DELAY) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, duration);

  toastTimeouts.set(toastId, timeout);
};

// Initial state
const initialState = { toasts: [] };

// Reducer
export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      // Clear any existing timeouts for this toast if it exists
      if (toastTimeouts.has(action.toast.id)) {
        clearTimeout(toastTimeouts.get(action.toast.id));
        toastTimeouts.delete(action.toast.id);
      }

      // Auto-dismiss if not explicitly set to false
      if (action.toast.duration !== 0) {
        addToRemoveQueue(action.toast.id, action.toast.duration);
      }

      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      if (!action.toast.id) return state;
      
      // Clear existing timeout if duration changes
      if (toastTimeouts.has(action.toast.id)) {
        clearTimeout(toastTimeouts.get(action.toast.id));
        toastTimeouts.delete(action.toast.id);
      }

      // Set new timeout if duration is provided
      if (action.toast.duration !== undefined && action.toast.duration > 0) {
        addToRemoveQueue(action.toast.id, action.toast.duration);
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => 
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;
      const toastToDismiss = state.toasts.find(t => t.id === toastId);

      // Don't auto-dismiss if duration is 0
      if (toastToDismiss?.duration === 0) {
        return state;
      }

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          if (toast.duration !== 0) {
            addToRemoveQueue(toast.id);
          }
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

// State Management
const listeners = [];
let memoryState = { ...initialState };

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

// Toast function
function toast({ duration = TOAST_REMOVE_DELAY, ...props }) {
  const id = genId();

  const update = (updateProps) => {
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...updateProps, id },
    });
  };

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      duration,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return { id, dismiss, update };
}

// Hook
function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };