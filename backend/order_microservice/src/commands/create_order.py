# import logging
# import datetime
# from .base_command import BaseCommannd
# from ..errors.errors import ParamError, ApiError
# from ..models.order import ProductModel

# logger = logging.getLogger(__name__)


# class CreateOrder(BaseCommannd):
#     """
#     Crea o actualiza el stock de un producto.
#     Si ya existe (mismo provider_nit + name + batch), se suma el stock.
#     """

#     def __init__(self, provider_nit, name, product_type, stock, expiration_date,
#                  temperature_required, batch, status, unit_value, storage_conditions, warehouse, sku):
        # self.provider_nit = provider_nit.strip()
        # self.name = name.strip()
        # self.product_type = product_type.strip()
        # self.stock = int(stock)
        # self.expiration_date = expiration_date
        # self.temperature_required = float(temperature_required)
        # self.batch = batch.strip()
        # self.status = status.strip()
        # self.unit_value = float(unit_value)
        # self.storage_conditions = storage_conditions.strip()
        # self.sku = sku.strip()
        # self.warehouse = warehouse.strip()

    # # ----------------------------------------------------------
    # def execute(self):
    #     logger.info(f"🚀 Procesando producto: {self.name}")
    #     self.validate()
    #     return self.save_or_update()

    # # ----------------------------------------------------------
    # def validate(self):
    #     """Validaciones de campos de negocio."""
    #     if not all([
    #         self.provider_nit, self.name, self.product_type, self.batch,
    #         self.status, self.storage_conditions
    #     ]):
    #         raise ParamError("Todos los campos obligatorios deben estar diligenciados.")

    #     # Fecha
    #     if isinstance(self.expiration_date, str):
    #         try:
    #             self.expiration_date = datetime.datetime.strptime(self.expiration_date, "%Y-%m-%d").date()
    #         except ValueError:
    #             raise ParamError("La fecha de vencimiento debe tener formato YYYY-MM-DD.")

    #     if self.expiration_date <= datetime.datetime.now().date():
    #         raise ParamError("La fecha de vencimiento debe ser posterior a la actual.")

    #     # Stock
    #     if self.stock < 1:
    #         raise ParamError("El stock debe ser mayor o igual a 1.")

    # # ----------------------------------------------------------
    # def save_or_update(self):
    #     """Guarda o actualiza un producto existente (sumando stock si ya existe)."""
    #     try:
    #         # Buscar si ya existe (provider_nit + name + batch)
    #         existing_product = ProductModel.find_existing_product(self.warehouse, self.sku)

    #         # 🔁 Si ya existe → actualiza stock
    #         if existing_product:
    #             new_stock = existing_product.stock + self.stock
    #             logger.info(f"🔁 Actualizando stock de {self.name} a {new_stock}")

    #             existing_product.update_stock(self.stock)
    #             return {"message": f"Stock actualizado a {new_stock} unidades para {self.name}."}

    #         # 🆕 Crear nuevo producto
    #         if not self.sku or not isinstance(self.sku, str):
    #             raise ApiError("Error interno: SKU no generado correctamente.")

    #         # Convertir fecha a string ISO si es necesario
    #         expiration_str = self.expiration_date.isoformat() if hasattr(self.expiration_date, 'isoformat') else str(self.expiration_date)

    #         # Crear nueva instancia del modelo
    #         product = ProductModel(
    #             warehouse=self.warehouse,
    #             sku=self.sku,
    #             provider_nit=self.provider_nit,
    #             name=self.name,
    #             product_type=self.product_type,
    #             stock=self.stock,
    #             expiration_date=expiration_str,
    #             temperature_required=self.temperature_required,
    #             batch=self.batch,
    #             status=self.status,
    #             unit_value=self.unit_value,
    #             storage_conditions=self.storage_conditions,
    #             created_at=datetime.datetime.now(datetime.timezone.utc),
    #         )

    #         logger.info(f"🧾 Guardando producto en DynamoDB: {self.name}")

    #         product.save()

    #         logger.info(f"✅ Producto creado correctamente: {self.name}")
    #         return {"message": "Producto registrado exitosamente", "sku": self.sku}

    #     except Exception as e:
    #         logger.error(f"❌ Error al crear producto: {e}")
    #         raise ApiError(f"Error al crear producto: {str(e)}")
