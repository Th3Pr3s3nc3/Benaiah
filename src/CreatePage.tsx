import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Link2, MessageCircle, Send, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GuestLink {
  id: string;
  name: string;
  url: string;
}

const invitationBaseUrl = 'https://benaiah-seven.vercel.app/';

function createGuestLink(name: string) {
  const encodedName = encodeURIComponent(name).replace(/[!'()*]/g, (character) => (
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  ));
  return `${invitationBaseUrl}?guest=${encodedName}`;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Clipboard copy failed');
}

export default function CreatePage() {
  const [guestName, setGuestName] = useState('');
  const [singleLink, setSingleLink] = useState('');
  const [singleError, setSingleError] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [bulkLinks, setBulkLinks] = useState<GuestLink[]>([]);
  const [bulkError, setBulkError] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [copyError, setCopyError] = useState('');

  const handleSingleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = guestName.trim();
    if (!name) {
      setSingleError('Enter a guest name to create a link.');
      setSingleLink('');
      return;
    }
    setGuestName(name);
    setSingleError('');
    setCopyError('');
    setSingleLink(createGuestLink(name));
  };

  const handleBulkSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const names = bulkNames.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
    if (names.length === 0) {
      setBulkError('Add at least one guest name to create links.');
      setBulkLinks([]);
      return;
    }
    setBulkError('');
    setCopyError('');
    setBulkLinks(names.map((name, index) => ({
      id: `guest-${index}-${name}`,
      name,
      url: createGuestLink(name),
    })));
  };

  const handleCopy = async (text: string, id: string) => {
    setCopyError('');
    try {
      await copyText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((currentId) => currentId === id ? '' : currentId), 1800);
    } catch {
      setCopiedId('');
      setCopyError('Could not copy automatically. Select and copy the link instead.');
    }
  };

  const whatsappLink = singleLink
    ? `https://wa.me/?text=${encodeURIComponent(`Hello ${guestName}, you're invited to celebrate with us! ${singleLink}`)}`
    : '';

  return (
    <main className="create-page">
      <div className="create-shell">
        <header className="create-topbar">
          <Link to="/" className="create-brand" aria-label="Benaiah invitation home">
            <span className="create-brand-mark">B</span>
            <span className="create-brand-copy">
              <span className="create-brand-name">Benaiah</span>
              <span className="create-brand-event">Christening &amp; first birthday</span>
            </span>
          </Link>
          <Link to="/" className="create-back-link"><ArrowLeft size={17} aria-hidden="true" /> View invitation</Link>
        </header>

        <section className="create-heading">
          <div className="create-eyebrow"><Sparkles size={15} aria-hidden="true" /> A PERSONAL INVITATION</div>
          <h1>Make it personal.</h1>
          <p>Create a name-specific invitation link for each guest.</p>
        </section>

        <div className="create-grid">
          <section className="create-panel" aria-labelledby="single-heading">
            <div className="create-panel-kicker">01 <span>ONE GUEST</span></div>
            <h2 id="single-heading">Create a guest link</h2>
            <p className="create-panel-copy">Give someone a warm, personal welcome.</p>
            <form className="create-form" onSubmit={handleSingleSubmit}>
              <label htmlFor="guest-name">Guest name</label>
              <div className="create-input-row">
                <input
                  id="guest-name"
                  name="guestName"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Sarah Namukasa"
                  value={guestName}
                  onChange={(event) => {
                    setGuestName(event.target.value);
                    setSingleLink('');
                    setSingleError('');
                  }}
                />
                <button className="create-button create-button-primary" type="submit">
                  Generate link <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
              {singleError && <p className="create-error" role="alert">{singleError}</p>}
            </form>

            {singleLink && (
              <div className="single-result" aria-live="polite">
                <div className="result-label"><Link2 size={16} aria-hidden="true" /> YOUR PERSONAL LINK</div>
                <a className="single-link-value" href={singleLink} target="_blank" rel="noreferrer">{singleLink}</a>
                <div className="result-actions">
                  <button className="create-button create-button-secondary" type="button" onClick={() => handleCopy(singleLink, 'single')}>
                    {copiedId === 'single' ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
                    {copiedId === 'single' ? 'Copied' : 'Copy'}
                  </button>
                  <a className="create-button create-button-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer">
                    <MessageCircle size={17} aria-hidden="true" /> Send on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </section>

          <section className="create-panel bulk-panel" aria-labelledby="bulk-heading">
            <div className="create-panel-kicker">02 <span>GUEST LIST</span></div>
            <h2 id="bulk-heading">Create links in a batch</h2>
            <p className="create-panel-copy">Prepare personalized links for everyone on your list.</p>
            <form className="create-form" onSubmit={handleBulkSubmit}>
              <label htmlFor="bulk-names">Guest names <span className="label-note">one per line</span></label>
              <textarea
                id="bulk-names"
                name="bulkNames"
                rows={5}
                placeholder={'Sarah Namukasa\nDaniel Ocen\nThe Achieng Family'}
                value={bulkNames}
                onChange={(event) => {
                  setBulkNames(event.target.value);
                  setBulkError('');
                }}
              />
              {bulkError && <p className="create-error" role="alert">{bulkError}</p>}
              <button className="create-button create-button-primary bulk-generate" type="submit">
                <Users size={17} aria-hidden="true" /> Generate links
              </button>
            </form>

            {bulkLinks.length > 0 && (
              <div className="bulk-results" aria-live="polite">
                <div className="bulk-results-heading"><span>READY TO SEND</span><span className="bulk-count">{bulkLinks.length}</span></div>
                {bulkLinks.map((guestLink) => (
                  <div className="bulk-link-row" key={guestLink.id}>
                    <span className="bulk-link-name">{guestLink.name}</span>
                    <a className="bulk-link-value" href={guestLink.url} target="_blank" rel="noreferrer">{guestLink.url}</a>
                    <button className="bulk-copy-button" type="button" onClick={() => handleCopy(guestLink.url, guestLink.id)} aria-label={`Copy ${guestLink.name}'s invitation link`}>
                      {copiedId === guestLink.id ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
                      <span>{copiedId === guestLink.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {copyError && <p className="create-error create-copy-error" role="alert">{copyError}</p>}
        <footer className="create-footer"><Send size={14} aria-hidden="true" /> Made for sharing a little joy</footer>
      </div>
    </main>
  );
}