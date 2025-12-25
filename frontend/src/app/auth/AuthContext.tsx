import { createContext, useContext, useState, ReactNode } from 'react';

// Placeholder user type
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // In future, check local storage or cookie for JWT
    const [user, setUser] = useState<User | null>({
        id: 'user-1',
        name: 'Burhan',
        email: 'burhan@example.com',
        avatar: '/profile.jpg'
    });

    const login = async () => {
        // Implement API call
        setUser({ id: 'user-1', name: 'Burhan', email: 'burhan@example.com' });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
