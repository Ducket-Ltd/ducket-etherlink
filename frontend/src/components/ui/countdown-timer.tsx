import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  className?: string;
  showSeconds?: boolean;
}

export function CountdownTimer({
  expiresAt,
  onExpire,
  className,
  showSeconds = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiryTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const difference = expiryTime - now;

      if (difference <= 0) {
        return { minutes: 0, seconds: 0, expired: true };
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { minutes, seconds, expired: false };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.expired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (timeLeft.expired) {
    return (
      <span className={cn('text-destructive font-medium', className)}>
        Expired
      </span>
    );
  }

  const formattedMinutes = String(timeLeft.minutes).padStart(2, '0');
  const formattedSeconds = String(timeLeft.seconds).padStart(2, '0');

  // Change color based on urgency
  const isUrgent = timeLeft.minutes < 2;
  const isWarning = timeLeft.minutes < 5 && !isUrgent;

  return (
    <span
      className={cn(
        'font-mono font-medium',
        isUrgent && 'text-destructive',
        isWarning && 'text-warning',
        !isUrgent && !isWarning && 'text-foreground',
        className
      )}
    >
      {showSeconds
        ? `${formattedMinutes}:${formattedSeconds}`
        : `${timeLeft.minutes}m`}
    </span>
  );
}

export default CountdownTimer;
