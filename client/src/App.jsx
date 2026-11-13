import { useEffect, useState } from 'react'
import {
  ArrowRight, CalendarDays, Check, ChevronLeft, CircleAlert, MapPin,
  Menu, Search, ShieldCheck, Sparkles, Star, X,
} from 'lucide-react'
import { bookingApi, getApiError, hotelApi } from './services/api'

const today = new Date().toISOString().slice(0, 10)

function App() {
  const [page, setPage] = useState('home')
  const [hotels, setHotels] = useState([])
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [dates, setDates] = useState({ checkInDate: today, checkOutDate: '' })
  const [search, setSearch] = useState({ location: '', checkInDate: today, checkOutDate: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [propertyModalOpen, setPropertyModalOpen] = useState(false)

  useEffect(() => {
    loadHotels()
  }, [])

  async function loadHotels(params = {}) {
    setLoading(true)
    try {
      setHotels(await hotelApi.search(params))
    } catch (error) {
      showToast(getApiError(error), 'error')
    } finally {
      setLoading(false)
    }
  }

  function showToast(message, type = 'error') {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 4200)
  }

  function submitSearch(event) {
    event.preventDefault()
    if ((search.checkInDate && !search.checkOutDate) || (!search.checkInDate && search.checkOutDate)) {
      showToast('Please select both check-in and check-out dates.')
      return
    }
    loadHotels(Object.fromEntries(Object.entries(search).filter(([, value]) => value)))
  }

  function exploreAll() {
    const emptySearch = { location: '', checkInDate: '', checkOutDate: '' }
    setSearch(emptySearch)
    loadHotels({})
    navigate('home')
  }

  function openHotel(hotel) {
    setSelectedHotel(hotel)
    setDates({
      checkInDate: search.checkInDate || today,
      checkOutDate: search.checkOutDate || '',
    })
    setPage('hotel')
  }

  function navigate(nextPage) {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-sand text-ink">
      <Navbar page={page} navigate={navigate} exploreAll={exploreAll} openPropertyModal={() => setPropertyModalOpen(true)} />
      {page === 'home' && (
        <Home
          hotels={hotels}
          search={search}
          setSearch={setSearch}
          onSearch={submitSearch}
          loading={loading}
          openHotel={openHotel}
          navigate={navigate}
          exploreAll={exploreAll}
          removeHotel={async (hotel) => {
            if (!window.confirm(`Remove ${hotel.name}? This will also remove its bookings.`)) return
            try {
              await hotelApi.remove(hotel.id)
              setHotels((current) => current.filter((item) => item.id !== hotel.id))
              showToast('Property removed successfully.', 'success')
            } catch (error) {
              showToast(getApiError(error))
            }
          }}
        />
      )}
      {page === 'hotel' && selectedHotel && (
        <HotelPage
          hotel={selectedHotel}
          dates={dates}
          setDates={setDates}
          goBack={() => navigate('home')}
          book={() => navigate('booking')}
          showToast={showToast}
        />
      )}
      {page === 'booking' && selectedHotel && (
        <BookingPage
          hotel={selectedHotel}
          dates={dates}
          back={() => navigate('hotel')}
          showToast={showToast}
          complete={(booking) => {
            setSelectedHotel(null)
            navigate('success')
            setToast({ message: `Booking ${booking.bookingReference} confirmed.`, type: 'success' })
          }}
        />
      )}
      {page === 'success' && <SuccessPage navigate={navigate} />}
      {page === 'manage' && <ManageBooking showToast={showToast} />}
      <Footer />
      {toast && <Toast toast={toast} close={() => setToast(null)} />}
      {propertyModalOpen && <PropertyModal close={() => setPropertyModalOpen(false)} showToast={showToast} refreshHotels={() => { setSearch({ location: '', checkInDate: '', checkOutDate: '' }); return loadHotels({}) }} />}
    </div>
  )
}

function Navbar({ page, navigate, exploreAll, openPropertyModal }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <button onClick={() => navigate('home')} className="font-display text-2xl font-bold tracking-tight text-ink">
          stay<span className="text-coral">wise</span><span className="text-coral">.</span>
        </button>
        <button className="rounded-full bg-slate-100 p-2 text-ink md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`${open ? 'absolute left-5 right-5 top-16 flex' : 'hidden'} flex-col gap-2 rounded-2xl bg-white p-3 text-sm text-slate-800 shadow-soft md:static md:flex md:flex-row md:items-center md:bg-transparent md:p-0 md:shadow-none`}>
          <button onClick={() => { exploreAll(); setOpen(false) }} className={`rounded-full px-4 py-2 text-left font-semibold transition hover:bg-slate-100 ${page === 'home' ? 'text-coral' : 'text-slate-800'}`}>Explore stays</button>
          <button onClick={() => { navigate('manage'); setOpen(false) }} className="rounded-full px-4 py-2 text-left font-semibold text-slate-800 transition hover:bg-slate-100">Manage booking</button>
          <button onClick={() => { openPropertyModal(); setOpen(false) }} className="ml-0 rounded-full bg-white px-5 py-2.5 font-semibold text-ink transition hover:bg-coral hover:text-white md:ml-3">List your property</button>
        </nav>
      </div>
    </header>
  )
}

