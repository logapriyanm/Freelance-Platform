import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, reset } from "../../redux/slices/authSlice";
import { toast } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaArrowRight,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
} from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, email, password, confirmPassword, role } = formData;

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
      toast.error(message || "Registration failed");
      dispatch(reset());
    }

    if (isSuccess && user) {
      toast.success("Registration successful!");
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

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    dispatch(register({ name, email, password, role }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Creating account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* ===== HEADER WITH ICON ===== */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <FaUserPlus className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create Account
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Join our freelance platform
            </p>
          </div>

          {/* ===== FORM ===== */}
          <form onSubmit={onSubmit} className="space-y-4">

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
                <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
                <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-2.5 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((p) => !p)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* ROLE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to join as *
              </label>
              <div className="flex space-x-2">
                <RoleButton
                  active={role === "client"}
                  label="Hire Talent"
                  onClick={() =>
                    setFormData({ ...formData, role: "client" })
                  }
                />
                <RoleButton
                  active={role === "freelancer"}
                  label="Find Work"
                  onClick={() =>
                    setFormData({ ...formData, role: "freelancer" })
                  }
                />
              </div>
            </div>

            {/* TERMS */}
            <div className="flex items-start space-x-2">
              <input type="checkbox" required />
              <p className="text-xs text-gray-600">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-600">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-600">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full flex items-center justify-center py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
            >
              Create Account
              <FaArrowRight className="ml-2 text-sm" />
            </button>

            {/* LOGIN */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-block w-full py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Sign In Instead
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ===== ROLE BUTTON ===== */
const RoleButton = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 py-2.5 rounded-lg border text-sm transition ${
      active
        ? "border-blue-600 bg-blue-50 text-blue-700"
        : "border-gray-300 text-gray-700 hover:border-gray-400"
    }`}
  >
    {label}
  </button>
);

export default Register;
