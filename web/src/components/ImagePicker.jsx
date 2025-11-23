import { useState, useCallback } from "react";
import { COLORS } from "../constants/theme";
import Cropper from "react-easy-crop";
import Icon from "../constants/Icon";
import "./ImagePicker.scss";

const ImagePicker = ({ isOpen, onClose, onImageCropped, currentImage, aspectRatio = 1 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = useCallback(async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Determine output size to preserve quality
        // Target a max output height (portrait) of 1920px, but do not upscale beyond the crop size
        const deviceScale = (window && window.devicePixelRatio) ? Math.max(1, Math.min(2, window.devicePixelRatio)) : 1;
        const desiredMaxOutputHeight = 1920;

        const outputHeight = Math.min(pixelCrop.height, desiredMaxOutputHeight);
        const outputWidth = Math.round(outputHeight * aspectRatio);

        canvas.width = Math.round(outputWidth * deviceScale);
        canvas.height = Math.round(outputHeight * deviceScale);

        // Use high quality scaling
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.92);
      };
      image.src = imageSrc;
    });
  }, [aspectRatio]);

  const handleConfirm = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      );
      const file = new File([croppedImage], 'cropped-image.jpg', { type: 'image/jpeg' });
      onImageCropped(file);
      handleClose();
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  }, [imageSrc, croppedAreaPixels, getCroppedImg, onImageCropped]);

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setImageSrc(null);
    setShowCropper(false);
    onClose();
  };

  const handleBackToSelection = () => {
    setShowCropper(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  if (!isOpen) return null;

  return (
    <div className="image-picker-modal">
      <div className="image-picker-modal-content">
        <div className="image-picker-header">
          <h3>{showCropper ? "Recortar Imagen" : "Seleccionar Imagen"}</h3>
          <button className="close-button" onClick={handleClose}>
            <Icon name="close" size={24} color={COLORS.black_01} />
          </button>
        </div>

        {!showCropper ? (
          <div className="image-picker-selection">
            <div className="current-image-preview">
              {currentImage ? (
                <div className="current-image">
                  <img 
                    src={typeof currentImage === "string" ? currentImage : URL.createObjectURL(currentImage)} 
                    alt="Imagen actual" 
                  />
                  <div className="current-image-overlay">
                    <p>Imagen actual</p>
                  </div>
                </div>
              ) : (
                <div className="no-current-image">
                  <p>No hay imagen actual</p>
                </div>
              )}
            </div>
            <div className="file-selection">
              <label htmlFor="imageFileInput" className="file-input-label">
                <div className="upload-icon">
                  <Icon name="plus" size={24} color={COLORS.white_01} />
                </div>
                <p>
                  Seleccionar
                  <br />
                  Una Imagen
                </p>
                <input id="imageFileInput" type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
              </label>
            </div>
          </div>
        ) : (
          <>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={true}
              style={{
                containerStyle: {
                  background: COLORS.white_01,
                  position: "relative",
                  height: "360px",
                  width: "100%",
                },
              }}
            />
            <div className="image-picker-controls">
              <div className="control-group">
                <label>Zoom {zoom}</label>
                <input onChange={(e) => setZoom(Number(e.target.value))} value={zoom} type="range" step={0.1} min={1} max={3} />
              </div>
            </div>
          </>
        )}

        <div className="image-picker-actions">
          {showCropper && (
            <>
              <button className="back-button" onClick={handleBackToSelection}>
                Volver
              </button>
              <button className="confirm-button" onClick={handleConfirm}>
                Confirmar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePicker;
