const sendWhatsapp = (message = "Hello Previate 🤠", phoneNumber = "5491134808000") => {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(url, "_blank");
};

export default sendWhatsapp;