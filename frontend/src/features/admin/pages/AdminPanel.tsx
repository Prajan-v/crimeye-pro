import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Users, CheckCircle, XCircle, Clock, Mail } from 'react-feather';
import { toast } from 'react-hot-toast';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #d4d4d4;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.glass};
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ color }) => color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  color: ${({ color }) => color};
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const PendingUsersList = styled.div`
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.glass};
`;

const UserCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: 600;
  font-size: 1.125rem;
`;

const UserDetails = styled.div`
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 4px;
  }
  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 4px;
  }
  span {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled(motion.button)<{ variant: 'approve' | 'reject' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all ${({ theme }) => theme.transitions.base};
  
  ${({ variant, theme }) => variant === 'approve' ? `
    background: ${theme.colors.status.success};
    color: white;
    &:hover {
      background: ${theme.colors.status.success}dd;
      transform: translateY(-2px);
    }
  ` : `
    background: ${theme.colors.status.error};
    color: white;
    &:hover {
      background: ${theme.colors.status.error}dd;
      transform: translateY(-2px);
    }
  `}
`;

interface PendingUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const users = await response.json();
        setPendingUsers(users);
      } else {
        toast.error('Failed to fetch pending users');
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Error fetching pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/approve/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast.success('User approved successfully');
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
      } else {
        toast.error('Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Error approving user');
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (!confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/reject/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast.success('User rejected and removed');
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
      } else {
        toast.error('Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Error rejecting user');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container>
      <Header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Admin Panel</Title>
        <Subtitle>Manage user registrations and system access</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon color="#F59E0B">
            <Clock size={24} />
          </StatIcon>
          <StatNumber>{pendingUsers.length}</StatNumber>
          <StatLabel>Pending Approvals</StatLabel>
        </StatCard>

        <StatCard
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon color="#10B981">
            <Users size={24} />
          </StatIcon>
          <StatNumber>0</StatNumber>
          <StatLabel>Total Users</StatLabel>
        </StatCard>

        <StatCard
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon color="#3B82F6">
            <Mail size={24} />
          </StatIcon>
          <StatNumber>0</StatNumber>
          <StatLabel>Notifications</StatLabel>
        </StatCard>
      </StatsGrid>

      <PendingUsersList
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          color: '#ffffff', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Clock size={24} color="#F59E0B" />
          Pending User Approvals
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#d4d4d4' }}>
            Loading pending users...
          </div>
        ) : pendingUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#d4d4d4' }}>
            No pending user approvals
          </div>
        ) : (
          pendingUsers.map((user, index) => (
            <UserCard
              key={user.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <UserInfo>
                <UserAvatar>
                  {user.username.charAt(0).toUpperCase()}
                </UserAvatar>
                <UserDetails>
                  <h3>{user.username}</h3>
                  <p>{user.email}</p>
                  <span>Registered: {formatDate(user.created_at)}</span>
                </UserDetails>
              </UserInfo>
              <ActionButtons>
                <ActionButton
                  variant="approve"
                  onClick={() => handleApproveUser(user.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckCircle size={16} />
                  Approve
                </ActionButton>
                <ActionButton
                  variant="reject"
                  onClick={() => handleRejectUser(user.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <XCircle size={16} />
                  Reject
                </ActionButton>
              </ActionButtons>
            </UserCard>
          ))
        )}
      </PendingUsersList>
    </Container>
  );
};

export default AdminPanel;
