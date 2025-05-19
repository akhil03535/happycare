import React, { createContext, useContext, ReactNode, useState } from 'react';

// Export interfaces so they can be imported by other components
export interface User {
  id: string;
  name: string;
  email: string;
  thingspeakChannelId: string;
  thingspeakApiKey: string;
  isPremium?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updatePremiumStatus: (status: boolean) => void;
}

// Create and export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    try {
      const userWithPremium = {
        ...userData,
        isPremium: userData.isPremium || false
      };
      setUser(userWithPremium);
      localStorage.setItem('user', JSON.stringify(userWithPremium));
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updatePremiumStatus = (status: boolean) => {
    try {
      if (user) {
        const updatedUser = { ...user, isPremium: status };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  };

  // Initialize from localStorage if available with error handling
  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('user'); // Clear potentially corrupted data
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePremiumStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;