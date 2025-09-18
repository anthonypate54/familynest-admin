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
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Support</h3>
              <p className="text-gray-600 mb-4">
                Get help with technical issues, billing questions, or general inquiries.
              </p>
              <a 
                href="mailto:support@familynest.com" 
                className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center"
              >
                support@familynest.com
                <Mail className="ml-2 h-4 w-4" />
              </a>
              <div className="mt-4 text-sm text-gray-500">
                Response time: 2-4 hours
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Chat</h3>
              <p className="text-gray-600 mb-4">
                Chat with our support team in real-time for immediate assistance.
              </p>
              <button className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center">
                Start Chat
                <MessageCircle className="ml-2 h-4 w-4" />
              </button>
              <div className="mt-4 text-sm text-gray-500">
                Available 9 AM - 6 PM PST
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Phone Support</h3>
              <p className="text-gray-600 mb-4">
                Speak directly with our team for complex issues or urgent matters.
              </p>
              <a 
                href="tel:+1-555-FAMILY" 
                className="text-purple-600 font-semibold hover:text-purple-700 inline-flex items-center"
              >
                +1 (555) FAMILY
                <Phone className="ml-2 h-4 w-4" />
              </a>
              <div className="mt-4 text-sm text-gray-500">
                Available 9 AM - 6 PM PST
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Send us a message</h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 mb-2">Message sent successfully!</h3>
              <p className="text-green-700">
                Thank you for reaching out. We'll respond to your message within 2-4 hours during business hours.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="press">Press & Media</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Please provide as much detail as possible..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-semibold text-lg"
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Security is our top priority. We use military-grade AES-256 encryption for all data, both in transit and at rest. 
                Your photos and messages are encrypted end-to-end, meaning only you and your family members can access them. 
                We never share your data with third parties and undergo regular security audits.
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Do you offer enterprise solutions?</h3>
              <p className="text-gray-600 leading-relaxed">
                While FamilyNest is designed for families, we're exploring enterprise solutions for organizations that want 
                to help their employees stay connected with their families. Contact us if you're interested in learning more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Office Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Visit Our Office</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                While we're a remote-first company with team members around the world, our headquarters is located 
                in the heart of San Francisco. Drop by if you're in the neighborhood!
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">FamilyNest HQ</div>
                    <div className="text-gray-600">123 Family Street<br />San Francisco, CA 94102</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-green-600 mr-3 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900">Office Hours</div>
                    <div className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM PST<br />Weekends: By appointment</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl h-80 flex items-center justify-center">
              <div className="text-white text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <div className="text-lg font-semibold">Interactive Map</div>
                <div className="text-green-100">Coming Soon</div>
              </div>
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