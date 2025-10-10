from .base_command import BaseCommannd


class Ping(BaseCommannd):
    def execute(self):
        return 'pong'
