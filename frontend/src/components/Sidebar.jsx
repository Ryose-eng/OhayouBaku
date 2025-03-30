import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Sidebar = ({ user }) => {
  // ユーザー名の最初の文字を取得（アバター用）
  const userInitial = user?.name?.charAt(0) || '?';

  return (
    <SidebarContainer>
      <UserInfo>
        <Avatar>{userInitial}</Avatar>
        <UserName>{user?.name || 'ユーザー'}</UserName>
      </UserInfo>
      
      <NavMenu>
        <NavList>
          <NavItem>
            <NavLink to="/dashboard">ダッシュボード</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/posts">投稿一覧</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/profile">プロフィール</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/settings">設定</NavLink>
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

const NavLink = styled(Link)`
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