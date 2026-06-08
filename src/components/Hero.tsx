'use client';

import {
  HeroWrapper,
  Headline,
  Subheadline,
  StatsRow,
  StatItem,
  CTAButton,
  TrustText,
} from './Hero.styles';

interface HeroProps {
  onStartChat?: () => void;
}

export default function Hero({ onStartChat }: HeroProps) {
  return (
    <HeroWrapper>
      <Headline>
        SuomiPal &mdash; Bilingual support for Finnish businesses
      </Headline>
      <Subheadline>
        Your customers speak Finnish, Swedish, or English. So does our AI.
      </Subheadline>
      <StatsRow>
        <StatItem>&#9889; Answers in 2 seconds</StatItem>
        <StatItem>&#128200; 99% uptime</StatItem>
        <StatItem>&#128176; &euro;0.02 per conversation</StatItem>
      </StatsRow>
      <CTAButton onClick={onStartChat}>
        Start free trial &rarr;
      </CTAButton>
      <TrustText>
        Trusted by 50+ Finnish small businesses
      </TrustText>
    </HeroWrapper>
  );
}
