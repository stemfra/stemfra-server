// Server-owned facts; the agent selects a presentation, never authors plan rows.
function buildAiPlanResponse(context) {
  const number = value => value.toLocaleString('en-US');
  return {
    reply: 'Stemfra AI has three plans. Here is what each includes.',
    quick_replies: [],
    card: {
      kind: 'cta', layout: 'plan_comparison',
      rows: context.ai.plans.map(plan => ({
        label: plan.name,
        price: `$${number(plan.monthly_usd)}/month`,
        annual: `$${number(plan.annual_usd)}/year`,
        details: [`${plan.seats} seats`, `${number(plan.monthly_credits)} credits/month`],
      })),
      notes: [
        'Annual plans are paid upfront and include 12 months for the price of 10. Credits renew monthly.',
        'Prices exclude taxes. Contact our team to arrange a plan.',
      ],
      actions: [{ label: 'Contact our team', href: context.links.contact }],
    },
  };
}

module.exports = { buildAiPlanResponse };
