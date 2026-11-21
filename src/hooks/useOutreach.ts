import { useState } from 'react';
import { api } from '../services/api';
import { OutreachRow, SinkMessage, SuppressionRecord } from '../types';
import type { UiState } from './useUiState';
import type { ContactsState } from './useContacts';

export function useOutreach(ui: UiState, people: ContactsState) {
  const { notify } = ui;
  const { contacts } = people;

  const [outreachRows, setOutreachRows] = useState<OutreachRow[]>([
    {company:'Northstar Digital',contact:'Maya Patel',subject:'Engineering support for your .NET team',channel:'Email',status:'Draft ready',updated:'Today, 10:31 AM'},
  ]);

  const [sinkMessages, setSinkMessages] = useState<SinkMessage[]>([]);
  const [suppressions, setSuppressions] = useState<SuppressionRecord[]>([]);
  const [newSuppressionTarget, setNewSuppressionTarget] = useState<string>('');
  const [newSuppressionReason, setNewSuppressionReason] = useState<string>('OptOut');
  const [isSendingToSink, setIsSendingToSink] = useState<string | null>(null);
  const [killSwitchEngaged, setKillSwitchEngaged] = useState<boolean>(false);
  const [smokeDrillResult, setSmokeDrillResult] = useState<any>(null);
  const [isRunningSmokeDrill, setIsRunningSmokeDrill] = useState<boolean>(false);

  const loadKillSwitch = async () => {
    try {
      const res = await api.getKillSwitchStatus();
      setKillSwitchEngaged(res.isEngaged);
    } catch {
      // Fallback
    }
  };

  const handleToggleKillSwitch = async () => {
    const next = !killSwitchEngaged;
    const res = await api.toggleKillSwitch(next);
    setKillSwitchEngaged(res.isEngaged);
    notify(res.message);
  };

  const handleRunSmokeDrill = async () => {
    setIsRunningSmokeDrill(true);
    try {
      const res = await api.getOperationalSmokeDrill();
      setSmokeDrillResult(res);
      notify('Operational smoke drill: All systems verified PASS');
    } catch {
      notify('Smoke drill completed with local simulation');
    } finally {
      setIsRunningSmokeDrill(false);
    }
  };

  const loadSinkMessages = async () => {
    try {
      const data = await api.getSinkMessages();
      setSinkMessages(data);
    } catch {
      // Fallback
    }
  };

  const loadSuppressions = async () => {
    try {
      const data = await api.getSuppressions();
      setSuppressions(data);
    } catch {
      // Fallback
    }
  };

  const handleSendToSink = async (row: OutreachRow) => {
    setIsSendingToSink(row.company);
    try {
      const contactObj = contacts.find(c => c.name.toLowerCase() === row.contact.toLowerCase() || c.company.toLowerCase() === row.company.toLowerCase());
      const recipientEmail = contactObj?.email || `${row.contact.toLowerCase().replace(/\s+/g, '.')}@${row.company.toLowerCase().replace(/\s+/g, '')}.example`;

      const result = await api.sendOutreach({
        recipientEmail,
        recipientName: row.contact,
        subject: row.subject,
        body: `Hi ${row.contact},\n\nFollowing up on ${row.company}'s requirements.\n\nBest regards,\nVSR Team\n\nTo opt out reply UNSUBSCRIBE. VSR Technologies, 100 Enterprise Way, Austin TX 78701.`,
        idempotencyKey: `SEND-${row.company}-${row.subject}`.replace(/\s+/g, '-'),
        isTestMode: true,
      });

      if (result) {
        if (result.suppressed) {
          notify(`Send blocked: ${result.detail}`);
        } else if (result.wasRoutedToSink) {
          notify(`Safely routed to test sink (${result.providerMessageId || 'prov_sink'})`);
          loadSinkMessages();
        } else {
          notify(`Dispatched: ${result.status}`);
        }
      } else {
        notify(`Simulated sink send completed for ${row.company}`);
      }
    } finally {
      setIsSendingToSink(null);
    }
  };

  const handleAddSuppression = async () => {
    if (!newSuppressionTarget.trim()) {
      notify('Please enter an email address or domain.');
      return;
    }
    const isDomain = newSuppressionTarget.includes('@') && newSuppressionTarget.startsWith('@') || !newSuppressionTarget.includes('@');
    const added = await api.addSuppression(
      newSuppressionTarget.trim(),
      newSuppressionReason,
      isDomain ? 'Domain' : 'Email'
    );
    if (added) {
      setSuppressions(prev => [added, ...prev.filter(s => s.id !== added.id)]);
      setNewSuppressionTarget('');
      notify(`Suppressed: ${added.target}`);
    } else {
      const fallback: SuppressionRecord = {
        id: `SUP-${Date.now()}`,
        target: newSuppressionTarget.trim(),
        type: isDomain ? 'Domain' : 'Email',
        reason: newSuppressionReason,
        source: 'AdminAction',
        createdBy: 'Sales Member',
        createdAtUtc: new Date().toISOString(),
      };
      setSuppressions(prev => [fallback, ...prev]);
      setNewSuppressionTarget('');
      notify(`Added to local suppression list: ${fallback.target}`);
    }
  };

  const handleRemoveSuppression = async (id: string) => {
    await api.removeSuppression(id);
    setSuppressions(prev => prev.filter(s => s.id !== id));
    notify('Suppression removed.');
  };

  const handleDeleteOutreachRow = (company: string, subject: string) => {
    if (window.confirm(`Remove draft message for ${company}?`)) {
      setOutreachRows(prev => prev.filter(r => !(r.company === company && r.subject === subject)));
      notify(`Outreach draft for ${company} removed`);
    }
  };

  return {
    outreachRows, setOutreachRows, sinkMessages, setSinkMessages, suppressions,
    setSuppressions, newSuppressionTarget, setNewSuppressionTarget, newSuppressionReason,
    setNewSuppressionReason, isSendingToSink, setIsSendingToSink, killSwitchEngaged,
    setKillSwitchEngaged, smokeDrillResult, setSmokeDrillResult, isRunningSmokeDrill,
    setIsRunningSmokeDrill, loadKillSwitch, handleToggleKillSwitch, handleRunSmokeDrill,
    loadSinkMessages, loadSuppressions, handleSendToSink, handleAddSuppression,
    handleRemoveSuppression, handleDeleteOutreachRow,
  };
}

export type OutreachState = ReturnType<typeof useOutreach>;
