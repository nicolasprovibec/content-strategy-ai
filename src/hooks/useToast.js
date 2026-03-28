const TOAST_DURATION_MS = 2800;

export function useToast() {
  const [message, setMessage] = React.useState("");
  const timerRef = React.useRef(null);

  const showToast = React.useCallback((msg) => {
    clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(""), TOAST_DURATION_MS);
  }, []);

  return { toastMessage: message, showToast };
}
