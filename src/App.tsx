import { useState, useEffect, useCallback } from 'react';

const EVENT_DATE = new Date("November 7, 2026 12:00:00").getTime();
const MAMA_NUMBER = "256701029184";
const PAPA_NUMBER = "256705817404";
const RSVP_MESSAGE = "Hello! We would love to attend the Christening and 1st Birthday celebration. God bless!";
const MAPS_LINK = "https://maps.google.com/?q=Buziga+Hill+View+Kampala";

interface PetalData {
  id: number;
  size: number;
  startX: number;
  startY: number;
  duration: number;
  color: string;
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    function update() {
      const now = new Date().getTime();
      const distance = EVENT_DATE - now;
      if (distance < 0) return;
      const d = String(Math.floor(distance / 86400000)).padStart(2, '0');
      const h = String(Math.floor((distance % 86400000) / 3600000)).padStart(2, '0');
      const m = String(Math.floor((distance % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((distance % 60000) / 1000)).padStart(2, '0');
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="countdown">
      <div className="time-box"><span className="time-val">{timeLeft.days}</span><span className="time-label">Days</span></div>
      <div className="time-box"><span className="time-val">{timeLeft.hours}</span><span className="time-label">Hrs</span></div>
      <div className="time-box"><span className="time-val">{timeLeft.minutes}</span><span className="time-label">Min</span></div>
      <div className="time-box"><span className="time-val">{timeLeft.seconds}</span><span className="time-label">Sec</span></div>
    </div>
  );
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);
  const [petals, setPetals] = useState<PetalData[]>([]);

  const createPetals = useCallback(() => {
    const colors = ['rgba(255,255,255,0.9)', 'rgba(255,220,200,0.8)', 'rgba(212,175,55,0.7)'];
    const arr: PetalData[] = [];
    const w = window.innerWidth || 400;
    const h = window.innerHeight || 600;
    for (let i = 0; i < 50; i++) {
      arr.push({
        id: i,
        size: Math.random() * 15 + 8,
        startX: w / 2 + (Math.random() * 100 - 50),
        startY: h / 2 + (Math.random() * 100 - 50),
        duration: Math.random() * 2 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setPetals(arr);
    setTimeout(() => setPetals([]), 4500);
  }, []);

  const handleOpen = useCallback(() => {
    if (isOpen) return;
    setIsOpen(true);
    createPetals();
    setTimeout(() => setShowInvitation(true), 900);
  }, [isOpen, createPetals]);

  const mamaUrl = `https://wa.me/${MAMA_NUMBER}?text=${encodeURIComponent(RSVP_MESSAGE)}`;
  const papaUrl = `https://wa.me/${PAPA_NUMBER}?text=${encodeURIComponent(RSVP_MESSAGE)}`;

  return (
    <div className="page-root">
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.startX}px`,
            top: `${p.startY}px`,
            background: p.color,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {!showInvitation ? (
        <div className="envelope-screen">
          <div className="envelope-wrapper" onClick={handleOpen}>
            <div className={`envelope${isOpen ? ' open' : ''}`}>
              <div className="wax-seal">✝</div>
            </div>
            <div className="click-hint">Tap to Open</div>
          </div>
        </div>
      ) : (
        <div className="invitation">
          <div className="glow glow-tr"></div>
          <div className="glow glow-bl"></div>

          <div className="monogram">1ST ✝</div>
          <div className="sub-header">Please join us to celebrate our beloved son&apos;s</div>

          <h1 className="event-title">
            Christening &amp;<br />First Birthday
          </h1>

          <div className="divider"></div>

          <div className="scripture-box">
            <p className="scripture-text">
              &ldquo;I prayed for this child, and the Lord has granted me what I asked of him.&rdquo;
            </p>
            <span className="scripture-ref">— 1 Samuel 1:27</span>
          </div>

          <Countdown />

          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-title">Christening Ceremony</div>
              <div className="timeline-detail"><strong>12:00 PM</strong><br />Blessing &amp; Dedication</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-title">Lunch &amp; Celebration</div>
              <div className="timeline-detail"><strong>1:00 PM</strong><br />Fellowship &amp; Feast</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-title">Cake &amp; Fellowship</div>
              <div className="timeline-detail"><strong>2:30 PM</strong><br />Cutting the Cake</div>
            </div>
          </div>

          <div className="venue-section">
            <div className="venue-title">Venue</div>
            <div className="venue-detail">Parents Home<br />Buziga Hill View</div>
          </div>

          <div className="action-buttons">
            <a href={mamaUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">RSVP Mama</a>
            <a href={papaUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">RSVP Papa</a>
            <a href={MAPS_LINK} className="btn" target="_blank" rel="noopener noreferrer">View Location Map</a>
          </div>

          <div className="footer-note">We can&apos;t wait to celebrate with you!</div>
          <div className="footer-text">KINDLY RSVP BY 30TH OCTOBER 2026</div>
        </div>
      )}
    </div>
  );
}
