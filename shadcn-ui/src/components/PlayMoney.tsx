interface PlayMoneyProps {
  amount: number;
  className?: string;
}

export default function PlayMoney({ amount, className = '' }: PlayMoneyProps) {
  return (
    <span className={className}>
      <span className="relative inline-block">
        <span className="absolute inset-0 translate-x-[0.15em]">$</span>
        <span className="relative">$</span>
      </span>
      {amount.toFixed(2)}
    </span>
  );
}