import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Shield, Smartphone } from 'lucide-react';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
        <div className="familynest-green"
             style={{
               background: 'linear-gradient(to bottom, #4CAF50, #2196F3)',
               minHeight: '100vh',
               position: 'relative'
             }}>
          {/* Console Button - Fixed in upper right */}
          <Link 
            to="/admin/login" 
            className="familynest-admin-btn"
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000
            }}
          >
            Console
          </Link>

          {/* Navigation */}
          <nav className="familynest-nav">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Heart className="familynest-logo" style={{width: '32px', height: '32px'}} />
                  <span className="ml-2 text-xl font-bold text-gray-900">FamilyNest</span>
                </div>
                <div className="familynest-nav-links">
                  <Link to="/" className="familynest-nav-link">Home</Link>
                  <Link to="/about" className="familynest-nav-link">About</Link>
                  <Link to="/contact" className="familynest-nav-link">Contact</Link>
                </div>
              </div>
            </div>
          </nav>

      {/* Hero Section */}
      <div className="familynest-hero max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="familynest-hero-title text-gray-900">
            Keep Your Family
            <span className="familynest-hero-accent"> Connected</span>
          </h1>
          <p className="familynest-hero-subtitle max-w-3xl mx-auto">
            FamilyNest is the perfect app to stay connected with your loved ones. 
            Share moments, send messages, and keep your family bonds strong.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Download on App Store
            </button>
            <button className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
              Get on Google Play
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Connected
            </h2>
            <p className="text-lg text-gray-600">
              Simple, secure, and designed for families
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Family Groups</h3>
              <p className="text-gray-600">
                Create private family groups and share special moments with those who matter most.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-600">
                Your family data is secure and private. We never share your information with third parties.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cross Platform</h3>
              <p className="text-gray-600">
                Available on iOS and Android, so everyone in the family can join in.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Bring Your Family Together?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of families already using FamilyNest
          </p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-green-400" />
              <span className="ml-2 text-white font-semibold">FamilyNest</span>
            </div>
            <div className="flex items-center">
              <div className="text-gray-400 text-sm mr-4">
                <a href="/privacy.html" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              </div>
              <div className="text-gray-400 text-sm">
                © 2025 FamilyNest. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
