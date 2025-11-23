import dprofile from "../assets/dprofile.png";

export function profileImageGetter(profileImg, theme = 1) {
  if(!profileImg || profileImg === null){
    if(theme === 1) return dprofile;
    else return dprofile;
  }else return import.meta.env.VITE_API_URL + "/image/profile/" + profileImg;
}