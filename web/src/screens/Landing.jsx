import home01Image from "../assets/home.png";
import { COLORS } from "../constants/theme";
import Transition from "../Transition";
import Icon from "../constants/Icon";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import { motion } from "framer-motion";
import sendWhatsapp from "../utils/sendWhatsapp";

export function Landing() {
  useEffect(() => {import("./styles/landing.scss")}, []);

  const [isHorizontal, setIsHorizontal] = useState(window.innerWidth > window.innerHeight);
  const [pageLoad, setPageLoad] = useState(false);

  useEffect(() => {
    setPageLoad(true)
  }, []);

  useEffect(() => {
    const handleResize = () => { const isLandscape = window.innerWidth > window.innerHeight; setIsHorizontal(isLandscape); };
    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return (
    <div id="Landing">
      {!isHorizontal && <Sidebar pageLoad={pageLoad}/>}
      <nav>
        <div id="previateContainer">
          <div id="previateIcon">
            <Icon name="previate" size={isHorizontal ? 48 : 30} />
          </div>
          <h2>PREVIATE<br/>ESTA</h2>
        </div>

        {isHorizontal ?
          <div id="navButtonsContainer">

            {/* <motion.button id="producerPanelButton" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} whileHover={{ scale: 1.05, transition: { duration: 0.2 } }} whileTap={{ scale: 0.85, transition: { duration: 0.1 } }} onClick={() => window.location.href = "/org/panel"} >
              <p>REGISTRO<br/>USUARIO</p>
            </motion.button>

            <motion.button id="producerPanelButton" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} whileHover={{ scale: 1.05, transition: { duration: 0.2 } }} whileTap={{ scale: 0.85, transition: { duration: 0.1 } }} onClick={() => window.location.href = "/org/panel"} >
              <p>PANEL<br/>PRODUCTOR</p>
            </motion.button> */}

            <motion.button id="addEventButton" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} whileHover={{ scale: 1.05, transition: { duration: 0.2 } }} whileTap={{ scale: 0.85, transition: { duration: 0.1 } }} onClick={() => sendWhatsapp("Hola STAFF! Quiero sumar mi evento.")} >
              <p>SUMAR MI<br/>EVENTO</p>
            </motion.button>

          </div>
        : null
        }
        
      </nav>
      <main>
        <section id="home01">
          <div id="welcomeContainer">
            <div id="socialsContainer">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.8,
                  transition: { duration: 0.1 }
                }}
                onClick={() => window.open("https://www.facebook.com/profile.php?id=100063497767281", "_blank")}
              >
                <Icon name="facebook" size={24} color={COLORS.purple_01} />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.8,
                  transition: { duration: 0.1 }
                }}
                onClick={() => window.open("https://www.tiktok.com/@previateesta", "_blank")}
              >
                <Icon name="tiktok" size={24} color={COLORS.purple_01} />
              </motion.button>
              <motion.button 
                className="active"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.8,
                  transition: { duration: 0.1 }
                }}
                onClick={() => window.open("https://www.instagram.com/previateesta", "_blank")}
              >
                <Icon name="instagram" size={24} color={COLORS.black_01} />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.8,
                  transition: { duration: 0.1 }
                }}
                onClick={() => window.open("https://www.youtube.com/@previateesta", "_blank")}
              >
                <Icon name="youtube" size={24} color={COLORS.purple_01} />
              </motion.button>
            </div>

            <h1>PREVIATE<br/>ESTA</h1>

            <h2>La esencia de tu noche.</h2>

            <div id="downloadButtons">
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ 
                  scale: 0.85,
                  transition: { duration: 0.1 }
                }}
                onClick={() => window.open("https://play.google.com/store/apps/details?id=com.previate.esta", "_blank")}
              >
                <Icon name="play-store" size={48} />

                <div className="downloadText">
                  <p className="downloadTextTitle">Descarga en</p>
                  <p className="downloadTextStore">Play Store</p>
                </div>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ 
                  scale: 0.85,
                  transition: { duration: 0.1 }
                }}
                onClick={() => window.open("https://apps.apple.com/ar/app/previate-esta/id1482071439", "_blank")}
              >
                <Icon name="app-store" size={48} color={COLORS.white_01} />

                <div className="downloadText">
                  <p className="downloadTextTitle">Descarga en</p>
                  <p className="downloadTextStore">App Store</p>
                </div>
              </motion.button>
            </div>
          </div>

          <div id="home01Image">
            
            <motion.div 
              id="previateIcon"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: 0,
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 1.2, 
                delay: 0.8,
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              whileHover={{
                scale: 1.05,
                rotate: 5,
                transition: { duration: 0.3 }
              }}
            >
              <Icon name="previate" size={314} />
            </motion.div>

            <motion.img 
              src={home01Image}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1
              }}

              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            />
          </div>

          <motion.button 
            id="addEventButton"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.85,
              transition: { duration: 0.1 }
            }}
            onClick={() => sendWhatsapp("Hola STAFF! Quiero sumar mi evento.")}
          >
            <div id="addEventButtonIcon">
              <Icon name="plus" size={24} color={COLORS.white_01} />
            </div>
            <p>SUMAR MI<br/>EVENTO</p>
          </motion.button>
        </section>
      </main>
    </div>
  );
}

export default Transition(Landing);