// components/ErrorMessage.jsx
import React from "react";

const ErrorMessage = ({ message }) => (
  <div
    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
    role="alert"
  >
    <p className="font-bold">Oops!</p>
    <p>{message}</p>
  </div>
);

export default ErrorMessage;
