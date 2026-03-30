import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const titles: Record<string, string> = {
    en: 'Privacy Policy — Martin von Wysiecki',
    de: 'Datenschutz — Martin von Wysiecki',
    pl: 'Polityka prywatności — Martin von Wysiecki',
  };
  const descriptions: Record<string, string> = {
    en: 'Privacy policy of Martin von Wysiecki.',
    de: 'Datenschutzerkl\u00e4rung von Martin von Wysiecki.',
    pl: 'Polityka prywatności Martina von Wysiecki.',
  };
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

function DatenschutzEN() {
  return (
    <div className="flex flex-col gap-12 text-on-surface/50 leading-relaxed">
      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          1. Privacy at a Glance
        </h2>
        <p className="mb-4">
          The following information provides a simple overview of what happens to your
          personal data when you visit this website. Personal data is any data with which
          you could be personally identified.
        </p>
        <p className="mb-4">
          This website uses <strong>no cookies</strong> and does not display a{' '}
          <strong>cookie banner</strong>. No third-party advertising or tracking services
          are used.
        </p>
        <p>
          The legal bases for the processing described below result from the General Data
          Protection Regulation (GDPR) and the German Telecommunications Digital Services
          Data Protection Act (TDDDG).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          2. Data Controller
        </h2>
        <div className="space-y-1">
          <p>Martin von Wysiecki</p>
          <p>Libellenweg 6c</p>
          <p>68259 Mannheim</p>
          <p>Germany</p>
          <p className="mt-3">
            E-Mail:{' '}
            <a
              href="mailto:info@wysiecki.de"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              info@wysiecki.de
            </a>
          </p>
          <p>Tel.: +49 621 &ndash; 43 71 26 61</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          3. Hosting and Content Delivery
        </h2>
        <p className="mb-4">
          This website is hosted on our own server. Traffic is routed through the
          Content Delivery Network (CDN) of{' '}
          <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA 94107,
          USA). Cloudflare may technically have access to your IP address and other
          connection data.
        </p>
        <p className="mb-4">
          The use of Cloudflare is based on our legitimate interest in secure and
          efficient provision of our website (Art.&nbsp;6(1)(f) GDPR). Cloudflare is
          certified under the EU-U.S. Data Privacy Framework. More information can be
          found in{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Cloudflare&apos;s Privacy Policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          4. Server Log Files
        </h2>
        <p className="mb-4">
          Each time this website is accessed, information automatically transmitted by
          your browser is collected:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Browser type and version</li>
          <li>Operating system used</li>
          <li>Referrer URL</li>
          <li>IP address</li>
          <li>Time of the request</li>
        </ul>
        <p>
          This data is not combined with other data sources. Legal basis is
          Art.&nbsp;6(1)(f) GDPR (legitimate interest in ensuring trouble-free
          operation).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          5. Web Analytics (Self-Hosted, Without Cookies)
        </h2>
        <p className="mb-4">
          We use a self-developed, privacy-friendly analytics tool. It uses{' '}
          <strong>no cookies</strong>, no localStorage, and no browser fingerprinting.
          On each page view, the following data is sent to our own server:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Page path visited</li>
          <li>Referrer (external origin only)</li>
          <li>Screen dimensions</li>
        </ul>
        <p className="mb-4">
          To count unique visitors, your IP address is hashed server-side using SHA-256
          with a daily rotating random salt. The resulting hash cannot be reversed.{' '}
          <strong>Your IP address is never stored in plain text.</strong>
        </p>
        <p className="mb-4">
          Data is stored exclusively on our own server and not shared with third parties.
          Retention period is a maximum of 2 years, after which data is automatically
          deleted.
        </p>
        <p className="mb-4">
          If your browser sends the &ldquo;Do Not Track&rdquo; (DNT) signal, no data
          collection takes place.
        </p>
        <p>
          Legal basis is Art.&nbsp;6(1)(f) GDPR (legitimate interest in anonymous
          analysis of user behavior to improve the website). Since no information is
          stored on or read from your device, consent under &sect;&nbsp;25 TDDDG is not
          required.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          6. Contact Form
        </h2>
        <p className="mb-4">
          If you send us an inquiry via the contact form, your details (name, email
          address, message) will be stored for the purpose of processing the inquiry
          and in case of follow-up questions. This data will not be shared without your
          consent.
        </p>
        <p>
          Legal basis is Art.&nbsp;6(1)(b) GDPR (pre-contractual measures) or
          Art.&nbsp;6(1)(f) GDPR (legitimate interest in effective processing of
          inquiries).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          7. Spam Protection (Cloudflare Turnstile)
        </h2>
        <p className="mb-4">
          The contact form is protected by <strong>Cloudflare Turnstile</strong>.
          Turnstile is a service by Cloudflare, Inc. (101 Townsend St, San Francisco, CA
          94107, USA) that detects automated access (spam/bots) without requiring a
          traditional CAPTCHA puzzle.
        </p>
        <p className="mb-4">
          The Turnstile script is{' '}
          <strong>only loaded when you interact with the contact form</strong> (e.g.,
          click an input field). Connection data (including your IP address) is then
          transmitted to Cloudflare.
        </p>
        <p className="mb-4">
          Legal basis is Art.&nbsp;6(1)(f) GDPR (legitimate interest in protection
          against abusive use of the contact form). Integration only occurs during active
          form use and is therefore technically necessary within the meaning of
          &sect;&nbsp;25(2)(2) TDDDG.
        </p>
        <p>
          More information:{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Cloudflare Privacy Policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          8. Local Browser Storage
        </h2>
        <p className="mb-4">
          This website uses your browser&apos;s localStorage feature exclusively for
          technically necessary purposes:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <strong>Design preferences (Dark/Light Mode):</strong> Your choice is saved
            locally so it persists on your next visit.
          </li>
          <li>
            <strong>Content caching:</strong> Some page sections temporarily store API
            responses in the browser to reduce loading times.
          </li>
        </ul>
        <p>
          This storage serves exclusively to provide features that you actively use and
          is therefore permissible without consent under &sect;&nbsp;25(2)(2) TDDDG. The
          data remains in your browser and is not transmitted to our server.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          9. Fonts
        </h2>
        <p>
          This website uses self-hosted fonts (Inter, Roboto Mono, Space Grotesk). Font
          files are loaded directly from our own server.{' '}
          <strong>No connection to external servers</strong> (e.g., Google) is made.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          10. Your Rights
        </h2>
        <p className="mb-4">Under GDPR, you have the following rights at any time:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <strong>Access</strong> (Art.&nbsp;15 GDPR) to your stored personal data
          </li>
          <li>
            <strong>Rectification</strong> (Art.&nbsp;16 GDPR) of inaccurate data
          </li>
          <li>
            <strong>Erasure</strong> (Art.&nbsp;17 GDPR) of your data stored with us
          </li>
          <li>
            <strong>Restriction</strong> (Art.&nbsp;18 GDPR) of processing
          </li>
          <li>
            <strong>Data portability</strong> (Art.&nbsp;20 GDPR)
          </li>
          <li>
            <strong>Objection</strong> (Art.&nbsp;21 GDPR) to processing
          </li>
        </ul>
        <p className="mb-4">
          To exercise your rights, you may contact us at any time at the address given
          above.
        </p>
        <p>
          You also have the right to lodge a complaint with a data protection supervisory
          authority. The competent authority for us is the State Commissioner for Data
          Protection and Freedom of Information Baden-W&uuml;rttemberg (
          <a
            href="https://www.baden-wuerttemberg.datenschutz.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            www.baden-wuerttemberg.datenschutz.de
          </a>
          ).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          11. SSL/TLS Encryption
        </h2>
        <p>
          For security reasons, this site uses SSL or TLS encryption. You can recognize
          an encrypted connection by the browser address bar changing from
          &ldquo;http://&rdquo; to &ldquo;https://&rdquo; and by the lock icon in your
          browser bar.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          12. Currency of This Privacy Policy
        </h2>
        <p>
          Status: March 2026. We reserve the right to adapt this privacy policy to
          reflect changes in the law or changes to our website.
        </p>
      </section>
    </div>
  );
}

function DatenschutzDE() {
  return (
    <div className="flex flex-col gap-12 text-on-surface/50 leading-relaxed">
      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          1. Datenschutz auf einen Blick
        </h2>
        <p className="mb-4">
          Die folgenden Hinweise geben einen einfachen &Uuml;berblick dar&uuml;ber, was
          mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
          Personenbezogene Daten sind alle Daten, mit denen Sie pers&ouml;nlich
          identifiziert werden k&ouml;nnen.
        </p>
        <p className="mb-4">
          Diese Website verwendet <strong>keine Cookies</strong> und setzt{' '}
          <strong>kein Cookie-Banner</strong> ein. Es werden keine Werbe- oder
          Tracking-Dienste Dritter eingebunden.
        </p>
        <p>
          Die Rechtsgrundlagen f&uuml;r die nachfolgend beschriebenen Verarbeitungen
          ergeben sich aus der Datenschutz-Grundverordnung (DSGVO) und dem
          Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          2. Verantwortlicher
        </h2>
        <div className="space-y-1">
          <p>Martin von Wysiecki</p>
          <p>Libellenweg 6c</p>
          <p>68259 Mannheim</p>
          <p>Deutschland</p>
          <p className="mt-3">
            E-Mail:{' '}
            <a
              href="mailto:info@wysiecki.de"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              info@wysiecki.de
            </a>
          </p>
          <p>Tel.: +49 621 &ndash; 43 71 26 61</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          3. Hosting und Content Delivery
        </h2>
        <p className="mb-4">
          Diese Website wird auf einem eigenen Server gehostet. Der Datenverkehr wird
          &uuml;ber das Content-Delivery-Network (CDN) von{' '}
          <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA 94107,
          USA) geleitet. Dabei kann Cloudflare technisch bedingt Zugriff auf Ihre
          IP-Adresse und weitere Verbindungsdaten erhalten.
        </p>
        <p className="mb-4">
          Die Nutzung von Cloudflare erfolgt auf Grundlage unseres berechtigten
          Interesses an einer sicheren und effizienten Bereitstellung unserer Website
          (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO). Cloudflare ist unter dem EU-U.S.
          Data Privacy Framework zertifiziert. Weitere Informationen finden Sie in der{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Datenschutzerkl&auml;rung von Cloudflare
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          4. Server-Log-Dateien
        </h2>
        <p className="mb-4">
          Bei jedem Zugriff auf diese Website werden automatisch Informationen erfasst,
          die Ihr Browser &uuml;bermittelt:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Browsertyp und -version</li>
          <li>Verwendetes Betriebssystem</li>
          <li>Referrer URL</li>
          <li>IP-Adresse</li>
          <li>Uhrzeit der Anfrage</li>
        </ul>
        <p>
          Diese Daten werden nicht mit anderen Datenquellen zusammengef&uuml;hrt.
          Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes
          Interesse an der Sicherstellung eines st&ouml;rungsfreien Betriebs).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          5. Webanalyse (selbst gehostet, ohne Cookies)
        </h2>
        <p className="mb-4">
          Wir setzen eine selbst entwickelte, datenschutzfreundliche Analysesoftware ein.
          Diese verwendet <strong>keine Cookies</strong>, kein localStorage und kein
          Browser-Fingerprinting. Bei jedem Seitenaufruf werden folgende Daten an unseren
          eigenen Server &uuml;bermittelt:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Aufgerufener Seitenpfad</li>
          <li>Referrer (nur externer Herkunft)</li>
          <li>Bildschirmgr&ouml;&szlig;e</li>
        </ul>
        <p className="mb-4">
          Zur Z&auml;hlung eindeutiger Besucher wird Ihre IP-Adresse serverseitig
          mittels SHA-256 mit einem t&auml;glich wechselnden Zufallswert (Salt) gehasht.
          Der resultierende Hash kann nicht zur&uuml;ckgerechnet werden.{' '}
          <strong>
            Ihre IP-Adresse wird zu keinem Zeitpunkt im Klartext gespeichert.
          </strong>
        </p>
        <p className="mb-4">
          Die Daten werden ausschlie&szlig;lich auf unserem eigenen Server gespeichert
          und nicht an Dritte weitergegeben. Die Aufbewahrungsdauer betr&auml;gt maximal
          2 Jahre, danach werden die Daten automatisch gel&ouml;scht.
        </p>
        <p className="mb-4">
          Wenn Ihr Browser das Signal &bdquo;Do Not Track&ldquo; (DNT) sendet, wird
          keine Datenerfassung durchgef&uuml;hrt.
        </p>
        <p>
          Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes
          Interesse an der anonymen Auswertung des Nutzungsverhaltens zur Verbesserung
          des Webangebots). Da keine Informationen auf Ihrem Endger&auml;t gespeichert
          oder ausgelesen werden, ist keine Einwilligung nach &sect;&nbsp;25 TDDDG
          erforderlich.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          6. Kontaktformular
        </h2>
        <p className="mb-4">
          Wenn Sie uns &uuml;ber das Kontaktformular eine Anfrage senden, werden Ihre
          Angaben (Name, E-Mail-Adresse, Nachricht) zur Bearbeitung der Anfrage und
          f&uuml;r den Fall von Anschlussfragen bei uns gespeichert. Diese Daten werden
          nicht ohne Ihre Einwilligung weitergegeben.
        </p>
        <p>
          Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO
          (vorvertragliche Ma&szlig;nahmen) bzw. Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f
          DSGVO (berechtigtes Interesse an der effektiven Bearbeitung von Anfragen).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          7. Spam-Schutz (Cloudflare Turnstile)
        </h2>
        <p className="mb-4">
          Das Kontaktformular ist durch <strong>Cloudflare Turnstile</strong>{' '}
          gesch&uuml;tzt. Turnstile ist ein Dienst der Cloudflare, Inc. (101 Townsend
          St, San Francisco, CA 94107, USA), der automatisierte Zugriffe (Spam/Bots)
          erkennt, ohne dass ein klassisches CAPTCHA-R&auml;tsel gel&ouml;st werden muss.
        </p>
        <p className="mb-4">
          Das Turnstile-Skript wird{' '}
          <strong>
            erst geladen, wenn Sie mit dem Kontaktformular interagieren
          </strong>{' '}
          (z.&nbsp;B. ein Eingabefeld anklicken). Dabei werden Verbindungsdaten
          (einschlie&szlig;lich Ihrer IP-Adresse) an Cloudflare &uuml;bermittelt.
        </p>
        <p className="mb-4">
          Rechtsgrundlage ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO (berechtigtes
          Interesse am Schutz vor missbr&auml;uchlicher Nutzung des Kontaktformulars).
          Die Einbindung erfolgt nur bei aktiver Nutzung des Formulars und ist damit
          technisch erforderlich im Sinne von &sect;&nbsp;25 Abs.&nbsp;2 Nr.&nbsp;2
          TDDDG.
        </p>
        <p>
          Weitere Informationen:{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Cloudflare Datenschutzerkl&auml;rung
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          8. Lokale Speicherung im Browser
        </h2>
        <p className="mb-4">
          Diese Website verwendet die localStorage-Funktion Ihres Browsers
          ausschlie&szlig;lich f&uuml;r technisch notwendige Zwecke:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <strong>Design-Einstellung (Dark/Light Mode):</strong> Ihre Auswahl wird
            lokal gespeichert, damit sie beim n&auml;chsten Besuch erhalten bleibt.
          </li>
          <li>
            <strong>Zwischenspeicherung von Inhalten:</strong> Einzelne Seitenbereiche
            speichern API-Antworten tempor&auml;r im Browser, um Ladezeiten zu
            verk&uuml;rzen.
          </li>
        </ul>
        <p>
          Diese Speicherung dient ausschlie&szlig;lich der Bereitstellung von Funktionen,
          die Sie selbst aktiv nutzen, und ist daher nach &sect;&nbsp;25 Abs.&nbsp;2
          Nr.&nbsp;2 TDDDG ohne Einwilligung zul&auml;ssig. Die Daten verbleiben in
          Ihrem Browser und werden nicht an unseren Server &uuml;bertragen.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          9. Schriftarten
        </h2>
        <p>
          Diese Website verwendet selbst gehostete Schriftarten (Inter, Roboto Mono,
          Space Grotesk). Die Schriftdateien werden direkt von unserem eigenen Server
          geladen. Es findet{' '}
          <strong>keine Verbindung zu externen Servern</strong> (z.&nbsp;B. Google)
          statt.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          10. Ihre Rechte
        </h2>
        <p className="mb-4">
          Sie haben gem&auml;&szlig; DSGVO jederzeit folgende Rechte:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <strong>Auskunft</strong> (Art.&nbsp;15 DSGVO) &uuml;ber Ihre gespeicherten
            personenbezogenen Daten
          </li>
          <li>
            <strong>Berichtigung</strong> (Art.&nbsp;16 DSGVO) unrichtiger Daten
          </li>
          <li>
            <strong>L&ouml;schung</strong> (Art.&nbsp;17 DSGVO) Ihrer bei uns
            gespeicherten Daten
          </li>
          <li>
            <strong>Einschr&auml;nkung</strong> (Art.&nbsp;18 DSGVO) der Verarbeitung
          </li>
          <li>
            <strong>Daten&uuml;bertragbarkeit</strong> (Art.&nbsp;20 DSGVO)
          </li>
          <li>
            <strong>Widerspruch</strong> (Art.&nbsp;21 DSGVO) gegen die Verarbeitung
          </li>
        </ul>
        <p className="mb-4">
          Zur Aus&uuml;bung Ihrer Rechte k&ouml;nnen Sie sich jederzeit an die oben
          genannte Kontaktadresse wenden.
        </p>
        <p>
          Sie haben zudem das Recht, sich bei einer
          Datenschutz-Aufsichtsbeh&ouml;rde zu beschweren. Die f&uuml;r uns
          zust&auml;ndige Aufsichtsbeh&ouml;rde ist der Landesbeauftragte f&uuml;r den
          Datenschutz und die Informationsfreiheit Baden-W&uuml;rttemberg (
          <a
            href="https://www.baden-wuerttemberg.datenschutz.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            www.baden-wuerttemberg.datenschutz.de
          </a>
          ).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          11. SSL-/TLS-Verschl&uuml;sselung
        </h2>
        <p>
          Diese Seite nutzt aus Sicherheitsgr&uuml;nden eine SSL- bzw.
          TLS-Verschl&uuml;sselung. Eine verschl&uuml;sselte Verbindung erkennen Sie
          daran, dass die Adresszeile des Browsers von &bdquo;http://&ldquo; auf
          &bdquo;https://&ldquo; wechselt und an dem Schloss-Symbol in Ihrer
          Browserzeile.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          12. Aktualit&auml;t dieser Datenschutzerkl&auml;rung
        </h2>
        <p>
          Stand: M&auml;rz 2026. Wir behalten uns vor, diese
          Datenschutzerkl&auml;rung anzupassen, um sie an ge&auml;nderte Rechtslagen
          oder &Auml;nderungen unserer Website anzupassen.
        </p>
      </section>
    </div>
  );
}

