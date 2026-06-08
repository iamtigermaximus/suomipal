'use client';

import {
  FooterWrapper,
  FooterInner,
  PricingGrid,
  PricingCard,
  PlanName,
  PlanPrice,
  PlanPricePeriod,
  PlanFeatures,
  PlanFeature,
  PlanCTA,
  FooterBottom,
  FooterBrand,
  FooterCopyright,
} from './Footer.styles';

const plans = [
  {
    name: 'Free',
    price: '€0',
    period: '',
    features: ['100 conversations/month', 'Finnish & English', 'Basic AI support', 'Email responses'],
  },
  {
    name: 'Pro',
    price: '€29',
    period: '/mo',
    features: ['5,000 conversations/month', 'Finnish, Swedish & English', 'Priority AI support', 'Live chat widget', 'Analytics dashboard'],
    featured: true,
  },
  {
    name: 'Business',
    price: '€99',
    period: '/mo',
    features: ['Unlimited conversations', 'All three languages', 'Dedicated support', 'Custom integration', 'Team accounts', 'SLA guarantee'],
  },
];

export default function Footer() {
  return (
    <FooterWrapper>
      <FooterInner>
        <PricingGrid>
          {plans.map((plan) => (
            <PricingCard key={plan.name} $featured={plan.featured}>
              <PlanName>{plan.name}</PlanName>
              <PlanPrice>
                {plan.price}
                {plan.period && <PlanPricePeriod>{plan.period}</PlanPricePeriod>}
              </PlanPrice>
              <PlanFeatures>
                {plan.features.map((feature) => (
                  <PlanFeature key={feature}>&#10003; {feature}</PlanFeature>
                ))}
              </PlanFeatures>
              <PlanCTA $featured={plan.featured}>
                {plan.name === 'Free' ? 'Get started' : 'Subscribe'}
              </PlanCTA>
            </PricingCard>
          ))}
        </PricingGrid>
        <FooterBottom>
          <FooterBrand>SuomiPal</FooterBrand>
          <FooterCopyright>
            &copy; {new Date().getFullYear()} SuomiPal. All rights reserved.
          </FooterCopyright>
        </FooterBottom>
      </FooterInner>
    </FooterWrapper>
  );
}
