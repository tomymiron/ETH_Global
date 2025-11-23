import { useNavigate } from "react-router-dom";
import Transition from "../Transition";
import { motion } from "framer-motion";
import Icon from "../constants/Icon";
import "./styles/privacy&Terms.scss";

export function Terms() {
  const navigate = useNavigate();

  return (
    <div id="Terms">
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
        <section aria-labelledby="terms-title">
          <h1 id="terms-title">Terms and Conditions</h1>
          <p className="subtitle">Last updated: August 25, 2025</p>

          <p>
            Welcome to Previate Esta ("the App"), operated by Previate Esta ("the Company",
            "we", "our" or "us"). These Terms of Use ("Terms") govern your access to and use
            of the App worldwide. By downloading, accessing, or using the App, you agree to be
            bound by these Terms. If you do not agree, you must not use the App.
          </p>

          <h2>1. Eligibility</h2>
          <ul>
            <li>You must be at least 18 years old to use the App.</li>
            <li>
              By using the App, you confirm that you are legally capable of entering into
              binding agreements under the laws of your country of residence.
            </li>
          </ul>

          <h2>2. Services Provided</h2>
          <p>The App provides:</p>
          <ul>
            <li>Entertainment mini-games, some requiring access to camera or microphone.</li>
            <li>
              Discovery of events, bars, and shows based on your location and preferences,
              with links to third-party ticketing or event sites. The App does not act as a
              ticketing platform nor as an intermediary of sales.
            </li>
            <li>
              Group discovery: you may upload a photo of your group of friends and find
              other groups. Direct interactions are redirected to Instagram. The App does
              not provide built-in messaging.
            </li>
          </ul>

          <h2>3. Accounts and Registration</h2>
          <ul>
            <li>Users may register with an email address.</li>
            <li>
              Upon registration, a username is generated. Users may also set gender, gender
              preferences, and estimated age for group features.
            </li>
            <li>
              You are responsible for the accuracy of information provided and for
              maintaining the confidentiality of your credentials.
            </li>
            <li>
              We may suspend or terminate accounts at our discretion if we believe these
              Terms have been violated or to comply with legal or platform requirements.
            </li>
          </ul>

          <h2>4. User Responsibilities</h2>
          <p>You agree that you will not:</p>
          <ul>
            <li>
              Post or share any illegal, offensive, defamatory, discriminatory, violent,
              sexually explicit, or harmful content.
            </li>
            <li>Use the App for fraud, harassment, or unlawful purposes.</li>
            <li>Infringe intellectual property rights or privacy rights of others.</li>
          </ul>
          <p>
            We reserve the right to remove content or restrict access to users who violate
            these Terms.
          </p>

          <h2>5. Permissions Required</h2>
          <p>The App may request the following device permissions:</p>
          <ul>
            <li>Location: to display nearby events, bars, shows, and groups.</li>
            <li>Camera: for entertainment features in certain games.</li>
            <li>Microphone: for entertainment features in certain games.</li>
          </ul>
          <p>
            These permissions are used strictly for the functions described and not for any
            other purpose.
          </p>

          <h2>6. Advertising and Third-Party Services</h2>
          <ul>
            <li>
              The App uses Google AdMob and Google Ad Manager to serve personalized and
              non-personalized ads. These services may automatically collect certain
              information, including but not limited to: device identifiers, IP address,
              browsing behavior, general location, and interaction with ads.
            </li>
            <li>
              By using the App, you consent to the processing of your data by Google in
              accordance with Google’s Privacy Policy.
            </li>
            <li>
              We do not control and are not responsible for the data collected by
              third-party advertising partners.
            </li>
          </ul>

          <h2>7. Third-Party Content and Links</h2>
          <ul>
            <li>
              The App may contain links to third-party websites, services, or ticketing
              platforms. We do not control these third parties and are not responsible for
              their content, accuracy, security, or policies.
            </li>
            <li>
              Group interactions are redirected to Instagram or other external platforms.
              We disclaim any responsibility for communications or activities conducted
              outside the App.
            </li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <p>
            All content, design, software, trademarks, and logos associated with the App
            are the exclusive property of the Company or its licensors. You may not copy,
            modify, distribute, or exploit them without prior written authorization.
          </p>

          <h2>9. Termination and Account Deletion</h2>
          <ul>
            <li>
              We may suspend, limit, or terminate access to your account at any time, with
              or without notice, for reasons including but not limited to violation of
              these Terms, suspicious activity, or compliance with applicable laws.
            </li>
            <li>
              You may request deletion of your account and associated data by contacting us
              at <a href="mailto:data@previateesta.com">data@previateesta.com</a>.
            </li>
          </ul>

          <h2>10. Disclaimer of Warranties</h2>
          <p>
            The App is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee
            uninterrupted, error-free, or secure operation. To the fullest extent permitted
            by law, we disclaim all warranties, express or implied, including
            merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <h2>11. Limitation of Liability</h2>
          <ul>
            <li>
              We shall not be liable for any indirect, incidental, consequential, punitive,
              or special damages, including loss of profits, data, or goodwill.
            </li>
            <li>
              We are not liable for damages arising from third-party services, external
              links, or user interactions outside the App.
            </li>
          </ul>

          <h2>12. Governing Law and Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed under the laws of your country of
            residence, except where overridden by mandatory legal provisions. Any disputes
            will be resolved exclusively in the competent courts of that jurisdiction.
          </p>

          <h2>13. Changes to the Terms</h2>
          <p>
            We may update these Terms at any time. Updates will be posted in the App and/or
            on our website. Continued use after changes indicates acceptance of the revised
            Terms.
          </p>

          <h2>14. Contact</h2>
          <p style={{ marginBottom: 128 }}>
            For questions regarding these Terms, contact us at:
            {" "}
            <a href="mailto:data@previateesta.com">data@previateesta.com</a>
          </p>

        </section>
      </main>
    </div>
  )
}

export default Transition(Terms);