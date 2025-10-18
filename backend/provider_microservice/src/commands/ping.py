from .base_command import BaseCommannd


class PingCommand(BaseCommannd):
    def execute(self):
        return 'pong'
