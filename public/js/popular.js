function initPopularPage() {
    document.getElementById('song-sort').addEventListener('change', function () {
        sortSongs(this.value);
    });
    
    function sortSongs(sortType) {
        console.log("Сортування по:", sortType);
    
        loadPage(`/popular?sort=${sortType}`)
    }
    
}