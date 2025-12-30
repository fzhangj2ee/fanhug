interface PlayMoneyProps {
  amount: number;
  className?: string;
}

export default function PlayMoney({ amount, className = '' }: PlayMoneyProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="relative inline-block">
        <span className="relative">
          $
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-[2px] h-full bg-current absolute left-[40%]"></span>
            <span className="w-[2px] h-full bg-current absolute left-[60%]"></span>
          </span>
        </span>
      </span>
      {amount.toFixed(2)}
    </span>
  );
}