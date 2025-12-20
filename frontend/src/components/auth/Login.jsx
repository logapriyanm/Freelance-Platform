import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, reset } from "../../redux/slices/authSlice";
import { toast } from "react-hot-toast";
import {
  FaLock,
  FaEnvelope,
  FaSignInAlt,
  FaSpinner,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user) {
      redirectBasedOnRole(user.role);
    }

    if (isError) {
      toast.error(message || "Login failed");
      dispatch(reset());
    }

    if (isSuccess && user) {
      toast.success("Login successful!");
      redirectBasedOnRole(user.role);
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "client":
        navigate("/client/dashboard");
        break;
      case "freelancer":
        navigate("/freelancer/dashboard");
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        navigate("/");
    }
  };

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    dispatch(login({ email, password }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Signing you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <FaLock className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-1">
              Sign in to your SB Works account
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="pl-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="pl-10 pr-10 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />

                {/* SHOW / HIDE BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full flex items-center justify-center py-4 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 shadow-lg"
            >
              <FaSignInAlt className="mr-2" />
              Sign In
            </button>

            {/* REGISTER */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                New to FreelancePro?
              </p>
              <Link
                to="/register"
                className="inline-block w-full py-3 border-2 border-blue-600 rounded-xl text-blue-600 hover:bg-blue-50"
              >
                Create an Account
              </Link>
            </div>
          </form>

          {/* FOOTER */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-blue-600">
              Terms
            </Link>{" "}
            &{" "}
            <Link to="/privacy" className="text-blue-600">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
