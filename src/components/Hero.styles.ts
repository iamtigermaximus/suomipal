'use client';

import styled from 'styled-components';

export const HeroWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 96px 24px 64px;
  background-color: #FFFFFF;
  max-width: 800px;
  margin: 0 auto;
`;

export const Headline = styled.h1`
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 48px;
  line-height: 1.15;
  color: #1A1A1A;
  margin-bottom: 24px;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 640px) {
    font-size: 30px;
  }
`;

export const Subheadline = styled.p`
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 18px;
  line-height: 1.6;
  color: #4B5563;
  margin-bottom: 48px;
  max-width: 600px;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

export const StatsRow = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 48px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 15px;
  color: #4B5563;
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const CTAButton = styled.button`
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: #FFFFFF;
  background-color: #2C553C;
  border: none;
  border-radius: 8px;
  padding: 16px 40px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 24px;

  &:hover {
    background-color: #1E3D2A;
  }

  @media (max-width: 640px) {
    font-size: 16px;
    padding: 14px 32px;
    width: 100%;
  }
`;

export const TrustText = styled.p`
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #4B5563;
`;
