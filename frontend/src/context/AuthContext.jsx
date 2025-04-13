import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await fetch('http://localhost/api/user', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Accept': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, newToken) => {
    localStorage.setItem('token', newToken);
    setUser(userData);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const isCaregiver = () => {
    return user?.caregiver === 1 || user?.caregiver === true;
  };

  const hasCareRecipient = () => {
    if (!user) return false;
    if (!isCaregiver()) return true;
    return user.care_recipient_id != null && user.care_recipient_id !== undefined;
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('AuthContext state:', { 
      user, 
      isCaregiver: isCaregiver(), 
      hasCareRecipient: hasCareRecipient(),
      caregiver_value: user?.caregiver,
      care_recipient_id: user?.care_recipient_id 
    });
  }

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      isCaregiver: isCaregiver(),
      hasCareRecipient: hasCareRecipient(),
      userId: user?.id
    }}>
      {children}
    </AuthContext.Provider>
  );
};