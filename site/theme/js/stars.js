document.addEventListener('DOMContentLoaded', function () {
    const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds
    const projects = document.querySelectorAll('[id^="github-stars-"]');

    projects.forEach((element) => {
        const repo = element.id.replace('github-stars-', 'envoyproxy/');
        const cacheKey = `github-stars-${repo}`;
        const cacheTimestampKey = `${cacheKey}-timestamp`;
        const cachedStars = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(cacheTimestampKey);

        // Check if cache is valid
        if (cachedStars && cachedStars !== "undefined" && cachedTimestamp && Date.now() - cachedTimestamp < CACHE_DURATION) {
            console.log(`Using cached data for ${repo}: ${cachedStars}`);
            element.textContent = cachedStars; // Use cached data
        } else {
            // Fetch from GitHub API
            const apiUrl = `https://api.github.com/repos/${repo}`;
            console.log(`Fetching data from GitHub API for ${repo}`);
            fetch(apiUrl)
                .then(response => {
                    console.log(`Received response for ${repo}:`, response);
                    return response.json();
                })
                .then(data => {
                    console.log(`Parsed data for ${repo}:`, data);
                    const stars = data.stargazers_count;
                    element.textContent = stars;

                    // Cache the data if it is not undefined
                    if (stars !== undefined) {
                        localStorage.setItem(cacheKey, stars);
                        localStorage.setItem(cacheTimestampKey, Date.now());
                    }
                })
                .catch(error => {
                    console.error(`Error fetching stars for ${repo}:`, error);
                    element.textContent = 'Error'; // Fallback in case of error
                });
        }
    });
});
