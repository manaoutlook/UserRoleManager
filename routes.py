from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_required, current_user
from models import db, User, Role, Permission, Location
from functools import wraps

main_bp = Blueprint('main', __name__)

def require_permission(permission_name):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.has_permission(permission_name):
                flash('Permission denied', 'error')
                return redirect(url_for('main.index'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@main_bp.route('/')
@login_required
def index():
    return render_template('dashboard.html')

# Location routes
@main_bp.route('/locations')
@login_required
@require_permission('view_locations')
def locations():
    if not current_user.has_permission('view_locations'):
        flash('Permission denied', 'error')
        return redirect(url_for('main.index'))
    locations = Location.query.all()
    return render_template('locations.html', locations=locations)

@main_bp.route('/locations/<int:location_id>')
@login_required
@require_permission('edit_locations')
def get_location(location_id):
    location = Location.query.get_or_404(location_id)
    return jsonify({
        'name': location.name,
        'address': location.address,
        'city': location.city,
        'state': location.state,
        'country': location.country,
        'postal_code': location.postal_code
    })

@main_bp.route('/locations/create', methods=['POST'])
@login_required
@require_permission('create_locations')
def create_location():
    try:
        data = request.get_json()
        if Location.query.filter_by(name=data['name']).first():
            return jsonify({'success': False, 'error': 'Location name already exists'}), 400

        location = Location(
            name=data['name'],
            address=data['address'],
            city=data['city'],
            state=data['state'],
            country=data['country'],
            postal_code=data['postal_code']
        )

        db.session.add(location)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Location created successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@main_bp.route('/locations/<int:location_id>', methods=['PUT'])
@login_required
@require_permission('edit_locations')
def update_location(location_id):
    try:
        location = Location.query.get_or_404(location_id)
        data = request.get_json()

        # Check if new location name already exists (excluding current location)
        existing_location = Location.query.filter(
            Location.name == data['name'],
            Location.id != location_id
        ).first()
        if existing_location:
            return jsonify({'success': False, 'error': 'Location name already exists'}), 400

        location.name = data['name']
        location.address = data['address']
        location.city = data['city']
        location.state = data['state']
        location.country = data['country']
        location.postal_code = data['postal_code']

        db.session.commit()
        return jsonify({'success': True, 'message': 'Location updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@main_bp.route('/locations/<int:location_id>', methods=['DELETE'])
@login_required
@require_permission('delete_locations')
def delete_location(location_id):
    try:
        location = Location.query.get_or_404(location_id)
        db.session.delete(location)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Location deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Update user routes to include location handling
@main_bp.route('/users')
@login_required
@require_permission('view_users')
def users():
    users = User.query.all()
    roles = Role.query.all()
    locations = Location.query.all()
    return render_template('users.html', users=users, roles=roles, locations=locations)

# User routes
@main_bp.route('/users/<int:user_id>')
@login_required
@require_permission('edit_users')
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'username': user.username,
        'email': user.email,
        'roles': [role.id for role in user.roles]
    })

@main_bp.route('/users/create', methods=['POST'])
@login_required
@require_permission('create_users')
def create_user():
    try:
        data = request.get_json()
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'error': 'Username already exists'}), 400
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Email already exists'}), 400

        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])

        # Add roles if provided
        if 'roles' in data:
            roles = Role.query.filter(Role.id.in_(data['roles'])).all()
            user.roles.extend(roles)

        db.session.add(user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'User created successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@main_bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
@require_permission('edit_users')
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()

        # Check if username already exists (excluding current user)
        existing_user = User.query.filter(User.username == data['username'], User.id != user_id).first()
        if existing_user:
            return jsonify({'success': False, 'error': 'Username already exists'}), 400

        # Check if email already exists (excluding current user)
        existing_user = User.query.filter(User.email == data['email'], User.id != user_id).first()
        if existing_user:
            return jsonify({'success': False, 'error': 'Email already exists'}), 400

        user.username = data['username']
        user.email = data['email']
        if 'password' in data and data['password']:
            user.set_password(data['password'])

        # Update roles if provided
        if 'roles' in data:
            user.roles = []  # Clear existing roles
            roles = Role.query.filter(Role.id.in_(data['roles'])).all()
            user.roles.extend(roles)

        db.session.commit()
        return jsonify({'success': True, 'message': 'User updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@main_bp.route('/users/<int:user_id>', methods=['DELETE'])
@login_required
@require_permission('delete_users')
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'User deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Role routes
@main_bp.route('/roles')
@login_required
@require_permission('view_roles')
def roles():
    roles = Role.query.all()
    permissions = Permission.query.all()
    return render_template('roles.html', roles=roles, permissions=permissions)

@main_bp.route('/roles/<int:role_id>')
@login_required
@require_permission('edit_roles')
def get_role(role_id):
    role = Role.query.get_or_404(role_id)
    return jsonify({
        'name': role.name,
        'description': role.description,
        'permissions': [permission.id for permission in role.permissions]
    })

@main_bp.route('/roles/create', methods=['POST'])
@login_required
@require_permission('create_roles')
def create_role():
    try:
        data = request.get_json()

        # Check if role already exists
        if Role.query.filter_by(name=data['name']).first():
            return jsonify({'success': False, 'error': 'Role name already exists'}), 400

        role = Role(name=data['name'], description=data['description'])

        # Add permissions
        if 'permissions' in data:
            permissions = Permission.query.filter(Permission.id.in_(data['permissions'])).all()
            role.permissions.extend(permissions)

        db.session.add(role)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Role created successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@main_bp.route('/roles/<int:role_id>', methods=['PUT'])
@login_required
@require_permission('edit_roles')
def update_role(role_id):
    try:
        role = Role.query.get_or_404(role_id)
        data = request.get_json()

        # Check if new role name already exists (excluding current role)
        existing_role = Role.query.filter(Role.name == data['name'], Role.id != role_id).first()
        if existing_role:
            return jsonify({'success': False, 'error': 'Role name already exists'}), 400

        role.name = data['name']
        role.description = data['description']

        # Update permissions
        if 'permissions' in data:
            role.permissions = []  # Clear existing permissions
            permissions = Permission.query.filter(Permission.id.in_(data['permissions'])).all()
            role.permissions.extend(permissions)

        db.session.commit()
        return jsonify({'success': True, 'message': 'Role updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@main_bp.route('/roles/<int:role_id>', methods=['DELETE'])
@login_required
@require_permission('delete_roles')
def delete_role(role_id):
    try:
        role = Role.query.get_or_404(role_id)
        db.session.delete(role)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Role deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Permission routes
@main_bp.route('/permissions')
@login_required
@require_permission('view_permissions')
def permissions():
    permissions = Permission.query.all()
    return render_template('permissions.html', permissions=permissions)