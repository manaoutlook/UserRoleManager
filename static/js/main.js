function createMessageElement() {
    const messageElement = document.createElement('div');
    messageElement.id = 'messageAlert';
    messageElement.className = 'alert';
    messageElement.style.display = 'none';
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        modalBody.insertBefore(messageElement, modalBody.firstChild);
    }
    return messageElement;
}

// User Management
function createUser(formData) {
    const roles = Array.from(document.querySelectorAll('input[name="roles"]:checked'))
        .map(checkbox => parseInt(checkbox.value));
    const locations = Array.from(document.querySelectorAll('input[name="locations"]:checked'))
        .map(checkbox => parseInt(checkbox.value));

    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        roles: roles,
        locations: locations
    };

    fetch('/users/create', {
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

function editUser(userId) {
    // Fetch user data
    fetch(`/users/${userId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editUserId').value = userId;
            document.getElementById('editUsername').value = data.username;
            document.getElementById('editEmail').value = data.email;

            // Reset and set role checkboxes
            document.querySelectorAll('#editUserModal input[name="roles"]').forEach(checkbox => {
                checkbox.checked = data.roles.includes(parseInt(checkbox.value));
            });

            // Reset and set location checkboxes
            document.querySelectorAll('#editUserModal input[name="locations"]').forEach(checkbox => {
                checkbox.checked = data.locations.includes(parseInt(checkbox.value));
            });

            // Show the modal
            new bootstrap.Modal(document.getElementById('editUserModal')).show();
        });
}

function updateUser(userId, formData) {
    const roles = Array.from(document.querySelectorAll('#editUserModal input[name="roles"]:checked'))
        .map(checkbox => parseInt(checkbox.value));
    const locations = Array.from(document.querySelectorAll('#editUserModal input[name="locations"]:checked'))
        .map(checkbox => parseInt(checkbox.value));

    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        roles: roles,
        locations: locations
    };

    // Only include password if it's not empty
    const password = formData.get('password');
    if (password) {
        data.password = password;
    }

    fetch(`/users/${userId}`, {
        method: 'PUT',
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
    // Create confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal fade';
    confirmDialog.id = 'confirmDeleteModal';
    confirmDialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Delete</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this user?</p>
                    <p class="text-danger">This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDialog);

    const modal = new bootstrap.Modal(confirmDialog);
    modal.show();

    document.getElementById('confirmDelete').onclick = function() {
        modal.hide();
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

        // Clean up the modal
        confirmDialog.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(confirmDialog);
        });
    };
}

// Role Management
function editRole(roleId) {
    // Fetch role data
    fetch(`/roles/${roleId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editRoleId').value = roleId;
            document.getElementById('editRoleName').value = data.name;
            document.getElementById('editRoleDescription').value = data.description;

            // Reset and set permission checkboxes
            document.querySelectorAll('#editRoleModal input[name="permissions"]').forEach(checkbox => {
                checkbox.checked = data.permissions.includes(parseInt(checkbox.value));
            });

            // Show the modal
            new bootstrap.Modal(document.getElementById('editRoleModal')).show();
        });
}

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

function updateRole(roleId, formData) {
    const selectedPermissions = Array.from(document.querySelectorAll('#editRoleModal input[name="permissions"]:checked'))
        .map(checkbox => parseInt(checkbox.value));

    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        permissions: selectedPermissions
    };

    fetch(`/roles/${roleId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json().then(data => ({status: response.status, data})))
    .then(({status, data}) => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        if (data.success) {
            messageElement.className = 'alert alert-success';
            messageElement.textContent = data.message || 'Role updated successfully';
            setTimeout(() => location.reload(), 1500);
        } else {
            messageElement.className = 'alert alert-danger';
            messageElement.textContent = data.error || 'Error updating role';
        }
        messageElement.style.display = 'block';
    })
    .catch(error => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = 'Error updating role. Please try again.';
        messageElement.style.display = 'block';
    });
}

function deleteRole(roleId) {
    // Create confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal fade';
    confirmDialog.id = 'confirmDeleteModal';
    confirmDialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Delete</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this role?</p>
                    <p class="text-danger">This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDialog);

    const modal = new bootstrap.Modal(confirmDialog);
    modal.show();

    document.getElementById('confirmDelete').onclick = function() {
        modal.hide();
        fetch(`/roles/${roleId}`, {
            method: 'DELETE'
        })
        .then(response => response.json().then(data => ({status: response.status, data})))
        .then(({status, data}) => {
            const messageElement = document.getElementById('messageAlert') || createMessageElement();
            if (data.success) {
                messageElement.className = 'alert alert-success';
                messageElement.textContent = data.message || 'Role deleted successfully';
                setTimeout(() => location.reload(), 1500);
            } else {
                messageElement.className = 'alert alert-danger';
                messageElement.textContent = data.error || 'Error deleting role';
            }
            messageElement.style.display = 'block';
        })
        .catch(error => {
            const messageElement = document.getElementById('messageAlert') || createMessageElement();
            messageElement.className = 'alert alert-danger';
            messageElement.textContent = 'Error deleting role. Please try again.';
            messageElement.style.display = 'block';
        });

        // Clean up the modal
        confirmDialog.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(confirmDialog);
        });
    };
}

// Location Management
function createLocation(formData) {
    const data = {
        name: formData.get('name'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        country: formData.get('country'),
        postal_code: formData.get('postal_code')
    };

    fetch('/locations/create', {
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
            messageElement.textContent = data.message || 'Location created successfully';
            document.getElementById('locationForm').reset();
            setTimeout(() => location.reload(), 1500);
        } else {
            messageElement.className = 'alert alert-danger';
            messageElement.textContent = data.error || 'Error creating location';
        }
        messageElement.style.display = 'block';
    })
    .catch(error => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = 'Error creating location. Please try again.';
        messageElement.style.display = 'block';
    });
}

function editLocation(locationId) {
    fetch(`/locations/${locationId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editLocationId').value = locationId;
            document.getElementById('editName').value = data.name;
            document.getElementById('editAddress').value = data.address;
            document.getElementById('editCity').value = data.city;
            document.getElementById('editState').value = data.state;
            document.getElementById('editCountry').value = data.country;
            document.getElementById('editPostalCode').value = data.postal_code;

            new bootstrap.Modal(document.getElementById('editLocationModal')).show();
        });
}

function updateLocation(locationId, formData) {
    const data = {
        name: formData.get('name'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        country: formData.get('country'),
        postal_code: formData.get('postal_code')
    };

    fetch(`/locations/${locationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json().then(data => ({status: response.status, data})))
    .then(({status, data}) => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        if (data.success) {
            messageElement.className = 'alert alert-success';
            messageElement.textContent = data.message || 'Location updated successfully';
            setTimeout(() => location.reload(), 1500);
        } else {
            messageElement.className = 'alert alert-danger';
            messageElement.textContent = data.error || 'Error updating location';
        }
        messageElement.style.display = 'block';
    })
    .catch(error => {
        const messageElement = document.getElementById('messageAlert') || createMessageElement();
        messageElement.className = 'alert alert-danger';
        messageElement.textContent = 'Error updating location. Please try again.';
        messageElement.style.display = 'block';
    });
}

function deleteLocation(locationId) {
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'modal fade';
    confirmDialog.id = 'confirmDeleteModal';
    confirmDialog.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Delete</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this location?</p>
                    <p class="text-danger">This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(confirmDialog);

    const modal = new bootstrap.Modal(confirmDialog);
    modal.show();

    document.getElementById('confirmDelete').onclick = function() {
        modal.hide();
        fetch(`/locations/${locationId}`, {
            method: 'DELETE'
        })
        .then(response => response.json().then(data => ({status: response.status, data})))
        .then(({status, data}) => {
            const messageElement = document.getElementById('messageAlert') || createMessageElement();
            if (data.success) {
                messageElement.className = 'alert alert-success';
                messageElement.textContent = data.message || 'Location deleted successfully';
                setTimeout(() => location.reload(), 1500);
            } else {
                messageElement.className = 'alert alert-danger';
                messageElement.textContent = data.error || 'Error deleting location';
            }
            messageElement.style.display = 'block';
        })
        .catch(error => {
            const messageElement = document.getElementById('messageAlert') || createMessageElement();
            messageElement.className = 'alert alert-danger';
            messageElement.textContent = 'Error deleting location. Please try again.';
            messageElement.style.display = 'block';
        });

        confirmDialog.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(confirmDialog);
        });
    };
}

// Form handlers
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('userForm');
    const editUserForm = document.getElementById('editUserForm');
    const roleForm = document.getElementById('roleForm');
    const editRoleForm = document.getElementById('editRoleForm');
    const locationForm = document.getElementById('locationForm');
    const editLocationForm = document.getElementById('editLocationForm');

    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(userForm);
            createUser(formData);
        });
    }

    if (editUserForm) {
        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(editUserForm);
            const userId = document.getElementById('editUserId').value;
            updateUser(userId, formData);
        });
    }

    if (roleForm) {
        roleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(roleForm);
            createRole(formData);
        });
    }

    if (editRoleForm) {
        editRoleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(editRoleForm);
            const roleId = document.getElementById('editRoleId').value;
            updateRole(roleId, formData);
        });
    }

    if (locationForm) {
        locationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(locationForm);
            createLocation(formData);
        });
    }

    if (editLocationForm) {
        editLocationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(editLocationForm);
            const locationId = document.getElementById('editLocationId').value;
            updateLocation(locationId, formData);
        });
    }
});