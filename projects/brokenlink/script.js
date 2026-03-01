        document.addEventListener('DOMContentLoaded', function() {
            const scanBtn = document.getElementById('scan-btn');
            const resetBtn = document.getElementById('reset-btn');
            const urlInput = document.getElementById('url');
            const maxLinksSelect = document.getElementById('max-links');
            const resultList = document.getElementById('result-list');
            const loading = document.getElementById('loading');
            const progressContainer = document.getElementById('progress-container');
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            const linksChecked = document.getElementById('links-checked');
            const totalLinksSpan = document.getElementById('total-links');
            const brokenLinksSpan = document.getElementById('broken-links');
            const successRateSpan = document.getElementById('success-rate');
            
            // Sample data for demonstration
            const sampleLinks = [
                {url: "https://example.com/page1", status: 200, type: "internal"},
                {url: "https://example.com/page2", status: 200, type: "internal"},
                {url: "https://example.com/old-page", status: 404, type: "internal"},
                {url: "https://external-site.com/resource", status: 200, type: "external"},
                {url: "https://example.com/images/photo1.jpg", status: 200, type: "image"},
                {url: "https://example.com/images/missing.jpg", status: 404, type: "image"},
                {url: "https://example.com/archived-page", status: 410, type: "internal"},
                {url: "https://expired-domain.com", status: 500, type: "external"},
                {url: "https://example.com/styles.css", status: 200, type: "internal"},
                {url: "https://example.com/script.js", status: 200, type: "internal"},
                {url: "https://example.com/redirect", status: 301, type: "internal"},
                {url: "https://example.com/forbidden", status: 403, type: "internal"},
            ];
            
            // Event listeners
            scanBtn.addEventListener('click', startScan);
            resetBtn.addEventListener('click', resetScanner);
            urlInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') startScan();
            });
            
            // Start the scanning process
            function startScan() {
                const url = urlInput.value.trim();
                if (!url) {
                    alert("Please enter a valid URL");
                    urlInput.focus();
                    return;
                }
                
                // Show loading and progress
                loading.style.display = 'block';
                progressContainer.style.display = 'block';
                resultList.innerHTML = '';
                
                // Reset stats
                updateStats(0, 0);
                
                // Get max links to check
                const maxLinks = parseInt(maxLinksSelect.value);
                
                // Simulate scanning process with sample data
                simulateScanning(url, maxLinks);
            }
            
            // Simulate the scanning process
            function simulateScanning(url, maxLinks) {
                let checkedCount = 0;
                let brokenCount = 0;
                const totalToCheck = Math.min(maxLinks, sampleLinks.length);
                
                // Reset progress
                updateProgress(0, totalToCheck);
                
                // Process each link with a delay to simulate real scanning
                const processNextLink = () => {
                    if (checkedCount >= totalToCheck) {
                        // Scanning complete
                        loading.style.display = 'none';
                        updateProgress(totalToCheck, totalToCheck);
                        
                        // Show completion message
                        if (brokenCount === 0) {
                            showNoBrokenLinksMessage();
                        }
                        return;
                    }
                    
                    // Get current link data
                    const link = sampleLinks[checkedCount];
                    
                    // Update progress
                    checkedCount++;
                    updateProgress(checkedCount, totalToCheck);
                    
                    // Check if link is broken (status 400+ or 0 for network errors)
                    const isBroken = link.status >= 400 || link.status === 0;
                    if (isBroken) brokenCount++;
                    
                    // Add result to list
                    addResultItem(link.url, link.status, link.type);
                    
                    // Update stats
                    updateStats(checkedCount, brokenCount);
                    
                    // Process next link after a short delay
                    setTimeout(processNextLink, 200 + Math.random() * 300);
                };
                
                // Start processing
                processNextLink();
            }
            
            // Update progress bar and text
            function updateProgress(current, total) {
                const percentage = Math.round((current / total) * 100);
                progressFill.style.width = `${percentage}%`;
                progressText.textContent = `${percentage}%`;
                linksChecked.textContent = `${current} of ${total} links checked`;
            }
            
            // Update statistics
            function updateStats(total, broken) {
                totalLinksSpan.textContent = total;
                brokenLinksSpan.textContent = broken;
                
                const successRate = total === 0 ? 100 : Math.round(((total - broken) / total) * 100);
                successRateSpan.textContent = `${successRate}%`;
            }
            
            // Add a result item to the list
            function addResultItem(url, statusCode, type) {
                // Remove the "no results" message if present
                const noResults = document.querySelector('.no-results');
                if (noResults) {
                    noResults.remove();
                }
                
                // Create result item
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                
                // Determine status and badge class
                let statusText, badgeClass;
                if (statusCode >= 200 && statusCode < 300) {
                    statusText = `OK (${statusCode})`;
                    badgeClass = 'status-success';
                } else if (statusCode >= 300 && statusCode < 400) {
                    statusText = `Redirect (${statusCode})`;
                    badgeClass = 'status-warning';
                } else if (statusCode >= 400 && statusCode < 500) {
                    statusText = `Client Error (${statusCode})`;
                    badgeClass = 'status-error';
                } else if (statusCode >= 500) {
                    statusText = `Server Error (${statusCode})`;
                    badgeClass = 'status-error';
                } else {
                    statusText = 'Unknown Error';
                    badgeClass = 'status-error';
                }
                
                // Create icon based on type
                let typeIcon;
                switch(type) {
                    case 'image': typeIcon = 'fas fa-image'; break;
                    case 'external': typeIcon = 'fas fa-external-link-alt'; break;
                    default: typeIcon = 'fas fa-link';
                }
                
                resultItem.innerHTML = `
                    <div class="result-status">
                        <i class="${typeIcon}" style="color: #94a3b8;"></i>
                        <span class="status-badge ${badgeClass}">${statusText}</span>
                    </div>
                    <div class="result-url" title="${url}">${truncateText(url, 50)}</div>
                `;
                
                resultList.prepend(resultItem);
            }
            
            // Show message when no broken links are found
            function showNoBrokenLinksMessage() {
                const message = document.createElement('div');
                message.className = 'no-results';
                message.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <h3>No broken links found!</h3>
                    <p>All ${totalLinksSpan.textContent} links on the website are working properly.</p>
                `;
                resultList.appendChild(message);
            }
            
            // Reset the scanner
            function resetScanner() {
                urlInput.value = 'https://example.com';
                maxLinksSelect.value = '100';
                document.getElementById('check-external').checked = true;
                document.getElementById('check-images').checked = true;
                
                resultList.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <h3>No results yet</h3>
                        <p>Enter a URL and click "Scan for Broken Links" to start checking</p>
                    </div>
                `;
                
                loading.style.display = 'none';
                progressContainer.style.display = 'none';
                updateStats(0, 0);
            }
            
            // Utility function to truncate text
            function truncateText(text, maxLength) {
                if (text.length <= maxLength) return text;
                return text.substring(0, maxLength) + '...';
            }
            
            // Initialize with a sample scan result for demonstration
            window.addEventListener('load', function() {
                // Add a few sample results for initial display
                sampleLinks.slice(0, 3).forEach(link => {
                    addResultItem(link.url, link.status, link.type);
                });
                updateStats(12, 4);
                successRateSpan.textContent = "67%";
            });
        });