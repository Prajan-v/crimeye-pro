import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
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

type ParticleKind = 'particle' | 'shape' | 'glow';

interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  type: ParticleKind;
}

const GridOverlay = styled(motion.div)`
  position: fixed;
  inset: -45% -35% -65%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 90px 90px;
  pointer-events: none;
  transform: perspective(1400px) rotateX(70deg);
  opacity: 0.18;
  z-index: -1;
  filter: drop-shadow(0 0 24px rgba(255, 215, 0, 0.2));
`;

const HolographicRing = styled(motion.div)`
  position: absolute;
  inset: -80px;
  border-radius: 40px;
  background: radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.2) 0%, transparent 55%),
    radial-gradient(circle at 80% 80%, rgba(69, 183, 209, 0.18) 0%, transparent 60%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.35;
`;

const HoloGlare = styled(motion.div)`
  position: absolute;
  top: -40%;
  width: 45%;
  height: 180%;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 70%);
  filter: blur(10px);
  opacity: 0.25;
  pointer-events: none;
  transform: rotate(-15deg);
`;

const CornerAccent = styled(motion.span)`
  position: absolute;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 215, 0, 0.45);
  border-radius: 14px;
  filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.3));
  pointer-events: none;
  mix-blend-mode: screen;
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
  transform-style: preserve-3d;
  perspective: 1600px;
  will-change: transform, box-shadow;
  transition: box-shadow ${({ theme }) => theme.transitions.base};

  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.35) 0%, transparent 55%);
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.fast};
    pointer-events: none;
  }

  &:hover::after {
    opacity: 1;
  }
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

// Scanline effect for cyberpunk aesthetic
const Scanlines = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  z-index: 1;
  opacity: 0.3;
`;

const ParticleSystem: React.FC = () => {
  const [particles, setParticles] = useState<ParticleConfig[]>([]);

  useEffect(() => {
    const colors = ['#FFD700', '#FFA500', '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4'];
    const newParticles: ParticleConfig[] = [];

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
  const [isCardHovered, setIsCardHovered] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector(selectAuthStatus);
  const authError = useAppSelector(selectAuthError);
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 180, damping: 16, mass: 0.4 });
  const springY = useSpring(tiltY, { stiffness: 180, damping: 16, mass: 0.4 });
  const rotateX = useTransform(springX, (value) => `${value}deg`);
  const rotateY = useTransform(springY, (value) => `${value}deg`);
  const dynamicShadow = useTransform(springX, (value) => {
    const intensity = Math.min(0.65, 0.35 + Math.abs(value) / 18);
    return `0 24px 55px rgba(0, 0, 0, ${intensity})`;
  });
  const glareBase = useMotionValue(0.2);
  const glareOpacity = useSpring(glareBase, { stiffness: 150, damping: 20, mass: 0.5 });
  const glarePosition = useTransform(springY, (value) => `${50 + value * 1.8}%`);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const resultAction = await dispatch(loginUser({
        username: data.username,
        password: data.password,
      }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        if (data.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        toast.success('🎉 Welcome back to CrimeEye Pro!');
        navigate('/');
      } else {
        toast.error('❌ Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      toast.error(error?.message || '❌ Login failed. Please check your credentials.');
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const rotateYValue = ((offsetX - rect.width / 2) / (rect.width / 2)) * 10;
    const rotateXValue = ((rect.height / 2 - offsetY) / (rect.height / 2)) * 8;
    tiltX.set(rotateXValue);
    tiltY.set(rotateYValue);
    const intensity = 0.18 + Math.min(Math.abs(rotateYValue) / 22, 0.35);
    glareBase.set(intensity);
    if (!isCardHovered) {
      setIsCardHovered(true);
    }
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
    setIsCardHovered(false);
    glareBase.set(0.2);
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
      <Scanlines
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <GridOverlay
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: [0.08, 0.2, 0.08], y: [-30, 10, -30] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <ParticleSystem />
      
      <GlassContainer
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ rotateX, rotateY, boxShadow: dynamicShadow }}
      >
        <HolographicRing
          animate={{
            opacity: isCardHovered ? 0.55 : 0.35,
            scale: isCardHovered ? 1.05 : 1,
            rotate: isCardHovered ? 360 : 0,
          }}
          transition={{
            duration: isCardHovered ? 18 : 0.8,
            repeat: isCardHovered ? Infinity : 0,
            ease: 'linear',
          }}
        />
        <HoloGlare
          style={{ left: glarePosition, opacity: glareOpacity }}
          animate={{ scale: isCardHovered ? 1.05 : 1, rotate: isCardHovered ? -8 : -15 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        <CornerAccent
          style={{ top: 20, left: 20 }}
          animate={{ opacity: isCardHovered ? 0.9 : 0.5 }}
          transition={{ duration: 0.4 }}
        />
        <CornerAccent
          style={{ top: 20, right: 20 }}
          animate={{ opacity: isCardHovered ? 0.9 : 0.5 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        />
        <CornerAccent
          style={{ bottom: 20, left: 20 }}
          animate={{ opacity: isCardHovered ? 0.9 : 0.5 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
        <CornerAccent
          style={{ bottom: 20, right: 20 }}
          animate={{ opacity: isCardHovered ? 0.9 : 0.5 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        />
        <Logo
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 5, -5, 0],
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
                'drop-shadow(0 0 20px rgba(255, 165, 0, 0.8))',
                'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield />
          </motion.div>
        </Logo>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: [0, -4, 0], 
            opacity: 1,
          }}
          transition={{ 
            y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            opacity: { delay: 0.2, duration: 0.5 }
          }}
          style={{
            textAlign: 'center',
            marginBottom: '40px',
            fontSize: '2.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
            animation: 'gradient-shift 3s ease infinite',
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
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ marginTop: '16px' }}
              >
                <ErrorMessage
                  style={{ 
                    justifyContent: 'center',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <AlertCircle size={18} />
                  </motion.div>
                  <span style={{ marginLeft: '8px' }}>{authError}</span>
                </ErrorMessage>
              </motion.div>
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