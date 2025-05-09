let modalType = null;
let chooseSongId = null;

function findSongById(id) {
    const songs = JSON.parse(window.musicList);
    return songs.find(song => song._id === id);
}

async function changeSongTitle(id) {
    try {
        const songTitleInput = document.getElementById('song-title-input');

        if(!songTitleInput.value.trim()) return;

        const res = await fetch(`/api/song/${id}/title`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: songTitleInput.value
            })
        })

        const data = await res.json();
        console.log(data);
        if(res.ok) {
            hideModal();
        }
    } catch (error) {
        console.error(error);
    }
}

async function changeSongLyrics(id) {
    try {
        const songLyricsInput = document.getElementById('song-lyrics-input');

        if(!songLyricsInput.value.trim()) return;

        const res = await fetch(`/api/song/${id}/lyrics`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lyrics: songLyricsInput.value
            })
        })

        const data = await res.json();
        console.log(data);
        if(res.ok) {
            hideModal();
        }
    } catch (error) {
        console.error(error);
    }
}

async function deleteSong(id) {
    try {
        const res = await fetch(`/api/song/${id}`, { method: "DELETE" })

        const data = await res.json();
        console.log(data);
        if(res.ok) {
            const song = document.querySelector(`.song[data-id="${id}"]`);
            song.remove();
            hideModal();
        }
        
    } catch (error) {
        console.error(error);
    }
}

function showModal(type, songId) {
    modalType = type;
    chooseSongId = songId;

    const song = findSongById(songId);

    const changeSongDataModal = document.getElementById('change-song-data-modal');
    changeSongDataModal.removeAttribute('hidden');

    const changeText = document.getElementById('change-text');
    const songName = document.getElementById('song-name');
    const songTitleInput = document.getElementById('song-title-input');
    const songLyricsInput = document.getElementById('song-lyrics-input');
    const deletingChoose = document.getElementById('deleting-choose');
    const changeBtn = document.getElementById('change-btn');

    songName.textContent = song.title;

    switch (type) {
        case 'title':
            changeText.textContent = changeText.dataset.title;
            songTitleInput.removeAttribute('hidden');
            songLyricsInput.setAttribute('hidden', '');
            deletingChoose.setAttribute('hidden', '');
            changeBtn.removeAttribute('hidden');
            
            break;
        case 'lyrics':

            changeText.textContent = changeText.dataset.lyrics;
            songTitleInput.setAttribute('hidden', '');
            songLyricsInput.removeAttribute('hidden');
            deletingChoose.setAttribute('hidden', '');
            changeBtn.removeAttribute('hidden');
            
            break;

        case 'delete':
            changeText.textContent = changeText.dataset.delete;
            songTitleInput.setAttribute('hidden', '');
            songLyricsInput.setAttribute('hidden', '');
            deletingChoose.removeAttribute('hidden');
            changeBtn.setAttribute('hidden', '');
            
            break;
    
        default:
            break;
    }
}

function hideModal() {
    modalType = null;
    chooseSongId = null;
    const changeSongDataModal = document.getElementById('change-song-data-modal');
    changeSongDataModal.setAttribute('hidden', '');
}


function initProfilePage() {
    document.addEventListener("click", function (event) {
        const changeSongTitleBtn = event.target.closest('.change-song-title-btn');
        if(changeSongTitleBtn) {
            const song = changeSongTitleBtn.closest('.song');
            showModal('title', song.dataset.id);
        }
        
        const changeSongLyricsBtn = event.target.closest('.change-song-lyrics-btn');
        if(changeSongLyricsBtn) {
            const song = changeSongLyricsBtn.closest('.song');
            showModal('lyrics', song.dataset.id);
        }

        const deleteSongBtn = event.target.closest('.delete-song--btn');
        if(deleteSongBtn) {
            const song = deleteSongBtn.closest('.song');
            showModal('delete', song.dataset.id);
        }

        const deleteSongBtnModal = event.target.closest('.delete-btn');
        if(deleteSongBtnModal) {
            deleteSong(chooseSongId);
        }

        const changeBtn = event.target.closest('.change-btn');
        if(changeBtn) {
            switch (modalType) {
                case 'title':
                    changeSongTitle(chooseSongId);
                    break;
            
                case 'lyrics':
                    changeSongLyrics(chooseSongId);
                    break;
        
                default:
                    break;
            }
        }

        const hideModalBtn = event.target.closest('.hide-modal-btn');
        if(hideModalBtn) {
            hideModal();
        }
    });
}