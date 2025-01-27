function toggleReleases(element) {
    const container = element.closest('.version-group');
    const hiddenReleases = container.querySelectorAll('.hidden-release');
    const button = element.querySelector('.toggle-releases');
    const isHidden = hiddenReleases[0].style.display === 'none';

    hiddenReleases.forEach(release => {
        release.style.display = isHidden ? 'block' : 'none';
    });

    button.classList.toggle('open');
}
