async function loadSongTemplate() {
    const response = await fetch('/html/song.html');
    return await response.text();
}

async function renderSong(song) {
    let template = await loadSongTemplate();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = template.trim();

    const songElement = tempDiv.firstChild;

    return songElement;
}

document.addEventListener("DOMContentLoaded", () => {
    const songs = [...Array(730).keys()]; // приклад масиву з 73 пісень
    const songsPerPage = 20;
    const container = document.getElementById('songs-container');
    const pagination = document.getElementById('pagination');

    let currentPage = 1;

    async function renderSongs(page) {
        const start = (page - 1) * songsPerPage;
        const end = start + songsPerPage;
        const currentSongs = songs.slice(start, end);

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < currentSongs.length; i++) {
            const song = currentSongs[i];
            const songElement = await renderSong(song);
            fragment.prepend(songElement);
        }

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    function renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / songsPerPage);

        const addButton = (label, page = null, isActive = false, isDisabled = false) => {
            const btn = document.createElement('button');
            btn.textContent = label;
            if (isActive) btn.classList.add('active');
            if (isDisabled) btn.disabled = true;
            if (page !== null) {
                btn.onclick = () => {
                    currentPage = page;
                    renderSongs(currentPage);
                    renderPagination(totalItems);
                };
            }
            
            pagination.innerHTML = '';
            pagination.appendChild(btn);
        };

        // Кнопка «назад»
        addButton('«', currentPage - 1, false, currentPage === 1);

        const pagesToShow = [];
        if (totalPages <= 7) {
            // якщо мало сторінок — показуємо всі
            for (let i = 1; i <= totalPages; i++) pagesToShow.push(i);
        } else {
            if (currentPage <= 4) {
                pagesToShow.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pagesToShow.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pagesToShow.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        pagesToShow.forEach(p => {
            if (p === '...') {
                const span = document.createElement('span');
                span.textContent = '...';
                span.style.padding = '6px 10px';
                pagination.appendChild(span);
            } else {
                addButton(p, p, p === currentPage);
            }
        });

        // Кнопка «вперед»
        addButton('»', currentPage + 1, false, currentPage === totalPages);
    }

    // початковий рендер
    renderSongs(currentPage);
    renderPagination(songs.length);


});