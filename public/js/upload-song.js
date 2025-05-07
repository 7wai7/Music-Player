function initUploadSongPage() {

    const uploadSongDropZone = document.getElementById('upload-song-drop-zone');
    const songFileInput = document.getElementById('song-file-input');
    const selectSongBtn = document.getElementById('select-song-btn');

    const uploadedSongBlock = document.getElementById('uploaded-song-block');
    const songTitleInput = document.getElementById('song-title');
    const songLyricsInput = document.getElementById('song-lyrics');
    const songDateInput = document.getElementById('song-date');
    const songGenreInput = document.getElementById('song-genre');

    const audioPreview = document.getElementById('audio-preview');
    const uploadSongBtn = document.getElementById('upload-song-btn');

    const fileUploadingModal = document.getElementById('file-uploading-modal');
    const uploadProgressBar = document.getElementById('upload-progress-bar');


    function hideUploadedSongBlock() {
        uploadSongDropZone.removeAttribute('hidden');
        uploadedSongBlock.setAttribute('hidden', '');
        songFileInput.value = '';
    }

    function handleFile(file) {
        if (file && file.type.startsWith("audio/")) {
            const fileURL = URL.createObjectURL(file);
            audioPreview.src = fileURL;

            audioPreview.onloadeddata = () => {
                songFileInput.value = '';
                uploadSongDropZone.setAttribute("hidden", "");
                uploadedSongBlock.removeAttribute("hidden");
                songTitleInput.value = file.name.split('.')[0];
            };
        }
    }


    uploadSongDropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadSongDropZone.classList.add("dragover");
    });

    uploadSongDropZone.addEventListener("dragleave", () => {
        uploadSongDropZone.classList.remove("dragover");
    });

    uploadSongDropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadSongDropZone.classList.remove("dragover");

        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    songFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    selectSongBtn.onclick = () => {
        songFileInput.click();
    }



    uploadSongBtn.onclick = () => {
        if (uploadSongBtn.hasAttribute('notAvailable')) return;
        if (!songTitleInput.value.trim()) {
            songTitleInput.classList.add('error');
            return;
        }
        if (!audioPreview.src) return;


        uploadSongBtn.setAttribute('notAvailable', '');

        const formData = new FormData();
        formData.append('title', songTitleInput.value);
        formData.append('lyrics', songLyricsInput.value);
        formData.append('createDate', songDateInput.value);
        formData.append('genre', songGenreInput.value);

        try {
            fetch(audioPreview.src)
                .then(res => res.blob())
                .then(blob => {
                    const fileType = blob.type || "audio/mpeg"; // Якщо тип невідомий, встановлюємо MP4
                    const fileExt = fileType.split("/")[1] || "mp3"; // Отримуємо розширення
                    const audioFile = new File([blob], `audio.${fileExt}`, { type: fileType });

                    formData.append("audio", audioFile);

                    sendUploadRequest(formData);
                })
                .catch(err => console.error("Error creating a file:", err));
        } catch (error) {
            console.error("Video uploading error:", error);
        }
    }


    async function sendUploadRequest(formData) {
        fileUploadingModal.removeAttribute('hidden');
        uploadProgressBar.value = 0;

        // Відправка файлу з XMLHttpRequest для отримання прогресу
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload", true);

        // Відстеження прогресу завантаження
        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                let percentComplete = Math.round((event.loaded / event.total) * 100);
                uploadProgressBar.value = percentComplete;
            }
        };

        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log(data);

                // Приховати модальне вікно після успішного завантаження
                fileUploadingModal.setAttribute('hidden', '');
                uploadProgressBar.value = 0;
                uploadSongBtn.removeAttribute('notAvailable');
                hideUploadedSongBlock();
                alert("Success.");
            } else {
                console.error("Upload failed:", xhr.responseText);
                fileUploadingModal.setAttribute('hidden', '');
                uploadProgressBar.value = 0;
                alert("The video could not be uploaded. Please check your connection or try again.");
            }
        };

        xhr.send(formData);
    }

}