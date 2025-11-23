import { motion } from "framer-motion"

const variants = {
    open: {
        transition: {
            staggerChildren: 0.1
        },
    },
    closed: {
        transition: {
            staggeredChildren: 0.05,
            staggeredDirection: -1
        }
    }
};
const itemVariants = {
    open: {
        y: 0,
        opacity: 1,
    },
    closed: {
        y: 50,
        opacity: 0,
    }
}
export default function Links() {

    const mainItems = [
      { label: "SIGN IN ACCOUNT", href: "/user/login" },
      { label: "UPLOAD MY EVENT", href: "https://api.whatsapp.com/send/?phone=5491134808000&text=Hola+STAFF%21+Quiero+sumar+mi+evento.&type=phone_number&app_absent=0" },
    ];

    const footerItems = [
      { label: "Politica de Privacidad", href: "/privacy" },
      { label: "Terminos y Condiciones", href: "/terms" },
    ];
  
    return (
      <motion.div className="links" variants={variants}>
        <div className="main-links">
          {mainItems.map((item, index) => (
            <motion.a
              key={index}
              href={item.href}
              variants={itemVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.action ? (e) => { e.preventDefault(); item.action();} : undefined}
            >
              {item.label}
            </motion.a>
          ))}
        </div>
        
        <div className="footer-links">
          {footerItems.map((item, index) => (
            <motion.a
              key={index}
              href={item.href}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.action ? (e) => { e.preventDefault(); item.action();} : undefined}
            >
              {item.label}
            </motion.a>
          ))}
        </div>
      </motion.div>
    );
  }