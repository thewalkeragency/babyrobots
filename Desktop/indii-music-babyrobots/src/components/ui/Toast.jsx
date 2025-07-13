import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div className="uk-position-top-right uk-position-fixed uk-margin-top uk-margin-right" style={{ zIndex: 1000 }}>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};

const Toast = ({ message, type, duration, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onRemove]);

  let alertClass = 'uk-alert-primary';
  switch (type) {
    case 'success':
      alertClass = 'uk-alert-success';
      break;
    case 'error':
      alertClass = 'uk-alert-danger';
      break;
    case 'warning':
      alertClass = 'uk-alert-warning';
      break;
    default:
      alertClass = 'uk-alert-primary';
  }

  return (
    <div className={`uk-alert ${alertClass} uk-animation-slide-right-small uk-margin-small-bottom`} uk-alert="true">
      <a className="uk-alert-close" uk-close="true" onClick={onRemove}></a>
      <p>{message}</p>
    </div>
  );
};

export default Toast;
