import { nameRegex, emailRegex, usernameRegex } from "../../constants/basicRegex";
import { profileImageGetter } from "../../constants/imageGetter";
import ImagePicker from "../../components/ImagePicker";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../config/axios";
import { toast } from "material-react-toastify";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../constants/theme";
import { useEffect, useState } from "react";
import Transition from "../../Transition";
import Icon from "../../constants/Icon";
import { motion } from "framer-motion";
import "./styles/userProfile.scss";

export function UserProfile() {
  const { logout, authState, setValue } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(authState.user.username);
  const [email, setEmail] = useState(authState.user.email);
  const [name, setName] = useState(authState.user.name);
  const [statusMsg, setStatusMsg] = useState({error: null, message: "Completa los campos que desees actualizar."});
  const [updateInProgress, setUpdateInProgress] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [emailStatus, setEmailStatus] = useState(0);
  const [nameStatus, setNameStatus] = useState(0);
  const [success, setSuccess] = useState(false);

  const { data: usernameData, isLoading: usernameLoading } = useQuery({
    queryFn: () => makeRequest.get("/auth/username/check", { params: { username: JSON.stringify({ text: username })}}).then(res => res.data),
    enabled: username && username.trim().length >= 4 && !username.includes(" ") && usernameRegex.test(username) && username !== authState.user.username,
    queryKey: ["username-check", username],
  });

  const { data: emailData, isLoading: emailLoading } = useQuery({
    queryFn: () => makeRequest.get("/auth/email/check", { params: { email: JSON.stringify({ text: email ? email.trim() : "" })}}).then(res => res.data)
      .catch(err => { 
        if (err.response?.status === 401) { return { error: true, message: "Email no válido" }; } 
        throw err; 
      }),
    enabled: email && email.trim().length > 4 && emailRegex.test(email.trim()) && email !== authState.user.email,
    queryKey: ["email-check", email],
  });

  useEffect(() => {
    if (authState.user) {
      setUsername(authState.user.username);
      setEmail(authState.user.email);
      setName(authState.user.name);
      setProfileImage(authState.user.image);
    }
  }, [authState.user]);

  useEffect(() => {
    if (!username) {
      setStatusMsg({error: null, message: "Completa los campos que desees actualizar."});
      setUsernameStatus(0);
      return;
    }
    
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setStatusMsg({error: null, message: "Completa los campos que desees actualizar."});
      setUsernameStatus(0);
      return;
    }

    if (username.includes(" ")) {
      setStatusMsg({error: true, message: "Sin espacios en el usuario."});
      setUsernameStatus(2);
      return;
    }

    if (!usernameRegex.test(username)) {
      setStatusMsg({error: true, message: "Caracteres especiales no permitidos."});
      setUsernameStatus(2);
      return;
    }

    if (trimmedUsername.length < 4) {
      setStatusMsg({error: true, message: "Nombre de usuario demasiado corto."});
      setUsernameStatus(2);
      return;
    }

    if (username === authState.user.username) {
      setUsernameStatus(3);
      setStatusMsg({error: false, message: "Nombre de usuario actual."});
      return;
    }

    setUsernameStatus(1);
    setStatusMsg({error: false, message: "Verificando..."});

    if (!usernameLoading && usernameData !== undefined) {
      const isValid = usernameRegex.test(username);
      const status = isValid ? (usernameData?.inUse ? 2 : 3) : 2;
      const message = isValid ? (usernameData?.inUse ? "Nombre de usuario en uso." : "Nombre de usuario válido.") : "Caracteres especiales no permitidos.";
      setUsernameStatus(status);
      setStatusMsg({ error: status === 2, message});
    }
  }, [username, usernameLoading, usernameData, authState.user.username]);

  useEffect(() => {
    if (!email) {
      setEmailStatus(0);
      return;
    }
    
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setEmailStatus(0);
      return;
    }

    if (trimmedEmail.length <= 4) {
      setStatusMsg({error: true, message: "Email demasiado corto."});
      setEmailStatus(2);
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setStatusMsg({error: true, message: "Email inválido."});
      setEmailStatus(2);
      return;
    }

    if (email === authState.user.email) {
      setEmailStatus(3);
      setStatusMsg({error: false, message: "Email actual."});
      return;
    }

    setEmailStatus(1);
    setStatusMsg({error: false, message: "Verificando..."});

    if (!emailLoading && emailData !== undefined) {
      const isValid = emailRegex.test(email);
      const status = isValid ? (emailData?.inUse ? 2 : 3) : 2;
      const message = isValid ? (emailData?.inUse ? "Email en uso." : "Email válido.") : "Email inválido.";
      setEmailStatus(status);
      setStatusMsg({ error: status === 2, message});
    }
  }, [email, emailLoading, emailData, authState.user.email]);

  useEffect(() => {
    if (name && name !== "") {
      if (name.trim().length < 2) {
        setStatusMsg({ error: true, message: "Nombre demasiado corto" });
        setNameStatus(1);
      } else if (!nameRegex.test(name)) {
        setStatusMsg({ error: true, message: "Nombre inválido" });
        setNameStatus(1);
      } else {
        setStatusMsg({ error: false, message: "Nombre válido" });
        setNameStatus(2);
      }
    }
  }, [name]);

  useEffect(() => {
    const hasChanges = username !== authState.user.username || email !== authState.user.email || name !== authState.user.name || (profileImage !== null && typeof profileImage !== "string");
    const isValidUsername = username === authState.user.username || (username.length >= 4 && usernameRegex.test(username) && !usernameData?.inUse);
    const isValidEmail = email === authState.user.email || (email.length > 4 && emailRegex.test(email) && !emailData?.inUse);
    const isValidName = name === authState.user.name || (name && name.trim().length >= 2 && nameRegex.test(name));
    const successValue = hasChanges && isValidUsername && isValidEmail && isValidName;
    
    setSuccess(successValue);
  }, [username, email, name, usernameData, emailData, authState.user, profileImage]);

  const handleImageCropped = (croppedFile) => {
    setProfileImage(croppedFile);
    setShowImagePicker(false);
  };

  const handleImagePickerClose = () => {
    setShowImagePicker(false);
  };

  const handleImageClick = () => {
    setShowImagePicker(true);
  };

  const handleUpdate = async () => {
    if (updateInProgress || !success) return;

    const hasImageChanges = profileImage !== null && typeof profileImage !== "string";
    const hasUsernameChanges = username && username.trim() !== authState.user.username;
    const hasEmailChanges = email && email.trim() !== authState.user.email;
    const hasNameChanges = name && name.trim() !== authState.user.name;

    if (hasUsernameChanges && usernameStatus !== 3) {
      setStatusMsg({ error: true, message: "Complete la validación del nombre de usuario" });
      return;
    }

    if (hasEmailChanges && emailStatus !== 3) {
      setStatusMsg({ error: true, message: "Complete la validación del email" });
      return;
    }

    if (hasNameChanges && nameStatus !== 2) {
      setStatusMsg({ error: true, message: "Complete la validación del nombre" });
      return;
    }

    const hasChanges = hasUsernameChanges || hasEmailChanges || hasNameChanges || hasImageChanges;

    if (!hasChanges) {
      setStatusMsg({ error: null, message: "No hay cambios para guardar" });
      return;
    }

    setUpdateInProgress(true);

    try {
      const formData = new FormData();
      
      if (hasImageChanges && typeof profileImage !== "string") formData.append("image", profileImage, "profile.jpg");

      const newUserData = {
        username: username ? username.trim() : "",
        adminName: name ? name.trim() : "",
        email: email ? email.trim() : "",
      };
      
      formData.append("newUser", JSON.stringify(newUserData));

      const res = await makeRequest.put("/producer/own", formData, { headers: { authorization: authState.token, "Content-Type": "multipart/form-data" } });
      const user = res.data;

      setValue("username", user.username);
      setValue("email", user.email);
      setValue("name", user.adminName);
      setValue("image", user.image);

      toast.success("Perfil actualizado correctamente");
      setStatusMsg({ error: false, message: "Perfil actualizado correctamente" });
      
    } catch (error) {
      const { response } = error;
      if (response?.status === 408) {
        toast.error("Contraseña incorrecta");
        setStatusMsg({ error: true, message: "Contraseña incorrecta" });
      } else if (response?.status === 409) {
        toast.error("El nombre de usuario o email ya están en uso");
        setStatusMsg({ error: true, message: "El nombre de usuario o email ya están en uso" });
      } else {
        toast.error("Error al actualizar el perfil");
        setStatusMsg({ error: true, message: "Error al actualizar el perfil" });
      }
    } finally {
      setUpdateInProgress(false);
    }
  };

  return (
    <div id="UserProfile">
      <nav>
        <button id="backButton" onClick={() => navigate(-1)}>
          <Icon name="left-arrow" color={COLORS.white_01} size={24}/>
        </button>

        <button id="logoutButton" onClick={logout}>
          <div id="logoutButtonIcon">
            <Icon name="user" color={COLORS.red_01} size={24}/>
          </div>
          <p>CERRAR<br/>SESION</p>
        </button>
      </nav>
      <main>
        <section>
          <h1><b>Editar</b> Perfil</h1>
          <p id="statusMessage" style={{ color: statusMsg.error === true ? COLORS.red_01 : statusMsg.error === false ? COLORS.purple_01 : COLORS.gray_01 }}>{statusMsg.message}</p>

          <div id="formHeaderContainer">
            <div id="imageContainer" onClick={handleImageClick}>
              <img src={ profileImage ? (typeof profileImage === "string" ? profileImageGetter(profileImage) : URL.createObjectURL(profileImage)) : profileImageGetter(authState.user?.image) } alt="Profile" />
              <div id="imageOverlay">
                <Icon name="reload-arrow" size={32} color={COLORS.white_01} />
              </div>
            </div>
            <div id="formHeaderInputContainer">
              <div className={`inputWithStatus ${usernameStatus === 2 ? "invalid" : ""}`}>
                <input type="text" placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} />
                <div className="inputStatus">
                  <Icon name={["user-check", "clock", "close", "user-check"][usernameStatus]} size={24} color={["transparent", COLORS.white_01, COLORS.red_01, COLORS.purple_01][usernameStatus]} />
                </div>
              </div>
            </div>
          </div>

          <div id="formBodyContainer">
            <div className={`inputWithStatus ${emailStatus === 2 ? "invalid" : ""}`}>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={100} />
              <div className="inputStatus">
                <Icon name={["user-check", "clock", "close", "user-check"][emailStatus]} size={24} color={["transparent", COLORS.white_01, COLORS.red_01, COLORS.purple_01][emailStatus]} />
              </div>
            </div>
            <div className={`inputWithStatus ${nameStatus === 1 ? "invalid" : ""}`}>
              <input type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
              <div className="inputStatus">
                <Icon name={["user-check", "close", "user-check"][nameStatus]} size={24} color={["transparent", COLORS.red_01, COLORS.purple_01][nameStatus]} />
              </div>
            </div>
          </div>

          <motion.button 
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            disabled={!success || updateInProgress}
            style={{ opacity: success ? 1 : 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpdate}
            id="updateButton"
          >
            {updateInProgress ? <p>Actualizando...</p> : <p>Actualizar Perfil</p>}
          </motion.button>
        </section>
      </main>

      <ImagePicker
        isOpen={showImagePicker}
        currentImage={typeof profileImage === "string" ? profileImageGetter(profileImage) : profileImage}
        onClose={handleImagePickerClose}
        onImageCropped={handleImageCropped}
      />
    </div>
  )
}

export default Transition(UserProfile);
