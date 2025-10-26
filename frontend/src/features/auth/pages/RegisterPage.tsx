import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
// FIX: Removed unused 'Shield' import
import { AlertCircle, UserPlus } from 'react-feather';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { registerUser, loginUser, selectAuthStatus, selectAuthError, clearAuthError } from '../authSlice';

const Container = styled(motion.div)`
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 100vh;
  background: linear-gradient(
    45deg,
    #0a0a0a 0%,
    #1a1a1a 25%,
    #2a2a2a 50%,
    #1a1a1a 75%,
    #0a0a0a 100%
  );
  background-size: 400% 400%;
  padding: ${({ theme }) => theme.spacing.md};
  position: relative;
`;

const FormCard = styled(motion.form)`
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing['2xl']};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  width: 100%; 
  max-width: 480px;
  min-width: 400px;
  position: relative;
  overflow: hidden;
`;
const TitleWrapper = styled(motion.div)`
  text-align: center; 
  color: ${({ theme }) => theme.colors.accent.primary};
  font-size: 2.5rem; 
  margin-bottom: 16px;
  display: flex; 
  align-items: center; 
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}; 
  font-weight: 700;
  letter-spacing: -0.02em;
  
  svg {
    width: 40px;
    height: 40px;
  }
`;

const Subtitle = styled(motion.p)`
  text-align: center;
  margin-bottom: 32px;
  font-size: 1.125rem;
  color: #d4d4d4;
  font-weight: 400;
`;

const Input = styled(motion.input)`
  width: 100%;
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  transition: all ${({ theme }) => theme.transitions.base};
  height: 56px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;
const ErrorMessage = styled(motion.p)`
  display: flex; align-items: center; gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.status.error};
  background-color: ${({ theme }) => 'rgba(239, 68, 68, 0.1)'};
  border: 1px solid ${({ theme }) => 'rgba(239, 68, 68, 0.5)'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md}; margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm}; text-align: left;
`;
const ToggleText = styled(motion.p)`
  color: ${({ theme }) => theme.colors.text.secondary}; text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg}; font-size: ${({ theme }) => theme.fontSizes.sm};
  a { color: ${({ theme }) => theme.colors.accent.primary}; font-weight: 600;
    &:hover { color: ${({ theme }) => theme.colors.accent.secondary}; }
  }
`;
const Button = styled(motion.button)`
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border: none; 
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-weight: 600; 
  font-size: ${({ theme }) => theme.fontSizes.lg};
  transition: all ${({ theme }) => theme.transitions.base};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent.primary}, ${({ theme }) => theme.colors.accent.secondary}); 
  color: #FFFFFF;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  height: 56px;
  
  &:hover:not(:disabled) { 
    transform: translateY(-2px); 
    box-shadow: 0 10px 25px ${({ theme }) => theme.colors.accent.primary}40; 
  }
  &:active:not(:disabled) { 
    transform: translateY(0); 
  }
  &:disabled { 
    background: ${({ theme }) => theme.colors.border}; 
    color: ${({ theme }) => theme.colors.text.muted}; 
    cursor: not-allowed; 
    box-shadow: none; 
  }
`;
const formVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const } }),
};
const errorVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, y: -10 },
  visible: { opacity: 1, height: 'auto', marginTop: '1rem', marginBottom: '0.25rem', y: 0, transition: { duration: 0.3 } }
};

const PasswordStrength = styled.div<{ strength: number }>`
  height: 4px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing.sm};
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ strength }) => strength * 25}%;
    background: ${({ strength, theme }) => {
      if (strength < 2) return theme.colors.status.error;
      if (strength < 3) return theme.colors.status.warning;
      return theme.colors.status.success;
    }};
    transition: all ${({ theme }) => theme.transitions.base};
  }
`;

const StrengthLabel = styled.div<{ strength: number }>`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ strength, theme }) => {
    if (strength < 2) return theme.colors.status.error;
    if (strength < 3) return theme.colors.status.warning;
    return theme.colors.status.success;
  }};
  margin-top: ${({ theme }) => theme.spacing.xs};
  text-align: center;
`;

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { dispatch(clearAuthError()); }, [dispatch]);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthLabel = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 3) return 'Fair';
    if (strength < 4) return 'Good';
    return 'Strong';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authStatus === 'loading') return;
    if (password.length < 6) {
      dispatch(clearAuthError());
      dispatch({ type: 'auth/registerUser/rejected', payload: 'Password must be at least 6 characters.' });
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      dispatch(clearAuthError());
      dispatch({ type: 'auth/registerUser/rejected', payload: 'Please provide a valid email address.' });
      return;
    }
    dispatch(clearAuthError());

    const resultAction = await dispatch(registerUser({ username, password, email }) as any); 
    
    if (registerUser.fulfilled.match(resultAction)) {
      console.log("Registration successful, account pending admin approval...");
      // Show success message instead of auto-login
      alert('Registration successful! Your account is pending admin approval. You will be notified once approved.');
      navigate('/login');
    }
  };

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <FormCard onSubmit={handleRegister} variants={formVariants} initial="hidden" animate="visible">
        <TitleWrapper variants={itemVariants} custom={0}>
          <UserPlus size={40} /> Create Account
        </TitleWrapper>
        <Subtitle variants={itemVariants} custom={0.5}>
          Join CrimeEye Pro Security System
        </Subtitle>
        <Input variants={itemVariants} custom={1} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
        <Input variants={itemVariants} custom={2} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input variants={itemVariants} custom={3} type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        
        {password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            variants={itemVariants}
            custom={3.5}
          >
            <PasswordStrength strength={passwordStrength} />
            <StrengthLabel strength={passwordStrength}>
              Password strength: {getStrengthLabel(passwordStrength)}
            </StrengthLabel>
          </motion.div>
        )}
        
        <AnimatePresence>
          {authError && (
            <ErrorMessage key="error-message" variants={errorVariants} initial="hidden" animate="visible" exit="hidden">
              <AlertCircle size={16} /> {authError}
            </ErrorMessage>
          )}
        </AnimatePresence>
        <motion.div variants={itemVariants} custom={4}>
          <Button type="submit" style={{ marginTop: authError ? '0.5rem' : '1.5rem' }} disabled={authStatus === 'loading'} whileTap={{ scale: 0.98 }}>
            {authStatus === 'loading' ? 'Creating Account...' : 'Create Account'}
          </Button>
        </motion.div>
        <ToggleText variants={itemVariants} custom={5}>
          Already have an account? <Link to="/login">Login</Link>
        </ToggleText>
      </FormCard>
    </Container>
  );
};

export default RegisterPage;
