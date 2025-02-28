/**
 * Sorts search results using the interleaving method
 * @param {Array} results - Array of search results from different services
 * @param {Object} priorities - Object containing service priorities
 * @returns {Array} - Sorted results array
 */
function interleaveSortResults(results, priorities) {
    // Group results by service
    const groupedResults = {};
    results.forEach(result => {
        if (!groupedResults[result.source]) {
            groupedResults[result.source] = [];
        }
        groupedResults[result.source].push(result);
    });

    // Sort services by priority
    const services = Object.keys(groupedResults).sort((a, b) => {
        return priorities[b] - priorities[a];
    });

    // Initialize result array and service indices
    const sortedResults = [];
    const indices = {};
    services.forEach(service => indices[service] = 0);

    // Interleave results
    let activeServices = services.slice();
    while (activeServices.length > 0) {
        for (let i = 0; i < activeServices.length; i++) {
            const service = activeServices[i];
            const serviceResults = groupedResults[service];
            
            if (indices[service] < serviceResults.length) {
                sortedResults.push(serviceResults[indices[service]]);
                indices[service]++;
            } else {
                // Remove service if all its results have been used
                activeServices.splice(i, 1);
                i--;
            }
        }
    }

    return sortedResults;
}

/**
 * Sorts search results using the compound method
 * @param {Array} results - Array of search results from different services
 * @param {Object} priorities - Object containing service priorities
 * @returns {Array} - Sorted results array
 */
function compoundSortResults(results, priorities) {
    return results.sort((a, b) => {
        // First sort by priority
        const priorityDiff = priorities[b.source] - priorities[a.source];
        if (priorityDiff !== 0) return priorityDiff;
        
        // If same priority, maintain original order within service
        return results.indexOf(a) - results.indexOf(b);
    });
}

/**
 * Main sorting function that delegates to the appropriate sorting method
 * @param {Array} results - Array of search results
 * @param {Object} priorities - Object containing service priorities
 * @param {string} method - Sorting method ('interleaving' or 'compound')
 * @returns {Array} - Sorted results array
 */
export function sortResults(results, priorities, method = 'interleaving') {
    if (method === 'interleaving') {
        return interleaveSortResults(results, priorities);
    }
    return compoundSortResults(results, priorities);
}