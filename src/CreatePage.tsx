import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Link2, MessageCircle, Search, Send, Sparkles, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchVisitors, supabase, type VisitorRecord } from './supabase';

interface GuestLink {
  id: string;
  name: string;
  url: string;
}

interface DuplicateNotice {
  name: string;
  message: string;
}

const invitationBaseUrl = 'https://benaiah-seven.vercel.app/';

function normalizeGuestName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function cleanGuestName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

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
  const [singleNotice, setSingleNotice] = useState<DuplicateNotice | null>(null);
  const [singleError, setSingleError] = useState('');
  const [singleBusy, setSingleBusy] = useState(false);
  const [bulkNames, setBulkNames] = useState('');
  const [bulkLinks, setBulkLinks] = useState<GuestLink[]>([]);
  const [bulkNotices, setBulkNotices] = useState<DuplicateNotice[]>([]);
  const [bulkError, setBulkError] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [guests, setGuests] = useState<VisitorRecord[]>([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [busyGuestId, setBusyGuestId] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [copyError, setCopyError] = useState('');
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    let active = true;
    setListLoading(true);
    fetchVisitors()
      .then((rows) => { if (active) setGuests(rows); })
      .catch((error: unknown) => { if (active) setPageError(error instanceof Error ? error.message : 'Could not load guests.'); })
      .finally(() => { if (active) setListLoading(false); });

    return () => { active = false; };
  }, []);

  const refreshGuests = async () => {
    const rows = await fetchVisitors();
    setGuests(rows);
    return rows;
  };

  const findGuest = async (name: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('visitors')
      .select('id, name, normalized_name, created_at, sent')
      .eq('normalized_name', normalizeGuestName(name))
      .maybeSingle();
    if (error) throw error;
    return data as VisitorRecord | null;
  };

  const handleSingleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = cleanGuestName(guestName);
    if (!name) {
      setSingleError('Enter a guest name to create a link.');
      setSingleLink('');
      return;
    }
    setGuestName(name);
    setSingleError('');
    setPageError('');
    setSingleBusy(true);
    try {
      const existing = await findGuest(name);
      if (existing) {
        setSingleLink(createGuestLink(existing.name));
        setSingleNotice({ name: existing.name, message: `Already added on ${formatDate(existing.created_at)}. No duplicate was created.` });
        return;
      }

      if (!supabase) throw new Error('Supabase is not configured.');
      const { data, error } = await supabase
        .from('visitors')
        .insert({ name })
        .select('id, name, normalized_name, created_at, sent')
        .single();
      if (error?.code === '23505') {
        const duplicate = await findGuest(name);
        if (duplicate) {
          setSingleLink(createGuestLink(duplicate.name));
          setSingleNotice({ name: duplicate.name, message: `Already added on ${formatDate(duplicate.created_at)}. No duplicate was created.` });
          await refreshGuests();
          return;
        }
      }
      if (error) throw error;
      setSingleLink(createGuestLink(name));
      setSingleNotice(null);
      await refreshGuests();
    } catch (error) {
      setSingleError(error instanceof Error ? error.message : 'Could not save this guest.');
    } finally {
      setSingleBusy(false);
    }
  };

  const handleBulkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const distinctNames = new Map<string, string>();
    const repeatedNames = new Set<string>();
    for (const rawName of bulkNames.split(/\r?\n/)) {
      const name = cleanGuestName(rawName);
      if (!name) continue;
      const key = normalizeGuestName(name);
      if (distinctNames.has(key)) repeatedNames.add(key);
      else distinctNames.set(key, name);
    }

    const names = [...distinctNames.entries()].map(([key, name]) => ({ key, name }));
    if (!names.length) {
      setBulkError('Add at least one guest name to create links.');
      setBulkLinks([]);
      return;
    }
    setBulkError('');
    setPageError('');
    setBulkBusy(true);
    try {
      const existingRows = await fetchVisitors();
      const existingByName = new Map(existingRows.map((guest) => [guest.normalized_name, guest]));
      const newNames = names.filter(({ key }) => !existingByName.has(key));
      let insertedKeys = new Set<string>();

      if (newNames.length) {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { data, error } = await supabase
          .from('visitors')
          .upsert(newNames.map(({ name }) => ({ name })), { onConflict: 'normalized_name', ignoreDuplicates: true })
          .select('normalized_name');
        if (error) throw error;
        insertedKeys = new Set((data ?? []).map((row: { normalized_name: string }) => row.normalized_name));
      }

      const currentRows = await refreshGuests();
      const currentByName = new Map(currentRows.map((guest) => [guest.normalized_name, guest]));
      const notices: DuplicateNotice[] = [];
      for (const { key, name } of names) {
        const existing = existingByName.get(key);
        if (existing) {
          notices.push({ name, message: `Already added on ${formatDate(existing.created_at)}. No duplicate was created.` });
        } else if (repeatedNames.has(key)) {
          notices.push({ name, message: 'This name appeared more than once in the pasted list; only one guest record was saved.' });
        } else if (!insertedKeys.has(key)) {
          const racedGuest = currentByName.get(key);
          if (racedGuest) notices.push({ name, message: `Already added on ${formatDate(racedGuest.created_at)}. No duplicate was created.` });
        }
      }

      setBulkNotices(notices);
      setBulkLinks(names.map(({ key, name }) => ({
        id: `guest-${key}`,
        name,
        url: createGuestLink(currentByName.get(key)?.name ?? name),
      })));
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Could not save these guests.');
    } finally {
      setBulkBusy(false);
    }
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

  const handleSentChange = async (guest: VisitorRecord, sent: boolean) => {
    if (!supabase) return;
    setBusyGuestId(guest.id);
    setPageError('');
    const { error } = await supabase.from('visitors').update({ sent }).eq('id', guest.id);
    if (error) {
      setPageError(error.message);
    } else {
      setGuests((current) => current.map((item) => item.id === guest.id ? { ...item, sent } : item));
    }
    setBusyGuestId('');
  };

  const handleDelete = async (guest: VisitorRecord) => {
    if (!supabase || !window.confirm(`Delete ${guest.name} from the guest list? This cannot be undone.`)) return;
    setBusyGuestId(guest.id);
    setPageError('');
    const { error } = await supabase.from('visitors').delete().eq('id', guest.id);
    if (error) {
      setPageError(error.message);
    } else {
      setGuests((current) => current.filter((item) => item.id !== guest.id));
    }
    setBusyGuestId('');
  };

  const filteredGuests = guests.filter((guest) => (
    guest.name.toLowerCase().includes(guestSearch.trim().toLowerCase())
  ));

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

        <>
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
                    setSingleNotice(null);
                    setSingleError('');
                  }}
                />
                <button className="create-button create-button-primary" type="submit" disabled={singleBusy}>
                  {singleBusy ? 'Saving guest…' : 'Generate link'} <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
              {singleError && <p className="create-error" role="alert">{singleError}</p>}
              {singleNotice && <p className="create-notice" role="status">{singleNotice.message}</p>}
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
                  setBulkNotices([]);
                }}
              />
              {bulkError && <p className="create-error" role="alert">{bulkError}</p>}
              <button className="create-button create-button-primary bulk-generate" type="submit" disabled={bulkBusy}>
                <Users size={17} aria-hidden="true" /> {bulkBusy ? 'Saving guests…' : 'Generate links'}
              </button>
            </form>

            {bulkLinks.length > 0 && (
              <div className="bulk-results" aria-live="polite">
                <div className="bulk-results-heading"><span>READY TO SEND</span><span className="bulk-count">{bulkLinks.length}</span></div>
                {bulkNotices.map((notice) => (
                  <p className="create-notice bulk-notice" key={`${notice.name}-${notice.message}`} role="status"><strong>{notice.name}:</strong> {notice.message}</p>
                ))}
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

            {pageError && <p className="create-error create-copy-error" role="alert">{pageError}</p>}
            {copyError && <p className="create-error create-copy-error" role="alert">{copyError}</p>}

            <section className="guest-list-section" aria-labelledby="guest-list-heading">
              <div className="guest-list-heading-row">
                <div>
                  <div className="create-panel-kicker">THE RSVP DESK</div>
                  <h2 id="guest-list-heading">Guest list</h2>
                </div>
                <span className="guest-total"><strong>{guests.length}</strong> {guests.length === 1 ? 'guest' : 'guests'}</span>
              </div>
              <label className="guest-search">
                <Search size={18} aria-hidden="true" />
                <input type="search" placeholder="Search guests" value={guestSearch} onChange={(event) => setGuestSearch(event.target.value)} />
              </label>
              {listLoading ? (
                <p className="guest-list-empty">Loading your guest list…</p>
              ) : filteredGuests.length === 0 ? (
                <p className="guest-list-empty">{guests.length ? 'No guests match your search.' : 'Your guest list is ready for its first name.'}</p>
              ) : (
                <div className="guest-list-rows">
                  {filteredGuests.map((guest) => (
                    <div className="guest-list-row" key={guest.id}>
                      <div className="guest-identity">
                        <strong>{guest.name}</strong>
                        <time dateTime={guest.created_at}>Added {formatDate(guest.created_at)}</time>
                      </div>
                      <label className="guest-sent-control">
                        <input type="checkbox" checked={guest.sent} disabled={busyGuestId === guest.id} onChange={(event) => handleSentChange(guest, event.target.checked)} />
                        <span>Sent</span>
                      </label>
                      <button className="bulk-copy-button guest-copy-button" type="button" onClick={() => handleCopy(createGuestLink(guest.name), `guest-${guest.id}`)} aria-label={`Copy ${guest.name}'s invitation link`}>
                        {copiedId === `guest-${guest.id}` ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
                        <span>{copiedId === `guest-${guest.id}` ? 'Copied' : 'Copy link'}</span>
                      </button>
                      <button className="guest-delete-button" type="button" disabled={busyGuestId === guest.id} onClick={() => handleDelete(guest)} aria-label={`Delete ${guest.name}`} title={`Delete ${guest.name}`}>
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <footer className="create-footer"><Send size={14} aria-hidden="true" /> Made for sharing a little joy</footer>
        </>
      </div>
    </main>
  );
}