import { useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import logo from '../../../assets/logo.svg';

const LoginPage = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const err = {};
    if (!email.trim()) err.email = "Email is required";
    if (!password) err.password = "Password is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    try {
      setSubmitting(true);
      await login(email, password);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Login failed";
      setErrors({ server: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-50 to-white p-6 overflow-hidden">
      {/* decorative blurred circles */}
      <div className="pointer-events-none absolute -left-16 -top-16 w-72 h-72 rounded-full bg-gradient-to-r from-indigo-300 to-sky-400 opacity-20 blur-2xl transform rotate-45" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 w-96 h-96 rounded-full bg-gradient-to-tr from-rose-200 via-orange-200 to-yellow-50 opacity-10 blur-2xl" />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl ring-1 ring-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="mb-6 text-center">
            <img src={logo} alt="Capstone Insurance" className="mx-auto w-14 h-14 object-contain shadow-md rounded-md bg-white p-1" />
            <h1 className="text-2xl font-semibold text-slate-700 mt-3">Capstone Insurance</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
          </div>

          {errors.server && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
              {errors.server}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300 transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: undefined, server: undefined }));
                }}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-sky-300 transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors(prev => ({ ...prev, password: undefined, server: undefined }));
                }}
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2 rounded-lg text-white font-semibold transition transform ${submitting ? 'opacity-70 bg-sky-500 shadow' : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:scale-[1.01] hover:shadow-lg'}`}
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            <span>Need access? Contact your administrator.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;