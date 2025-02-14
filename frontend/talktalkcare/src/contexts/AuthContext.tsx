// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useState의 초기값을 함수로 설정
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('userId'));
  });

  // 상태 변경 감지용 useEffect
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId && !isLoggedIn) {
      setIsLoggedIn(true);
    } else if (!userId && isLoggedIn) {
      setIsLoggedIn(false);
    }
  }, [isLoggedIn]);

  const value = {
    isLoggedIn,
    setIsLoggedIn,
  };

  return (
    <AuthContext.Provider value={value}>
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