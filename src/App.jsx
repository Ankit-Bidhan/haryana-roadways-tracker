
import { useMemo, useState } from "react";
import { Search, MapPin, ArrowDownUp, BusFront, Clock, ChevronRight, ArrowLeft, Radio } from "lucide-react";
import { routes, stops } from "./data/routes";
import "./App.css";
import RoadRouteMap from "./RoadRouteMap";
function App() {
  const [from, setFrom] = useState("alewa");
  const [to, setTo] = useState("karnal");
  const [searched, setSearched] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const getStop = (id) => stops.find((s) => s.id === id);

  const matchingRoutes = useMemo(() => {
    return routes.filter((route) => {
      const fromIndex = route.stopIds.indexOf(from);
      const toIndex = route.stopIds.indexOf(to);
      return fromIndex !== -1 && toIndex > fromIndex;
    });
  }, [from, to]);

  const swapStops = () => {
    setFrom(to);
    setTo(from);
    setSearched(false);
  };

  const searchBuses = (e) => {
    e.preventDefault();
    setSelectedTrip(null);
    setSearched(true);
  };

  if (selectedTrip) {
    const route = routes.find((r) =>
      r.trips.some((t) => t.id === selectedTrip)
    );
    const trip = route?.trips.find((t) => t.id === selectedTrip);
    const fromIndex = route.stopIds.indexOf(from);
    const toIndex = route.stopIds.indexOf(to);
    const routeStops = route.stopIds
      .slice(fromIndex, toIndex + 1)
      .map((id, i) => ({
        ...getStop(id),
        time: trip.times[fromIndex + i],
      }));

    return (
      <div className="app-shell">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setSelectedTrip(null)}>
            <ArrowLeft size={20} />
          </button>
          <span>Bus details</span>
        </header>

        <main className="detail-page">
          <div className="detail-hero">
            <div className="bus-icon"><BusFront size={28} /></div>
            <div>
              <span className="eyebrow">HARYANA ROADWAYS · DEMO</span>
              <h1>{route.name}</h1>
              <p>{route.via}</p>
            </div>
          </div>

          <section className="info-card">
            <div className="journey-row">
              <div>
                <span className="muted">Boarding</span>
                <h2>{getStop(from)?.name}</h2>
                <strong>{trip.times[fromIndex]}</strong>
              </div>
              <ChevronRight />
              <div className="align-right">
                <span className="muted">Destination</span>
                <h2>{getStop(to)?.name}</h2>
                <strong>{trip.times[toIndex]}</strong>
              </div>
            </div>
            <div className="demo-note">
              <Radio size={16} />
              Demo only · Live GPS not connected
            </div>
          </section>

          <section className="stops-card">
            <h2>Route stops</h2>
            <div className="timeline">
              {route.stopIds.slice(fromIndex, toIndex + 1).map((id, i) => {
                const stop = getStop(id);
                return (
                  <div className="timeline-stop" key={id}>
                    <div className={`timeline-dot ${i === 0 ? "active" : ""}`} />
                    <div className="stop-info">
                      <strong>{stop.name}</strong>
                      <span>{trip.times[fromIndex + i]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <RoadRouteMap stops={routeStops} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><BusFront size={22} /></div>
          <div>
            <strong>Roadways Live</strong>
            <span>Haryana bus tracker</span>
          </div>
        </div>
        <span className="beta-badge">BETA</span>
      </header>

      <main>
        <section className="hero">
          <div className="hero-tag"><MapPin size={14} /> HARYANA ROADWAYS</div>
          <h1>Your journey,<br /><span>made simpler.</span></h1>
          <p>Find your bus by route. No need to remember the bus number.</p>
        </section>

        <form className="search-card" onSubmit={searchBuses}>
          <div className="field">
            <label htmlFor="from">FROM</label>
            <div className="input-wrap">
              <MapPin size={19} className="green" />
              <select id="from" value={from} onChange={(e) => {
                setFrom(e.target.value);
                setSearched(false);
              }}>
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>{stop.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="button" className="swap-btn" onClick={swapStops} aria-label="Swap stops">
            <ArrowDownUp size={18} />
          </button>

          <div className="field">
            <label htmlFor="to">TO</label>
            <div className="input-wrap">
              <MapPin size={19} className="red" />
              <select id="to" value={to} onChange={(e) => {
                setTo(e.target.value);
                setSearched(false);
              }}>
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>{stop.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="search-btn" type="submit" disabled={from === to}>
            <Search size={19} /> Search buses
          </button>
        </form>

        <section className="results-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR ROUTE</span>
              <h2>{getStop(from)?.name} <ChevronRight size={18} /> {getStop(to)?.name}</h2>
            </div>
            <span className="result-count">
              {searched ? matchingRoutes.reduce((n, r) => n + r.trips.length, 0) : "—"} buses
            </span>
          </div>

          {!searched ? (
            <div className="empty-state">
              <div className="empty-icon"><BusFront size={28} /></div>
              <h3>Ready to find your bus?</h3>
              <p>Choose your boarding point and destination, then search.</p>
            </div>
          ) : matchingRoutes.length === 0 ? (
            <div className="empty-state">
              <h3>No matching demo routes</h3>
              <p>Try another stop combination.</p>
            </div>
          ) : (
            <div className="bus-list">
              {matchingRoutes.flatMap((route) =>
                route.trips.map((trip) => {
                  const fromIndex = route.stopIds.indexOf(from);
                  const toIndex = route.stopIds.indexOf(to);
                  return (
                    <article className="bus-card" key={trip.id}>
                      <div className="bus-card-top">
                        <div className="bus-icon"><BusFront size={22} /></div>
                        <div className="bus-title">
                          <h3>{route.name}</h3>
                          <p>{route.via}</p>
                        </div>
                        <span className="demo-pill">DEMO</span>
                      </div>

                      <div className="bus-times">
                        <div>
                          <span className="muted">DEPARTURE</span>
                          <strong>{trip.times[fromIndex]}</strong>
                          <small>{getStop(from)?.name}</small>
                        </div>
                        <div className="duration-line"><span /></div>
                        <div className="align-right">
                          <span className="muted">ARRIVAL</span>
                          <strong>{trip.times[toIndex]}</strong>
                          <small>{getStop(to)?.name}</small>
                        </div>
                      </div>

                      <div className="bus-card-bottom">
                        <span><Clock size={15} /> Scheduled sample</span>
                        <button onClick={() => setSelectedTrip(trip.id)}>
                          View route <ChevronRight size={16} />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </section>

        <footer>
          <BusFront size={16} />
          <span>Independent prototype · Not an official Haryana Roadways app</span>
        </footer>
      </main>
    </div>
  );
}

export default App;