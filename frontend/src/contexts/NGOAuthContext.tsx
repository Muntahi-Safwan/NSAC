import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NGO {
  id: string;
  email: string;
  name: string;
  region: string;
  country: string;
  verified: boolean;
  description?: string;
  contactPhone?: string;
}

interface NGOAuthContextType {
  ngo: NGO | null;
  ngoToken: string | null;
  loginNGO: (ngoData: NGO, token: string) => void;
  logoutNGO: () => void;
  isNGOAuthenticated: boolean;
}

const NGOAuthContext = createContext<NGOAuthContextType | undefined>(undefined);

export const NGOAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ngo, setNGO] = useState<NGO | null>(null);
  const [ngoToken, setNGOToken] = useState<string | null>(null);

  useEffect(() => {
    // Load NGO data from localStorage on mount
    const storedNGOData = localStorage.getItem('ngoData');
    const storedNGOToken = localStorage.getItem('ngoToken');

    if (storedNGOData && storedNGOToken) {
      setNGO(JSON.parse(storedNGOData));
      setNGOToken(storedNGOToken);
    }
  }, []);

  const loginNGO = (ngoData: NGO, token: string) => {
    setNGO(ngoData);
    setNGOToken(token);
    localStorage.setItem('ngoData', JSON.stringify(ngoData));
    localStorage.setItem('ngoToken', token);
    // Clear any user session
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const logoutNGO = () => {
    setNGO(null);
    setNGOToken(null);
    localStorage.removeItem('ngoData');
    localStorage.removeItem('ngoToken');
  };

  const value: NGOAuthContextType = {
    ngo,
    ngoToken,
    loginNGO,
    logoutNGO,
    isNGOAuthenticated: !!ngo && !!ngoToken,
  };

  return <NGOAuthContext.Provider value={value}>{children}</NGOAuthContext.Provider>;
};

export const useNGOAuth = () => {
  const context = useContext(NGOAuthContext);
  if (context === undefined) {
    throw new Error('useNGOAuth must be used within an NGOAuthProvider');
  }
  return context;
};
