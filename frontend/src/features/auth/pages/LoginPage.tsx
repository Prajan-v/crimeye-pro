import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Shield, AlertCircle, Eye, EyeOff } from 'react-feather';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { loginUser, selectAuthStatus, selectAuthError, clearAuthError, fetchCurrentUser } from '../authSlice';
import { wsConnect } from '../../../services/socket.middleware';
import ParticleBackground from '../../../common/components/Effects/ParticleBackground';
import ScanlineOverlay from '../../../common/components/Effects/ScanlineOverlay';
import GridPattern from '../../../common/components/Effects/GridPattern';
import FuturisticBorder from '../../../common/components/UI/FuturisticBorder';

const Container = styled(motion.div)`
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.background.primary} 0%, 
    ${({ theme }) => theme.colors.background.secondary} 50%,
    ${({ theme }) => theme.colors.background.primary} 100%
  );
  padding: ${({ theme }) => theme.spacing.md};
`;

const FormCard = styled(motion.form)`
  ${({ theme }) => theme.effects.glassmorphism}
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing['2xl']};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  width: 100%; 
  max-width: 450px;
  box-shadow: ${({ theme }) => theme.shadows.glass};
  position: relative;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  /* Holographic border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(45deg, 
      ${({ theme }) => theme.colors.accent.primary}, 
      ${({ theme }) => theme.colors.accent.secondary},
      ${({ theme }) => theme.colors.accent.tertiary},
      ${({ theme }) => theme.colors.accent.primary}
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    pointer-events: none;
    opacity: 0.8;
  }
`;
const TitleWrapper = styled(motion.div)`
  text-align: center; 
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  display: flex; 
  flex-direction: column;
  align-items: center; 
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LogoIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.accent.primary}, 
    ${({ theme }) => theme.colors.accent.secondary}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.glowPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  font-weight: 700;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.accent.primary}, 
    ${({ theme }) => theme.colors.accent.secondary}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-shadow: 0 0 30px ${({ theme }) => theme.colors.glow.primary};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  font-weight: 300;
  letter-spacing: 0.05em;
`;
const InputGroup = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Input = styled(motion.input)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.base};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.transitions.base};
  position: relative;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
    box-shadow: ${({ theme }) => theme.shadows.glowPrimary};
    background: ${({ theme }) => theme.colors.background.surface};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const PasswordToggle = styled(motion.button)`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
    background: ${({ theme }) => theme.colors.background.surface};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ErrorMessage = styled(motion.p)`
  display: flex; 
  align-items: center; 
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.status.error};
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.status.error}20, 
    ${({ theme }) => theme.colors.status.error}10
  );
  border: 1px solid ${({ theme }) => theme.colors.status.error}60;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm}; 
  text-align: left;
  box-shadow: ${({ theme }) => theme.shadows.glowError};
`;
const ToggleText = styled(motion.p)`
  color: ${({ theme }) => theme.colors.text.secondary}; text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.sm};
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
  border-radius: ${({ theme }) => theme.borderRadius.lg}; 
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 600; 
  font-size: ${({ theme }) => theme.fontSizes.lg};
  transition: all ${({ theme }) => theme.transitions.base};
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.accent.primary}, 
    ${({ theme }) => theme.colors.accent.secondary}
  );
  color: #FFFFFF;
  box-shadow: ${({ theme }) => theme.shadows.glowPrimary};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover:not(:disabled) { 
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.glowPrimary}, 0 10px 30px rgba(0, 217, 255, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) { 
    transform: translateY(0) scale(0.98); 
  }
  
  &:disabled { 
    background: ${({ theme }) => theme.colors.background.surface}; 
    color: ${({ theme }) => theme.colors.text.muted}; 
    cursor: not-allowed; 
    box-shadow: none;
    opacity: 0.6;
  }
`;
const formVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }, // <-- FIX
  exit: { opacity: 0, y: 30, transition: { duration: 0.3 } }
};
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const } }), // <-- FIX
};
const errorVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0, y: -10 },
  visible: { opacity: 1, height: 'auto', marginTop: '1rem', marginBottom: '0.25rem', y: 0, transition: { duration: 0.3 } }
};

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('CrimeEye');
  const [password, setPassword] = useState('CrimeEye@');
  const [showPassword, setShowPassword] = useState(false);
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
    
    const resultAction = await dispatch(loginUser({ username, password }) as any);

    if (loginUser.fulfilled.match(resultAction)) {
      await dispatch(fetchCurrentUser() as any);
      dispatch(wsConnect());
      const from = (location.state as { from?: Location })?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  };

  return (
    <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Background Effects */}
      <ParticleBackground particleCount={60} />
      <ScanlineOverlay enabled={true} intensity={0.3} speed={3} />
      <GridPattern enabled={true} opacity={0.2} size={40} />
      
      <FormCard onSubmit={handleLogin} variants={formVariants} initial="hidden" animate="visible" exit="exit">
        <TitleWrapper variants={itemVariants} custom={0}>
          <LogoIcon
            variants={itemVariants}
            custom={0}
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse" as const 
            }}
          >
            <Shield size={40} />
          </LogoIcon>
          <Title variants={itemVariants} custom={1}>CrimeEye-Pro</Title>
          <Subtitle variants={itemVariants} custom={2}>Advanced Security Command Center</Subtitle>
        </TitleWrapper>
        
        <InputGroup>
          <Input 
            variants={itemVariants} 
            custom={3} 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            autoComplete="username" 
          />
        </InputGroup>
        
        <InputGroup>
          <Input 
            variants={itemVariants} 
            custom={4} 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            autoComplete="current-password" 
          />
          <PasswordToggle
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </PasswordToggle>
        </InputGroup>
        
        <AnimatePresence>
          {authError && (
            <ErrorMessage key="error-message" variants={errorVariants} initial="hidden" animate="visible" exit="hidden">
              <AlertCircle size={16} /> {authError}
            </ErrorMessage>
          )}
        </AnimatePresence>
        
        <motion.div variants={itemVariants} custom={5}>
          <Button 
            type="submit" 
            style={{ marginTop: authError ? '0.5rem' : '1.5rem' }} 
            disabled={authStatus === 'loading'} 
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
          >
            {authStatus === 'loading' ? 'Accessing System...' : 'Access Command Center'}
          </Button>
        </motion.div>
        
        <ToggleText variants={itemVariants} custom={6}>
          New to the system? <Link to="/register">Request Access</Link>
        </ToggleText>
      </FormCard>
    </Container>
  );
};

export default LoginPage;
