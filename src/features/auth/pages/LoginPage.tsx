import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import styled from 'styled-components';
import { Shield } from 'react-feather';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { loginUser, selectAuthStatus, selectAuthError, clearAuthError, fetchCurrentUser } from '../authSlice';
import { wsConnect } from '../../../services/socket.middleware';
import { unwrapResult } from '@reduxjs/toolkit';

const Container = styled(motion.div)`
  display: flex; justify-content: center; align-items: center; min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  padding: ${({ theme }) => theme.spacing.lg};
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
  display: flex; align-items: center; justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}; margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.accent.primary};
  svg { width: 32px; height: 32px; }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['2xl']}; font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary}; margin: 0;
`;

const InputGroup = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block; margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm}; font-weight: 500;
`;

const Input = styled.input`
  width: 100%; padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const ErrorMessage = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.status.error}22;
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  color: ${({ theme }) => theme.colors.status.error};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md}; font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const SubmitButton = styled(motion.button)`
  width: 100%; padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.accent.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.base}; font-weight: 600;
  transition: filter ${({ theme }) => theme.transitions.fast}, 
              transform ${({ theme }) => theme.transitions.fast},
              box-shadow ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ theme }) => theme.shadows.md};
  &:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-2px); 
                            box-shadow: ${({ theme }) => theme.shadows.lg}; }
  &:active:not(:disabled) { transform: translateY(0); filter: brightness(0.9); 
                             box-shadow: ${({ theme }) => theme.shadows.sm}; }
  &:disabled { background-color: ${({ theme }) => theme.colors.border}; 
               color: ${({ theme }) => theme.colors.text.muted}; 
               cursor: not-allowed; box-shadow: none; }
`;

// Fixed variants with proper ease values
const formVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] }  // Fixed as array
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { duration: 0.2 } 
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({ 
    opacity: 1, 
    x: 0, 
    transition: { delay: i * 0.1, duration: 0.3 } 
  }),
};

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (authStatus === 'loading') return;
    dispatch(clearAuthError());
    
    try {
      // Fixed dispatch with unwrapResult
      const resultAction = await dispatch(loginUser({ username, password }));
      const result = unwrapResult(resultAction);
      
      // Fetch current user after successful login
      await dispatch(fetchCurrentUser());
      dispatch(wsConnect());
      
      const from = (location.state as { from?: Location })?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <FormCard 
        onSubmit={handleLogin} 
        variants={formVariants} 
        initial="hidden"
        animate="visible" 
        exit="exit"
      >
        <TitleWrapper variants={itemVariants} custom={0}>
          <Shield size={32} /> 
          <Title>CrimeEye-Pro</Title>
        </TitleWrapper>
        
        {authError && (
          <ErrorMessage initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            {authError}
          </ErrorMessage>
        )}
        
        <InputGroup variants={itemVariants} custom={1}>
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" placeholder="Enter your username" value={username}
            onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
        </InputGroup>
        
        <InputGroup variants={itemVariants} custom={2}>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" value={password}
            onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </InputGroup>
        
        <SubmitButton type="submit" disabled={authStatus === 'loading'} whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}>
          {authStatus === 'loading' ? 'Logging in...' : 'Login'}
        </SubmitButton>
      </FormCard>
    </Container>
  );
};

export default LoginPage;
