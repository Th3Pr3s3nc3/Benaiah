import { useState, type CSSProperties } from 'react';
import { MessageCircle, Navigation, Phone } from 'lucide-react';

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

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);
  const [petals, setPetals] = useState<PetalData[]>([]);

  const createPetals = () => {
    const colors = ['rgba(255,255,255,0.9)', 'rgba(255,220,200,0.8)', 'rgba(212,175,55,0.7)'];
    const arr: PetalData[] = [];
    const w = typeof window !== 'undefined' ? window.innerWidth : 400;
    const h = typeof window !== 'undefined' ? window.innerHeight : 600;
    for (let i = 0; i < 50; i++) {
      arr.push({
        id: i,
        size: Math.random() * 15 + 8,
        startX: w / 2 + (Math.random() * 100 - 50),
        startY: h * 0.42 + (Math.random() * 80 - 40),
        duration: Math.random() * 2.5 + 3,
        driftX: Math.random() * 90 - 45,
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
    setTimeout(() => setShowInvitation(true), 900);
  };

  if (!showInvitation) {
    return (
      <>
        <PetalLayer petals={petals} />
        <div className="envelope-screen">
          <button className="envelope-wrapper" onClick={handleOpen} type="button" aria-label="Open invitation">
            <div className={`envelope${isOpen ? ' open' : ''}`}>
              <div className="wax-seal">✝</div>
            </div>
            <div className="click-hint">Tap to Open</div>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PetalLayer petals={petals} />
      <div className="invitation">
      <div className="monogram">1ST ✝</div>
      <div className="sub-header">Please join us to celebrate our beloved son's</div>
      <h1 className="event-title">Christening &<br />First Birthday</h1>
      <div className="divider"></div>
      <div className="scripture-box">
        <p className="scripture-text">"I prayed for this child, and the Lord has granted me what I asked of him."</p>
        <span className="scripture-ref">— 1 Samuel 1:27</span>
      </div>
      <div className="timeline">
        <div className="timeline-item">
          <div className="timeline-title">Christening Ceremony</div>
          <div className="timeline-detail"><strong>12:00 PM</strong><br />Blessing & Dedication</div>
        </div>
        <div className="timeline-item">
          <div className="timeline-title">Lunch & Celebration</div>
          <div className="timeline-detail"><strong>1:00 PM</strong><br />Fellowship & Feast</div>
        </div>
        <div className="timeline-item">
          <div className="timeline-title">Cake & Fellowship</div>
          <div className="timeline-detail"><strong>2:30 PM</strong><br />Cutting the Cake</div>
        </div>
      </div>
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
        <div className="contact-group">
          <a href="https://wa.me/256701029184?text=Hello!%20We%20would%20love%20to%20attend%20the%20Christening%20and%201st%20Birthday%20celebration.%20God%20bless!" className="btn btn-primary btn-contact" target="_blank" rel="noopener noreferrer"><span className="contact-label"><MessageCircle size={18} aria-hidden="true" />WhatsApp Mama</span><span className="rsvp-number">+256 701 029 184</span></a>
          <a href="tel:+256701029184" className="btn btn-contact"><span className="contact-label"><Phone size={18} aria-hidden="true" />Call Mama</span><span className="rsvp-number">+256 701 029 184</span></a>
        </div>
        <div className="contact-group">
          <a href="https://wa.me/256705817404?text=Hello!%20We%20would%20love%20to%20attend%20the%20Christening%20and%201st%20Birthday%20celebration.%20God%20bless!" className="btn btn-primary btn-contact" target="_blank" rel="noopener noreferrer"><span className="contact-label"><MessageCircle size={18} aria-hidden="true" />WhatsApp Papa</span><span className="rsvp-number">+256 705 817 404</span></a>
          <a href="tel:+256705817404" className="btn btn-contact"><span className="contact-label"><Phone size={18} aria-hidden="true" />Call Papa</span><span className="rsvp-number">+256 705 817 404</span></a>
        </div>
      </div>
      <div className="footer-note">We can't wait to celebrate with you!</div>
      <div className="footer-text">KINDLY RSVP BY 30TH OCTOBER 2026</div>
      </div>
    </>
  );
}
