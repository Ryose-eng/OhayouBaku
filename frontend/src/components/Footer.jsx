import React from 'react';
import styled from 'styled-components';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <p>© {currentYear} 投稿アプリ All Rights Reserved.</p>
      <FooterNav>
        <FooterLink href="/terms">利用規約</FooterLink>
        <FooterLink href="/privacy">プライバシーポリシー</FooterLink>
        <FooterLink href="/contact">お問い合わせ</FooterLink>
      </FooterNav>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  grid-area: footer;
  background-color: #2c3e50;
  color: #b3e0ff;
  padding: 15px 20px;
  text-align: center;
  font-size: 0.9rem;
`;

const FooterNav = styled.nav`
  margin-top: 10px;
`;

const FooterLink = styled.a`
  color: #4aa3df;
  margin: 0 10px;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default Footer;