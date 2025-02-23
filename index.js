function openTwitter() {
    window.open('https://x.com/TeamG89334', '_blank');
}

document.addEventListener("DOMContentLoaded", function () {
    const twitterButton = document.querySelector(".social-media button");
    if (twitterButton) {
        twitterButton.addEventListener("click", openTwitter);
    }
});
