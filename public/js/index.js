const pageControllers = {
    '/auth': initAuthPage,
    '/profile': initProfilePage,
    '/upload-song': initUploadSongPage,
    '/artist': initArtistPage,
    '/popular': initPopularPage,
    '/mp3': initMp3Page
};

function matchRoute(url) {
    return Object.keys(pageControllers).find(route => url.startsWith(route));
}

async function loadPage(url) {
    try {
        const main = document.getElementById('main');

        console.log(`/api/pages${url}`);


        const response = await fetch(`/api/pages${url}`, { cache: 'no-cache' });
        const html = await response.text();
        /* main.innerHTML = html; */

        main.innerHTML = '';

        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Переносимо все, включно з <script>
        /* Array.from(temp.childNodes).forEach(node => {
            if (node.tagName === 'SCRIPT') {
                const script = document.createElement('script');
                if (node.src) {
                    script.src = node.src;
                } else {
                    script.textContent = node.textContent;
                }
                script.async = false;
                main.appendChild(script);
            } else {
                main.appendChild(node);
            }
        }); */

        Array.from(temp.childNodes).forEach(node => {
            if (node.tagName === 'SCRIPT') {
                const script = document.createElement('script');
                if (node.src) {
                    script.src = node.src;
                    script.async = false;
                    main.appendChild(script);
                } else {
                    // Створення нового скрипта з inline-кодом
                    const inlineScript = document.createElement('script');
                    inlineScript.text = node.innerHTML; // або node.textContent
                    inlineScript.async = false;
                    main.appendChild(inlineScript);
                }
            } else {
                main.appendChild(node.cloneNode(true));
            }
        });



        // Автоматичний виклик відповідного init-функціоналу
        const matchedRoute = matchRoute(url);
        if (matchedRoute) {
            pageControllers[matchedRoute]();
        }

        updatePlayUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Помилка при завантаженні сторінки:', error);
    }
}


const audio = new Audio();
let playlist = [];
let currentSongIndex = 0;

let listenedTime = 0;
let hasCountedValue = false;
let intervalId = null;

function playSong(songId) {
    try {
        if (audio.currentSongId === songId && !audio.paused) {
            audio.pause();
        } else if (audio.currentSongId === songId && audio.paused) {
            audio.play();
        } else {
            if(playlist.length === 0) playlist = JSON.parse(window.musicList);
            currentSongIndex = findSongIndexById(songId);

            audio.pause();
            updatePlayUI();
            audio.currentSongId = songId;
            audio.src = `/music/${songId}.mpeg`;
            audio.load(); // перезавантаження джерела

            listenedTime = 0;
            hasCountedValue = false;
            clearInterval(intervalId);
            intervalId = null;

            updateFooterUI();

            audio.play();
        }
    } catch (error) {
        console.error(error);
    }
}

function findSongIndexById(id) {
    return playlist.findIndex(song => song._id === id);
}

function findSongByIdInPlaylist(id) {
    return playlist.find(song => song._id === id);
}

function playNextSong() {
    const nextSong = playlist[currentSongIndex + 1];
    if(nextSong) playSong(nextSong._id);
}

function playPreviousSong() {
    const previousSong = playlist[currentSongIndex - 1];
    if(previousSong) playSong(previousSong._id);
}

function addSongToPlaylist(id) {
    if(findSongByIdInPlaylist(id)) return;

    const music = JSON.parse(window.musicList);
    const song = music.find(song => song._id === id);
    playlist.push(song);
}


function updateFooterUI() {
    const song = findSongByIdInPlaylist(audio.currentSongId);

    if(song) {
        const downloadBtn = document.getElementById('download');
        downloadBtn.setAttribute('href', `/api/mp3/download/${song._id}`);
        downloadBtn.setAttribute('download', `${song.title}.mpeg`);
    }
}

function updatePlayUI() {
    try {
        if (!audio.currentSongId) return;

        const songEl = document.querySelector(`.song[data-id="${audio.currentSongId}"]`);
        const playPauseBtn = document.getElementById('play-pause-btn');
        
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');

        const playSongUI = () => {
            if(songEl) {
                songEl.querySelector('.play-icon').removeAttribute('hidden');
                songEl.querySelector('.pause-icon').setAttribute('hidden', '');
                songEl.querySelector('.play-pause-btn').classList.add('active');
                songEl.classList.add('active');
            }
            playIcon.removeAttribute('hidden');
            pauseIcon.setAttribute('hidden', '');
        }

        const pauseSongUI = () => {
            if(songEl) {
                songEl.querySelector('.play-icon').setAttribute('hidden', '');
                songEl.querySelector('.pause-icon').removeAttribute('hidden');
                songEl.querySelector('.play-pause-btn').classList.remove('active');
                songEl.classList.remove('active');
            }
            playIcon.setAttribute('hidden', '');
            pauseIcon.removeAttribute('hidden');
        }

        if (audio.paused) {
            pauseSongUI();
        } else {
            playSongUI();
        }
    } catch (error) {
        console.error(error);
    }
}

