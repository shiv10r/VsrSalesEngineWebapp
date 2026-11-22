const STEPS = ['Find', 'Filter', 'De-duplicate', 'Score', 'Find contacts', 'Report'];

export const SignInAside = () => (
  <aside className="si-aside">
    <div className="si-brand">
      <span className="si-mark" aria-hidden="true">V</span>
      <span>VSR Sales Engine</span>
    </div>

    <div className="si-pitch">
      <h1>Leads found while you work on something else.</h1>
      <p>
        A team of six agents finds leads on live job boards every two hours, filters out what does not fit,
        removes duplicates, scores each lead and looks for a public contact. Nothing is ever sent for you.
      </p>
      <ol className="si-steps" aria-label="How the agents work">
        {STEPS.map((step, i) => (
          <li key={step}>
            <span aria-hidden="true">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>

    <p className="si-foot">Local business leads come from Google Maps and your own imports.</p>
  </aside>
);
