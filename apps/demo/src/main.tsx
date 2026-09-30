import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="shell">
      <nav className="nav">
        <strong>Northstar</strong>
        <div className="navLinks">
          <a href="#product">Product</a>
          <a href="#pricing">Pricing</a>
          <button className="ghost">Sign in</button>
        </div>
      </nav>

      <section className="hero" id="product">
        <div className="eyebrow">Developer provenance, visually</div>
        <h1>Click any pixel.<br />See what made it.</h1>
        <p>
          UIBlame traces rendered UI back to source lines, Git history and recorded AI sessions—without uploading your code.
        </p>
        <div className="actions">
          <button className="primary">Start inspecting</button>
          <button className="secondary">View provenance</button>
        </div>
      </section>

      <section className="cards" id="pricing">
        <article>
          <span>01</span>
          <h2>Source</h2>
          <p>Find the exact file and line that rendered an element.</p>
        </article>
        <article>
          <span>02</span>
          <h2>History</h2>
          <p>See the commit, author and diff responsible for the current line.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Provenance</h2>
          <p>Verify recorded AI origin by matching the source range and Git commit.</p>
        </article>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
