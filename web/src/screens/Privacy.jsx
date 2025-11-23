import { useNavigate } from "react-router-dom";
import Transition from "../Transition";
import { motion } from "framer-motion";
import Icon from "../constants/Icon";
import "./styles/privacy&Terms.scss";

export function Privacy() {
  const navigate = useNavigate();

  return (
    <div id="Privacy">
      <nav>
        <motion.button
          id="subPreviateContaienr"
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
        >
          <div id="previateContainer">
            <Icon name="previate" size={28} />
          </div>
          <h2>PREVIATE<br/>ESTA</h2>
        </motion.button>
      </nav>
      <main>
        <section aria-labelledby="privacy-title">
          <h1 id="privacy-title">Privacy Policy</h1>
          <p className="subtitle">Last updated: August 25, 2025</p>

          <p>
            At Previate Esta, we respect your privacy and are committed to protecting your
            personal information. This Privacy Policy explains how we collect, use, share,
            and protect data when you use the App, in compliance with applicable global
            data protection laws (including GDPR, CCPA, and others where applicable).
          </p>

          <h2>1. Information We Collect</h2>
          <ul>
            <li>
              <strong>Registration Data:</strong> email address, username, gender, gender
              preferences, estimated age.
            </li>
            <li>
              <strong>Location Data:</strong> to suggest nearby events, bars, shows, and groups.
            </li>
            <li>
              <strong>Device Permissions:</strong> camera (for games), microphone (for games).
            </li>
            <li>
              <strong>Content:</strong> photos uploaded to the group section.
            </li>
            <li>
              <strong>Usage Data:</strong> interaction with the App, device type, operating
              system, app version, crash logs, cookies, IP address, and ad identifiers.
            </li>
            <li>
              <strong>Advertising Data:</strong> information collected by Google AdMob and
              Google Ad Manager, which may include device identifiers, approximate
              location, app interactions, and interests for ad targeting.
            </li>
          </ul>

          <h2>2. How We Use the Information</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Operate and improve the App.</li>
            <li>Provide personalized event and group recommendations.</li>
            <li>Enable entertainment features.</li>
            <li>Serve personalized and non-personalized advertising.</li>
            <li>Ensure compliance with legal obligations.</li>
          </ul>

          <h2>3. Advertising and Analytics</h2>
          <ul>
            <li>
              We use Google AdMob and Google Ad Manager for in-app advertising. These
              third parties may collect and use your data independently.
            </li>
            <li>
              Learn more about Google’s advertising practices:
              {" "}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer noopener">
                Google Ads Technologies
              </a>
              {" "}
              and
              {" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener">
                Google Privacy Policy
              </a>
              .
            </li>
            <li>
              We may also use analytics tools (e.g., Google Analytics for Firebase) to
              monitor app performance and improve user experience.
            </li>
          </ul>

          <h2>4. Sharing of Information</h2>
          <p>We do not sell personal data. We may share information:</p>
          <ul>
            <li>With service providers who support the operation of the App.</li>
            <li>With law enforcement or regulators when required by law.</li>
            <li>In connection with business transfers (e.g., merger, acquisition).</li>
            <li>In anonymized or aggregated form for research and statistical purposes.</li>
          </ul>

          <h2>5. User Rights</h2>
          <p>
            Depending on your jurisdiction (e.g., GDPR in the EU, CCPA in California), you
            may have rights to:
          </p>
          <ul>
            <li>Access, correct, update, or delete your personal data.</li>
            <li>Object to or restrict processing of your data.</li>
            <li>Withdraw consent at any time.</li>
            <li>Request data portability.</li>
          </ul>
          <p>
            To exercise your rights, contact us at
            {" "}
            <a href="mailto:data@previateesta.com">data@previateesta.com</a>.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary for the purposes stated, or
            as required by law.
          </p>

          <h2>7. Security</h2>
          <p>
            We implement reasonable technical and organizational measures to protect your
            information. However, no method of transmission or storage is 100% secure. You
            use the App at your own risk.
          </p>

          <h2>8. Children’s Privacy</h2>
          <p>
            The App is not directed to individuals under 18 years of age. We do not
            knowingly collect personal data from minors. If we discover such data has been
            collected, it will be deleted promptly.
          </p>

          <h2>9. Global Use</h2>
          <p>
            As the App is available worldwide, data may be transferred and processed in
            countries outside your residence. By using the App, you consent to such
            international data transfers, in compliance with applicable law.
          </p>

          <h2>10. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Updates will be posted in
            the App and/or on our website. Continued use of the App constitutes acceptance
            of the updated Policy.
          </p>

          <h2>11. Contact</h2>
          <p style={{ marginBottom: 128 }}>
            For questions about this Privacy Policy, please contact us at
            {" "}
            <a href="mailto:data@previateesta.com">data@previateesta.com</a>.
          </p>
        </section>
      </main>
    </div>
  )
}

export default Transition(Privacy);