import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { useAuth } from '@/context/AuthContext/AuthContext';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        rememberMe: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await loginUser({
                userName: formData.userName,
                password: formData.password
            });

            navigate('/');
        } catch (err: any) {
            console.error('Login error in component:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <button className={styles.backBtn} onClick={() => navigate('/')}>
                ← Back to Home
            </button>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm}>

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Username</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.userName}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="your.email@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <div className={styles.rememberMe}>
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.rememberMe}
                                onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                            />
                            <span>Remember me</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <p>Don't have an account? <button onClick={() => navigate('/register')} className={styles.linkBtn}>Sign up</button></p>
                </div>
            </div>
        </div>
    );
};
