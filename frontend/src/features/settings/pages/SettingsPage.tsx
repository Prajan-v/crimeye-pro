import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { User, Settings as SettingsIcon, Camera, AlertTriangle, Save, Trash2, Plus, Edit2 } from 'react-feather';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 700;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled(motion.button)<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: none;
  border: none;
  color: ${({ active, theme }) => active ? theme.colors.accent.primary : theme.colors.text.secondary};
  font-weight: ${({ active }) => active ? 600 : 400};
  cursor: pointer;
  position: relative;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
  }
  
  ${({ active, theme }) => active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: ${theme.colors.accent.primary};
    }
  `}
`;

const TabContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const FormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ variant, theme }) => 
    variant === 'danger' ? theme.colors.status.error : 
    variant === 'primary' ? `linear-gradient(135deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})` :
    theme.colors.background.elevated};
  color: ${({ variant, theme }) => 
    variant ? theme.colors.background.primary : theme.colors.text.primary};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DangerZone = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.status.error}10;
`;

const CameraTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${({ theme }) => theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  th {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  td {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  background: ${({ status, theme }) => 
    status === 'online' ? theme.colors.status.success : theme.colors.status.error};
  color: ${({ theme }) => theme.colors.background.primary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.background.elevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.background.primary};
  }
`;

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'cameras' | 'danger'>('profile');
  const { register, handleSubmit } = useForm();
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System', icon: SettingsIcon },
    { id: 'cameras', label: 'Cameras', icon: Camera },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];
  
  const onSubmitProfile = async (data: any) => {
    try {
      await axios.post('http://localhost:8000/api/auth/update-credentials', data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };
  
  const onSubmitPassword = async (data: any) => {
    try {
      await axios.post('http://localhost:8000/api/auth/change-password', data);
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };
  
  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure? This will delete ALL detection history.')) return;
    if (!window.confirm('This action cannot be undone. Type YES to confirm.')) return;
    
    try {
      await axios.delete('http://localhost:8000/api/detections/clear-all');
      toast.success('Detection history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };
  
  const handleResetSystem = async () => {
    if (!window.confirm('DANGER: This will reset the entire system to factory defaults!')) return;
    if (!window.confirm('ALL DATA WILL BE LOST. Type YES to confirm.')) return;
    
    try {
      await axios.post('http://localhost:8000/api/system/reset');
      toast.success('System reset initiated');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      toast.error('Failed to reset system');
    }
  };
  
  return (
    <PageContainer>
      <Header>
        <Title>Settings</Title>
      </Header>
      
      <TabContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <tab.icon size={18} />
            {tab.label}
          </Tab>
        ))}
      </TabContainer>
      
      <AnimatePresence mode="wait">
        <TabContent
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <>
              <FormSection>
                <SectionTitle>Update Profile</SectionTitle>
                <form onSubmit={handleSubmit(onSubmitProfile)}>
                  <FormGroup>
                    <Label>Username</Label>
                    <Input {...register('username')} placeholder="CrimeEye" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input {...register('email')} type="email" placeholder="crimeeye935@gmail.com" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Phone</Label>
                    <Input {...register('phone')} placeholder="+91 7010132407" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Current Password (required for changes)</Label>
                    <Input {...register('current_password')} type="password" />
                  </FormGroup>
                  <Button type="submit" variant="primary">
                    <Save size={18} />
                    Save Changes
                  </Button>
                </form>
              </FormSection>
              
              <FormSection>
                <SectionTitle>Change Password</SectionTitle>
                <form onSubmit={handleSubmit(onSubmitPassword)}>
                  <FormGroup>
                    <Label>Current Password</Label>
                    <Input {...register('current_password')} type="password" />
                  </FormGroup>
                  <FormGroup>
                    <Label>New Password</Label>
                    <Input {...register('new_password')} type="password" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Confirm New Password</Label>
                    <Input {...register('confirm_password')} type="password" />
                  </FormGroup>
                  <Button type="submit" variant="primary">
                    <Save size={18} />
                    Change Password
                  </Button>
                </form>
              </FormSection>
            </>
          )}
          
          {activeTab === 'system' && (
            <>
              <FormSection>
                <SectionTitle>Frame Retention</SectionTitle>
                <FormGroup>
                  <Label>Retention Period (days)</Label>
                  <Select defaultValue="30">
                    <option value="7">7 days</option>
                    <option value="15">15 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Auto-Delete Old Frames</Label>
                  <Select defaultValue="enabled">
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </Select>
                </FormGroup>
              </FormSection>
              
              <FormSection>
                <SectionTitle>Notifications</SectionTitle>
                <FormGroup>
                  <Label>Alert Method</Label>
                  <Select defaultValue="both">
                    <option value="email">Email Only</option>
                    <option value="sms">SMS Only</option>
                    <option value="both">Email & SMS</option>
                    <option value="none">Disabled</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Minimum Threat Level for Alerts</Label>
                  <Select defaultValue="high">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormGroup>
              </FormSection>
              
              <Button variant="primary">
                <Save size={18} />
                Save System Settings
              </Button>
            </>
          )}
          
          {activeTab === 'cameras' && (
            <>
              <FormSection>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <SectionTitle>Camera Management</SectionTitle>
                  <Button variant="primary">
                    <Plus size={18} />
                    Add Camera
                  </Button>
                </div>
                
                <CameraTable>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Camera 1</td>
                      <td>Main Entrance</td>
                      <td><StatusBadge status="online">Online</StatusBadge></td>
                      <td>
                        <ActionButtons>
                          <IconButton><Edit2 size={16} /></IconButton>
                          <IconButton><Trash2 size={16} /></IconButton>
                        </ActionButtons>
                      </td>
                    </tr>
                  </tbody>
                </CameraTable>
              </FormSection>
            </>
          )}
          
          {activeTab === 'danger' && (
            <DangerZone>
              <SectionTitle style={{ color: '#EF4444' }}>⚠️ Danger Zone</SectionTitle>
              <p style={{ marginBottom: '1.5rem', color: '#a0a0a0' }}>
                These actions are irreversible. Please be careful.
              </p>
              
              <FormSection>
                <SectionTitle>Clear Detection History</SectionTitle>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
                  Delete all detection frames and logs from the database.
                </p>
                <Button variant="danger" onClick={handleClearHistory}>
                  <Trash2 size={18} />
                  Clear All Detection History
                </Button>
              </FormSection>
              
              <FormSection>
                <SectionTitle>Reset to Factory Defaults</SectionTitle>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#a0a0a0' }}>
                  Reset the entire system to factory defaults. This will delete all data and settings.
                </p>
                <Button variant="danger" onClick={handleResetSystem}>
                  <AlertTriangle size={18} />
                  Reset System to Factory Defaults
                </Button>
              </FormSection>
            </DangerZone>
          )}
        </TabContent>
      </AnimatePresence>
    </PageContainer>
  );
};

export default SettingsPage;

