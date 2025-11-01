import os
from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute, NumberAttribute, UTCDateTimeAttribute


class ProductMirrorModel(Model):
    """
    Modelo de lectura para los productos.
    """
    class Meta:
        table_name = os.getenv("DYNAMODB_MIRROR_TABLE", "ProductsMirror")
        region = os.getenv("AWS_REGION", "us-east-1")
        host = os.getenv("DYNAMODB_ENDPOINT") if os.getenv("DYNAMODB_ENDPOINT") else None
        aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID", "dummy")
        aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY", "dummy")

    # Primary Key
    sku = UnicodeAttribute(hash_key=True)

    # Atributos del producto
    provider_nit = UnicodeAttribute()
    name = UnicodeAttribute()
    product_type = UnicodeAttribute()
    stock = NumberAttribute()
    expiration_date = UnicodeAttribute()
    temperature_required = NumberAttribute()
    batch = UnicodeAttribute()
    status = UnicodeAttribute()
    unit_value = NumberAttribute()
    storage_conditions = UnicodeAttribute()
    created_at = UTCDateTimeAttribute(null=True)
    updated_at = UTCDateTimeAttribute(null=True)

    # Atributos de la bodega
    warehouse = UnicodeAttribute()
    warehouse_name = UnicodeAttribute()
    warehouse_address = UnicodeAttribute()
    warehouse_country = UnicodeAttribute()
    warehouse_city = UnicodeAttribute()

    def to_dict(self):
        return {
            "sku": self.sku,
            "provider_nit": self.provider_nit,
            "name": self.name,
            "product_type": self.product_type,
            "stock": int(self.stock),
            "expiration_date": self.expiration_date,
            "temperature_required": float(self.temperature_required),
            "batch": self.batch,
            "status": self.status,
            "unit_value": float(self.unit_value),
            "storage_conditions": self.storage_conditions,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "warehouse": self.warehouse,
            "warehouse_name": self.warehouse_name,
            "warehouse_address": self.warehouse_address,
            "warehouse_country": self.warehouse_country,
            "warehouse_city": self.warehouse_city,
        }
