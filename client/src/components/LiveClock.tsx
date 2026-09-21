import { useState, useEffect } from 'react';

// ==========================================================================
// CANLI SAAT
//
// Eski kodda hem NexusHub hem NexusFinance kendi içlerinde saniyede bir
// setNow(new Date()) çağırıyordu. Bu, o dev bileşen ağaçlarının tamamını
// saniyede bir yeniden render ediyordu — sırf saat yazsın diye.
//
// Saat artık kendi yaprak bileşeninde. Tik attığında sadece bu <span>
// yeniden render oluyor.
// ==========================================================================

export function LiveClock({
  className,
  withSeconds = true,
}: {
  className?: string;
  withSeconds?: boolean;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const text = now.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' as const } : {}),
  });

  return <span className={className}>{text}</span>;
}

/** Bugünün tarihini gösterir; gece yarısı kendini tazeler. */
export function TodayLabel({
  className,
  monthNames,
}: {
  className?: string;
  monthNames: readonly string[];
}) {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    // Saniyede bir değil, dakikada bir kontrol etmek yeterli.
    const id = setInterval(() => {
      const d = new Date();
      setToday((prev) => (prev.getDate() === d.getDate() ? prev : d));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className}>
      {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
    </span>
  );
}
