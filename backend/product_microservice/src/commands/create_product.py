import boto3
import os
import uuid
import logging
from datetime import datetime
from decimal import Decimal
from botocore.exceptions import ClientError
from .base_command import BaseCommannd
from ..errors.errors import ParamError, ApiError

logger = logging.getLogger(__name__)

REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = "Products"
DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT")


class CreateProduct(BaseCommannd):
    """
    Crea o actualiza el stock de un producto.
    Si ya existe (mismo provider_nit + name + batch), se suma el stock.
    """

    def __init__(self, provider_nit, name, product_type, stock, expiration_date,
                 temperature_required, batch, status, unit_value, storage_conditions):
        self.provider_nit = provider_nit.strip()
        self.name = name.strip()
        self.product_type = product_type.strip()
        self.stock = int(stock)
        self.expiration_date = expiration_date
        self.temperature_required = float(temperature_required)
        self.batch = batch.strip()
        self.status = status.strip()
        self.unit_value = float(unit_value)
        self.storage_conditions = storage_conditions.strip()
        self.sku = uuid.uuid4().hex

        # 🔗 Conexión DynamoDB
        if DYNAMODB_ENDPOINT:
            self.dynamodb = boto3.resource(
                "dynamodb",
                region_name=REGION,
                endpoint_url=DYNAMODB_ENDPOINT,
                aws_access_key_id="dummy",
                aws_secret_access_key="dummy"
            )
        else:
            self.dynamodb = boto3.resource("dynamodb", region_name=REGION)

        self.table = self.dynamodb.Table(TABLE_NAME)

    # ----------------------------------------------------------
    def execute(self):
        logger.info(f"🚀 Procesando producto: {self.name}")
        self.validate()
        return self.save_or_update()

    # ----------------------------------------------------------
    def validate(self):
        """Validaciones de campos de negocio."""
        if not all([
            self.provider_nit, self.name, self.product_type, self.batch,
            self.status, self.storage_conditions
        ]):
            raise ParamError("Todos los campos obligatorios deben estar diligenciados.")

        # Fecha
        if isinstance(self.expiration_date, str):
            try:
                self.expiration_date = datetime.strptime(self.expiration_date, "%Y-%m-%d").date()
            except ValueError:
                raise ParamError("La fecha de vencimiento debe tener formato YYYY-MM-DD.")

        if self.expiration_date <= datetime.now().date():
            raise ParamError("La fecha de vencimiento debe ser posterior a la actual.")

        # Stock
        if self.stock < 1:
            raise ParamError("El stock debe ser mayor o igual a 1.")

    # ----------------------------------------------------------
    def save_or_update(self):
        """Guarda o actualiza un producto existente (sumando stock si ya existe)."""
        try:
            # Buscar si ya existe (provider_nit + name + batch)
            existing = self.table.scan(
                FilterExpression="#n = :n AND #nm = :nm AND #b = :b",
                ExpressionAttributeNames={
                    "#n": "provider_nit",
                    "#nm": "name",
                    "#b": "batch"
                },
                ExpressionAttributeValues={
                    ":n": self.provider_nit,
                    ":nm": self.name,
                    ":b": self.batch
                }
            )

            # 🔁 Si ya existe → actualiza stock
            if existing["Items"]:
                item = existing["Items"][0]
                sku_value = str(item.get("sku", "")).strip()
                if not sku_value:
                    raise ApiError("Producto existente sin SKU válido en base de datos.")

                new_stock = int(item.get("stock", 0)) + self.stock

                logger.info(f"🔁 Actualizando stock de {self.name} a {new_stock}")

                self.table.update_item(
                    Key={"sku": sku_value},
                    UpdateExpression="SET stock = :s, updated_at = :u",
                    ExpressionAttributeValues={
                        ":s": int(new_stock),
                        ":u": datetime.utcnow().isoformat()
                    }
                )
                return {"message": f"Stock actualizado a {new_stock} unidades para {self.name}."}

            # 🆕 Crear nuevo producto
            if not self.sku or not isinstance(self.sku, str):
                raise ApiError("Error interno: SKU no generado correctamente.")

            item = {
                "sku": self.sku,
                "provider_nit": self.provider_nit,
                "name": self.name,
                "product_type": self.product_type,
                "stock": int(self.stock),
                "expiration_date": self.expiration_date.isoformat(),
                "temperature_required": Decimal(str(self.temperature_required)),
                "batch": self.batch,
                "status": self.status,
                "unit_value": Decimal(str(self.unit_value)),
                "storage_conditions": self.storage_conditions,
                "created_at": datetime.utcnow().isoformat()
            }

            logger.info(f"🧾 Guardando producto en DynamoDB: {item}")

            if not isinstance(self.sku, str) or not self.sku.strip():
                raise ApiError("SKU inválido o vacío antes de guardar producto.")

            self.table.put_item(Item=item)

            logger.info(f"✅ Producto creado correctamente: {self.name}")
            return {"message": "Producto registrado exitosamente", "sku": self.sku}

        except ClientError as e:
            logger.error(f"❌ Error al crear producto: {e}")
            raise ApiError(f"Error al crear producto: {e.response['Error']['Message']}")
