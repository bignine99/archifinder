
'use client';

import Image, { type ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

// Extend ImageProps to include our custom onImageError callback
interface SafeImageProps extends ImageProps {
  onImageError?: () => void;
}

const SafeImage = (props: SafeImageProps) => {
  const { src, onImageError, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false); // Reset error state when src changes
  }, [src]);

  // If there's an error, use a placeholder
  const finalSrc = hasError ? `https://placehold.co/800x600.png` : imgSrc;
  const finalAlt = hasError ? 'Image not available' : props.alt;
  
  return (
    <Image
      {...rest}
      src={finalSrc}
      alt={finalAlt}
      onError={() => {
        // This will prevent an infinite loop if the placeholder also fails
        if (!hasError) {
          setHasError(true);
          onImageError?.(); // Call the callback on error
        }
      }}
    />
  );
};

export default SafeImage;