function Home({ hotels, search, setSearch, onSearch, loading, openHotel, exploreAll, removeHotel }) {
  return (
    <>
      <section className="hero relative overflow-hidden bg-ink px-5 pb-24 pt-36 text-white lg:px-8">
        <div className="hero-glow" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-coral"><Sparkles size={16} /> Travel, but make it memorable</p>
            <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">Your next great<br /><em className="font-normal text-coral">stay</em> starts here.</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/65">Thoughtfully chosen places for the stories you&apos;ll tell for years to come.</p>
          </div>
          <SearchCard search={search} setSearch={setSearch} onSearch={onSearch} />
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="eyebrow">Handpicked for you</p><h2 className="font-display text-4xl font-semibold">Find your kind of wonderful.</h2></div>
          <span className="hidden text-sm text-ink/50 sm:block">{hotels.length} stays to explore</span>
        </div>
        {loading ? <LoadingGrid /> : hotels.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel, index) => <HotelCard key={hotel.id} hotel={hotel} index={index} openHotel={openHotel} removeHotel={removeHotel} />)}
          </div>
        ) : <EmptyState reset={exploreAll} />}
        <section className="mt-20 grid gap-5 rounded-3xl bg-[#e6f1ee] p-8 sm:grid-cols-3 sm:p-10">
          {[
            ['01', 'Search your way', 'Filter by destination and dates to find a stay that fits.'],
            ['02', 'Book with confidence', 'Transparent prices, secure booking, no surprises.'],
            ['03', 'Make it yours', 'Your next unforgettable chapter is only a click away.'],
          ].map(([number, title, copy]) => <div key={number}><span className="text-sm font-bold text-coral">{number}</span><h3 className="mt-3 font-display text-2xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/60">{copy}</p></div>)}
        </section>
      </main>
    </>
  )
}

function SearchCard({ search, setSearch, onSearch }) {
  return <form onSubmit={onSearch} className="relative mt-12 grid gap-3 rounded-3xl bg-white p-3 text-ink shadow-soft md:grid-cols-[1.2fr_1fr_1fr_auto]">
    <label className="field"><MapPin size={18} /><span><small>Where</small><input placeholder="City or destination" value={search.location} onChange={(e) => setSearch({ ...search, location: e.target.value })} /></span></label>
    <label className="field"><CalendarDays size={18} /><span><small>Check in</small><input type="date" min={today} value={search.checkInDate} onChange={(e) => setSearch({ ...search, checkInDate: e.target.value })} /></span></label>
    <label className="field"><CalendarDays size={18} /><span><small>Check out</small><input type="date" min={search.checkInDate || today} value={search.checkOutDate} onChange={(e) => setSearch({ ...search, checkOutDate: e.target.value })} /></span></label>
    <button className="flex items-center justify-center gap-2 rounded-2xl bg-coral px-6 py-4 font-bold text-white transition hover:bg-[#e65f4d]"><Search size={19} /> <span className="md:hidden">Search stays</span></button>
  </form>
}

