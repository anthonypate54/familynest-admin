import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, AlertTriangle } from 'lucide-react';

// Get API URL from environment variable (defaults to AWS staging/production)
const API_URL = process.env.REACT_APP_API_URL || 'https://infamilynest.com';

const DeleteAccountPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'login' | 'confirm' | 'success'>('login');
  const [token, setToken] = useState('');
  const [familiesTransferred, setFamiliesTransferred] = useState(0);
  const [familiesDeleted, setFamiliesDeleted] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use verify-credentials endpoint to avoid invalidating mobile app sessions
      const response = await fetch(`${API_URL}/api/auth/verify-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.accessToken);
        setStep('confirm');
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Success - show success screen
        setFamiliesTransferred(data.familiesTransferred || 0);
        setFamiliesDeleted(data.familiesDeleted || 0);
        setStep('success');
        setUsername('');
        setPassword('');
        setToken('');
      } else {
        if (data.error === 'active_subscription') {
          setError(`You have an ${data.subscriptionStatus} subscription. Please cancel your subscription in the App Store before deleting your account.`);
        } else {
          setError(data.message || 'Account deletion failed');
        }
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(to bottom, #4CAF50, #2196F3)',
      minHeight: '100vh',
      padding: '16px'
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        marginBottom: '16px',
        padding: '12px 16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Heart style={{width: '24px', height: '24px', color: '#4CAF50'}} />
            <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>FamilyNest</span>
          </div>
          <Link to="/" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <AlertTriangle size={32} color="#dc2626" style={{ margin: '0 auto' }} />
          </div>
          
          <h1 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#dc2626',
            marginBottom: '20px'
          }}>
            Delete Account
          </h1>

          {step === 'success' ? (
            // Success Step
            <div>
              <div style={{
                textAlign: 'center',
                padding: '20px 0'
              }}>
                <div style={{
                  background: '#10b981',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <span style={{ fontSize: '32px', color: 'white' }}>✓</span>
                </div>
                
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#065f46',
                  marginBottom: '12px'
                }}>
                  Account Deleted Successfully
                </h2>
                
                <p style={{ color: '#374151', marginBottom: '16px', fontSize: '14px' }}>
                  Your account and all associated data have been permanently deleted.
                </p>
                
                {(familiesTransferred > 0 || familiesDeleted > 0) && (
                  <div style={{
                    background: '#dbeafe',
                    border: '1px solid #60a5fa',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}>
                    {familiesTransferred > 0 && (
                      <p style={{ fontSize: '13px', color: '#1e40af', margin: '0 0 4px 0' }}>
                        ✓ {familiesTransferred} family ownership(s) transferred to other members
                      </p>
                    )}
                    {familiesDeleted > 0 && (
                      <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
                        ✓ {familiesDeleted} empty family(ies) deleted
                      </p>
                    )}
                  </div>
                )}
                
                <div style={{
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '20px'
                }}>
                  <p style={{ fontSize: '14px', color: '#374151', fontWeight: '500', margin: '0 0 8px 0' }}>
                    You can now close this browser window/tab.
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    If you opened this from the FamilyNest app, return to the app and you'll be logged out automatically.
                  </p>
                </div>
              </div>
            </div>
          ) : step === 'login' ? (
            // Login Step
            <div>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '13px', color: '#991b1b', margin: 0 }}>
                  <strong>Warning:</strong> Account deletion is permanent and cannot be undone.
                </p>
              </div>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {error && (
                  <div style={{
                    background: '#fee2e2',
                    border: '1px solid #f87171',
                    color: '#991b1b',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '13px'
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Logging in...' : 'Continue'}
                </button>
              </form>

              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Link to="/" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none' }}>
                  Cancel and return home
                </Link>
              </div>
            </div>
          ) : (
            // Confirmation Step
            <div>
              <div style={{
                background: '#fee2e2',
                border: '2px solid #dc2626',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#991b1b',
                  marginBottom: '12px',
                  marginTop: 0
                }}>
                  ⚠️ FINAL WARNING ⚠️
                </h2>
                <p style={{ color: '#991b1b', margin: '0 0 8px 0', fontSize: '13px' }}>
                  Deleting your account will:
                </p>
                <ul style={{ color: '#991b1b', margin: '0 0 12px 0', paddingLeft: '20px', fontSize: '13px' }}>
                  <li style={{ marginBottom: '4px' }}>Remove you from all families</li>
                  <li style={{ marginBottom: '4px' }}>Delete all your messages and photos</li>
                  <li style={{ marginBottom: '4px' }}>Erase all connections</li>
                  <li style={{ marginBottom: '4px' }}>Delete all your data</li>
                </ul>
                <p style={{ color: '#991b1b', fontWeight: 'bold', margin: 0, fontSize: '13px' }}>
                  THIS CANNOT BE UNDONE!
                </p>
              </div>

              {error && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fbbf24',
                  color: '#92400e',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>Cannot Delete Account:</p>
                  <p style={{ margin: '0 0 8px 0' }}>{error}</p>
                  {error.includes('subscription') && (
                    <a
                      href="https://apps.apple.com/account/subscriptions"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'underline', color: '#92400e' }}
                    >
                      Manage Subscriptions →
                    </a>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setStep('login');
                    setError('');
                  }}
                  style={{
                    flex: 1,
                    background: '#6b7280',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: loading ? '#9ca3af' : '#dc2626',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Deleting...' : 'DELETE ACCOUNT'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
