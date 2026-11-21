const STEPS = ['Find', 'Filter', 'De-duplicate', 'Score', 'Find contacts', 'Draft', 'Check compliance', 'Report'];

export const SignInAside = () => (
  <aside className="si-aside">
    <div className="si-brand">
      <span className="si-mark" aria-hidden="true">V</span>
      <span>VSR Sales Engine</span>
    </div>

    <div className="si-pitch">
      <h1>Leads found while you work on something else.</h1>
      <p>
        A team of eight agents reads live job boards every two hours, filters and scores what it finds,
        and drafts the outreach. You approve before anything is sent.
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

    <p className="si-foot">Outreach stays in test mode until a sending domain is verified.</p>
  </aside>
);
