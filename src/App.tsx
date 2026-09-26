import { useState, useEffect, useCallback, type CSSProperties } from 'react';

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
          } as CSSProperties}
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
    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hrs' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
      ].map((item) => (
        <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="font-cormorant" style={{ fontSize: '32px', color: 'var(--gold-light)', lineHeight: 1 }}>
            {pad(item.value)}
          </span>
          <span style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--text-muted)', marginTop: '5px', textTransform: 'uppercase' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// TIMELINE ITEM COMPONENT
// ==========================================
function TimelineItem({ title, time, detail }: { title: string; time: string; detail: string }) {
  return (
    <div className="timeline-item">
      <div className="font-great-vibes" style={{ fontSize: '28px', color: 'var(--gold)', marginBottom: '5px' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, letterSpacing: '0.5px' }}>
        <strong style={{ color: 'var(--text-light)', fontWeight: 500 }}>{time}</strong>
        <br />
        {detail}
      </div>
    </div>
  );
}

// ==========================================
// ENVELOPE COMPONENT
// ==========================================
function Envelope({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <div className="envelope-wrapper" onClick={onClick}>
      <div className={`envelope ${isOpen ? 'open' : ''}`}>
        <div className="wax-seal">✝</div>
      </div>
      <div className="click-hint">Tap to Open</div>
    </div>
  );
}

// ==========================================
// INVITATION COMPONENT
// ==========================================
function Invitation() {
  const mamaRsvpUrl = `https://wa.me/${mamaNumber}?text=${encodeURIComponent(rsvpMessage)}`;
  const papaRsvpUrl = `https://wa.me/${papaNumber}?text=${encodeURIComponent(rsvpMessage)}`;

  return (
    <div className="app-container visible">
      {/* Glow effects */}
      <div className="glow glow-tr" />
      <div className="glow glow-bl" />

      {/* Monogram */}
      <div
        className="font-cormorant"
        style={{
          fontSize: '14px',
          letterSpacing: '5px',
          color: 'var(--gold)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          padding: '6px 18px',
          marginBottom: '25px',
        }}
      >
        1ST ✝
      </div>

      {/* Sub header */}
      <div
        className="font-cormorant"
        style={{
          fontSize: '16px',
          fontStyle: 'italic',
          letterSpacing: '1px',
          color: 'var(--text-muted)',
          marginBottom: '15px',
        }}
      >
        Please join us to celebrate our beloved son's
      </div>

      {/* Event Title */}
      <h1
        className="font-cormorant"
        style={{
          fontSize: '42px',
          color: 'var(--text-light)',
          lineHeight: 1.1,
          marginBottom: '5px',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}
      >
        Christening &<br />First Birthday
      </h1>

      {/* Divider */}
      <div className="divider" />

      {/* Scripture Box */}
      <div className="scripture-box">
        <div
          className="font-cormorant"
          style={{
            fontStyle: 'italic',
            fontSize: '16px',
            color: 'var(--text-light)',
            lineHeight: 1.5,
            marginBottom: '10px',
          }}
        >
          "I prayed for this child, and the Lord has granted me what I asked of him."
        </div>
        <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase' }}>
          — 1 Samuel 1:27
        </div>
      </div>

      {/* Countdown */}
      <Countdown />

      {/* Timeline */}
      <div className="timeline">
        <TimelineItem title="Christening Ceremony" time="12:00 PM" detail="Blessing & Dedication" />
        <TimelineItem title="Lunch & Celebration" time="1:00 PM" detail="Fellowship & Feast" />
        <TimelineItem title="Cake & Fellowship" time="2:30 PM" detail="Cutting the Cake" />
      </div>

      {/* Venue */}
      <div style={{ marginBottom: '30px' }}>
        <div className="font-great-vibes" style={{ fontSize: '24px', color: 'var(--gold)', marginBottom: '8px' }}>
          Venue
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: 1.6 }}>
          Parents Home<br />Buziga Hill View
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
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
      <div className="font-great-vibes" style={{ fontSize: '24px', color: 'var(--gold)', marginBottom: '10px' }}>
        We can't wait to celebrate with you!
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        KINDLY RSVP BY 30TH OCTOBER 2026
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

  return (
    <>
      {/* Petals */}
      <Petals petals={petals} />

      {/* Show envelope or invitation */}
      {!showApp ? (
        <div className="main-wrapper">
          <Envelope isOpen={isOpen} onClick={handleOpen} />
        </div>
      ) : (
        <Invitation />
      )}
    </>
  );
}
