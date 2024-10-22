import { useState } from 'react';

const ImageUpload = () => {
	const [image, setImage] = useState(null);
	const [error, setError] = useState(null);

	const MAX_FILE_SIZE = 250 * 1024; // 250 KB
	const FIXED_DIMENSION = 242; // Fixed dimension for both width and height

	const handleImageResize = (file) => {
		const reader = new FileReader();

		reader.onload = function (event) {
			const img = new Image();
			img.src = event.target.result;

			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');

				// Set canvas size to 242x242
				canvas.width = FIXED_DIMENSION;
				canvas.height = FIXED_DIMENSION;

				// Draw the image on the canvas with the exact dimensions
				ctx.drawImage(img, 0, 0, FIXED_DIMENSION, FIXED_DIMENSION);

				// Try resizing with quality to reduce the file size
				const tryResizing = (quality) => {
					return new Promise((resolve) => {
						canvas.toBlob(
							(blob) => {
								if (blob.size <= MAX_FILE_SIZE) {
									resolve(blob); // If file size is under the limit, resolve it
								} else if (quality > 0.1) {
									// If the file size is still too big, lower quality and try again
									resolve(tryResizing(quality - 0.1));
								} else {
									setError('Unable to reduce file size under 250 KB.');
									resolve(null);
								}
							},
							file.type === 'image/png' ? 'image/png' : 'image/jpeg', // Use the correct type
							quality
						);
					});
				};

				// Start with 0.9 quality for resizing
				tryResizing(0.9).then((resizedBlob) => {
					if (resizedBlob) {
						const resizedFile = new File([resizedBlob], file.name, {
							type: file.type,
						});
						setImage(URL.createObjectURL(resizedFile));
						console.log(
							'Resized file ready to be uploaded:',
							resizedFile
						);
					}
				});
			};
		};

		reader.readAsDataURL(file);
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setError(null); // Clear previous errors
		if (file) {
			handleImageResize(file);
		}
	};

	return (
		<div>
			<input type='file' accept='image/*' onChange={handleFileChange} />
			{image && <img src={image} alt='Resized Preview' />}
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</div>
	);
};

export default ImageUpload;
