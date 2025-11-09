// frontend/src/pages/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Satellite, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, guestLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await guestLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setError('Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Unlimited satellite analyses',
    'PDF report generation',
    'Analysis history storage',
    'Priority processing',
    'Export data in multiple formats'
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/earth-bg.jpg')" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-brightness-40"></div>
      
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 relative z-10">
        {/* Left Column - Features */}
        <div className="hidden md:block space-y-6">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="p-3 bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Satellite className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
                ClearSat
              </h1>
              <p className="text-white/60 text-sm">Satellite Insights</p>
            </div>
          </Link>

          <div className="card space-y-4">
            <h3 className="text-xl font-bold text-white">Create Your Account</h3>
            <p className="text-white/60">
              Join ClearSat to unlock powerful satellite imagery analysis tools and generate comprehensive reports.
            </p>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-primary-600/20 border-primary-500/30">
            <h4 className="font-semibold text-white mb-2">Guest Access Available</h4>
            <p className="text-white/60 text-sm mb-4">
              Try ClearSat with limited features before creating an account
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGuestLogin}
              loading={loading}
            >
              Continue as Guest
            </Button>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="space-y-6">
          <div className="md:hidden text-center">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="p-3 bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Satellite className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
                  ClearSat
                </h1>
                <p className="text-white/60 text-sm">Satellite Insights</p>
              </div>
            </Link>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-white/80 mb-2">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field w-full pr-10"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="Confirm your password"
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/60">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;