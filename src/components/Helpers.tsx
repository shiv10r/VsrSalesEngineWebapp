export function SettingRow({ title, desc, children }: any) {
  return (
    <div className="setting-row">
      <div className="setting-copy"><strong>{title}</strong><p>{desc}</p></div>
      <div className="setting-action">{children}</div>
    </div>
  );
}
