'use client';

import styled from 'styled-components';

export const FooterWrapper = styled.footer`
  background-color: #F8F9FA;
  border-top: 1px solid #E5E7EB;
  padding: 64px 24px 48px;
`;

export const FooterInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

export const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const PricingCard = styled.div<{ $featured?: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  border: 1px solid ${({ $featured }) => ($featured ? '#2C553C' : '#E5E7EB')};
  border-radius: 12px;
  padding: 32px;
  position: relative;
`;

export const PlanName = styled.h3`
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #1A1A1A;
  margin-bottom: 8px;
`;

export const PlanPrice = styled.div`
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 32px;
  color: #1A1A1A;
  margin-bottom: 16px;
`;

export const PlanPricePeriod = styled.span`
  font-weight: 400;
  font-size: 16px;
  color: #4B5563;
`;

export const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  flex: 1;
`;

export const PlanFeature = styled.li`
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #4B5563;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PlanCTA = styled.button<{ $featured?: boolean }>`
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: ${({ $featured }) => ($featured ? '#FFFFFF' : '#2C553C')};
  background-color: ${({ $featured }) => ($featured ? '#2C553C' : 'transparent')};
  border: 2px solid #2C553C;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ $featured }) => ($featured ? '#1E3D2A' : '#2C553C')};
    color: #FFFFFF;
  }
`;

export const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32px;
  border-top: 1px solid #E5E7EB;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
`;

export const FooterBrand = styled.span`
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: #1A1A1A;
`;

export const FooterCopyright = styled.span`
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #4B5563;
`;
