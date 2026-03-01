
            const upload = document.getElementById("upload");

            const qualitySlider = document.getElementById("quality");
            const qualityValue = document.getElementById("qualityValue");

            const originalImg = document.getElementById("originalImg");
            const compressedImg = document.getElementById("compressedImg");

            const originalSize = document.getElementById("originalSize");
            const compressedSize = document.getElementById("compressedSize");

            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            let imageFile;
            qualitySlider.addEventListener("input", () => {
                qualityValue.textContent = qualitySlider.value;
            });
            upload.addEventListener("change", () => {
                imageFile = upload.files[0];
                if (!imageFile) return;
                originalSize.textContent = (imageFile.size / 1024).toFixed(2) + " KB";
                        const reader = new FileReader();
            reader.onload = () => {
                originalImg.src = reader.result;
            };
            reader.readAsDataURL(imageFile);

            });
            function compressImg() {
                if (!imageFile) return alert("Upload an image first");

                const img = new Image();
                img.src = originalImg.src;

                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.drawImage(img, 0, 0);

                    const quality = parseFloat(qualitySlider.value);

                    canvas.toBlob(
                        (blob) => {
                            const url = URL.createObjectURL(blob);
                            compressedImg.src = url;

                            compressedSize.textContent =
                                (blob.size / 1024).toFixed(2) + " KB";

                            const download = document.getElementById("download");
                            download.href = url;
                        },
                        "image/jpeg",
                        quality,
                    );
                };
            }
    