function HotelCard({ hotel, index, openHotel, removeHotel }) {
  const amenities = hotel.amenities?.split(',').slice(0, 2) || []
  return <article className="group cursor-pointer" onClick={() => openHotel(hotel)}>
    <div className="image-wrap relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#dbe9e6]">
      <img src={hotel.imageUrl} alt={hotel.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945' }} />
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink">Featured</span>
      <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-ink/80 px-3 py-1 text-xs text-white"><Star size={12} fill="currentColor" /> 4.9</span>
    </div>
    <div className="px-1 pt-4"><div className="flex items-start justify-between gap-3"><div><p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-coral"><MapPin size={12} /> {hotel.location}</p><h3 className="mt-1 font-display text-2xl font-semibold">{hotel.name}</h3></div><ArrowRight className="mt-2 shrink-0 text-ink/30 transition group-hover:translate-x-1 group-hover:text-coral" size={20} /></div><div className="mt-3 flex flex-wrap gap-2">{amenities.map((amenity) => <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/60" key={amenity}>{amenity.trim()}</span>)}</div><div className="mt-4 flex items-center justify-between"><p><strong className="text-lg">{formatInr(hotel.pricePerNight)}</strong><span className="text-sm text-ink/50"> / night</span></p><button type="button" onClick={(event) => { event.stopPropagation(); removeHotel(hotel) }} className="rounded-full px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50">Remove</button></div></div>
  </article>
}

