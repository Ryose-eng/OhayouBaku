import React from 'react';
import styled from 'styled-components';

const Header = ({ title, onLogout }) => {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
      <LogoutButton onClick={onLogout}>
        ログアウト
      </LogoutButton>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  grid-area: header;
  background-color: #4aa3df; /* 鮮やかな水色 */
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const LogoutButton = styled.button`
  background-color: white;
  color: #4aa3df;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f0f8ff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export default Header;