const FormError = ({ message }) => {
  if (!message) return null;
  return (
    <p role="alert" className="text-error-red text-xs font-medium mt-1">
      {message}
    </p>
  );
};

export default FormError;
