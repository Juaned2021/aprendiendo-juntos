import { useState, useEffect } from 'react';
import { setShowToastFn } from '../utils/toast';
import './Toast.css';

function ToastComponent() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setShowToastFn((message, type) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    });
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map(({ id, message, type }) => (
        <div key={id} className={`toast toast-${type}`}>
          {message}
        </div>
      ))}
    </div>
  );
}

export default ToastComponent;
