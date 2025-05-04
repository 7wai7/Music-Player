
document.addEventListener("DOMContentLoaded", () => {
  
    // ДОДАВАННЯ EVENT DELEGATION
    try {
        document.addEventListener("input", function(event) {
            if (event.target.matches(".textarea-autosize")) {
                const textarea = event.target;
                textarea.style.height = "auto";
                textarea.style.height = textarea.scrollHeight + "px";
            }
        });
    } catch (error) {
        console.error(error);
    }
    
    const slider = document.getElementById('song-slider');

    slider.addEventListener('input', () => {
      const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
      slider.style.background = `linear-gradient(to right, orange 0%, orange ${value}%, lightgray ${value}%, lightgray 100%)`;
    });


    const soundSlider = document.getElementById('sound-slider');

    soundSlider.addEventListener('input', () => {
      const percent = (soundSlider.value - soundSlider.min) / (soundSlider.max - soundSlider.min) * 100;
      soundSlider.style.background = `linear-gradient(to right, orange 0%, orange ${percent}%, gray ${percent}%, gray 100%)`;
    });

});