function HotelPage({ hotel, dates, setDates, goBack, book, showToast }) {
  const nights = getNights(dates.checkInDate, dates.checkOutDate)
  const total = nights * Number(hotel.pricePerNight)
  return <main className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
    <button onClick={goBack} className="mb-7 flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-coral"><ChevronLeft size={17} /> Back to stays</button>
    <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div><img src={hotel.imageUrl} alt={hotel.name} className="aspect-[4/3] w-full rounded-[2rem] object-cover" /><div className="mt-8"><p className="eyebrow">{hotel.location}</p><h1 className="font-display text-5xl font-semibold">{hotel.name}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-ink/65">{hotel.description}</p><div className="mt-7 flex flex-wrap gap-2">{hotel.amenities?.split(',').map((item) => <span className="rounded-full bg-[#e6f1ee] px-4 py-2 text-sm" key={item}>{item.trim()}</span>)}</div></div></div>
      <aside className="h-fit rounded-3xl bg-white p-7 shadow-soft lg:sticky lg:top-8"><p className="text-sm text-ink/50">From</p><p className="font-display text-4xl font-semibold">{formatInr(hotel.pricePerNight)} <span className="font-sans text-sm font-normal text-ink/50">/ night</span></p><div className="mt-7 space-y-4"><DateInput label="Check in" value={dates.checkInDate} min={today} onChange={(value) => setDates({ ...dates, checkInDate: value })} /><DateInput label="Check out" value={dates.checkOutDate} min={dates.checkInDate || today} onChange={(value) => setDates({ ...dates, checkOutDate: value })} /></div>{nights > 0 && <div className="mt-6 border-t border-ink/10 pt-5"><div className="flex justify-between text-sm text-ink/60"><span>{formatInr(hotel.pricePerNight)} × {nights} nights</span><strong className="text-ink">{formatInr(total)}</strong></div><div className="mt-3 flex justify-between text-lg font-bold"><span>Total</span><span>{formatInr(total)}</span></div></div>}<button disabled={nights < 1} onClick={() => { if (nights < 1) showToast('Choose valid check-in and check-out dates.'); else book() }} className="mt-7 w-full rounded-2xl bg-coral py-4 font-bold text-white transition hover:bg-[#e65f4d] disabled:cursor-not-allowed disabled:opacity-40">Reserve this stay <ArrowRight className="ml-2 inline" size={17} /></button><div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink/45"><ShieldCheck size={15} /> Secure booking · No hidden fees</div></aside>
    </div>
  </main>
}

function DateInput({ label, value, min, onChange }) { return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50">{label}</span><input className="date-input" type="date" min={min} value={value} onChange={(e) => onChange(e.target.value)} /></label> }
function getNights(start, end) { if (!start || !end) return 0; const nights = (new Date(`${end}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000; return nights > 0 ? nights : 0 }
function formatInr(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)
}

function BookingPage({ hotel, dates, back, showToast, complete }) {
  const [form, setForm] = useState({ guestName: '', guestEmail: '' })
  const [loading, setLoading] = useState(false)
  const nights = getNights(dates.checkInDate, dates.checkOutDate)
  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      const booking = await bookingApi.create({ hotelId: hotel.id, ...form, ...dates })
      complete(booking)
    } catch (error) { showToast(getApiError(error)) } finally { setLoading(false) }
  }
  return <main className="mx-auto max-w-5xl px-5 pb-20 pt-32 lg:px-8"><button onClick={back} className="mb-7 flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-coral"><ChevronLeft size={17} /> Back to {hotel.name}</button><div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]"><form onSubmit={submit} className="rounded-3xl bg-white p-7 shadow-soft sm:p-10"><p className="eyebrow">Almost there</p><h1 className="font-display text-4xl font-semibold">Who&apos;s checking in?</h1><p className="mt-3 text-sm text-ink/55">We&apos;ll send your booking details to this email.</p><div className="mt-8 space-y-5"><label className="block"><span className="label">Full name</span><input className="text-input" required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} placeholder="Alex Morgan" /></label><label className="block"><span className="label">Email address</span><input className="text-input" required type="email" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} placeholder="alex@example.com" /></label></div><button disabled={loading} className="mt-8 w-full rounded-2xl bg-coral py-4 font-bold text-white disabled:opacity-50">{loading ? 'Confirming your stay...' : 'Confirm booking'} <ArrowRight className="ml-2 inline" size={17} /></button></form><aside className="h-fit rounded-3xl bg-ink p-7 text-white sm:p-9"><img src={hotel.imageUrl} alt="" className="mb-6 aspect-video w-full rounded-2xl object-cover opacity-90" /><p className="text-sm text-white/55">{hotel.location}</p><h2 className="font-display text-3xl font-semibold">{hotel.name}</h2><div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm"><div className="flex justify-between"><span className="text-white/55">Dates</span><span>{dates.checkInDate} → {dates.checkOutDate}</span></div><div className="flex justify-between"><span className="text-white/55">Stay</span><span>{nights} nights</span></div><div className="flex justify-between pt-3 text-lg font-bold"><span>Total</span><span>{formatInr(nights * Number(hotel.pricePerNight))}</span></div></div></aside></div></main>
}

function SuccessPage({ navigate }) { return <main className="mx-auto flex max-w-2xl flex-col items-center px-5 pb-28 pt-40 text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#d8f2e7] text-[#18855a]"><Check size={38} /></div><p className="eyebrow mt-8">You&apos;re all set</p><h1 className="font-display text-5xl font-semibold">Your stay is confirmed.</h1><p className="mt-5 text-lg leading-8 text-ink/60">Your unique booking reference is in your confirmation email. Keep it handy to manage your reservation.</p><button onClick={() => navigate('manage')} className="mt-8 rounded-2xl bg-ink px-7 py-4 font-bold text-white">Manage your booking <ArrowRight className="ml-2 inline" size={17} /></button></main> }

function ManageBooking({ showToast }) {
  const [form, setForm] = useState({ reference: '', email: '' })
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  async function lookup(event) { event.preventDefault(); setLoading(true); try { setBooking(await bookingApi.lookup(form.reference, form.email)) } catch (error) { setBooking(null); showToast(getApiError(error)) } finally { setLoading(false) } }
  async function cancel() { if (!window.confirm('Are you sure you want to cancel this booking?')) return; setLoading(true); try { setBooking(await bookingApi.cancel(form.reference, form.email)); showToast('Your booking has been cancelled.', 'success') } catch (error) { showToast(getApiError(error)) } finally { setLoading(false) } }
  return <main className="mx-auto max-w-3xl px-5 pb-20 pt-36 lg:px-8"><p className="eyebrow">Your reservation</p><h1 className="font-display text-5xl font-semibold">Manage your booking.</h1><p className="mt-4 max-w-xl text-lg text-ink/60">Look up your reservation with the reference and email used at checkout.</p><form onSubmit={lookup} className="mt-9 grid gap-4 rounded-3xl bg-white p-7 shadow-soft sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label><span className="label">Booking reference</span><input className="text-input" required value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. 8f2c..." /></label><label><span className="label">Email address</span><input className="text-input" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><button disabled={loading} className="rounded-2xl bg-ink px-6 py-3.5 font-bold text-white disabled:opacity-50">{loading ? 'Looking up...' : 'Find booking'}</button></form>{booking && <div className="mt-6 rounded-3xl border border-ink/10 bg-white p-7 shadow-soft"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-coral">Booking reference</p><p className="mt-1 break-all font-mono text-sm">{booking.bookingReference}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${booking.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-[#d8f2e7] text-[#18855a]'}`}>{booking.status}</span></div><h2 className="mt-7 font-display text-3xl font-semibold">{booking.hotelName}</h2><div className="mt-5 grid gap-4 text-sm sm:grid-cols-3"><div><p className="text-ink/45">Guest</p><p className="font-semibold">{booking.guestName}</p></div><div><p className="text-ink/45">Check in</p><p className="font-semibold">{booking.checkInDate}</p></div><div><p className="text-ink/45">Check out</p><p className="font-semibold">{booking.checkOutDate}</p></div></div>{booking.status !== 'CANCELLED' && <button onClick={cancel} disabled={loading} className="mt-7 rounded-2xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">Cancel booking</button>}</div>}</main>
}

function LoadingGrid() { return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div className="animate-pulse" key={item}><div className="aspect-[4/3] rounded-3xl bg-ink/10" /><div className="mt-4 h-5 w-2/3 rounded bg-ink/10" /><div className="mt-3 h-4 w-1/3 rounded bg-ink/10" /></div>)}</div> }
function EmptyState({ reset }) { return <div className="rounded-3xl border border-dashed border-ink/20 py-16 text-center"><Search className="mx-auto text-ink/25" size={34} /><h3 className="mt-4 font-display text-2xl font-semibold">No stays found</h3><p className="mt-2 text-sm text-ink/55">Try a different destination or dates.</p><button onClick={reset} className="mt-5 font-bold text-coral">Show all stays</button></div> }
function PropertyModal({ close, showToast, refreshHotels }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    pricePerNight: '12000',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    amenities: 'Wi-Fi, Breakfast, Parking',
    description: 'A comfortable and welcoming stay with thoughtful amenities for every guest.',
    totalRooms: '20',
  })
  const [loading, setLoading] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    try {
      await hotelApi.create({
        ...form,
        pricePerNight: Number(form.pricePerNight),
        totalRooms: Number(form.totalRooms),
      })
      await refreshHotels()
      close()
      showToast('Property added and now visible in guest searches.', 'success')
    } catch (error) {
      showToast(getApiError(error))
    } finally {
      setLoading(false)
    }
  }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-5 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="property-modal-title">
    <div className="relative max-h-full w-full max-w-lg overflow-auto rounded-3xl bg-sand p-7 shadow-soft sm:p-9">
      <button onClick={close} className="absolute right-5 top-5 rounded-full p-2 text-ink/50 hover:bg-ink/5 hover:text-ink" aria-label="Close property listing dialog"><X size={20} /></button>
      <><p className="eyebrow">For property owners</p><h2 id="property-modal-title" className="mt-2 font-display text-4xl font-semibold">Add your property.</h2><p className="mt-3 text-sm leading-6 text-ink/60">New properties are immediately available for guests to discover and book.</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block"><span className="label">Property name</span><input className="text-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="The Grand Hotel" /></label><label className="block"><span className="label">City</span><input className="text-input" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mumbai" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="label">Price per night (₹)</span><input className="text-input" required min="1" type="number" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} /></label><label className="block"><span className="label">Total rooms</span><input className="text-input" required min="1" type="number" value={form.totalRooms} onChange={(e) => setForm({ ...form, totalRooms: e.target.value })} /></label></div><label className="block"><span className="label">Image URL (optional)</span><input className="text-input" type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></label><label className="block"><span className="label">Amenities</span><input className="text-input" required value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Wi-Fi, Pool, Breakfast" /></label><button disabled={loading} className="w-full rounded-2xl bg-coral py-4 font-bold text-white hover:bg-[#e65f4d] disabled:opacity-50">{loading ? 'Adding property...' : 'Add property'} <ArrowRight className="ml-2 inline" size={17} /></button></form></>
    </div>
  </div>
}
function Toast({ toast, close }) { return <div className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-soft ${toast.type === 'success' ? 'bg-[#18855a]' : 'bg-ink'}`}><CircleAlert className="mt-0.5 shrink-0" size={17} /><span>{toast.message}</span><button onClick={close} className="ml-2 text-white/60 hover:text-white"><X size={16} /></button></div> }
function Footer() { return <footer className="border-t border-ink/10 px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl justify-center text-sm text-ink/50 sm:justify-between"><span className="font-display text-xl font-bold text-ink">stay<span className="text-coral">wise.</span></span><span>Made for meaningful stays</span></div></footer> }

export default App
