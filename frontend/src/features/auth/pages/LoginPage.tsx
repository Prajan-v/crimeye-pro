import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Shield, AlertCircle } from 'react-feather';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { loginUser, selectAuthStatus, selectAuthError, clearAuthError, fetchCurrentUser } from
'../authSlice';
import { wsConnect } from '../../../services/socket.middleware';
const Container = styled(motion.div)`
display: flex; justify-content: center; align-items: center; min-height: 100vh;
background: radial-gradient(circle at center top, ${({ theme }) =>
theme.colors.background.secondary} 0%, ${({ theme }) => theme.colors.background.primary}
80%);
padding: ${({ theme }) => theme.spacing.md};
`;
const FormCard = styled(motion.form)`
background-color: ${({ theme }) => theme.colors.background.secondary};
padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
border-radius: ${({ theme }) => theme.borderRadius.xl};
border: 1px solid ${({ theme }) => theme.colors.border};
width: 100%; max-width: 420px;
box-shadow: ${({ theme }) => theme.shadows.xl};
`;
const TitleWrapper = styled(motion.div)`
text-align: center; color: ${({ theme }) => theme.colors.accent.primary};
font-size: ${({ theme }) => theme.fontSizes['2xl']}; margin-bottom: ${({ theme }) =>
theme.spacing.lg};
display: flex; align-items: center; justify-content: center;
gap: ${({ theme }) => theme.spacing.sm}; font-weight: 700;
`;
const ErrorMessage = styled(motion.p)`
display: flex; align-items: center; gap: ${({ theme }) => theme.spacing.sm};
color: ${({ theme }) => theme.colors.status.error};
background-color: ${({ theme }) => 'rgba(239, 68, 68, 0.1)'};
border: 1px solid ${({ theme }) => 'rgba(239, 68, 68, 0.5)'};
border-radius: ${({ theme }) => theme.borderRadius.md};
padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
margin-top: ${({ theme }) => theme.spacing.md};
margin-bottom: ${({ theme }) =>
theme.spacing.xs};
font-size: ${({ theme }) => theme.fontSizes.sm}; text-align: left;
`;
const ToggleText = styled(motion.p)`
color: ${({ theme }) => theme.colors.text.secondary}; text-align: center;
margin-top: ${({ theme }) => theme.spacing.lg};
font-size: ${({ theme }) =>
theme.fontSizes.sm};
a { color: ${({ theme }) => theme.colors.accent.primary}; font-weight: 600;
&:hover { color: ${({ theme }) => theme.colors.accent.secondary};
}
}
`;
const Button = styled(motion.button)`
display: inline-flex; align-items: center; justify-content: center; width: 100%;
padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
border: none; border-radius: ${({ theme }) => theme.borderRadius.md}; cursor: pointer;
font-weight: 600; font-size: ${({ theme }) => theme.fontSizes.base};
transition: all ${({ theme }) => theme.transitions.fast};
background-color: ${({ theme }) => theme.colors.accent.primary}; color: #FFFFFF;
box-shadow: ${({ theme }) => theme.shadows.sm};
&:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-2px); box-shadow: ${({
theme }) => theme.shadows.md}; }
&:active:not(:disabled) { transform: translateY(0); filter: brightness(0.9); box-shadow: ${({
theme }) => theme.shadows.sm}; }
&:disabled { background-color: ${({ theme }) => theme.colors.border}; color: ${({ theme }) =>
theme.colors.text.muted}; cursor: not-allowed; box-shadow: none; }
`;
const formVariants = {
hidden: { opacity: 0, y: -30 },
visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
exit: { opacity: 0, y: 30, transition: { duration: 0.3 } }
};
const itemVariants = {
hidden: { opacity: 0, x: -20 },
visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4, ease:
'easeOut' } }),
};
const errorVariants = {
hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, y: -10 },
visible: { opacity: 1, height: 'auto', marginTop: '1rem', marginBottom: '0.25rem', y: 0, transition: {
duration: 0.3 } }
};
const LoginPage: React.FC = () => {
const [username, setUsername] = useState('CrimeEye');
const [password, setPassword] = useState('CrimeEye@');
const dispatch = useAppDispatch();
const authStatus = useAppSelector(selectAuthStatus);
const authError = useAppSelector(selectAuthError);
const navigate = useNavigate();
const location = useLocation();
useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);
const handleLogin = async (e: React.FormEvent) => {
e.preventDefault();
if (authStatus === 'loading') return;
dispatch(clearAuthError());
const resultAction = await dispatch(loginUser({ username, password }));
if (loginUser.fulfilled.match(resultAction)) {
await dispatch(fetchCurrentUser());
dispatch(wsConnect());
const from = (location.state as { from?: Location })?.from?.pathname || "/";
navigate(from, { replace: true });
}
};
return (
<Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
<FormCard onSubmit={handleLogin} variants={formVariants} initial="hidden"
animate="visible" exit="exit">
<TitleWrapper variants={itemVariants} custom={0}>
<Shield size={32} /> CrimeEye-Pro
</TitleWrapper>
<motion.input variants={itemVariants} custom={1} type="text" placeholder="Username"
value={username} onChange={(e) => setUsername(e.target.value)} required
autoComplete="username" />
<motion.input variants={itemVariants} custom={2} type="password"
placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
required autoComplete="current-password" />
<AnimatePresence>
{authError && (
<ErrorMessage key="error-message" variants={errorVariants} initial="hidden"
animate="visible" exit="hidden">
<AlertCircle size={16} /> {authError}
</ErrorMessage>
)}
</AnimatePresence>
<motion.div variants={itemVariants} custom={3}>
<Button type="submit" style={{ marginTop: authError ? '0.5rem' : '1.5rem' }}
disabled={authStatus === 'loading'} whileTap={{ scale: 0.98 }}>
{authStatus === 'loading' ? 'Logging in...' : 'Login'}
</Button>
</motion.div>
<ToggleText variants={itemVariants} custom={4}>
Don't have an account? <Link to="/register">Register</Link>
</ToggleText>
</FormCard>
</Container>
);
};
export default LoginPage;
