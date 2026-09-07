import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, setCurrentUser, loginUser, logoutUser, registerStudent } from "@/services/authService";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => getCurrentUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFirebaseConfigured && auth) {
            const unsub = onAuthStateChanged(auth, (fbUser) => {
                if (!fbUser && !getCurrentUser()) {
                    setUser(null);
                }
                setLoading(false);
            });
            return unsub;
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const u = await loginUser(credentials);
        setUser(u);
        return u;
    };

    const signup = async (data) => {
        const u = await registerStudent(data);
        setUser(u);
        return u;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
