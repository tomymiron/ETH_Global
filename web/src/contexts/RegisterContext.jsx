import { createContext, useContext, useState } from "react";

const RegisterContext = createContext();

export const useRegister = () => {
    return useContext(RegisterContext);
};

export const RegisterProvider = ({children}) => {
  const defaults = {
    google: false,
    apple: false,
    sub: "",

    username: "",
    password: "",
    image: null,
    born: null,
    email: "",
    name: "",

    code: "",
    echeck: false,
  };

  const [newUser, setNewUser] = useState(defaults); 
  const handleNewUser = (name, value) => {
    setNewUser((prev) => ({...prev, [name]: value}));
  };

  const resetNewUser = () => {
    setNewUser(defaults);
  };
  
  const value = { newUser, handleNewUser, resetNewUser };
  
  return (
  <RegisterContext.Provider value={value}>
    {children}
  </RegisterContext.Provider>);
}