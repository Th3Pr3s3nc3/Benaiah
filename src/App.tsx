import { useState, useEffect, useCallback } from 'react';

// ==========================================
// CONFIGURATION
// ==========================================
const eventDate = new Date("November 7, 2026 12:00:00").getTime();
const mamaNumber = "256701029184";
const papaNumber = "256705817404";
const rsvpMessage = "Hello! We would love to attend the Christening and 1st Birthday celebration. God bless!";
const googleMapsLink = "https://maps.google.com/?q=Buziga+Hill+View+Kampala";

// ==========================================
// PETAL COMPONENT
// ==========================================
interface PetalData {
  id: number;
  size: number;
  startX: number;
  startY: number;
  tx: number;
  duration: number;
  color: string;
}

function Petals({ petals }: { petals: PetalData[] }) {
  return (
    <>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal"
          style={{
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            left: `${petal.startX}px`,
            top: `${petal.startY}px`,
            background: petal.color,
            '--tx': `${petal.tx}px`,
            animationDuration: `${petal.duration}s`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

// ==========================================
// COUNTDOWN COMPONENT
// ==========================================
function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const distance = eventDate - now;
      if (distance < 0) return;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex justify-center gap-4 mb-8">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hrs' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <span className="font-cormorant text-3xl" style={{ color: 'var(--gold-light)', lineHeight: 1 }}>
            {pad(item.value)}
          </span>
          <span
            className="text-[9px] tracking-[2px] mt-1 uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// ENVELOPE COMPONENT
// ==========================================
function Envelope({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <div
      className={`envelope-container flex flex-col items-center cursor-pointer ${isOpen ? 'envelope-hidden' : ''}`}
      onClick={onClick}
    >
      <div className={`envelope ${isOpen ? 'envelope-open' : ''}`}>
        <div className="wax-seal">✝</div>
      </div>
      <div
        className="mt-8 text-xs tracking-[3px] uppercase animate-pulse-hint"
        style={{ color: 'var(--gold)' }}
      >
        Tap to Open
      </div>
    </div>
  );
}

// ==========================================
// TIMELINE ITEM COMPONENT
// ==========================================
function TimelineItem({ title, time, detail }: { title: string; time: string; detail: string }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="font-great-vibes text-[28px] mb-1" style={{ color: 'var(--gold)' }}>
        {title}
      </div>
      <div className="text-xs leading-relaxed tracking-wide" style={{ color: 'var(--text-muted)' }}>
        <strong style={{ color: 'var(--text-light)', fontWeight: 500 }}>{time}</strong>
        <br />
        {detail}
      </div>
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const [petals, setPetals] = useState<PetalData[]>([]);

  const createPetals = useCallback(() => {
    const colors = ['rgba(255,255,255,0.9)', 'rgba(255,220,200,0.8)', 'rgba(212,175,55,0.7)'];
    const newPetals: PetalData[] = [];

    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 15 + 8;
      const startX = window.innerWidth / 2 + (Math.random() * 100 - 50);
      const startY = window.innerHeight / 2 + (Math.random() * 100 - 50);
      const tx = Math.random() * 500 - 250;
      const duration = Math.random() * 2 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      newPetals.push({ id: i, size, startX, startY, tx, duration, color });
    }

    setPetals(newPetals);

    // Clear petals after animation
    setTimeout(() => setPetals([]), 4000);
  }, []);

  const handleOpen = useCallback(() => {
    if (isOpen) return;
    setIsOpen(true);
    createPetals();

    setTimeout(() => {
      setShowApp(true);
    }, 800);
  }, [isOpen, createPetals]);

  const mamaRsvpUrl = `https://wa.me/${mamaNumber}?text=${encodeURIComponent(rsvpMessage)}`;
  const papaRsvpUrl = `https://wa.me/${papaNumber}?text=${encodeURIComponent(rsvpMessage)}`;

  return (
    <div className="min-h-screen flex justify-center items-center relative">
      {/* Petals */}
      <Petals petals={petals} />

      {/* Envelope */}
      {!showApp && (
        <div className="absolute z-10 flex justify-center items-center w-full h-full">
          <Envelope isOpen={isOpen} onClick={handleOpen} />
        </div>
      )}

      {/* Main Invitation */}
      <div className={`app-container ${showApp ? 'app-visible' : 'app-hidden'}`}>
        {/* Glow effects */}
        <div className="glow glow-tr" />
        <div className="glow glow-bl" />

        {/* Monogram */}
        <div
          className="font-cormorant text-sm tracking-[5px] border px-5 py-1.5 mb-6"
          style={{ color: 'var(--gold)', borderColor: 'rgba(212, 175, 55, 0.4)' }}
        >
          1ST ✝
        </div>

        {/* Sub header */}
        <div
          className="font-cormorant text-base italic tracking-wide mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Please join us to celebrate our beloved son's
        </div>

        {/* Event Title */}
        <h1
          className="font-cormorant text-[42px] leading-tight mb-1"
          style={{ color: 'var(--text-light)', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
        >
          Christening &<br />First Birthday
        </h1>

        {/* Divider */}
        <div className="divider" />

        {/* Scripture Box */}
        <div className="scripture-box mb-8">
          <div className="font-cormorant italic text-base leading-relaxed mb-2.5" style={{ color: 'var(--text-light)' }}>
            "I prayed for this child, and the Lord has granted me what I asked of him."
          </div>
          <div className="text-[10px] tracking-[2px] uppercase" style={{ color: 'var(--gold)' }}>
            — 1 Samuel 1:27
          </div>
        </div>

        {/* Countdown */}
        <Countdown />

        {/* Timeline */}
        <div
          className="w-full border-t border-b py-6 mb-8"
          style={{
            borderColor: 'rgba(212, 175, 55, 0.2)',
          }}
        >
          <TimelineItem title="Christening Ceremony" time="12:00 PM" detail="Blessing & Dedication" />
          <TimelineItem title="Lunch & Celebration" time="1:00 PM" detail="Fellowship & Feast" />
          <TimelineItem title="Cake & Fellowship" time="2:30 PM" detail="Cutting the Cake" />
        </div>

        {/* Venue */}
        <div className="mb-8">
          <div className="font-great-vibes text-2xl mb-2" style={{ color: 'var(--gold)' }}>
            Venue
          </div>
          <div className="text-sm leading-relaxed" style={{ color: 'var(--text-light)' }}>
            Parents Home<br />Buziga Hill View
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 mb-8">
          <a href={mamaRsvpUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            RSVP Mama
          </a>
          <a href={papaRsvpUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            RSVP Papa
          </a>
          <a href={googleMapsLink} className="btn" target="_blank" rel="noopener noreferrer">
            View Location Map
          </a>
        </div>

        {/* Footer */}
        <div className="font-great-vibes text-2xl mb-2.5" style={{ color: 'var(--gold)' }}>
          We can't wait to celebrate with you!
        </div>
        <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          KINDLY RSVP BY 30TH OCTOBER 2026
        </div>
      </div>
    </div>
  );
}
