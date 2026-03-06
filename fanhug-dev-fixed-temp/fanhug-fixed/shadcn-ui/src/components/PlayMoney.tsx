interface PlayMoneyProps {
  amount: number;
  className?: string;
}

export default function PlayMoney({ amount, className = '' }: PlayMoneyProps) {
  // Format number with commas (e.g., 10000 -> 10,000)
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span className={className}>
      <span className="relative inline-block">
        <span className="absolute inset-0 translate-x-[0.15em]">$</span>
        <span className="relative">$</span>
      </span>
      {' '}
      {formattedAmount}
    </span>
  );
}