function updateMetadataUI() {
    const currentSong = findSongByIdInPlaylist(audio.currentSongId);
    document.getElementById('song-artist').textContent = currentSong.user.login;
    document.getElementById('song-title').textContent = currentSong.title;
}


async function setReactionAtSong(songId, value, element) {
    try {
        const res = await fetch(`/api/reaction/${songId}/${value}`, { method: "PUT" })

        const data = await res.json();
        console.log(data);
        if(res.ok) {
            if(element) {
                element.querySelector('.likes .count').textContent = data.reactionCounts.likes;
                element.querySelector('.dislikes .count').textContent = data.reactionCounts.dislikes;

                const likeBtn = element.querySelector('.like-btn');
                const dislikeBtn = element.querySelector('.dislike-btn');

                if(likeBtn.dataset.value === value) {
                    likeBtn.classList.add('active');
                    dislikeBtn.classList.remove('active');
                }
                if(dislikeBtn.dataset.value === value) {
                    likeBtn.classList.remove('active');
                    dislikeBtn.classList.add('active');
                }
            }
        }
        
    } catch (error) {
        console.error(error);
    }
}

async function logout() {
    try {
        const res = await fetch(`/api/auth/logout`, { method: "POST" })

        const data = await res.json();
        console.log(data);
        if(res.ok) {
            window.location.href = '/';
        }
        
    } catch (error) {
        console.error(error);
    }
}


