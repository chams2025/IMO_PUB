"""
Create demo admin accounts for local / school testing only.
Do NOT use these credentials in production.
"""
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create demo super admin and manager accounts (local testing only)."

    DEMO_ACCOUNTS = [
        {
            "username": "superadmin",
            "email": "superadmin@saheliq.local",
            "password": "SuperAdmin123!",
            "is_staff": True,
            "is_superuser": True,
        },
        {
            "username": "manager",
            "email": "manager@saheliq.local",
            "password": "Manager123!",
            "is_staff": True,
            "is_superuser": False,
        },
    ]

    def handle(self, *args, **options):
        for acc in self.DEMO_ACCOUNTS:
            user, created = User.objects.get_or_create(
                username=acc["username"],
                defaults={
                    "email": acc["email"],
                    "is_staff": acc["is_staff"],
                    "is_superuser": acc["is_superuser"],
                    "is_active": True,
                },
            )
            user.email = acc["email"]
            user.is_staff = acc["is_staff"]
            user.is_superuser = acc["is_superuser"]
            user.is_active = True
            user.set_password(acc["password"])
            user.save()

            action = "Created" if created else "Updated"
            role = "super admin" if acc["is_superuser"] else "manager"
            self.stdout.write(
                self.style.SUCCESS(
                    f"{action} {role}: {acc['username']} / {acc['password']}"
                )
            )

        self.stdout.write(
            self.style.WARNING(
                "Demo credentials only — never deploy these defaults to production."
            )
        )
