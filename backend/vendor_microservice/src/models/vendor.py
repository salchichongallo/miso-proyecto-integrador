from dataclasses import dataclass, field
from typing import List
import uuid

@dataclass
class Vendor:
    """
    Modelo base para representar un vendedor en DynamoDB.
    Define solo la estructura y validaciones.
    """
    vendor_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    email: str = ""
    institutions: List[str] = field(default_factory=list)

    def validate(self):
        """Valida los datos del vendedor antes de guardarlos."""
        if not self.name or not self.email:
            raise ValueError("Los campos 'name' y 'email' son obligatorios.")
        if len(self.institutions) > 30:
            raise ValueError("No se pueden asignar más de 30 instituciones.")