function DatenschutzPL() {
  return (
    <div className="flex flex-col gap-12 text-on-surface/50 leading-relaxed">
      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          1. Ochrona danych w skrócie
        </h2>
        <p className="mb-4">
          Poniższe informacje zawierają prosty przegląd tego, co dzieje się z Twoimi
          danymi osobowymi podczas odwiedzania tej strony internetowej. Dane osobowe to
          wszelkie dane, na podstawie których można Cię osobiście zidentyfikować.
        </p>
        <p className="mb-4">
          Ta strona internetowa <strong>nie używa plików cookie</strong> i nie
          wyświetla <strong>banera o plikach cookie</strong>. Nie korzystamy z usług
          reklamowych ani śledzących stron trzecich.
        </p>
        <p>
          Podstawy prawne opisanych poniżej operacji przetwarzania danych wynikają z
          Ogólnego Rozporządzenia o Ochronie Danych (RODO) oraz niemieckiej ustawy o
          ochronie danych w usługach cyfrowych (TDDDG).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          2. Administrator danych
        </h2>
        <div className="space-y-1">
          <p>Martin von Wysiecki</p>
          <p>Libellenweg 6c</p>
          <p>68259 Mannheim</p>
          <p>Niemcy</p>
          <p className="mt-3">
            E-mail:{' '}
            <a
              href="mailto:info@wysiecki.de"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              info@wysiecki.de
            </a>
          </p>
          <p>Tel.: +49 621 &ndash; 43 71 26 61</p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          3. Hosting i dostarczanie treści
        </h2>
        <p className="mb-4">
          Ta strona internetowa jest hostowana na własnym serwerze. Ruch sieciowy jest
          kierowany przez sieć dostarczania treści (CDN){' '}
          <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA 94107,
          USA). Cloudflare może mieć techniczny dostęp do Twojego adresu IP i innych
          danych połączenia.
        </p>
        <p className="mb-4">
          Korzystanie z Cloudflare opiera się na naszym uzasadnionym interesie w
          bezpiecznym i wydajnym udostępnianiu naszej strony internetowej (art. 6 ust. 1
          lit. f RODO). Cloudflare posiada certyfikat w ramach EU-U.S. Data Privacy
          Framework. Więcej informacji znajdziesz w{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Polityce prywatności Cloudflare
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          4. Pliki dziennika serwera
        </h2>
        <p className="mb-4">
          Przy każdym dostępie do tej strony internetowej automatycznie zbierane są
          informacje przesyłane przez Twoją przeglądarkę:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Typ i wersja przeglądarki</li>
          <li>Używany system operacyjny</li>
          <li>Adres URL strony odsyłającej</li>
          <li>Adres IP</li>
          <li>Czas żądania</li>
        </ul>
        <p>
          Dane te nie są łączone z innymi źródłami danych. Podstawą prawną jest art. 6
          ust. 1 lit. f RODO (uzasadniony interes w zapewnieniu bezawaryjnego
          działania).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          5. Analityka internetowa (samodzielnie hostowana, bez plików cookie)
        </h2>
        <p className="mb-4">
          Stosujemy samodzielnie opracowane, przyjazne prywatności oprogramowanie
          analityczne. <strong>Nie używa ono plików cookie</strong>, localStorage ani
          fingerprint przeglądarki. Przy każdym wyświetleniu strony następujące dane są
          przesyłane do naszego własnego serwera:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Wyświetlana ścieżka strony</li>
          <li>Strona odsyłająca (tylko zewnętrzne źródło)</li>
          <li>Rozmiar ekranu</li>
        </ul>
        <p className="mb-4">
          W celu zliczania unikalnych odwiedzających Twój adres IP jest po stronie
          serwera hashowany algorytmem SHA-256 z codziennie zmienianą losową wartością
          (salt). Wynikowy hash nie może zostać odwrócony.{' '}
          <strong>
            Twój adres IP nigdy nie jest przechowywany w postaci jawnej.
          </strong>
        </p>
        <p className="mb-4">
          Dane są przechowywane wyłącznie na naszym własnym serwerze i nie są
          udostępniane stronom trzecim. Okres przechowywania wynosi maksymalnie 2 lata,
          po czym dane są automatycznie usuwane.
        </p>
        <p className="mb-4">
          Jeśli Twoja przeglądarka wysyła sygnał &bdquo;Do Not Track&rdquo; (DNT),
          żadne dane nie są zbierane.
        </p>
        <p>
          Podstawą prawną jest art. 6 ust. 1 lit. f RODO (uzasadniony interes w
          anonimowej analizie zachowań użytkowników w celu ulepszenia oferty
          internetowej). Ponieważ na Twoim urządzeniu końcowym nie są zapisywane ani
          odczytywane żadne informacje, zgoda zgodnie z &sect; 25 TDDDG nie jest
          wymagana.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          6. Formularz kontaktowy
        </h2>
        <p className="mb-4">
          Jeśli wysyłasz do nas zapytanie za pośrednictwem formularza kontaktowego,
          Twoje dane (imię, adres e-mail, wiadomość) będą przechowywane w celu
          przetworzenia zapytania oraz na wypadek dalszych pytań. Dane te nie są
          udostępniane bez Twojej zgody.
        </p>
        <p>
          Podstawą prawną jest art. 6 ust. 1 lit. b RODO (działania przedumowne) lub
          art. 6 ust. 1 lit. f RODO (uzasadniony interes w skutecznym przetwarzaniu
          zapytań).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          7. Ochrona przed spamem (Cloudflare Turnstile)
        </h2>
        <p className="mb-4">
          Formularz kontaktowy jest chroniony przez{' '}
          <strong>Cloudflare Turnstile</strong>. Turnstile to usługa Cloudflare, Inc.
          (101 Townsend St, San Francisco, CA 94107, USA), która rozpoznaje
          zautomatyzowany dostęp (spam/boty) bez konieczności rozwiązywania klasycznego
          CAPTCHA.
        </p>
        <p className="mb-4">
          Skrypt Turnstile jest{' '}
          <strong>
            ładowany dopiero po interakcji z formularzem kontaktowym
          </strong>{' '}
          (np. kliknięciu pola wejściowego). Przy tym dane połączenia (w tym Twój adres
          IP) są przesyłane do Cloudflare.
        </p>
        <p className="mb-4">
          Podstawą prawną jest art. 6 ust. 1 lit. f RODO (uzasadniony interes w
          ochronie przed nadużyciem formularza kontaktowego). Integracja następuje tylko
          przy aktywnym korzystaniu z formularza i jest technicznie wymagana w rozumieniu
          &sect; 25 ust. 2 nr 2 TDDDG.
        </p>
        <p>
          Więcej informacji:{' '}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Polityka prywatności Cloudflare
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          8. Lokalne przechowywanie w przeglądarce
        </h2>
        <p className="mb-4">
          Ta strona internetowa korzysta z funkcji localStorage Twojej przeglądarki
          wyłącznie w celach technicznie niezbędnych:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <strong>Ustawienia wyglądu (tryb ciemny/jasny):</strong> Twój wybór jest
            zapisywany lokalnie, aby był zachowany przy następnej wizycie.
          </li>
          <li>
            <strong>Buforowanie treści:</strong> Poszczególne sekcje strony tymczasowo
            przechowują odpowiedzi API w przeglądarce w celu skrócenia czasu ładowania.
          </li>
        </ul>
        <p>
          To przechowywanie służy wyłącznie udostępnieniu funkcji, z których aktywnie
          korzystasz, i jest zatem dopuszczalne bez zgody na podstawie &sect; 25 ust. 2
          nr 2 TDDDG. Dane pozostają w Twojej przeglądarce i nie są przesyłane na nasz
          serwer.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          9. Czcionki
        </h2>
        <p>
          Ta strona internetowa korzysta z samodzielnie hostowanych czcionek (Inter,
          Roboto Mono, Space Grotesk). Pliki czcionek są ładowane bezpośrednio z naszego
          własnego serwera.{' '}
          <strong>Nie nawiązujemy połączenia z serwerami zewnętrznymi</strong>{' '}
          (np. Google).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          10. Twoje prawa
        </h2>
        <p className="mb-4">
          Zgodnie z RODO przysługują Ci następujące prawa:
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <strong>Dostęp</strong> (art. 15 RODO) do Twoich przechowywanych danych
            osobowych
          </li>
          <li>
            <strong>Sprostowanie</strong> (art. 16 RODO) nieprawidłowych danych
          </li>
          <li>
            <strong>Usunięcie</strong> (art. 17 RODO) Twoich danych przechowywanych u
            nas
          </li>
          <li>
            <strong>Ograniczenie przetwarzania</strong> (art. 18 RODO)
          </li>
          <li>
            <strong>Przenoszenie danych</strong> (art. 20 RODO)
          </li>
          <li>
            <strong>Sprzeciw</strong> (art. 21 RODO) wobec przetwarzania
          </li>
        </ul>
        <p className="mb-4">
          Aby skorzystać ze swoich praw, możesz w każdej chwili skontaktować się z nami
          pod adresem podanym powyżej.
        </p>
        <p>
          Masz również prawo złożyć skargę do organu nadzorczego ds. ochrony danych
          osobowych. Właściwym dla nas organem nadzorczym jest Landesbeauftragter
          f&uuml;r den Datenschutz und die Informationsfreiheit Baden-W&uuml;rttemberg (
          <a
            href="https://www.baden-wuerttemberg.datenschutz.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            www.baden-wuerttemberg.datenschutz.de
          </a>
          ).
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          11. Szyfrowanie SSL/TLS
        </h2>
        <p>
          Ze względów bezpieczeństwa ta strona korzysta z szyfrowania SSL lub TLS.
          Szyfrowane połączenie można rozpoznać po zmianie adresu w przeglądarce z
          &bdquo;http://&rdquo; na &bdquo;https://&rdquo; oraz po symbolu kłódki w pasku
          adresu przeglądarki.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-on-surface">
          12. Aktualność niniejszej polityki prywatności
        </h2>
        <p>
          Stan: marzec 2026. Zastrzegamy sobie prawo do dostosowania niniejszej polityki
          prywatności w celu uwzględnienia zmian prawnych lub zmian na naszej stronie
          internetowej.
        </p>
      </section>
    </div>
  );
}

const headings: Record<string, { label: string; title: string }> = {
  en: { label: 'Legal', title: 'Privacy Policy' },
  de: { label: 'Rechtliches', title: 'Datenschutz' },
  pl: { label: 'Informacje prawne', title: 'Polityka prywatności' },
};

export default async function DatenschutzPage() {
  const locale = await getLocale();
  const h = headings[locale] || headings.en;

  return (
    <main className="pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        <p className="section-label">{h.label}</p>
        <h1 className="section-heading mb-16">{h.title}</h1>

        {locale === 'de' && <DatenschutzDE />}
        {locale === 'pl' && <DatenschutzPL />}
        {locale !== 'de' && locale !== 'pl' && <DatenschutzEN />}
      </div>
    </main>
  );
}
