document.addEventListener('DOMContentLoaded', function () {
    // Enable drag and drop reordering of locations
    const locationsTable = document.getElementById('locations-table-body');

    if (locationsTable) {
        // Function to save new order
        const saveNewOrder = async () => {
            const rows = locationsTable.querySelectorAll('tr');
            const locationOrders = [];

            rows.forEach((row, index) => {
                const id = row.getAttribute('data-id');
                locationOrders.push({
                    id: parseInt(id),
                    orderIndex: index + 1
                });
            });

            try {
                const response = await fetch('/api/locations/reorder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ locationOrders })
                });

                if (response.ok) {
                    // Refresh the page to show updated order
                    window.location.reload();
                } else {
                    alert('Failed to save new order. Please try again.');
                }
            } catch (error) {
                console.error('Error saving order:', error);
                alert('An error occurred while saving new order.');
            }
        };

        // Add drag and drop functionality
        // Note: in a production app, you would want to use a library like SortableJS
        // This is a simplified example for demonstration
        let draggedItem = null;

        // Add event listeners for drag and drop
        const rows = locationsTable.querySelectorAll('tr');
        rows.forEach(row => {
            row.setAttribute('draggable', 'true');

            row.addEventListener('dragstart', function () {
                draggedItem = this;
                setTimeout(() => {
                    this.classList.add('dragging');
                }, 0);
            });

            row.addEventListener('dragend', function () {
                this.classList.remove('dragging');
                draggedItem = null;

                // Save new order after drag ends
                saveNewOrder();
            });

            row.addEventListener('dragover', function (e) {
                e.preventDefault();
            });

            row.addEventListener('dragenter', function (e) {
                e.preventDefault();
                if (draggedItem !== this) {
                    const children = Array.from(locationsTable.children);
                    const draggedIndex = children.indexOf(draggedItem);
                    const targetIndex = children.indexOf(this);

                    if (draggedIndex < targetIndex) {
                        locationsTable.insertBefore(this, draggedItem);
                    } else {
                        locationsTable.insertBefore(draggedItem, this);
                    }
                }
            });
        });
    }
});
