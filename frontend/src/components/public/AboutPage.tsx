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
              <Link to="/contact" className="familynest-nav-link">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="familynest-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="familynest-hero-title text-gray-900">
              Building the future of 
              <span className="familynest-hero-accent"> family connection</span>
            </h1>
            <p className="familynest-hero-subtitle max-w-3xl mx-auto">
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-gray-600">Families Connected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
              <div className="text-gray-600">Photos Shared</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built by Families, for Families</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our team understands the challenges of staying connected because we live them every day.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Anthony Pate</h3>
              <p className="text-gray-600 mb-2">Founder & CEO</p>
              <p className="text-sm text-gray-500">Father of 3, passionate about bringing families closer together</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sarah Johnson</h3>
              <p className="text-gray-600 mb-2">Head of Product</p>
              <p className="text-sm text-gray-500">Mother of 2, expert in family-centered UX design</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Michael Chen</h3>
              <p className="text-gray-600 mb-2">Lead Engineer</p>
              <p className="text-sm text-gray-500">Son, brother, uncle — builds with privacy and security first</p>
            </div>
          </div>
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