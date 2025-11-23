import dprofile from "../assets/dprofile.png";

export function profileImageGetter(profileImg, theme = 1) {
  if(!profileImg || profileImg === null){
    if(theme === 1) return dprofile;
    else return dprofile;
  }else return "https://api.previateesta.com/image/profile/" + profileImg;
}