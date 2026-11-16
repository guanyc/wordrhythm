/**
 * Attribution for Play Store links.
 *
 * A raw `?utm_source=…&utm_medium=…` appended to a Play URL does nothing for
 * Play Console's acquisition reports: Google only reads campaign data out of
 * the *install referrer*, so the UTM string has to be percent-encoded inside
 * the `referrer` parameter:
 *
 *   …/details?id=com.gyc.ace.kjv&referrer=utm_source%3Dwordrhythm%26utm_medium%3Dweb…
 *
 * The same string is what the Play Install Referrer library returns to the app
 * after install, so it doubles as the "this install started on the website"
 * signal — one parameter, two consumers.
 *
 * `campaign` is the version slug (kjv, asv, rvr, aa…) so Play Console groups
 * installs per app; `content` says which placement on the page was clicked.
 */

export const UTM_SOURCE = "wordrhythm";
export const UTM_MEDIUM = "web";

const PLAY_HOST = "https://play.google.com/";

export function attributedPlayUrl(
  playUrl: string | undefined,
  campaign: string,
  content?: string,
): string | undefined {
  if (!playUrl || !playUrl.startsWith(PLAY_HOST)) return playUrl;

  // Drop any hand-written referrer first: two of them would be ambiguous.
  const base = playUrl.split("&referrer=")[0];

  const referrer = [
    `utm_source=${UTM_SOURCE}`,
    `utm_medium=${UTM_MEDIUM}`,
    `utm_campaign=${campaign}`,
    ...(content ? [`utm_content=${content}`] : []),
  ].join("&");

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}referrer=${encodeURIComponent(referrer)}`;
}
