import { useState, useCallback, useRef } from 'react';

const useUnsavedChangesDrawer = ({ initialValues, onClose }) => {
  const [formValues, setFormValues] = useState(initialValues);
  const [showConfirm, setShowConfirm] = useState(false);
  const initialRef = useRef(initialValues);

  const hasUnsavedChanges = useCallback(
    () =>
      Object.values(formValues).some((v) => v !== '' && v !== null),
    [formValues]
  );

  const handleChange = useCallback((id, value) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormValues(initialRef.current);
  }, []);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges()) {
      setShowConfirm(true);
    } else {
      resetForm();
      onClose();
    }
  }, [hasUnsavedChanges, resetForm, onClose]);

  const confirmClose = useCallback(() => {
    setShowConfirm(false);
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const cancelClose = useCallback(() => {
    setShowConfirm(false);
  }, []);

  return {
    formValues,
    showConfirm,
    setShowConfirm,
    hasUnsavedChanges,
    handleChange,
    handleClose,
    confirmClose,
    cancelClose,
    resetForm
  };
};

export default useUnsavedChangesDrawer;
