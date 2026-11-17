// Rappel du week-end : abonnement de cet appareil aux notifications.
import { supabase } from './supabase';

const FN = 'hestia-rappel';

/** Sur iPhone, les notifications ne marchent que si Hestia est ajoutée à l'écran d'accueil. */
export function pushState(): 'ok' | 'installer' | 'non' {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  if (ios && !standalone) return 'installer';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'non';
  return 'ok';
}

function toKey(base64: string): Uint8Array {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Demande l'autorisation et enregistre cet appareil. */
export async function subscribePush(userId: string): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications refusées. Autorisez-les dans les réglages de l’iPhone (Notifications › Hestia).');
  const { data, error } = await supabase.functions.invoke(FN, { method: 'GET' });
  if (error || !data?.cle) throw new Error('Service de rappel indisponible pour le moment.');
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(data.cle) }));
  const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  const { error: e2 } = await supabase.from('abonnements_push').upsert({ endpoint: j.endpoint, user_id: userId, p256dh: j.keys.p256dh, auth: j.keys.auth });
  if (e2) throw new Error(e2.message);
}

/** Envoie le rappel tout de suite, pour essayer. */
export async function testPush(): Promise<number> {
  const { data, error } = await supabase.functions.invoke(FN, { body: { essai: true } });
  if (error) throw new Error('Essai impossible pour le moment.');
  return (data as { envoyes: number }).envoyes;
}
