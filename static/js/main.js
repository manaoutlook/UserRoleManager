function createMessageElement() {
    const messageElement = document.createElement('div');
    messageElement.id = 'messageAlert';
    messageElement.className = 'alert';
    messageElement.style.display = 'none';
    const modalBody = document.querySelector('#createUserModal .modal-body');
    if (modalBody) { // Check if modalBody exists before inserting
        modalBody.insertBefore(messageElement, modalBody.firstChild);
    }
    return messageElement;
}

// User Management
function createUser(formData) {
    fetch('/users/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData))
    })
    .then(response => response.json().then(data => ({status: response.status, data})))
    .then(({status, data}) => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();

        if (data.success) {
            messageElement.className = 'alert alert-success';
            messageElement.textContent = data.message || 'User created successfully';
            document.getElementById('userForm').reset();
            setTimeout(() => location.reload(), 1500);
        } else {
            messageElement.className = 'alert alert-danger';
            messageElement.textContent = data.error || 'Error creating user';
        }
        messageElement.style.display = 'block';
    })
    .catch(error => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = 'Error creating user. Please try again.';
        messageElement.style.display = 'block';
    });
}

function updateUser(userId, formData) {
    fetch(`/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData))
    })
    .then(response => response.json().then(data => ({status: response.status, data})))
    .then(({status, data}) => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        if (data.success) {
            messageElement.className = 'alert alert-success';
            messageElement.textContent = data.message || 'User updated successfully';
            setTimeout(() => location.reload(), 1500);
        } else {
            messageElement.className = 'alert alert-danger';
            messageElement.textContent = data.error || 'Error updating user';
        }
        messageElement.style.display = 'block';
    })
    .catch(error => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = 'Error updating user. Please try again.';
        messageElement.style.display = 'block';
    });
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`/users/${userId}`, {
            method: 'DELETE'
        })
        .then(response => response.json().then(data => ({status: response.status, data})))
        .then(({status, data}) => {
            const messageElement = document.getElementById('messageAlert') || createMessageElement();
            if (data.success) {
                messageElement.className = 'alert alert-success';
                messageElement.textContent = data.message || 'User deleted successfully';
                setTimeout(() => location.reload(), 1500);
            } else {
                messageElement.className = 'alert alert-danger';
                messageElement.textContent = data.error || 'Error deleting user';
            }
            messageElement.style.display = 'block';
        })
        .catch(error => {
            const messageElement = document.getElementById('messageAlert') || createMessageElement();
            messageElement.className = 'alert alert-danger';
            messageElement.textContent = 'Error deleting user. Please try again.';
            messageElement.style.display = 'block';
        });
    }
}

// Role Management
function createRole(formData) {
    // Get selected permissions
    const selectedPermissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
        .map(checkbox => parseInt(checkbox.value));

    // Create the request data
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        permissions: selectedPermissions
    };

    fetch('/roles/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json().then(data => ({status: response.status, data})))
    .then(({status, data}) => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        if (data.success) {
            messageElement.className = 'alert alert-success';
            messageElement.textContent = data.message || 'Role created successfully';
            document.getElementById('roleForm').reset();
            setTimeout(() => location.reload(), 1500);
        } else {
            messageElement.className = 'alert alert-danger';
            messageElement.textContent = data.error || 'Error creating role';
        }
        messageElement.style.display = 'block';
    })
    .catch(error => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = 'Error creating role. Please try again.';
        messageElement.style.display = 'block';
    });
}


// Form handlers
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('userForm');
    const roleForm = document.getElementById('roleForm');

    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(userForm);
            createUser(formData);
        });
    }

    if (roleForm) {
        roleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(roleForm);
            createRole(formData);
        });
    }
});