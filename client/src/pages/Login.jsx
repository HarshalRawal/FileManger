import React from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    const res = await login(data.sapId, data.password);
    setLoading(false);

    if (res.success) {
      navigate("/folders"); // ✅ redirect after login
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold">Login</h2>

        <input
          {...register("sapId", { required: "SAP ID is required" })}
          placeholder="SAP ID"
          className="w-full p-2 border rounded"
        />
        {errors.sapId && <p className="text-red-500 text-sm">{errors.sapId.message}</p>}

        <input
          type="password"
          {...register("password", { required: "Password is required" })}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
