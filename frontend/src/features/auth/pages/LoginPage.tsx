import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { loginUser, selectAuthStatus, selectAuthError } from '../authSlice';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle } from 'react-feather';
import { toast } from 'react-hot-toast';

// Enhanced particle components for background animation
const Particle = styled(motion.div)<{ size: number; color: string }>`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: ${({ color }) => color};
  border-radius: 50%;
  pointer-events: none;
  filter: blur(0.5px);
`;

const FloatingShape = styled(motion.div)<{ size: number; color: string }>`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: ${({ color }) => color};
  border-radius: 30%;
  pointer-events: none;
  opacity: 0.1;
  filter: blur(1px);
`;

const GlowEffect = styled(motion.div)`
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  filter: blur(20px);
`;

// Glassmorphism container
const GlassContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing['2xl']};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  min-width: 400px;
`;

// Enhanced animated background
const AnimatedBackground = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    #0a0a0a 0%,
    #1a1a1a 15%,
    #2a2a2a 30%,
    #1a1a1a 45%,
    #0a0a0a 60%,
    #1a1a1a 75%,
    #2a2a2a 90%,
    #0a0a0a 100%
  );
  background-size: 400% 400%;
  z-index: -2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at 20% 80%, 
      rgba(255, 215, 0, 0.1) 0%, 
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%, 
      rgba(255, 165, 0, 0.08) 0%, 
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%, 
      rgba(255, 107, 53, 0.06) 0%, 
      transparent 50%
    );
    z-index: -1;
  }
`;

// Logo with glow effect
const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  svg {
    width: 64px;
    height: 64px;
    color: ${({ theme }) => theme.colors.accent.primary};
    filter: drop-shadow(0 0 20px ${({ theme }) => theme.colors.accent.primary});
  }
`;

// Form styles
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  align-items: center;
`;

const InputGroup = styled(motion.div)`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  align-items: center;
`;

const Input = styled.input<{ hasError: boolean }>`
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ hasError, theme }) => 
    hasError ? theme.colors.status.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  transition: all ${({ theme }) => theme.transitions.base};
  position: relative;
  height: 56px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing.lg};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  z-index: 1;
  svg {
    width: 24px;
    height: 24px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.lg};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.elevated};
  }
`;

const Button = styled(motion.button)<{ isLoading: boolean }>`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent.primary}, ${({ theme }) => theme.colors.accent.secondary});
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.background.primary};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  cursor: ${({ isLoading }) => isLoading ? 'not-allowed' : 'pointer'};
  position: relative;
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.base};
  height: 56px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: block;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px ${({ theme }) => theme.colors.accent.primary}40;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled(motion.div)`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.accent.primary};
`;

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
`;

// Enhanced particle system with multiple layers
const ParticleSystem: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ 
    id: number; 
    x: number; 
    y: number; 
    size: number; 
    color: string;
    type: 'particle' | 'shape' | 'glow';
  }>>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#FFA500', '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4'];
    const newParticles = [];
    
    // Small particles
    for (let i = 0; i < 80; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'particle'
      });
    }
    
    // Floating shapes
    for (let i = 80; i < 95; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'shape'
      });
    }
    
    // Glow effects
    for (let i = 95; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 200,
        color: '#FFD700',
        type: 'glow'
      });
    }
    
    setParticles(newParticles);
  }, []);

  return (
    <>
      {particles.map((particle) => {
        if (particle.type === 'particle') {
          return (
            <Particle
              key={particle.id}
              size={particle.size}
              color={particle.color}
              initial={{ 
                x: `${particle.x}vw`, 
                y: `${particle.y}vh`, 
                opacity: 0,
                scale: 0
              }}
              animate={{
                x: `${particle.x + (Math.random() - 0.5) * 30}vw`,
                y: `${particle.y + (Math.random() - 0.5) * 30}vh`,
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut'
              }}
            />
          );
        } else if (particle.type === 'shape') {
          return (
            <FloatingShape
              key={particle.id}
              size={particle.size}
              color={particle.color}
              initial={{ 
                x: `${particle.x}vw`, 
                y: `${particle.y}vh`, 
                opacity: 0,
                rotate: 0
              }}
              animate={{
                x: `${particle.x + (Math.random() - 0.5) * 20}vw`,
                y: `${particle.y + (Math.random() - 0.5) * 20}vh`,
                opacity: [0, 0.15, 0],
                rotate: 360,
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'linear'
              }}
            />
          );
        } else {
          return (
            <GlowEffect
              key={particle.id}
              initial={{ 
                x: `${particle.x}vw`, 
                y: `${particle.y}vh`, 
                opacity: 0,
                scale: 0.5
              }}
              animate={{
                x: `${particle.x + (Math.random() - 0.5) * 15}vw`,
                y: `${particle.y + (Math.random() - 0.5) * 15}vh`,
                opacity: [0, 0.3, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 6 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: 'easeInOut'
              }}
            />
          );
        }
      })}
    </>
  );
};

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(loginUser({
        username: data.username,
        password: data.password,
      })).unwrap();
      
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
      }}
    >
      <AnimatedBackground
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <ParticleSystem />
      
      <GlassContainer
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Logo
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Shield />
        </Logo>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            textAlign: 'center',
            marginBottom: '40px',
            fontSize: '2.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}
        >
          CrimeEye Pro
        </motion.h1>
        
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '1.125rem',
            color: '#d4d4d4',
            fontWeight: 400,
          }}
        >
          Advanced Security Monitoring System
        </motion.p>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <InputWrapper>
              <InputIcon>
                <User size={20} />
              </InputIcon>
              <Input
                {...register('username', { required: 'Username is required' })}
                placeholder="Username"
                hasError={!!errors.username}
                style={{ paddingLeft: '60px' }}
              />
            </InputWrapper>
            <AnimatePresence>
              {errors.username && (
                <ErrorMessage
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle size={16} />
                  {errors.username.message}
                </ErrorMessage>
              )}
            </AnimatePresence>
          </InputGroup>

          <InputGroup
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <InputWrapper>
              <InputIcon>
                <Lock size={20} />
              </InputIcon>
              <Input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                hasError={!!errors.password}
                style={{ paddingLeft: '60px', paddingRight: '60px' }}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputWrapper>
            
            <AnimatePresence>
              {errors.password && (
                <ErrorMessage
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AlertCircle size={16} />
                  {errors.password.message}
                </ErrorMessage>
              )}
            </AnimatePresence>
          </InputGroup>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                {...register('rememberMe')}
              />
              Remember me
            </CheckboxWrapper>
          </motion.div>

          <Button
            type="submit"
            isLoading={authStatus === 'loading'}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={authStatus === 'loading'}
          >
            {authStatus === 'loading' ? 'Signing in...' : 'Sign In'}
          </Button>

          <AnimatePresence>
            {authError && (
              <ErrorMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ justifyContent: 'center', marginTop: '16px' }}
              >
                <AlertCircle size={16} />
                {authError}
              </ErrorMessage>
            )}
          </AnimatePresence>
        </Form>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '1rem',
            color: '#d4d4d4',
          }}
        >
          Don't have an account?{' '}
          <motion.a
            href="/register"
            style={{
              color: '#FFD700',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            whileHover={{ color: '#FFA500' }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.a>
        </motion.div>
      </GlassContainer>
    </motion.div>
  );
};

export default LoginPage;