import { useNavigate } from "react-router-dom";
import sendWhatsapp from "../../utils/sendWhatsapp";
import Transition from "../../Transition";
import Icon from "../../constants/Icon";
import { motion } from "framer-motion";
import "./styles/userRegister.scss";

export function UserRegister() {
  const navigate = useNavigate();

  const handleContinue = () => {
    sendWhatsapp("Quiero convertirme en productor, pueden enviarme un link de registro?");
  }

  return (
    <div id="UserRegister">
      <nav>
        <div id="previateContainer">
          <Icon name="previate" size={28} />
        </div>
        <h2>PREVIATE<br/>ESTA</h2>
      </nav>
      <main>
        <section>
          <div id="worldContainer">
            <Icon name="world" size={300} />
          </div>
          <h1>Forma parte de <b>PREVIATE ESTA</b></h1>
          <p className="subTitle">Contactanos y solicita acceso para convertirte en productor!</p>

          <motion.button 
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            whileHover={{ scale: 1.02, x: "-50%" }}
            whileTap={{ scale: 0.95, x: "-50%" }}
            onClick={handleContinue}
            initial={{ x: "-50%" }}
            id="continueButton"
          >
            <p>Unirme Ya!</p>
          </motion.button>
        </section>
      </main>
    </div>
  )
}

export default Transition(UserRegister);