function initMp3Page() {
    try {
        document.addEventListener("click", function (event) {
            const showMoreLyricsBtn = event.target.closest('.more-lyrics-btn')
            if(showMoreLyricsBtn) {
                const songLyricsContainer = document.getElementById('song-lyrics-container');
                songLyricsContainer.classList.toggle('shorten');
                showMoreLyricsBtn.textContent = songLyricsContainer.classList.contains('shorten') ? showMoreLyricsBtn.dataset.more : showMoreLyricsBtn.dataset.less;
            }
        });
    } catch (error) {
        console.error(error);
    }
}