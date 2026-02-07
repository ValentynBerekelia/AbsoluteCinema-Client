import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import { useAuth } from '@/context/AuthContext/AuthContext';
import { useToast } from '@/context/ToastContext/ToastContext'; // Додаємо для валідації

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { registerUser } = useAuth();
    const { showToast } = useToast();
    
    const [formData, setFormData] = useState({
        userName: '', // Важливо: бекенд очікує саме це поле
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // 1. Валідація паролів на фронті
        if (formData.password !== formData.confirmPassword) {
            showToast('error', 'Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            showToast('error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // 2. Викликаємо метод з контексту (він сам покаже тост успіху або помилки бека)
            await registerUser({
                userName: formData.userName,
                email: formData.email,
                password: formData.password
            });

            // 3. Після успішної реєстрації AuthContext оновить юзера, 
            // і ми можемо редиректнути на головну
            navigate('/');
        } catch (err: any) {
            // Помилку з бекенда вже показав AuthContext через showToast
            console.error('Registration failed:', err);
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
                    <h1>Create Account</h1>
                    <p>Join AbsoluteCinema today</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="userName">Username</label>
                        <input
                            id="userName"
                            type="text"
                            value={formData.userName}
                            onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                            placeholder="johndoe123"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="At least 6 characters"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Re-enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className={styles.authFooter}>
                    <p>Already have an account? <button onClick={() => navigate('/login')} className={styles.linkBtn}>Sign in</button></p>
                </div>
            </div>
        </div>
    );
};