from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_required, current_user
from models import db, User, Role, Permission
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
    return render_template('users.html')

# User routes
@main_bp.route('/users')
@login_required
@require_permission('view_users')
def users():
    users = User.query.all()
    return render_template('users.html', users=users)

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
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    user.username = data['username']
    user.email = data['email']
    if 'password' in data:
        user.set_password(data['password'])
    db.session.commit()
    return jsonify({'success': True})

@main_bp.route('/users/<int:user_id>', methods=['DELETE'])
@login_required
@require_permission('delete_users')
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'success': True})

# Role routes
@main_bp.route('/roles')
@login_required
@require_permission('view_roles')
def roles():
    roles = Role.query.all()
    return render_template('roles.html', roles=roles)

@main_bp.route('/roles/create', methods=['POST'])
@login_required
@require_permission('create_roles')
def create_role():
    data = request.get_json()
    role = Role(name=data['name'], description=data['description'])
    db.session.add(role)
    db.session.commit()
    return jsonify({'success': True})

# Permission routes
@main_bp.route('/permissions')
@login_required
@require_permission('view_permissions')
def permissions():
    permissions = Permission.query.all()
    return render_template('permissions.html', permissions=permissions)