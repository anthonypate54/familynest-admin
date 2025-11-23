import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, MessageCircle, Clock, Send, Phone, MapPin, CheckCircle } from 'lucide-react';
import './HomePage.css';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '', category: 'general' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
      <section className="familynest-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="familynest-hero-title text-gray-900">
              We're here to
              <span className="familynest-hero-accent"> help</span>
            </h1>
            <p className="familynest-hero-subtitle max-w-3xl mx-auto">
              Have a question, need support, or want to share feedback? Our team is standing by to assist you. 
              We typically respond within 2 hours during business hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Email Support</h3>
              <p className="text-gray-600 mb-6 text-lg">
                Get help with technical issues, billing questions, account management, or general inquiries.
              </p>
              <a 
                href="mailto:support@infamilynest.com" 
                className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 text-lg mb-4"
              >
                <Mail className="mr-2 h-5 w-5" />
                support@infamilynest.com
              </a>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  We typically respond within 24 hours during business hours (Monday-Friday, 9 AM - 6 PM PST)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Send us a message</h2>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          {isSubmitted ? (
            <div style={{ 
              background: '#f0fdf4', 
              border: '1px solid #86efac', 
              borderRadius: '12px', 
              padding: '48px 32px', 
              textAlign: 'center' 
            }}>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Message sent successfully!</h3>
              <p style={{ color: '#15803d' }}>
                Thank you for reaching out. We'll respond within 24 hours during business hours.
              </p>
            </div>
          ) : (
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
              border: '1px solid #e5e7eb', 
              padding: '40px' 
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="category" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      background: 'white'
                    }}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Please provide as much detail as possible..."
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#16a34a',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '80px 24px', background: '#f9fafb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about FamilyNest.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How secure is my family's data?</h3>
              <p className="text-gray-600 leading-relaxed">
                Security is our top priority. Your photos and messages are stored securely on AWS infrastructure
                with encryption in transit (HTTPS). We never share your data with third parties or advertisers.
                Your family content is private and only accessible to family members you invite.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have 
                access to all features until the end of your current billing period. No hidden fees, no questions asked.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Is there a limit to family size?</h3>
              <p className="text-gray-600 leading-relaxed">
                Not at all! FamilyNest is designed to grow with your family. Whether you have 5 or 50 family members, 
                everyone can join and participate. We believe family connections shouldn't have artificial limits.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I delete my account?</h3>
              <p className="text-gray-600 leading-relaxed">
                You can delete your account at any time directly from the app. Go to Profile → Settings → Delete Account.
                All your data will be permanently removed. If you have an active subscription, you'll need to cancel it first
                through the App Store before deleting your account.
              </p>
            </div>
          </div>
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

export default ContactPage;