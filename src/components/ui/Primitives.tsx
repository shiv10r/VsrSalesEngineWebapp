import { Inbox } from 'lucide-react';

export function LogoMark({small=false}:{small?:boolean}) { return <div className={`brand-mark ${small?'small':''}`}><span>V</span></div>; }

export function Button({children, variant='secondary', icon:Icon, onClick, disabled=false, small=false, className=''}:any) { return <button className={`btn ${variant} ${small?'sm':''} ${className}`} onClick={onClick} disabled={disabled}>{Icon && <Icon size={small?14:16}/>}<span>{children}</span></button>; }

export function Pill({children, type='neutral', dot=false}:any) { return <span className={`pill ${type}`}>{dot && <i/>}{children}</span>; }

export function Toggle({checked, onChange, label}:any) { return <button aria-label={label || 'Toggle'} className={`toggle ${checked?'on':''}`} onClick={()=>onChange(!checked)}><span/></button>; }

export function EmptyHint({title, description, icon:Icon=Inbox, action, onAction}:any) { return <div className="empty-hint"><div className="empty-icon"><Icon size={22}/></div><h3>{title}</h3><p>{description}</p>{action && <Button variant="primary" onClick={onAction}>{action}</Button>}</div>; }
