import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Shield, Globe, Award, ArrowRight, CheckCircle, Target } from 'lucide-react';
import './HomePage.css';

const AboutPage: React.FC = () => {
  return (
    <div 
      className="familynest-green"
      style={{
        background: 'linear-gradient(to bottom, #4CAF50, #2196F3)',
        minHeight: '100vh',
        position: 'relative'
      }}
    >
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
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '24px',
              lineHeight: '1.2'
            }}>
              Building the future of 
              <span style={{ color: '#4CAF50' }}> family connection</span>
            </h1>
            <p style={{ 
              fontSize: '20px', 
              color: '#6b7280', 
              lineHeight: '1.6', 
              marginBottom: '32px',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              We believe that technology should bring families closer together, not drive them apart. 
              FamilyNest is designed from the ground up to strengthen the bonds that matter most.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/" 
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '48px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                background: 'linear-gradient(to right, #4CAF50, #2196F3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '12px'
              }}>
                Private
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>Your Data Stays Yours</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                background: 'linear-gradient(to right, #4CAF50, #2196F3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '12px'
              }}>
                Secure
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>End-to-End Encrypted</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                background: 'linear-gradient(to right, #4CAF50, #2196F3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '12px'
              }}>
                Simple
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>Easy for All Ages</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                background: 'linear-gradient(to right, #4CAF50, #2196F3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '12px'
              }}>
                &lt;24h
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>Email Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'center' }}>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                In an increasingly digital world, maintaining genuine family connections has become more challenging than ever. 
                We created FamilyNest to solve this fundamental problem by providing a private, secure platform where families 
                can share their most precious moments without the noise and distractions of traditional social media.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Every feature we build is guided by one simple principle: does this help families grow closer together? 
                If the answer isn't a resounding yes, we don't build it.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Privacy-first design</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">No ads or data selling</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Family-focused features</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-8 text-white">
              <blockquote className="text-xl font-medium mb-4">
                "FamilyNest has transformed how our family stays connected. My grandmother can now see her great-grandchildren 
                grow up in real-time, and we all feel closer despite living in different states."
              </blockquote>
              <cite className="font-semibold">— Sarah M., Beta User</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: '80px 24px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide every decision we make and every feature we build.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">
                Your family's data belongs to you. We use end-to-end encryption and never share your information 
                with advertisers or third parties.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Family Focus</h3>
              <p className="text-gray-600 leading-relaxed">
                Every feature is designed specifically for families. No influencers, no brands, no distractions — 
                just genuine moments with the people who matter most.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Simplicity</h3>
              <p className="text-gray-600 leading-relaxed">
                Technology should be invisible. We design intuitive experiences that work for everyone, 
                from tech-savvy teenagers to grandparents picking up smartphones for the first time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section - Simple and Personal */}
      <section style={{ padding: '80px 0', background: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            background: 'linear-gradient(135deg, #4CAF50, #2196F3)',
            borderRadius: '50%',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)'
          }}>
            <span style={{ fontSize: '48px', color: 'white', fontWeight: 'bold' }}>AP</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Built by a Father, for Families
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', lineHeight: '1.8', marginBottom: '24px' }}>
            FamilyNest was created by <strong>Anthony Pate</strong>, a father who experienced firsthand 
            the challenge of keeping extended family connected across distances. What started as a simple 
            idea to share photos with grandparents grew into a mission to help all families stay close, 
            no matter where life takes them.
          </p>
          <p style={{ fontSize: '16px', color: '#9ca3af', fontStyle: 'italic' }}>
            "Every feature we build is tested with my own family first. If it doesn't bring us closer together, 
            we don't ship it." — Anthony
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to bring your family closer?</h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of families who have already discovered the joy of staying connected with FamilyNest.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-lg"
          >
            Start Your Family Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-green-400" />
              <span className="ml-2 text-white font-semibold">FamilyNest</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 FamilyNest. Built with ❤️ for families everywhere.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;