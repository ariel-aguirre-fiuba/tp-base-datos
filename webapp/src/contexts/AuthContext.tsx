import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType } from "../types/banking";
import { getUser, registerUser } from "@/helpers/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (localStorage)
    const savedUser = localStorage.getItem("banco-fiuba-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);

    const response = await getUser(email);
    if (response) {
      const loggedUser = {
        id: response[0].id_usuario,
        email: response[0].email,
        firstName: response[0].nombre,
        lastName: response[0].lastName,
      };
      setUser(loggedUser);
      localStorage.setItem("banco-fiuba-user", JSON.stringify(loggedUser));
    }
    setIsLoading(false);

    return !!response;
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    setIsLoading(true);

    const response = await registerUser(email, firstName, lastName);

    if (response) {
      const loggedUser = {
        id: response[0].id_usuario,
        email: response[0].email,
        firstName: response[0].nombre,
        lastName: response[0].lastName,
      };
      setUser(loggedUser);
      localStorage.setItem("banco-fiuba-user", JSON.stringify(loggedUser));
    }
    setIsLoading(false);

    return !!response;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("banco-fiuba-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
