# MumMoney -- Hackathon Submission Proposal

**Financial Independence for Busy Mums**

Built with RevenueCat SDK | Mobile App (iOS & Android)

---

## 1. The Problem

Millions of mothers across the UK and beyond are caught between rising household costs and a lack of accessible, relevant financial tools. The cost of living crisis has hit families disproportionately hard -- grocery prices have risen over 25% since 2021, energy bills have more than doubled in many regions, and childcare costs continue to climb. Yet the people managing these household budgets day-to-day -- predominantly mums -- are routinely underserved by existing financial technology.

The core issues are clear:

- **Time poverty.** New mums, stay-at-home mums, and part-time workers have fragmented schedules. Traditional finance apps assume long, uninterrupted engagement sessions that simply do not fit their reality.
- **Exclusion from financial education.** Investing platforms and personal finance content overwhelmingly target young professionals or high earners. Mothers re-entering the workforce, on maternity leave, or managing a household on a single income rarely see themselves represented.
- **Generic tooling.** Existing budgeting apps are not designed for the specific patterns of family spending -- school costs, bulk grocery shopping, childcare, nappies, and the constant trade-offs that come with raising children.
- **Fragmented solutions.** A mum trying to save money today must use one app for budgets, another for meal planning, a separate blog for product swaps, and has no guided path toward building long-term wealth. No single product unifies these needs.

MumMoney exists to close that gap.

---

## 2. Target Audience

**Primary market:** Mothers aged 25-45 in the United Kingdom.

**Expandable to:** United States, Australia, Ireland, and Canada -- English-speaking markets with similar cost-of-living pressures and smartphone penetration.

**Demographic segments:**

| Segment | Description |
|---|---|
| Stay-at-home mums | Managing household on a partner's income; high sensitivity to everyday savings |
| Part-time workers | Balancing work and childcare; looking to maximise limited earnings |
| Full-time working mums | Time-poor; need efficient tools that integrate into busy routines |
| Freelance / self-employed | Irregular income; need flexible budgeting and savings strategies |
| Mums on maternity leave | Temporary income reduction; planning for return to work or career change |

**Family sizes:** Single-parent households through to large families (5+ members).

**Income bracket:** Lower to middle income -- households actively seeking to stretch their budget further rather than those with surplus disposable income.

The UK alone has over 10 million mothers. Even capturing a fraction of this market represents a meaningful user base.

---

## 3. The Solution -- MumMoney

MumMoney is a mobile application built around four interconnected pillars, each designed to be usable in under five minutes at a time.

### Smart Swaps

A curated database of cheaper alternatives for 50+ everyday household products -- from nappies and cleaning supplies to toiletries and pantry staples. Each swap shows the estimated annual saving, making the value immediately tangible. Users can filter by category, brand preference, and store availability.

### Budget Meals

Batch cooking recipes starting from as little as 1 pound per serving. Recipes are designed for families, with scalable portions, common ingredients, and freezer-friendly options. Meal plans reduce food waste and eliminate the daily cognitive load of deciding what to cook.

### Learn to Invest

Bite-sized, jargon-free investing lessons structured as a progressive curriculum. Topics range from understanding ISAs and pensions to the basics of index funds and compound interest. Each lesson is designed to be completed in 3-5 minutes -- during a school run wait, a nap time window, or a lunch break.

### Penny AI Coach

A personalised financial guidance assistant powered by AI. Penny answers questions in plain language, suggests savings strategies based on the user's situation, and provides encouragement through streaks and milestones. The AI coach adapts to the user's family size, income level, and financial goals.

### Savings Tracking

Goal-based savings with visual progress indicators, streak tracking, and milestone celebrations. Users set targets (emergency fund, holiday, Christmas budget) and track their progress through small, consistent actions.

---

## 4. Monetization Strategy -- RevenueCat Integration

MumMoney follows a freemium model with a generous free tier to maximise adoption and a compelling premium offering to drive subscription revenue. RevenueCat SDK manages the entire subscription lifecycle.

### Free Tier

- 10 Smart Swaps per category
- 5 Budget Meal recipes per week
- 3 introductory investing lessons
- Limited Penny AI Coach interactions (3 per day)
- Basic savings tracker (1 goal)

### Premium Subscription

| Plan | Price | Effective Monthly Cost |
|---|---|---|
| Monthly | 4.99 per month | 4.99 |
| Annual | 39.99 per year | 3.33 |

Both plans include a 7-day free trial to reduce friction and allow users to experience the full product before committing.

### Premium Unlocks

- Unlimited Penny AI Coach conversations
- Full recipe library with meal planning tools
- Complete investing lesson curriculum
- Investment simulators and calculators
- Unlimited savings goals with family collaboration
- Priority support

### RevenueCat Implementation

- **Entitlement:** A single "premium" entitlement gates all paid features.
- **Packages:** Monthly and annual offerings within a single subscription group.
- **Receipt validation:** Server-side validation handled by RevenueCat across both iOS and Android.
- **Cross-platform entitlements:** A user who subscribes on iPhone retains access if they switch to Android.
- **Analytics:** RevenueCat dashboards provide real-time MRR, churn, trial conversion, and cohort analysis.
- **Paywall experimentation:** A/B testing of paywall designs and trial durations to optimise conversion.

### Conversion Target

Industry benchmarks for freemium utility apps show 2-7% conversion rates. Given the specificity of MumMoney's audience and the tangible daily value of premium features, the target is a 5-10% conversion rate from free to paid users.

---

## 5. Market Opportunity

**Addressable market.** The UK has over 10 million mothers. Family-focused fintech remains a largely untapped vertical -- most financial apps target individuals, not households.

**Subscription economy growth.** In-app subscription revenue in the utilities and lifestyle categories has grown at 15%+ year over year, with consumers increasingly willing to pay for tools that deliver measurable value.

**Competitive landscape.** No existing product combines all four pillars of MumMoney's offering:

| Competitor Type | Swaps | Meals | Investing Education | AI Coach |
|---|---|---|---|---|
| Budgeting apps (e.g., Emma, Plum) | No | No | Limited | No |
| Meal planning apps (e.g., Mealime) | No | Yes | No | No |
| Investing apps (e.g., Moneybox) | No | No | Yes | No |
| MumMoney | Yes | Yes | Yes | Yes |

This combination creates a defensible position: users who engage with multiple pillars have significantly higher retention and lifetime value.

---

## 6. Revenue Projections

| Metric | Year 1 Target |
|---|---|
| Total registered users | 10,000 |
| Premium subscribers | 500 - 1,000 |
| Monthly recurring revenue (MRR) | 2,500 - 5,000 |
| Annual revenue | 30,000 - 60,000 |

These projections assume organic growth through social media (parenting communities on Instagram, TikTok, and Facebook groups), word-of-mouth referrals, and targeted content marketing. Paid acquisition is not required to reach Year 1 targets but would accelerate growth if funding permits.

As the user base scales and the product expands to additional English-speaking markets, MRR targets increase proportionally. A 50,000-user base with 8% conversion at the annual price point would yield approximately 160,000 in annual recurring revenue.

---

## Summary

MumMoney addresses a real, underserved need with a focused product that combines daily utility (savings, meals) with long-term value (investing education, AI coaching). The RevenueCat-powered subscription model aligns monetization with user value -- users pay only when the product delivers enough benefit to justify a modest monthly cost. The market is large, the competition is fragmented, and the timing is right.

---

*MumMoney -- Because every mum deserves financial confidence.*
