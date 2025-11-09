// frontend/src/pages/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Satellite, BarChart3, Map, Download, Shield } from 'lucide-react';
import Button from '../components/ui/Button';

const Home: React.FC = () => {
  const { guestLogin } = useAuth();

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analysis',
      description: 'NDVI, NDWI, EVI, and more with powerful satellite data processing'
    },
    {
      icon: Map,
      title: 'Interactive Maps',
      description: 'Click anywhere in India to start your analysis with automatic location detection'
    },
    {
      icon: Download,
      title: 'Export Reports',
      description: 'Generate professional PDF reports with charts, insights, and satellite imagery'
    },
    {
      icon: Shield,
      title: 'Multi-user System',
      description: 'Admin, user, and guest accounts with appropriate access levels'
    }
  ];

  const stats = [
    { value: '67.3%', label: 'Vegetation Coverage' },
    { value: '8.2%', label: 'Water Bodies' },
    { value: '18.1%', label: 'Urban Areas' },
    { value: '142km²', label: 'Average Analysis Area' }
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative brightness-110"
      style={{ backgroundImage: "url('/images/earth-bg.jpg')" }}
    >
      {/* ✅ Reduced black overlay darkness */}
      <div className="absolute inset-0 bg-black/30 backdrop-brightness-125"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">

        {/* ✅ Lightened the gradient as well */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/10 to-dark-900/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl shadow-2xl transform rotate-12 animate-float">
                <Satellite className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 via-white to-primary-200 bg-clip-text text-transparent">
                ClearSat
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform satellite imagery into actionable insights. Monitor vegetation health, 
              track water resources, and analyze urban growth across India.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 py-4">
                  Get Started Free
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={guestLogin}
              >
                Try as Guest
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary-300 mb-1 drop-shadow-md">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Satellite Analysis
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Everything you need to analyze satellite imagery and generate comprehensive reports
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="p-3 bg-primary-600/20 rounded-lg w-fit mb-4 group-hover:bg-primary-600/30 transition-colors">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card bg-gradient-to-r from-primary-600/20 to-primary-400/20 border-primary-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Analyzing?
            </h2>
            <p className="text-xl text-white/60 mb-8">
              Join thousands of users transforming satellite data into insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8">
                  Create Account
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8"
                onClick={guestLogin}
              >
                Continue as Guest
              </Button>
            </div>
            <p className="text-white/40 text-sm mt-4">
              Guest users can perform 1 analysis with limited features
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
