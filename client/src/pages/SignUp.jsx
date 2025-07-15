import React from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/useAuthStore";

const SignUp = () => {
  // 👇 Avoid conflict by aliasing useForm's register to formRegister
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm();
  const { signup, error, loading } = useAuthStore(); // use signup from Zustand store

  const onSubmit = async (data) => {
    await signup(data); // call Zustand's signup function
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold">Sign Up</h2>

        <input {...formRegister("name", { required: "Name is required" })} placeholder="Name" className="w-full p-2 border rounded" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

        <input {...formRegister("sapId", { required: "SAP ID is required" })} placeholder="SAP ID" className="w-full p-2 border rounded" />
        {errors.sapId && <p className="text-red-500 text-sm">{errors.sapId.message}</p>}

        <input type="password" {...formRegister("password", { required: "Password is required" })} placeholder="Password" className="w-full p-2 border rounded" />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded" disabled={loading}>
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
