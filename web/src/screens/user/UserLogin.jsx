import { useAuth } from "../../contexts/AuthContext";
import sendWhatsapp from "../../utils/sendWhatsapp";
import { makeRequest } from "../../config/axios";
import { toast } from "material-react-toastify";
import { useNavigate } from "react-router-dom";
import Transition from "../../Transition";
import Icon from "../../constants/Icon";
import { useState } from "react";
import "./styles/userLogin.scss";

function UserLogin() {

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loginInProgress, setLoginInProgress] = useState(false);
  const { setLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (loginInProgress) return;
    
    // Validación básica de campos
    if (!user.trim() || !pass.trim()) {
      toast.error("Completa todos los campos", { theme: "colored", position: "bottom-right" });
      return;
    }
    
    setLoginInProgress(true);
    
    try{
      const res = await makeRequest.post("/auth/login", { credentials: JSON.stringify({user: user.trim(), password: pass}) });
      toast.success("Ingreso exitoso", { theme: "colored", position: "bottom-right" });
      await setLogin(res.data.user, res.data.token);
      setTimeout(() => {
        navigate("/events");
      }, 350);
    }catch(err){
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'string' ? errorData : errorData?.message || "Error al iniciar sesión";
      toast.error(errorMessage, { theme: "colored", position: "bottom-right" });
    } finally {
      setLoginInProgress(false);
    }
  }

  return (
    <div id="UserLogin">
      <main>
        <div id="previateIcon">
          <Icon name="previate" size={38}/>
        </div>
        <h1>¡Hola de nuevo!</h1>
        <p id="description">Panel de productor, accedé al panel<br/>para administrar tu perfil y fiestas.</p>

        <input value={user} onChange={e => setUser(e.target.value)} autoCapitalize="none" spellCheck={false} autoCorrect="none" placeholder="Usuario o email" type="text"/>
        <input value={pass} onChange={e => setPass(e.target.value)} autoCapitalize="none" spellCheck={false} autoCorrect="none" placeholder="Contraseña" type="password"/>

        <button id="loginBtn" onClick={handleLogin} disabled={loginInProgress} style={{ opacity: loginInProgress ? 0.7 : 1 }}>
          {loginInProgress ?  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="loading-spinner"></div>
              <p>Ingresando...</p>
            </div>
          : <p>INGRESAR</p> }
        </button>

        <div id="separatorContainer">
          <div />
          <p>¿No tenés cuenta?</p>
          <div />
        </div>

        <button id="requestButton" onClick={() => sendWhatsapp("Hola STAFF! Quiero unirme a PREVIATE ESTA como productor.")}>
          <p>Unite a Previate</p>
        </button>
        <button id="problemsButton" onClick={() => sendWhatsapp("Hola STAFF! Soy productor y tengo problemas con mi usuario para entrar al panel.")}>
          <p>¿Problemas al ingresar?</p>
        </button>
      </main>
    </div>
  );
}

export default Transition(UserLogin);