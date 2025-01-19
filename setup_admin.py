from app import app, db
from models import User, Role, Permission

def setup_admin():
    with app.app_context():
        # Create base permissions
        permissions = [
            ('view_users', 'Can view user list'),
            ('create_users', 'Can create new users'),
            ('edit_users', 'Can edit existing users'),
            ('delete_users', 'Can delete users'),
            ('view_roles', 'Can view role list'),
            ('create_roles', 'Can create new roles'),
            ('edit_roles', 'Can edit existing roles'),
            ('delete_roles', 'Can delete roles'),
            ('view_permissions', 'Can view permission list'),
            ('view_locations', 'Can view location list'),
            ('create_locations', 'Can create new locations'),
            ('edit_locations', 'Can edit existing locations'),
            ('delete_locations', 'Can delete locations')
        ]

        # Create all permissions if they don't exist
        for name, description in permissions:
            permission = Permission.query.filter_by(name=name).first()
            if not permission:
                permission = Permission(name=name, description=description)
                db.session.add(permission)

        db.session.commit()

        # Create or get admin role
        admin_role = Role.query.filter_by(name='admin').first()
        if not admin_role:
            admin_role = Role(name='admin', description='Administrator with full access')
            db.session.add(admin_role)
            db.session.flush()

        # Ensure admin role has all permissions
        all_permissions = Permission.query.all()
        existing_permissions = set(p.id for p in admin_role.permissions)

        for permission in all_permissions:
            if permission.id not in existing_permissions:
                admin_role.permissions.append(permission)

        # Create admin user if it doesn't exist
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            admin_user = User(username='admin', email='admin@example.com')
            admin_user.set_password('admin123')
            admin_user.roles.append(admin_role)
            db.session.add(admin_user)

        db.session.commit()
        print("Admin user and permissions have been updated successfully!")
        print("Username: admin")
        print("Password: admin123")
        print("\nAll permissions have been added to the admin role.")

if __name__ == '__main__':
    setup_admin()