import logging
from .create_user import CreateCognitoUser
from ..errors.errors import ParamError

logger = logging.getLogger(__name__)

class CreateCognitoUserBulk:

    def __init__(self, users_payload: list):
        if not isinstance(users_payload, list):
            raise ParamError("The 'users' field must be a list.")

        self.users_payload = users_payload

    def execute(self):

        results_created = []
        results_failed = []

        for record in self.users_payload:

            email = record.get("email")
            role = record.get("role")

            if not email or not role:
                results_failed.append({
                    "email": email,
                    "role": role,
                    "reason": "Missing email or role"
                })
                continue

            try:
                created = CreateCognitoUser(email, role).execute()
                results_created.append(created)

            except Exception as err:
                logger.error(f"❌ Error creating {email}: {str(err)}")
                results_failed.append({
                    "email": email,
                    "role": role,
                    "reason": str(err)
                })

        return {
            "created": results_created,
            "failed": results_failed
        }