document.addEventListener("DOMContentLoaded", () => {

    loadPage(window.location.pathname);


    
    try {
        const slider = document.getElementById('song-slider');
        const soundSlider = document.getElementById('sound-slider');

        audio.addEventListener('play', () => {
            updatePlayUI();
        });

        audio.addEventListener('pause', () => {
            updatePlayUI();
        });

        audio.addEventListener('ended', () => {
            playNextSong();
        });

        audio.addEventListener('loadedmetadata', () => {
            updateMetadataUI();
            slider.value = 0;
            slider.max = audio.duration;
        });

        audio.addEventListener('timeupdate', () => {
            slider.value = audio.currentTime;
            const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            slider.style.background = `linear-gradient(to right, orange 0%, orange ${value}%, lightgray ${value}%, lightgray 100%)`;
        });

        audio.addEventListener('volumechange', () => {
            soundSlider.style.background = `linear-gradient(to right, orange 0%, orange ${soundSlider.value * 100}%, gray ${soundSlider.value * 100}%, gray 100%)`;
        });
    } catch (error) {
        console.error(error);
    }


    try {
        audio.addEventListener("play", () => {
            if (intervalId) return; // Запобігаємо створенню кількох інтервалів

            intervalId = setInterval(() => {
                if (hasCountedValue) {
                    clearInterval(intervalId);
                    intervalId = null;
                    return;
                }

                if (audio.paused || audio.ended) return;

                listenedTime += 1;

                if (listenedTime >= audio.duration * 0.3) {
                    console.log('listened');
                    

                    hasCountedValue = true;
                    clearInterval(intervalId);
                    intervalId = null;

                    fetch(`/api/listened/${audio.currentSongId}`, { method: "PUT" })
                        .then(res => res.json())
                        .then(data => console.log(data))
                        .catch(console.error);
                }
            }, 1000);
        });

        audio.addEventListener("pause", () => { // Зупиняємо таймер на паузі
            clearInterval(intervalId);
            intervalId = null;
        });

        audio.addEventListener("ended", () => { // Зупиняємо після завершення
            clearInterval(intervalId);
            intervalId = null;
        });
    } catch (error) {
        console.error(error);
    }


    // ДОДАВАННЯ EVENT DELEGATION
    try {
        document.addEventListener("input", function (event) {
            if (event.target.matches(".textarea-autosize")) {
                const textarea = event.target;
                textarea.style.height = "auto";
                textarea.style.height = textarea.scrollHeight + "px";
            }
        });

        function handleLinkClick(event) {
            const element = event.target.closest('a[isLink]');

            if (element) {
                event.preventDefault();
                const url = element.getAttribute('href');
                history.pushState(null, '', url);
                loadPage(url);
            }
        }

        window.addEventListener('popstate', () => {
            loadPage(location.pathname);
        });

        document.addEventListener('click', handleLinkClick);


        document.addEventListener("click", function (event) {
            const playPauseBtn = event.target.closest('.play-pause-btn');
            if (playPauseBtn) {
                const song = playPauseBtn.closest('.song');
                playSong(song.dataset.id);
            }

            const addSongToPlaylistBtn = event.target.closest('.add-to-playlist-btn');
            if(addSongToPlaylistBtn) {
                const song = addSongToPlaylistBtn.closest('.song');
                addSongToPlaylist(song.dataset.id);
            }

            const likeSongBtn = event.target.closest('.like-btn');
            if(likeSongBtn) {
                const song = likeSongBtn.closest('.song');
                const id = song.dataset.id;
                const value = likeSongBtn.dataset.value;
                const element = likeSongBtn.closest('.actions');

                setReactionAtSong(id, value, element);
            }

            const dislikeSongBtn = event.target.closest('.dislike-btn');
            if(dislikeSongBtn) {
                const song = dislikeSongBtn.closest('.song');
                const id = song.dataset.id;
                const value = dislikeSongBtn.dataset.value;
                const element = dislikeSongBtn.closest('.actions');

                setReactionAtSong(id, value, element);
            }

            const logoutBtn = event.target.closest('.logout-btn');
            if(logoutBtn) {
                logout();
            }

        });

        document.querySelector('footer').addEventListener("click", function (event) {
            const playPauseBtn = event.target.closest('#play-pause-btn');
            if (playPauseBtn) {
                playSong(audio.currentSongId);
            }

            const previousBtn = event.target.closest('#previous-btn');
            if (previousBtn) {
                playPreviousSong();
            }

            const nextBtn = event.target.closest('#next-btn');
            if (nextBtn) {
                playNextSong();
            }
        });
    } catch (error) {
        console.error(error);
    }




    try {
        const slider = document.getElementById('song-slider');

        slider.addEventListener('input', () => {
            if(!audio.src) return;

            const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            slider.style.background = `linear-gradient(to right, orange 0%, orange ${value}%, lightgray ${value}%, lightgray 100%)`;

            audio.currentTime = slider.value;
        });
    } catch (error) {
        console.error(error);
    }




    try {
        const soundSlider = document.getElementById('sound-slider');

        soundSlider.addEventListener('input', () => {
            if(!audio.src) return;

            const percent = (soundSlider.value - soundSlider.min) / (soundSlider.max - soundSlider.min);
            audio.volume = percent;
        });
    } catch (error) {
        console.error(error);
    }


    try {
        function calculateDropdownRect(button, content) {
            const buttonRect = button.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();
            const screenWidth = window.innerWidth;
            const screeHeight = window.innerHeight;

            // Якщо меню виходить за правий край, зміщуємо його ліворуч
            if (buttonRect.right + contentRect.width > screenWidth) {
                content.style.left = "auto";
                content.style.right = "0";
            } else {
                content.style.left = "0";
                content.style.right = "auto";
            }

            if (buttonRect.bottom + contentRect.height > screeHeight) {
                content.style.top = "auto";
                content.style.bottom = buttonRect.height + 'px';
            } else {
                content.style.top = buttonRect.height + 'px';
                content.style.bottom = "auto";
            }

            content.style.width = "max-content";
            content.style.height = "max-content";
        }


        document.querySelectorAll(".dropdown .content").forEach(content => {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    const button = content.closest(".dropdown").querySelector("button");

                    calculateDropdownRect(button, content);
                });
            });
            
            observer.observe(content, { childList: true, subtree: true });
        });


        document.addEventListener("click", function (event) {
            const dropdown = event.target.closest(".dropdown");
        
            // Якщо клікнули поза dropdown — закриваємо всі
            if (!dropdown) {
                document.querySelectorAll(".dropdown .content").forEach(content => {
                    content.setAttribute("hidden", "");
                });
                return;
            }
        
            const button = dropdown.querySelector("button");
            const content = dropdown.querySelector(".content");

        
            // Якщо клікнули по кнопці — перемикаємо видимість
            if (event.target.closest("button") === button) {
                // Закриваємо всі інші dropdown
                document.querySelectorAll(".dropdown .content").forEach(c => c.setAttribute("hidden", ""));
        
                content.removeAttribute("hidden");
                calculateDropdownRect(button, content);
            }
        });
    } catch (error) {
        console.error(error);
    }





});