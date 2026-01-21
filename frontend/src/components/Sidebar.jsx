import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ user }) => {
  const { token, hasCareRecipient  } = useAuth();
  const navigate = useNavigate();
  const userInitial = user?.name?.charAt(0) || '?';

  const checkExistingChat = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.chatId) {
        return { chatId: data.chatId, status: data.status };
      }
      return { chatId: null, status: null };
    } catch (error) {
      console.error('チャット確認エラー:', error);
      return { chatId: null, status: null };
    }
  };

  const handleChatClick = async (e) => {
    e.preventDefault();
    const {chatId, status} = await checkExistingChat(); // chatIdを直接受け取る
    
    if (status === 'active' && chatId) {
      navigate(`/chat/${chatId}`);
    } else {
      navigate('/chat/create');
    }
  };

  return (
    <SidebarContainer>
      <UserInfo>
        <Avatar>{userInitial}</Avatar>
        <UserName>{user?.name || 'ユーザー'}</UserName>
      </UserInfo>
      
      <NavMenu>
        <NavList>
          <NavItem>
            <NavLink onClick={handleChatClick}>
              チャット
            </NavLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/dashboard">
              バイタル記録
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/calendar">
              カレンダー
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/posts">
              みんなの投稿
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/profile">
              プロフィール
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/settings">
              設定
            </StyledLink>
          </NavItem>
        </NavList>
      </NavMenu>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.aside`
  grid-area: sidebar;
  background-color: #2c3e50; /* 濃い色でコントラスト */
  color: white;
  padding: 20px;
  min-height: 100%;
`;

const UserInfo = styled.div`
  margin-bottom: 25px;
  text-align: center;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #4aa3df;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
`;

const UserName = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #b3e0ff;
`;

const NavMenu = styled.nav`
  margin-top: 25px;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 10px;
`;

const NavLink = styled.a`
  display: block;
  padding: 10px 15px;
  color: #b3e0ff;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: #34495e;
    color: white;
  }
`;

const StyledLink = styled(Link)`
  display: block;
  padding: 10px 15px;
  color: #b3e0ff;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #34495e;
    color: white;
  }
`;

export default Sidebar;