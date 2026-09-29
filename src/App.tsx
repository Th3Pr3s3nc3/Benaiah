import { useState, type CSSProperties } from 'react';
import { DoorOpen, Gift, MessageCircle, Mic2, Navigation, PartyPopper, Phone, Sparkles, Utensils } from 'lucide-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CreatePage from './CreatePage';

interface PetalData {
  id: number;
  size: number;
  startX: number;
  startY: number;
  duration: number;
  driftX: number;
  spin: number;
  color: string;
}

const scheduleItems = [
  { time: '12:00 PM', name: 'Arrival of Guests', Icon: DoorOpen },
  { time: '1:00 PM', name: 'Lunch and fellowship', Icon: Utensils },
  { time: '2:00 PM', name: 'Games and entertainment', Icon: PartyPopper },
  { time: '2:30 PM', name: 'Speeches and well wishes', Icon: Mic2 },
  { time: '3:00 PM', name: 'Cake cutting and Gifting', Icon: Gift },
  { time: '4:00 PM', name: 'A.O.B & closing remarks', Icon: Sparkles },
];

function PetalLayer({ petals }: { petals: PetalData[] }) {
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
            animationDuration: `${petal.duration}s`,
            '--drift-x': `${petal.driftX}vw`,
            '--spin': `${petal.spin}deg`,
          } as CSSProperties}
        />
      ))}
    </>
  );
}

function InvitationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);
  const [petals, setPetals] = useState<PetalData[]>([]);
  const guestName = new URLSearchParams(window.location.search).get('guest')?.trim();

  const createPetals = () => {
    const colors = ['rgba(151, 194, 222, 0.92)', 'rgba(220, 237, 247, 0.96)', 'rgba(125, 171, 204, 0.9)', 'rgba(177, 207, 226, 0.94)'];
    const arr: PetalData[] = [];
    const w = typeof window !== 'undefined' ? window.innerWidth : 400;
    const h = typeof window !== 'undefined' ? window.innerHeight : 600;
    const centerX = w / 2;
    const centerBand = Math.min(w * 0.52, 240);

    for (let i = 0; i < 90; i++) {
      const size = Math.random() * 16 + 10;
      const xOffset = (Math.random() - 0.5) * centerBand;
      arr.push({
        id: i,
        size,
        startX: centerX + xOffset,
        startY: -20 - Math.random() * h * 0.15,
        duration: Math.random() * 2.2 + 2.6,
        driftX: (Math.random() * 40 - 20),
        spin: Math.random() * 720 - 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setPetals(arr);
    setTimeout(() => setPetals([]), 6000);
  };

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    createPetals();
    setTimeout(() => setShowInvitation(true), 300);
  };

  return (
    <>
      <PetalLayer petals={petals} />
      <div className={`invitation-wrapper${showInvitation ? ' visible' : ''}`}>
        <div className="invitation">
          <div className="invitee-line">
            <span>Dear</span>
            {guestName
              ? <span className="invitee-name">{guestName}</span>
              : <span className="invitee-name-space" aria-label="Space for invitee name" />}
          </div>
          <div className="sub-header">Please join us to celebrate our beloved son's</div>
          <h1 className="event-title">Christening &<br />First Birthday</h1>
          <div className="divider"></div>
          <div className="scripture-box">
            <p className="scripture-text">"I prayed for this child, and the Lord has granted me what I asked of him."</p>
            <span className="scripture-ref">— 1 Samuel 1:27</span>
          </div>
          <section className="timeline" aria-label="Event schedule">
            {scheduleItems.map(({ time, name, Icon }) => (
              <div className="timeline-item" key={time}>
                <time className="timeline-time">{time}</time>
                <span className="timeline-icon"><Icon size={18} strokeWidth={2} aria-hidden="true" /></span>
                <span className="timeline-name">{name}</span>
              </div>
            ))}
          </section>
          <div className="venue-section">
            <div className="venue-title">Venue</div>
            <div className="venue-detail">Parents Home<br />Buziga Hill View</div>
          </div>
          <div className="location-section">
            <div className="map-preview">
              <iframe
                src="https://maps.google.com/maps?q=0.262281,32.610474&z=16&output=embed"
                title="Map showing Buziga Hill View"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a href="https://maps.app.goo.gl/LEXohxhiMLd8tKtx6" className="btn location-button" target="_blank" rel="noopener noreferrer"><Navigation size={18} aria-hidden="true" /><span>Get Directions</span></a>
          </div>
          <div className="action-buttons">
            <div className="contact-row">
              <a href="tel:+256701029184" className="btn btn-call"><Phone size={18} aria-hidden="true" /><span className="call-copy"><span>Call Mama</span><span className="rsvp-number">+256 701 029 184</span></span></a>
              <a href="https://wa.me/256701029184?text=Hello!%20We%20would%20love%20to%20attend%20the%20Christening%20and%201st%20Birthday%20celebration.%20God%20bless!" className="whatsapp-icon-button" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Mama" title="WhatsApp Mama"><MessageCircle size={21} aria-hidden="true" /></a>
            </div>
            <div className="contact-row">
              <a href="tel:+256705817404" className="btn btn-call"><Phone size={18} aria-hidden="true" /><span className="call-copy"><span>Call Papa</span><span className="rsvp-number">+256 705 817 404</span></span></a>
              <a href="https://wa.me/256705817404?text=Hello!%20We%20would%20love%20to%20attend%20the%20Christening%20and%201st%20Birthday%20celebration.%20God%20bless!" className="whatsapp-icon-button" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Papa" title="WhatsApp Papa"><MessageCircle size={21} aria-hidden="true" /></a>
            </div>
          </div>
          <div className="footer-note">We can't wait to celebrate with you!</div>
          <div className="footer-text">KINDLY RSVP BY 30TH OCTOBER 2026</div>
        </div>
      </div>

      <div className={`envelope-screen${isOpen ? ' opening' : ''}`}>
        <button className="envelope-wrapper" onClick={handleOpen} type="button" aria-label="Open invitation" disabled={isOpen}>
          <div className={`envelope${isOpen ? ' open' : ''}`}>
            <div className="wax-seal"><span className="wax-heart" aria-hidden="true">♥</span></div>
          </div>
          {!isOpen && <div className="click-hint">Tap to Open</div>}
        </button>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InvitationPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
