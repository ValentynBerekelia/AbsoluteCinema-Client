import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // TODO: Implement API call for login
            console.log('Login attempt:', formData);
            // await login(formData);
            // navigate('/');
        } catch (err: any) {
            setError(err.message || 'Login failed');
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
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
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
